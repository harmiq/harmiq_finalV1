// Harmiq Karaoke Backend — Cloudflare Worker
// Rutas:
//   POST /api/karaoke/process   — procesa URL de YT/Vevo o upload
//   POST /api/karaoke/separate  — separa vocal/instrumental con Demucs
//   POST /api/karaoke/transcribe — transcribe con Whisper + timestamps
//   POST /api/karaoke/analyze   — detecta coros, voces, géneros

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === '/api/karaoke/check-cache' && request.method === 'GET') {
        const hash = url.searchParams.get('hash');
        if (hash && env.KARAOKE_BUCKET) {
          const cached = await env.KARAOKE_BUCKET.head(`stems/${hash}.zip`);
          if (cached) return json({ ok: true, cached: true });
        }
        return json({ ok: true, cached: false });
      }
      if (url.pathname === '/api/karaoke/process' && request.method === 'POST') {
        return await handleProcess(request, env);
      }
      if (url.pathname === '/api/karaoke/separate' && request.method === 'POST') {
        return await handleSeparate(request, env);
      }
      if (url.pathname === '/api/karaoke/transcribe' && request.method === 'POST') {
        return await handleTranscribe(request, env);
      }
      if (url.pathname === '/api/karaoke/analyze' && request.method === 'POST') {
        return await handleAnalyze(request, env);
      }
      if (url.pathname === '/api/karaoke/lyrics' && request.method === 'POST') {
        return await handleLyrics(request, env);
      }
      return json({ error: 'Not found' }, 404);
    } catch (e) {
      return json({ error: e.message }, 500);
    }
  }
};

// ── 1. PROCESS: extrae info del video / acepta upload ──────────────────────
async function handleProcess(request, env) {
  const body = await request.json();
  const { videoUrl, uploadedAudioBase64, title } = body;

  if (videoUrl) {
    // Extraer info básica del video
    const info = await extractVideoInfo(videoUrl, env);
    return json({ ok: true, ...info });
  }

  if (uploadedAudioBase64) {
    // Audio subido directamente
    return json({ ok: true, title: title || 'Audio subido', duration: null, thumbnail: null, source: 'upload', audioBase64: uploadedAudioBase64 });
  }

  return json({ error: 'Debes pasar videoUrl o uploadedAudioBase64' }, 400);
}

async function extractVideoInfo(videoUrl, env) {
  // Detectar plataforma
  const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  const vevoMatch = videoUrl.match(/vevo\.com/);

  if (ytMatch) {
    const videoId = ytMatch[1];
    // Usar yt-dlp via Cloudflare Worker (llamada a servicio proxy)
    // Para la versión gratuita usamos oEmbed de YouTube para metadatos
    const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (!oembedRes.ok) throw new Error('No se pudo obtener info del video');
    const oembedData = await oembedRes.json();

    return {
      videoId,
      title: oembedData.title,
      author: oembedData.author_name,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      platform: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      audioExtractUrl: `https://harmiq-karaoke-audio.harmiq.workers.dev/yt/${videoId}`,
    };
  }

  if (vevoMatch) {
    return { title: 'Video de Vevo', platform: 'vevo', thumbnail: null, audioExtractUrl: videoUrl };
  }

  // URL genérica de audio/video
  return { title: 'Audio personalizado', platform: 'direct', audioExtractUrl: videoUrl };
}

// ── 2. SEPARATE: separa vocal e instrumental con Demucs en HF ──────────────
async function handleSeparate(request, env) {
  const body = await request.json();
  const { audioBase64, audioUrl, mode, hash } = body;
  // mode: 'remove_all' | 'remove_male' | 'remove_female' | 'keep_instrumental' | 'keep_vocals'

  if (hash && env.KARAOKE_BUCKET) {
    const cachedZip = await env.KARAOKE_BUCKET.get(`stems/${hash}.zip`);
    if (cachedZip) {
      const zipBase64 = bufferToBase64(await cachedZip.arrayBuffer());
      return json({ ok: true, stems: { zip: zipBase64, filenames: ['drums.wav', 'bass.wav', 'other.wav', 'vocals.wav'] }, mode, message: 'Recuperado de la caché R2 ⚡' });
    }
  }
  
  // OBLIGATORY CHECKS: Zero-cost Protection
  const MAX_GB_R2 = 8;
  const MAX_BYTES = MAX_GB_R2 * 1024 * 1024 * 1024;
  const MAX_USES_PER_DAY = 5;
  let totalBytes = 0;
  let ipUses = 0;
  let ipKey = null;

  if (env.KARAOKE_CACHE) {
    try {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const dateStr = new Date().toISOString().split('T')[0];
      ipKey = `limit_${ip}_${dateStr}`;
      
      totalBytes = parseInt((await env.KARAOKE_CACHE.get('r2_used_bytes')) || '0');
      ipUses = parseInt((await env.KARAOKE_CACHE.get(ipKey)) || '0');
      
      if (totalBytes > MAX_BYTES) {
        return json({ error: 'Límite global de almacenamiento gratuito (8GB) alcanzado en el sistema D: las nuevas separaciones están bloqueadas temporalmente.' }, 403);
      }
      
      if (ipUses >= MAX_USES_PER_DAY) {
        return json({ error: `Has superado tu límite diario (${MAX_USES_PER_DAY} pistas/día). Inténtalo mañana o usa canciones que ya estén en caché.` }, 429);
      }
    } catch(e) {}
  }

  if (!env.HF_TOKEN) return json({ error: 'HF_TOKEN no configurado' }, 500);

  // Llamar a Demucs en Hugging Face Inference API
  let audioData;
  if (audioBase64) {
    audioData = base64ToBuffer(audioBase64);
  } else if (audioUrl) {
    const res = await fetch(audioUrl);
    audioData = await res.arrayBuffer();
  } else {
    return json({ error: 'Se necesita audioBase64 o audioUrl' }, 400);
  }

  // HF Inference API — audio-source-separation
  const hfRes = await fetchWithRetry(
    'https://api-inference.huggingface.co/models/facebook/demucs',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.HF_TOKEN}`,
        'Content-Type': 'audio/wav',
      },
      body: audioData,
    },
    3, 10000
  );

  const zipBuffer = await hfRes.arrayBuffer();
  
  // Guardar en caché R2 en background sin bloquear y actualizar trackers
  if (hash && env.KARAOKE_BUCKET) {
    env.KARAOKE_BUCKET.put(`stems/${hash}.zip`, zipBuffer).catch(e => console.error("R2 Error:", e));
    if (env.KARAOKE_CACHE) {
      env.KARAOKE_CACHE.put('r2_used_bytes', (totalBytes + zipBuffer.byteLength).toString());
      if (ipKey) {
        // Expirar en 48 horas para autolimpieza 
        env.KARAOKE_CACHE.put(ipKey, (ipUses + 1).toString(), { expirationTtl: 86400 * 2 });
      }
    }
  }
  
  const zipBase64 = bufferToBase64(zipBuffer);

  return json({
    ok: true,
    stems: {
      zip: zipBase64,
      filenames: ['drums.wav', 'bass.wav', 'other.wav', 'vocals.wav']
    },
    mode,
    message: 'Separación completada con éxito.'
  });
}

// Helper para reintentos con backoff exponencial
async function fetchWithRetry(url, options, retries = 3, backoff = 2000) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);
    if (res.ok) return res;
    if (res.status === 503 && i < retries - 1) { // 503 = Loading model
      await new Promise(r => setTimeout(r, backoff * (i + 1)));
      continue;
    }
    throw new Error(`API Error ${res.status}: ${await res.text()}`);
  }
}

// ── 3. TRANSCRIBE: Whisper con timestamps para karaoke ────────────────────
async function handleTranscribe(request, env) {
  const body = await request.json();
  const { audioBase64, audioUrl, language } = body;

  if (!env.HF_TOKEN) return json({ error: 'HF_TOKEN no configurado' }, 500);

  let audioData;
  if (audioBase64) {
    audioData = base64ToBuffer(audioBase64);
  } else if (audioUrl) {
    const res = await fetch(audioUrl);
    audioData = await res.arrayBuffer();
  } else {
    return json({ error: 'Se necesita audioBase64 o audioUrl' }, 400);
  }

  // Whisper large-v3 con timestamps de palabras
  // Para obtener chunks (timestamps), debemos usar el payload JSON
  const hfRes = await fetch(
    'https://api-inference.huggingface.co/models/openai/whisper-large-v3',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.HF_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Wait-For-Model': 'true',
      },
      body: JSON.stringify({
        inputs: (audioBase64 || bufferToBase64(audioData)).replace(/^data:[^;]+;base64,/, ''),
        parameters: {
          return_timestamps: 'word',
          task: 'transcribe',
        }
      }),
    }
  );

  if (!hfRes.ok) {
    const errText = await hfRes.text();
    if (hfRes.status === 503 || errText.includes('currently loading')) {
      return json({ status: 'loading', message: 'Whisper cargando...', retryAfter: 20 });
    }
    return json({ error: `Whisper error: ${errText}` }, 500);
  }

  const result = await hfRes.json();

  // result.chunks = [{text, timestamp: [start, end]}, ...]
  const lines = buildKaraokeLines(result.chunks || []);

  return json({
    ok: true,
    fullText: result.text,
    chunks: result.chunks,
    karaokeLines: lines,
    language: result.language,
  });
}

// ── 4. ANALYZE: detecta coros, voces (hombre/mujer), estructura ───────────
async function handleAnalyze(request, env) {
  const body = await request.json();
  const { karaokeLines, fullText, title, artist } = body;

  if (!env.HF_TOKEN) return json({ error: 'HF_TOKEN no configurado' }, 500);

  // Usamos claude / llm para analizar estructura musical del texto
  // Con Cloudflare AI Workers (gratis en el plan free)
  const analysisPrompt = `Analiza esta letra de canción y devuelve JSON con:
- "structure": array de secciones [{type:"intro|verse|chorus|bridge|outro", startLine, endLine, label}]
- "voices": array de voces detectadas [{id:"v1", gender:"male|female|unknown", lines:[lineNumbers]}]
- "choruses": array de índices de líneas que son coros (repetidas)
- "language": idioma detectado
- "suggestedKaraokeMode": "full|instrumental_only|remove_male|remove_female"

Letra:
${fullText || karaokeLines?.map(l => l.text).join('\n')}

Título: ${title || 'desconocido'}
Artista: ${artist || 'desconocido'}

Responde SOLO con el JSON, sin texto adicional.`;

  // Cloudflare Workers AI — llama-3 (gratis en plan free)
  let analysis = { structure: [], voices: [], choruses: [], language: 'unknown' };
  
  try {
    const aiRes = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [{ role: 'user', content: analysisPrompt }],
      max_tokens: 1000,
    });
    
    const rawText = aiRes.response || aiRes.result?.response || '';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      analysis = JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("AI Analysis failed:", e);
    // Fallback: Heurística básica si la IA falla
    analysis.structure = [
      { type: 'verse', startLine: 0, endLine: karaokeLines.length - 1, label: 'Canción' }
    ];
  }

  // Sanitización final
  if (!analysis.structure || analysis.structure.length === 0) {
     analysis.structure = [{ type: 'verse', startLine: 0, endLine: karaokeLines.length - 1, label: 'Letra' }];
  }

  return json({ ok: true, analysis });
}

// ── 5. LYRICS: busca letra online como fallback ────────────────────────────
async function handleLyrics(request, env) {
  const body = await request.json();
  const { title, artist } = body;

  if (!title) return json({ error: 'title requerido' }, 400);

  // Genius API (gratuita con token)
  if (env.GENIUS_TOKEN) {
    const searchRes = await fetch(
      `https://api.genius.com/search?q=${encodeURIComponent(`${artist || ''} ${title}`)}`,
      { headers: { Authorization: `Bearer ${env.GENIUS_TOKEN}` } }
    );
    const searchData = await searchRes.json();
    const hit = searchData.response?.hits?.[0]?.result;
    if (hit) {
      return json({ ok: true, source: 'genius', title: hit.full_title, url: hit.url, thumbnailUrl: hit.song_art_image_thumbnail_url });
    }
  }

  return json({ ok: false, message: 'No se encontraron letras' });
}

// ── HELPERS ────────────────────────────────────────────────────────────────

function buildKaraokeLines(chunks) {
  // Agrupa palabras en líneas de ~8 palabras o por pausas largas
  const lines = [];
  let currentLine = { words: [], startTime: null, endTime: null };

  for (const chunk of chunks) {
    const [start, end] = chunk.timestamp || [0, 0];
    if (currentLine.startTime === null) currentLine.startTime = start;

    currentLine.words.push({ text: chunk.text, start, end });
    currentLine.endTime = end;

    const gapToNext = chunks[chunks.indexOf(chunk) + 1]?.timestamp?.[0];
    const longPause = gapToNext && (gapToNext - end) > 1.5;
    const lineLength = currentLine.words.length >= 8;

    if (longPause || lineLength) {
      lines.push({
        text: currentLine.words.map(w => w.text).join(''),
        words: currentLine.words,
        startTime: currentLine.startTime,
        endTime: currentLine.endTime,
        id: lines.length,
      });
      currentLine = { words: [], startTime: null, endTime: null };
    }
  }

  if (currentLine.words.length > 0) {
    lines.push({
      text: currentLine.words.map(w => w.text).join(''),
      words: currentLine.words,
      startTime: currentLine.startTime,
      endTime: currentLine.endTime,
      id: lines.length,
    });
  }

  return lines;
}

function base64ToBuffer(base64) {
  const binary = atob(base64.replace(/^data:[^;]+;base64,/, ''));
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);
  return buffer.buffer;
}

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
