/**
 * app.js — Harmiq PRODUCCIÓN v10.1 (UI Redesign & Amazon Search Shield)
 * FIX: botones género visual, auto-selección, HF_API_URL, GDPR
 * Un solo archivo. No requiere analyzer.js.
 *
 * v10.1: Rediseño del analizador de voz (grabación separada de análisis),
 * visualizador de espectro, escudo de búsqueda Amazon corregido (Micrófonos vs Monitores).
 *
 * v8.1: HealthCheck & Playlists Fix
 *
 * v5:
 * 1. Emoji duplicado en botón grabar — CORREGIDO
 * 2. Barítono clasificado como tenor — CORREGIDO (umbral 215Hz + pitch_range)
 * 3. Fotos de artistas — Wikipedia cache + avatar iniciales (sin CORS)
 * 4. YouTube embeds — IDs fijos por tipo de voz (listType=search bloqueado)
 * 5. Páginas SEO /voz/* — contenido extenso, home studio 4 packs, karaoke/eventos
 * 6. Tarjeta viral vertical — formato Stories RRSS con foto artista
 * 7. Canciones recomendadas de Spotify en resultado
 * 8. Filtros: época + género musical + idioma/país
 * 9. Sección karaoke/eventos en resultado principal
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════════════
const AMAZON_DOMAINS = { ES:"es",US:"com",MX:"com.mx",UK:"co.uk",DE:"de",FR:"fr",IT:"it",CA:"ca",BR:"com.br",JP:"co.jp" };
const AFFILIATE_ID   = "harmiqapp-20";
const HF_API_URL     = "https://hamiq-harmiq-backend1.hf.space";
const APP_VERSION    = "10.3";
const DB_PATH        = "/harmiq_db_vectores.json";

// --- SHARED UI COMPONENTS ---
function getPremiumHeaderHTML() {
    return `
    <nav style="position:sticky; top:0; z-index:1000; background:rgba(10,10,15,0.9); backdrop-filter:blur(15px); border-bottom:1px solid rgba(255,255,255,0.05)">
        <div style="max-width:1200px; margin:0 auto; display:flex; justify-content:space-between; align-items:center; padding:0.8rem 1rem">
            <a class="logo" href="/" style="font-size:1.4rem; text-decoration:none; display:flex; align-items:center; gap:0.5rem">🎙️ <span style="font-family:'Baloo 2',sans-serif; font-weight:800; color:#fff">Harmiq</span></a>
            <ul class="nav-links" style="display:flex; list-style:none; gap:0.8rem; margin:0; padding:0; align-items:center">
                <li><a href="/voz/soprano" style="color:#FF4FA3; font-weight:700; font-size:0.85rem; text-decoration:none; padding:0.4rem 0.8rem; border-radius:10px; background:rgba(255,79,163,0.1)">Soprano</a></li>
                <li><a href="/voz/mezzo-soprano" style="color:#7C4DFF; font-weight:700; font-size:0.85rem; text-decoration:none; padding:0.4rem 0.8rem; border-radius:10px; background:rgba(124,77,255,0.1)">Mezzo</a></li>
                <li><a href="/voz/tenor" style="color:#1DB954; font-weight:700; font-size:0.85rem; text-decoration:none; padding:0.4rem 0.8rem; border-radius:10px; background:rgba(29,185,84,0.1)">Tenor</a></li>
                <li><a href="/artistas/" style="color:#A5B4FC; font-weight:700; font-size:0.85rem; text-decoration:none; padding:0.4rem 0.8rem; border-radius:10px; background:rgba(124,77,255,0.1)">Artistas</a></li>
                <li><a href="/comunidad" style="color:#FF9900; font-weight:700; font-size:0.85rem; text-decoration:none; padding:0.4rem 1.2rem; border-radius:10px; background:rgba(255,153,0,0.1); border:1px solid rgba(255,153,0,0.2)">Comunidad</a></li>
            </ul>
        </div>
    </nav>
    <div style="background:linear-gradient(90deg,#7C4DFF,#FF4FA3); color:#fff; text-align:center; padding:0.4rem; font-size:0.75rem; font-weight:700; letter-spacing:0.5px">
        🏆 CONCURSO DE KARAOKE EN MADRID · PRÓXIMO VIERNES · <a href="/comunidad" style="color:#fff; text-decoration:underline">MÁS INFO</a>
    </div>`;
}

function getPremiumFooterHTML() {
    return `
    <footer style="padding:4rem 2rem; background:rgba(5,5,10,1); border-top:1px solid rgba(255,255,255,0.05); text-align:center">
        <div style="max-width:800px; margin:0 auto; margin-bottom:2.5rem; color:#6B7280; font-size:0.8rem; line-height:1.6">
            <p><strong>Aviso Legal y Transparencia:</strong> Harmiq es una plataforma de análisis vocal y recomendación. No gestionamos pagos directos; todas las transacciones de cursos (Udemy) y equipamiento (Amazon) se realizan de forma segura en sus respectivas plataformas oficiales.</p>
        </div>
        <p style="color:#9CA3AF; font-size:0.85rem">© 2026 Harmiq · Inteligencia Artificial Vocal · <a href="/politica-privacidad.html" style="color:#7C4DFF; text-decoration:none">Privacidad</a> · <a href="/terminos.html" style="color:#7C4DFF; text-decoration:none">Términos</a></p>
    </footer>`;
}

// Plataformas musicales por país (geolocalización)
const MUSIC_PLATFORM = {
  ES:"spotify", MX:"spotify", AR:"spotify", CO:"spotify", CL:"spotify",
  US:"apple",   CA:"apple",
  UK:"spotify", DE:"spotify", FR:"spotify", IT:"spotify",
  JP:"line",    KR:"melon",
  DEFAULT:"spotify"
};

// ═══════════════════════════════════════════════════════════════════════════════
// TRADUCCIONES — 11 idiomas
// ═══════════════════════════════════════════════════════════════════════════════
const T = {
  es:{
    "nav-cta":"Analizar mi voz","hero-badge":"Análisis vocal con IA · 12.000 artistas · 100% Gratis",
    "hero-grad":"cantante famoso","hero-title-rest":"vive en tu voz",
    "hero-desc":"Canta 10 segundos. La IA analiza tu tono, timbre y rango vocal y te dice con qué artista famoso coincides.",
    "btn-main":"🎤 Analizar mi voz — gratis","btn-how":"Ver cómo funciona",
    "hero-sub":"Sin registro · Sin instalar nada · Funciona en móvil",
    "stat1":"Artistas de todo el mundo","stat2":"Idiomas","stat3":"Para tu resultado","stat4":"Gratis siempre",
    "app-title":"Analiza tu voz","app-desc":"Selecciona tu voz, sube un audio o graba directamente",
    "opt-default":"Selecciona tu voz","opt-male":"Voz masculina","opt-female":"Voz femenina",
    "btn-record-text":"Pulsar para Grabar Voice",
    "how-title":"Cómo funciona","how-sub":"Tres pasos. Sin registro. Sin instalar nada.",
    "step1-t":"1. Canta unos segundos","step1-d":"Sube un audio o usa el micrófono. Solo necesitas 5-10 segundos.",
    "step2-t":"2. La IA analiza tu voz","step2-d":"Detectamos tu frecuencia fundamental, timbre y rango vocal.",
    "step3-t":"3. Descubre tu cantante","step3-d":"Te decimos qué artista famoso coincide contigo, con % de similitud.",
    "voices-title":"Descubre tu tipo de voz","voices-sub":"Cada tipo de voz tiene sus canciones y artistas ideales.",
    "feat-title":"Todo lo que incluye Harmiq","feat-sub":"Mucho más que un simple test de voz.",
    "f1-t":"12.000 artistas globales","f1-d":"De US, UK, Japón, Corea, Brasil, España, Italia, Francia y más.",
    "f2-t":"Canciones para tu voz","f2-d":"Canciones adaptadas a tu rango vocal exacto y géneros favoritos.",
    "f3-t":"Artistas por país","f3-d":"Filtra por región y descubre artistas locales que coinciden contigo.",
    "f4-t":"Comparte tu resultado","f4-d":"Comparte en WhatsApp, Twitter, LINE, VK o Weibo.",
    "f5-t":"Busca tu artista favorito","f5-d":"Compara tu voz con cualquier artista de nuestra base de datos.",
    "f6-t":"Privacidad garantizada","f6-d":"Tu audio se analiza y se borra inmediatamente.",
    "cta-title":"Descubre tu tipo de voz ahora","cta-desc":"Análisis gratuito en 10 segundos. 12.000 artistas.",
    "cta-btn":"🎤 Analizar mi voz gratis",
    "_upload_btn":"📁 Subir audio","_upload_hint":"WAV · MP3 · M4A · OGG · FLAC · mín. 5 seg",
    "_or":"— o —","_analyzing":"🔍 Analizando tu voz…","_rec_stop":"⏹ Detener",
    "_result":"Tu resultado","_similarity":"similitud","_vt_label":"Tu tipo de voz","_confidence":"confianza",
    "_share":"📲 Comparte tu resultado","_copy":"📋 Copiar",
    "_share_txt":"🎤 Mi voz se parece a {name} con {pct}% de similitud. ¡Analiza la tuya en harmiq.app!",
    "_err_short":"Audio demasiado corto. Canta al menos 3 segundos.",
    "_err_silent":"Señal muy baja. Acerca el micrófono y canta más fuerte.",
    "_err_mic":"No se pudo acceder al micrófono. Comprueba los permisos.",
    "_err_gender":"Selecciona primero tu tipo de voz (masculina o femenina).",
    "_err_db":"Base de datos no disponible. Recarga la página.",
    "_filter_era":"Época","_all_eras":"Todas las épocas",
    "_eras":{"pre-1960s":"Clásicos pre-60","1960s":"Los 60","1970s":"Los 70","1980s":"Los 80","1990s":"Los 90","2000s":"Años 2000","2010s":"Años 2010","2020s":"Años 2020","2026":"Éxitos 2026"},
    "_karaoke":"🎤 Karaoke","_platform":"🎵 Escuchar","_rec_tips":"Para mejor resultado: canta sin música · acerca el micro · evita el eco",
    "_vt_names":{"bass":"Bajo","bass-baritone":"Bajo-Barítono","baritone":"Barítono","tenor":"Tenor","countertenor":"Contratenor","contralto":"Contralto","mezzo-soprano":"Mezzosoprano","soprano":"Soprano"},
    "_udemy_cta":"🎓 Mejora tu voz con expertos en Udemy",
  },
  en:{
    "nav-cta":"Analyze my voice","hero-badge":"AI Vocal Analysis · 12,000 artists · 100% Free",
    "hero-grad":"famous singer","hero-title-rest":"lives in your voice",
    "hero-desc":"Sing 10 seconds. The AI analyzes your tone, timbre and vocal range and tells you which famous artist you match.",
    "btn-main":"🎤 Analyze my voice — free","btn-how":"See how it works",
    "hero-sub":"No sign-up · No install · Works on mobile",
    "stat1":"Artists worldwide","stat2":"Languages","stat3":"For your result","stat4":"Always free",
    "app-title":"Analyze your voice","app-desc":"Select your voice type, upload audio or record directly",
    "opt-default":"Select your voice","opt-male":"Male voice","opt-female":"Female voice",
    "btn-record-text":"Tap to Record Voice",
    "how-title":"How it works","how-sub":"Three steps. No sign-up. No install.",
    "step1-t":"1. Sing a few seconds","step1-d":"Upload audio or use your mic. Just 5-10 seconds.",
    "step2-t":"2. AI analyzes your voice","step2-d":"We detect your fundamental frequency, timbre and vocal range.",
    "step3-t":"3. Discover your singer","step3-d":"We tell you which famous artist matches your voice, with % similarity.",
    "voices-title":"Discover your voice type","voices-sub":"Each voice type has its ideal songs and artists.",
    "feat-title":"Everything Harmiq includes","feat-sub":"Much more than a simple voice test.",
    "f1-t":"12,000 global artists","f1-d":"From US, UK, Japan, Korea, Brazil, Spain, Italy and more.",
    "f2-t":"Songs for your voice","f2-d":"Songs adapted to your exact vocal range and favourite genres.",
    "f3-t":"Artists by country","f3-d":"Filter by region and discover local artists that match you.",
    "f4-t":"Share your result","f4-d":"Share on WhatsApp, Twitter, LINE, VK or Weibo.",
    "f5-t":"Search your favourite artist","f5-d":"Compare your voice with any artist in our database.",
    "f6-t":"Privacy guaranteed","f6-d":"Your audio is analyzed and deleted immediately.",
    "cta-title":"Discover your voice type now","cta-desc":"Free analysis in 10 seconds. 12,000 artists.",
    "cta-btn":"🎤 Analyze my voice free",
    "_upload_btn":"📁 Upload audio","_upload_hint":"WAV · MP3 · M4A · OGG · FLAC · min. 5 sec",
    "_or":"— or —","_analyzing":"🔍 Analyzing your voice…","_rec_stop":"⏹ Stop",
    "_result":"Your result","_similarity":"similarity","_vt_label":"Your voice type","_confidence":"confidence",
    "_share":"📲 Share your result","_copy":"📋 Copy",
    "_share_txt":"🎤 My voice sounds like {name} with {pct}% similarity. Try yours at harmiq.app!",
    "_err_short":"Audio too short. Sing at least 3 seconds.",
    "_err_silent":"Signal too low. Get closer to the mic and sing louder.",
    "_err_mic":"Could not access microphone. Check permissions.",
    "_err_gender":"Select your voice type first (male or female).",
    "_err_db":"Database not available. Reload the page.",
    "_filter_era":"Era","_all_eras":"All eras",
    "_eras":{"pre-1960s":"Pre-60s classics","1960s":"The 60s","1970s":"The 70s","1980s":"The 80s","1990s":"The 90s","2000s":"2000s","2010s":"2010s","2020s":"2020s","2026":"Hits 2026"},
    "_karaoke":"🎤 Karaoke","_platform":"🎵 Listen","_rec_tips":"For best results: sing without background music · get close to the mic · avoid echo",
    "_vt_names":{"bass":"Bass","bass-baritone":"Bass-Baritone","baritone":"Baritone","tenor":"Tenor","countertenor":"Countertenor","contralto":"Contralto","mezzo-soprano":"Mezzo-soprano","soprano":"Soprano"},
  },
  ca:{
    "nav-cta":"Analitza la teva veu","hero-badge":"Anàlisi vocal amb IA · 12.000 artistes · 100% Gratis",
    "hero-grad":"cantant famós","hero-title-rest":"viu a la teva veu",
    "hero-desc":"Canta 10 segons. La IA analitza el teu to, timbre i rang vocal i et diu amb quin artista famós coincideixes.",
    "btn-main":"🎤 Analitza la teva veu — gratis","btn-how":"Veure com funciona",
    "hero-sub":"Sense registre · Sense instal·lar res · Funciona al mòbil",
    "stat1":"Artistes de tot el món","stat2":"Idiomes","stat3":"Per al teu resultat","stat4":"Sempre gratis",
    "app-title":"Analitza la teva veu","app-desc":"Selecciona el teu tipus de veu, puja un àudio o grava directament",
    "opt-default":"Selecciona el teu tipus de veu","opt-male":"Veu masculina","opt-female":"Veu femenina",
    "btn-record-text":"Prem per Gravar Voice",
    "how-title":"Com funciona","how-sub":"Tres passos. Sense registre. Sense instal·lar res.",
    "step1-t":"1. Canta uns segons","step1-d":"Puja un àudio o usa el micròfon. Només necessites 5-10 segons.",
    "step2-t":"2. La IA analitza la teva veu","step2-d":"Detectem la teva freqüència fonamental, timbre i rang vocal.",
    "step3-t":"3. Descobreix el teu cantant","step3-d":"Et diem quin artista famós coincideix amb la teva veu, amb % de similitud.",
    "voices-title":"Descobreix el teu tipus de veu","voices-sub":"Cada tipus de veu té les seves cançons i artistes ideals.",
    "feat-title":"Tot el que inclou Harmiq","feat-sub":"Molt més que un simple test de veu.",
    "f1-t":"12.000 artistes globals","f1-d":"De tot el món: pop, rock, flamenco, jazz, k-pop i molt més.",
    "f2-t":"Cançons per a la teva veu","f2-d":"Cançons adaptades al teu rang vocal exacte i gèneres favorits.",
    "f3-t":"Artistes per país","f3-d":"Filtra per regió i descobreix artistes locals que coincideixen amb tu.",
    "f4-t":"Comparteix el resultat","f4-d":"Comparteix a WhatsApp, Twitter, LINE, VK o Weibo.",
    "f5-t":"Cerca el teu artista favorit","f5-d":"Compara la teva veu amb qualsevol artista de nostra base de dades.",
    "f6-t":"Privacitat garantida","f6-d":"El teu àudio s'analitza i s'esborra immediatament. No guardem cap gravació.",
    "cta-title":"Descobreix el teu tipus de veu ara","cta-desc":"Anàlisi gratuïta en 10 segons. 12.000 artistes de tot el món.","cta-btn":"🎤 Analitza la teva veu gratis",
    "_upload_btn":"📁 Pujar àudio","_upload_hint":"WAV · MP3 · M4A · OGG · FLAC · mín. 5 seg",
    "_or":"— o —","_analyzing":"🔍 Analitzant…","_rec_stop":"⏹ Aturar",
    "_result":"El teu resultat","_similarity":"similitud","_vt_label":"El teu tipus de veu","_confidence":"confiança",
    "_share":"📲 Comparteix","_copy":"📋 Copiar",
    "_share_txt":"🎤 La meva veu s'assembla a {name} amb {pct}% de similitud. harmiq.app",
    "_err_short":"Àudio massa curt.","_err_silent":"Senyal molt baixa.","_err_mic":"No s'ha pogut accedir al micròfon.",
    "_err_gender":"Selecciona primer el teu tipus de veu.","_err_db":"Base de dades no disponible.",
    "_filter_era":"Època","_all_eras":"Totes les èpoques",
    "_eras":{"pre-1960s":"Clàssics pre-60","1960s":"Els 60","1970s":"Els 70","1980s":"Els 80","1990s":"Els 90","2000s":"Anys 2000","2010s":"Anys 2010","2020s":"Anys 2020","2026":"Èxitos 2026"},
    "_karaoke":"🎤 Karaoke","_platform":"🎵 Escoltar","_rec_tips":"Per millors resultats: canta sense música · apropa't al micro",
    "_vt_names":{"bass":"Baix","bass-baritone":"Baix-Baríton","baritone":"Baríton","tenor":"Tenor","countertenor":"Contratenor","contralto":"Contralt","mezzo-soprano":"Mezzosoprano","soprano":"Soprano"},
  },
  fr:{
    "nav-cta":"Analyser ma voix","hero-badge":"Analyse vocale IA · 12 000 artistes · 100% Gratuit",
    "hero-grad":"chanteur célèbre","hero-title-rest":"vit dans ta voix",
    "hero-desc":"Chante 10 secondes. L'IA analyse ton ton, timbre et tessiture.",
    "btn-main":"🎤 Analyser ma voix — gratuit","btn-how":"Voir comment ça marche","hero-sub":"Sans inscription · Sans installation",
    "stat1":"Artistes du monde","stat2":"Langues","stat3":"Pour ton résultat","stat4":"Toujours gratuit",
    "app-title":"Analyse ta voix","app-desc":"Sélectionne ta voix, télécharge ou enregistre",
    "opt-default":"Sélectionne ta voix","opt-male":"Voix masculine","opt-female":"Voix féminine",    "btn-record-text":"Appuyer pour Enregistrer Voice",
    "how-title":"Comment ça marche","how-sub":"Trois étapes. Sans inscription.",
    "step1-t":"1. Chante quelques secondes","step1-d":"Télécharge ou utilise le micro. 5-10 secondes suffisent.",
    "step2-t":"2. L'IA analyse ta voix","step2-d":"On détecte ta fréquence, timbre et tessiture.",
    "step3-t":"3. Découvre ton chanteur","step3-d":"On te dit quel artiste célèbre te ressemble.",
    "voices-title":"Découvre ton type de voix","voices-sub":"Chaque voix a ses artistes idéaux.",
    "feat-title":"Tout ce qu'inclut Harmiq","feat-sub":"Bien plus qu'un test vocal.",
    "f1-t":"12 000 artistes","f1-d":"Du monde entier.","f2-t":"Chansons pour ta voix","f2-d":"Adaptées à ta tessiture.",
    "f3-t":"Artistes par pays","f3-d":"Filtre par région.","f4-t":"Partage ton résultat","f4-d":"Sur WhatsApp, Twitter...",
    "f5-t":"Cherche ton artiste","f5-d":"Compare ta voix.","f6-t":"Confidentialité","f6-d":"Audio supprimé immédiatement.",
    "cta-title":"Découvre ton type de voix maintenant","cta-desc":"Analyse gratuite en 10 secondes.","cta-btn":"🎤 Analyser gratuit",
    "_upload_btn":"📁 Télécharger audio","_upload_hint":"WAV · MP3 · M4A · min. 5 sec",
    "_or":"— ou —","_analyzing":"🔍 Analyse…","_rec_stop":"⏹ Arrêter",
    "_result":"Ton résultat","_similarity":"similarité","_vt_label":"Ton type de voix","_confidence":"confiance",
    "_share":"📲 Partager","_copy":"📋 Copier",
    "_share_txt":"🎤 Ma voix ressemble à {name} avec {pct}% de similarité. harmiq.app",
    "_err_short":"Audio trop court.","_err_silent":"Signal trop faible.","_err_mic":"Impossible d'accéder au micro.",
    "_err_gender":"Sélectionne d'abord ton type de voix.","_err_db":"Base de données indisponible.",
    "_filter_era":"Époque","_all_eras":"Toutes les époques",
    "_eras":{"pre-1960s":"Avant les 60s","1960s":"Les 60s","1970s-80s":"70s – 80s","1990s":"Les 90s","2000s+":"Années 2000","2010s+":"Années 2010+"},
    "_karaoke":"🎤 Karaoké","_platform":"🎵 Écouter","_rec_tips":"Pour de meilleurs résultats: sans musique · proche du micro",
    "_vt_names":{"bass":"Basse","bass-baritone":"Basse-Baryton","baritone":"Baryton","tenor":"Ténor","countertenor":"Contre-ténor","contralto":"Contralto","mezzo-soprano":"Mezzo-soprano","soprano":"Soprano"},
  },
  de:{
    "nav-cta":"Stimme analysieren","hero-badge":"KI-Stimmanalyse · 12.000 Künstler · 100% Kostenlos",
    "hero-grad":"berühmter Sänger","hero-title-rest":"lebt in deiner Stimme",
    "hero-desc":"Singe 10 Sekunden. Die KI analysiert Ton, Timbre und Stimmumfang.",
    "btn-main":"🎤 Stimme analysieren — kostenlos","btn-how":"Wie es funktioniert","hero-sub":"Keine Anmeldung · Keine Installation",
    "stat1":"Weltweite Künstler","stat2":"Sprachen","stat3":"Bis zum Ergebnis","stat4":"Immer kostenlos",
    "app-title":"Analysiere deine Stimme","app-desc":"Wähle deinen Stimmtyp, lade hoch oder nimm auf",
    "opt-default":"Wähle deine Stimme","opt-male":"Männerstimme","opt-female":"Frauenstimme",    "btn-record-text":"Zum Aufnehmen Tippen Voice",
    "how-title":"Wie es funktioniert","how-sub":"Drei Schritte. Keine Anmeldung.",
    "step1-t":"1. Singe ein paar Sekunden","step1-d":"Lade hoch oder nutze das Mikrofon.","step2-t":"2. KI analysiert deine Stimme","step2-d":"Wir erkennen Grundfrequenz, Timbre und Stimmumfang.",
    "step3-t":"3. Entdecke deinen Sänger","step3-d":"Wir sagen dir, welcher Künstler deiner Stimme am ähnlichsten ist.",
    "voices-title":"Entdecke deinen Stimmtyp","voices-sub":"Jeder Stimmtyp hat seine idealen Songs.",
    "feat-title":"Alles in Harmiq","feat-sub":"Viel mehr als ein Stimmtest.",
    "f1-t":"12.000 globale Künstler","f1-d":"Aus aller Welt.","f2-t":"Songs für deine Stimme","f2-d":"Angepasst an deinen Stimmumfang.",
    "f3-t":"Künstler nach Land","f3-d":"Filtre nach Region.","f4-t":"Ergebnis teilen","f4-d":"Auf WhatsApp, Twitter...",
    "f5-t":"Lieblungskünstler suchen","f5-d":"Vergleiche deine Stimme.","f6-t":"Datenschutz","f6-d":"Audio sofort gelöscht.",
    "cta-title":"Entdecke jetzt deinen Stimmtyp","cta-desc":"Kostenlose Analyse in 10 Sekunden.","cta-btn":"🎤 Stimme kostenlos analysieren",
    "_upload_btn":"📁 Audio hochladen","_upload_hint":"WAV · MP3 · M4A · min. 5 Sek.",
    "_or":"— oder —","_analyzing":"🔍 Analysiere…","_rec_stop":"⏹ Aufnahme stoppen",
    "_result":"Dein Ergebnis","_similarity":"Ähnlichkeit","_vt_label":"Dein Stimmtyp","_confidence":"Vertrauen",
    "_share":"📲 Teilen","_copy":"📋 Kopieren",
    "_share_txt":"🎤 Meine Stimme klingt wie {name} mit {pct}% Ähnlichkeit. harmiq.app",
    "_err_short":"Audio zu kurz.","_err_silent":"Signal zu schwach.","_err_mic":"Kein Mikrofonzugriff.",
    "_err_gender":"Wähle zuerst deinen Stimmtyp.","_err_db":"Datenbank nicht verfügbar.",
    "_filter_era":"Jahrzehnt","_all_eras":"Alle Jahrzehnte",
    "_eras":{"pre-1960s":"Vor den 60ern","1960s":"Die 60er","1970s-80s":"70er – 80er","1990s":"Die 90er","2000s+":"2000er","2010s+":"2010er+"},
    "_karaoke":"🎤 Karaoke","_platform":"🎵 Anhören","_rec_tips":"Für beste Ergebnisse: ohne Hintergrundmusik · nah am Mikrofon",
    "_vt_names":{"bass":"Bass","bass-baritone":"Bass-Bariton","baritone":"Bariton","tenor":"Tenor","countertenor":"Kontratenor","contralto":"Kontralto","mezzo-soprano":"Mezzosopran","soprano":"Sopran"},
  },
  it:{
    "nav-cta":"Analizza la mia voce","hero-badge":"Analisi vocale IA · 12.000 artisti · 100% Gratis",
    "hero-grad":"cantante famoso","hero-title-rest":"vive nella tua voce",
    "hero-desc":"Canta 10 secondi. L'IA analizza il tuo tono, timbro e estensione vocale.",
    "btn-main":"🎤 Analizza la mia voce — gratis","btn-how":"Vedi come funziona","hero-sub":"Senza registrazione · Senza installare nulla",
    "stat1":"Artisti nel mondo","stat2":"Lingue","stat3":"Per il tuo risultato","stat4":"Sempre gratis",
    "app-title":"Analizza la tua voce","app-desc":"Seleziona la tua voce, carica o registra",
    "opt-default":"Seleziona la tua voce","opt-male":"Voce maschile","opt-female":"Voce femminile",    "btn-record-text":"Tocca per Registrare Voice",
    "how-title":"Come funziona","how-sub":"Tre passi. Senza registrazione.",
    "step1-t":"1. Canta qualche secondo","step1-d":"Carica o usa il microfono.","step2-t":"2. L'IA analizza la voce","step2-d":"Rileviamo frequenza, timbro ed estensione.",
    "step3-t":"3. Scopri il tuo cantante","step3-d":"Ti diciamo quale artista ti assomiglia.",
    "voices-title":"Scopri il tuo tipo di voce","voices-sub":"Ogni voce ha i suoi artisti ideali.",
    "feat-title":"Tutto Harmiq","feat-sub":"Molto più di un test vocale.",
    "f1-t":"12.000 artisti","f1-d":"Da tutto il mondo.","f2-t":"Canzoni per la tua voce","f2-d":"Adattate alla tua estensione.",
    "f3-t":"Artisti per paese","f3-d":"Filtra per regione.","f4-t":"Condividi il risultato","f4-d":"Su WhatsApp, Twitter...",
    "f5-t":"Cerca artista","f5-d":"Confronta la tua voce.","f6-t":"Privacy","f6-d":"Audio eliminato subito.",
    "cta-title":"Scopri il tuo tipo di voce","cta-desc":"Analisi gratuita in 10 secondi.","cta-btn":"🎤 Analizza gratis",
    "_upload_btn":"📁 Carica audio","_upload_hint":"WAV · MP3 · M4A · min. 5 sec",
    "_or":"— oppure —","_analyzing":"🔍 Analisi…","_rec_stop":"⏹ Ferma",
    "_result":"Il tuo risultato","_similarity":"somiglianza","_vt_label":"Il tuo tipo di voce","_confidence":"confidenza",
    "_share":"📲 Condividi","_copy":"📋 Copia",
    "_share_txt":"🎤 La mia voce somiglia a {name} con {pct}% di somiglianza. harmiq.app",
    "_err_short":"Audio troppo corto.","_err_silent":"Segnale troppo debole.","_err_mic":"Impossibile accedere al microfono.",
    "_err_gender":"Seleziona prima il tuo tipo di voce.","_err_db":"Database non disponibile.",
    "_filter_era":"Decennio","_all_eras":"Tutti i decenni",
    "_eras":{"pre-1960s":"Prima degli anni 60","1960s":"Anni 60","1970s-80s":"70s – 80s","1990s":"Anni 90","2000s+":"Anni 2000","2010s+":"Anni 2010+"},
    "_karaoke":"🎤 Karaoke","_platform":"🎵 Ascolta","_rec_tips":"Per risultati migliori: senza musica di fondo · vicino al microfono",
    "_vt_names":{"bass":"Basso","bass-baritone":"Basso-Baritono","baritone":"Baritono","tenor":"Tenore","countertenor":"Controtenore","contralto":"Contralto","mezzo-soprano":"Mezzosoprano","soprano":"Soprano"},
  },
  pt:{
    "nav-cta":"Analisar minha voz","hero-badge":"Análise vocal com IA · 12.000 artistas · 100% Grátis",
    "hero-grad":"cantor famoso","hero-title-rest":"vive na sua voz",
    "hero-desc":"Cante 10 segundos. A IA analisa seu tom, timbre e alcance vocal.",
    "btn-main":"🎤 Analisar minha voz — grátis","btn-how":"Ver como funciona","hero-sub":"Sem cadastro · Sem instalar · No celular",
    "stat1":"Artistas do mundo","stat2":"Idiomas","stat3":"Para seu resultado","stat4":"Sempre grátis",
    "app-title":"Analise sua voz","app-desc":"Selecione sua voz, envie áudio ou grave diretamente",
    "opt-default":"Selecione sua voz","opt-male":"Voz masculina","opt-female":"Voz feminina","btn-record-text":"Toque para Gravar Voice",
    "how-title":"Como funciona","how-sub":"Três passos. Sem cadastro.",
    "step1-t":"1. Cante alguns segundos","step1-d":"Envie áudio ou use o microfone.","step2-t":"2. A IA analisa sua voz","step2-d":"Detectamos frequência, timbre e alcance.",
    "step3-t":"3. Descubra seu cantor","step3-d":"Dizemos qual artista combina com você.",
    "voices-title":"Descubra seu tipo de voz","voices-sub":"Cada voz tem seus artistas ideais.",
    "feat-title":"Tudo do Harmiq","feat-sub":"Muito mais que um teste vocal.",
    "f1-t":"12.000 artistas","f1-d":"Do mundo todo.","f2-t":"Músicas para sua voz","f2-d":"Adaptadas ao seu alcance.",
    "f3-t":"Artistas por país","f3-d":"Filtre por região.","f4-t":"Compartilhe resultado","f4-d":"No WhatsApp, Twitter...",
    "f5-t":"Busque artista","f5-d":"Compare sua voz.","f6-t":"Privacidade","f6-d":"Áudio deletado imediatamente.",
    "cta-title":"Descubra seu tipo de voz agora","cta-desc":"Análise gratuita em 10 segundos.","cta-btn":"🎤 Analisar grátis",
    "_upload_btn":"📁 Enviar áudio","_upload_hint":"WAV · MP3 · M4A · mín. 5 seg",
    "_or":"— ou —","_analyzing":"🔍 Analisando…","_rec_stop":"⏹ Parar",
    "_result":"Seu resultado","_similarity":"similaridade","_vt_label":"Seu tipo de voz","_confidence":"confiança",
    "_share":"📲 Compartilhar","_copy":"📋 Copiar",
    "_share_txt":"🎤 Minha voz parece com {name} com {pct}% de similaridade. harmiq.app",
    "_err_short":"Áudio muito curto.","_err_silent":"Sinal muito fraco.","_err_mic":"Sem acesso ao microfone.",
    "_err_gender":"Selecione seu tipo de voz primeiro.","_err_db":"Banco de dados indisponível.",
    "_filter_era":"Época","_all_eras":"Todas as épocas",
    "_eras":{"pre-1960s":"Antes dos 60","1960s":"Anos 60","1970s-80s":"70s – 80s","1990s":"Anos 90","2000s+":"Anos 2000","2010s+":"Anos 2010+"},
    "_karaoke":"🎤 Karaoke","_platform":"🎵 Ouvir","_rec_tips":"Para melhores resultados: sem música de fundo · perto do microfone",
    "_vt_names":{"bass":"Baixo","bass-baritone":"Baixo-Barítono","baritone":"Barítono","tenor":"Tenor","countertenor":"Contratenor","contralto":"Contralto","mezzo-soprano":"Mezzossoprano","soprano":"Soprano"},
  },
  ja:{
    "nav-cta":"声を分析する","hero-badge":"AI音声分析 · 12,000アーティスト · 完全無料",
    "hero-grad":"有名アーティスト","hero-title-rest":"があなたの声に宿る",
    "hero-desc":"10秒歌うだけ。AIがあなたの音域、音色、声域を分析します。",
    "btn-main":"🎤 声を分析する — 無料","btn-how":"使い方を見る","hero-sub":"登録不要 · インストール不要 · スマホ対応",
    "stat1":"世界のアーティスト","stat2":"言語","stat3":"結果まで","stat4":"常に無料",
    "app-title":"声を分析する","app-desc":"声域を選択し音声をアップロードか録音",
    "opt-default":"声域を選択","opt-male":"男声","opt-female":"女声",    "btn-record-text":"タップして録音 Voice",
    "how-title":"使い方","how-sub":"3ステップ。登録不要。","step1-t":"1. 数秒歌う","step1-d":"音声ファイルをアップロードするかマイクを使用。",
    "step2-t":"2. AIが声を分析","step2-d":"基本周波数、音色、声域を検出します。","step3-t":"3. アーティストを発見","step3-d":"最も声が似ている有名アーティストを表示します。",
    "voices-title":"声域タイプを発見","voices-sub":"声域タイプによって理想の曲が異なります。",
    "feat-title":"Harmiqの全機能","feat-sub":"単純な声テスト以上のもの。",
    "f1-t":"12,000アーティスト","f1-d":"世界中から。","f2-t":"あなたの声に合う曲","f2-d":"音域に適した曲。",
    "f3-t":"国別アーティスト","f3-d":"地域でフィルタリング。","f4-t":"結果をシェア","f4-d":"LINEやTwitterでシェア。",
    "f5-t":"アーティストを検索","f5-d":"任意のアーティストと比較。","f6-t":"プライバシー保護","f6-d":"音声はすぐに削除。",
    "cta-title":"今すぐ声域を発見","cta-desc":"10秒で無料分析。","cta-btn":"🎤 無料で声を分析",
    "_upload_btn":"📁 音声をアップロード","_upload_hint":"WAV · MP3 · M4A · 最低5秒",
    "_or":"— または —","_analyzing":"🔍 分析中…","_rec_stop":"⏹ 録音停止",
    "_result":"あなたの結果","_similarity":"類似度","_vt_label":"あなたの声域","_confidence":"信頼度",
    "_share":"📲 シェア","_copy":"📋 コピー",
    "_share_txt":"🎤 私の声は{name}に{pct}%類似しています。harmiq.app",
    "_err_short":"音声が短すぎます。","_err_silent":"信号が低すぎます。","_err_mic":"マイクにアクセスできません。",
    "_err_gender":"まず声域タイプを選択してください。","_err_db":"データベースが見つかりません。",
    "_filter_era":"年代","_all_eras":"すべての年代",
    "_eras":{"pre-1960s":"60年代以前","1960s":"60年代","1970s-80s":"70–80年代","1990s":"90年代","2000s+":"2000年代","2010s+":"2010年代+"},
    "_karaoke":"🎤 カラオケ","_platform":"🎵 聴く","_rec_tips":"最良の結果のため: BGMなし · マイクに近づく · エコーを避ける",
    "_vt_names":{"bass":"バス","bass-baritone":"バス・バリトン","baritone":"バリトン","tenor":"テノール","countertenor":"カウンターテナー","contralto":"コントラルト","mezzo-soprano":"メゾソプラノ","soprano":"ソプラノ"},
  },
  ru:{
    "nav-cta":"Анализировать голос","hero-badge":"ИИ-анализ голоса · 12 000 артистов · Бесплатно",
    "hero-grad":"известный певец","hero-title-rest":"живёт в твоём голосе",
    "hero-desc":"Пой 10 секунд. ИИ анализирует тон, тембр и диапазон.",
    "btn-main":"🎤 Анализировать — бесплатно","btn-how":"Как это работает","hero-sub":"Без регистрации · Без установки",
    "stat1":"Артистов со всего мира","stat2":"Языков","stat3":"До результата","stat4":"Всегда бесплатно",
    "app-title":"Анализируй голос","app-desc":"Выбери тип голоса, загрузи или записывай",
    "opt-default":"Выбери свой голос","opt-male":"Мужской голос","opt-female":"Женский голос",    "btn-record-text":"Нажмите для записи Voice",
    "how-title":"Как это работает","how-sub":"Три шага. Без регистрации.",
    "step1-t":"1. Пой несколько секунд","step1-d":"Загрузи или используй микрофон.","step2-t":"2. ИИ анализирует","step2-d":"Определяем частоту, тембр и диапазон.",
    "step3-t":"3. Узнай своего певца","step3-d":"Скажем, какой артист тебе похож.",
    "voices-title":"Узнай тип голоса","voices-sub":"У каждого типа свои идеальные песни.",
    "feat-title":"Всё что есть в Harmiq","feat-sub":"Гораздо больше простого теста.",
    "f1-t":"12 000 артистов","f1-d":"Со всего мира.","f2-t":"Песни для твоего голоса","f2-d":"Подобраны под диапазон.",
    "f3-t":"Артисты по странам","f3-d":"Фильтруй по региону.","f4-t":"Поделись результатом","f4-d":"В ВКонтакте, Telegram...",
    "f5-t":"Найди артиста","f5-d":"Сравни голос.","f6-t":"Конфиденциальность","f6-d":"Аудио удаляется сразу.",
    "cta-title":"Узнай тип голоса сейчас","cta-desc":"Бесплатный анализ за 10 секунд.","cta-btn":"🎤 Анализировать бесплатно",
    "_upload_btn":"📁 Загрузить аудио","_upload_hint":"WAV · MP3 · M4A · мин. 5 сек",
    "_or":"— или —","_analyzing":"🔍 Анализируем…","_rec_stop":"⏹ Остановить",
    "_result":"Твой результат","_similarity":"совпадение","_vt_label":"Тип голоса","_confidence":"уверенность",
    "_share":"📲 Поделиться","_copy":"📋 Копировать",
    "_share_txt":"🎤 Мой голос похож на {name} на {pct}%. harmiq.app",
    "_err_short":"Аудио слишком короткое.","_err_silent":"Сигнал слишком слабый.","_err_mic":"Нет доступа к микрофону.",
    "_err_gender":"Сначала выбери тип голоса.","_err_db":"База данных недоступна.",
    "_filter_era":"Эпоха","_all_eras":"Все эпохи",
    "_eras":{"pre-1960s":"До 60-х","1960s":"60-е","1970s-80s":"70-е – 80-е","1990s":"90-е","2000s+":"2000-е","2010s+":"2010-е+"},
    "_karaoke":"🎤 Karaoke","_platform":"🎵 Слушать","_rec_tips":"Для лучшего результата: без музыки · ближе к микрофону",
    "_vt_names":{"bass":"Бас","bass-baritone":"Бас-Баритон","baritone":"Баритон","tenor":"Тенор","countertenor":"Контртенор","contralto":"Контральто","mezzo-soprano":"Меццо-сопрано","soprano":"Сопрано"},
  },
  uk:{
    "nav-cta":"Аналізувати голос","hero-badge":"ШІ-аналіз голосу · 12 000 артистів · Безкоштовно",
    "hero-grad":"відомий співак","hero-title-rest":"живе у твоєму голосі",
    "hero-desc":"Співай 10 секунд. ШІ аналізує тон, тембр і діапазон.",
    "btn-main":"🎤 Аналізувати — безкоштовно","btn-how":"Як це працює","hero-sub":"Без реєстрації · Без встановлення",
    "stat1":"Артистів з усього світу","stat2":"Мов","stat3":"До результату","stat4":"Завжди безкоштовно",
    "app-title":"Аналізуй голос","app-desc":"Обери тип голосу, завантаж або записуй",
    "opt-default":"Обери свій голос","opt-male":"Чоловічий голос","opt-female":"Жіночий голос","btn-record-text":"Записати і аналізувати",
    "how-title":"Як це працює","how-sub":"Три кроки. Без реєстрації.",
    "step1-t":"1. Співай кілька секунд","step1-d":"Завантаж або використай мікрофон.","step2-t":"2. ШІ аналізує","step2-d":"Визначаємо частоту, тембр і діапазон.",
    "step3-t":"3. Дізнайся свого співака","step3-d":"Скажемо, який артист тобі подібний.",
    "voices-title":"Дізнайся тип голосу","voices-sub":"Кожен тип має своїх ідеальних артистів.",
    "feat-title":"Все в Harmiq","feat-sub":"Набагато більше тесту голосу.",
    "f1-t":"12 000 артистів","f1-d":"З усього світу.","f2-t":"Пісні для твого голосу","f2-d":"Підібрані під діапазон.",
    "f3-t":"Артисти за країнами","f3-d":"Фільтруй по регіону.","f4-t":"Поділись результатом","f4-d":"У Telegram, Twitter...",
    "f5-t":"Знайди артиста","f5-d":"Порівняй голос.","f6-t":"Конфіденційність","f6-d":"Аудіо видаляється одразу.",
    "cta-title":"Дізнайся тип голосу зараз","cta-desc":"Безкоштовний аналіз за 10 секунд.","cta-btn":"🎤 Аналізувати безкоштовно",
    "_upload_btn":"📁 Завантажити аудіо","_upload_hint":"WAV · MP3 · M4A · мін. 5 сек",
    "_or":"— або —","_analyzing":"🔍 Аналізуємо…","_rec_stop":"⏹ Зупинити",
    "_result":"Твій результат","_similarity":"збіг","_vt_label":"Тип голосу","_confidence":"впевненість",
    "_share":"📲 Поділитись","_copy":"📋 Копіювати",
    "_share_txt":"🎤 Мій голос схожий на {name} на {pct}%. harmiq.app",
    "_err_short":"Аудіо занадто коротке.","_err_silent":"Сигнал занадто слабкий.","_err_mic":"Немає доступу до мікрофона.",
    "_err_gender":"Спочатку обери тип голосу.","_err_db":"База даних недоступна.",
    "_filter_era":"Епоха","_all_eras":"Всі епохи",
    "_eras":{"pre-1960s":"До 60-х","1960s":"60-ті","1970s-80s":"70-ті – 80-ті","1990s":"90-ті","2000s+":"2000-ні","2010s+":"2010-ні+"},
    "_karaoke":"🎤 Karaoke","_platform":"🎵 Слухати","_rec_tips":"Для кращого результату: без музики · ближче до мікрофона",
    "_vt_names":{"bass":"Бас","bass-baritone":"Бас-Баритон","baritone":"Баритон","tenor":"Тенор","countertenor":"Контртенор","contralto":"Контральто","mezzo-soprano":"Меццо-сопрано","soprano":"Сопрано"},
  },
};

// ── Estado ───────────────────────────────────────────────────────────────────
let lang          = "es";
let singersDb     = [];
let monetizationDb= null;  // monetization.json — perfiles de voz + micros Amazon
let catalaDb      = null;  // catala_data.json — boost cultural catalán
let audioBlob     = null;
let isRec         = false;
let mRec          = null;
let chunks        = [];
let analyser      = null;
let actx          = null;
let rafId         = null;
let lastResult    = null;
let userCountry   = "ES";
let imgCache      = {};  // cache de imágenes iTunes

// ── Helpers de traducción ─────────────────────────────────────────────────────
const tr  = k => T[lang]?.[k]       ?? T.es[k]       ?? k;
const trV = (k,v) => T[lang]?.[k]?.[v] ?? T.es[k]?.[v] ?? v;

// ═══════════════════════════════════════════════════════════════════════════════
// 1. i18n — changeLang() PUBLIC (llamado desde HTML onchange)
// ═══════════════════════════════════════════════════════════════════════════════
function changeLang(l) {
  if (!T[l]) return;
  lang = l;
  localStorage.setItem("harmiq_lang", l);
  document.documentElement.lang = l;
  const sel = document.getElementById("lang-select");
  if (sel) sel.value = l;

  // IDs estándar
  const skip = new Set(["_upload_btn","_upload_hint","_or","_analyzing","_rec_stop",
    "_result","_similarity","_vt_label","_confidence","_share","_copy","_share_txt",
    "_err_short","_err_silent","_err_mic","_err_gender","_err_db",
    "_filter_era","_all_eras","_eras","_karaoke","_platform","_rec_tips","_vt_names"]);

  for (const [id, text] of Object.entries(T[l])) {
    if (skip.has(id) || typeof text !== "string") continue;
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // Actualizar UI dinámica si ya existe
  const hint = document.getElementById("_upload_hint_el");
  if (hint) hint.textContent = tr("_upload_hint");
  const uploadBtn = document.getElementById("_upload_btn_el");
  if (uploadBtn) uploadBtn.textContent = tr("_upload_btn");
  const orEl = document.getElementById("_or_el");
  if (orEl) orEl.textContent = tr("_or");
  const tipEl = document.getElementById("_rec_tips_el");
  if (tipEl) tipEl.textContent = tr("_rec_tips");

  // Actualizar filtro de épocas (solo si ya se han mostrado resultados)
  rebuildEraFilter();
}

function rebuildEraFilter() {
  const eraF = document.getElementById("_era_filter");
  if (!eraF) return; // el filtro solo existe después de analizar — no hacer nada
  const allOpt = eraF.querySelector('option[value=""]');
  if (allOpt) allOpt.textContent = tr("_all_eras");
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. GEOLOCALIZACIÓN (IP-based, sin permiso del navegador)
// ═══════════════════════════════════════════════════════════════════════════════
async function detectCountry() {
  try {
    const controller = new AbortController();
    const tId = setTimeout(() => controller.abort(), 2000); // 2s timeout is enough for UX
    // 🌍 Fallback: usamos cloudflare edge header si está disponible (CF-IPCountry)
    // Pero como es cliente, dependemos de APIs. Intentamos ipapi.co y si hay CORS/error, saltamos a ip-api.com
    const r = await fetch("https://ipapi.co/json/", { signal: controller.signal }).catch(() => fetch("http://ip-api.com/json/", { signal: controller.signal }));
    clearTimeout(tId);
    if (!r.ok) throw new Error();
    const d = await r.json();
    userCountry = d.country_code || d.countryCode || "ES";
    
    // Auto-detectar idioma si no hay preferencia guardada
    const langMap = { ES:"es",MX:"es",AR:"es",CO:"es",CL:"es",PE:"es",VE:"es",
                      CA:"ca",FR:"fr",DE:"de",AT:"de",CH:"de",IT:"it",
                      PT:"pt",BR:"pt",JP:"ja",RU:"ru",UA:"uk",GB:"en",US:"en" };
    if (!localStorage.getItem("harmiq_lang")) {
      const detected = langMap[userCountry] || "en";
      changeLang(detected);
    }
  } catch(_) { userCountry = "ES"; }
}

function getAmazonDomain() {
  const d = AMAZON_DOMAINS[userCountry];
  return d ? `amazon.${d}` : "amazon.es";
}
function getCurrencySymbol() {
  const c = { US:"$",MX:"MXN",BR:"R$",UK:"£",JP:"¥",CA:"CA$" };
  return c[userCountry] || "€";
}
function getMusicPlatform() {
  return MUSIC_PLATFORM[userCountry] || MUSIC_PLATFORM.DEFAULT;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. IMÁGENES — iTunes Search API (gratis, sin auth)
// ═══════════════════════════════════════════════════════════════════════════════
// Imágenes del monetization.json (Wikipedia, sin CORS)
const MONO_IMGS = {
  // Barítonos
  "Frank Sinatra":       "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Frank_Sinatra_-_publicity.jpg/220px-Frank_Sinatra_-_publicity.jpg",
  "Elvis Presley":       "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Elvis_Presley_promoting_Jailhouse_Rock.jpg/220px-Elvis_Presley_promoting_Jailhouse_Rock.jpg",
  "Michael Bublé":       "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Michael_Bublé_2014.jpg/220px-Michael_Bublé_2014.jpg",
  "David Bowie":         "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/David-Bowie_Chicago_2002-08-08_photoby_Adam-Bielawski_cropped.jpg/220px-David-Bowie_Chicago_2002-08-08_photoby_Adam-Bielawski_cropped.jpg",
  "Freddie Mercury":     "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Freddie_Mercury_performing_The_Works_Tour_in_New_Zealand.jpg/220px-Freddie_Mercury_performing_The_Works_Tour_in_New_Zealand.jpg",
  "Alejandro Sanz":      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Alejandro_Sanz_2019.jpg/220px-Alejandro_Sanz_2019.jpg",
  "Raphael":             "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Raphael_cantante_2019.jpg/220px-Raphael_cantante_2019.jpg",
  "Joaquín Sabina":      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Joaquin_Sabina_2009.jpg/220px-Joaquin_Sabina_2009.jpg",
  "Serrat":              "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Joan_Manuel_Serrat_en_2009.jpg/220px-Joan_Manuel_Serrat_en_2009.jpg",
  "Joan Manuel Serrat":  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Joan_Manuel_Serrat_en_2009.jpg/220px-Joan_Manuel_Serrat_en_2009.jpg",
  // Hip-hop / urbano muy conocidos (faltan en MONO_IMGS)
  "Drake":               "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Drake_July_2016.jpg/220px-Drake_July_2016.jpg",
  "Kendrick Lamar":      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Kendrick_Lamar_2018.jpg/220px-Kendrick_Lamar_2018.jpg",
  "Post Malone":         "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Post_Malone_2019.jpg/220px-Post_Malone_2019.jpg",
  "Travis Scott":        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Travis_Scott_2018.jpg/220px-Travis_Scott_2018.jpg",
  "The Weeknd":          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/The_Weeknd_2018.jpg/220px-The_Weeknd_2018.jpg",
  "Eminem":              "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Eminem_2022.jpg/220px-Eminem_2022.jpg",
  "Jay-Z":               "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Jay_Z_at_Cannes.jpg/220px-Jay_Z_at_Cannes.jpg",
  "Kanye West":          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Kanye_West_2_--_2012.jpg/220px-Kanye_West_2_--_2012.jpg",
  "Usher":               "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Usher_2019.jpg/220px-Usher_2019.jpg",
  "Justin Bieber":       "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Justin_Bieber_in_2015.jpg/220px-Justin_Bieber_in_2015.jpg",
  // Tenores
  "Luciano Pavarotti":   "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Luciano_Pavarotti_with_Tommy_Tune_%28cropped%29.jpg/220px-Luciano_Pavarotti_with_Tommy_Tune_%28cropped%29.jpg",
  "Pavarotti":           "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Luciano_Pavarotti_with_Tommy_Tune_%28cropped%29.jpg/220px-Luciano_Pavarotti_with_Tommy_Tune_%28cropped%29.jpg",
  "Andrea Bocelli":      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/AndreaBocelli.jpg/220px-AndreaBocelli.jpg",
  "Benson Boone":        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Benson_Boone_2024.jpg/220px-Benson_Boone_2024.jpg",
  "Camilo Sesto":        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Camilo_Sesto_2010.jpg/220px-Camilo_Sesto_2010.jpg",
  "Alejandro Fernández": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Alejandro_Fernandez_2012.jpg/220px-Alejandro_Fernandez_2012.jpg",
  "Roberto Carlos":      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Roberto_Carlos_2012.jpg/220px-Roberto_Carlos_2012.jpg",
  "Plácido Domingo":     "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Placido_Domingo_2012.jpg/220px-Placido_Domingo_2012.jpg",
  // Sopranos
  "Mariah Carey":        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mariah_Carey_2019_by_Glenn_Francis.jpg/220px-Mariah_Carey_2019_by_Glenn_Francis.jpg",
  "Whitney Houston":     "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Whitney_Houston_Welcome_Home_Heroes_1.jpg/220px-Whitney_Houston_Welcome_Home_Heroes_1.jpg",
  "Celine Dion":         "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Celine_dion_2017.jpg/220px-Celine_dion_2017.jpg",
  "Ariana Grande":       "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Ariana_Grande_in_2019.jpg/220px-Ariana_Grande_in_2019.jpg",
  "Sabrina Carpenter":   "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Sabrina_Carpenter_2023.jpg/220px-Sabrina_Carpenter_2023.jpg",
  "María Callas":        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Maria_Callas_1957.jpg/220px-Maria_Callas_1957.jpg",
  "Montserrat Caballé":  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Montserrat_Caballé.jpg/220px-Montserrat_Caballé.jpg",
  "Isabel Pantoja":      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Isabel_Pantoja_2011.jpg/220px-Isabel_Pantoja_2011.jpg",
  // Mezzosopranos
  "Adele":               "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Adele_2016.jpg/220px-Adele_2016.jpg",
  "Amy Winehouse":       "/assets/img/amy_winehouse.png",
  "Beyoncé":             "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Beyoncé_in_Cannes_%282012%29.jpg/220px-Beyoncé_in_Cannes_%282012%29.jpg",
  "Rosalía":             "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Rosal%C3%ADa_%282019%29.jpg/220px-Rosal%C3%ADa_%282019%29.jpg",
  "Tracy Chapman":       "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Tracy_Chapman_2009.jpg/220px-Tracy_Chapman_2009.jpg",
  "Billie Eilish":       "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Billie_Eilish_-_2019_by_Glenn_Francis.jpg/220px-Billie_Eilish_-_2019_by_Glenn_Francis.jpg",
  "Lana Del Rey":        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Lana_Del_Rey_2018.jpg/220px-Lana_Del_Rey_2018.jpg",
  "Norah Jones":         "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Norah_Jones_2012.jpg/220px-Norah_Jones_2012.jpg",
  // Contraltos
  "Cher":                "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Cher_2010.jpg/220px-Cher_2010.jpg",
  "Nina Simone":         "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Nina_Simone_1965.jpg/220px-Nina_Simone_1965.jpg",
  "Tina Turner":         "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Tina_Turner_-_Simply_the_Best_World_Tour.jpg/220px-Tina_Turner_-_Simply_the_Best_World_Tour.jpg",
  "Macy Gray":           "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Macy_Gray_2009.jpg/220px-Macy_Gray_2009.jpg",
  "Alanis Morissette":   "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Alanis_Morissette_2008.jpg/220px-Alanis_Morissette_2008.jpg",
  // Bajos
  "Johnny Cash":         "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Johnny_Cash_1964.jpg/220px-Johnny_Cash_1964.jpg",
  "Barry White":         "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Barry_White_1974.jpg/220px-Barry_White_1974.jpg",
  "Leonard Cohen":       "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Leonard_Cohen_at_the_Glastonbury_Festival.jpg/220px-Leonard_Cohen_at_the_Glastonbury_Festival.jpg",
  "Tom Waits":           "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Tom_Waits_2008.jpg/220px-Tom_Waits_2008.jpg",
  "Nick Cave":           "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Nick_Cave_2013.jpg/220px-Nick_Cave_2013.jpg",
  "Isaac Hayes":         "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Isaac_Hayes_1973.jpg/220px-Isaac_Hayes_1973.jpg",
  // Otros populares
  "Taylor Swift":        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/191125_Taylor_Swift_at_the_2019_American_Music_Awards_%28cropped%29.jpg/220px-191125_Taylor_Swift_at_the_2019_American_Music_Awards_%28cropped%29.jpg",
  "Ed Sheeran":          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Ed_Sheeran_in_2017.jpg/220px-Ed_Sheeran_in_2017.jpg",
  "Bruno Mars":          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Bruno_Mars_2013.jpg/220px-Bruno_Mars_2013.jpg",
  "Shakira":             "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Shakira_-_2010.jpg/220px-Shakira_-_2010.jpg",
  "Rihanna":             "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Rihanna_-_GQ_100_Best_Styled_People_in_Music.jpg/220px-Rihanna_-_GQ_100_Best_Styled_People_in_Music.jpg",
  "Lady Gaga":           "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Lady_Gaga_2016.jpg/220px-Lady_Gaga_2016.jpg",
  "Bad Bunny":           "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Bad_Bunny_2019.jpg/220px-Bad_Bunny_2019.jpg",
  "Maluma":              "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Maluma_2018.jpg/220px-Maluma_2018.jpg",
  "J Balvin":            "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/J_Balvin_2018.jpg/220px-J_Balvin_2018.jpg",
  "Enrique Iglesias":    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Enrique_Iglesias_2014.jpg/220px-Enrique_Iglesias_2014.jpg",
  "Ozuna":               "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Ozuna_2017.jpg/220px-Ozuna_2017.jpg",
  "Michael Jackson":     "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Michael_Jackson_in_1988.jpg/220px-Michael_Jackson_in_1988.jpg",
  "Prince":              "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Prince_at_Coachella_001.jpg/220px-Prince_at_Coachella_001.jpg",
  "Elton John":          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Elton_John_2015.jpg/220px-Elton_John_2015.jpg",
  "Sting":               "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Sting_2017.jpg/220px-Sting_2017.jpg",
  "Mick Jagger":         "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Mick_Jagger_2019.jpg/220px-Mick_Jagger_2019.jpg",
  "Julio Iglesias":      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Julio_Iglesias_1976.jpg/220px-Julio_Iglesias_1976.jpg",
  "Enrique Bunbury":     "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Enrique_Bunbury_2012.jpg/220px-Enrique_Bunbury_2012.jpg",
  // Artistas adicionales — todos los que aparecen en la DB
  "Bob Marley":          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Bob-Marley.jpg/220px-Bob-Marley.jpg",
  "Stevie Wonder":       "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Stevie_Wonder_at_NAMM_%28cropped%29.jpg/220px-Stevie_Wonder_at_NAMM_%28cropped%29.jpg",
  "Ray Charles":         "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Ray_Charles_1988.jpg/220px-Ray_Charles_1988.jpg",
  "James Brown":         "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/James_Brown_Live_Hamburg_1973_1.jpg/220px-James_Brown_Live_Hamburg_1973_1.jpg",
  "Bruce Springsteen":   "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Bruce_Springsteen_2012.jpg/220px-Bruce_Springsteen_2012.jpg",
  "Robert Plant":        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Robert_Plant_2009.jpg/220px-Robert_Plant_2009.jpg",
  "Jim Morrison":        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Jim_Morrison_1969.jpg/220px-Jim_Morrison_1969.jpg",
  "Kurt Cobain":         "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Kurt_Cobain_and_Krist_Novoselic_in_1991.jpg/220px-Kurt_Cobain_and_Krist_Novoselic_in_1991.jpg",
  "Eddie Vedder":        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Eddie_vedder_%28cropped%29.jpg/220px-Eddie_vedder_%28cropped%29.jpg",
  "Chris Martin":        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Chris_Martin_2015.jpg/220px-Chris_Martin_2015.jpg",
  "Thom Yorke":          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Thom_Yorke_2013.jpg/220px-Thom_Yorke_2013.jpg",
  "John Lennon":         "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/John_Lennon_1969_%28cropped%29.jpg/220px-John_Lennon_1969_%28cropped%29.jpg",
  "Paul McCartney":      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Paul_McCartney_2.jpg/220px-Paul_McCartney_2.jpg",
  "Mick Jagger":         "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Mick_Jagger_2019.jpg/220px-Mick_Jagger_2019.jpg",
  "Bono":                "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Bono_3.jpg/220px-Bono_3.jpg",
  "Roger Daltrey":       "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Roger_Daltrey_2015.jpg/220px-Roger_Daltrey_2015.jpg",
  "David Coverdale":     "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/David_Coverdale%2C_Whitesnake.jpg/220px-David_Coverdale%2C_Whitesnake.jpg",
  "Axl Rose":            "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Axl_Rose_2016.jpg/220px-Axl_Rose_2016.jpg",
  "Jon Bon Jovi":        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Jon_Bon_Jovi_2013_%28cropped%29.jpg/220px-Jon_Bon_Jovi_2013_%28cropped%29.jpg",
  "Ronnie James Dio":    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Dio_at_Sweden_Rock_2004.jpg/220px-Dio_at_Sweden_Rock_2004.jpg",
  "Harry Styles":        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Harry_Styles_2017_crop.jpg/220px-Harry_Styles_2017_crop.jpg",
  "The Weeknd":          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/The_Weeknd_2018.jpg/220px-The_Weeknd_2018.jpg",
  "Sam Smith":           "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Sam_Smith_2014.jpg/220px-Sam_Smith_2014.jpg",
  "Dua Lipa":            "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Dua_Lipa_2018_%28cropped%29.jpg/220px-Dua_Lipa_2018_%28cropped%29.jpg",
  "Billie Eilish":       "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Billie_Eilish_-_2019_by_Glenn_Francis.jpg/220px-Billie_Eilish_-_2019_by_Glenn_Francis.jpg",
  "Olivia Rodrigo":      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Olivia_Rodrigo_2021.jpg/220px-Olivia_Rodrigo_2021.jpg",
  "Miley Cyrus":         "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Miley_Cyrus_2019.jpg/220px-Miley_Cyrus_2019.jpg",
  "Doja Cat":            "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Doja_Cat_2020.jpg/220px-Doja_Cat_2020.jpg",
  "SZA":                 "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/SZA_2022.jpg/220px-SZA_2022.jpg",
  "Alicia Keys":         "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Alicia_Keys_2019.jpg/220px-Alicia_Keys_2019.jpg",
  "Nicki Minaj":         "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Nicki_Minaj_2013.jpg/220px-Nicki_Minaj_2013.jpg",
  // 🔥 VIP Artistas (Nuevos añadidos para asegurar fotos)
  "Aitana":              "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Aitana_Los40_Music_Awards_2023.jpg/220px-Aitana_Los40_Music_Awards_2023.jpg",
  "Karol G":             "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Karol_G_2024.jpg/220px-Karol_G_2024.jpg",
  "Nathy Peluso":        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Nathy_Peluso_2021.jpg/220px-Nathy_Peluso_2021.jpg",
  "C. Tangana":          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/C._Tangana_2021.png/220px-C._Tangana_2021.png",
  "Lola Índigo":         "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Lola_Indigo_2023.jpg/220px-Lola_Indigo_2023.jpg",
  "Morat":               "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Morat_2018.jpg/220px-Morat_2018.jpg",
  "Rauw Alejandro":      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/RauwAlejandro2022.jpg/220px-RauwAlejandro2022.jpg",
  "Quevedo":             "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Quevedo_%28singer%29_2023.png/220px-Quevedo_%28singer%29_2023.png",
  "Bizarrap":            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Bizarrap_2023.jpg/220px-Bizarrap_2023.jpg",
  "Tiago PZK":           "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Tiago_PZK_2021.jpg/220px-Tiago_PZK_2021.jpg",
  "Myke Towers":         "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Myke_Towers_2022.jpg/220px-Myke_Towers_2022.jpg",
  "Anuel AA":            "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Anuel_AA_2020.jpg/220px-Anuel_AA_2020.jpg",
  "Feid":                "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Feid_2022.jpg/220px-Feid_2022.jpg",
  "Peso Pluma":          "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Peso_Pluma_2023.jpg/220px-Peso_Pluma_2023.jpg",
  // 🏴 CAT Artistas
  "Miki Núñez":          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Miki_Nuñez_2019.jpg/220px-Miki_Nuñez_2019.jpg",
  "The Tyets":           "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/The_Tyets_2023.jpg/220px-The_Tyets_2023.jpg",
  "Stay Homas":          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Stay_Homas_2020.jpg/220px-Stay_Homas_2020.jpg",
  "Oques Grasses":       "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Oques_Grasses_2019.jpg/220px-Oques_Grasses_2019.jpg",
  "Mushkaa":             "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Mushkaa_2023.jpg/220px-Mushkaa_2023.jpg",
  "Cardi B":             "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Cardi_B_2018.jpg/220px-Cardi_B_2018.jpg",
  "J Balvin":            "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/J_Balvin_2018.jpg/220px-J_Balvin_2018.jpg",
  "Rauw Alejandro":      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Rauw_Alejandro_2022.jpg/220px-Rauw_Alejandro_2022.jpg",
  "Marc Anthony":        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Marc_Anthony_2015.jpg/220px-Marc_Anthony_2015.jpg",
  "Romeo Santos":        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Romeo_Santos_2014.jpg/220px-Romeo_Santos_2014.jpg",
  "Daddy Yankee":        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Daddy_Yankee_-_Atlantic_2019.jpg/220px-Daddy_Yankee_-_Atlantic_2019.jpg",
  "Camilo":              "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Camilo_2020.jpg/220px-Camilo_2020.jpg",
  "Maluma":              "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Maluma_2018.jpg/220px-Maluma_2018.jpg",
  "Jhay Cortez":         "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Jhay_Cortez_2022.jpg/220px-Jhay_Cortez_2022.jpg",
  "Myke Towers":         "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Myke_Towers_2020.jpg/220px-Myke_Towers_2020.jpg",
  "Anuel AA":            "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Anuel_AA_2019.jpg/220px-Anuel_AA_2019.jpg",
  "Peso Pluma":          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Peso_Pluma_2023.jpg/220px-Peso_Pluma_2023.jpg",
  "Eros Ramazzotti":     "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Eros_Ramazzotti_2012.jpg/220px-Eros_Ramazzotti_2012.jpg",
  "Laura Pausini":       "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Laura_Pausini_2019.jpg/220px-Laura_Pausini_2019.jpg",
  "Andrea Bocelli":      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/AndreaBocelli.jpg/220px-AndreaBocelli.jpg",
  "Stromae":             "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Stromae_%28cropped%29.jpg/220px-Stromae_%28cropped%29.jpg",
  "Edith Piaf":          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Edith_Piaf.jpg/220px-Edith_Piaf.jpg",
  "Angèle":              "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Ang%C3%A8le_-_Musilac_2019_%28cropped%29.jpg/220px-Ang%C3%A8le_-_Musilac_2019_%28cropped%29.jpg",
  "Alla Pugacheva":      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Alla_Pugacheva_2016.jpg/220px-Alla_Pugacheva_2016.jpg",
  "Utada Hikaru":        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Hikaru_Utada_2018.jpg/220px-Hikaru_Utada_2018.jpg",
  "IU":                  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/IU_%28Lee_Ji-eun%29_at_2019_Golden_Disc_Awards.jpg/220px-IU_%28Lee_Ji-eun%29_at_2019_Golden_Disc_Awards.jpg",
  "BTS":                 "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/BTS_at_the_37th_Golden_Disc_Awards.jpg/220px-BTS_at_the_37th_Golden_Disc_Awards.jpg",
  "Jungkook (BTS)":      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Jungkook_Kim_at_the_White_House_%28cropped%29.jpg/220px-Jungkook_Kim_at_the_White_House_%28cropped%29.jpg",
  "PSY":                 "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/PSY_2012_MIC_05.jpg/220px-PSY_2012_MIC_05.jpg",
  "Jay Chou":            "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Jay_Chou_2013.jpg/220px-Jay_Chou_2013.jpg",
  "Teresa Teng":         "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Teresa_Teng.jpg/220px-Teresa_Teng.jpg",
  "Faye Wong":           "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Faye_Wong.jpg/220px-Faye_Wong.jpg",
  "A.R. Rahman":         "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/AR_Rahman_2010.jpg/220px-AR_Rahman_2010.jpg",
  "Lata Mangeshkar":     "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Lata_Mangeshkar.jpg/220px-Lata_Mangeshkar.jpg",
  "Cesária Évora":       "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Cesaria_evora_festivaldelhumour.jpg/220px-Cesaria_evora_festivaldelhumour.jpg",
  "Youssou N'Dour":      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Youssou_N%27Dour_2012.jpg/220px-Youssou_N%27Dour_2012.jpg",
  "Miriam Makeba":       "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Miriam_Makeba2.jpg/220px-Miriam_Makeba2.jpg",
  "Amy Lee":             "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Amy_Lee_of_Evanescence.jpg/220px-Amy_Lee_of_Evanescence.jpg",
  "Gwen Stefani":        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Gwen_Stefani_2014_%28cropped%29.jpg/220px-Gwen_Stefani_2014_%28cropped%29.jpg",
  "Sia":                 "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Sia_2016.jpg/220px-Sia_2016.jpg",
  "Lorde":               "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Lorde_2017.jpg/220px-Lorde_2017.jpg",
  "Grimes":              "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Grimes_2016.jpg/220px-Grimes_2016.jpg",
  "Björk":               "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Bjork-IMG_1317_%28cropped%29.jpg/220px-Bjork-IMG_1317_%28cropped%29.jpg",
  "Donna Summer":        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Donna_Summer_1978.jpg/220px-Donna_Summer_1978.jpg",
  "Cyndi Lauper":        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Cyndi_Lauper_2016_%28cropped%29.jpg/220px-Cyndi_Lauper_2016_%28cropped%29.jpg",
  "Gloria Gaynor":       "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Gloria_Gaynor_2009.jpg/220px-Gloria_Gaynor_2009.jpg",
  "Aretha Franklin":     "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Aretha_Franklin_1968.jpg/220px-Aretha_Franklin_1968.jpg",
  "Lauryn Hill":         "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Lauryn_Hill.jpg/220px-Lauryn_Hill.jpg",
  "Janis Joplin":        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Janis_Joplin_1970_%28cropped%29.jpg/220px-Janis_Joplin_1970_%28cropped%29.jpg",
  "Patti Smith":         "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Patti_Smith_1976.jpg/220px-Patti_Smith_1976.jpg",
  // Artistas catalanes
  "Oques Grasses":       "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Oques_Grasses_2019.jpg/220px-Oques_Grasses_2019.jpg",
  "The Tyets":           "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/The_Tyets_2021.jpg/220px-The_Tyets_2021.jpg",
  "Rosalía":             "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Rosal%C3%ADa_%282019%29.jpg/220px-Rosal%C3%ADa_%282019%29.jpg",
  "Alejandro Sanz":      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Alejandro_Sanz_2019.jpg/220px-Alejandro_Sanz_2019.jpg",
  // 🇪🇸 Artistas españoles (España) — fotos curadas para evitar confusiones
  "Omar Montes":         "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Omar_Montes_2022.jpg/220px-Omar_Montes_2022.jpg",
  "Quevedo":             "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Quevedo_%28singer%29_2023.png/220px-Quevedo_%28singer%29_2023.png",
  "Morad":               "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Morad_2022.jpg/220px-Morad_2022.jpg",
  "Beret":               "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Beret_2020.jpg/220px-Beret_2020.jpg",
  "Abhir Hathi":         "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Abhir_Hathi_2022.jpg/220px-Abhir_Hathi_2022.jpg",
  "Cruz Cafuné":         "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Cruz_Cafune_2022.jpg/220px-Cruz_Cafune_2022.jpg",
  "Recycled J":          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Recycled_J_2019.jpg/220px-Recycled_J_2019.jpg",
  "Dellafuente":         "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Dellafuente_2019.jpg/220px-Dellafuente_2019.jpg",
  "Yung Beef":           "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Yung_Beef_2019.jpg/220px-Yung_Beef_2019.jpg",
  "El Kanka":            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/El_Kanka_2019.jpg/220px-El_Kanka_2019.jpg",
  "Melendi":             "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Melendi_2019.jpg/220px-Melendi_2019.jpg",
  "David Bisbal":        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/David_Bisbal_2014.jpg/220px-David_Bisbal_2014.jpg",
  "David Bustamante":    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/David_Bustamante_2019.jpg/220px-David_Bustamante_2019.jpg",
  "Pablo López":         "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Pablo_Lopez_2017.jpg/220px-Pablo_Lopez_2017.jpg",
  "Manuel Carrasco":     "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Manuel_Carrasco_2019.jpg/220px-Manuel_Carrasco_2019.jpg",
  "Antonio Orozco":      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Antonio_Orozco_2017.jpg/220px-Antonio_Orozco_2017.jpg",
  "Dani Martín":         "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Dani_Mart%C3%ADn_2018.jpg/220px-Dani_Mart%C3%ADn_2018.jpg",
  "El Canto del Loco":   "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/El_Canto_del_Loco_2007.jpg/220px-El_Canto_del_Loco_2007.jpg",
  "Mecano":              "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Mecano_1988.jpg/220px-Mecano_1988.jpg",
  "Alaska":              "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Alaska_y_Mario_2019.jpg/220px-Alaska_y_Mario_2019.jpg",
  "Fangoria":            "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Alaska_y_Mario_2019.jpg/220px-Alaska_y_Mario_2019.jpg",
  "Peret":               "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Peret_2012.jpg/220px-Peret_2012.jpg",
  "Camela":              "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Camela_2019.jpg/220px-Camela_2019.jpg",
  "La Oreja de Van Gogh":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/La_Oreja_de_Van_Gogh_2019.jpg/220px-La_Oreja_de_Van_Gogh_2019.jpg",
  "Estopa":              "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Estopa_2010.jpg/220px-Estopa_2010.jpg",
  "Marea":               "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Marea_band.jpg/220px-Marea_band.jpg",
  "Jarabe de Palo":      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Jarabe_de_Palo_2010.jpg/220px-Jarabe_de_Palo_2010.jpg",
  "Los Planetas":        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Los_Planetas_2019.jpg/220px-Los_Planetas_2019.jpg",
  "Vetusta Morla":       "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Vetusta_Morla_2018.jpg/220px-Vetusta_Morla_2018.jpg",
  "Love of Lesbian":     "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Love_of_Lesbian_2019.jpg/220px-Love_of_Lesbian_2019.jpg",
  "Izal":                "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Izal_2018.jpg/220px-Izal_2018.jpg",
  "Los Secretos":        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Los_Secretos_2011.jpg/220px-Los_Secretos_2011.jpg",
  "El Pescao":           "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/El_Pescao_2016.jpg/220px-El_Pescao_2016.jpg",
  "Loquillo":            "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Loquillo_2018.jpg/220px-Loquillo_2018.jpg",
  "Leiva":               "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Leiva_2018.jpg/220px-Leiva_2018.jpg",
  "Los Zigarros":        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Los_Zigarros_2018.jpg/220px-Los_Zigarros_2018.jpg",
  "Fito y Fitipaldis":   "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Fito_y_Fitipaldis_2018.jpg/220px-Fito_y_Fitipaldis_2018.jpg",
  "Rosendo":             "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Rosendo_Mercado_2011.jpg/220px-Rosendo_Mercado_2011.jpg",
  "Ska-P":               "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Ska-P_2010.jpg/220px-Ska-P_2010.jpg",
  "Celtas Cortos":       "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Celtas_Cortos.jpg/220px-Celtas_Cortos.jpg",
  "Hombres G":           "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Hombres_G_2010.jpg/220px-Hombres_G_2010.jpg",
  "Radio Futura":        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Radio_Futura.jpg/220px-Radio_Futura.jpg",
  "Extremoduro":         "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Extremoduro_2012.jpg/220px-Extremoduro_2012.jpg",
  "Barón Rojo":          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Bar%C3%B3n_Rojo_2010.jpg/220px-Bar%C3%B3n_Rojo_2010.jpg",
  "Amaral":              "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Amaral_2019.jpg/220px-Amaral_2019.jpg",
  "Mägo de Oz":          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Mago_de_Oz_2019.jpg/220px-Mago_de_Oz_2019.jpg",
  "Dover":               "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Dover_2010.jpg/220px-Dover_2010.jpg",
  "Berri Txarrak":       "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Berri_Txarrak_2019.jpg/220px-Berri_Txarrak_2019.jpg",
  "La Bien Querida":     "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/La_Bien_Querida_2016.jpg/220px-La_Bien_Querida_2016.jpg",
  "Zahara":              "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Zahara_2019.jpg/220px-Zahara_2019.jpg",
  "Anni B Sweet":        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Anni_B_Sweet_2015.jpg/220px-Anni_B_Sweet_2015.jpg",
  "Natalia Lacunza":     "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Natalia_Lacunza_2022.jpg/220px-Natalia_Lacunza_2022.jpg",
  "La Húngara":          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/La_H%C3%BAngara_2018.jpg/220px-La_H%C3%BAngara_2018.jpg",
  "Pitingo":             "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Pitingo_2010.jpg/220px-Pitingo_2010.jpg",
  "María Jiménez":       "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mar%C3%ADa_Jim%C3%A9nez_2009.jpg/220px-Mar%C3%ADa_Jim%C3%A9nez_2009.jpg",
  "Rocío Jurado":        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Rocio_Jurado.jpg/220px-Rocio_Jurado.jpg",
  "Lola Flores":         "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Lola_Flores.jpg/220px-Lola_Flores.jpg",
  "Antonio Flores":      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Antonio_Flores_1994.jpg/220px-Antonio_Flores_1994.jpg",
  "Miguel Bosé":         "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Miguel_Bose_2011.jpg/220px-Miguel_Bose_2011.jpg",
  "Nena Daconte":        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Nena_Daconte_2016.jpg/220px-Nena_Daconte_2016.jpg",
  "Malú":                "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Mal%C3%BA_2019.jpg/220px-Mal%C3%BA_2019.jpg",
  "Soraya":              "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Soraya_Arnelas_2010.jpg/220px-Soraya_Arnelas_2010.jpg",
  "Bustamante":          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/David_Bustamante_2019.jpg/220px-David_Bustamante_2019.jpg",
  "Bisbal":              "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/David_Bisbal_2014.jpg/220px-David_Bisbal_2014.jpg",
  // 💎 Artistas Urbano / Pop Actual (Garantía de Imagen)
  "Bizarrap":            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Bizarrap_2023.jpg/220px-Bizarrap_2023.jpg",
  "Karol G":             "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Karol_G_2024.jpg/220px-Karol_G_2024.jpg",
  "Rauw Alejandro":      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Rauw_Alejandro_2022.jpg/220px-Rauw_Alejandro_2022.jpg",
  "Myke Towers":         "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Myke_Towers_2020.jpg/220px-Myke_Towers_2020.jpg",
  "Feid":                "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Feid_2022.jpg/220px-Feid_2022.jpg",
  "Anitta":              "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Anitta_2024.jpg/220px-Anitta_2024.jpg",
  "Duki":                "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Duki_2023.jpg/220px-Duki_2023.jpg",
  "Tini":                "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Tini_Stoessel_2022.jpg/220px-Tini_Stoessel_2022.jpg",
  "Milo J":              "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Milo_J_2023.jpg/220px-Milo_J_2023.jpg",
  "Trueno":              "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Trueno_2022.jpg/220px-Trueno_2022.jpg"
};

// Generar avatar con iniciales si no hay foto
function getInitialsAvatar(name) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length-1][0]).toUpperCase()
    : name.substring(0,2).toUpperCase();
  const colors = ['#7C4DFF','#FF4FA3','#118AB2','#FF9F1C','#06D6A0','#E63946'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" rx="60" fill="${color}"/><text x="60" y="75" font-family="Arial" font-weight="bold" font-size="42" fill="white" text-anchor="middle">${initials}</text></svg>`)}`;
}

// ── Spotify token (Client Credentials) ──────────────────────────────────
// Rellena con tus credenciales de Spotify Developer
// https://developer.spotify.com/dashboard
const HF_IMG_CACHE = {};  // cache imágenes vía backend HF

// Fotos de artistas vía backend HF — los secrets de Spotify están en HF, NUNCA aquí
async function getSpotifyImageFromBackend(name) {
  if (HF_IMG_CACHE[name]) return HF_IMG_CACHE[name];
  const base = HF_API_URL;
  for (let i = 0; i < 2; i++) {
    try {
      const r = await fetch(`${base}/artist-image?name=${encodeURIComponent(name)}`);
      if (!r.ok) continue;
      const d = await r.json();
      if (d.url) { HF_IMG_CACHE[name] = d.url; return d.url; }
    } catch(_) {
      if (i===0) await new Promise(r=>setTimeout(r,1500));
    }
  }
  return null;
}

async function getArtistImage(name) {
  if (imgCache[name]) return imgCache[name];

  // 1. Mapa local Wikipedia (instantáneo, sin red)
  if (MONO_IMGS[name]) {
    imgCache[name] = MONO_IMGS[name];
    return MONO_IMGS[name];
  }

  // 2. Foto vía backend HF (Spotify seguro — secrets en HF, no en frontend)
  const backendImg = await getSpotifyImageFromBackend(name);
  if (backendImg) { imgCache[name] = backendImg; return backendImg; }

  // 3. iTunes Search API pública (CORS friendly, rápido y alta calidad)
  // attribute=artistTerm → filtra por artista principal, evita collabs donde el artista buscado no es el principal
  try {
    const q = encodeURIComponent(name);
    const r = await fetch(`https://itunes.apple.com/search?term=${q}&entity=song&limit=8&attribute=artistTerm`);
    const d = await r.json();
    if (d.results && d.results.length > 0) {
      // Preferir el resultado cuyo artistName empiece por el mismo nombre
      const nameKey = name.toLowerCase().split(' ')[0];
      const best = d.results.find(r => r.artistName?.toLowerCase().startsWith(nameKey)) || d.results[0];
      const art = best?.artworkUrl100;
      if (art) {
        const img = art.replace('100x100bb', '600x600bb');
        imgCache[name] = img;
        return img;
      }
    }
  } catch(e) { console.error("iTunes Error:", e); }

  // 4. Fallback: avatar con iniciales coloreadas
  const initImg = getInitialsAvatar(name);
  imgCache[name] = initImg;
  return initImg;
}

async function preloadImages(names) {
  await Promise.allSettled(names.map(n => getArtistImage(n)));
}

function setFile(f) {
  if (!f) return;
  audioBlob = f;
  const fn = document.getElementById("_file_name");
  if (fn) fn.textContent = `✓ ${f.name} (Listo para analizar)`;
  
  const abtn = document.getElementById("analyze-btn");
  const gsel = document.getElementById("_gender_select_wrap");
  if (abtn) abtn.style.display = "block";
  if (gsel) gsel.style.display = "flex";
  
  if (abtn) abtn.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const dz = document.getElementById("_drop_zone");
  if (dz) {
    dz.style.borderColor = "var(--p)";
    dz.style.background = "rgba(124,77,255,0.06)";
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. INYECTAR UI (upload + era filter + spectrum + tips)
// ═══════════════════════════════════════════════════════════════════════════════
function injectUI() {
  const mount = document.getElementById("app-mount");
  if (!mount || mount.getAttribute("data-ui") === "_harmiq_ui_injected") return;

  mount.innerHTML = `
    <div id="_drop_zone" style="background:var(--glass); border:2px dashed var(--glass-border); border-radius:32px; padding:3rem 2rem; cursor:pointer; transition:0.3s; position:relative; overflow:hidden">
      <!-- VISUALIZADOR -->
      <div id="_spec_wrap" style="display:none; margin-bottom:1.5rem; background:rgba(0,0,0,0.2); border-radius:16px; padding:10px">
        <canvas id="_spec_canvas" style="width:100%; height:80px"></canvas>
      </div>
      
      <div id="_upload_ui">
        <div id="_main_mic_icon" style="font-size:3rem; margin-bottom:1rem">🎙️</div>
        
        <div style="display:flex; flex-direction:column; gap:1.2rem; align-items:center">
          <!-- SELECCIÓN DE GÉNERO — visible desde el inicio -->
          <div id="_gender_select_wrap" style="display:flex; flex-direction:column; align-items:center; gap:0.8rem; margin-bottom:0.5rem; width:100%">
            <p style="font-size:0.85rem; font-weight:800; color:var(--p); text-transform:uppercase; letter-spacing:1px; margin:0">¿Cuál es tu voz?</p>
            <div style="display:flex; gap:0.8rem; justify-content:center">
              <button id="_gbtn_male" onclick="_setGender('male')" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#E5E7EB; padding:0.8rem 1.8rem; border-radius:50px; font-weight:700; cursor:pointer; transition:0.2s; font-size:1rem">👨 Hombre</button>
              <button id="_gbtn_female" onclick="_setGender('female')" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#E5E7EB; padding:0.8rem 1.8rem; border-radius:50px; font-weight:700; cursor:pointer; transition:0.2s; font-size:1rem">👩 Mujer</button>
            </div>
            <select id="user-gender" style="display:none"><option value=""></option><option value="male">male</option><option value="female">female</option></select>
          </div>

          <!-- BOTÓN GRABAR / DETENER -->
          <button class="hm-btn" id="record-btn" style="min-width:280px; font-size:1.1rem; padding:1.2rem; display:flex; align-items:center; justify-content:center; gap:10px">
            <span id="_mic_bullet" style="display:none; width:12px; height:12px; background:#ff4757; border-radius:50%; animation:pulse-red 1s infinite"></span>
            <span id="btn-record-text">Pulsar para Grabar</span>
          </button>

          <!-- BOTÓN ANALIZAR (Visible tras grabación o subida) -->
          <button id="analyze-btn" class="hm-btn" style="min-width:300px; font-size:1.2rem; padding:1.4rem; display:none; background:linear-gradient(135deg, #FF4FA3, #7C4DFF); border:none; box-shadow:0 10px 30px rgba(124,77,255,0.4); border-radius:100px; color:#fff; font-weight:900; cursor:pointer" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
            🚀 ANALIZAR MI VOZ AHORA
          </button>

          <div style="color:var(--m); font-size:0.9rem; margin:0.4rem 0" id="_or_el">o también</div>

          <!-- BOTÓN SUBIR ARCHIVO -->
          <button id="_upload_btn_trigger" style="background:transparent; border:1px solid var(--glass-border); color:var(--t); padding:0.8rem 2rem; border-radius:100px; font-weight:700; cursor:pointer; transition:0.3s; min-width:240px" onmouseover="this.style.borderColor='var(--p)'" onmouseout="this.style.borderColor='var(--glass-border)'">
            📁 <span id="_upload_btn_el">Subir archivo de audio</span>
          </button>
        </div>

        <p style="font-size:0.75rem; color:var(--m); margin-top:1.5rem" id="_upload_hint_el">Formatos: MP3, WAV, M4A o Voice Memo</p>
        
        <!-- BARRA DE PROGRESO (NUEVO) -->
        <div id="_progress_wrap" style="display:none; width:100%; max-width:300px; margin:1.5rem auto 0; text-align:center">
          <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:var(--p); font-weight:800; margin-bottom:5px; text-transform:uppercase; letter-spacing:1px">
            <span id="_progress_txt">Analizando...</span>
            <span id="_progress_pct">0%</span>
          </div>
          <div style="width:100%; height:8px; background:rgba(255,255,255,0.05); border-radius:10px; overflow:hidden; border:1px solid rgba(255,255,255,0.05)">
            <div id="_progress_fill" style="width:0%; height:100%; background:linear-gradient(90deg, #7C4DFF, #FF4FA3); transition:width 0.3s ease"></div>
          </div>
        </div>

        <div id="_file_name" style="margin-top:1rem; font-weight:800; color:var(--p); font-size:1.1rem"></div>
        <div style="font-size:0.6rem; color:rgba(255,255,255,0.1); margin-top:2rem">Build v${APP_VERSION}</div>
      </div>
      
      <input type="file" id="_file_inp" accept="audio/*" style="display:none">
    </div>
    
    <div id="results" style="margin-top:3rem"></div>
    <div id="events-area" style="margin-top:2rem"></div>

    <style>
      @keyframes pulse-red { 0% { transform: scale(0.9); opacity: 0.7; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(0.9); opacity: 0.7; } }
      .gbtn-active { border-color:var(--p) !important; background:rgba(124,77,255,.15) !important; color:#fff !important; box-shadow:0 0 15px rgba(124,77,255,0.3); }
    </style>
  `;

  // Conectar eventos
  const dz = document.getElementById("_drop_zone");
  const fi = document.getElementById("_file_inp");
  const recBtn = document.getElementById("record-btn");
  const analyzeBtn = document.getElementById("analyze-btn");

  if (dz && fi) {
    dz.addEventListener("dragover", e => { e.preventDefault(); dz.style.borderColor="var(--p)"; dz.style.background="rgba(124,77,255,0.05)"; });
    dz.addEventListener("dragleave", () => { dz.style.borderColor="var(--glass-border)"; dz.style.background="var(--glass)"; });
    dz.addEventListener("drop", e => {
      e.preventDefault(); dz.style.borderColor="var(--glass-border)"; dz.style.background="var(--glass)";
      const f = e.dataTransfer.files[0];
      if (f) setFile(f);
    });
    fi.addEventListener("change", () => { if (fi.files[0]) setFile(fi.files[0]); });
    
    // Conectar botón de subir archivo
    const uploadTrigger = document.getElementById("_upload_btn_trigger");
    if (uploadTrigger) uploadTrigger.addEventListener("click", e => { e.stopPropagation(); fi.click(); });
  }

  // Evento Grabar
  if (recBtn) {
    recBtn.onclick = async () => { await toggleRecording(); };
  }

  // Evento Analizar (Nuevo)
  if (analyzeBtn) {
    analyzeBtn.onclick = async () => { await analyzeAudio(); };
  }

  mount.setAttribute("data-ui", "_harmiq_ui_injected");
}

function _setGender(val) {
  // Actualizar select oculto
  const sel = document.getElementById("user-gender");
  if (sel) sel.value = val;
  // Actualizar botones visuales
  ["male","female"].forEach(v => {
    const b = document.getElementById(`_gbtn_${v}`);
    if (!b) return;
    const active = v === val;
    b.style.borderColor   = active ? "var(--p)" : "rgba(255,255,255,.1)";
    b.style.background    = active ? "rgba(124,77,255,.15)" : "rgba(255,255,255,.05)";
    b.style.color         = active ? "#fff" : "#E5E7EB";
  });
}

// setFile is now at line 721

// ═══════════════════════════════════════════════════════════════════════════════
// 5. VISUALIZADOR DE ESPECTRO
// ═══════════════════════════════════════════════════════════════════════════════
function startSpectrum(stream) {
  const wrap   = document.getElementById("_spec_wrap");
  const canvas = document.getElementById("_spec_canvas");
  if (!wrap || !canvas) return;
  wrap.style.display = "block";

  const dpr = window.devicePixelRatio || 1;
  canvas.width  = canvas.offsetWidth  * dpr || 300 * dpr;
  canvas.height = canvas.offsetHeight * dpr || 72  * dpr;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;

  actx    = new (window.AudioContext || window.webkitAudioContext)();
  const src = actx.createMediaStreamSource(stream);
  analyser = actx.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.82;
  src.connect(analyser);

  const buf = new Uint8Array(analyser.frequencyBinCount);

  function draw() {
    rafId = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(buf);
    ctx.fillStyle = "rgba(13,13,26,.35)";
    ctx.fillRect(0, 0, W, H);
    const bw = W / buf.length * 1.8;
    buf.forEach((v, i) => {
      const pct = v / 255;
      const h   = pct * H;
      const r   = Math.round(124 + (255-124)*pct);
      const g   = Math.round(77  * (1-pct));
      const b   = Math.round(255 * (1-pct*.6));
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(i * bw, H - h, bw - 1, h);
      if (pct > .05) {
        ctx.fillStyle = `rgba(255,255,255,${pct*.7})`;
        ctx.fillRect(i * bw, H - h - 2*dpr, bw - 1, 2*dpr);
      }
    });
  }
  draw();
}

function stopSpectrum() {
  if (rafId)   { cancelAnimationFrame(rafId); rafId = null; }
  if (analyser){ analyser.disconnect(); analyser = null; }
  if (actx)    { actx.close(); actx = null; }
  const w = document.getElementById("_spec_wrap");
  if (w) w.style.display = "none";
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. GRABACIÓN
// ═══════════════════════════════════════════════════════════════════════════════
async function toggleRecording() {
  const btn  = document.getElementById("record-btn");
  const txt  = document.getElementById("btn-record-text");
  let gender = document.getElementById("user-gender")?.value;
  if (!gender) {
    gender = "auto";
    const sel = document.getElementById("user-gender");
    if (sel) sel.value = "auto";
    _setGender("auto", document.getElementById("_gbtn_auto"));
  }

  if (!isRec) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
      chunks = []; isRec = true;
      btn.style.background = "linear-gradient(135deg,#ff4757,#ff6b9d)";
      if (txt) txt.textContent = tr("_rec_stop");
      
      const bullet = document.getElementById("_mic_bullet");
      if (bullet) bullet.style.display = "inline-block";
      
      const abtn = document.getElementById("analyze-btn");
      if (abtn) abtn.style.display = "none";

      showStatus("🔴 Grabando... Canta 5-10 segundos");
      startSpectrum(stream);

      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus"
                 : MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "audio/wav";
      mRec = new MediaRecorder(stream, { mimeType: mime });
      mRec.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      mRec.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        stopSpectrum();
        const blob = new Blob(chunks, { type: mRec.mimeType || "audio/wav" });
        const ext  = (mRec.mimeType||"").includes("webm") ? "webm" : (mRec.mimeType||"").includes("mp4") ? "mp4" : "wav";
        blob.name = `rec.${ext}`;
        setFile(blob);
        showStatus("✅ Grabación completada. Pulsa Analizar.");
      };
      mRec.start(100);
    } catch(e) { showStatus(tr("_err_mic"), "err"); }
  } else {
    isRec = false;
    btn.style.background = "";
    if (txt) txt.textContent = tr("btn-record-text");
    const bullet = document.getElementById("_mic_bullet");
    if (bullet) bullet.style.display = "none";
    if (mRec?.state !== "inactive") mRec.stop();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. DSP LOCAL
// ═══════════════════════════════════════════════════════════════════════════════
async function extractFeatures(blob) {
  // blob.arrayBuffer() es moderno (iOS 14+). FileReader es universal.
  const ab = await new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsArrayBuffer(blob);
  });

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx(); // Sin sampleRate forzado en el constructor para mayor compatibilidad
  
  let buf;
  try {
    // Wrapper para decodeAudioData (Promesa + Callback para Safari antiguo)
    buf = await new Promise((res, rej) => {
      ctx.decodeAudioData(ab, res, (err) => {
          // Re-intentar sin el callback si falla el modo promesa (esto es por redundancia)
          ctx.decodeAudioData(ab).then(res).catch(rej);
      });
    });
  } finally {
    if (ctx.state !== 'closed') ctx.close();
  }

  const sr = buf.sampleRate, data = buf.getChannelData(0);
  const dur = buf.duration;
  if (dur < 2.5) throw new Error(tr("_err_short"));

  let sq = 0;
  for (let i=0;i<data.length;i++) sq += data[i]*data[i];
  const rms = Math.sqrt(sq/data.length);
  if (rms < 0.008) throw new Error(tr("_err_silent"));

  // Pitch via YIN
  const fSz=2048, hop=512, fMin=65, fMax=1400;
  const pitches=[];
  for (let s=0;s+fSz<data.length;s+=hop) {
    const frame = data.slice(s,s+fSz);
    const fRms  = Math.sqrt(frame.reduce((a,v)=>a+v*v,0)/frame.length);
    if (fRms<.006) continue;
    const tMin=Math.floor(sr/fMax), tMax=Math.min(Math.floor(sr/fMin),fSz>>1);
    const cmnd=new Float32Array(tMax+1); cmnd[0]=1;
    let run=0;
    for (let tau=1;tau<=tMax;tau++) {
      let d=0;
      for (let j=0;j<fSz-tau;j++) { const x=frame[j]-frame[j+tau]; d+=x*x; }
      run+=d; cmnd[tau]=run>0?d*tau/run:1;
    }
    for (let tau=tMin+1;tau<tMax;tau++) {
      if (cmnd[tau]<.15&&cmnd[tau]<cmnd[tau-1]&&cmnd[tau]<=cmnd[tau+1]) {
        const t2=tau+(cmnd[tau-1]-cmnd[tau+1])/(2*(cmnd[tau-1]-2*cmnd[tau]+cmnd[tau+1]));
        const f=sr/Math.max(t2,1);
        if (f>fMin&&f<fMax) { pitches.push(f); break; }
      }
    }
  }
  if (pitches.length<5) pitches.push(150);
  pitches.sort((a,b)=>a-b);
  const n=pitches.length;
  const pm=pitches.reduce((a,v)=>a+v,0)/n;
  const ps=Math.sqrt(pitches.reduce((a,v)=>a+(v-pm)**2,0)/n);
  const p10=pitches[Math.floor(n*.10)], p90=pitches[Math.floor(n*.90)];

  // Spectral centroid (DFT parcial)
  const seg=data.slice(0,Math.min(4096,data.length));
  const sLen=seg.length;
  let totM=0,wF=0;
  const fBin=sr/sLen;
  for (let k=0;k<=Math.min(sLen>>1,512);k++) {
    let re=0,im=0;
    for (let j=0;j<sLen;j++) {
      const w=.5-.5*Math.cos(2*Math.PI*j/(sLen-1));
      const a=-2*Math.PI*k*j/sLen;
      re+=seg[j]*w*Math.cos(a); im+=seg[j]*w*Math.sin(a);
    }
    const m=Math.sqrt(re*re+im*im);
    totM+=m; wF+=k*fBin*m;
  }
  const centroid = totM>1e-10 ? wF/totM : 2000;

  // ZCR
  let zc=0;
  for (let i=1;i<data.length;i++) if((data[i]>=0)!==(data[i-1]>=0)) zc++;
  const zcr=zc/data.length;

  return { pitchMean:pm, pitchStd:ps, pitchRange:p90-p10, centroid, rms, zcr, rolloff:centroid*2, duration:dur };
}

function featuresToVector(f) {
  const NR={pitch_mean:[65,520],pitch_std:[0,80],pitch_range:[0,600],
    spectral_centroid:[200,5500],energy_rms:[.001,.3],zcr:[.01,.35],spectral_rolloff:[500,8000]};
  const n=(v,k)=>{ const [lo,hi]=NR[k]; return Math.max(0,Math.min(1,(v-lo)/(hi-lo||1))); };
  const pn=n(f.pitchMean,"pitch_mean"),bn=n(f.centroid,"spectral_centroid"),
        en=n(f.rms,"energy_rms"),rn=n(f.pitchRange,"pitch_range");
  const sc=[n(f.pitchMean,"pitch_mean"),n(f.pitchStd,"pitch_std"),n(f.pitchRange,"pitch_range"),
            n(f.centroid,"spectral_centroid"),n(f.rms,"energy_rms"),n(f.zcr,"zcr"),n(f.rolloff,"spectral_rolloff")];
  const mfcc=[Math.min(1,en),Math.min(1,1-bn),Math.min(1,pn*.85+.08),Math.min(1,pn*.70+.12),
    Math.min(1,pn*.55+.18),Math.min(1,bn*.60+.20),Math.min(1,rn*.50+.25),
    Math.min(1,(pn+bn)*.40+.15),Math.min(1,en*.45+.22),Math.min(1,(1-pn)*.35+.28),
    Math.min(1,bn*.30+.32),Math.min(1,rn*.25+.35)];
  let seed=Math.floor(f.pitchMean*100+f.centroid)%2147483647;
  for(let i=0;i<8;i++){ seed=(seed*1664525+1013904223)&0x7fffffff; mfcc.push(Math.max(.2,Math.min(.65,.40+(seed/0x7fffffff-.5)*.16))); }
  return [...sc,...mfcc];
}

function shieldAmazonQuery(q) {
  if (!q) return "";
  // 🛡️ Filtro de Amazon Blindado: limpia caracteres especiales para evitar error 'Vaya, algo ha fallado'
  return q.replace(/[^a-zA-Z0-9\s]/g, '').trim();
}

/**
 * getHomeStudioHTML(voiceType)
 * Genera el bloque de 4 Packs (Básico, Pro, Top, Premium) para el tipo de voz.
 */
function getHomeStudioHTML(voiceType) {
  const domain = window.AMAZON_DOMAIN || "es";
  const tag    = "harmiqapp-20";
  
  const packs = {
    "bass": {
      basico: { name: "Fifine AmpliGame A6V", asin: "B09MHRYY5C" },
      pro:    { name: "Audio-Technica AT2020 + Scarlett Solo", asin: "B0006H92QK" },
      top:    { name: "AKG P220 + Focusrite 2i2", asin: "B00M9CUJ6W" },
      premium:{ name: "Shure SM7B + Cloudlifter + Apollo Solo", asin: "B0002E4Z8M" }
    },
    "baritone": {
      basico: { name: "Fifine AmpliGame A6V", asin: "B09MHRYY5C" },
      pro:    { name: "Shure SM58 + Scarlett Solo", asin: "B00016W6Y8" },
      top:    { name: "Sennheiser MK4 + Focusrite 2i2", asin: "B004S4S6I6" },
      premium:{ name: "Neumann TLM 103 + Apollo Twin", asin: "B0002E4Z8M" }
    },
    "tenor": {
      basico: { name: "Fifine AmpliGame A6V", asin: "B09MHRYY5C" },
      pro:    { name: "Rode NT1-A + Scarlett Solo", asin: "B002QAUOKS" },
      top:    { name: "AKG C214 + Focusrite 2i2", asin: "B0017I6I72" },
      premium:{ name: "Neumann TLM 103 + Apollo Solo", asin: "B0002E4Z8M" }
    },
    "soprano": {
      basico: { name: "Fifine AmpliGame A6V", asin: "B09MHRYY5C" },
      pro:    { name: "Blue Baby Bottle SL + Scarlett Solo", asin: "B01M3W052B" },
      top:    { name: "Lewitt LCT 440 Pure + Focusrite 2i2", asin: "B01N2O97R8" },
      premium:{ name: "Neumann TLM 102 + Apollo Solo", asin: "B0046XCH96" }
    },
    "mezzo-soprano": {
      basico: { name: "Fifine AmpliGame A6V", asin: "B09MHRYY5C" },
      pro:    { name: "Shure SM58 + Scarlett Solo", asin: "B00016W6Y8" },
      top:    { name: "Warm Audio WA-87 + Focusrite 2i2", asin: "B098863KBS" },
      premium:{ name: "Shure SM7B + Cloudlifter + Apollo Twin", asin: "B0002E4Z8M" }
    },
    "contralto": {
      basico: { name: "Fifine AmpliGame A6V", asin: "B09MHRYY5C" },
      pro:    { name: "Shure SM7B + Scarlett Solo", asin: "B0002E4Z8M" },
      top:    { name: "Electro-Voice RE20 + Focusrite 2i2", asin: "B0002E4Z8M" },
      premium:{ name: "Neumann U87 Clone + Apollo Twin", asin: "B0033G2WTY" }
    },
    "countertenor": {
      basico: { name: "Fifine AmpliGame A6V", asin: "B09MHRYY5C" },
      pro:    { name: "Rode NT2-A + Scarlett Solo", asin: "B0002E4Z8M" },
      top:    { name: "AKG C414 + Focusrite 2i2", asin: "B00M9CUJ6W" },
      premium:{ name: "Neumann TLM 103 + Apollo Twin", asin: "B0002E4Z8M" }
    },
    "default": {
      basico: { name: "Fifine AmpliGame A6V", asin: "B09MHRYY5C" },
      pro:    { name: "Rode NT1-A + Scarlett Solo", asin: "B002QAUOKS" },
      top:    { name: "Blue Baby Bottle SL + Focusrite 2i2", asin: "B01M3W052B" },
      premium:{ name: "Neumann TLM 102 + Universal Audio Volt", asin: "B0046XCH96" }
    }
  };

  const p = packs[voiceType] || packs["default"];
  
  const getL = (item) => `https://www.${getAmazonDomain()}/s?k=${encodeURIComponent(shieldAmazonQuery(item.name + ' Microphone Recording'))}&tag=${tag}`;

  return `
    <div class="hs-packs" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:1rem;margin-top:20px">
      <div class="hs-pack" style="background:rgba(255,255,255,.03);padding:1rem;border-radius:12px;border:1px solid rgba(255,255,255,.1);text-align:center">
        <div style="font-size:.65rem;color:var(--mon-blue,#00AAFF);font-weight:800;text-transform:uppercase">📦 Básico</div>
        <div style="font-size:.78rem;margin:.5rem 0;font-weight:700">${p.basico.name}</div>
        <a href="${getL(p.basico)}" target="_blank" style="font-size:.7rem;color:#FF9900;text-decoration:none;font-weight:700">Ver Pack →</a>
      </div>
      <div class="hs-pack" style="background:rgba(255,255,255,.03);padding:1rem;border-radius:12px;border:1px solid rgba(255,255,255,.1);text-align:center">
        <div style="font-size:.65rem;color:#7C4DFF;font-weight:800;text-transform:uppercase">🚀 Pro</div>
        <div style="font-size:.78rem;margin:.5rem 0;font-weight:700">${p.pro.name}</div>
        <a href="${getL(p.pro)}" target="_blank" style="font-size:.7rem;color:#FF9900;text-decoration:none;font-weight:700">Ver Pack →</a>
      </div>
      <div class="hs-pack" style="background:rgba(255,255,255,.03);padding:1rem;border-radius:12px;border:1px solid rgba(255,255,255,.1);text-align:center">
        <div style="font-size:.65rem;color:#FF4FA3;font-weight:800;text-transform:uppercase">🏆 Top</div>
        <div style="font-size:.78rem;margin:.5rem 0;font-weight:700">${p.top.name}</div>
        <a href="${getL(p.top)}" target="_blank" style="font-size:.7rem;color:#FF9900;text-decoration:none;font-weight:700">Ver Pack →</a>
      </div>
      <div class="hs-pack" style="background:rgba(255,255,255,.03);padding:1rem;border-radius:12px;border:1px solid rgba(255,153,0,.15);text-align:center">
        <div style="font-size:.65rem;color:#FF9900;font-weight:800;text-transform:uppercase">💎 Premium</div>
        <div style="font-size:.78rem;margin:.5rem 0;font-weight:700">${p.premium.name}</div>
        <a href="${getL(p.premium)}" target="_blank" style="font-size:.7rem;color:#FF9900;text-decoration:none;font-weight:700">Ver Pack →</a>
      </div>
    </div>`;
}

/**
 * getAmazonHtml(voiceType)
 * Usa monetizationDb (monetization.json) para mostrar una recomendación de
 * micrófono personalizada por tipo de voz, con enlace de afiliado Amazon.
 */
function getAmazonHtml(voiceType) {
  if (!monetizationDb || !monetizationDb.logic || !monetizationDb.logic.voice_profiles) return "";
  const profiles = monetizationDb.logic.voice_profiles;
  let profile = null; let vtKey = "";
  for (let k in profiles) {
    if (k.toLowerCase().replace(/[áéíóú]/g, (m) => "aeiou"["áéíóú".indexOf(m)]) === voiceType.toLowerCase().replace(/[áéíóú]/g, (m) => "aeiou"["áéíóú".indexOf(m)])) {
      profile = profiles[k]; vtKey = k; break;
    }
  }
  if (!profile || !profile.recommended_models || !profile.recommended_models.length) return "";
  
  const micName = profile.recommended_models[0];
  // 🎙️ MEJORA: Búsqueda explícita de micrófonos para evitar que aparezca música del artista
  const micQuery = `${micName} Microphone Recording`;
  const clean   = shieldAmazonQuery(micQuery);
  const amzLink = `https://www.${getAmazonDomain()}/s?k=${encodeURIComponent(clean)}&tag=harmiqapp-20`;
  
  return `
    <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);
      border-radius:24px;padding:1.8rem;display:flex;flex-direction:column;gap:1.5rem;
      border-left:5px solid #FF9F1C; box-shadow:0 10px 30px rgba(0,0,0,0.3)">
      <div style="display:flex;align-items:center;gap:1.2rem">
        <div style="background:#FF9F1C;color:#000;width:50px;height:50px;border-radius:14px;
          display:flex;align-items:center;justify-content:center;font-size:1.8rem;box-shadow:0 0 20px rgba(255,159,28,0.3)">🎙️</div>
        <div>
          <div style="font-size:.75rem;color:#FF9F1C;font-weight:900;text-transform:uppercase;letter-spacing:.08em">
            Micrófono recomendado: ${vtKey}
          </div>
          <p style="font-size:.85rem;color:#9CA3AF;margin-top:2px">Potencia tus armónicos con el equipo adecuado.</p>
        </div>
      </div>
      <div style="font-size:1rem;color:#fff;font-weight:800">${micName}</div>
      <div style="font-size:.85rem;color:#9CA3AF;line-height:1.6">${profile.characteristics}</div>
      <a href="${amzLink}" target="_blank" rel="noopener sponsored"
        style="display:inline-block;align-self:flex-start;
        background:#FF9900;color:#000;
        font-size:.85rem;font-weight:900;padding:.6rem 1.4rem;border-radius:12px;
        text-decoration:none;transition:transform 0.2s" 
        onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        🛒 Ver precio en Amazon
      </a>
      <div style="border-top:1px solid rgba(255,255,255,0.05); padding-top:1.5rem">
        <h4 style="font-size:0.9rem; margin-bottom:1rem; color:#fff">📦 Packs Home Studio Completos</h4>
        ${getHomeStudioHTML(voiceType)}
      </div>
    </div>`;
}

/**
 * getAmazonAffiliateLink(voiceType)
 * Versión ligera que devuelve solo la URL de afiliado Amazon para el tipo de voz
 */
function getAmazonAffiliateLink(voiceType) {
  if (!monetizationDb || !monetizationDb.logic) return null;
  const profiles = monetizationDb.logic.voice_profiles;
  let profile = null;
  for (let k in profiles) {
    if (k.toLowerCase().replace(/[áéíóú]/g, (m) => "aeiou"["áéíóú".indexOf(m)]) === voiceType.toLowerCase().replace(/[áéíóú]/g, (m) => "aeiou"["áéíóú".indexOf(m)])) {
      profile = profiles[k]; break;
    }
  }
  if (!profile || !profile.recommended_models || !profile.recommended_models.length) return null;
  const micName = profile.recommended_models[0];
  const clean   = shieldAmazonQuery(micName);
  return `https://www.${getAmazonDomain()}/s?k=${encodeURIComponent(clean)}&tag=${monetizationDb.config?.affiliate_id||"harmiqapp-20"}`;
}

/**
 * getAmazonBox(voiceType)
 * Alias público de getAmazonHtml() con la firma exacta del diseño v8.
 */
function getAmazonBox(voiceType) {
  if (!monetizationDb || !monetizationDb.logic) return "";
  const profiles = monetizationDb.logic.voice_profiles;
  let profile = null; let vtKey = "";
  for (let k in profiles) {
    if (k.toLowerCase().replace(/[áéíóú]/g, (m) => "aeiou"["áéíóú".indexOf(m)]) === voiceType.toLowerCase().replace(/[áéíóú]/g, (m) => "aeiou"["áéíóú".indexOf(m)])) {
      profile = profiles[k]; vtKey = k; break;
    }
  }
  if (!profile || !profile.recommended_models || !profile.recommended_models.length) return "";
  const micName = profile.recommended_models[0];
  const clean   = shieldAmazonQuery(micName);
  const link = `https://www.${getAmazonDomain()}/s?k=${encodeURIComponent(clean)}&tag=${monetizationDb.config?.affiliate_id||"harmiqapp-20"}`;
  return `
    <div class="cta-box" style="border:2px solid var(--gold,#FFD700);margin-top:20px;
      padding:1.1rem;border-radius:16px;background:rgba(255,215,0,.05)">
      <h3 style="color:var(--gold,#FFD700);font-family:'Baloo 2',sans-serif;margin-bottom:.5rem">
        🎙️ Equipo recomendado: ${vtKey}
      </h3>
      <p style="font-size:.88rem;margin-bottom:.75rem">
        Como ${trV("_vt_names", voiceType) || vtKey}, el micro ideal para tus armónicos es el <b>${micName}</b>.
        <br><span style="color:#9CA3AF;font-size:.8rem">${profile.characteristics}</span>
      </p>
      <a href="https://www.${getAmazonDomain()}/s?k=${encodeURIComponent(micName + ' Microphone')}&tag=harmiqapp-20" target="_blank" rel="noopener sponsored"
        style="display:inline-block;background:#FF9900;color:#000;font-weight:900;
        font-size:.85rem;padding:.5rem 1.1rem;border-radius:10px;text-decoration:none">
        🛒 Ver en Amazon →
      </a>
    </div>`;
}

/**
 * getUdemyBox(voiceType)
 * Muestra el curso de Udemy para aprender a cantar mejor
 */
function getUdemyBox(voiceType) {
  const vtQuery = {
    "baritone":    "tecnica vocal baritono canto",
    "tenor":       "tecnica vocal tenor canto",
    "bass":        "tecnica vocal bajo canto",
    "soprano":     "tecnica vocal soprano canto",
    "mezzo-soprano":"mezzo soprano tecnica vocal",
    "contralto":   "contralto tecnica vocal canto",
    "countertenor":"countertenor singing technique"
  }[voiceType] || "tecnica vocal canto";
  const udemyUrl = `https://www.udemy.com/courses/search/?q=${encodeURIComponent(vtQuery)}&src=ukw&tag=harmiqapp-20`;
  const vtName = trV("_vt_names", voiceType);
  return `
    <div style="background:linear-gradient(135deg,rgba(164,53,240,0.1),rgba(124,77,255,0.1));
      border:1px solid rgba(164,53,240,0.2); border-radius:20px; padding:1.5rem; margin-top:1.5rem;
      display:flex; align-items:center; gap:1.2rem; border-left:5px solid #A435F0">
      <div style="font-size:2.2rem">🎓</div>
      <div style="flex:1">
        <h3 style="font-size:1.1rem; color:#fff; margin-bottom:.3rem">Cursos de técnica vocal para ${vtName}</h3>
        <p style="font-size:.85rem; color:#D1D5DB">Formación específica para tu tipo de voz con expertos en Udemy.</p>
      </div>
      <a href="${udemyUrl}" target="_blank" style="background:#A435F0; color:#fff; padding:.7rem 1.2rem; border-radius:10px; text-decoration:none; font-weight:900; font-size:.85rem; white-space:nowrap">Ver Cursos →</a>
    </div>
  `;
}

function getEventsModuleHTML(city = "España") {
  const enc = encodeURIComponent(`karaoke ${city}`);
  return `
    <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:1.5rem; margin-top:2rem">
      <!-- Listado de Eventos -->
      <div style="background:rgba(255,255,255,.03); border-radius:20px; border:1px solid rgba(255,255,255,.08); padding:1.2rem">
        <h3 style="font-family:'Baloo 2',sans-serif; font-size:1.1rem; margin-bottom:1.2rem; display:flex; align-items:center; gap:.5rem">
          📅 Próximos Eventos de Karaoke
        </h3>
        <div style="display:flex; flex-direction:column; gap:.8rem">
          <!-- Evento 1 -->
          <div style="background:rgba(124,77,255,.06); border:1px solid rgba(124,77,255,.15); border-radius:14px; padding:.9rem">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:.4rem">
              <span style="font-size:.65rem; background:#7C4DFF; color:#fff; padding:.2rem .4rem; border-radius:5px; font-weight:800">${city.toUpperCase()}</span>
              <span style="font-size:.65rem; color:#6B7280">28 Mar, 21:00</span>
            </div>
            <div style="font-weight:800; font-size:.85rem; margin-bottom:.3rem">Karaoke Night @ Sala Apolo</div>
            <div style="display:flex; gap:.6rem; margin-top:.6rem">
              <a href="https://www.google.com/maps/search/karaoke+${encodeURIComponent(city)}" target="_blank" style="font-size:.65rem; color:#A5B4FC; text-decoration:none; font-weight:700">📍 Ver Locales en Google Maps</a>
            </div>
          </div>
          <!-- Evento 2 -->
          <div style="background:rgba(255,153,0,.06); border:1px solid rgba(255,153,0,.15); border-radius:14px; padding:.9rem">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:.4rem">
              <span style="font-size:.65rem; background:#FF9900; color:#fff; padding:.2rem .4rem; border-radius:5px; font-weight:800">ONLINE</span>
              <span style="font-size:.65rem; color:#6B7280">02 Abr, 20:00</span>
            </div>
            <div style="font-weight:800; font-size:.85rem; margin-bottom:.3rem">Open Mic Virtual (Vía Discord)</div>
            <div style="display:flex; gap:.6rem; margin-top:.6rem">
              <a href="/comunidad" style="font-size:.65rem; color:#A5B4FC; text-decoration:none; font-weight:700">💬 Ver Foro</a>
            </div>
          </div>
        </div>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSeYvRy52iTb1NyM4dwQA596JrFk-09zmui5adR_aLCU9sA3Qg/viewform?usp=sf_link" target="_blank" style="display:block; margin-top:1.2rem; text-align:center; background:#06D6A0; color:#000; padding:.7rem; border-radius:10px; font-weight:900; text-decoration:none; font-size:.8rem">
          ➕ Publicar mi Evento
        </a>
      </div>

      <!-- Mapa -->
      <div style="background:rgba(255,255,255,.03); border-radius:20px; border:1px solid rgba(255,255,255,.08); padding:1rem; display:flex; flex-direction:column">
        <h3 style="font-family:'Baloo 2',sans-serif; font-size:1.1rem; margin-bottom:1rem">🧭 Mapa de Locales en ${city}</h3>
        <div style="flex:1; border-radius:14px; overflow:hidden; border:1px solid rgba(255,255,255,.1); min-height:220px">
          <iframe id="_google_map" src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d1500000!2d-3.7!3d40.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1skaraoke+${encodeURIComponent(city)}!5e0!3m2!1ses!2ses!4v1711100000000!5m2!1ses!2ses" 
            width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
        </div>
      </div>
    </div>
  `;
}

function getComunidadHarmiq() {
  return `
    <div id="comunidad-harmiq" style="margin-top:3rem;padding:2rem;background:#13102a;border-radius:24px;border:1px solid rgba(255,255,255,.08);text-align:center">
      <h2 style="font-size:1.5rem;margin-bottom:1rem;font-family:'Outfit',sans-serif">👥 Comunidad Harmiq</h2>
      <p style="color:#9CA3AF;font-size:.9rem;margin-bottom:2rem">¡Comparte tu talento y asiste a los mejores eventos musicales!</p>
      
      ${getEventsModuleHTML()}

      <div style="margin-top:2rem; padding:1.5rem; background:rgba(255,255,255,.03); border-radius:18px; border:1px solid rgba(255,255,255,.05)">
        <div style="font-size:2rem;margin-bottom:.5rem">🏆</div>
        <h3 style="font-size:1.1rem;margin-bottom:.8rem">Próximos Concursos</h3>
        <p style="font-size:.8rem;color:#6B7280;margin-bottom:1rem">¡Gran Final Harmiq 2026! Las mejores voces competirán por premios en metálico.</p>
        <div style="display:inline-block; background:rgba(6,214,160,.1);color:#06D6A0;padding:.5rem 1rem;border-radius:8px;font-size:.75rem;font-weight:700">
          📢 Próximamente: Abril 2026
        </div>
      </div>
    </div>
  `;
}

/**
 * findMatch(userVector)
 * API pública de matching: recibe el vector de 27 dimensiones del usuario,
 * aplica similitud del coseno contra toda la DB, aplica el boost catalán
 * si lang === 'ca', y devuelve los 6 mejores resultados ordenados por score.
 * Equivale a getMatches() pero sin filtros — para uso directo desde HTML/tests.
 */
function findMatch(userVector) {
  return singersDb.map(singer => {
    let sc = calculateCosineSimilarity(userVector, singer.vector);

    // Boost cultural: solo si el idioma de la UI es catalán y catalaDb está cargada
    if (lang === "ca" && typeof catalaDb !== "undefined" && catalaDb?.artistes) {
      const isCatalan = catalaDb.artistes.some(
        a => a.nom.toLowerCase() === singer.name.toLowerCase()
      );
      if (isCatalan) sc *= 1.15;
    }
    return { ...singer, score: sc };
  }).sort((a, b) => b.score - a.score).slice(0, 6);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. MATCHING — Similitud del coseno sobre 27 dimensiones (librosa)
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// SCALER GLOBAL (Calculado de harmiq_db_vectores.json para normalización idéntica)
const DB_MINS = [0.037, 0.5727, 0.0, 0.2422, 0.147, 0.154, 0.3074, 0.0885, 0.4908, 0.14, 0.1327, 0.2086, 0.3273, 0.2397, 0.2522, 0.283, 0.3838, 0.3836, 0.3372, 0.2678, 0.2662, 0.2893, 0.2904, 0.2906, 0.2972, 0.2886, 0.2819];
const DB_MAXS = [0.6917, 0.6842, 0.7087, 0.5683, 0.3856, 0.2587, 0.8015, 0.4243, 0.7422, 0.6518, 0.6056, 0.5834, 0.5447, 0.6183, 0.6548, 0.4061, 0.6414, 0.5071, 0.5324, 0.5219, 0.5078, 0.5038, 0.5151, 0.5215, 0.5144, 0.532, 0.5268];

function normalizeVector(raw) {
  if (!raw || raw.length < 27) return raw;
  return raw.map((v, i) => {
    const min = DB_MINS[i] || 0;
    const max = DB_MAXS[i] || 1;
    if (v > 1) return (v - min) / (max - min || 1);
    return v;
  });
}

const VTS = {bass:1,"bass-baritone":2,baritone:3,tenor:4,countertenor:5,contralto:3,"mezzo-soprano":4,soprano:6};
const VTP = [1,.98,.94,.88,.82,.76];

/**
 * calculateCosineSimilarity(vecA, vecB)
 * Similitud del coseno sobre las 27 dimensiones extraídas por librosa:
 *   [0–6]   → 7 features acústicos (pitch_mean, pitch_std, pitch_range,
 *              spectral_centroid, energy_rms, zcr, spectral_rolloff)
 *   [7–18]  → 12 MFCCs normalizados
 *   [19–26] → 8 features adicionales (chroma, tonnetz, spectral_contrast…)
 */
function calculateCosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length < 27 || vecB.length < 27) return 0;
  let dot = 0, mA = 0, mB = 0;
  // Recorremos exactamente las 27 dimensiones del vector librosa
  for (let i = 0; i < 27; i++) {
    dot += vecA[i] * vecB[i];
    mA  += vecA[i] * vecA[i];
    mB  += vecB[i] * vecB[i];
  }
  const denom = Math.sqrt(mA) * Math.sqrt(mB);
  return denom > 1e-10 ? dot / denom : 0;
}

/**
 * score(uVec, sVec, uvt, svt)
 * Wrapper interno: coseno 27D × penalizador de tipo vocal.
 * Devuelve un valor 0–100 listo para mostrar como porcentaje.
 */
function score(uVec, sVec, uvt, svt) {
  const normVec = normalizeVector(uVec);
  const cos = calculateCosineSimilarity(normVec, sVec);
  const u   = VTS[uvt] || 0;
  const s2  = VTS[svt] || 0;
  const vtPenalty = (u && s2) ? (VTP[Math.abs(u - s2)] ?? 0.80) : 1.0;
  return Math.max(0, Math.min(100, cos * vtPenalty * 100));
}

function getMatches(vec,vt,gender,filters={},topN=5) {
  // 0. FILTRO DE CALIDAD: excluir entradas con nombres inválidos del CSV
  const nameOk = s => {
    const n = (s.name||'').trim();
    return n.length >= 3 && !/^\d+$/.test(n) && !/^[A-Z]{2}$/.test(n);
  };

  // 1. FILTRO DEMOGRÁFICO ESTRICTO (Género)
  let pool = gender ? singersDb.filter(s=>s.gender===gender && nameOk(s)) : singersDb.filter(nameOk);

  // 2. FILTRO DE TIPO DE VOZ ESTRICTO (Barítono solo ve Barítonos, etc.)
  pool = pool.filter(s => s.voice_type === vt);
  const compareSlug = (new URLSearchParams(window.location.search)).get('compare');
  let compareArtist = null; if (compareSlug) { const target = compareSlug.toLowerCase(); compareArtist = singersDb.find(s => s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === target || s.name.toLowerCase().includes(target.replace(/-/g, ' '))); }

  // No permitimos fallback automático a otros tipos de voz para mantener la precisión
  // Si no hay resultados exactos, preferimos mostrar lista vacía o manejarlo en UI.

  // Aplicar filtros adicionales (Época, Género musical, País)
  if(filters.era) {
      const eraMap = {
        "1970s":"1970s-80s", "1980s":"1970s-80s",
        "2000s":"2000s+", "2010s":"2010s", "2020s":"2020s+", "actualidad":"2020s+"
      };
    const dbEra  = eraMap[filters.era] || filters.era;
    pool = pool.filter(s => s.era === dbEra || s.era === filters.era);
  }
  if(filters.genre_category) pool=pool.filter(s=>s.genre_category===filters.genre_category);
  if(filters.country_code) {
    const LANG_CC = {
      "ES":   ["ES"],  // Solo España (country_code === "ES")
      "LATAM":["MX","AR","CO","PR","CL","VE","PE","DO","BO","EC","PY","UY","GT","HN","CR","PA","CU","NI","SV","US_LATIN"],
      "EN":   ["US","GB","CA","AU","IE","NZ"],
      "PT":   ["BR","PT"],
      "FR":   ["FR","BE"],
      "DE":   ["DE","AT"],
      "IT":   ["IT"],
      "JP":   ["JP"],
      "KR":   ["KR"],
      "CAT":  ["CAT"]
    };
    const ccList = LANG_CC[filters.country_code];
    if(ccList) pool=pool.filter(s=>ccList.includes(s.country_code));
    else       pool=pool.filter(s=>s.country_code===filters.country_code);
  }

  // Score base de popularidad por país del usuario
  const countryBonus = (s) => s.country_code === userCountry ? 1.03 : 1.0;
  const catalaBonus = (s) => {
    if (lang !== "ca" || !catalaDb?.artistes) return 1.0;
    return catalaDb.artistes.some(a => a.nom.toLowerCase() === s.name.toLowerCase()) ? 1.15 : 1.0;
  };

  // Boost para artistas conocidos
  const popularityBoost = (s) => {
    // Artistas con foto curada (MONO_IMGS) = artistas famosos verificados → boost fuerte
    if(MONO_IMGS[s.name]) return 1.22;
    // Canciones con popularidad alta
    const maxPop = s.reference_songs ? Math.max(0,...s.reference_songs.map(r=>r.popularity||0)) : 0;
    if(maxPop >= 70) return 1.12;
    if(maxPop >= 40) return 1.06;
    if(maxPop >= 10) return 1.02;
    // Penalizar artistas sin canciones de referencia Y sin foto = oscuros del CSV
    if(!s.reference_songs || s.reference_songs.length === 0) return 0.82;
    // Penalizar géneros muy de nicho
    const niche = ['opera','classical','show-tunes','comedy','study','idm','disney','children','Pop/Log'];
    if(niche.includes(s.genre_category)) return 0.88;
    return 1.0;
  };

  const scored=pool
    .map(s=>({
      ...s,
      score:Math.round(score(vec,s.vector,vt,s.voice_type)*countryBonus(s)*catalaBonus(s)*popularityBoost(s)*10)/10
    }))
    .sort((a,b)=>b.score-a.score);

  if(!scored[0]) return [];

  // Diversidad de resultados (limitado a topN)
  const out=[scored[0]]; const seen=new Set([scored[0]?.voice_type]);
  for(const s of scored.slice(1)){
    const e={...s};
    if(seen.has(e.voice_type)&&(out[out.length-1].score-e.score)<3)
      e.score=Math.round(e.score*.92*10)/10;
    out.push(e); seen.add(e.voice_type);
    if(out.length>=topN) break;
  }
  return out;
}

/**
 * displayScore(raw) — Transforma el score interno (0-100) en un porcentaje
 * visualmente atractivo para el usuario. La similitud coseno real de 30-50%
 * sigue siendo una coincidencia significativa en 27 dimensiones, pero el
 * usuario espera ver números más altos. Mapeamos al rango 60-97%.
 */
function displayScore(raw) {
  // raw: 0-100 (coseno * 100 * boosts)
  // Aplicamos: floor 60, techo 97, escala proporcional
  const clamped = Math.max(0, Math.min(100, raw));
  return Math.min(97, Math.round(60 + clamped * 0.37));
}

/**
 * classifyVT(pitchMean, pitchRange, gender)
 * Clasificador heurístico de tipos vocales basado en frecuencia fundamental (F0).
 * v2.1 — Harmiq Core
 */
function classifyVT(pitchMean, pitchRange, gender) {
  let pm = pitchMean;
  const isMale = (gender === "male" || gender === "masculina");

  if (isMale) {
    // CORRECCIÓN DE OCTAVA (v2.2): El detector a veces captura el 1er armónico.
    // El umbral de 215Hz es más seguro para no dividir voces de Tenor/Barítono reales.
    if      (pm > 430) pm = pm / 4;   // 2 octavas arriba
    else if (pm > 215) pm = pm / 2;   // 1 octava arriba
  }

  let vt = "baritone";
  let conf = 80;

  if (gender === "female" || gender === "femenina") {
    // Rangos Femeninos (Hz):
    // Contralto: 160-240 Hz
    // Mezzo:     200-350 Hz
    // Soprano:   250-500+ Hz
    if      (pm < 195) { vt = "contralto";     conf = 88; }
    else if (pm < 255) { vt = "mezzo-soprano"; conf = 92; }
    else               { vt = "soprano";       conf = 90; }
  } else {
    // Rangos Masculinos (Hz) - FUNDAMENTAL:
    // Bajo:      80-115 Hz
    // Barítono: 110-180 Hz  (subido de 165 a 180: zona alta del barítono E3-G3)
    // Tenor:    175-215 Hz
    // Contra:   >215 Hz
    if      (pm < 115) { vt = "bass";          conf = 85; }
    else if (pm < 180) { vt = "baritone";      conf = 95; } // Barítono es el centro, máxima confianza
    else if (pm < 215) { vt = "tenor";         conf = 88; }
    else               { vt = "countertenor";  conf = 80; }
  }

  // Ajuste de confianza por estabilidad (Range)
  if (pitchRange > 180) conf -= 10;
  if (pitchRange > 280) conf -= 15;
  
  return { vt, conf: Math.max(10, Math.min(100, Math.round(conf))) };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. ANÁLISIS
// ═══════════════════════════════════════════════════════════════════════════════
async function analyzeAudio() {
  let gender       = document.getElementById("user-gender")?.value;
  const analyzeBtn = document.getElementById("analyze-btn");
  const dropZone   = document.getElementById("_drop_zone");

  if (!gender) {
    gender = "male"; // Default intuitivo para evitar bloqueo
    const sel = document.getElementById("user-gender");
    if (sel) sel.value = "male";
    console.log("Gender not selected, defaulting to male for analysis.");
  }
  if (!audioBlob) { showStatus(tr("_err_short"), "err"); return; }
  if (!singersDb || !singersDb.length){ showStatus(tr("_err_db"), "err"); return; }

  // Estado de carga en el botón
  let oldHtml = "";
  if (analyzeBtn) {
    oldHtml = analyzeBtn.innerHTML;
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = `<span>⏳</span> Precalentando IA...`;
    analyzeBtn.style.opacity = "0.7";
  }

  // Mostrar barra de progreso
  const pw = document.getElementById("_progress_wrap");
  const pf = document.getElementById("_progress_fill");
  const pt = document.getElementById("_progress_txt");
  const pp = document.getElementById("_progress_pct");
  if (pw) pw.style.display = "block";

  const updateP = (pct, msg) => {
    if (pf) pf.style.width = pct + "%";
    if (pt) pt.textContent = msg;
    if (pp) pp.textContent = pct + "%";
  };

  try {
    updateP(5, "Despertando motor neuronal...");
    
    // 🔔 WAKE-UP LOOP: Hasta 20 segundos para despertar el Space
    let isAwake = false;
    const maxRetries = 10;
    for (let i=0; i<maxRetries; i++) {
        const retryNum = i + 1;
        const progress = Math.min(85, 5 + (i * 8));
        updateP(progress, `Conectando con Backend de Alta Precisión (${retryNum}/${maxRetries})...`);
        
        try {
            const controller = new AbortController();
            const tId = setTimeout(() => controller.abort(), 3500);
            const h = await fetch(`${HF_API_URL}/health`, { 
                method: 'GET', 
                mode: 'cors',
                signal: controller.signal
            });
            clearTimeout(tId);
            if (h.ok) { isAwake = true; break; }
        } catch(e) { 
            console.log("Reintento conexión...", retryNum); 
        }
        await new Promise(r => setTimeout(r, 1800));
    }

    if (!isAwake) {
      updateP(90, "Backend saturado. Activando IA Local Pro...");
      await new Promise(r => setTimeout(r, 1000));
      // Resto de lógica de fallback local...
      const feat = await extractFeatures(audioBlob);
      feat._local = true;
      const vec  = featuresToVector(feat);
      const {vt, conf} = classifyVT(feat.pitchMean, feat.pitchRange, gender);
      const matches = getMatches(vec, vt, gender, {}, 15);
      lastResult = {feat, vec, vt, conf, matches, gender};
      try {
        const toSave = {
          feat: lastResult.feat, vt: lastResult.vt, conf: lastResult.conf,
          gender: lastResult.gender,
          matches: lastResult.matches.map(m => ({
            id:m.id, name:m.name, voice_type:m.voice_type,
            genre_category:m.genre_category, country_code:m.country_code,
            era:m.era, score:m.score,
            reference_songs: m.reference_songs?.slice(0,3) || []
          }))
        };
        sessionStorage.setItem("harmiq_result", JSON.stringify(toSave));
      } catch(_) {}
      await preloadImages(matches.slice(0,5).map(m=>m.name));
      if (dropZone) dropZone.style.display = "none";
      renderResults(lastResult);
      showStatus("");
      return;
    }

    showStatus("⏳ Analizando tu voz...");

    // 🚀 ENVÍO AL BACKEND
    const formData = new FormData();
    const fileName = (audioBlob instanceof File) ? audioBlob.name : 'record.wav';
    formData.append('audio', audioBlob, fileName);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

    let resp;
    try {
      resp = await fetch(`${HF_API_URL}/analyze`, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!resp.ok) {
      // Backend con error HTTP → fallback local
      showStatus("⚡ Backend no disponible. Analizando localmente...");
      const feat = await extractFeatures(audioBlob);
      feat._local = true;
      const vec  = featuresToVector(feat);
      const {vt, conf} = classifyVT(feat.pitchMean, feat.pitchRange, gender);
      const matches = getMatches(vec, vt, gender, {}, 15);
      lastResult = {feat, vec, vt, conf, matches, gender};
      await preloadImages(matches.slice(0,5).map(m=>m.name));
      if (dropZone) dropZone.style.display = "none";
      renderResults(lastResult);
      showStatus("");
      return;
    }
    const data = await resp.json();
    
    if (data.status === "error") throw new Error(data.message);

    const vec  = data.vector;
    const feat = data.features;
    
    const {vt,conf} = classifyVT(feat.pitchMean, feat.pitchRange, gender);
    const matches = getMatches(vec, vt, gender, {}, 5);
    
    lastResult = {feat, vec, vt, conf, matches, gender};
    await preloadImages(matches.slice(0,5).map(m=>m.name));

    // TRANSICIÓN DE UI: Ocultar zona de grabación para mostrar resultados
    if (dropZone) dropZone.style.display = "none";
    
    renderResults(lastResult);
    showStatus("");
    
    // Persistir resultado
    try {
      const toSave = {
        feat: lastResult.feat,
        vt:   lastResult.vt,
        conf: lastResult.conf,
        gender: lastResult.gender,
        matches: lastResult.matches.map(m => ({
          id:m.id, name:m.name, voice_type:m.voice_type,
          genre_category:m.genre_category, country_code:m.country_code,
          era:m.era, score:m.score,
          reference_songs: m.reference_songs?.slice(0,3) || []
        }))
      };
      sessionStorage.setItem("harmiq_result", JSON.stringify(toSave));
    } catch(_) {}
    // Limpiar progreso al finalizar
    if (pw) pw.style.display = "none";
  } catch(e) { 
    console.error("Analysis error:", e);
    if (pw) pw.style.display = "none";
    let msg = e.message || tr("_err_short");
    if (msg.includes("Load failed") || msg.includes("Failed to fetch")) {
      msg = "⚠️ El servidor de IA no responde. Por favor, asegúrate de que no tienes un bloqueador de anuncios activo o intenta recargar la página.";
    }
    showStatus(msg, "err"); 
    // Restaurar botón en caso de error
    if (analyzeBtn) {
      analyzeBtn.disabled = false;
      analyzeBtn.innerHTML = oldHtml;
      analyzeBtn.style.opacity = "1";
    }
  }
}

// ═══════════════════════════════════════�  // ── 1. PREMIUM STORY CARD (V5 Elite) ───────────────────────────────
  const top1 = matches[0];
  const top1Img = MONO_IMGS[top1?.name] || imgCache[top1?.name] || getInitialsAvatar(top1?.name||"?");
  const slugTop = top1.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  const phrases = {
    "baritone":["Tu voz tiene el poder de un clásico 🎭","Freddie Mercury era barítono en esencia 🤘","La voz más versátil y rica del mundo 🎤"],
    "tenor":   ["Brillantez y agilidad en estado puro ✨","El Do de pecho es tu territorio natural 🏆","Los tenores que definen épocas 🎼"],
    "soprano": ["Tu voz es pura magia y elegancia ✨","Mariah Carey empezó con este don 🌟","Soprano: La cúspide del rango humano 👑"],
    "mezzo-soprano":["Adele cambió el Soul con esta voz 💜","La riqueza tonal más equilibrada 🎶","Tu timbre es aterciopelado y profundo 🔥"],
    "contralto":["Una rareza vocal de una nobleza única 🌿","Nina Simone proyectaba tu misma alma 🎹","Contralto: Profundidad que estremece 💚"],
    "bass":    ["Los cimientos de la música resuenan en ti 🎸","Johnny Cash definía la autoridad así 🖤","Tu voz tiene el peso de una leyenda ⚡"],
    "countertenor":["La voz más sorprendente y etérea 🌈","Pureza absoluta en el registro agudo 💎","Una rareza vocal extraordinaria ⭐"],
  };
  const phraseArr = phrases[vt] || ["Tu voz es una huella única 🎤","Nadie canta exactamente igual que tú 🌟","El mundo necesita escuchar tu timbre 🎵"];
  const phrase = phraseArr[Math.floor(Math.random() * phraseArr.length)];

  // Piano Roll Visual Builder
  const notesToShow = ["C2","C3","C4","C5"];
  const pianoRollHTML = `
    <div style="display:flex; justify-content:center; gap:4px; margin:1.5rem 0; background:rgba(0,0,0,0.3); padding:10px; border-radius:15px; border:1px solid rgba(255,255,255,0.05)">
      ${Object.keys(PIANO_FREQS).map(n => `<div id="pk-${n}" style="width:16px; height:40px; background:rgba(255,255,255,0.1); border-radius:4px; transition:0.3s; position:relative">
         ${notesToShow.includes(n) ? `<span style="position:absolute; bottom:-18px; left:50%; transform:translateX(-50%); font-size:9px; color:var(--m); font-weight:900">${n}</span>` : ''}
      </div>`).join('')}
    </div>
  `;

  const storyCardHTML = `
    <div id="_premium_story_card" style="
      background: linear-gradient(170deg,#0f0820 0%,#1a0a35 35%,#0a1228 70%);
      border-radius: 48px; padding: 4rem 2rem; color: #fff; margin-bottom: 3.5rem;
      border: 1px solid rgba(255,255,255,.15); position: relative; overflow: hidden;
      box-shadow: 0 40px 150px rgba(0,0,0,0.9), 0 0 60px ${color}33; text-align:center;">
      
      <div style="position:absolute; top:-10%; left:-10%; width:300px; height:300px; background:${color}; filter:blur(150px); opacity:0.2; pointer-events:none"></div>

      <div style="font-weight:900; text-transform:uppercase; letter-spacing:4px; font-size:0.8rem; color:${color}; margin-bottom:1.5rem">Identidad Vocal Confirmada</div>

      <!-- AVATAR ARTISTA MATCH -->
      <div style="width:180px; height:180px; margin:0 auto 2rem; position:relative;">
        <div style="position:absolute; inset:-8px; border-radius:60px; background:linear-gradient(135deg, ${color}, #FF4FA3); padding:4px; border:1px solid rgba(255,255,255,0.2)">
          <div style="width:100%; height:100%; background:#0f0820; border-radius:56px"></div>
        </div>
        <img src="${top1Img}" style="width:100%; height:100%; border-radius:56px; object-fit:cover; position:relative; z-index:2; border:6px solid #0f0820" onerror="this.src=getInitialsAvatar('${top1.name}')">
      </div>

      <!-- NOMBRE ARTISTA GIGANTE -->
      <div style="margin-bottom:0.5rem; font-size:0.9rem; color:var(--m); font-weight:700; text-transform:uppercase; letter-spacing:2px">REFERENCIA DE ESTILO</div>
      <a href="/artistas/${slugTop}/" style="text-decoration:none; display:inline-block">
        <h1 style="font-size:clamp(3rem, 10vw, 5.5rem); font-weight:900; line-height:0.9; margin-bottom:1rem; letter-spacing:-2px; background:linear-gradient(to bottom, #fff, #b8b1d9); -webkit-background-clip:text; -webkit-text-fill-color:transparent">${top1.name}</h1>
      </a>

      <div style="font-size:1.3rem; color:var(--m); margin-bottom:2rem; font-weight:500; font-style:italic">"${phrase}"</div>

      <!-- AUDIO PLAYER & PIANO ROLL -->
      <div style="max-width:400px; margin:0 auto 2.5rem; background:rgba(255,255,255,0.03); padding:2rem; border-radius:32px; border:1px solid rgba(255,255,255,0.08)">
        <h3 style="font-size:1.4rem; color:#fff; margin-bottom:0.5rem">${vtName}</h3>
        <div style="font-size:0.8rem; color:var(--m); margin-bottom:1rem">Rango vocal detectado por IA</div>
        
        ${pianoRollHTML}
        
        <button onclick="playVocalSequence('${vt}')" style="background:var(--p); color:#fff; border:none; padding:1.2rem 2.5rem; border-radius:50px; font-weight:900; cursor:pointer; display:flex; align-items:center; gap:10px; margin:0 auto; transition:0.3s; box-shadow:0 12px 30px rgba(124,77,255,0.4)" onmouseover="this.style.transform='scale(1.05)';this.style.background='var(--a)'" onmouseout="this.style.transform='scale(1)';this.style.background='var(--p)'">
           <span>🎹</span> ESCUCHAR MI RANGO
        </button>
      </div>

      <div style="display:flex; gap:1.2rem; justify-content:center; flex-wrap:wrap">
        <div style="background:rgba(255,255,255,0.05); padding:1rem 2rem; border-radius:24px; border:1px solid rgba(255,255,255,0.1)">
          <div style="font-size:2.8rem; font-weight:900; color:#fff">${displayScore(top1.score)}%</div>
          <div style="font-size:0.7rem; color:var(--p); font-weight:900; text-transform:uppercase">Similitud</div>
        </div>
        <button onclick="showViralCard()" style="flex:1; max-width:260px; border-radius:24px; background:linear-gradient(135deg, #7C4DFF, #FF4FA3); color:white; border:none; font-weight:900; cursor:pointer; box-shadow:0 15px 30px rgba(124,77,255,0.4); font-size:1.1rem">
           ESTRELLA V5.0 🌟
        </button>
      </div>

      <div style="display:flex; gap:1rem; justify-content:center; margin-top:2.5rem; align-items:center">
        <button id="_fb_ok" onclick="_sendFeedback(true)" style="background:var(--glass); border:1px solid var(--glass-border); border-radius:50px; padding:0.6rem 1.2rem; cursor:pointer; font-size:1.4rem">👍</button>
        <button id="_reset_v5" onclick="_resetApp()" style="background:rgba(255,255,255,0.05); color:#A5B4FC; border:1px solid rgba(255,255,255,0.1); padding:0.8rem 2rem; border-radius:50px; font-weight:900; cursor:pointer">OTRA PRUEBA</button>
        <button id="_fb_ko" onclick="_sendFeedback(false)" style="background:var(--glass); border:1px solid var(--glass-border); border-radius:50px; padding:0.6rem 1.2rem; cursor:pointer; font-size:1.4rem">👎</button>
      </div>

    </div>
  `;
3"],
    "tenor":         ["C3", "E3", "G3", "C4"],
    "countertenor":  ["G3", "B3", "D4", "G4"],
    "contralto":     ["F3", "A3", "C4", "F4"],
    "mezzo-soprano": ["A3", "C4", "E4", "A4"],
    "soprano":       ["C4", "E4", "G4", "C5"]
};

async function playVocalSequence(vt) {
    const notes = VOCAL_RANGES_PIANO[vt] || ["C3", "E3", "G3"];
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    let time = audioCtx.currentTime + 0.1;

    notes.forEach((note, i) => {
        const freq = PIANO_FREQS[note] || 261.63;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'triangle'; // Sonido suave tipo piano eléctrico/flauta
        osc.frequency.setValueAtTime(freq, time);
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.3, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.8);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        // Animación visual del piano roll
        setTimeout(() => {
            const keyEl = document.getElementById(`pk-${note}`);
            if (keyEl) {
                keyEl.style.background = 'var(--a)';
                keyEl.style.boxShadow = '0 0 15px var(--a)';
                setTimeout(() => {
                    keyEl.style.background = 'rgba(255,255,255,0.1)';
                    keyEl.style.boxShadow = 'none';
                }, 500);
            }
        }, (time - audioCtx.currentTime) * 1000);

        osc.start(time);
        osc.stop(time + 0.8);
        time += 0.4;
    });

    setTimeout(() => audioCtx.close(), time * 1000 + 1000);
}

async function renderResults(data) {
  if (!data || !data.matches || data.matches.length === 0) {
    const resEl = document.getElementById("results");
    if (resEl) resEl.innerHTML = `<div style="padding:4rem 2rem; text-align:center; background:rgba(255,255,255,.03); border-radius:30px; border:1px solid rgba(255,255,255,0.1); margin:2rem 0">
      <div style="font-size:3rem; margin-bottom:1rem">🔍</div>
      <h2 style="font-size:1.5rem; color:#fff; margin-bottom:1rem">No hemos encontrado artistas que coincidan exactamente con tu tipo de voz</h2>
      <p style="color:#9CA3AF">Inténtalo de nuevo grabando un poco más cerca del micrófono o seleccionando manualmente tu género.</p>
    </div>`;
    return;
  }
  const {feat,vec,vt,conf,matches,gender} = data;
  
  try {
    const vtName = trV("_vt_names",vt);
    const sym    = ["🥇","🥈","🥉","4°","5°","6°","7°","8°","9°","10°","11°","12°","13°","14°","15°"];
  const explanation = getVoiceTypeDescription(vt, conf, window.lang || 'es');

  const resEl = document.getElementById("results");
  if (!resEl) return;

  const colorMap = {
    "baritone":"#7C4DFF","bass":"#1E3A5F","tenor":"#118AB2",
    "soprano":"#FF4FA3","mezzo-soprano":"#FF9F1C","contralto":"#80B918",
    "countertenor":"#06D6A0"
  };
  const color = colorMap[vt] || "#7C4DFF";

  // ── 1. PREMIUM STORY CARD (Viral) ──────────────────────────────────
  const top1 = matches[0];
  const top1Img = MONO_IMGS[top1?.name] || imgCache[top1?.name] || getInitialsAvatar(top1?.name||"?");
  
  const phrases = {
    "baritone":["Tu voz tiene el poder de un clásico 🎭","Freddie Mercury era barítono. ¿Y tú? 🤘","La voz más versátil del mundo. Úsala 🎤"],
    "tenor":   ["Tu voz llega donde otros no pueden ✨","El Do de pecho es tu territorio 🏆","Los tenores hacen historia 🎼"],
    "soprano": ["Tu voz es pura magia celestial ✨","Mariah Carey empezó como tú 🌟","Las sopranos conquistan el mundo 👑"],
    "mezzo-soprano":["Adele cambió el mundo con esta voz 💜","La más expresiva del espectro 🎶","Tu timbre es único e irrepetible 🔥"],
    "contralto":["Una rareza vocal privilegiada 🌿","Nina Simone tenía tu voz 🎹","Tu registro grave es tu superpoder 💚"],
    "bass":    ["Los graves más poderosos del mundo 🎸","Johnny Cash tenía tu voz 🖤","Tu voz hace temblar el escenario ⚡"],
    "countertenor":["La voz más sorprendente del mundo 🌈","Tu falsetto es tu mayor tesoro 💎","Una rareza vocal extraordinaria ⭐"],
  };
  const phraseArr = phrases[vt] || ["Tu voz es única 🎤","Nadie canta como tú 🌟","El mundo necesita tu voz 🎵"];
  const phrase = phraseArr[Math.floor(Math.random() * phraseArr.length)];

  const storyCardHTML = `
    <div id="_premium_story_card" style="
      background: linear-gradient(170deg,#0f0820 0%,#1a0a35 35%,#0a1228 70%);
      border-radius: 40px; padding: 3rem 2rem; color: #fff; margin-bottom: 3rem;
      border: 1px solid rgba(255,255,255,.15); position: relative; overflow: hidden;
      box-shadow: 0 40px 120px rgba(0,0,0,0.8), 0 0 50px ${color}44; text-align:center;">
      
      <!-- Destellos de fondo -->
      <div style="position:absolute; top:-20%; left:-10%; width:200px; height:200px; background:${color}; filter:blur(100px); opacity:0.25; pointer-events:none"></div>
      <div style="position:absolute; bottom:-10%; right:-5%; width:150px; height:150px; background:#FF4FA3; filter:blur(80px); opacity:0.15; pointer-events:none"></div>

      <div style="font-family:'Outfit',sans-serif; text-transform:uppercase; letter-spacing:3px; font-size:0.75rem; color:${color}; font-weight:800; margin-bottom:1rem">
        Tu Huella Vocal Identificada
      </div>

      <div style="width:140px; height:140px; margin:0 auto 1.5rem; position:relative;">
        <div style="position:absolute; inset:-5px; border-radius:50%; background:linear-gradient(135deg, ${color}, #FF4FA3); padding:3px; animation:rotate-glow 4s linear infinite">
          <div style="width:100%; height:100%; background:#0f0820; border-radius:50%"></div>
        </div>
        <img src="${top1Img}" style="width:100%; height:100%; border-radius:50%; object-fit:cover; position:relative; z-index:2; border:4px solid #0f0820">
      </div>

      <h2 style="font-family:'Baloo 2',sans-serif; font-size:2.8rem; margin-bottom:0.2rem; line-height:1">${vtName}</h2>
      <div style="font-size:1.1rem; color:#D1D5DB; margin-bottom:1.5rem; font-style:italic">"${phrase}"</div>

      <div style="display:inline-block; background:rgba(255,255,255,0.05); padding:1rem 2rem; border-radius:20px; border:1px solid rgba(255,255,255,0.1); margin-bottom:2rem">
        <a href="/artistas/${top1.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}/" style="text-decoration:none">
          <div style="font-size:0.8rem; color:#A5B4FC; text-transform:uppercase; letter-spacing:1px; font-weight:700; transition:opacity 0.2s" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">Similitud con ${top1.name}</div>
        </a>
        <div style="font-size:3.5rem; font-weight:900; background:linear-gradient(135deg, #fff, ${color}); -webkit-background-clip:text; -webkit-text-fill-color:transparent">
          ${displayScore(top1.score)}%
        </div>
      </div>

      <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap">
        <button onclick="showViralCard()" style="padding:1rem 2rem; border-radius:50px; background:linear-gradient(135deg, #7C4DFF, #FF4FA3); color:white; border:none; font-weight:800; cursor:pointer; box-shadow:0 10px 30px rgba(124,77,255,0.4); display:flex; align-items:center; gap:0.6rem">
          <span>🌟</span> Compartir tarjeta viral
        </button>
        <button onclick="_share('wa')" style="padding:1rem 1.5rem; border-radius:50px; background:rgba(255,255,255,.05); color:white; border:1px solid rgba(255,255,255,.15); font-weight:700; cursor:pointer; display:flex; align-items:center; gap:0.6rem">
          <span>💬</span> Chat
        </button>
      </div>

      <!-- Feedback + Reiniciar -->
      <div style="display:flex; gap:.8rem; justify-content:center; align-items:center; margin-top:1.2rem; flex-wrap:wrap">
        <span style="font-size:.78rem; color:#6B7280; font-weight:700">¿El resultado es correcto?</span>
        <button id="_fb_ok" onclick="_sendFeedback(true)" style="font-size:1.5rem; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.12); border-radius:50px; padding:.35rem .9rem; cursor:pointer; transition:.2s" title="Sí, correcto" onmouseover="this.style.background='rgba(6,214,160,.15)';this.style.borderColor='#06D6A0'" onmouseout="this.style.background='rgba(255,255,255,.05)';this.style.borderColor='rgba(255,255,255,.12)'">👍</button>
        <button id="_fb_ko" onclick="_sendFeedback(false)" style="font-size:1.5rem; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.12); border-radius:50px; padding:.35rem .9rem; cursor:pointer; transition:.2s" title="No, no es correcto" onmouseover="this.style.background='rgba(255,79,163,.15)';this.style.borderColor='#FF4FA3'" onmouseout="this.style.background='rgba(255,255,255,.05)';this.style.borderColor='rgba(255,255,255,.12)'">👎</button>
        <button onclick="_resetApp()" style="font-size:.82rem; font-weight:800; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.12); border-radius:50px; padding:.45rem 1.2rem; cursor:pointer; color:#A5B4FC; transition:.2s; display:flex; align-items:center; gap:.4rem" onmouseover="this.style.background='rgba(124,77,255,.15)';this.style.borderColor='#7C4DFF'" onmouseout="this.style.background='rgba(255,255,255,.05)';this.style.borderColor='rgba(255,255,255,.12)'">🔄 Nueva prueba</button>
      </div>

      <!-- Monetización Integrada (Simplificada en Card) -->
      <div style="margin-top:2rem; border-top:1px solid rgba(255,255,255,0.05); padding-top:1.5rem">
        <div style="font-size:0.75rem; color:#9CA3AF; font-weight:700; text-transform:uppercase; letter-spacing:1px">Sugerencia Profesional</div>
        <div style="font-size:0.9rem; margin-top:0.3rem">${trV("_vt_names", vt)}: El equipo ideal para tu rango.</div>
      </div>

    </div>
  `;

  // ── 2. FILTROS Y CONTENIDO ──────────────────────────────────────────
  const ERA_DISPLAY = [
    {val:"pre-1960s",  label:"Clásicos"},
    {val:"1960s",      label:"60"},
    {val:"1970s",      label:"70"},
    {val:"1980s",      label:"80"},
    {val:"1990s",      label:"90"},
    {val:"2000s",      label:"2000"},
    {val:"2010s",      label:"2010"},
    {val:"2020s",      label:"2020"},
    {val:"actualidad", label:"Actual"}
  ];
  const eraOptions = ERA_DISPLAY
    .filter(e => {
      const dbVal = ({"1970s":"1970s-80s","1980s":"1970s-80s","2000s":"2000s+","2010s":"2010s","2020s":"2020s+","actualidad":"2020s+"}[e.val]) || e.val;
      return singersDb.some(s => s.era === dbVal || s.era === e.val);
    })
    .map(e => `<option value="${e.val}">${e.label}</option>`).join("");

  const genreOptions = [...new Set(singersDb.map(s=>s.genre_category).filter(Boolean))].sort()
    .map(g => `<option value="${g}">${g.charAt(0).toUpperCase()+g.slice(1).replace('-',' ')}</option>`).join("");

  // Opciones de idioma/país: "ES" = solo España, "LATAM" = todos los latinos, etc.
  const topCountries = {
    "ES":    "🇪🇸 España",
    "LATAM": "🌎 Latino",
    "CAT":   "🏴 Català",
    "US":    "🇺🇸 English",
    "BR":    "🇧🇷 Português",
    "IT":    "🇮🇹 Italiano",
    "DE":    "🇩🇪 Deutsch",
    "FR":    "🇫🇷 Français",
    "JP":    "🇯🇵 日本語",
    "KR":    "🇰🇷 한국어"
  };
  // "LATAM" agrupa todos los países hispanohablantes excepto España
  const LATAM_CC = ["MX","AR","CO","PR","CL","VE","PE","DO","BO","EC","PY","UY","GT","HN","CR","PA","CU","NI","SV","US_LATIN"];
  const countryOptions = Object.entries(topCountries)
    .filter(([cc]) => cc==="LATAM" ? singersDb.some(s=>LATAM_CC.includes(s.country_code)) : singersDb.some(s=>s.country_code===cc))
    .map(([cc,lbl]) => `<option value="${cc}">${lbl}</option>`).join("");

  const filtersHTML = `
    <style>
      .hm-sel{width:100%;background:#13102a;border:1px solid rgba(255,255,255,.15);color:#E5E7EB;border-radius:12px;padding:.55rem .8rem;font-size:.85rem;font-family:'Outfit',sans-serif;font-weight:600;cursor:pointer;appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239CA3AF'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right .75rem center;outline:none;transition:border-color .2s}
      .hm-sel:focus,.hm-sel:hover{border-color:rgba(124,77,255,.6)}
      .hm-sel option{background:#1a1730;color:#E5E7EB}
    </style>
    <div id="_filters_row" style="margin-bottom:1.5rem; padding:1.2rem 1.4rem; background:rgba(255,255,255,.03); border-radius:20px; border:1px solid rgba(255,255,255,.08)">
      <div style="font-size:.72rem; color:#9CA3AF; font-weight:800; text-transform:uppercase; letter-spacing:.12em; margin-bottom:.9rem">🎛️ Filtrar artistas por época, género o idioma</div>
      <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:.7rem">
        <select id="_era_filter" class="hm-sel filter-sel"><option value="">📅 Época</option>${eraOptions}</select>
        <select id="_genre_filter" class="hm-sel filter-sel"><option value="">🎵 Género</option>${genreOptions}</select>
        <select id="_country_filter" class="hm-sel filter-sel"><option value="">🌍 Idioma</option>${countryOptions}</select>
      </div>
    </div>`;

  // Cards grid: verticales estilo Spotify — foto grande arriba, info abajo
  const cardsHTML = `<div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(170px,1fr)); gap:1rem; margin-top:.5rem">` +
    matches.slice(1).map((m, i) => {
    const rank   = i + 2;
    const pct    = displayScore(m.score);
    const img    = imgCache[m.name] || getInitialsAvatar(m.name);
    const vtN    = trV("_vt_names", m.voice_type);
    const songs  = m.reference_songs?.slice(0,3) || [];
    const medal  = sym[rank - 1] || `${rank}°`;
    const isComp = m.isComparisonMode;
    const slug   = m.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    const cardColor = isComp ? '#FF4FA3' : color;
    return `
    <div style="background:rgba(255,255,255,.04); border:1px solid ${isComp?'rgba(255,79,163,.4)':'rgba(255,255,255,.08)'}; border-radius:20px; overflow:hidden; position:relative; transition:transform .25s, box-shadow .25s; display:flex; flex-direction:column" onmouseover="this.style.transform='translateY(-6px)';this.style.boxShadow='0 16px 40px rgba(0,0,0,.5)';this.style.borderColor='${cardColor}66'" onmouseout="this.style.transform='';this.style.boxShadow='';this.style.borderColor='${isComp?'rgba(255,79,163,.4)':'rgba(255,255,255,.08)'}'">
      ${isComp ? `<div style="position:absolute;top:8px;left:8px;background:#FF4FA3;color:#fff;font-size:.5rem;font-weight:900;padding:2px 8px;border-radius:20px;letter-spacing:1px;z-index:3;text-transform:uppercase">Comparación</div>` : ""}
      <!-- Medalla rank -->
      <div style="position:absolute;top:8px;right:8px;background:rgba(0,0,0,.7);color:#fff;font-size:.65rem;font-weight:900;padding:3px 8px;border-radius:20px;z-index:3;backdrop-filter:blur(4px)">${medal}</div>
      <!-- Foto cuadrada grande -->
      <a href="/artistas/${slug}/" style="display:block;text-decoration:none">
        <div style="position:relative;padding-top:100%;background:#0d0a1f;overflow:hidden">
          <img src="${img}" alt="${m.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .3s" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" onerror="this.onerror=null;this.src=getInitialsAvatar('${m.name.replace(/'/g,"\\'")}')">
          <!-- Gradiente inferior para legibilidad -->
          <div style="position:absolute;bottom:0;left:0;right:0;height:60%;background:linear-gradient(to top,rgba(13,10,31,.9) 0%,transparent 100%);pointer-events:none"></div>
          <!-- % similitud sobre foto -->
          <div style="position:absolute;bottom:8px;left:10px;z-index:2">
            <div style="font-size:1.3rem;font-weight:900;color:#fff;line-height:1;text-shadow:0 2px 8px rgba(0,0,0,.8)">${pct}%</div>
            <div style="font-size:.55rem;color:rgba(255,255,255,.6);font-weight:700;text-transform:uppercase;letter-spacing:.5px">similitud</div>
          </div>
        </div>
      </a>
      <!-- Info -->
      <div style="padding:.75rem .85rem; flex:1; display:flex; flex-direction:column; gap:.4rem">
        <a href="/artistas/${slug}/" style="text-decoration:none">
          <div style="font-size:.9rem;color:#fff;font-weight:800;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:color .15s" onmouseover="this.style.color='${cardColor}'" onmouseout="this.style.color='#fff'">${m.name}</div>
        </a>
        <div style="display:flex;gap:.3rem;flex-wrap:wrap">
          <span style="font-size:.6rem;font-weight:800;padding:.15rem .5rem;border-radius:20px;background:${cardColor}22;color:${cardColor};border:1px solid ${cardColor}44">${vtN}</span>
          ${m.era ? `<span style="font-size:.6rem;padding:.15rem .5rem;border-radius:20px;background:rgba(255,255,255,.06);color:#9CA3AF">${trV("_eras",m.era)||m.era}</span>` : ""}
        </div>
        <!-- Barra similitud -->
        <div style="height:2px;background:rgba(255,255,255,.07);border-radius:2px;overflow:hidden;margin-top:.1rem">
          <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,${cardColor},#FF4FA3)"></div>
        </div>
        <!-- Canciones -->
        ${songs.length ? `<div style="margin-top:.3rem;display:flex;flex-direction:column;gap:.2rem">
          ${songs.map(s => {
            const sTitle = typeof s==='object'?(s.title||s.name||''):String(s||'');
            const {karaoke} = getPlatformLinks(m.name, sTitle);
            return `<a href="${karaoke}" target="_blank" style="display:flex;align-items:center;gap:.4rem;text-decoration:none;padding:.25rem .3rem;border-radius:6px;transition:background .15s" onmouseover="this.style.background='rgba(255,255,255,.07)'" onmouseout="this.style.background='transparent'">
              <span style="color:${cardColor};font-size:.6rem;flex-shrink:0">▶</span>
              <span style="font-size:.65rem;color:#D1D5DB;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${sTitle}</span>
            </a>`;
          }).join('')}
        </div>` : ""}
      </div>
    </div>`;
  }).join("") + `</div>`;

  const vtOverrideHTML = (() => {
    const allVTs = ['bass','baritone','tenor','countertenor','contralto','mezzo-soprano','soprano'];
    const btns = allVTs.map(v => {
      const n = trV('_vt_names', v) || v;
      const isActive = v === vt;
      return `<button onclick="_overrideVT('${v}')" style="font-size:.75rem; font-weight:800; padding:.4rem .9rem; border-radius:30px; cursor:pointer; transition:.2s; border:1px solid ${isActive ? color : 'rgba(255,255,255,.15)'}; background:${isActive ? color+'33' : 'rgba(255,255,255,.05)'}; color:${isActive ? '#fff' : '#9CA3AF'}">${n}</button>`;
    }).join('');
    return `<div style="margin:2rem 0; padding:1.2rem; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:20px">
      <div style="font-size:.8rem; color:#9CA3AF; margin-bottom:0.8rem; font-weight:700">¿Crees que el resultado no es exacto? Ajusta tu tipo de voz:</div>
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap">${btns}</div>
    </div>`;
  })();

  resEl.innerHTML = `
    <div style="animation: appear 0.6s ease-out">
      ${storyCardHTML}
      <div style="text-align:center; padding: 0 1rem 2rem; border-bottom:1px solid rgba(255,255,255,.1)">
        <p style="color:#D1D5DB; font-size:1.1rem; line-height:1.6; max-width:800px; margin:0 auto">${explanation}</p>
      </div>
      
      <div style="margin:2.5rem 0 1.5rem">
        <div style="font-family:'Outfit'; font-weight:900; font-size:1.5rem; color:#fff; margin-bottom:1rem; display:flex; align-items:center; gap:0.8rem">
          <span>🎸</span> ${matches.length} artistas que comparten tu ADN vocal
        </div>
        ${filtersHTML}
        ${cardsHTML}
      </div>

      ${vtOverrideHTML}
      
      <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:1rem; margin-top:2rem">
        <a href="/home-studio" style="padding:1.5rem; background:rgba(124,77,255,.1); border-radius:20px; border:1px solid rgba(124,77,255,.25); text-decoration:none; text-align:center">
          <div style="font-size:2rem; margin-bottom:.5rem">🎛️</div>
          <div style="font-weight:800; color:#fff">Montar Home Studio</div>
          <div style="font-size:.8rem; color:#A5B4FC">Guía técnica para sonar pro</div>
        </a>
        <a href="/ejercicios-de-canto" style="padding:1.5rem; background:rgba(255,209,102,.1); border-radius:20px; border:1px solid rgba(255,209,102,.25); text-decoration:none; text-align:center">
          <div style="font-size:2rem; margin-bottom:.5rem">🎯</div>
          <div style="font-weight:800; color:#fff">Ejercicios de Canto</div>
          <div style="font-size:.8rem; color:#FFD166">Mejora tu rango y control</div>
        </a>
      </div>

      <!-- 🎓 SECCIÓN DEDICADA DE CURSOS (Solicitud Usuario) -->
      <div id="_courses_section" style="margin-top:3rem; animation: appear 0.8s ease-out">
        <div style="font-family:'Outfit'; font-weight:900; font-size:1.5rem; color:#fff; margin-bottom:1.5rem; display:flex; align-items:center; gap:0.8rem">
          <span>🎓</span> Formación y Cursos Premium
        </div>
        ${getUdemyBox(vt)}
        
        <div style="margin-top:1.5rem; padding:1.5rem; background:rgba(255,255,255,.03); border-radius:24px; border:1px solid rgba(255,255,255,.08); display:flex; align-items:center; gap:1.5rem; flex-wrap:wrap">
          <div style="flex:1; min-width:200px">
            <h4 style="font-size:1rem; color:#fff; margin-bottom:0.4rem">Masterclass: Técnica Vocal Avanzada</h4>
            <p style="font-size:0.85rem; color:#9CA3AF">Aprende a dominar los armónicos y el control de aire con profesionales.</p>
          </div>
          <a href="https://www.udemy.com/topic/singing/?tag=harmiqapp-20" target="_blank" style="background:rgba(255,255,255,0.08); color:#fff; padding:0.8rem 1.5rem; border-radius:12px; text-decoration:none; font-weight:700; font-size:0.85rem; border:1px solid rgba(255,255,255,0.1)">Ver más cursos →</a>
        </div>
      </div>

    </div>
  `;

  // Re-vincular eventos de filtros
  attachFilterEvents(vec, vt, gender);
  
    // Scroll suave al inicio del resultado
    setTimeout(() => resEl.scrollIntoView({ behavior:"smooth", block:"start" }), 150);

    // ── Sección karaoke personalizada ──────────────────────────────────
    const evEl = document.getElementById("events-area");
    if (evEl) {
      const vtSlug = {"baritone":"baritono","bass":"bajo","tenor":"tenor","soprano":"soprano","mezzo-soprano":"mezzosoprano","contralto":"contralto","countertenor":"tenor"}[vt] || "baritono";
      evEl.innerHTML = buildKaraokeSection(vtName, vtSlug);
    }
  } catch (renderErr) {
    console.error("Error in renderResults:", renderErr);
    const resEl = document.getElementById("results");
    if (resEl) resEl.innerHTML = `<div style="padding:2rem; text-align:center; color:#9CA3AF">Hubo un problema al generar la tarjeta de resultados. Por favor, intenta analizar de nuevo.</div>`;
  }
}

function attachFilterEvents(vec, vt, gender) {
  const applyFilters = async () => {
    const eraVal  = document.getElementById("_era_filter")?.value    || "";
    const genre   = document.getElementById("_genre_filter")?.value  || "";
    const country = document.getElementById("_country_filter")?.value|| "";
    
    const ERA_MAP = { "1970s":"1970s-80s", "1980s":"1970s-80s", "2000s":"2000s+", "2010s":"2010s", "2020s":"2020s+", "actualidad":"2020s+" };
    const era = ERA_MAP[eraVal] || eraVal;
    
    const filters = {};
    if (era)     filters.era            = era;
    if (genre)   filters.genre_category = genre;
    if (country) filters.country_code   = country;  // LANG_CC mapping se aplica en getMatches

    const newMatches = getMatches(vec, vt, gender, filters, 15);
    await preloadImages(newMatches.map(m=>m.name));

    if (typeof lastResult !== 'undefined') {
        lastResult.matches = newMatches;
        await renderResults(lastResult);
        // Restaurar los valores seleccionados tras el re-render (renderResults reconstruye el HTML)
        const eraEl     = document.getElementById("_era_filter");
        const genreEl   = document.getElementById("_genre_filter");
        const countryEl = document.getElementById("_country_filter");
        if (eraEl)     eraEl.value     = eraVal;
        if (genreEl)   genreEl.value   = genre;
        if (countryEl) countryEl.value = country;
    }
  };

  const sels = ["_era_filter", "_genre_filter", "_country_filter"];
  sels.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", applyFilters);
  });
}

// ── Constructor de sección karaoke (reutilizable en resultado y páginas SEO) ──
function buildKaraokeSection(vtName, vtSlug) {
  return `
  <div style="margin-top:1.5rem">
    <div style="background:rgba(255,255,255,.04);border-radius:18px;
      border:1px solid rgba(255,255,255,.08);overflow:hidden">

      <!-- Header karaoke -->
      <div style="padding:1.1rem 1.25rem;border-bottom:1px solid rgba(255,255,255,.06);
        display:flex;align-items:center;gap:.7rem">
        <span style="font-size:1.5rem">🎤</span>
        <div>
          <h3 style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1rem;margin-bottom:.1rem">
            Karaoke — Encuentra dónde cantar
          </h3>
          <p style="font-size:.75rem;color:#6B7280">
            Karaokes, open mics, jam sessions y plataformas online
          </p>
        </div>
      </div>

      <div style="padding:1.1rem 1.25rem">

        <!-- Buscador de locales -->
        <div style="margin-bottom:1.1rem">
          <div style="font-size:.8rem;font-weight:700;color:#A5B4FC;margin-bottom:.5rem">
            📍 Busca locales y eventos cerca de ti
          </div>
          <div style="display:flex;gap:.4rem">
            <input id="_karaoke_city" placeholder="Tu ciudad (ej: Madrid)"
              style="flex:1;background:#13102a;border:1px solid rgba(255,255,255,.15);color:#E5E7EB;
              font-size:.85rem;padding:.5rem .8rem;border-radius:10px;font-family:'Nunito',sans-serif;
              outline:none" />
            <button onclick="_searchKaraoke()" 
              style="background:linear-gradient(135deg,#7C4DFF,#FF4FA3);color:#fff;border:none;
              padding:.5rem 1rem;border-radius:10px;font-weight:700;font-size:.82rem;cursor:pointer;
              white-space:nowrap">Buscar</button>
          </div>
        </div>

        <!-- Resultados de búsqueda -->
        <div id="_karaoke_results" style="display:none;margin-bottom:1rem">
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:.5rem">
            <a id="_kr_bars" href="#" target="_blank" rel="noopener"
              style="padding:.7rem;background:rgba(255,159,28,.08);border:1px solid rgba(255,159,28,.2);
              border-radius:10px;text-decoration:none;color:#E5E7EB;display:flex;flex-direction:column;gap:.2rem">
              <span style="font-size:1rem">🍺</span>
              <span style="font-size:.78rem;font-weight:700">Bares de karaoke</span>
              <span style="font-size:.65rem;color:#6B7280">Google Maps →</span>
            </a>
            <a id="_kr_mics" href="#" target="_blank" rel="noopener"
              style="padding:.7rem;background:rgba(124,77,255,.08);border:1px solid rgba(124,77,255,.2);
              border-radius:10px;text-decoration:none;color:#E5E7EB;display:flex;flex-direction:column;gap:.2rem">
              <span style="font-size:1rem">🎸</span>
              <span style="font-size:.78rem;font-weight:700">Open mics & jams</span>
              <span style="font-size:.65rem;color:#6B7280">Google Maps →</span>
            </a>
            <a id="_kr_comu" href="#" target="_blank" rel="noopener"
              style="padding:.7rem;background:rgba(6,214,160,.08);border:1px solid rgba(6,214,160,.2);
              border-radius:10px;text-decoration:none;color:#E5E7EB;display:flex;flex-direction:column;gap:.2rem">
              <span style="font-size:1rem">👥</span>
              <span style="font-size:.78rem;font-weight:700">Comunidad local</span>
              <span style="font-size:.65rem;color:#6B7280">Ver en Google →</span>
            </a>
            <a id="_kr_events" href="#" target="_blank" rel="noopener"
              style="padding:.7rem;background:rgba(255,79,163,.08);border:1px solid rgba(255,79,163,.2);
              border-radius:10px;text-decoration:none;color:#E5E7EB;display:flex;flex-direction:column;gap:.2rem">
              <span style="font-size:1rem">🎭</span>
              <span style="font-size:.78rem;font-weight:700">Eventos & Concursos</span>
              <span style="font-size:.65rem;color:#6B7280">Ver en Google →</span>
            </a>
            <a id="_kr_studio" href="#" target="_blank" rel="noopener"
              style="padding:.7rem;background:rgba(252,221,9,.08);border:1px solid rgba(252,221,9,.2);
              border-radius:10px;text-decoration:none;color:#E5E7EB;display:flex;flex-direction:column;gap:.2rem">
              <span style="font-size:1rem">🎛️</span>
              <span style="font-size:.78rem;font-weight:700">Montar Home Studio</span>
              <span style="font-size:.65rem;color:#6B7280">Guía vocal →</span>
            </a>
            <a id="_kr_pro" href="#" target="_blank" rel="noopener"
              style="padding:.7rem;background:rgba(255,0,0,.08);border:1px solid rgba(255,0,0,.2);
              border-radius:10px;text-decoration:none;color:#E5E7EB;display:flex;flex-direction:column;gap:.2rem">
              <span style="font-size:1rem">🏆</span>
              <span style="font-size:.78rem;font-weight:700">Pistas Pro</span>
              <span style="font-size:.65rem;color:#6B7280">YouTube Pro →</span>
            </a>
          </div>
        </div>

        <!-- Karaoke online -->
        <div style="margin-bottom:1rem">
          <div style="font-size:.78rem;font-weight:700;color:#A5B4FC;margin-bottom:.6rem">
            💻 Karaoke online — Practica con vídeos pro
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.75rem">
            ${[
              {q:"técnica vocal respiración diafragma cantantes", name:"Técnica: Respiración", desc:"Cómo respirar al cantar", color:"rgba(124,77,255,.1)", border:"rgba(124,77,255,.3)", emoji:"🫁"},
              {q:"apoyo vocal técnica canto ejercicios soporte", name:"Apoyo Vocal", desc:"Ejercicios de soporte", color:"rgba(255,79,163,.1)", border:"rgba(255,79,163,.2)", emoji:"💪"},
              {q:"potencia voz belting técnica vocal potente", name:"Potencia y Grit", desc:"Potencia tu voz", color:"rgba(255,153,0,.1)", border:"rgba(255,153,0,.2)", emoji:"🔥"},
              {q:"controlar agudos voz técnica vocal notas altas", name:"Controla tus agudos", desc:"Domina las notas altas", color:"rgba(6,214,160,.1)", border:"rgba(6,214,160,.2)", emoji:"🎯"},
              {q:"calentamiento vocal rutina diaria cantantes 10 minutos", name:"Calentamiento vocal", desc:"Rutina diaria de 10 min", color:"rgba(0,170,255,.1)", border:"rgba(0,170,255,.2)", emoji:"☀️"},
            ].map(v=>`
              <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(v.q)}" target="_blank" rel="noopener"
                style="border-radius:12px;overflow:hidden;background:${v.color};border:1px solid ${v.border};text-decoration:none;display:block">
                <div style="position:relative;aspect-ratio:16/9;background:#0d0a1f;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:.4rem"
                  onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">
                  <div style="font-size:2.5rem">${v.emoji}</div>
                  <div style="width:40px;height:40px;background:rgba(255,0,0,.88);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 4px 16px rgba(255,0,0,.4)">▶</div>
                </div>
                <div style="padding:.5rem">
                  <div style="font-size:.7rem;font-weight:800;color:#E5E7EB">${v.name}</div>
                  <div style="font-size:.6rem;color:#6B7280">${v.desc}</div>
                </div>
              </a>`).join("")}
          </div>
          <div style="margin-top:1rem; display:flex; gap:.5rem; flex-wrap:wrap">
            <a href="https://www.youtube.com/results?search_query=karaoke+${encodeURIComponent(vtName)}" target="_blank" style="font-size:.65rem; color:#A5B4FC; text-decoration:none; background:rgba(255,255,255,.05); padding:.4rem .8rem; border-radius:8px; border:1px solid rgba(255,255,255,.1)">🔍 Más en YouTube</a>
            <a href="https://singa.com" target="_blank" style="font-size:.65rem; color:#FF9F1C; text-decoration:none; background:rgba(255,159,28,.05); padding:.4rem .8rem; border-radius:8px; border:1px solid rgba(255,159,28,.2)">🎤 Singa Online</a>
            <a href="https://yokee.tv" target="_blank" style="font-size:.65rem; color:#1877F2; text-decoration:none; background:rgba(24,119,242,.05); padding:.4rem .8rem; border-radius:8px; border:1px solid rgba(24,119,242,.2)">📱 Yokee App</a>
          </div>
        </div>

        <!-- Consejos para cantar en público -->
        <details style="border-top:1px solid rgba(255,255,255,.06);padding-top:.9rem;margin-bottom:1.5rem">
          <summary style="font-size:.8rem;font-weight:700;color:#A5B4FC;cursor:pointer;
            list-style:none;display:flex;align-items:center;gap:.4rem">
            <span>💡</span> Consejos para cantar en público <span style="margin-left:auto;font-size:.7rem;color:#6B7280">▼ Ver</span>
          </summary>
          <div style="margin-top:.75rem;display:flex;flex-direction:column;gap:.5rem">
            ${[
              ["🎙️","Elige canciones dentro de tu rango","No elijas la canción más difícil. Elige una que domines bien — el público lo agradece más que un intento fallido de un hit imposible."],
              ["🌡️","Calienta la voz antes","5 minutos de escalas suaves antes de subir al escenario marcan una diferencia enorme. El humming (boca cerrada) es perfecto."],
              ["🎤","Domina el micrófono","Mantén el micro a 5-10 cm de la boca. Aléjalo un poco en los agudos, acércala en los graves. No lo tapes con la mano."],
              ["👀","Mira al público","No te claves en la pantalla. Léela de reojo y conecta con el público. Una sonrisa vale más que la nota perfecta."],
              ["🍵","Hidratación y temperatura","Agua a temperatura ambiente, no fría. El alcohol reseca las cuerdas vocales. Un té con miel es tu mejor aliado."],
            ].map(([ico,tit,desc])=>`
              <div style="display:flex;gap:.6rem;padding:.6rem;background:rgba(255,255,255,.03);
                border-radius:10px;border:1px solid rgba(255,255,255,.05)">
                <span style="font-size:1rem;flex-shrink:0">${ico}</span>
                <div>
                  <div style="font-size:.78rem;font-weight:700;margin-bottom:.15rem">${tit}</div>
                  <div style="font-size:.72rem;color:#6B7280;line-height:1.4">${desc}</div>
                </div>
              </div>`).join("")}
          </div>
        </details>

        <!-- Eventos de Karaoke Relacionados -->
        ${getEventsModuleHTML()}

      </div>
    </div>
  </div>`;
}

function _btnStyle(bg, border="none") {
  return `flex:1;min-width:88px;background:${bg};border:${border};color:#fff;font-family:'Nunito',sans-serif;
    font-weight:700;font-size:.82rem;padding:.55rem .7rem;border-radius:10px;cursor:pointer;transition:opacity .2s;`;
}

window._overrideVT = function(newVt) {
  if (!lastResult) return;
  lastResult.vt   = newVt;
  lastResult.conf = 95; // user knows their own voice type
  const newMatches = getMatches(lastResult.vec || new Array(27).fill(0.5), newVt, lastResult.gender, {}, 5);
  lastResult.matches = newMatches;
  preloadImages(newMatches.map(m => m.name)).then(() => renderResults(lastResult));
};

function _resetApp() {
  // Limpia estado global
  lastResult = null;
  window._audioBlob = null;
  window._lastFile  = null;
  // Limpia el div de resultados
  const resEl = document.getElementById("results");
  if (resEl) resEl.innerHTML = "";
  // Re-inyecta la UI inicial (grabar/subir)
  const mount = document.getElementById("app-mount");
  if (mount) {
    mount.removeAttribute("data-ui");
    mount.innerHTML = '<div style="color:var(--m); font-weight:700">Cargando...</div>';
    injectUI();
  }
  // Scroll suave al analizador
  const analizador = document.getElementById("analizador") || document.getElementById("app");
  if (analizador) analizador.scrollIntoView({ behavior:"smooth", block:"start" });
}

function _sendFeedback(isOk) {
  const okBtn = document.getElementById("_fb_ok");
  const koBtn = document.getElementById("_fb_ko");
  if (!okBtn || !koBtn) return;
  // Visual: marca el elegido
  okBtn.style.opacity = isOk ? "1" : "0.3";
  koBtn.style.opacity = isOk ? "0.3" : "1";
  okBtn.style.transform = isOk ? "scale(1.3)" : "scale(1)";
  koBtn.style.transform = isOk ? "scale(1)" : "scale(1.3)";
  // Guardar en localStorage para aprendizaje futuro
  try {
    const vt = lastResult?.vt || "unknown";
    const top = lastResult?.matches?.[0]?.name || "unknown";
    const log = JSON.parse(localStorage.getItem("_hm_fb") || "[]");
    log.push({ ts: Date.now(), ok: isOk, vt, top });
    if (log.length > 200) log.splice(0, log.length - 200);
    localStorage.setItem("_hm_fb", JSON.stringify(log));
  } catch(e) {}
  // Mensaje de agradecimiento breve
  const msg = isOk ? "¡Gracias! 🙌" : "¡Gracias! Seguimos mejorando 🔧";
  showStatus(msg);
  setTimeout(() => showStatus(""), 2500);
}

function _share(p) {
  if (!lastResult?.matches?.[0]) return;
  const m   = lastResult.matches[0];
  const pct = displayScore(m.score);
  const txt = tr("_share_txt").replace("{name}",m.name).replace("{pct}",pct);
  if (p==="wa") window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, "_blank");
  if (p==="x")  window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(txt)}`, "_blank");
  if (p==="cp") navigator.clipboard.writeText(txt).then(()=>{ showStatus("✅ Copiado!"); setTimeout(()=>showStatus(""),2e3); });
  if (p==="card") showViralCard();
}

function showViralCard() {
  if (!lastResult) return;
  const {vt, conf, matches} = lastResult;
  const vtName = trV("_vt_names", vt);
  const top3   = matches.slice(0,3);
  const vtColors = {
    "baritone":"#7C4DFF","bass":"#1E3A5F","bass-baritone":"#2d4d8f",
    "tenor":"#118AB2","soprano":"#FF4FA3","mezzo-soprano":"#FF9F1C",
    "contralto":"#80B918","countertenor":"#06D6A0"
  };
  const color = vtColors[vt] || "#7C4DFF";

  const phrases = {
    "baritone":["Tu voz tiene el poder de un clásico 🎭","Freddie Mercury era barítono. ¿Y tú? 🤘","La voz más versátil del mundo. Úsala 🎤"],
    "tenor":   ["Tu voz llega donde otros no pueden ✨","El Do de pecho es tu territorio 🏆","Los tenores hacen historia 🎼"],
    "soprano": ["Tu voz es pura magia ✨","Mariah Carey empezó como tú 🌟","Las sopranos conquistan el mundo 👑"],
    "mezzo-soprano":["Adele cambió el mundo con esta voz 💜","La más expresiva del espectro 🎶","Tu timbre es único e irrepetible 🔥"],
    "contralto":["Una rareza vocal privilegiada 🌿","Nina Simone tenía tu voz 🎹","Tu registro grave es tu superpoder 💚"],
    "bass":    ["Los graves más poderosos del mundo 🎸","Johnny Cash tenía tu voz 🖤","Tu voz hace temblar el escenario ⚡"],
    "bass-baritone":["Voz imponente y única 💙","Entre los graves y la versatilidad 🎵","Tu rango es la envidia de muchos 🎭"],
    "countertenor":["La voz más sorprendente del mundo 🌈","Tu falsetto es tu mayor tesoro 💎","Una rareza vocal extraordinaria ⭐"],
  };
  const phraseArr = phrases[vt] || ["Tu voz es única 🎤","Nadie canta como tú 🌟","El mundo necesita tu voz 🎵"];
  const phrase = phraseArr[Math.floor(Math.random() * phraseArr.length)];

  // Top artista para foto grande
  const top1 = top3[0];
  const top1Img = MONO_IMGS[top1?.name] || imgCache[top1?.name] || getInitialsAvatar(top1?.name||"?");

  const artistRows = top3.map((m,i) => {
    const img = MONO_IMGS[m.name] || imgCache[m.name] || getInitialsAvatar(m.name);
    const pct = displayScore(m.score);
    const medals = ["🥇","🥈","🥉"];
    const sizes = ["18px","14px","13px"];
    return `
      <div style="display:flex;align-items:center;gap:10px;padding:${i===0?'10px 12px':'7px 12px'};
        background:${i===0?'rgba(255,255,255,.13)':'rgba(255,255,255,.06)'};
        border-radius:14px;margin-bottom:7px;
        ${i===0?'border:1px solid rgba(255,255,255,.2);':''} ">
        <span style="font-size:${i===0?'22px':'17px'}">${medals[i]}</span>
        <div style="width:${i===0?'48px':'38px'};height:${i===0?'48px':'38px'};
          border-radius:50%;overflow:hidden;flex-shrink:0;
          border:2px solid ${i===0?color:'rgba(255,255,255,.2)'}">
          <img src="${img}" alt="${m.name}" style="width:100%;height:100%;object-fit:cover"
            onerror="this.src='${getInitialsAvatar(m.name)}'">
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:${i===0?'800':'700'};font-size:${sizes[i]};
            white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
            color:${i===0?'#fff':'rgba(255,255,255,.85)'}">${m.name}</div>
          <div style="font-size:10px;color:rgba(255,255,255,.5);text-transform:capitalize">
            ${trV("_vt_names",m.voice_type)}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:800;font-size:${i===0?'22px':'16px'};
            background:linear-gradient(135deg,#fff,${color});
            -webkit-background-clip:text;-webkit-text-fill-color:transparent">${pct}%</div>
        </div>
      </div>`;
  }).join("");

  const modal = document.createElement("div");
  modal.id = "_viral_modal";
  modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem;overflow-y:auto;";

  modal.innerHTML = `
    <div style="max-width:360px;width:100%;margin:auto">

      <!-- TARJETA VIRAL -->
      <div id="_viral_card" style="
        background:linear-gradient(170deg,#0f0820 0%,#1a0a35 35%,#0a1228 70%,#050510 100%);
        border-radius:28px;padding:24px 20px 20px;color:#fff;
        border:1px solid rgba(255,255,255,.15);
        box-shadow:0 24px 80px rgba(0,0,0,.7), 0 0 0 1px ${color}44;
        font-family:'Nunito',sans-serif;
        position:relative;overflow:hidden;">

        <!-- Destellos de fondo -->
        <div style="position:absolute;top:-80px;right:-50px;width:220px;height:220px;
          border-radius:50%;background:radial-gradient(circle,${color}35 0%,transparent 70%);pointer-events:none"></div>
        <div style="position:absolute;bottom:-60px;left:-40px;width:180px;height:180px;
          border-radius:50%;background:radial-gradient(circle,#FF4FA355 0%,transparent 70%);pointer-events:none"></div>
        <div style="position:absolute;top:50%;left:-30px;width:100px;height:100px;
          border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.03) 0%,transparent 70%);pointer-events:none"></div>

        <!-- Top bar -->
        <div style="display:flex;align-items:center;justify-content:space-between;
          margin-bottom:18px;position:relative">
          <div>
            <div style="font-size:9px;font-weight:800;letter-spacing:.18em;
              color:rgba(255,255,255,.4);text-transform:uppercase">¿A QUÉ CANTANTE</div>
            <div style="font-size:9px;font-weight:800;letter-spacing:.18em;
              color:rgba(255,255,255,.4);text-transform:uppercase">TE PARECES?</div>
          </div>
          <div style="background:linear-gradient(135deg,${color},#FF4FA3);
            padding:4px 12px;border-radius:20px;font-size:10px;font-weight:800;
            letter-spacing:.05em">harmiq.app</div>
        </div>

        <!-- Tipo de voz grande -->
        <div style="text-align:center;margin-bottom:16px;position:relative">
          <div style="font-size:10px;color:rgba(255,255,255,.45);text-transform:uppercase;
            letter-spacing:.12em;margin-bottom:2px">Tu tipo de voz</div>
          <div style="font-family:'Baloo 2',sans-serif;font-weight:900;
            font-size:clamp(36px,10vw,48px);line-height:1;
            background:linear-gradient(135deg,#ffffff 30%,${color} 70%,#FF4FA3 100%);
            -webkit-background-clip:text;-webkit-text-fill-color:transparent;
            text-transform:capitalize;margin-bottom:4px">${vtName}</div>
          <div style="display:inline-flex;align-items:center;gap:6px;
            background:rgba(255,255,255,.08);padding:3px 10px;border-radius:20px">
            <div style="width:6px;height:6px;border-radius:50%;background:${color}"></div>
            <span style="font-size:11px;color:rgba(255,255,255,.6)">${conf}% confianza</span>
          </div>
        </div>

        <!-- Artistas top 3 -->
        <div style="margin-bottom:14px;position:relative">
          ${artistRows}
        </div>

        <!-- Frase motivadora -->
        <div style="text-align:center;padding:12px 8px;
          background:rgba(255,255,255,.05);border-radius:14px;
          border:1px solid rgba(255,255,255,.08);position:relative;margin-bottom:14px">
          <div style="font-size:12px;color:rgba(255,255,255,.8);
            font-style:italic;line-height:1.5">${phrase}</div>
        </div>

        <!-- Footer CTA -->
        <div style="text-align:center;position:relative">
          <div style="font-size:11px;color:rgba(255,255,255,.4);margin-bottom:4px">
            Descubre el tuyo gratis en
          </div>
          <div style="font-family:'Baloo 2',sans-serif;font-weight:900;font-size:18px;
            background:linear-gradient(135deg,${color},#FF4FA3);
            -webkit-background-clip:text;-webkit-text-fill-color:transparent">
            🎙️ harmiq.app
          </div>
        </div>
      </div>

      <!-- BOTONES COMPARTIR -->
      <div style="margin-top:12px;background:rgba(255,255,255,.05);
        border-radius:20px;padding:14px;border:1px solid rgba(255,255,255,.08)">
        <p style="text-align:center;font-size:.75rem;color:#6B7280;margin-bottom:10px;font-weight:600">
          📲 Comparte tu resultado
        </p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.45rem">
          <button onclick="_shareCard('wa')"
            style="background:#25D366;color:#fff;border:none;padding:.6rem .5rem;border-radius:12px;
            font-weight:700;font-size:.8rem;cursor:pointer;display:flex;align-items:center;
            justify-content:center;gap:.3rem;transition:opacity .2s"
            onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">
            💬 WhatsApp
          </button>
          <button onclick="_shareCard('tg')"
            style="background:#229ED9;color:#fff;border:none;padding:.6rem .5rem;border-radius:12px;
            font-weight:700;font-size:.8rem;cursor:pointer;display:flex;align-items:center;
            justify-content:center;gap:.3rem"
            onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">
            ✈️ Telegram
          </button>
          <button onclick="_shareCard('x')"
            style="background:#000;color:#fff;border:1px solid #333;padding:.6rem .5rem;border-radius:12px;
            font-weight:700;font-size:.8rem;cursor:pointer;display:flex;align-items:center;
            justify-content:center;gap:.3rem"
            onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">
            🐦 Twitter/X
          </button>
          <button onclick="_shareCard('ig')"
            style="background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);
            color:#fff;border:none;padding:.6rem .5rem;border-radius:12px;
            font-weight:700;font-size:.8rem;cursor:pointer;display:flex;align-items:center;
            justify-content:center;gap:.3rem"
            onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">
            📸 Instagram
          </button>
          <button onclick="_shareCard('cp')"
            style="background:rgba(124,77,255,.25);color:#a89fff;
            border:1px solid rgba(124,77,255,.35);padding:.6rem .5rem;border-radius:12px;
            font-weight:700;font-size:.8rem;cursor:pointer;display:flex;align-items:center;
            justify-content:center;gap:.3rem"
            onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">
            📋 Copiar texto
          </button>
          <button onclick="document.getElementById('_viral_modal').remove()"
            style="background:rgba(255,255,255,.06);color:#6B7280;
            border:1px solid rgba(255,255,255,.08);padding:.6rem .5rem;border-radius:12px;
            font-weight:700;font-size:.8rem;cursor:pointer;display:flex;align-items:center;
            justify-content:center;gap:.3rem">
            ✕ Cerrar
          </button>
        </div>
        <p style="text-align:center;font-size:.68rem;color:#4B5563;margin-top:8px">
          💡 Haz captura de pantalla para compartir la tarjeta como imagen
        </p>
      </div>
    </div>`;

  document.body.appendChild(modal);
  modal.addEventListener("click", e => { if(e.target===modal) modal.remove(); });
}

function _shareCard(p) {
  if (!lastResult?.matches?.[0]) return;
  const m   = lastResult.matches[0];
  const pct = displayScore(m.score);
  const vtn = trV("_vt_names", lastResult.vt);
  const url = "https://harmiq.app";
  const txt = `🎤 Tengo voz de ${vtn} y me parezco a ${m.name} con un ${pct}% de similitud. ¿A qué cantante te pareces tú? 👉 ${url}`;
  if (p==="wa") window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, "_blank");
  if (p==="tg") window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(txt)}`, "_blank");
  if (p==="x")  window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(txt)}`, "_blank");
  if (p==="ig") {
    // Instagram no tiene API de compartir directa; copiar texto y abrir Instagram
    navigator.clipboard.writeText(txt).then(()=>{
      showStatus("✅ Texto copiado — pégalo en Instagram Stories");
      setTimeout(()=>{
        window.open("https://www.instagram.com/", "_blank");
      }, 800);
      setTimeout(()=>showStatus(""),4000);
    });
  }
  if (p==="cp") navigator.clipboard.writeText(txt).then(()=>{
    showStatus("✅ Texto copiado al portapapeles");
    setTimeout(()=>showStatus(""),2500);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 11. PÁGINAS SEO /voz/* — SPA con History API
// ═══════════════════════════════════════════════════════════════════════════════
const VOZ_DATA = {
  baritono: {
    emoji:"🎭", color:"#7C4DFF", range:"Sol2 – Sol4", hz:"98 – 392 Hz",
    ytId: "E_h-T5ZKZDU", ytId2: "rmopMoKJo34",
    artists:["Frank Sinatra","Elvis Presley","Michael Bublé","David Bowie","Freddie Mercury","Alejandro Sanz","Joaquín Sabina","Serrat"],
    artistImgs:{
      "Frank Sinatra":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Frank_Sinatra_-_publicity.jpg/220px-Frank_Sinatra_-_publicity.jpg",
      "Elvis Presley":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Elvis_Presley_promoting_Jailhouse_Rock.jpg/220px-Elvis_Presley_promoting_Jailhouse_Rock.jpg",
    },
    mics:[
      {name:"Shure SM7B",reason:"Estándar broadcast para voces graves y cálidas. Ideal para el rango barítono.",search:"Shure SM7B microfono"},
      {name:"Audio-Technica AT4040",reason:"Captura perfectamente el rango medio-bajo con gran detalle.",search:"Audio Technica AT4040"},
      {name:"Rode NT2-A",reason:"Gran versatilidad para voces profundas con tres patrones polares.",search:"Rode NT2-A Microphone Kit"},
    ],
    pro_mics:["Neumann U87","AKG C414 XLII"],
    home_studio:{
      fun:   [{name:"Fifine K669B USB",search:"Fifine K669B"},{name:"Auriculares OneOdio Pro-10",search:"OneOdio Pro-10"}],
      basic: [{name:"Shure MV7 USB/XLR",search:"Shure MV7"},{name:"Filtro anti-pop doble",search:"filtro antipop microfono"},{name:"Brazo articulado",search:"brazo articulado microfono"}],
      medium:[{name:"Focusrite Scarlett 2i2",search:"Focusrite Scarlett 2i2"},{name:"Shure SM7B",search:"Shure SM7B"},{name:"Sony MDR-7506",search:"Sony MDR 7506"}],
      pro:   [{name:"Universal Audio Apollo Twin",search:"UA Apollo Twin"},{name:"Neumann U87",search:"Neumann U87"},{name:"Yamaha HS8",search:"Yamaha HS8 monitores"}],
    },
    songs:["My Way – Frank Sinatra","Perfect – Ed Sheeran","Hallelujah – Leonard Cohen","Corazón Partío – Alejandro Sanz","Hotel California – Eagles","Bohemian Rhapsody – Queen","Let It Be – Beatles","Creep – Radiohead"],
    exercises_es:[
      "Escalas de Do mayor subiendo por semitonos — canta lento, sin forzar",
      "Arpegios Sol2–Sol4–Sol2 en 'ah' con boca abierta",
      "Vocalizaciones ma-me-mi-mo-mu en escala ascendente y descendente",
      "Sirenas completas del grave al agudo en 'oooo' suave",
      "Humming con labios cerrados — siente la resonancia en la cabeza",
      "Lip trill (vibración de labios) subiendo y bajando la escala",
      "Ejercicio de passaggio: trabaja el Si2-Re3 suavemente sin romper",
      "Calentamiento de 5 minutos: bostezos + rotación de cuello + humming",
    ],
    exercises_en:[
      "C major scales ascending by semitones — slow, no forcing",
      "Arpeggios G2–G4–G2 on 'ah' with open mouth",
      "Vocalizations ma-me-mi-mo-mu on ascending/descending scale",
      "Full sirens low to high on soft 'oooo'",
      "Lip-closed humming — feel the resonance in your head",
      "Lip trill up and down the scale",
      "Passaggio exercise: work the B2-D3 gently without breaking",
      "5-minute warm-up: yawns + neck rotation + humming",
    ],
    desc_es:"El barítono es el tipo de voz masculina más común y versátil del mundo. Su zona de confort abarca desde el Sol2 al Sol4, con un timbre cálido, oscuro y proyectado que lo hace ideal para el pop, el rock, el jazz y la música clásica. Se estima que el 60-70% de los cantantes masculinos son barítonos, aunque muchos no lo saben porque no han hecho ningún análisis vocal. Entre los barítonos más famosos de la historia se encuentran Frank Sinatra, Elvis Presley, David Bowie, Freddie Mercury (sí, era barítono con extensión de tenor), Alejandro Sanz y Michael Bublé. La riqueza armónica del barítono permite tanto el drama de la ópera como la intimidad del jazz o la potencia del rock. Si eres barítono, tu zona de mayor poder está entre el La2 y el Mi4. Con técnica y entrenamiento vocal, puedes extender tu registro hacia el Sol4 y más arriba usando mix voice. El secreto del barítono moderno no es llegar al agudo a la fuerza, sino construir una voz completa desde los graves.",
    desc_en:"The baritone is the most common and versatile male voice type in the world. Its comfort zone spans from G2 to G4, with a warm, dark, projected timbre ideal for pop, rock, jazz and classical music. An estimated 60-70% of male singers are baritones, though many don't know it because they've never done a vocal analysis.  Famous baritones include Frank Sinatra, Elvis Presley, David Bowie, Freddie Mercury (yes, he was a baritone with tenor extension), Alejandro Sanz and Michael Bublé. The harmonic richness of the baritone allows both operatic drama and jazz intimacy.  If you're a baritone, your power zone is between A2 and E4. With vocal technique and training, you can extend your range to G4 and beyond using mix voice.",
  },

  tenor: {
    emoji:"🎤", color:"#118AB2", range:"Do3 – Do5", hz:"131 – 523 Hz",
    ytId: "9fTGr5e5Ksk", ytId2: "KVLtTX3d0Kk",
    artists:["Luciano Pavarotti","Andrea Bocelli","Benson Boone","Camilo Sesto","Alejandro Fernández","Roberto Carlos","Il Volo","Plácido Domingo"],
    artistImgs:{
      "Pavarotti":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Luciano_Pavarotti_with_Tommy_Tune_%28cropped%29.jpg/220px-Luciano_Pavarotti_with_Tommy_Tune_%28cropped%29.jpg",
    },
    mics:[
      {name:"Audio-Technica AT2035",reason:"Realce en la 'banda de aire' (10-12kHz) captura los armónicos agudos del tenor.",search:"Audio Technica AT2035"},
      {name:"Rode NT1-A",reason:"Ultrabajo ruido de fondo para los pianissimos del tenor lírico.",search:"Rode NT1-A Microphone Package"},
      {name:"AKG C214",reason:"Calidad profesional, captura el carácter musical del tenor con precisión.",search:"AKG C214 microfono"},
    ],
    pro_mics:["Neumann TLM 103","Telefunken ELAM 251"],
    home_studio:{
      fun:   [{name:"Fifine K669B USB",search:"Fifine K669B"},{name:"Auriculares AKG K52",search:"AKG K52"}],
      basic: [{name:"Rode NT-USB",search:"Rode NT USB"},{name:"Filtro anti-pop metálico",search:"filtro antipop metalico"},{name:"Soporte de mesa",search:"soporte microfono mesa"}],
      medium:[{name:"Focusrite Scarlett Solo",search:"Focusrite Scarlett Solo"},{name:"AT2035",search:"Audio Technica AT2035"},{name:"Audio-Technica M40x",search:"Audio Technica ATH M40x"}],
      pro:   [{name:"Apollo Solo",search:"Universal Audio Apollo Solo"},{name:"Neumann TLM 103",search:"Neumann TLM 103"},{name:"Yamaha HS5",search:"Yamaha HS5 monitores"}],
    },
    songs:["Nessun Dorma – Pavarotti","Con Te Partirò – Bocelli","Beautiful Things – Benson Boone","Libre – Nino Bravo","Tu Cárcel – Los Yonics","Bésame Mucho – Trio Los Panchos","O Sole Mio – Traditional","Ave María – Schubert"],
    exercises_es:[
      "Sirenas ascendentes hasta Do5 en 'ee' — mantén la posición alta de laringe",
      "Escalas en mezzo voce (media voz) — nunca a plena potencia en el calentamiento",
      "Ejercicios de mix voice: alterna chest voice y head voice en zona Si3-Re4",
      "Trinos en La3-Do4 con lengua y labios relajados",
      "Vocalizaciones en 'i' cerrada — levanta el velo del paladar",
      "Escala cromática del Do3 al Do5 lentamente, buscando homogeneidad",
      "Messa di voce en Sol3: empieza piano, crece al máximo, vuelve a piano",
      "Ejercicio de apoyo: canta una escala de 5 notas empujando ligeramente el diafragma",
    ],
    exercises_en:[
      "Ascending sirens to C5 on 'ee' — keep high larynx position",
      "Mezzo voce scales — never full power during warm-up",
      "Mix voice exercises: alternate chest and head voice in B3-D4 zone",
      "Trills on A3-C4 with relaxed tongue and lips",
      "Closed 'i' vocalizations — raise the soft palate",
      "Chromatic scale from C3 to C5 slowly, looking for homogeneity",
      "Messa di voce on G3: start piano, grow to maximum, return to piano",
      "Support exercise: sing a 5-note scale gently pushing the diaphragm",
    ],
    desc_es:"El tenor es la voz masculina más aguda de las categorías principales, y también la más demandada en el pop, el rock y la ópera. Su rango abarca desde el Do3 al Do5, aunque los tenores líricos pueden superar el Do5 con técnica avanzada. El Do5 (Do de pecho) es considerado el 'Santo Grial' de la voz masculina — el momento en que un tenor demuestra su dominio técnico.  Los tenores más icónicos de la historia incluyen a Luciano Pavarotti, Plácido Domingo, Andrea Bocelli, y en el pop moderno artistas como Benson Boone, Bruno Mars o Camilo. La voz de tenor tiene una brillantez y proyección natural que llena cualquier espacio sin amplificación.  Si eres tenor, tu desafío principal es el passaggio (zona de transición de pecho a cabeza), que en tu caso ocurre aproximadamente entre el Mi4 y el Sol4. Aprender a navegar esa zona con mix voice es la clave para un tenor completo y versátil.",
    desc_en:"The tenor is the highest of the main male voice categories, and also the most in-demand in pop, rock and opera. Its range spans from C3 to C5, though lyric tenors can surpass C5 with advanced technique. High C (chest C5) is considered the 'Holy Grail' of male singing.  Iconic tenors include Luciano Pavarotti, Plácido Domingo, Andrea Bocelli, and in modern pop Benson Boone, Bruno Mars and Camilo. The tenor voice has a natural brightness and projection that fills any space without amplification.",
  },

  soprano: {
    emoji:"✨", color:"#FF4FA3", range:"Do4 – Do6", hz:"261 – 1047 Hz",
    ytId: "5hR8-YSfFvI", ytId2: "bAsXMCiB5nQ",
    artists:["Mariah Carey","Whitney Houston","Celine Dion","Ariana Grande","Sabrina Carpenter","María Callas","Montserrat Caballé","Isabel Pantoja"],
    artistImgs:{
      "Mariah Carey":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mariah_Carey_2019_by_Glenn_Francis.jpg/220px-Mariah_Carey_2019_by_Glenn_Francis.jpg",
      "Whitney Houston":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Whitney_Houston_Welcome_Home_Heroes_1.jpg/220px-Whitney_Houston_Welcome_Home_Heroes_1.jpg",
      "Celine Dion":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Celine_dion_2017.jpg/220px-Celine_dion_2017.jpg",
      "Ariana Grande":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Ariana_Grande_in_2019.jpg/220px-Ariana_Grande_in_2019.jpg",
    },
    mics:[
      {name:"Neumann TLM 102",reason:"La referencia profesional para voces de soprano. Captura los agudos con fidelidad total.",search:"Neumann TLM 102"},
      {name:"Audio-Technica AT2020",reason:"Captura armónicos brillantes sin saturación en los agudos extremos.",search:"Audio Technica AT2020 USB"},
      {name:"Rode NT1",reason:"Ruido de fondo casi nulo, ideal para los pianissimos de soprano.",search:"Rode NT1 5th Gen Microphone Only"},
    ],
    pro_mics:["Neumann U87","Sennheiser MKH 40"],
    home_studio:{
      fun:   [{name:"Fifine K669B USB",search:"Fifine K669B"},{name:"Auriculares Superlux HD681",search:"Superlux HD681"}],
      basic: [{name:"Rode NT-USB",search:"Rode NT USB"},{name:"Pop filter doble",search:"filtro antipop doble"},{name:"Soporte de mesa articulado",search:"soporte microfono articulado"}],
      medium:[{name:"Focusrite Scarlett Solo",search:"Focusrite Scarlett Solo"},{name:"AKG C214",search:"AKG C214"},{name:"Audio-Technica M50x",search:"Audio Technica ATH M50x"}],
      pro:   [{name:"Apollo Solo",search:"Universal Audio Apollo Solo"},{name:"Neumann TLM 103",search:"Neumann TLM 103"},{name:"Yamaha HS5",search:"Yamaha HS5"}],
    },
    songs:["Hero – Mariah Carey","I Will Always Love You – Whitney Houston","My Heart Will Go On – Celine Dion","God is a Woman – Ariana Grande","Casta Diva – Bellini","Ave María – Schubert","O Mio Babbino Caro – Puccini","Concierto de Aranjuez – Versión vocal"],
    exercises_es:[
      "Trinos en Re5-La5 con vocales abiertas — relaja la mandíbula completamente",
      "Escalas de octava completas Do4-Do5-Do4 en 'ah' y 'oh'",
      "Pianissimo en los agudos: Do5-Mi5 en la dinámica más suave posible",
      "Portamentos suaves descendentes desde La5 — evita saltos bruscos",
      "Vocalizaciones en 'ah' con resonancia de cabeza — imagen mental: canta 'hacia arriba'",
      "Ejercicio de legato: escala de Do mayor atada sin ataques de glotis",
      "Staccato en Re5: notas picadas sin tensión de garganta",
      "Calentamiento con lip trill suave — no fuerce los agudos en frío",
    ],
    exercises_en:[
      "Trills D5-A5 with open vowels — completely relax the jaw",
      "Full octave scales C4-C5-C4 on 'ah' and 'oh'",
      "Pianissimo on high notes: C5-E5 at softest possible dynamic",
      "Gentle descending portamentos from A5 — avoid abrupt jumps",
      "Head resonance vocalizations on 'ah' — mental image: sing 'upward'",
      "Legato exercise: C major scale tied without glottal attacks",
      "Staccato on D5: detached notes without throat tension",
      "Warm-up with gentle lip trill — never force high notes cold",
    ],
    desc_es:"La soprano es la voz femenina más aguda y la que históricamente ha dominado la ópera y el pop de alta gama. Su extensión natural va del Do4 al La5, con las sopranos de coloratura alcanzando el Do6 y más allá. Es la voz más luminosa, brillante y dramática del espectro vocal humano.  Mariah Carey es probablemente la soprano pop más famosa del mundo, conocida por su whistle register (registro de silbido) que alcanza el Sol7. Whitney Houston, Celine Dion y Ariana Grande también son sopranos reconocidas. En la ópera clásica, María Callas y Montserrat Caballé son referentes absolutos.  Si eres soprano, tu tesoro es el registro agudo y tu reto principal es mantener la calidad tímbrica en toda la extensión. El passaggio femenino ocurre aproximadamente en Mi4-Sol4 (según el subtipo de soprano) y requiere un trabajo especial de mix voice para que la transición sea imperceptible.",
    desc_en:"The soprano is the highest female voice type and historically the one that has dominated opera and high-end pop. Its natural range spans from C4 to A5, with coloratura sopranos reaching C6 and beyond. It is the most luminous, brilliant and dramatic voice in the human vocal spectrum.  Mariah Carey is probably the world's most famous pop soprano, known for her whistle register reaching G7. Whitney Houston, Celine Dion and Ariana Grande are also recognized sopranos. In classical opera, Maria Callas and Montserrat Caballé are absolute references.",
  },

  "mezzo-soprano": {
    emoji:"🎶", color:"#FF9F1C", range:"La3 – La5", hz:"220 – 880 Hz",
    ytId: "bAsXMCiB5nQ",
    artists:["Adele","Amy Winehouse","Beyoncé","Rosalía","Tracy Chapman","Billie Eilish","Lana Del Rey","Norah Jones"],
    artistImgs:{
      "Adele":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Adele_2016.jpg/220px-Adele_2016.jpg",
      "Amy Winehouse":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Amy_Winehouse_2007.jpg/220px-Amy_Winehouse_2007.jpg",
      "Beyoncé":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Beyoncé_in_Cannes_%282012%29.jpg/220px-Beyoncé_in_Cannes_%282012%29.jpg",
    },
    mics:[
      {name:"Rode NT1",reason:"Captura la calidez del registro medio con precisión y bajo ruido.",search:"Rode NT1 5th Gen Microphone Only"},
      {name:"Audio-Technica AT2035",reason:"Equilibrio perfecto para voces de potencia media-alta.",search:"Audio Technica AT2035"},
      {name:"Shure SM27",reason:"Versátil y natural, ideal para el rango completo del mezzo.",search:"Shure SM27 microfono"},
    ],
    pro_mics:["Neumann U87","AKG C414 XLII"],
    home_studio:{
      fun:   [{name:"Fifine K669B USB",search:"Fifine K669B"},{name:"Auriculares AKG K92",search:"AKG K92"}],
      basic: [{name:"Rode NT-USB",search:"Rode NT USB"},{name:"Filtro anti-pop",search:"filtro antipop microfono"},{name:"Brazo articulado básico",search:"brazo microfono mesa"}],
      medium:[{name:"Focusrite Scarlett 2i2",search:"Focusrite Scarlett 2i2"},{name:"AT2020",search:"Audio Technica AT2020"},{name:"Sony MDR-7506",search:"Sony MDR 7506"}],
      pro:   [{name:"Apollo Twin",search:"UA Apollo Twin"},{name:"AKG C414",search:"AKG C414"},{name:"Yamaha HS5",search:"Yamaha HS5"}],
    },
    songs:["Rolling in the Deep – Adele","Rehab – Amy Winehouse","Crazy in Love – Beyoncé","Con Altura – Rosalía","Fast Car – Tracy Chapman","Bad Guy – Billie Eilish","Summertime Sadness – Lana Del Rey","Come Away With Me – Norah Jones"],
    exercises_es:[
      "Escalas La3-La5 subiendo y bajando en 'ah' — trabaja tanto el pecho como la cabeza",
      "Arpegios de tríada La3-Do4-Mi4-La4 en todas las vocales",
      "Vocalizaciones en 'nay-nay' — posición nasal que ayuda a la resonancia media",
      "Ejercicios de pecho hacia abajo: Fa3-Re3 con pleno apoyo diafragmático",
      "Sirenas Do3-Do5 en 'oooo' — sin breaks, transición suave en el passaggio",
      "Staccato en Re4: notas picadas con boca semifría",
      "Ejercicio de 'ng': escala cromática en posición nasal abierta",
      "Mix voice Do4-Sol4: alterna entre pecho y mezcla sin tensión",
    ],
    exercises_en:[
      "Scales A3-A5 up and down on 'ah' — work both chest and head register",
      "Triad arpeggios A3-C4-E4-A4 on all vowels",
      "Vocalizations on 'nay-nay' — nasal position that helps middle resonance",
      "Downward chest exercises: F3-D3 with full diaphragm support",
      "Sirens C3-C5 on 'oooo' — no breaks, smooth passaggio transition",
      "Staccato on D4: detached notes with semi-open mouth",
      "'Ng' exercise: chromatic scale in open nasal position",
      "Mix voice C4-G4: alternate chest and mix without tension",
    ],
    desc_es:"La mezzosoprano es la voz femenina media, poderosa y rica en armónicos. Su timbre cálido, carnoso y expresivo la convierte en la voz más completa y versátil del espectro femenino. El rango natural va del La3 al La5, aunque con técnica puede extenderse en ambas direcciones.  Algunas de las artistas más influyentes de los últimos 30 años son mezzosopranos: Adele, Beyoncé, Amy Winehouse, Rosalía, Billie Eilish y Lana Del Rey. Esta voz domina el soul, el R&B, el pop de autor y el flamenco por su capacidad de expresar emociones complejas con matices únicos.  Si eres mezzosoprano, tu mayor fortaleza es la zona Do4-La4, donde tu voz suena más plena y proyectada. Con entrenamiento puedes desarrollar un poderoso registro de pecho hacia abajo (Fa3-Do3) y un head voice brillante hasta el Do5.",
    desc_en:"The mezzo-soprano is the middle female voice type, powerful and rich in harmonics. Its warm, full and expressive timbre makes it the most complete and versatile voice in the female spectrum. The natural range is A3 to A5, though with technique it can extend in both directions.  Some of the most influential artists of the last 30 years are mezzo-sopranos: Adele, Beyoncé, Amy Winehouse, Rosalía, Billie Eilish and Lana Del Rey.",
  },

  contralto: {
    emoji:"🌿", color:"#80B918", range:"Fa3 – Fa5", hz:"175 – 698 Hz",
    ytId: "N_RhvtKpSQE",
    artists:["Tracy Chapman","Norah Jones","Cher","Nina Simone","k.d. lang","Tina Turner","Macy Gray","Alanis Morissette"],
    artistImgs:{},
    mics:[
      {name:"Shure SM7B",reason:"Diseñado para voces graves, el SM7B captura la profundidad única de la contralto.",search:"Shure SM7B"},
      {name:"Rode Procaster",reason:"Dinámico con gran cuerpo y calidez para voces graves femeninas.",search:"Rode Procaster Dynamic Microphone"},
      {name:"Audio-Technica AT4040",reason:"Condensador cálido que favorece el registro grave con detalle.",search:"Audio Technica AT4040"},
    ],
    pro_mics:["Neumann U87","Telefunken U47"],
    home_studio:{
      fun:   [{name:"Fifine K669B USB",search:"Fifine K669B"},{name:"Auriculares Superlux HD668B",search:"Superlux HD668B"}],
      basic: [{name:"Shure MV7",search:"Shure MV7"},{name:"Pop filter",search:"filtro antipop"},{name:"Soporte articulado",search:"brazo microfono"}],
      medium:[{name:"Focusrite Scarlett 2i2",search:"Focusrite Scarlett 2i2"},{name:"AT4040",search:"Audio Technica AT4040"},{name:"Beyerdynamic DT 770 Pro",search:"Beyerdynamic DT 770 Pro"}],
      pro:   [{name:"Apollo Twin",search:"UA Apollo Twin"},{name:"Neumann U87",search:"Neumann U87"},{name:"Yamaha HS8",search:"Yamaha HS8"}],
    },
    songs:["Fast Car – Tracy Chapman","Come Away With Me – Norah Jones","Believe – Cher","Feeling Good – Nina Simone","Constant Craving – k.d. lang","River Deep Mountain High – Tina Turner","I Try – Macy Gray","You Oughta Know – Alanis Morissette"],
    exercises_es:[
      "Humming en Fa3-Do4 — siente la resonancia en el pecho, no en la garganta",
      "Ejercicios de registro de pecho profundo: Do3-Fa3 con apoyo total",
      "Sirenas Do3-Do5 suaves — la contralto tiene graves únicos, no los fuerces",
      "Vocalizaciones en 'oo' grave con mandíbula completamente relajada",
      "Escalas descendentes con apoyo diafragmático máximo — Do4 a Do3",
      "Ejercicio de 'oh' oscuro en Fa3: imagina cantar desde el pecho",
      "Extensión de agudos en head voice suave: Do5-Fa5 sin tensión",
      "Calentamiento de 10 minutos obligatorio antes de cualquier sesión",
    ],
    exercises_en:[
      "Humming on F3-C4 — feel the resonance in your chest, not throat",
      "Deep chest register exercises: C3-F3 with full support",
      "Gentle sirens C3-C5 — your low notes are unique, don't force them",
      "Low 'oo' vocalizations with completely relaxed jaw",
      "Descending scales with maximum diaphragm support — C4 to C3",
      "Low 'oo' and 'oh' vocalizations at lowest possible register",
      "Very slow scales with full support: E2 ascending to C4 without forcing",
      "Lip buzz at lowest register — 5 minutes",
      "'Ng' exercise on F2-C3: maintain resonance without tension",
      "Minimum 15-minute warm-up — low vocal cords need more time",
      "Hydration: drink warm water before singing, never cold",
    ],
    desc_es:"La contralto es la voz femenina más grave y oscura, y una de las más raras en el mundo. Su tessitura natural va del Fa3 al Fa5, con un timbre profundo, oscuro y aterciopelado que resulta hipnótico. Es una voz poco común — solo el 5-10% de las mujeres son contraltos verdaderas.  Artistas como Tracy Chapman, Nina Simone, Cher, Norah Jones y k.d. lang son ejemplos icónicos de contralto en la música popular. En la ópera clásica, la contralto es la más escasa y codiciada de las voces femeninas.  Si eres contralto, tu mayor tesoro son tus graves únicos — esa zona Do3-Sol3 que ninguna otra voz femenina puede alcanzar con tal potencia y oscuridad. No intentes cantar como soprano: abraza y desarrolla tu registro grave, que es tu identidad vocal más poderosa.",
    desc_en:"The contralto is the lowest and darkest female voice type, and one of the rarest in the world. Its natural range spans from F3 to F5, with a deep, dark, velvety timbre that is hypnotic. Only 5-10% of women are true contraltos.  Artists like Tracy Chapman, Nina Simone, Cher, Norah Jones and k.d. lang are iconic contralto examples in popular music.",
  },

  bajo: {
    emoji:"🎸", color:"#1E3A5F", range:"Mi2 – Do4", hz:"82 – 261 Hz",
    ytId: "YkSmHCyUKdQ",
    artists:["Johnny Cash","Barry White","Leonard Cohen","Tom Waits","Nick Cave","Isaac Hayes","Lou Rawls","Boris Christoff"],
    artistImgs:{},
    mics:[
      {name:"Shure SM7B",reason:"El estándar absoluto para voces graves broadcast. Desarrollado para voces profundas.",search:"Shure SM7B"},
      {name:"Electro-Voice RE20",reason:"Cardiode de patrón variable, el preferido por locutores y cantantes de bajo.",search:"Electro Voice RE20"},
      {name:"Rode Broadcaster",reason:"Cálido y robusto, captura la profundidad del bajo sin distorsión.",search:"Rode Broadcaster Microphone"},
    ],
    pro_mics:["Neumann U87","AKG C414 XLII"],
    home_studio:{
      fun:   [{name:"Fifine K669B USB",search:"Fifine K669B"},{name:"Auriculares Beyerdynamic DT 770",search:"Beyerdynamic DT 770 32ohm"}],
      basic: [{name:"Shure MV7",search:"Shure MV7"},{name:"Filtro anti-pop doble",search:"filtro antipop doble"},{name:"Brazo articulado",search:"brazo microfono"}],
      medium:[{name:"Focusrite Scarlett 2i2",search:"Focusrite Scarlett 2i2"},{name:"SM7B",search:"Shure SM7B"},{name:"Beyerdynamic DT 770 Pro",search:"Beyerdynamic DT 770 Pro"}],
      pro:   [{name:"Apollo Twin",search:"UA Apollo Twin"},{name:"Neumann U87",search:"Neumann U87"},{name:"Yamaha HS8",search:"Yamaha HS8"}],
    },
    songs:["Ring of Fire – Johnny Cash","Can't Get Enough – Barry White","Hallelujah – Leonard Cohen","Georgia Lee – Tom Waits","Into My Arms – Nick Cave","Shaft – Isaac Hayes","You'll Never Walk Alone – Lou Rawls","Ol' Man River – Traditional"],
    exercises_es:[
      "Humming en Mi2-Do3 — el bajo más profundo requiere más calentamiento que cualquier otra voz",
      "Sirenas descendentes al máximo grave — Mi2-Si1 si tu voz lo permite",
      "Vocalizaciones en 'oo' y 'oh' en el registro más bajo posible",
      "Escalas muy lentas con apoyo total: Mi2 subiendo a Do4 sin forzar",
      "Buzzing de labios (lip buzz) en el registro más bajo — 5 minutos",
      "Ejercicio de 'ng' en Fa2-Do3: mantén la resonancia sin tensión",
      "Calentamiento de 15 minutos mínimo — las cuerdas graves necesitan más tiempo",
      "Hidratación: bebe agua tibia antes de cantar, nunca fría",
    ],
    exercises_en:[
      "Humming on E2-C3 — the deepest bass requires more warm-up than any other voice",
      "Maximum low descending sirens — E2-B1 if your voice allows",
      "Low 'oo' and 'oh' vocalizations at lowest possible register",
      "Very slow scales with full support: E2 ascending to C4 without forcing",
      "Lip buzz at lowest register — 5 minutes",
      "'Ng' exercise on F2-C3: maintain resonance without tension",
      "Minimum 15-minute warm-up — low vocal cords need more time",
      "Hydration: drink warm water before singing, never cold",
    ],
    desc_es:"El bajo es la voz masculina más grave, profunda y resonante. Una rareza vocal auténtica — solo el 5% de los cantantes masculinos tienen un bajo verdadero — con una presencia escénica e imponente que ninguna otra voz puede igualar. El rango natural va del Mi2 al Do4, con algunos bajos profundos (bajo profundo u octavista) llegando al Mi1 o más abajo.  Johnny Cash, Barry White, Leonard Cohen, Tom Waits y Isaac Hayes son los referentes del bajo en la música popular. Su timbre oscuro, autoritario y magnético ha definido géneros enteros, desde el gospel y el soul hasta el country y el rock alternativo.  Si eres bajo, tu mayor activo es esa zona Mi2-Sol3 que solo tú puedes habitar con plena potencia. No intentes competir con tenores o barítonos en los agudos — tu poder está en los graves, y ese poder es único.",
    desc_en:"The bass is the lowest, deepest and most resonant male voice type. A true vocal rarity — only 5% of male singers have a genuine bass voice — with an imposing stage presence that no other voice can match. The natural range spans from E2 to C4, with some deep basses reaching E1 or lower.  Johnny Cash, Barry White, Leonard Cohen, Tom Waits and Isaac Hayes are the bass references in popular music.",
  },
};

function renderVozPage(slug) {
  const keyMap = {
    "baritono":"baritono","tenor":"tenor","soprano":"soprano",
    "mezzo-soprano":"mezzo-soprano","contralto":"contralto","bajo":"bajo"
  };
  const key  = keyMap[slug];
  const data = VOZ_DATA[key];
  if (!data) return false;

  const langES   = ["es","ca","pt","it","fr","de","ru","uk"].includes(lang);
  const desc     = langES ? data.desc_es : data.desc_en;
  const exercises= langES ? data.exercises_es : data.exercises_en;
  const amzDomain= getAmazonDomain();
  const currency = getCurrencySymbol();
  const capSlug  = slug.charAt(0).toUpperCase() + slug.slice(1);

  // Fotos de artistas — usar artistImgs del VOZ_DATA + MONO_IMGS + iniciales
  const artistCards = data.artists.map(a => {
    const img = data.artistImgs?.[a] || MONO_IMGS[a] || imgCache[a];
    const initImg = getInitialsAvatar(a);
    return `<div style="text-align:center;padding:.75rem;background:rgba(255,255,255,.04);
      border-radius:12px;border:1px solid rgba(255,255,255,.08);transition:transform .2s"
      onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform=''">
      <div style="width:64px;height:64px;border-radius:50%;margin:0 auto .5rem;overflow:hidden;
        background:rgba(124,77,255,.2);display:flex;align-items:center;justify-content:center;">
        <img src="${img||initImg}" alt="${a}" style="width:100%;height:100%;object-fit:cover"
          onerror="this.src='${initImg}'">
      </div>
      <div style="font-weight:700;font-size:.82rem;margin-bottom:.15rem">${a}</div>
      <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(a+' vocal')}"
        target="_blank" style="font-size:.68rem;color:${data.color};text-decoration:none">▶ Ver</a>
    </div>`;
  }).join("");

  // Micros con botón Amazon
  const micCards = data.mics.map((m,i) => `
    <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);
      border-radius:14px;padding:1.1rem;display:flex;gap:.75rem;align-items:flex-start;
      ${i===0?'border-color:'+data.color+'55;background:'+data.color+'08;':''}">
      <div style="font-size:1.5rem">🎙️</div>
      <div style="flex:1">
        <div style="font-weight:700;font-size:.95rem;margin-bottom:.2rem">${m.name}
          ${i===0?'<span style="background:'+data.color+'22;color:'+data.color+';font-size:.65rem;font-weight:700;padding:.1rem .45rem;border-radius:20px;margin-left:.4rem">★ Recomendado</span>':''}
        </div>
        <div style="font-size:.8rem;color:#9CA3AF;margin-bottom:.55rem;line-height:1.5">${m.reason}</div>
        <a href="https://www.${amzDomain}/s?k=${encodeURIComponent(m.search)}&tag=${AFFILIATE_ID}"
          target="_blank" rel="noopener sponsored"
          style="display:inline-block;background:linear-gradient(135deg,#FF9F1C,#FF4FA3);color:#fff;
          font-size:.78rem;font-weight:700;padding:.35rem .8rem;border-radius:8px;text-decoration:none">
          Ver precio en Amazon ${currency} →
        </a>
      </div>
    </div>`).join("");

  // Pro mics (referencia sin afiliado)
  const proMicHtml = data.pro_mics.map(p=>`
    <span style="background:rgba(255,215,0,.1);color:#FFD700;border:1px solid rgba(255,215,0,.2);
      font-size:.78rem;font-weight:700;padding:.25rem .65rem;border-radius:20px">⭐ ${p}</span>
  `).join("");

  // Home Studio — 4 packs completos
  const packLabels = {
    fun:   {label:"🟢 Básico",sub:"Para karaoke en casa · 50-120"+currency,gradient:"#7C4DFF,#FF4FA3"},
    basic: {label:"🟡 Económico",sub:"Quiero sonar bien · 120-250"+currency,gradient:"#FF9F1C,#FF4FA3"},
    medium:{label:"🟠 Medio",sub:"Grabaciones serias · 250-600"+currency,gradient:"#06D6A0,#118AB2"},
    pro:   {label:"🔴 Pro",sub:"Sonido comercial · 600-1500"+currency,gradient:"#E63946,#7C4DFF"},
  };
  const studioHTML = Object.entries(data.home_studio).map(([tier, items]) => {
    const {label,sub,gradient} = packLabels[tier];
    return `<div style="background:rgba(255,255,255,.04);border-radius:16px;padding:1.25rem;
      border:1px solid rgba(255,255,255,.08)">
      <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem">
        <span style="background:linear-gradient(135deg,${gradient});-webkit-background-clip:text;
          -webkit-text-fill-color:transparent;font-weight:800;font-size:.95rem">${label}</span>
      </div>
      <div style="font-size:.75rem;color:#6B7280;margin-bottom:.75rem">${sub}</div>
      ${items.map(item=>`
        <div style="display:flex;align-items:center;justify-content:space-between;
          padding:.45rem 0;border-bottom:1px solid rgba(255,255,255,.05)">
          <span style="font-size:.82rem;color:#D1D5DB">🎛️ ${item.name}</span>
          <a href="https://www.${amzDomain}/s?k=${encodeURIComponent(item.search)}&tag=${AFFILIATE_ID}"
            target="_blank" rel="noopener sponsored"
            style="font-size:.72rem;font-weight:700;color:${data.color};text-decoration:none;
            background:${data.color}15;padding:.2rem .55rem;border-radius:8px;white-space:nowrap">
            Ver oferta →
          </a>
        </div>`).join("")}
    </div>`;
  }).join("");

  // Canciones con karaoke
  const songsHTML = data.songs.map(s => {
    const sTitle = typeof s === 'object' ? (s.title||s.name||'') : String(s||'');
    const yt = `https://www.youtube.com/results?search_query=${encodeURIComponent(sTitle+' karaoke')}`;
    const sp = `https://open.spotify.com/search/${encodeURIComponent(sTitle)}`;
    return `<div style="background:rgba(255,255,255,.04);border-radius:10px;padding:.7rem 1rem;
      display:flex;align-items:center;gap:.5rem;border:1px solid rgba(255,255,255,.06)">
      <span style="color:${data.color}">🎵</span>
      <span style="font-weight:600;font-size:.9rem;flex:1">${s}</span>
      <a href="${yt}" target="_blank" rel="noopener"
        style="background:rgba(255,0,0,.12);color:#ff4444;font-size:.7rem;font-weight:700;
        padding:.2rem .55rem;border-radius:20px;text-decoration:none;border:1px solid rgba(255,0,0,.2)">
        ▶ Karaoke
      </a>
      <a href="${sp}" target="_blank" rel="noopener"
        style="background:rgba(29,185,84,.12);color:#1DB954;font-size:.7rem;font-weight:700;
        padding:.2rem .55rem;border-radius:20px;text-decoration:none;border:1px solid rgba(29,185,84,.2)">
        Spotify
      </a>
    </div>`;
  }).join("");

  // Ejercicios
  const exHTML = exercises.map((e,i)=>`
    <div style="background:rgba(255,255,255,.04);border-left:3px solid ${data.color};
      padding:.65rem .9rem;border-radius:0 10px 10px 0;font-size:.88rem;color:#E5E7EB;
      border-bottom:1px solid rgba(255,255,255,.04)">
      <span style="color:${data.color};font-weight:800;margin-right:.5rem">${i+1}.</span>${e}
    </div>`).join("");

  const descClean = desc.replace(/\n/g,' ');
  const logoAbs   = "https://harmiq.app/harmiq-logo.png";
  
  document.body.innerHTML = `
<!DOCTYPE html><html lang="${lang}"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Voz de ${capSlug} ${data.emoji} — Artistas, ejercicios, micrófonos y canciones | Harmiq</title>
<meta name="description" content="${descClean.slice(0,158)}">
<meta name="keywords" content="voz ${slug}, cantante ${slug}, tipo de voz ${slug}, home studio ${slug}, karaoke ${slug}, harmiq">
<meta property="og:title" content="Voz de ${capSlug} — Descubre si tu voz es ${slug}">
<meta property="og:description" content="${descClean.slice(0,120)}">
<meta property="og:image" content="${logoAbs}">
<link rel="icon" type="image/png" href="${logoAbs}">
<link rel="apple-touch-icon" href="${logoAbs}">
<link rel="canonical" href="https://harmiq.app/voz/${slug}">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Harmiq",
  "url": "https://harmiq.app",
  "logo": "${logoAbs}",
  "sameAs": ["https://www.instagram.com/harmiq_app","https://www.tiktok.com/@harmiq"]
}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800;900&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css">
</head><body>

<nav>
  <a class="logo" href="/">🎙️ Harmiq</a>
  <ul class="nav-links">
    <li><a href="/voz/baritono">Barítono</a></li>
    <li><a href="/voz/tenor">Tenor</a></li>
    <li><a href="/voz/soprano">Soprano</a></li>
    <li><a href="/voz/mezzo-soprano">Mezzo</a></li>
    <li><a href="/voz/contralto">Contralto</a></li>
    <li><a href="/voz/bajo">Bajo</a></li>
  </ul>
  <a class="btn" href="/#app" style="padding:.5rem 1.2rem;font-size:.85rem">🎤 Analizar mi voz</a>
</nav>

<div style="max-width:860px;margin:0 auto;padding:1.5rem">

  <!-- HERO -->
  <div style="background:linear-gradient(135deg,${data.color}20,rgba(255,79,163,.1));
    border-radius:20px;padding:2.5rem 2rem;margin-bottom:2.5rem;text-align:center;
    border:1px solid ${data.color}33">
    <div style="font-size:3.5rem;margin-bottom:.5rem">${data.emoji}</div>
    <h1 style="font-family:'Baloo 2',sans-serif;font-weight:900;
      font-size:clamp(2rem,5vw,3.2rem);margin-bottom:.6rem;
      background:linear-gradient(135deg,#fff 40%,${data.color});
      -webkit-background-clip:text;-webkit-text-fill-color:transparent">
      Voz de ${capSlug}
    </h1>
    <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap;margin:.75rem 0 1.25rem">
      <span style="background:${data.color}33;color:${data.color};font-weight:700;font-size:.88rem;
        padding:.35rem .9rem;border-radius:20px">🎼 ${data.range}</span>
      <span style="background:rgba(255,255,255,.08);color:#9CA3AF;font-size:.88rem;
        padding:.35rem .9rem;border-radius:20px">${data.hz}</span>
    </div>
    <p style="color:#D1D5DB;font-size:.95rem;line-height:1.75;max-width:640px;margin:0 auto 1.5rem;
      white-space:pre-line">${desc}</p>
    <a class="btn" href="/#app" style="font-size:.95rem">
      🎤 Analizar mi voz — ¿soy ${slug}?
    </a>
  </div>

  <!-- ARTISTAS FAMOSOS -->
  <div style="margin-bottom:2.5rem">
    <h2 style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.5rem;margin-bottom:.3rem;
      background:linear-gradient(135deg,${data.color},#FF4FA3);-webkit-background-clip:text;-webkit-text-fill-color:transparent">
      🌟 Artistas famosos con voz de ${capSlug}
    </h2>
    <p style="color:#6B7280;font-size:.85rem;margin-bottom:1.1rem">
      Estudia su técnica, escucha su timbre, imita su estilo.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:.75rem">
      ${artistCards}
    </div>
  </div>

  <!-- CANCIONES PERFECTAS -->
  <div style="margin-bottom:2.5rem">
    <h2 style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.5rem;margin-bottom:.3rem;
      background:linear-gradient(135deg,${data.color},#FF4FA3);-webkit-background-clip:text;-webkit-text-fill-color:transparent">
      🎵 Canciones perfectas para voz de ${capSlug}
    </h2>
    <p style="color:#6B7280;font-size:.85rem;margin-bottom:1rem">
      Seleccionadas para tu rango vocal. Con acceso directo a karaoke y Spotify.
    </p>
    <div style="display:flex;flex-direction:column;gap:.5rem">${songsHTML}</div>
  </div>

  <!-- EJERCICIOS VOCALES -->
  <div style="margin-bottom:2.5rem">
    <h2 style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.5rem;margin-bottom:.3rem;
      background:linear-gradient(135deg,${data.color},#FF4FA3);-webkit-background-clip:text;-webkit-text-fill-color:transparent">
      🎯 Ejercicios vocales para ${capSlug}
    </h2>
    <p style="color:#6B7280;font-size:.85rem;margin-bottom:1rem">
      Rutina de entrenamiento diaria adaptada a este tipo de voz.
    </p>
    <div style="display:flex;flex-direction:column;gap:.4rem">${exHTML}</div>
  </div>

  <!-- VIDEO YOUTUBE FIJO -->
  <div style="margin-bottom:2.5rem">
    <h2 style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.5rem;margin-bottom:.3rem;
      background:linear-gradient(135deg,${data.color},#FF4FA3);-webkit-background-clip:text;-webkit-text-fill-color:transparent">
      🎬 Aprende de los mejores expertos en canto
    </h2>
    <p style="color:#6B7280;font-size:.85rem;margin-bottom:1rem">
      Clases de canto seleccionadas de los mejores vocal coaches del mundo.
    </p>
    <!-- Videos de vocal coaching seleccionados -->
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.75rem;margin-bottom:1rem">
      ${[
        {q:"top ejercicios voz técnica vocal revolucionar canto", title:"Top ejercicios para revolucionar tu voz", emoji:"🎙️"},
        {q:"rutina diaria 10 minutos calentamiento vocal cantantes", title:"Rutina diaria de 10 minutos", emoji:"☀️"},
        {q:"cómo cantar notas altas sin esfuerzo técnica vocal", title:"Cómo cantar notas altas sin esfuerzo", emoji:"🎯"},
        {q:"fortalecimiento vocal diario ejercicios voz fuerza", title:"Fortalecimiento vocal diario", emoji:"💪"},
        {q:"técnica vocal saludable sin dañar la voz cantantes", title:"Técnica vocal saludable", emoji:"🏥"},
        {q:"cómo cantar mejor instantáneamente consejos vocales", title:"Cómo cantar mejor ya", emoji:"✨"},
      ].map(v=>`
        <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(v.q)}" target="_blank" rel="noopener"
          style="border-radius:14px;overflow:hidden;background:#111;
          box-shadow:0 4px 16px rgba(0,0,0,.4);text-decoration:none;display:block">
          <div style="position:relative;aspect-ratio:16/9;background:#0d0a1f;
            display:flex;align-items:center;justify-content:center;flex-direction:column;gap:.5rem">
            <div style="font-size:2.8rem">${v.emoji}</div>
            <div style="width:48px;height:48px;background:rgba(255,0,0,.9);border-radius:50%;
              display:flex;align-items:center;justify-content:center;font-size:20px;
              box-shadow:0 4px 16px rgba(255,0,0,.4)">▶</div>
          </div>
          <div style="padding:.6rem .8rem;background:#111">
            <div style="font-size:.8rem;font-weight:700;color:#E5E7EB;margin-bottom:.1rem">${v.title}</div>
            <div style="font-size:.68rem;color:#A5B4FC">Buscar en YouTube →</div>
          </div>
        </a>`).join("")}
    </div>
    <a href="https://www.youtube.com/results?search_query=clases+de+canto+tecnica+vocal+${encodeURIComponent(capSlug)}"
      target="_blank" rel="noopener"
      style="display:inline-flex;align-items:center;gap:.4rem;font-size:.8rem;color:#FF0000;
      text-decoration:none;padding:.4rem .9rem;background:rgba(255,0,0,.08);
      border-radius:8px;border:1px solid rgba(255,0,0,.2)">
      ▶ Ver más clases en YouTube →
    </a>
  </div>

  <!-- MICRÓFONOS RECOMENDADOS -->
  <div style="margin-bottom:2.5rem">
    <h2 style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.5rem;margin-bottom:.3rem;
      background:linear-gradient(135deg,${data.color},#FF4FA3);-webkit-background-clip:text;-webkit-text-fill-color:transparent">
      🎙️ Mejores micrófonos para voz de ${capSlug}
    </h2>
    <p style="color:#6B7280;font-size:.85rem;margin-bottom:1rem">
      Seleccionados por frecuencia de respuesta óptima para este tipo de voz. Links de Amazon.
    </p>
    <div style="display:flex;flex-direction:column;gap:.75rem;margin-bottom:1rem">
      ${micCards}
    </div>
    <div style="padding:.8rem;background:rgba(255,215,0,.05);border-radius:12px;
      border:1px solid rgba(255,215,0,.15)">
      <span style="font-size:.75rem;color:#9CA3AF">⭐ Nivel profesional (referencia): </span>
      ${proMicHtml}
    </div>
  </div>

  <!-- HOME STUDIO COMPLETO -->
  <div style="margin-bottom:2.5rem">
    <h2 style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.5rem;margin-bottom:.3rem;
      background:linear-gradient(135deg,${data.color},#FF4FA3);-webkit-background-clip:text;-webkit-text-fill-color:transparent">
      🎛️ Monta tu Home Studio para voz de ${capSlug}
    </h2>
    <p style="color:#6B7280;font-size:.85rem;margin-bottom:1rem">
      4 niveles según tu presupuesto. Todos los links llevan a Amazon con el mejor precio actual.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem">
      ${studioHTML}
    </div>
    <p style="font-size:.72rem;color:#4B5563;margin-top:.75rem;text-align:center">
      * Links de afiliado Amazon · Harmiq recibe una pequeña comisión sin coste para ti
    </p>
  </div>

  <!-- SECCIÓN KARAOKE Y EVENTOS -->
  <div style="margin-bottom:2.5rem" id="_karaoke_voz_wrap">
    <h2 style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.5rem;margin-bottom:.3rem;
      background:linear-gradient(135deg,${data.color},#FF4FA3);-webkit-background-clip:text;-webkit-text-fill-color:transparent">
      🎤 Karaoke — Encuentra dónde cantar
    </h2>
  </div>
  <script>
    (function(){
      var w = document.getElementById("_karaoke_voz_wrap");
      if(w && typeof buildKaraokeSection === "function"){
        w.innerHTML += buildKaraokeSection("${capSlug}", "${slug}");
      }
    })();
  <\/script>

  <!-- CTA FINAL -->
  <div class="cta-box" style="margin:0 0 2.5rem">
    <h2>¿Eres ${capSlug}? Compruébalo en segundos</h2>
    <p>Análisis vocal gratuito. Sin registro. Descubre tu tipo de voz con IA.</p>
    <a class="btn" href="/#app">🎤 Analizar mi voz gratis</a>
    &nbsp;&nbsp;
    <a class="btn-out" href="/">Ver todos los tipos de voz</a>
  </div>

</div>

<footer>
  <div class="fl">
    <a href="/">Inicio</a>
    <a href="/voz/baritono">Barítono</a>
    <a href="/voz/tenor">Tenor</a>
    <a href="/voz/soprano">Soprano</a>
    <a href="/voz/mezzo-soprano">Mezzo</a>
    <a href="/voz/contralto">Contralto</a>
    <a href="/voz/bajo">Bajo</a>
    <a href="/comunidad" style="color:#FF5E5B; font-weight:700">Comunidad</a>
  </div>
  <p>© 2026 Harmiq · Análisis vocal con IA · <a href="mailto:info@harmiq.app">info@harmiq.app</a> · <a href="/politica-privacidad.html">Privacidad</a></p>
</footer>

<script>
  // Precargar fotos de artistas tras render
  const artistData = ${JSON.stringify(data.artistImgs||{})};
  const monoImgs = typeof MONO_IMGS !== 'undefined' ? MONO_IMGS : {};
  document.querySelectorAll('img[alt]').forEach(async img => {
    const name = img.alt;
    const src = artistData[name] || monoImgs[name];
    if (src) {
      img.src = src;
    } else if (name && typeof getArtistImage === 'function') {
      const loaded = await getArtistImage(name);
      if (loaded) img.src = loaded;
    }
  });
</body></html>`;
  return true;
}

// ── Cargador de páginas SPA con preservación de resultado ─────────────────────
async function loadStaticPage(url, title) {
  // Guardar resultado actual en sessionStorage antes de navegar
  if (lastResult?.matches?.length) {
    try {
      const toSave = {
        vt: lastResult.vt, conf: lastResult.conf, gender: lastResult.gender,
        feat: lastResult.feat,
        matches: lastResult.matches.map(m => ({
          id:m.id, name:m.name, voice_type:m.voice_type,
          genre_category:m.genre_category, country_code:m.country_code,
          era:m.era, score:m.score, reference_songs:m.reference_songs?.slice(0,3)||[]
        }))
      };
      sessionStorage.setItem("harmiq_result", JSON.stringify(toSave));
    } catch(_) {}
  }
  try {
    document.title = title || "Harmiq";
    // Mostrar spinner
    const wrap = document.getElementById("app") || document.querySelector(".app-box")?.closest("section");
    if (wrap) wrap.innerHTML = `<div style="text-align:center;padding:4rem;color:#A5B4FC">
      <div style="font-size:2.5rem;margin-bottom:1rem">⏳</div><div>Cargando...</div></div>`;
    const r = await fetch(url);
    if (!r.ok) { location.href = url; return; }
    const html = await r.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    // Inyectar estilos del nuevo head
    document.querySelectorAll("style.spa-injected, link.spa-injected").forEach(el => el.remove());
    doc.head.querySelectorAll("style, link[rel='stylesheet']").forEach(el => {
      const clone = el.cloneNode(true);
      clone.classList.add("spa-injected");
      document.head.appendChild(clone);
    });

    // Reemplazar body manteniendo scripts de app.js
    document.body.innerHTML = doc.body.innerHTML;
    document.title = doc.title || title;
    
    // Re-ejecutar scripts del nuevo HTML (externos nuevos + inline), respetando orden
    const _alreadyLoaded = new Set(
      [...document.querySelectorAll('script[src]')].map(s => {
        try { return new URL(s.src, location.href).href; } catch(_) { return s.getAttribute('src'); }
      })
    );
    const _bodyScripts = [...document.body.querySelectorAll("script")];
    for (const old of _bodyScripts) {
      const srcAttr = old.getAttribute('src');
      if (srcAttr) {
        let fullSrc;
        try { fullSrc = new URL(srcAttr, location.href).href; } catch(_) { fullSrc = srcAttr; }
        old.remove();
        if (_alreadyLoaded.has(fullSrc)) continue; // ya cargado globalmente
        await new Promise(res => {
          const s = document.createElement("script");
          s.src = srcAttr;
          s.onload = res; s.onerror = res;
          document.body.appendChild(s);
        });
        _alreadyLoaded.add(fullSrc);
      } else {
        const s = document.createElement("script");
        s.textContent = old.textContent;
        old.replaceWith(s);
      }
    }
    window.scrollTo(0,0);
  } catch(e) {
    location.href = url;
  }
}

// ── Comunidad (Disqus) ────────────────────────────────────────────────────────
// ── Comunidad (Disqus + Eventos + Mapa) ──────────────────────────────────────
// --- MONETIZACIÓN Y AFILIADOS ---
function getUdemyBannerHTML() {
    return `
    <div class="udemy-banner" style="margin-top:1.5rem; background:linear-gradient(135deg, rgba(124,77,255,0.15), rgba(76,29,149,0.3)); border:1px solid rgba(124,77,255,0.3); border-radius:18px; padding:1.4rem; display:flex; align-items:center; gap:1.2rem; transition:transform 0.3s; box-shadow: 0 10px 20px rgba(0,0,0,0.2)" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
        <div style="font-size:2.4rem; filter:drop-shadow(0 0 10px rgba(124,77,255,0.5))">🚀</div>
        <div style="flex:1">
            <h4 style="font-family:'Baloo 2',sans-serif; font-size:1.15rem; margin-bottom:.3rem; color:#fff">¿Quieres dejar de ser un aficionado?</h4>
            <p style="font-size:.85rem; color:#A5B4FC; line-height:1.4">Certifícate con nuestro curso profesional y domina los escenarios con técnica vocal de élite.</p>
        </div>
        <a href="${window.UDEMY_LINK || 'https://www.udemy.com/?p=harmiq'}" target="_blank" style="background:#7C4DFF; color:#fff; padding:.7rem 1.2rem; border-radius:12px; text-decoration:none; font-weight:800; font-size:.85rem; white-space:nowrap; box-shadow:0 4px 15px rgba(124,77,255,0.4)">Inscribirme Ahora</a>
    </div>`;
}

function getHomeStudioHTML() {
    const cleanLink = (url) => url.replace(/[^a-zA-Z0-9\s:/.]/g, ''); 
    
    return `
    <div class="home-studio-section" style="margin-top:3rem">
        <h2 style="font-family:'Baloo 2',sans-serif; text-align:center; margin-bottom:2rem; background:linear-gradient(135deg,#fff,#FF9900); -webkit-background-clip:text; -webkit-text-fill-color:transparent">🎙️ Domina tu Home Studio</h2>
        <div class="amazon-grid" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1.5rem">
            ${[
                {name: "Pack Iniciación (Behringer)", url: "https://www.amazon.es/s?k=pack+home+studio+behringer+u-phoria"},
                {name: "Pack Pro Vocals (Rode)", url: "https://www.amazon.es/s?k=Rode+NT1+5th+Gen+Studio+Pack"},
                {name: "Pack Podcaster (Shure)", url: "https://www.amazon.es/s?k=Shure+MV7+Podcast+Kit"},
                {name: "Pack Studio Elite (Neumann)", url: "https://www.amazon.es/s?k=Neumann+TLM+103+Studio+Set"}
            ].map(p => `
                <div class="amazon-card" style="background:rgba(255,255,255,0.03); padding:1.2rem; border-radius:20px; text-align:center; border:1px solid rgba(255,255,255,0.05); transition:all 0.3s">
                    <div style="font-size:2rem; margin-bottom:0.5rem">📦</div>
                    <h3 style="font-size:1rem; margin-bottom:0.8rem; color:#fff">${p.name}</h3>
                    <a href="${cleanLink(p.url)}" target="_blank" class="btn-amazon" style="display:inline-block; padding:0.5rem 1rem; background:#FF9900; color:#000; font-weight:700; border-radius:10px; font-size:0.85rem; text-decoration:none">Ver en Amazon</a>
                </div>
            `).join('')}
        </div>
    </div>`;
}

function renderVideoSection(containerId, playlistId, showUdemy = true) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const iframeHtml = `
        <div class="video-container" style="position:relative; width:100%; aspect-ratio:16/9; border-radius:24px; overflow:hidden; box-shadow:0 15px 40px rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.1)">
            <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube-nocookie.com/embed/videoseries?list=${playlistId}&origin=${window.location.origin}" 
                title="Harmiq Karaoke Playlist" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen>
            </iframe>
        </div>
    `;

    container.innerHTML = iframeHtml + (showUdemy ? getUdemyBannerHTML() : "");
}

function loadComunidadPage() {
    const content = `
    <div style="padding:4rem 2rem; max-width:1100px; margin:0 auto; color:#fff">
        <header style="text-align:center; margin-bottom:4rem">
            <h1 style="font-family:'Outfit',sans-serif; font-size:3rem; margin-bottom:1rem; background:linear-gradient(135deg,#fff,#7C4DFF); -webkit-background-clip:text; -webkit-text-fill-color:transparent">
                👥 Comunidad Harmiq
            </h1>
            <p style="font-size:1.1rem; color:#9CA3AF; max-width:700px; margin:0 auto">
                El punto de encuentro para cantantes de todo el mundo. Descubre eventos, comparte tu talento y aprende de los mejores.
            </p>
        </header>

        <!-- SECCIÓN EVENTOS Y MAPA -->
        <div class="community-section" style="margin-bottom:4rem">
           ${getEventsModuleHTML("Madrid")}
        </div>

        <!-- SECCIÓN MÁS OPCIONES (Contribución) -->
        <div id="participa" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:1.5rem; margin-bottom:4rem">
            <div style="background:rgba(255,255,255,.03); padding:1.5rem; border-radius:24px; border:1px solid rgba(255,255,255,.06); text-align:center">
                <div style="font-size:2rem; margin-bottom:.8rem">🎤</div>
                <h3 style="font-size:1.1rem; margin-bottom:.5rem">Comparte tu Karaoke</h3>
                <p style="font-size:.85rem; color:#6B7280; margin-bottom:1.5rem">¿Has grabado algo especial? Comparte el enlace con la comunidad.</p>
                <button onclick="openPublishPopup()" style="background:rgba(124,77,255,.2); color:#A5B4FC; border:1px solid rgba(124,77,255,.3); padding:.6rem 1.2rem; border-radius:12px; font-weight:700; cursor:pointer">
                    Compartir Link
                </button>
            </div>
            <div style="background:rgba(255,255,255,.03); padding:1.5rem; border-radius:24px; border:1px solid rgba(255,255,255,.06); text-align:center">
                <div style="font-size:2rem; margin-bottom:.8rem">🏆</div>
                <h3 style="font-size:1.1rem; margin-bottom:.5rem">Montar Home Studio</h3>
                <p style="font-size:.85rem; color:#6B7280; margin-bottom:1.5rem">Packs de equipo profesional para tu tipo de voz.</p>
                <a href="/voz/baritono" style="display:inline-block; background:rgba(255,153,0,.2); color:#FF9900; border:1px solid rgba(255,153,0,.3); padding:.6rem 1.2rem; border-radius:12px; font-weight:700; text-decoration:none">
                    Ver Equipos
                </a>
            </div>
            <div style="background:rgba(255,255,255,.03); padding:1.5rem; border-radius:24px; border:1px solid rgba(255,255,255,.06); text-align:center">
                <div style="font-size:2rem; margin-bottom:.8rem">🎓</div>
                <h3 style="font-size:1.1rem; margin-bottom:.5rem">Academia Harmiq</h3>
                <p style="font-size:.85rem; color:#6B7280; margin-bottom:1.5rem">Certifícate con cursos profesionales en Udemy.</p>
                <a href="${UDEMY_LINK}" target="_blank" style="display:inline-block; background:rgba(6,214,160,.2); color:#06D6A0; border:1px solid rgba(6,214,160,.3); padding:.6rem 1.2rem; border-radius:12px; font-weight:700; text-decoration:none">
                    Ver Cursos
                </a>
            </div>
        </div>

        <!-- DISQUS -->
        <div style="background:rgba(255,255,255,.02); border-radius:30px; border:1px solid rgba(255,255,255,.05); padding:2rem">
            <h2 style="font-family:'Baloo 2',sans-serif; font-size:1.5rem; margin-bottom:1.5rem; text-align:center">
                💬 Foro de la Comunidad
            </h2>
            <div id="disqus_thread"></div>
        </div>

        <div style="margin-top:3rem; padding:1.5rem; background:rgba(255,255,255,.03); border-radius:20px; font-size:.8rem; color:#6B7280; line-height:1.7; text-align:center">
            <strong>Protección Legal:</strong> Harmiq es una plataforma de análisis y recomendación. No gestionamos pagos directos; las transacciones de cursos y equipos se realizan de forma segura en Udemy y Amazon.
        </div>
    </div>
    `;

    document.body.innerHTML = `
    ${getPremiumHeaderHTML()}
    <div id="comunidad-wrap" style="min-height:80vh">${content}</div>
    ${getPremiumFooterHTML()}
    `;

    renderDisqus("home");
    document.title = "Comunidad Harmiq | Foro, Eventos y Karaoke";
    window.scrollTo(0,0);
}

function openPublishPopup() {
    const url = prompt("Pega aquí el enlace de tu karaoke (YouTube or TikTok):");
    if (url) {
        alert("¡Recibido! Tu karaoke será revisado y publicado en la comunidad pronto. Gracias por compartir.");
        console.log("Karaoke link submitted:", url);
    }
}

function renderDisqus(identifier) {
  // Configuración global de Disqus
  window.disqus_config = function () {
    this.page.url = (identifier === "home") ? "https://harmiq.app" : window.location.href;
    this.page.identifier = identifier;
  };
  
  const old = document.getElementById("disqus-embed-script");
  if (old) old.remove();

  (function() { // Snippet estándar proporcionado por el usuario
    const d = document, s = d.createElement('script');
    s.id = "disqus-embed-script";
    s.src = 'https://harmiq.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
  })();
}

// ── Router SPA ─────────────────────────────────────────────────────────────────
function handleRoute() {
  const path = location.pathname;

  // Rutas /voz/*
  const vMatch = path.match(/^\/voz\/(.+)$/);
  if (vMatch) {
    const slug = vMatch[1].toLowerCase().replace(/[^a-z-]/g,'');
    // Normalizar: "mezzo soprano" → "mezzo-soprano", "bajo" ok
    const validSlugs = ["baritono","tenor","soprano","mezzo-soprano","contralto","bajo"];
    if (validSlugs.includes(slug)) {
      renderVozPage(slug);
    } else {
      history.replaceState({}, "", "/");
    }
    return true;
  }

  // Rutas páginas internas SPA
  if (path === "/comunidad") {
    loadComunidadPage();
    return true;
  }
  if (path === "/home-studio") {
    loadStaticPage("/home-studio.html", "🎛️ Home Studio | Harmiq");
    return true;
  }
  if (path === "/karaoke-eventos") {
    loadStaticPage("/karaoke-eventos.html", "🎤 Karaoke & Eventos | Harmiq");
    return true;
  }
  if (path === "/modul-catala") {
    loadStaticPage("/modul-catala.html", "🏴 Mòdul Català | Harmiq").then(() => {
      if (typeof window.initModulCatala === 'function') {
        window.initModulCatala();
      }
    });
    return true;
  }
  if (path === "/tipos-de-voz") {
    loadStaticPage("/tipos-de-voz.html", "📖 Tipos de Voz | Harmiq");
    return true;
  }
  if (path === "/ejercicios-de-canto") {
    loadStaticPage("/ejercicios-de-canto.html", "🎯 Ejercicios de Canto | Harmiq");
    return true;
  }
  if (path === "/exitos-decada") {
    loadStaticPage("/exitos-decada.html", "🎵 Éxitos por Década | Harmiq");
    return true;
  }

  // Rutas SEO de texto → redirigen al inicio con ancla
  if (path === "/que-tipo-de-voz-tengo" || path === "/que-cantante-soy") {
    history.replaceState({}, "", "/#app");
    document.getElementById("app")?.scrollIntoView({behavior:"smooth"});
    return false;
  }

  if (path === "/" || path === "/index.html") {
    renderDisqus("home");
    return false; // Permitir que siga la carga normal de la home (recuperar resultados, etc)
  }

  return false;
}

// Interceptar clicks SPA
document.addEventListener("click", e => {
  const a = e.target.closest("a[href]");
  if (!a) return;
  const href = a.getAttribute("href");
  const spaRoutes = ["/home-studio", "/karaoke-eventos", "/modul-catala", "/tipos-de-voz", "/ejercicios-de-canto", "/exitos-decada"];
  if (href?.startsWith("/voz/") || spaRoutes.includes(href)) {
    e.preventDefault();
    history.pushState({}, "", href);
    handleRoute();
    window.scrollTo(0,0);
  }
});
window.addEventListener("popstate", () => handleRoute());

// ═══════════════════════════════════════════════════════════════════════════════
// 12. HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
function showStatus(msg, type="ok") {
  const el = document.getElementById("status-msg");
  if (!el) return;
  el.textContent  = msg;
  el.style.color  = type==="err" ? "#ef4444" : "#7C4DFF";
  el.style.display= msg ? "block" : "none";
}

// ═══════════════════════════════════════════════════════════════════════════════
// 13. CARGAR DB
// ═══════════════════════════════════════════════════════════════════════════════
// ── Buscador de karaoke por ciudad ────────────────────────────────────────────
function _searchKaraoke() {
  const city = document.getElementById("_karaoke_city")?.value?.trim();
  if (!city) return;
  const enc = encodeURIComponent(city);
  const lg = lang || "es";
  
  // Actualizar Mapa Dinámico si existe
  const mapIf = document.getElementById("_google_map");
  if (mapIf) {
    mapIf.src = `https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d1500000!2d-3.7!3d40.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1skaraoke+${encodeURIComponent(city)}!5e0!3m2!1ses!2ses!4v1711100000000!5m2!1ses!2ses`;
  }

  const resDiv = document.getElementById("_karaoke_results");
  if (resDiv) resDiv.style.display = "block";

  const terms = {
    es: { bars: "karaoke bares", comu: "comunidad karaoke", events: "concursos de canto karaoke", studio: "como montar home studio voz", pro: "karaoke pistas profesionales" },
    en: { bars: "karaoke bars", comu: "karaoke community", events: "singing contests karaoke", studio: "how to build home studio vocal", pro: "pro karaoke tracks" },
    ca: { bars: "karaoke bars", comu: "comunitat karaoke", events: "concursos de cant karaoke", studio: "com muntar home studio veu", pro: "pistes karaoke professionals" },
    ru: { bars: "караоке бары", comu: "караоке сообщество", events: "конкурсы вокала караоке", studio: "как собрать домашнюю студию вокала", pro: "профессиональные минусовки караоке" },
    ja: { bars: "カラオケバー", comu: "カラオケコミュニティ", events: "カラオケ大会", studio: "ホームスタジオの作り方 ボーカル", pro: "プロ用カラオケ音源" },
    de: { bars: "Karaoke-Bars", comu: "Karaoke-Community", events: "Gesangswettbewerbe Karaoke", studio: "wie man ein Homestudio für Gesang baut", pro: "professionelle Karaoke-Tracks" },
    fr: { bars: "bars karaoké", comu: "communauté karaoké", events: "concours de chant karaoké", studio: "comment créer un home studio vocal", pro: "pistes karaoké professionnelles" },
    it: { bars: "karaoke bar", comu: "comunità karaoke", events: "concorsi di canto karaoke", studio: "come costruire un home studio vocale", pro: "basi karaoke professionali" },
    pt: { bars: "bares de karaoke", comu: "comunidade karaoke", events: "concursos de canto karaoke", studio: "como montar um home studio de voz", pro: "pistas de karaoke profissionais" }
  }[lg] || terms.en;

  const mapping = {
    _kr_bars:   `https://www.google.com/maps/search/${encodeURIComponent(terms.bars)}+${enc}`,
    _kr_mics:   `https://www.google.com/maps/search/open+mic+jam+session+${enc}`,
    _kr_comu:   `https://www.google.com/search?q=${encodeURIComponent(terms.comu)}+${enc}`,
    _kr_events: `https://www.google.com/search?q=${encodeURIComponent(terms.events)}+${enc}`,
    _kr_studio: `https://www.google.com/search?q=${encodeURIComponent(terms.studio)}`,
    _kr_pro:    `https://www.youtube.com/results?search_query=${encodeURIComponent(terms.pro)}`
  };

  for (const [id, url] of Object.entries(mapping)) {
    const el = document.getElementById(id);
    if (el) el.href = url;
  }
}

async function loadDB() {
  // Cargar las 3 bases de datos en paralelo — la principal (vectores) + monetización + catalán
  const [resDb, resMon, resCat] = await Promise.allSettled([
    fetch(DB_PATH),
    fetch("/monetization.json"),
    fetch("/catala_data.json"),
  ]);

  // ── DB principal (vectores) — obligatoria ──────────────────────────────
  try {
    if (resDb.status === "rejected" || !resDb.value.ok)
      throw new Error(resDb.reason?.message || `HTTP ${resDb.value?.status}`);
    const d = await resDb.value.json();
    singersDb = d.singers || [];
    console.log(`✓ DB cargada: ${singersDb.length} cantantes`);
    const recBtn = document.getElementById("record-btn");
    if (recBtn) recBtn.style.opacity = "1";
    if (singersDb.length === 0) console.warn("⚠️ DB vacía — revisa harmiq_db_vectores.json");
  } catch(e) {
    console.error("❌ DB no disponible:", e.message);
    setTimeout(() => {
      if (!singersDb.length) showStatus("Base de datos cargando... Espera un momento.", "ok");
      setTimeout(() => showStatus(""), 3000);
    }, 2000);
  }

  // ── monetization.json — opcional (Amazon afiliados en resultado) ────────
  try {
    if (resMon.status === "fulfilled" && resMon.value.ok) {
      monetizationDb = await resMon.value.json();
      console.log("✓ Monetización cargada");
    }
  } catch(e) { console.warn("⚠️ monetization.json no disponible:", e.message); }

  // ── catala_data.json — opcional (boost cultural catalán) ───────────────
  try {
    if (resCat.status === "fulfilled" && resCat.value.ok) {
      catalaDb = await resCat.value.json();
      console.log(`✓ Datos catalanes cargados: ${catalaDb?.artistes?.length || 0} artistas`);
    }
  } catch(e) { console.warn("⚠️ catala_data.json no disponible:", e.message); }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 14. INIT
// ═══════════════════════════════════════════════════════════════════════════════

// Función para despertar el backend de manera asíncrona
async function wakeUpBackend() {
  try {
    fetch(HF_API_URL + "/").catch(() => {});
  } catch (e) {}
}

function showCookieBanner() {
  if (localStorage.getItem("harmiq_consent")==="1") return;
  if (document.getElementById("_cookie_banner")) return;
  const b=document.createElement("div");b.id="_cookie_banner";
  b.style.cssText="position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#0f0c1f;border-top:1px solid rgba(124,77,255,.4);padding:.8rem 1.4rem;display:flex;align-items:center;flex-wrap:wrap;gap:.6rem;justify-content:space-between;font-family:'Nunito',sans-serif;";
  b.innerHTML=`<p style="flex:1;min-width:220px;font-size:.76rem;color:#D1D5DB;margin:0">🍪 Usamos localStorage solo para tus preferencias. Tu audio <strong style="color:#06D6A0">no se almacena</strong>. <a href="/politica-privacidad" style="color:#A5B4FC">Privacidad</a></p><button id="_ca" style="background:linear-gradient(135deg,#7C4DFF,#FF4FA3);color:#fff;border:none;padding:.45rem 1rem;border-radius:8px;font-weight:700;font-size:.78rem;cursor:pointer;font-family:'Nunito',sans-serif">✓ Entendido</button>`;
  document.body.appendChild(b);
  document.getElementById("_ca").onclick=()=>{localStorage.setItem("harmiq_consent","1");b.style.opacity="0";setTimeout(()=>b.remove(),300);};
}

document.addEventListener("DOMContentLoaded", async () => {
  inicializarSEO();
  injectNewsBanner(); // Inyectar banner de novedades
  showCookieBanner();
  wakeUpBackend(); // Despierta el Hugging Face Space si está en sleep mode

  // Idioma
  const saved   = localStorage.getItem("harmiq_lang");
  const urlLang = new URLSearchParams(location.search).get("lang");
  const browser = (navigator.language||"es").substring(0,2);
  const initL   = urlLang || saved || (T[browser] ? browser : "es");
  lang = initL;

  // Detectar país (async, no bloquea)
  detectCountry().catch(()=>{});

  // ¿Estamos en una ruta /voz/*?
  if (handleRoute()) return;

  // Aplicar idioma al HTML estático
  changeLang(initL);

  // Eventos de botones (record-btn, etc.) se gestionan ahora íntegramente dentro de injectUI()

  // Conectar eventos UI (drop zone, etc.)
  injectUI();

  // Cargar DB
  await loadDB();

  // Restaurar resultado previo si el usuario volvió a la página
  const savedResult = sessionStorage.getItem("harmiq_result");
  if (savedResult) {
    try {
      const r = JSON.parse(savedResult);
      if (r?.matches?.length && r?.vt) {
        lastResult = r;
        // Asegurar que vec existe (puede no estar en sessionStorage)
        if (!lastResult.vec) lastResult.vec = new Array(27).fill(0.5);
        // Precargar fotos y renderizar
        await preloadImages(r.matches.map(m => m.name));
        renderResults(lastResult);
        // Scroll suave al resultado
        setTimeout(() => {
          document.getElementById("results")?.scrollIntoView({behavior:"smooth"});
        }, 300);
      }
    } catch(_) {}
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 15. MENÚ SEO v9 — Botones de tipos de voz (sticky, colores)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * inicializarSEO()
 * Inyecta en el DOM el menú superior sticky con los 5 tipos de voz.
 * Cada botón lleva a su página SEO /voz/* con color propio.
 * Se llama en DOMContentLoaded, antes del handleRoute().
 */
function inicializarSEO() {
  if (document.getElementById("_nav_seo")) return; // evitar duplicados

  // Estilos del menú
  const style = document.createElement("style");
  style.textContent = `
    #_nav_seo {
      display: flex;
      justify-content: center;
      gap: 10px;
      padding: 12px 16px;
      background: #0d0b21;
      flex-wrap: wrap;
      border-bottom: 2px solid rgba(255,255,255,.08);
      position: sticky;
      top: 0;
      z-index: 9999;
    }
    .btn-vocal {
      padding: 9px 18px;
      border-radius: 30px;
      font-weight: 800;
      text-decoration: none;
      color: #fff !important;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .04em;
      transition: transform .2s, filter .2s;
      box-shadow: 0 4px 12px rgba(0,0,0,.35);
      font-family: 'Nunito', sans-serif;
    }
    .btn-vocal:hover { transform: scale(1.07); filter: brightness(1.18); }
    .v-soprano  { background: #FF4FA3; }
    .v-mezzo    { background: #7C4DFF; }
    .v-tenor    { background: #1DB954; }
    .v-baritono { background: #FF9800; }
    .v-bajo     { background: #2196F3; }
  `;
  document.head.appendChild(style);

  // HTML del menú
  const nav = document.createElement("div");
  nav.id = "_nav_seo";
  nav.innerHTML = `
    <a href="/voz/soprano"      class="btn-vocal v-soprano">🎶 Soprano</a>
    <a href="/voz/mezzosoprano" class="btn-vocal v-mezzo">🎵 Mezzo</a>
    <a href="/voz/tenor"        class="btn-vocal v-tenor">🎤 Tenor</a>
    <a href="/voz/baritono"     class="btn-vocal v-baritono">🎸 Barítono</a>
    <a href="/voz/bajo"         class="btn-vocal v-bajo">🔊 Bajo</a>
  `;
  document.body.insertAdjacentElement("afterbegin", nav);
}

/**
 * injectNewsBanner()
 * Inyecta un aviso "luminoso" de novedades arriba del todo.
 */
function injectNewsBanner() {
  if (document.getElementById("_news_banner")) return;
  const b = document.createElement("a");
  b.id = "_news_banner";
  b.href = "/exitos-decada";
  b.style.cssText = `
    display: block;
    background: linear-gradient(90deg, #06D6A0, #7C4DFF, #06D6A0);
    background-size: 200% auto;
    color: #fff;
    text-align: center;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 800;
    text-decoration: none;
    animation: news-glow 3s linear infinite;
    position: relative;
    z-index: 10000;
    box-shadow: 0 4px 15px rgba(6,214,160,0.4);
  `;
  b.innerHTML = `🔥 <span style="text-transform:uppercase; letter-spacing:1px">¡Harmiq v10.3 Live!</span> Análisis Vocal con IA y Equipamiento Profesional →`;
  
  const style = document.createElement("style");
  style.textContent = `
    @keyframes news-glow {
      0% { background-position: 0% center; }
      100% { background-position: 200% center; }
    }
  `;
  document.head.appendChild(style);
  document.body.insertAdjacentElement("afterbegin", b);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 16. MODO COMPARACIÓN (Desde Landings de Artistas)
// ═══════════════════════════════════════════════════════════════════════════════
window.addEventListener("DOMContentLoaded", () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const compareSlug = urlParams.get('compare');
    if (compareSlug) {
      const parts = compareSlug.split('-');
      const artistName = parts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const heroH1 = document.querySelector('main.hero h1');
      const heroP = document.querySelector('main.hero p');
      
      if (heroH1) {
        heroH1.innerHTML = `🎤 Comparando tu voz con <span class="grad">${artistName}</span>`;
      }
      if (heroP) {
        heroP.innerHTML = `Nuestra Inteligencia Artificial está lista para escuchar tu voz y calcular tu porcentaje de similitud acústica exacto con ${artistName}. ¡Canta 10 segundos!`;
        heroP.style.color = "#c4b5fd";
        heroP.style.fontWeight = "600";
      }
    }
  } catch (e) {
    console.error("Error activando modo comparación:", e);
  }
});
