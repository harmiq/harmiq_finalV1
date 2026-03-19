/**
 * app.js — Harmiq PRODUCCIÓN v4
 * Un solo archivo. No requiere analyzer.js.
 *
 * INCLUYE:
 * 1. i18n completo — 11 idiomas, changeLang() funcional
 * 2. Subida de audio con drag & drop
 * 3. Visualizador de espectro en tiempo real
 * 4. DSP local — análisis vocal en navegador (Web Audio API)
 * 5. Matching contra harmiq_db_vectores.json
 * 6. Imágenes de artistas — iTunes Search API (gratis, sin secret)
 * 7. Botones YouTube Karaoke + plataforma por geolocalización
 * 8. Selector de épocas musicales en filtros
 * 9. Páginas SEO /voz/* — se sirven como SPA con History API
 * 10. Hardware — 4 packs, 3 opciones, Amazon global por país
 * 11. Compartir resultado viral con imagen de plataforma
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════════════
const AMAZON_DOMAINS = { ES:"es",US:"com",MX:"com.mx",UK:"co.uk",DE:"de",FR:"fr",IT:"it",CA:"ca",BR:"com.br",JP:"co.jp" };
const AFFILIATE_ID   = "harmiqapp-20";
const DB_PATH        = "/harmiq_db_vectores.json";

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
    "btn-record-text":"🎤 Grabar y analizar",
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
    "_or":"— o —","_analyzing":"🔍 Analizando tu voz…","_rec_stop":"⏹ Detener grabación",
    "_result":"Tu resultado","_similarity":"similitud","_vt_label":"Tu tipo de voz","_confidence":"confianza",
    "_share":"📲 Comparte tu resultado","_copy":"📋 Copiar",
    "_share_txt":"🎤 Mi voz se parece a {name} con {pct}% de similitud. ¡Analiza la tuya en harmiq.app!",
    "_err_short":"Audio demasiado corto. Canta al menos 3 segundos.",
    "_err_silent":"Señal muy baja. Acerca el micrófono y canta más fuerte.",
    "_err_mic":"No se pudo acceder al micrófono. Comprueba los permisos.",
    "_err_gender":"Selecciona primero tu tipo de voz (masculina o femenina).",
    "_err_db":"Base de datos no disponible. Recarga la página.",
    "_filter_era":"Época","_all_eras":"Todas las épocas",
    "_eras":{"pre-1960s":"Antes de los 60","1960s":"Años 60","1970s-80s":"70s – 80s","1990s":"Años 90","2000s+":"Años 2000","2010s+":"Años 2010+"},
    "_karaoke":"🎤 Karaoke","_platform":"🎵 Escuchar","_rec_tips":"Para mejor resultado: canta sin música · acerca el micro · evita el eco",
    "_vt_names":{"bass":"Bajo","bass-baritone":"Bajo-Barítono","baritone":"Barítono","tenor":"Tenor","countertenor":"Contratenor","contralto":"Contralto","mezzo-soprano":"Mezzosoprano","soprano":"Soprano"},
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
    "btn-record-text":"🎤 Record & Analyze",
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
    "_or":"— or —","_analyzing":"🔍 Analyzing your voice…","_rec_stop":"⏹ Stop recording",
    "_result":"Your result","_similarity":"similarity","_vt_label":"Your voice type","_confidence":"confidence",
    "_share":"📲 Share your result","_copy":"📋 Copy",
    "_share_txt":"🎤 My voice sounds like {name} with {pct}% similarity. Try yours at harmiq.app!",
    "_err_short":"Audio too short. Sing at least 3 seconds.",
    "_err_silent":"Signal too low. Get closer to the mic and sing louder.",
    "_err_mic":"Could not access microphone. Check permissions.",
    "_err_gender":"Select your voice type first (male or female).",
    "_err_db":"Database not available. Reload the page.",
    "_filter_era":"Era","_all_eras":"All eras",
    "_eras":{"pre-1960s":"Pre-60s","1960s":"The 60s","1970s-80s":"70s – 80s","1990s":"The 90s","2000s+":"2000s","2010s+":"2010s+"},
    "_karaoke":"🎤 Karaoke","_platform":"🎵 Listen","_rec_tips":"For best results: sing without background music · get close to the mic · avoid echo",
    "_vt_names":{"bass":"Bass","bass-baritone":"Bass-Baritone","baritone":"Baritone","tenor":"Tenor","countertenor":"Countertenor","contralto":"Contralto","mezzo-soprano":"Mezzo-soprano","soprano":"Soprano"},
  },
  ca:{
    "nav-cta":"Analitzar la meva veu","hero-badge":"Anàlisi vocal amb IA · 12.000 artistes · 100% Gratis",
    "hero-grad":"cantant famós","hero-title-rest":"viu a la teva veu",
    "hero-desc":"Canta 10 segons. La IA analitza el teu to, timbre i rang vocal.",
    "btn-main":"🎤 Analitzar la meva veu — gratis","btn-how":"Veure com funciona",
    "hero-sub":"Sense registre · Sense instal·lar res · Funciona al mòbil",
    "stat1":"Artistes de tot el món","stat2":"Idiomes","stat3":"Per al teu resultat","stat4":"Gratis sempre",
    "app-title":"Analitza la teva veu","app-desc":"Selecciona la teva veu, puja un àudio o grava directament",
    "opt-default":"Selecciona la teva veu","opt-male":"Veu masculina","opt-female":"Veu femenina",
    "btn-record-text":"🎤 Gravar i analitzar",
    "how-title":"Com funciona","how-sub":"Tres passos. Sense registre.",
    "step1-t":"1. Canta uns segons","step1-d":"Puja un àudio o usa el micròfon. Només 5-10 segons.",
    "step2-t":"2. La IA analitza la teva veu","step2-d":"Detectem la teva freqüència fonamental, timbre i rang.",
    "step3-t":"3. Descobreix el teu cantant","step3-d":"Et diem quin artista coincideix amb la teva veu.",
    "voices-title":"Descobreix el teu tipus de veu","voices-sub":"Cada tipus de veu té les seves cançons ideals.",
    "feat-title":"Tot el que inclou Harmiq","feat-sub":"Molt més que un simple test de veu.",
    "f1-t":"12.000 artistes globals","f1-d":"D'arreu del món.","f2-t":"Cançons per a la teva veu","f2-d":"Adaptades al teu rang.",
    "f3-t":"Artistes per país","f3-d":"Filtra per regió.","f4-t":"Comparteix el resultat","f4-d":"A WhatsApp, Twitter...",
    "f5-t":"Cerca el teu artista","f5-d":"Compara la teva veu.","f6-t":"Privacitat garantida","f6-d":"L'àudio s'esborra immediatament.",
    "cta-title":"Descobreix el teu tipus de veu ara","cta-desc":"Anàlisi gratuïta en 10 segons.","cta-btn":"🎤 Analitzar gratis",
    "_upload_btn":"📁 Pujar àudio","_upload_hint":"WAV · MP3 · M4A · mín. 5 seg",
    "_or":"— o —","_analyzing":"🔍 Analitzant…","_rec_stop":"⏹ Aturar",
    "_result":"El teu resultat","_similarity":"similitud","_vt_label":"El teu tipus de veu","_confidence":"confiança",
    "_share":"📲 Comparteix","_copy":"📋 Copiar",
    "_share_txt":"🎤 La meva veu s'assembla a {name} amb {pct}% de similitud. harmiq.app",
    "_err_short":"Àudio massa curt.","_err_silent":"Senyal molt baixa.","_err_mic":"No s'ha pogut accedir al micròfon.",
    "_err_gender":"Selecciona primer el teu tipus de veu.","_err_db":"Base de dades no disponible.",
    "_filter_era":"Època","_all_eras":"Totes les èpoques",
    "_eras":{"pre-1960s":"Abans dels 60","1960s":"Anys 60","1970s-80s":"70s – 80s","1990s":"Anys 90","2000s+":"Anys 2000","2010s+":"Anys 2010+"},
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
    "opt-default":"Sélectionne ta voix","opt-male":"Voix masculine","opt-female":"Voix féminine","btn-record-text":"🎤 Enregistrer et analyser",
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
    "opt-default":"Wähle deine Stimme","opt-male":"Männerstimme","opt-female":"Frauenstimme","btn-record-text":"🎤 Aufnehmen & Analysieren",
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
    "opt-default":"Seleziona la tua voce","opt-male":"Voce maschile","opt-female":"Voce femminile","btn-record-text":"🎤 Registra e Analizza",
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
    "opt-default":"Selecione sua voz","opt-male":"Voz masculina","opt-female":"Voz feminina","btn-record-text":"🎤 Gravar e Analisar",
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
    "opt-default":"声域を選択","opt-male":"男声","opt-female":"女声","btn-record-text":"🎤 録音して分析",
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
    "opt-default":"Выбери свой голос","opt-male":"Мужской голос","opt-female":"Женский голос","btn-record-text":"🎤 Записать и анализировать",
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
    "opt-default":"Обери свій голос","opt-male":"Чоловічий голос","opt-female":"Жіночий голос","btn-record-text":"🎤 Записати і аналізувати",
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
let lang       = "es";
let singersDb  = [];
let audioBlob  = null;
let isRec      = false;
let mRec       = null;
let chunks     = [];
let analyser   = null;
let actx       = null;
let rafId      = null;
let lastResult = null;
let userCountry= "ES";
let imgCache   = {};  // cache de imágenes iTunes

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

  // Actualizar filtro de épocas
  rebuildEraFilter();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. GEOLOCALIZACIÓN (IP-based, sin permiso del navegador)
// ═══════════════════════════════════════════════════════════════════════════════
async function detectCountry() {
  try {
    const r = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
    const d = await r.json();
    userCountry = d.country_code || "ES";
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
async function getArtistImage(name) {
  if (imgCache[name]) return imgCache[name];
  try {
    const q   = encodeURIComponent(name);
    const url = `https://itunes.apple.com/search?term=${q}&media=music&entity=musicArtist&limit=1`;
    const r   = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const d   = await r.json();
    const img = d.results?.[0]?.artworkUrl100
      ?.replace("100x100bb", "300x300bb") || null;
    imgCache[name] = img;
    return img;
  } catch(_) { return null; }
}

// Precargar imágenes del top 5 en paralelo
async function preloadImages(names) {
  await Promise.allSettled(names.map(n => getArtistImage(n)));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. INYECTAR UI (upload + era filter + spectrum + tips)
// ═══════════════════════════════════════════════════════════════════════════════
function injectUI() {
  const appBox = document.querySelector(".app-box");
  if (!appBox || document.getElementById("_harmiq_ui_injected")) return;
  appBox.setAttribute("id", "_harmiq_ui_injected");

  // ── Tip de grabación ───────────────────────────────────────────────────
  const tipDiv = document.createElement("div");
  tipDiv.id = "_rec_tips_el";
  tipDiv.style.cssText = "background:rgba(124,77,255,.1);border:1px solid rgba(124,77,255,.25);border-radius:10px;padding:.6rem 1rem;font-size:.8rem;color:#a89fff;margin-bottom:1.2rem;text-align:center;";
  tipDiv.textContent = tr("_rec_tips");

  // ── Zona de subida ─────────────────────────────────────────────────────
  const uploadWrap = document.createElement("div");
  uploadWrap.style.cssText = "margin-bottom:1rem;";
  uploadWrap.innerHTML = `
    <div id="_drop_zone" style="border:2px dashed rgba(255,255,255,.18);border-radius:14px;padding:1.4rem;
      text-align:center;cursor:pointer;transition:all .2s;background:rgba(255,255,255,.02);">
      <input type="file" id="_file_inp" accept="audio/*" style="display:none">
      <div style="font-size:1.6rem;margin-bottom:.4rem">🎵</div>
      <div id="_upload_btn_el" style="font-weight:700;color:#7C4DFF;font-size:.95rem;">${tr("_upload_btn")}</div>
      <div id="_upload_hint_el" style="font-size:.75rem;color:#6B7280;margin-top:.2rem;">${tr("_upload_hint")}</div>
      <div id="_file_name" style="margin-top:.4rem;font-size:.82rem;color:#7C4DFF;font-weight:600;"></div>
    </div>
    <div id="_or_el" style="text-align:center;color:#6B7280;font-size:.82rem;margin:.7rem 0;">${tr("_or")}</div>`;

  // ── Canvas espectro ────────────────────────────────────────────────────
  const specWrap = document.createElement("div");
  specWrap.id = "_spec_wrap";
  specWrap.style.cssText = "display:none;margin:.8rem 0;";
  specWrap.innerHTML = `<canvas id="_spec_canvas" style="width:100%;height:72px;border-radius:12px;background:rgba(255,255,255,.04);display:block;"></canvas>`;

  // ── Insertar en el DOM ─────────────────────────────────────────────────
  const genderRow = document.querySelector("[id='user-gender']")?.closest("div");
  const recRow    = document.getElementById("record-btn")?.closest("div");
  if (genderRow && recRow) {
    genderRow.parentNode.insertBefore(tipDiv,    genderRow);
    genderRow.parentNode.insertBefore(uploadWrap, recRow);
    recRow.parentNode.insertBefore(specWrap, recRow.nextSibling);
  }

  // ── Eventos drop zone ──────────────────────────────────────────────────
  const dz = document.getElementById("_drop_zone");
  const fi = document.getElementById("_file_inp");
  dz.addEventListener("click", () => fi.click());
  dz.addEventListener("dragover", e => { e.preventDefault(); dz.style.borderColor="#7C4DFF"; dz.style.background="rgba(124,77,255,.07)"; });
  dz.addEventListener("dragleave", () => { dz.style.borderColor="rgba(255,255,255,.18)"; dz.style.background="rgba(255,255,255,.02)"; });
  dz.addEventListener("drop", e => {
    e.preventDefault(); dz.style.borderColor="rgba(255,255,255,.18)"; dz.style.background="rgba(255,255,255,.02)";
    const f = e.dataTransfer.files[0];
    if (f?.type?.startsWith("audio/")) setFile(f);
  });
  fi.addEventListener("change", () => { if (fi.files[0]) setFile(fi.files[0]); });

  // ── Filtro de épocas (se añade después del resultado) ─────────────────
  // Se inyecta en renderResults()
}

function setFile(f) {
  audioBlob = f;
  const fn = document.getElementById("_file_name");
  if (fn) fn.textContent = `✓ ${f.name}`;
  const dz = document.getElementById("_drop_zone");
  if (dz) { dz.style.borderColor="#7C4DFF"; dz.style.background="rgba(124,77,255,.06)"; }
  showStatus("");
}

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
  const gender = document.getElementById("user-gender")?.value;
  if (!gender) { showStatus(tr("_err_gender"), "err"); return; }

  if (!isRec) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
      chunks = []; isRec = true;
      btn.style.background = "linear-gradient(135deg,#ff4757,#ff6b9d)";
      txt.textContent = tr("_rec_stop");
      showStatus(tr("_analyzing"));
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
        await analyzeAudio();
      };
      mRec.start(100);
    } catch(e) { showStatus(tr("_err_mic"), "err"); }
  } else {
    isRec = false;
    btn.style.background = "";
    txt.textContent = tr("btn-record-text");
    if (mRec?.state !== "inactive") mRec.stop();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. DSP LOCAL
// ═══════════════════════════════════════════════════════════════════════════════
async function extractFeatures(blob) {
  const ab  = await blob.arrayBuffer();
  const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate:22050 });
  let buf;
  try { buf = await ctx.decodeAudioData(ab); } finally { ctx.close(); }

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

function classifyVT(pm, pr, gender) {
  let vt,c,s;
  if (gender==="male"||(gender==="auto"&&pm<205)) {
    if      (pm<110){vt="bass";c=90;s=20;}
    else if (pm<140){vt="bass-baritone";c=122;s=18;}
    else if (pm<200){vt="baritone";c=165;s=28;}
    else            {vt="tenor";c=240;s=40;}
  } else {
    if      (pm<215){vt="contralto";c=185;s=25;}
    else if (pm<270){vt="mezzo-soprano";c=240;s=28;}
    else if (pm<340){vt="soprano";c=295;s=35;}
    else            {vt="soprano";c=350;s=50;}
  }
  return { vt, conf:Math.min(95,Math.round(100*Math.exp(-.5*((pm-c)/s)**2))) };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. MATCHING
// ═══════════════════════════════════════════════════════════════════════════════
const VTS ={bass:1,"bass-baritone":2,baritone:3,tenor:4,countertenor:5,contralto:3,"mezzo-soprano":4,soprano:6};
const VTP =[1,.92,.82,.74,.68,.62];
const SWN =[.28,.07,.12,.20,.08,.05,.05].map((w,_,a)=>w/a.reduce((s,v)=>s+v));

function score(uVec,sVec,uvt,svt) {
  if(!uVec||!sVec||uVec.length!==sVec.length) return 0;
  const su=uVec.slice(0,7),ss=sVec.slice(0,7),mu=uVec.slice(7),ms=sVec.slice(7);
  let wdSq=0;
  for(let i=0;i<7;i++){ const d=su[i]-ss[i]; if(isFinite(d)) wdSq+=SWN[i]*d*d; }
  let dot=0,nU=0,nS=0;
  for(let i=0;i<mu.length;i++){ dot+=mu[i]*ms[i];nU+=mu[i]**2;nS+=ms[i]**2; }
  const cos=(nU>1e-8&&nS>1e-8)?dot/(Math.sqrt(nU)*Math.sqrt(nS)):.5;
  let sim=.35*cos+.65*Math.exp(-3*Math.sqrt(wdSq));
  const u=VTS[uvt]||0,s2=VTS[svt]||0;
  if(u&&s2) sim*=(VTP[Math.abs(u-s2)]??0.60);
  return Math.max(0,Math.min(100,sim*100));
}

function getMatches(vec,vt,gender,filters={},topN=5) {
  let pool=singersDb.filter(s=>s.gender===gender);
  if(pool.length<5) pool=singersDb;
  if(filters.era)            pool=pool.filter(s=>s.era===filters.era);
  if(filters.genre_category) pool=pool.filter(s=>s.genre_category===filters.genre_category);
  if(filters.country_code)   pool=pool.filter(s=>s.country_code===filters.country_code);
  if(pool.length<3)          pool=singersDb.filter(s=>s.gender===gender).length>2?singersDb.filter(s=>s.gender===gender):singersDb;

  const scored=pool.map(s=>({...s,score:Math.round(score(vec,s.vector,vt,s.voice_type)*10)/10}))
    .sort((a,b)=>b.score-a.score);

  const out=[scored[0]]; const seen=new Set([scored[0]?.voice_type]);
  for(const s of scored.slice(1)){
    const e={...s};
    if(seen.has(e.voice_type)&&(out[out.length-1].score-e.score)<3) e.score=Math.round(e.score*.92*10)/10;
    out.push(e); seen.add(e.voice_type);
    if(out.length>=topN) break;
  }
  return out;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. ANÁLISIS
// ═══════════════════════════════════════════════════════════════════════════════
async function analyzeAudio() {
  const gender = document.getElementById("user-gender")?.value;
  if (!gender)    { showStatus(tr("_err_gender"),"err"); return; }
  if (!audioBlob) { showStatus(tr("_err_gender"),"err"); return; }
  if (!singersDb.length){ showStatus(tr("_err_db"),"err"); return; }
  showStatus(tr("_analyzing"));
  try {
    const feat = await extractFeatures(audioBlob);
    const vec  = featuresToVector(feat);
    const {vt,conf} = classifyVT(feat.pitchMean,feat.pitchRange,gender);
    const matches = getMatches(vec,vt,gender,{},5);
    lastResult = {feat,vec,vt,conf,matches,gender};
    await preloadImages(matches.slice(0,5).map(m=>m.name));
    renderResults(lastResult);
    showStatus("");
  } catch(e) { showStatus(e.message||tr("_err_short"),"err"); }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. RENDERIZAR RESULTADOS
// ═══════════════════════════════════════════════════════════════════════════════
function getPlatformLinks(singerName, songName) {
  const platform = getMusicPlatform();
  const q        = encodeURIComponent(`${singerName} ${songName||""}`);
  const qs       = encodeURIComponent(`${singerName} ${songName||""} karaoke`);

  const links = {
    spotify:   `https://open.spotify.com/search/${q}`,
    apple:     `https://music.apple.com/search?term=${q}`,
    youtube:   `https://www.youtube.com/results?search_query=${qs}`,
    line:      `https://music.line.me/search?type=track&q=${q}`,
    melon:     `https://www.melon.com/search/total/index.htm?q=${q}`,
  };

  const platformLabel = { spotify:"Spotify", apple:"Apple Music", youtube:"YouTube", line:"LINE Music", melon:"Melon" };
  const platformColor = { spotify:"#1DB954", apple:"#fc3c44", youtube:"#FF0000", line:"#00B900", melon:"#00CD3C" };

  return {
    karaoke:      links.youtube,
    stream:       links[platform] || links.spotify,
    streamLabel:  platformLabel[platform] || "Spotify",
    streamColor:  platformColor[platform] || "#1DB954",
  };
}

function rebuildEraFilter() {
  const sel = document.getElementById("_era_filter");
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = `<option value="">${tr("_all_eras")}</option>`;
  const eras = ["pre-1960s","1960s","1970s-80s","1990s","2000s+","2010s+"];
  eras.filter(e=>singersDb.some(s=>s.era===e)).forEach(e=>{
    const o = document.createElement("option");
    o.value = e; o.textContent = trV("_eras",e);
    if (e===current) o.selected = true;
    sel.appendChild(o);
  });
}

async function renderResults({feat,vt,conf,matches,gender}) {
  const vtName = trV("_vt_names",vt);
  const sym    = ["🥇","🥈","🥉","4.","5."];

  // ── Inyectar filtro de épocas si no existe ─────────────────────────────
  const resEl = document.getElementById("results");
  if (!resEl) return;

  let filtersHTML = "";
  const eras       = [...new Set(singersDb.map(s=>s.era).filter(Boolean))];
  const eraOptions = ["pre-1960s","1960s","1970s-80s","1990s","2000s+","2010s+"]
    .filter(e=>eras.includes(e))
    .map(e=>`<option value="${e}">${trV("_eras",e)}</option>`).join("");

  filtersHTML = `
    <div id="_filters_row" style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1.25rem;
      padding:.9rem;background:rgba(255,255,255,.04);border-radius:12px;border:1px solid rgba(255,255,255,.08);">
      <div style="flex:1;min-width:120px">
        <div style="font-size:.7rem;color:#6B7280;font-weight:700;text-transform:uppercase;margin-bottom:.25rem">${tr("_filter_era")}</div>
        <select id="_era_filter" style="width:100%;background:#1A1A2E;border:1px solid rgba(255,255,255,.15);
          color:#E5E7EB;font-size:.82rem;padding:.35rem .6rem;border-radius:8px;cursor:pointer;">
          <option value="">${tr("_all_eras")}</option>
          ${eraOptions}
        </select>
      </div>
    </div>`;

  // ── Cards de artistas ──────────────────────────────────────────────────
  const cardsHTML = matches.map((m,i) => {
    const pct  = Math.round(m.score);
    const img  = imgCache[m.name] || null;
    const song = m.reference_songs?.[0] || m.name;
    const {karaoke, stream, streamLabel, streamColor} = getPlatformLinks(m.name, song);
    const vtN  = trV("_vt_names", m.voice_type);

    return `
    <div style="background:rgba(255,255,255,.05);border:1px solid ${i===0?"rgba(124,77,255,.45)":"rgba(255,255,255,.08)"};
      border-radius:16px;padding:1rem 1.1rem;display:flex;gap:.9rem;align-items:flex-start;
      ${i===0?"background:rgba(124,77,255,.07);":""}" >

      <!-- Foto del artista -->
      <div style="width:56px;height:56px;border-radius:50%;overflow:hidden;flex-shrink:0;
        background:linear-gradient(135deg,rgba(124,77,255,.3),rgba(255,79,163,.3));
        display:flex;align-items:center;justify-content:center;font-size:1.4rem;">
        ${img ? `<img src="${img}" alt="${m.name}" style="width:100%;height:100%;object-fit:cover;"
          onerror="this.parentNode.innerHTML='🎤'">` : "🎤"}
      </div>

      <!-- Info -->
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.15rem">
          <span style="font-size:1.1rem">${sym[i]}</span>
          <span style="font-family:'Baloo 2',sans-serif;font-weight:700;font-size:1rem;
            white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.name}</span>
        </div>
        <div style="font-size:.72rem;color:#6B7280;margin-bottom:.5rem;text-transform:capitalize">
          ${vtN}${m.genre_category?" · "+m.genre_category:""}${m.era?" · "+trV("_eras",m.era):""}
        </div>

        <!-- Barra similitud -->
        <div style="height:4px;background:rgba(255,255,255,.08);border-radius:2px;margin-bottom:.5rem">
          <div style="height:4px;width:${pct}%;background:linear-gradient(90deg,#7C4DFF,#FF4FA3);border-radius:2px"></div>
        </div>

        <!-- Canción referencia -->
        ${m.reference_songs?.length?`<div style="font-size:.72rem;color:#6B7280;margin-bottom:.55rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">🎵 ${m.reference_songs.slice(0,2).join(" · ")}</div>`:""}

        <!-- Botones plataforma -->
        <div style="display:flex;gap:.4rem;flex-wrap:wrap">
          <a href="${karaoke}" target="_blank" rel="noopener"
            style="display:inline-flex;align-items:center;gap:.3rem;font-size:.75rem;font-weight:700;
            padding:.3rem .65rem;border-radius:20px;background:rgba(255,0,0,.15);color:#ff4444;
            text-decoration:none;border:1px solid rgba(255,0,0,.25);transition:opacity .2s;"
            onmouseover="this.style.opacity='.75'" onmouseout="this.style.opacity='1'">
            ▶ ${tr("_karaoke")}
          </a>
          <a href="${stream}" target="_blank" rel="noopener"
            style="display:inline-flex;align-items:center;gap:.3rem;font-size:.75rem;font-weight:700;
            padding:.3rem .65rem;border-radius:20px;background:${streamColor}22;color:${streamColor};
            text-decoration:none;border:1px solid ${streamColor}44;transition:opacity .2s;"
            onmouseover="this.style.opacity='.75'" onmouseout="this.style.opacity='1'">
            🎵 ${streamLabel}
          </a>
        </div>
      </div>

      <!-- % Score -->
      <div style="text-align:right;flex-shrink:0">
        <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.35rem;
          background:linear-gradient(135deg,#7C4DFF,#FF4FA3);-webkit-background-clip:text;
          -webkit-text-fill-color:transparent">${pct}%</div>
        <div style="font-size:.68rem;color:#6B7280">${tr("_similarity")}</div>
      </div>
    </div>`;
  }).join("");

  // ── Share buttons ──────────────────────────────────────────────────────
  const shareHTML = `
    <div style="border-top:1px solid rgba(255,255,255,.08);padding-top:1.1rem;margin-top:.25rem">
      <p style="font-size:.82rem;color:#6B7280;margin-bottom:.65rem">${tr("_share")}</p>
      <div style="display:flex;gap:.4rem;flex-wrap:wrap">
        <button onclick="_share('wa')" style="${_btnStyle('#25D366')}">💬 WhatsApp</button>
        <button onclick="_share('x')"  style="${_btnStyle('#000','1px solid #333')}">🐦 Twitter/X</button>
        <button onclick="_share('cp')" style="${_btnStyle('rgba(124,77,255,.2)','1px solid rgba(124,77,255,.3)')}">📋 ${tr("_copy")}</button>
      </div>
    </div>`;

  resEl.innerHTML = `
    <!-- Header resultado -->
    <div style="margin-bottom:1.25rem">
      <span style="background:rgba(124,77,255,.15);border:1px solid rgba(124,77,255,.3);
        color:#a89fff;font-size:.78rem;font-weight:700;padding:.28rem .75rem;border-radius:20px">
        ⚡ ${tr("_result")}
      </span>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-top:1rem">
        <div style="background:rgba(255,255,255,.05);border-radius:12px;padding:.9rem;text-align:center">
          <div style="font-size:.68rem;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.2rem">${tr("_vt_label")}</div>
          <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.25rem;
            background:linear-gradient(135deg,#7C4DFF,#FF4FA3);-webkit-background-clip:text;
            -webkit-text-fill-color:transparent;text-transform:capitalize">${vtName}</div>
          <div style="color:#6B7280;font-size:.72rem">${conf}% ${tr("_confidence")}</div>
        </div>
        <div style="background:rgba(255,255,255,.05);border-radius:12px;padding:.9rem;text-align:center">
          <div style="font-size:.68rem;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.2rem">Pitch</div>
          <div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.25rem;color:#7C4DFF">
            ${Math.round(feat.pitchMean)} Hz</div>
          <div style="color:#6B7280;font-size:.72rem">±${Math.round(feat.pitchRange/2)} Hz</div>
        </div>
      </div>
    </div>
    ${filtersHTML}
    <div style="display:flex;flex-direction:column;gap:.75rem;margin-bottom:1rem">${cardsHTML}</div>
    ${shareHTML}`;

  // ── Evento filtro época ────────────────────────────────────────────────
  document.getElementById("_era_filter")?.addEventListener("change", async e => {
    const era = e.target.value;
    const newMatches = getMatches(lastResult.vec, lastResult.vt, lastResult.gender, {era}, 5);
    await preloadImages(newMatches.map(m=>m.name));
    lastResult.matches = newMatches;
    await renderResults(lastResult);
  });

  // Scroll al resultado
  resEl.scrollIntoView({ behavior:"smooth", block:"start" });
}

function _btnStyle(bg, border="none") {
  return `flex:1;min-width:88px;background:${bg};border:${border};color:#fff;font-family:'Nunito',sans-serif;
    font-weight:700;font-size:.82rem;padding:.55rem .7rem;border-radius:10px;cursor:pointer;transition:opacity .2s;`;
}

function _share(p) {
  if (!lastResult?.matches?.[0]) return;
  const m   = lastResult.matches[0];
  const pct = Math.round(m.score);
  const txt = tr("_share_txt").replace("{name}",m.name).replace("{pct}",pct);
  if (p==="wa") window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, "_blank");
  if (p==="x")  window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(txt)}`, "_blank");
  if (p==="cp") navigator.clipboard.writeText(txt).then(()=>{ showStatus("✅ Copiado!"); setTimeout(()=>showStatus(""),2e3); });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 11. PÁGINAS SEO /voz/* — SPA con History API
// ═══════════════════════════════════════════════════════════════════════════════
const VOZ_DATA = {
  baritono: {
    emoji:"🎭", color:"#7C4DFF", range:"Sol2 – Sol4", hz:"98 – 392 Hz",
    desc_es:"El barítono es el tipo de voz masculina más común y versátil. Su zona de confort abarca desde el Sol2 al Sol4, con una riqueza tímbrica que lo hace ideal para el pop, el rock y la música clásica. La mayoría de los cantantes más famosos del mundo son barítonos.",
    desc_en:"The baritone is the most common and versatile male voice type. Its comfort zone spans from G2 to G4, with a timbral richness that makes it ideal for pop, rock, and classical music.",
    artists:["Freddie Mercury","Elvis Presley","Michael Bublé","Frank Sinatra","Alejandro Sanz","David Bowie"],
    exercises_es:["Escalas de Do mayor subiendo por semitonos","Arpegios Sol2-Sol4-Sol2","Vocalizaciones ma-me-mi-mo-mu","Sirenas completas del grave al agudo","Humming con labios cerrados"],
    exercises_en:["C major scales ascending by semitones","Arpeggios G2-G4-G2","Vocalizations ma-me-mi-mo-mu","Full sirens from low to high","Lip trill humming"],
    songs:["Perfect – Ed Sheeran","Hallelujah – Leonard Cohen","My Way – Frank Sinatra","Bohemian Rhapsody – Queen","Corazón Partío – Alejandro Sanz"],
    yt_expert:"vocal coach baritone exercises",
    mics:[{name:"Audio-Technica AT2020",reason:"Captura el registro cálido del barítono sin coloración",asin:"B0006H92QK"},{name:"Rode NT1",reason:"Cero ruido de fondo, ideal para grabar en casa",asin:"B01KQRBFOU"},{name:"Shure SM7B",reason:"El estándar broadcast para voces graves",asin:"B0002E4Z8M"}],
  },
  tenor: {
    emoji:"🎤", color:"#118AB2", range:"Do3 – Do5", hz:"131 – 523 Hz",
    desc_es:"El tenor es la voz masculina más aguda de las clasificaciones principales. Brillante y proyectada, es la voz más utilizada en el pop comercial, el rock y la ópera. Su zona de confort va del Do3 al La4, pudiendo alcanzar el Do5 con técnica avanzada.",
    desc_en:"The tenor is the highest of the main male voice types. Bright and projected, it's the most used voice in commercial pop, rock and opera.",
    artists:["Luciano Pavarotti","Andrea Bocelli","Alejandro Fernández","Roberto Carlos","Camilo Sesto","Benson Boone"],
    exercises_es:["Sirenas ascendentes hasta Do5","Escalas en mezzo voce (media voz)","Ejercicios de mix voice","Trinos en la zona Si3-Re4","Vocalizaciones en posición de 'i' cerrada"],
    exercises_en:["Ascending sirens to C5","Mezzo voce scales","Mix voice exercises","Trills in the B3-D4 zone","Vocalizations on closed 'i' position"],
    songs:["Nessun Dorma – Pavarotti","Con Te Partirò – Bocelli","Libre – Nino Bravo","Beautiful Things – Benson Boone","Tu Cárcel – Los Yonics"],
    yt_expert:"tenor vocal exercises training",
    mics:[{name:"Audio-Technica AT2035",reason:"Realce en 'banda de aire' para los armónicos del tenor",asin:"B00EXR4EVS"},{name:"Rode NT1-A",reason:"Ultrabajo ruido para capturar los agudos limpios",asin:"B06XYVQQVY"},{name:"AKG C214",reason:"Calidad profesional con carácter musical",asin:"B004YDOSIE"}],
  },
  soprano: {
    emoji:"✨", color:"#FF4FA3", range:"Do4 – Do6", hz:"261 – 1047 Hz",
    desc_es:"La soprano es la voz femenina más aguda. Su extensión natural va del Do4 al La5, con las sopranos de coloratura alcanzando el Do6 y más. Es la voz más luminosa y dramática del espectro vocal, dominando la ópera y el pop de alta gama.",
    desc_en:"The soprano is the highest female voice type. Its natural range spans from C4 to A5, with coloratura sopranos reaching C6 and beyond.",
    artists:["Mariah Carey","Whitney Houston","Celine Dion","Ariana Grande","María Callas","Sabrina Carpenter"],
    exercises_es:["Trinos en Re5-La5","Escalas de octava completas","Pianissimo en los agudos","Portamentos suaves","Vocalizaciones en 'ah' con resonancia de cabeza"],
    exercises_en:["Trills D5-A5","Full octave scales","Pianissimo on high notes","Gentle portamentos","Vocalizations on 'ah' with head resonance"],
    songs:["Hero – Mariah Carey","I Will Always Love You – Whitney Houston","My Heart Will Go On – Celine Dion","God is a Woman – Ariana Grande","Casta Diva – Bellini"],
    yt_expert:"soprano vocal exercises high notes",
    mics:[{name:"Neumann TLM 102",reason:"El condensador de referencia para voces de soprano",asin:"B001FVIXKS"},{name:"Audio-Technica AT2020",reason:"Captura los armónicos brillantes sin saturación",asin:"B0006H92QK"},{name:"Rode NT1",reason:"Cero ruido, ideal para los pianissimos de soprano",asin:"B01KQRBFOU"}],
  },
  "mezzo-soprano": {
    emoji:"🎶", color:"#FF9F1C", range:"La3 – La5", hz:"220 – 880 Hz",
    desc_es:"La mezzosoprano es la voz femenina media, poderosa y rica en armónicos. Su timbre cálido y su facilidad en el registro de pecho la hacen ideal para el soul, el R&B, el pop y la música clásica. Artistas como Adele, Amy Winehouse y Beyoncé son mezzosopranos.",
    desc_en:"The mezzo-soprano is the middle female voice type, powerful and rich in harmonics. Its warm timbre makes it ideal for soul, R&B, pop and classical music.",
    artists:["Adele","Amy Winehouse","Beyoncé","Rosalía","Tracy Chapman","Billie Eilish"],
    exercises_es:["Escalas La3-La5 subiendo y bajando","Arpegios de tríada","Vocalizaciones en 'nay-nay'","Ejercicios de pecho hacia abajo","Sirenas Do3-Do5"],
    exercises_en:["Scales A3-A5 up and down","Triad arpeggios","Vocalizations on 'nay-nay'","Chest register exercises downward","Sirens C3-C5"],
    songs:["Rolling in the Deep – Adele","Rehab – Amy Winehouse","Crazy in Love – Beyoncé","Con Altura – Rosalía","Fast Car – Tracy Chapman"],
    yt_expert:"mezzo soprano vocal exercises",
    mics:[{name:"Rode NT1",reason:"Captura la calidez del registro medio con precisión",asin:"B01KQRBFOU"},{name:"Audio-Technica AT2035",reason:"Equilibrio perfecto para voces de potencia media",asin:"B00EXR4EVS"},{name:"Shure SM7B",reason:"Para un sonido más broadcasted y potente",asin:"B0002E4Z8M"}],
  },
  contralto: {
    emoji:"🌿", color:"#80B918", range:"Fa3 – Fa5", hz:"175 – 698 Hz",
    desc_es:"La contralto es la voz femenina más grave y oscura. Una rareza privilegiada con un timbre único, profundo y cálido. Artistas como Tracy Chapman, Norah Jones y Cher son contraltos reconocidas.",
    desc_en:"The contralto is the lowest female voice type. A privileged rarity with a unique, deep and warm timbre.",
    artists:["Tracy Chapman","Norah Jones","Cher","Tina Turner","Nina Simone","k.d. lang"],
    exercises_es:["Humming en Fa3-Do4","Ejercicios de registro de pecho profundo","Sirenas Do3-Do5","Vocalizaciones en 'oo' grave","Escalas descendentes con apoyo diafragmático"],
    exercises_en:["Humming on F3-C4","Deep chest register exercises","Sirens C3-C5","Low 'oo' vocalizations","Descending scales with diaphragm support"],
    songs:["Fast Car – Tracy Chapman","Come Away With Me – Norah Jones","Believe – Cher","River Deep Mountain High – Tina Turner","Feeling Good – Nina Simone"],
    yt_expert:"contralto voice exercises training",
    mics:[{name:"Shure SM7B",reason:"Diseñado para voces graves y profundas",asin:"B0002E4Z8M"},{name:"Rode Procaster",reason:"Dinámico con gran cuerpo para voces graves",asin:"B004CRN9BS"},{name:"Audio-Technica AT4040",reason:"Condensador cálido que favorece el registro grave",asin:"B0002GIRCE"}],
  },
  bajo: {
    emoji:"🎸", color:"#1E3A5F", range:"Mi2 – Do4", hz:"82 – 261 Hz",
    desc_es:"El bajo es la voz masculina más grave, profunda y resonante. Una auténtica rareza vocal que produce una presencia escénica imponente. Johnny Cash, Leonard Cohen y Boris Christoff son referentes clásicos del bajo.",
    desc_en:"The bass is the lowest male voice type, deep and resonant. A true vocal rarity with an imposing stage presence.",
    artists:["Johnny Cash","Leonard Cohen","Barry White","Nick Cave","Tom Waits","Isaac Hayes"],
    exercises_es:["Humming en Mi2-Do3","Sirenas descendentes al máximo grave","Vocalizaciones en 'oo' y 'oh' graves","Escalas muy lentas con apoyo total","Buzzing de labios en el registro más bajo"],
    exercises_en:["Humming on E2-C3","Maximum low descending sirens","Low 'oo' and 'oh' vocalizations","Very slow scales with full support","Lip buzzing in the lowest register"],
    songs:["Ring of Fire – Johnny Cash","Hallelujah – Leonard Cohen","Can't Get Enough – Barry White","Into My Arms – Nick Cave","Georgia Lee – Tom Waits"],
    yt_expert:"bass voice training exercises",
    mics:[{name:"Shure SM7B",reason:"El estándar absoluto para voces graves broadcast",asin:"B0002E4Z8M"},{name:"Electro-Voice RE20",reason:"Cardiode variable, diseñado para voces graves",asin:"B000Z7LLQ0"},{name:"Rode Broadcaster",reason:"Cálido y robusto, ideal para el bajo profundo",asin:"B003UIP5GS"}],
  },
};

function renderVozPage(slug) {
  const key  = slug === "bajo" ? "bajo" : slug.replace("-", " ") === "mezzo soprano" ? "mezzo-soprano" : slug;
  const data = VOZ_DATA[key];
  if (!data) return false;

  const isES     = lang === "es" || lang === "ca" || lang === "es";
  const langES   = ["es","ca","pt","it","fr","de","ru","uk"].includes(lang);
  const desc     = langES ? data.desc_es : data.desc_en;
  const exercises= langES ? data.exercises_es : data.exercises_en;
  const amzDomain= getAmazonDomain();

  const artistCards = data.artists.map(a => {
    const img = imgCache[a];
    return `<div style="text-align:center;padding:.75rem;background:rgba(255,255,255,.04);border-radius:12px;border:1px solid rgba(255,255,255,.08)">
      <div style="width:56px;height:56px;border-radius:50%;margin:0 auto .5rem;overflow:hidden;background:rgba(124,77,255,.2);display:flex;align-items:center;justify-content:center;font-size:1.5rem">
        ${img?`<img src="${img}" alt="${a}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentNode.innerHTML='🎤'">`:"🎤"}
      </div>
      <div style="font-weight:700;font-size:.88rem">${a}</div>
    </div>`;
  }).join("");

  const micCards = data.mics.map(m => `
    <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:1rem;display:flex;gap:.75rem;align-items:flex-start">
      <div style="font-size:1.4rem">🎤</div>
      <div style="flex:1">
        <div style="font-weight:700;font-size:.92rem;margin-bottom:.2rem">${m.name}</div>
        <div style="font-size:.78rem;color:#6B7280;margin-bottom:.5rem">${m.reason}</div>
        <a href="https://${amzDomain}/dp/${m.asin}?tag=${AFFILIATE_ID}" target="_blank" rel="noopener sponsored"
          style="display:inline-block;background:linear-gradient(135deg,#7C4DFF,#FF4FA3);color:#fff;
          font-size:.78rem;font-weight:700;padding:.35rem .75rem;border-radius:8px;text-decoration:none">
          Ver oferta en Amazon →
        </a>
      </div>
    </div>`).join("");

  const ytSearch = encodeURIComponent(data.yt_expert);
  const ytEmbed  = `https://www.youtube.com/embed?listType=search&list=${ytSearch}`;

  document.body.innerHTML = `
<!DOCTYPE html><html lang="${lang}"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${data.emoji} Voz de ${slug.charAt(0).toUpperCase()+slug.slice(1)} — Tipo de voz, artistas y ejercicios | Harmiq</title>
<meta name="description" content="${desc.slice(0,155)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800;900&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css">
<style>
  .voz-hero{background:linear-gradient(135deg,${data.color}22,rgba(255,79,163,.12));border-radius:20px;padding:2.5rem 2rem;margin-bottom:2.5rem;text-align:center}
  .voz-section{margin-bottom:2.5rem}
  .voz-section h2{font-family:'Baloo 2',sans-serif;font-weight:800;font-size:1.4rem;margin-bottom:1rem;
    background:linear-gradient(135deg,${data.color},#FF4FA3);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .voz-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:.75rem}
  .voz-exercise{background:rgba(255,255,255,.04);border-left:3px solid ${data.color};
    padding:.6rem .9rem;border-radius:0 8px 8px 0;font-size:.88rem;color:#E5E7EB}
</style>
</head><body>
<nav><a class="logo" href="/">🎙️ Harmiq</a>
  <ul class="nav-links"><li><a href="/voz/baritono">Barítono</a></li><li><a href="/voz/tenor">Tenor</a></li>
    <li><a href="/voz/soprano">Soprano</a></li><li><a href="/#app">🎤 Analizar mi voz</a></li></ul>
</nav>

<div style="max-width:820px;margin:2rem auto;padding:0 1.5rem">

  <div class="voz-hero">
    <div style="font-size:3rem;margin-bottom:.5rem">${data.emoji}</div>
    <h1 style="font-family:'Baloo 2',sans-serif;font-weight:900;font-size:clamp(2rem,5vw,3rem);
      background:linear-gradient(135deg,#fff,${data.color});-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:.5rem">
      Voz de ${slug.charAt(0).toUpperCase()+slug.slice(1)}
    </h1>
    <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin:.75rem 0 1rem">
      <span style="background:${data.color}33;color:${data.color};font-weight:700;font-size:.85rem;
        padding:.3rem .8rem;border-radius:20px">🎼 ${data.range}</span>
      <span style="background:rgba(255,255,255,.08);color:#9CA3AF;font-size:.85rem;
        padding:.3rem .8rem;border-radius:20px">${data.hz}</span>
    </div>
    <p style="color:#D1D5DB;font-size:.95rem;line-height:1.7;max-width:600px;margin:0 auto 1.5rem">${desc}</p>
    <a class="btn" href="/#app">🎤 Analizar mi voz — ¿soy ${slug}?</a>
  </div>

  <!-- Artistas de referencia -->
  <div class="voz-section">
    <h2>🌟 Artistas famosos con voz de ${slug}</h2>
    <div class="voz-grid">${artistCards}</div>
  </div>

  <!-- Canciones que puedes cantar -->
  <div class="voz-section">
    <h2>🎵 Canciones perfectas para este tipo de voz</h2>
    <div style="display:flex;flex-direction:column;gap:.5rem">
      ${data.songs.map(s=>`<div style="background:rgba(255,255,255,.04);border-radius:10px;padding:.65rem 1rem;
        font-size:.9rem;display:flex;align-items:center;gap:.5rem">
        <span>🎵</span><span style="font-weight:600">${s}</span>
        <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(s+' karaoke')}"
          target="_blank" rel="noopener" style="margin-left:auto;background:rgba(255,0,0,.12);color:#ff4444;
          font-size:.72rem;font-weight:700;padding:.25rem .6rem;border-radius:20px;text-decoration:none;
          border:1px solid rgba(255,0,0,.25)">▶ Karaoke</a>
      </div>`).join("")}
    </div>
  </div>

  <!-- Ejercicios vocales -->
  <div class="voz-section">
    <h2>🎯 Ejercicios vocales para ${slug}</h2>
    <div style="display:flex;flex-direction:column;gap:.5rem">
      ${exercises.map((e,i)=>`<div class="voz-exercise">
        <span style="color:${data.color};font-weight:800;margin-right:.5rem">${i+1}.</span>${e}
      </div>`).join("")}
    </div>
  </div>

  <!-- Vídeos YouTube (expertos) -->
  <div class="voz-section">
    <h2>🎬 Aprende con los mejores expertos</h2>
    <p style="color:#6B7280;font-size:.85rem;margin-bottom:1rem">Vídeos seleccionados de profesores de canto especializados en voz de ${slug}</p>
    <div style="border-radius:14px;overflow:hidden;aspect-ratio:16/9;background:#000">
      <iframe width="100%" height="100%"
        src="https://www.youtube.com/embed?listType=search&list=${ytSearch}&autoplay=0"
        frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen style="border-radius:14px"></iframe>
    </div>
  </div>

  <!-- Micrófonos recomendados -->
  <div class="voz-section">
    <h2>🎙️ Micrófonos recomendados para voz de ${slug}</h2>
    <p style="color:#6B7280;font-size:.85rem;margin-bottom:1rem">Seleccionados según las frecuencias y características de este tipo de voz</p>
    <div style="display:flex;flex-direction:column;gap:.75rem">${micCards}</div>
    <p style="font-size:.72rem;color:#4B5563;margin-top:.75rem">* Links de afiliado Amazon · Harmiq recibe una pequeña comisión sin coste adicional para ti</p>
  </div>

  <!-- CTA final -->
  <div class="cta-box" style="margin:2rem 0">
    <h2>¿Eres ${slug}? Compruébalo ahora</h2>
    <p>Análisis gratuito en 10 segundos. Sin registro.</p>
    <a class="btn" href="/#app">🎤 Analizar mi voz gratis</a>
  </div>

</div>
<footer><div class="fl"><a href="/">Inicio</a><a href="/que-tipo-de-voz-tengo">Test vocal</a>
  <a href="https://ko-fi.com/harmiq" target="_blank">☕ Apoya Harmiq</a></div>
  <p>© 2025 Harmiq · Análisis vocal con IA</p>
</footer>
</body></html>`;

  // Precargar imágenes de artistas de referencia
  Promise.allSettled(data.artists.map(a => getArtistImage(a))).then(() => {
    data.artists.forEach(a => {
      if (imgCache[a]) {
        document.querySelectorAll(`[alt="${a}"]`).forEach(img => { img.src = imgCache[a]; });
      }
    });
  });

  return true;
}

// ── Router SPA ─────────────────────────────────────────────────────────────────
function handleRoute() {
  const path = location.pathname;
  const match = path.match(/^\/voz\/(.+)$/);
  if (match) {
    const slug = match[1];
    const rendered = renderVozPage(slug);
    if (!rendered) {
      // Slug no reconocido — volver al inicio
      history.replaceState({}, "", "/");
    }
    return true;
  }
  return false;
}

// Interceptar clicks en links /voz/*
document.addEventListener("click", e => {
  const a = e.target.closest("a[href]");
  if (!a) return;
  const href = a.getAttribute("href");
  if (href?.startsWith("/voz/")) {
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
async function loadDB() {
  try {
    const r = await fetch(DB_PATH);
    if (!r.ok) throw new Error();
    const d = await r.json();
    singersDb = d.singers || [];
    console.log(`✓ DB: ${singersDb.length} cantantes`);
  } catch(e) {
    console.warn("DB no disponible");
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 14. INIT
// ═══════════════════════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", async () => {
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

  // Inyectar UI dinámica
  injectUI();

  // Botón grabar
  const btn = document.getElementById("record-btn");
  if (btn) {
    btn.onclick = async () => {
      const gender = document.getElementById("user-gender")?.value;
      if (!gender) { showStatus(tr("_err_gender"),"err"); return; }
      if (!isRec && audioBlob) {
        await analyzeAudio();
      } else {
        await toggleRecording();
      }
    };
  }

  // Cargar DB
  await loadDB();
});
