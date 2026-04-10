import os, re, json, time, urllib.request, urllib.parse

ARTISTAS_DIR = r"E:\Harmiq_viaje\cloudflare\artistas"
CACHE_PATH = r"E:\Harmiq_viaje\itunes_img_cache.json"

VOCAL_HARDWARE = {
    "Tenor": {"Pro": "Neumann U87 Ai", "Versat": "LEWITT LCT 440 PURE", "Budget": "Audio-Technica AT2020", "Reasoning": "Ideal para capturar la claridad y los agudos brillantes de los tenores."},
    "Barítono": {"Pro": "Shure SM7B", "Versat": "Warm Audio WA-87 R2", "Budget": "Rode NT1 5th Gen", "Reasoning": "Excelente para dar calidez y cuerpo a los registros medios y graves."},
    "Soprano": {"Pro": "AKG C414 XLII", "Versat": "Neumann TLM 103", "Budget": "Sennheiser MK4", "Reasoning": "Diseñados para manejar la potencia de agudos sin sacrificar suavidad."},
    "Mezzosoprano": {"Pro": "Neumann TLM 102", "Versat": "Aston Microphones Origin", "Budget": "AKG P420", "Reasoning": "Captura la riqueza tonal y versatilidad de las mezzosopranos con detalle."},
    "Contralto": {"Pro": "Shure KSM32", "Versat": "Warm Audio WA-47jr", "Budget": "Behringer B-2 Pro", "Reasoning": "Resalta la profundidad y densidad única de la voz de contralto."},
    "Bajo": {"Pro": "Electro-Voice RE20", "Versat": "Rode NT2-A", "Budget": "MXL 990", "Reasoning": "Perfecto para capturar frecuencias graves sin el efecto de proximidad excesivo."}
}

VOCAL_GADGETS = [
    {"name": "Lax Vox (Terapia de Pajita)", "desc": "El 'must-have' para hidratar y relajar tus cuerdas vocales bajo el agua.", "link": "https://www.amazon.es/s?k=Lax+Vox+pajita+silicona+entrenamiento+vocal", "icon": "🥤"},
    {"name": "Beltbox (Máscara Vocal)", "desc": "Calienta tu voz en cualquier lugar silenciando tu volumen un 90%.", "link": "https://www.amazon.es/s?k=Beltbox+vocal+dampener+mask", "icon": "🎭"},
    {"name": "Nebulizador Vocal", "desc": "Hidratación directa a través de micro-partículas de suero salino.", "link": "https://www.amazon.es/s?k=Vocal+Mist+Nebulizador+portatil", "icon": "💨"}
]

DIET_YES = ["Agua (Temperatura Ambiente)", "Té de Jengibre y Miel", "Frutas con Alto Contenido de Agua"]
DIET_NO = ["Lácteos (Generan Mucosidad)", "Cafeína (Deshidrata)", "Picante (Reflujo Gástrico)"]

VERIFIED_ARTISTS = {
    # MASCULINOS
    "bad-bunny": ("Barítono", "Bad Bunny posee una voz de barítono, caracterizada por un tono grave, áspero y una gran maleabilidad.", ["Tití Me Preguntó", "Me Porto Bonito", "Dákiti"]),
    "j-balvin": ("Barítono", "J Balvin tiene una voz de barítono con un timbre cálido y versátil.", ["Mi Gente", "LA CANCIÓN", "Ay Vamos"]),
    "maluma": ("Tenor", "Maluma posee una voz de tenor con un timbre suave y melódico.", ["Hawái", "Felices los 4", "Sobrio"]),
    "justin-bieber": ("Tenor", "Justin Bieber es un tenor lírico ligero con un timbre brillante y juvenil.", ["Baby", "Sorry", "Love Yourself"]),
    "michael-jackson": ("Tenor", "Michael Jackson poseía una voz de tenor alto con un rango de casi 4 octavas.", ["Billie Jean", "Beat It", "Man in the Mirror"]),
    "elvis-presley": ("Barítono", "Elvis Presley poseía una voz de barítono alto con un rango excepcional de casi 3 octavas.", ["Can't Help Falling in Love", "Jailhouse Rock"]),
    "freddie-mercury": ("Tenor", "Freddie Mercury poseía una voz de tenor con un rango vocal extraordinario.", ["Bohemian Rhapsody", "Don't Stop Me Now"]),
    "frank-sinatra": ("Barítono", "Frank Sinatra es considerado el barítono lírico ligero por excelencia del pop.", ["My Way", "Fly Me to the Moon"]),
    "david-bowie": ("Barítono", "David Bowie poseía una voz de barítono con una versatilidad transformadora.", ["Starman", "Space Oddity"]),
    "bruno-mars": ("Tenor", "Bruno Mars es un tenor con un rango vocal amplio y una técnica excepcional.", ["Uptown Funk", "Just the Way You Are"]),
    "ed-sheeran": ("Tenor", "Ed Sheeran posee una voz de tenor con un timbre cálido y accesible.", ["Shape of You", "Perfect"]),
    "harry-styles": ("Barítono", "Harry Styles posee una voz de barítono con un timbre rico y versátil.", ["As It Was", "Watermelon Sugar"]),
    "the-weeknd": ("Tenor", "The Weeknd posee una voz de tenor con un timbre distintivo y etéreo.", ["Blinding Lights", "Starboy"]),
    "shawn-mendes": ("Tenor", "Shawn Mendes es un tenor con un timbre brillante y juvenil.", ["Señorita", "Stitches"]),
    "adele": ("Mezzosoprano", "Adele posee una voz de mezzosoprano con profundo tono soul y emotividad inigualable.", ["Someone Like You", "Hello"]),
    "ariana-grande": ("Soprano", "Ariana Grande es una soprano ligera con control excepcional del 'whistle register'.", ["7 rings", "thank u, next"]),
    "beyonc": ("Mezzosoprano", "Beyoncé posee una voz de mezzosoprano asombrosamente versátil y acrobática.", ["Halo", "Crazy In Love"]),
    "billie-eilish": ("Soprano", "Billie Eilish posee una técnica sussurrada etérea con base de soprano-clara.", ["bad guy", "ocean eyes"]),
    "rosal-a": ("Mezzosoprano", "Rosalía combina el cante flamenco tradicional con texturas de mezzosoprano urbana.", ["Despechá", "Candy", "Malamente"]),
    "karol-g": ("Soprano", "Karol G destaca con un acento paisa sobre una voz aguda melódica urbano/pop.", ["PROVENZA", "TQG"]),
    "aitana": ("Soprano", "Aitana tiene una voz ligera dulce con muchísima resonancia de cabeza.", ["Mariposas", "Vas A Quedarte"]),
    "c-tangana": ("Barítono", "C. Tangana posee una voz de barítono con estilo grave.", ["Tú Me Dejaste De Querer", "Demasiadas Mujeres"]),
    "quevedo": ("Barítono", "Quevedo posee un registro de barítono, muy grueso y resonante.", ["Columbia", "Bzrp Session 52"]),
    "dua-lipa": ("Mezzosoprano", "Dua Lipa es una mezzosoprano con timbre muy oscuro perfecto para dance-pop.", ["Don't Start Now", "Levitating"]),
    "miley-cyrus": ("Mezzosoprano", "Miley Cyrus ha desarrollado un tono enormemente texturizado y algo ronco.", ["Flowers", "Wrecking Ball"]),
    "amy-winehouse": ("Contralto", "Amy Winehouse trajo el jazz más añejo con una profundidad vocal sin par.", ["Back to Black", "Rehab"]),
    "shakira": ("Mezzosoprano", "Shakira posee un timbre único y técnicas distintivas que enriquecen su tono mezzo.", ["Hips Don't Lie", "Waka Waka"]),
    "alejandro-sanz": ("Tenor", "Alejandro Sanz es un tenor con un timbre distintivo y muy emotivo.", ["Corazón Partío", "Amiga Mía"]),
    "david-bisbal": ("Tenor", "David Bisbal es un tenor con un timbre potente y brillante.", ["Bulería", "Ave María"]),
    "pablo-albor-n": ("Tenor", "Pablo Alborán es un tenor con un timbre cálido y dulce.", ["Solamente Tú", "Saturno"]),
    "camilo-sesto": ("Tenor", "Camilo Sesto era un tenor dramático con asombrosa capacidad de agudos.", ["Vivir Así es Morir de Amor", "Perdóname"]),
    "julio-iglesias": ("Barítono", "Julio Iglesias es el barítono romántico definitivo. Posee un tono aterciopelado.", ["Me Olvidé de Vivir", "Soy un Truhán"]),
    "vicente-fern-ndez": ("Barítono", "Vicente Fernández poseía una voz de barítono mariachi de enorme potencia.", ["El Rey", "Volver Volver"]),
    "mariah-carey": ("Soprano", "Mariah Carey es célebre por su dominio del registro silbido.", ["Hero", "Fantasy"]),
    "celine-dion": ("Soprano", "Céline Dion posee potencia, pureza y técnica en su impresionante soprano.", ["My Heart Will Go On", "All by Myself"]),
    "whitney-houston": ("Mezzosoprano", "Whitney Houston tenía el belting más espectacular de la era pop.", ["I Will Always Love You", "I Wanna Dance"]),
    "nina-simone": ("Contralto", "Nina Simone tenía uno de los contraltos más emotivos y dramáticos del jazz.", ["Feeling Good", "Sinnerman"]),
    "cher": ("Contralto", "Cher posee la voz de contralto pop más icónica del mundo.", ["Believe", "Strong Enough"]),
    # Lista extendida (todos los perfiles detectados en el directorio serán procesados por el loop)
}

def load_cache():
    if os.path.exists(CACHE_PATH):
        try:
            with open(CACHE_PATH, "r", encoding="utf-8") as f: return json.load(f)
        except: return {}
    return {}

IMG_CACHE = load_cache()

def upgrade_html_v5(html_path, slug, vocal_type, bio_text, songs, artist_img):
    try:
        with open(html_path, 'r', encoding='utf-8') as f: content = f.read()
    except: return False
    m_name = re.search(r'<h1>(.*?)</h1>', content)
    artist_name = m_name.group(1).strip() if m_name else slug.replace("-", " ").title()
    v_base = vocal_type.split()[0]
    hw = VOCAL_HARDWARE.get(v_base, VOCAL_HARDWARE["Tenor"])
    hw_html = f'''<div class="hw-item"><span class="hw-label">Nivel Pro</span><span class="hw-name">{hw["Pro"]}</span></div><div class="hw-item"><span class="hw-label">Home Studio</span><span class="hw-name">{hw["Versat"]}</span></div>'''
    gadgets_html = "".join([f'<div class="gadget-card"><span class="gadget-icon">{g["icon"]}</span><div class="gadget-info"><h4>{g["name"]}</h4><p>{g["desc"]}</p><a href="{g["link"]}" target="_blank" class="amazon-btn">Ver en Amazon</a></div></div>' for g in VOCAL_GADGETS])
    songs_html = "".join([f'<a href="https://www.youtube.com/results?search_query={urllib.parse.quote(f"{artist_name} {s}")}" target="_blank" class="song-card"><span>{s}</span><span class="song-icon">▶</span></a>' for s in songs])
    new_html = f'''<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>{artist_name} | Perfil Vocal V5 | Harmiq</title><link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&display=swap" rel="stylesheet"><style>:root{{--p:#7C4DFF;--a:#FF4FA3;--dark:#05040d;--card:#110f21;--t:#FFFFFF;--m:#8E8CA7;--glass:rgba(255,255,255,0.03);--glass-border:rgba(255,255,255,0.08)}}*{{margin:0;padding:0;box-sizing:border-box}}body{{background:var(--dark);color:var(--t);font-family:'Outfit',sans-serif;line-height:1.6;overflow-x:hidden}}.grad{{background:linear-gradient(135deg,var(--p),var(--a));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}}nav{{display:flex;justify-content:space-between;align-items:center;padding:1.2rem 5%;background:rgba(5,4,13,0.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);position:sticky;top:0;z-index:1000;border-bottom:1px solid var(--glass-border)}}.container{{max-width:1100px;margin:0 auto;padding:4rem 5%}}.hero{{text-align:center;margin-bottom:5rem;position:relative}}.hero-glow{{position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:350px;height:350px;background:var(--p);filter:blur(150px);opacity:0.15;z-index:-1}}.artist-img{{width:200px;height:200px;border-radius:40px;object-fit:cover;border:4px solid var(--glass-border);margin-bottom:1.5rem;box-shadow:0 30px 60px rgba(0,0,0,0.5)}}h1{{font-size:clamp(2.5rem,8vw,4.5rem);font-weight:900;letter-spacing:-0.05em;line-height:1;margin-bottom:1rem}}.grid-v5{{display:grid;grid-template-columns:1.5fr 1fr;gap:2rem}}.card-v5{{background:var(--glass);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid var(--glass-border);border-radius:32px;padding:2.5rem;margin-bottom:2rem}}.hw-grid{{display:grid;grid-template-columns:1fr 1fr;gap:1.2rem;margin-top:1.5rem}}.hw-item{{background:rgba(255,255,255,0.02);padding:1.2rem;border-radius:20px;border:1px solid var(--glass-border);text-align:center}}.hw-label{{display:block;font-size:0.7rem;color:var(--a);font-weight:900;text-transform:uppercase;margin-bottom:0.4rem}}.gadget-card{{background:rgba(255,255,255,0.03);border-radius:24px;padding:1.5rem;display:flex;gap:1.2rem;margin-bottom:1rem;border:1px solid var(--glass-border);transition:0.3s}}.gadget-card:hover{{border-color:var(--p);transform:translateX(5px)}}.gadget-icon{{font-size:2rem}}.amazon-btn{{background:var(--p);color:#fff;text-decoration:none;padding:0.4rem 1rem;border-radius:50px;font-weight:800;font-size:0.8rem;display:inline-block;margin-top:0.8rem}}.diet-box{{background:linear-gradient(135deg,rgba(0,255,136,0.05),rgba(124,77,255,0.05));border-radius:24px;padding:2rem;border:1px solid rgba(0,255,136,0.1)}}.diet-grid{{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-top:1rem}}.diet-yes{{color:#00FF88;font-weight:700;list-style:none}}.diet-no{{color:var(--a);font-weight:700;list-style:none}}.song-card{{display:flex;justify-content:space-between;padding:1rem;background:var(--glass);border-radius:15px;text-decoration:none;color:#fff;margin-bottom:0.6rem;font-weight:600}}.song-card:hover{{background:rgba(255,255,255,0.08)}}@media(max-width:850px){{.grid-v5{{grid-template-columns:1fr}}}}</style></head><body><nav><a href="/" class="grad" style="font-weight:900;font-size:1.6rem;text-decoration:none">Harmiq<span>Pro</span></a><a href="/artistas" style="color:var(--m);text-decoration:none;font-weight:700">← VOLVER</a></nav><div class="container"><div class="hero"><div class="hero-glow"></div><img src="{artist_img}" class="artist-img" alt="{artist_name}"><div style="color:var(--p);font-weight:900;text-transform:uppercase;letter-spacing:2px;margin-bottom:0.5rem">{vocal_type}</div><h1>{artist_name}</h1><p style="color:var(--m);font-weight:600">Bio-Hacking Vocal & Análisis de Equipo</p></div><div class="grid-v5"><div class="side-left"><div class="card-v5"><h3 style="margin-bottom:1rem">🧬 Perfil Biomecánico</h3><p style="color:var(--m);font-size:1.1rem">{bio_text}</p><div class="hw-grid">{hw_html}</div></div><div class="diet-box"><h3>🥗 Guía de Nutrición Vocal</h3><div class="diet-grid"><ul class="diet-yes"><li style="color:#00FF88;font-size:0.7rem;text-transform:uppercase;margin-bottom:0.5rem">RECOMENDADO</li>{" ".join([f'<li>✅ {x}</li>' for x in DIET_YES])}</ul><ul class="diet-no"><li style="color:var(--a);font-size:0.7rem;text-transform:uppercase;margin-bottom:0.5rem">EVITAR</li>{" ".join([f'<li>❌ {x}</li>' for x in DIET_NO])}</ul></div></div></div><div class="side-right"><div class="card-v5"><h3 style="margin-bottom:1.5rem">🧪 Vocal Bio-Hacking Kit</h3>{gadgets_html}</div><div class="card-v5"><h3 style="margin-bottom:1rem">🎵 Mejores Interpretaciones</h3>{songs_html}</div></div></div><div style="text-align:center;margin-top:5rem;padding:4rem;background:var(--glass);border-radius:40px;border:1px solid var(--glass-border)"><h2>¿Quieres saber si tu voz es como la de {artist_name}?</h2><a href="https://harmiq.app#analizar" style="background:linear-gradient(135deg,var(--p),var(--a));color:#fff;text-decoration:none;padding:1.2rem 2.5rem;border-radius:100px;font-weight:900;display:inline-block;margin-top:2rem;box-shadow:0 15px 30px rgba(124,77,255,0.3)">ESCANEAR MI VOZ</a></div></div></body></html>'''
    with open(html_path, 'w', encoding='utf-8') as f: f.write(new_html)
    return True

if __name__ == "__main__":
    print(f"🚀 ACTUALIZANDO MASIVAMENTE A HARMIQ V5 (117+ ARTISTAS)...")
    updated = 0
    # Escaneamos el directorio para procesar TODO lo que exista
    for slug in os.listdir(ARTISTAS_DIR):
        html_path = os.path.join(ARTISTAS_DIR, slug, "index.html")
        if os.path.exists(html_path):
            info = VERIFIED_ARTISTS.get(slug, ("Vocalista", "Análisis vocal avanzado en desarrollo.", ["Top Hit 1", "Top Hit 2"]))
            v_type, bio, songs = info
            img_url = IMG_CACHE.get(slug.replace("-"," ").title(), f"/assets/img/{slug}.webp")
            if upgrade_html_v5(html_path, slug, v_type, bio, songs, img_url):
                print(f"✅ [{updated+1}] {slug} actualizado."); updated += 1
    print(f"\n✨ ¡HECHO! {updated} perfiles subidos a V5 con éxito.")
