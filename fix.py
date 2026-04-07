#!/usr/bin/env python3
import os, sys
def fix_file(path, replacements):
    if not os.path.exists(path):
        print(f"  ✗ No encontrado: {path}")
        return False
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new, 1)
            print(f"  ✓ Fix aplicado en {os.path.basename(path)}")
        else:
            print(f"  ⚠ Ya aplicado o no encontrado en {os.path.basename(path)}: {old[:50]}...")
    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
    return content != original
base = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
print(f"\nAplicando fixes en: {base}\n")
# ===== ejercicios-de-canto.html =====
fix_file(os.path.join(base, 'cloudflare', 'ejercicios-de-canto.html'), [
    (
        '{id:"PL4QLcc_qiWhIyWpteAoISVrQiqqSZxpMz", isPlaylist:true, title:"Cómo empezar a cantar (Playlist)", channel:"Maria Viñas"},',
        '{id:"PL4QLcc_qiWhIyWpteAoISVrQiqqSZxpMz", isPlaylist:true, thumbId:"OXbhV6pduXY", title:"Cómo empezar a cantar (Playlist)", channel:"Maria Viñas"},'
    ),
    (
        '{id:"PLpcARcDSTR0I65m602wSm-I8lD1vqjd-q", isPlaylist:true, title:"Vocal Exercises (Full Playlist)", channel:"New York Vocal Coaching"},',
        '{id:"PLpcARcDSTR0I65m602wSm-I8lD1vqjd-q", isPlaylist:true, thumbId:"UPHCf-cZ7kA", title:"Vocal Exercises (Full Playlist)", channel:"New York Vocal Coaching"},'
    ),
    (
        "  thumb.innerHTML = `<iframe src=\"${src}\" \n    frameborder=\"0\" allow=\"autoplay; encrypted-media\" allowfullscreen\n    style=\"width:100%;height:100%;position:absolute;top:0;left:0\"></iframe>`;\n  thumb.style.position = 'relative';\n  thumb.style.paddingBottom = '56.25%';\n  thumb.style.height = '0';",
        "  thumb.style.position = 'relative';\n  thumb.innerHTML = `<iframe src=\"${src}\"\n    frameborder=\"0\" allow=\"autoplay; encrypted-media; fullscreen\" allowfullscreen\n    style=\"position:absolute;top:0;left:0;width:100%;height:100%;border:none\"></iframe>`;"
    ),
])
# ===== karaoke-eventos.html =====
fix_file(os.path.join(base, 'cloudflare', 'karaoke-eventos.html'), [
    (
        '        {id:"yOAgv7vU-6Q", list:"PLOwMvBWGjS52zQ_6rSH0sGupma2-Txj0f", name:"Éxitos de Oro", desc:"Lista épica de grandes éxitos.", color:"#FFD700", textColor:"#000"}\n    ];\n\n    grid.innerHTML = videos.map(v => `',
        '        {id:"yOAgv7vU-6Q", list:"PLOwMvBWGjS52zQ_6rSH0sGupma2-Txj0f", thumbId:"yOAgv7vU-6Q", name:"Éxitos de Oro", desc:"Lista épica de grandes éxitos.", color:"#FFD700", textColor:"#000"}\n    ];\n\n    grid.innerHTML = videos.map(v => {\n        const thumbId = v.thumbId || v.id;\n        const embedSrc = v.list\n            ? `https://www.youtube.com/embed/videoseries?list=${v.list}&autoplay=1`\n            : `https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0`;\n        const ytHref = v.list\n            ? `https://www.youtube.com/playlist?list=${v.list}`\n            : `https://www.youtube.com/watch?v=${v.id}`;\n        return `'
    ),
    (
        "                 onclick=\"this.innerHTML='<iframe width=\\'100%\\' height=\\'100%\\' src=\\'https://www.youtube.com/embed/${v.list ? 'videoseries?list=' + v.list + '&autoplay=1' : v.id + '?autoplay=1'}\\' frameborder=\\'0\\' allow=\\'autoplay; encrypted-media\\' allowfullscreen></iframe>'\">",
        "                 onclick=\"(function(el){el.style.position='relative';el.innerHTML='<iframe src=\\'${embedSrc}\\' frameborder=\\'0\\' allow=\\'autoplay;encrypted-media;fullscreen\\' allowfullscreen style=\\'position:absolute;top:0;left:0;width:100%;height:100%;border:none\\'></iframe>'})(this)\">"
    ),
    (
        '                <img src="https://img.youtube.com/vi/${v.id}/mqdefault.jpg" class="karaoke-thumbnail" style="width:100%; height:100%; object-fit:cover; opacity:0.8" alt="Karaoke thumbnail">',
        '                <img src="https://img.youtube.com/vi/${thumbId}/mqdefault.jpg"\n                    class="karaoke-thumbnail" style="width:100%; height:100%; object-fit:cover; opacity:0.8"\n                    alt="${v.name}"\n                    onerror="this.src=\'https://img.youtube.com/vi/${thumbId}/default.jpg\';this.onerror=function(){this.style.display=\'none\';this.parentNode.style.background=\'#1a1a2e\'}">'
    ),
    (
        "    `).join('');",
        "    `}).join('');"
    ),
])
# ===== exitos-decada.html =====
fix_file(os.path.join(base, 'cloudflare', 'exitos-decada.html'), [
    (
        "// Detectar País por IP\nasync function detectGeo() {\n    try {\n        const res = await fetch('https://ipapi.co/json/');\n        const data = await res.json();\n        if (data.country_code) userCC = data.country_code;\n    } catch(e) { console.log(\"Geo-IP fallback to GLOBAL\"); }\n}",
        "// Detectar País por IP (con timeout de 3s)\nasync function detectGeo() {\n    try {\n        const ctrl = new AbortController();\n        setTimeout(() => ctrl.abort(), 3000);\n        const res = await fetch('https://ipapi.co/json/', { signal: ctrl.signal });\n        const data = await res.json();\n        if (data.country_code) userCC = data.country_code;\n    } catch(e) { console.log(\"Geo-IP fallback to GLOBAL\"); }\n}\n\nasync function fetchWithTimeout(url, ms = 12000) {\n    const ctrl = new AbortController();\n    const timer = setTimeout(() => ctrl.abort(), ms);\n    try {\n        const r = await fetch(url, { signal: ctrl.signal });\n        clearTimeout(timer);\n        return r;\n    } catch(e) { clearTimeout(timer); throw e; }\n}\n\nfunction renderFallbackCharts() {\n    const topES = [\n        {pos:1,title:\"Hawái\",artist:\"Maluma\",spotify_url:\"https://open.spotify.com/search/Hawai%20Maluma\"},\n        {pos:2,title:\"Pepas\",artist:\"Farruko\",spotify_url:\"https://open.spotify.com/search/Pepas%20Farruko\"},\n        {pos:3,title:\"La Bachata\",artist:\"Manuel Turizo\",spotify_url:\"https://open.spotify.com/search/La%20Bachata%20Manuel%20Turizo\"},\n        {pos:4,title:\"Quevedo: Bzrp Vol.52\",artist:\"Bizarrap\",spotify_url:\"https://open.spotify.com/search/Quevedo%20Bizarrap\"},\n        {pos:5,title:\"Flowers\",artist:\"Miley Cyrus\",spotify_url:\"https://open.spotify.com/search/Flowers%20Miley%20Cyrus\"},\n        {pos:6,title:\"As It Was\",artist:\"Harry Styles\",spotify_url:\"https://open.spotify.com/search/As%20It%20Was%20Harry%20Styles\"},\n        {pos:7,title:\"Anti-Hero\",artist:\"Taylor Swift\",spotify_url:\"https://open.spotify.com/search/Anti-Hero%20Taylor%20Swift\"},\n        {pos:8,title:\"Shakira: Bzrp Vol.53\",artist:\"Bizarrap\",spotify_url:\"https://open.spotify.com/search/Shakira%20Bizarrap\"},\n        {pos:9,title:\"Tití Me Preguntó\",artist:\"Bad Bunny\",spotify_url:\"https://open.spotify.com/search/Titi%20Me%20Pregunto%20Bad%20Bunny\"},\n        {pos:10,title:\"CALLE EN LLAMAS\",artist:\"Quevedo\",spotify_url:\"https://open.spotify.com/search/Calle%20en%20Llamas%20Quevedo\"},\n    ];\n    const topGlobal = [\n        {pos:1,title:\"Blinding Lights\",artist:\"The Weeknd\",spotify_url:\"https://open.spotify.com/search/Blinding%20Lights%20The%20Weeknd\"},\n        {pos:2,title:\"Shape of You\",artist:\"Ed Sheeran\",spotify_url:\"https://open.spotify.com/search/Shape%20of%20You%20Ed%20Sheeran\"},\n        {pos:3,title:\"Flowers\",artist:\"Miley Cyrus\",spotify_url:\"https://open.spotify.com/search/Flowers%20Miley%20Cyrus\"},\n        {pos:4,title:\"As It Was\",artist:\"Harry Styles\",spotify_url:\"https://open.spotify.com/search/As%20It%20Was%20Harry%20Styles\"},\n        {pos:5,title:\"Stay\",artist:\"The Kid LAROI\",spotify_url:\"https://open.spotify.com/search/Stay%20Kid%20Laroi\"},\n        {pos:6,title:\"Levitating\",artist:\"Dua Lipa\",spotify_url:\"https://open.spotify.com/search/Levitating%20Dua%20Lipa\"},\n        {pos:7,title:\"Bad Guy\",artist:\"Billie Eilish\",spotify_url:\"https://open.spotify.com/search/Bad%20Guy%20Billie%20Eilish\"},\n        {pos:8,title:\"Peaches\",artist:\"Justin Bieber\",spotify_url:\"https://open.spotify.com/search/Peaches%20Justin%20Bieber\"},\n        {pos:9,title:\"MONTERO\",artist:\"Lil Nas X\",spotify_url:\"https://open.spotify.com/search/MONTERO%20Lil%20Nas%20X\"},\n        {pos:10,title:\"Save Your Tears\",artist:\"The Weeknd\",spotify_url:\"https://open.spotify.com/search/Save%20Your%20Tears%20Weeknd\"},\n    ];\n    const row = t => `<div class=\"track-card\"><div style=\"font-weight:900;color:var(--m);width:25px\">${t.pos}</div><div class=\"img-container\"><span class=\"track-placeholder\">🎵</span></div><div class=\"track-info\"><div class=\"track-title\">${t.title}</div><div class=\"track-artist\">${t.artist}</div></div><div class=\"actions\"><a href=\"${t.spotify_url}\" target=\"_blank\" class=\"btn-play\">Buscar</a></div></div>`;\n    const section = (tracks, title) => `<div style=\"margin-bottom:2rem\"><h3 style=\"color:var(--p);margin-bottom:1rem;border-left:4px solid var(--p);padding-left:10px\">${title}</h3><div style=\"background:rgba(255,165,0,0.05);border:1px solid rgba(255,165,0,0.15);border-radius:10px;padding:0.6rem 1rem;margin-bottom:1rem;font-size:0.75rem;color:#9CA3AF\">⚠️ Datos de referencia — backend en pausa. <a href=\"https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M\" target=\"_blank\" style=\"color:var(--green)\">Ver en Spotify →</a></div>${tracks.map(row).join('')}</div>`;\n    return section(topES,'🇪🇸 Top España (referencia)') + section(topGlobal,'🌍 Top Global (referencia)');\n}"
    ),
    (
        "        if (target === 'top') {\n            const response = await fetch(`${BACKEND_URL}/top-charts?cc=${userCC}`);\n            const data = await response.json();",
        "        if (target === 'top') {\n            let data;\n            try {\n                const response = await fetchWithTimeout(`${BACKEND_URL}/top-charts?cc=${userCC}`, 12000);\n                if (!response.ok) throw new Error(`HTTP ${response.status}`);\n                data = await response.json();\n            } catch(e) {\n                container.innerHTML = `<h2 style=\"margin-bottom:1.5rem;font-family:'Outfit';text-align:center\">Top Charts</h2>` + renderFallbackCharts();\n                return;\n            }"
    ),
    (
        "        const response = await fetch(url);\n        const data = await response.json();",
        "        const response = await fetchWithTimeout(url, 12000);\n        if (!response.ok) throw new Error(`HTTP ${response.status}`);\n        const data = await response.json();"
    ),
    (
        '    container.innerHTML = `<div class="loading-box"><div class="spinner"></div><p>Rescatando fotos de Spotify...</p></div>`;',
        '    container.innerHTML = `<div class="loading-box"><div class="spinner"></div><p>Cargando...</p></div>`;'
    ),
])
print("\n✅ Listo. Ahora ejecuta en esta carpeta:")
print("  git add cloudflare/ejercicios-de-canto.html cloudflare/karaoke-eventos.html cloudflare/exitos-decada.html")
print("  git commit -m \"fix: video playback, karaoke embeds y España/Global fallback\"")
print("  git push origin main")
