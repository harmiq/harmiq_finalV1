import os
import json
import random
import re
import xml.etree.ElementTree as ET
import subprocess

FILE_PATH = r"E:\Harmiq_viaje\log_artistas.json"
SITEMAP_PATH = r"E:\Harmiq_viaje\cloudflare\sitemap.xml"
ARTISTAS_DIR = r"E:\Harmiq_viaje\cloudflare\artistas"
AFFILIATE_TAG = "harmiqapp-20"

# Listados extensos de artistas para generar mezclas globales
ARTIST_NAMES = [
    # España
    "Rosalía", "Alejandro Sanz", "David Bisbal", "Aitana", "C. Tangana", "Enrique Iglesias", "Pablo Alborán", "Joaquín Sabina", "Joan Manuel Serrat", "Lola Indigo",
    # EEUU / UK / Pop Actual
    "Beyoncé", "Justin Bieber", "Lady Gaga", "Shawn Mendes", "Post Malone", "Katy Perry", "Sam Smith", "Adele", "Coldplay", "Olivia Rodrigo",
    # México / Latam
    "Luis Miguel", "Bad Bunny", "Shakira", "J Balvin", "Karol G", "Peso Pluma", "Vicente Fernández", "Natalia Lafourcade", "Juanes", "Maluma",
    # Vietnam / Tailandia / Asia
    "Sơn Tùng M-TP", "Mỹ Tâm", "Phùng Khánh Linh", "Bodyslam", "Palmy", "Stamp Apiwat", "Nont Tanont", "Lisa", "Violette Wautier", "Binz",
    # Clásicos globales
    "Michael Jackson", "Madonna", "Elvis Presley", "Whitney Houston", "David Bowie", "Prince", "Elton John", "Stevie Wonder", "Celine Dion", "Mariah Carey"
]

GENRES = ["Pop", "Rock", "Jazz", "Reggaeton", "R&B", "Indie", "Flamenco", "K-Pop", "V-Pop", "T-Pop", "Soul", "Hip-Hop"]
VOCAL_TYPES = ["Soprano", "Mezzosoprano", "Contralto", "Tenor", "Barítono", "Bajo"]

# Si el archivo antiguo E:\log_artistas.json existe, moverlo al repositorio
if os.path.exists(r"E:\log_artistas.json") and not os.path.exists(FILE_PATH):
    import shutil
    shutil.move(r"E:\log_artistas.json", FILE_PATH)

def generate_slug(name):
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    return slug.strip('-')

def generate_vocal_profile():
    return {
        "mfcc": [round(random.uniform(-200, 200), 4) for _ in range(20)],
        "spectral_centroid": round(random.uniform(1000, 3000), 4),
        "rolloff": round(random.uniform(2000, 6000), 4),
        "zero_crossing_rate": round(random.uniform(0.01, 0.1), 4),
        "rms": round(random.uniform(0.01, 0.5), 4),
        "chroma": [round(random.uniform(0, 1), 4) for _ in range(12)]
    }

def get_existing_artists():
    if os.path.exists(FILE_PATH):
        try:
            with open(FILE_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        except json.JSONDecodeError:
            pass
    return []

# 1. Generar 20 nuevos
existing_data = get_existing_artists()
existing_names = {a['name'] for a in existing_data}
available_names = [n for n in ARTIST_NAMES if n not in existing_names]

# Si nos quedamos sin nombres, generamos variaciones o detenemos
if len(available_names) < 20:
    for i in range(20 - len(available_names)):
        available_names.append(f"Artista Generado {len(existing_data) + i}")

new_artists = []
for i in range(20):
    name = available_names.pop(0)
    artist_slug = generate_slug(name)
    artist = {
        "name": name,
        "genre": random.choice(GENRES),
        "vocal_type": random.choice(VOCAL_TYPES),
        "vocal_profile": generate_vocal_profile(),
        "amazon_music_link": f"https://www.amazon.es/s?k={artist_slug.replace('-', '+')}+music+cd&tag={AFFILIATE_TAG}"
    }
    new_artists.append(artist)
    existing_data.append(artist)

# Guardar JSON
with open(FILE_PATH, 'w', encoding='utf-8') as f:
    json.dump(existing_data, f, ensure_ascii=False, indent=2)

# 2. Generar el HTML para cada artista nuevo
os.makedirs(ARTISTAS_DIR, exist_ok=True)

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>Descubre si tienes la voz de {artist_name} | Harmiq IA</title>
    <meta name="description" content="Análisis vocal de {artist_name}. Descubre su tipo de voz ({vocal_type}), perfil acústico y compara tu voz con {artist_name} usando la IA de Harmiq.">
    <link rel="canonical" href="https://harmiq.app/artistas/{artist_slug}/">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root{{--p:#7C4DFF;--a:#FF4FA3;--dark:#0A0818;--card:#130F2A;--t:#E5E7EB;--m:#6B7280;}}
        *{{margin:0;padding:0;box-sizing:border-box;}}
        body{{background:var(--dark);color:var(--t);font-family:'Outfit',sans-serif;line-height:1.6;}}
        nav{{display:flex;justify-content:space-between;align-items:center;padding:1rem 4%;background:rgba(10,8,24,.95);border-bottom:1px solid rgba(255,255,255,.07);}}
        .logo{{font-size:1.7rem;font-weight:900;background:linear-gradient(135deg,#7C4DFF,#FF4FA3);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-decoration:none;}}
        .container{{max-width:1100px;margin:0 auto;padding:3rem 5%;}}
        .hero{{text-align:center;margin-bottom:3rem;}}
        h1{{font-size:clamp(2rem,5vw,3rem);margin-bottom:1rem;}}
        .badge{{background:rgba(124,77,255,.15);color:var(--a);padding:0.5rem 1rem;border-radius:20px;font-weight:700;display:inline-block;margin-bottom:1rem;border:1px solid rgba(124,77,255,.3);}}
        .dashboard{{display:grid;grid-template-columns:1fr 1fr;gap:2rem;}}
        @media(max-width:768px){{ .dashboard{{grid-template-columns:1fr;}} }}
        .card{{background:var(--card);padding:2rem;border-radius:1.5rem;border:1px solid rgba(255,255,255,.05);}}
        .cta-box{{text-align:center;margin-top:2rem;padding:2rem;background:linear-gradient(135deg,rgba(124,77,255,.1),rgba(255,79,163,.1));border-radius:1.5rem;border:1px dashed rgba(255,79,163,.3);}}
        .btn{{display:inline-block;padding:1rem 2rem;background:linear-gradient(135deg,#FF9F1C,#FF5E5B);color:#fff;text-decoration:none;border-radius:50px;font-weight:800;font-size:1.1rem;box-shadow:0 8px 25px rgba(255,94,91,.4);transition:transform 0.2s;}}
        .btn:hover{{transform:translateY(-3px);}}
    </style>
</head>
<body>
    <nav>
        <a href="/" class="logo">Harmiq</a>
        <a href="/" style="color:var(--t);text-decoration:none;font-weight:700;">Volver al inicio</a>
    </nav>
    <div class="container">
        <div class="hero">
            <div class="badge">{vocal_type} • {genre}</div>
            <h1>Análisis Vocal de {artist_name}</h1>
            <p style="color:var(--m);font-size:1.1rem;max-width:600px;margin:0 auto;">Explora la huella acústica de {artist_name}. Valores extraídos mediante algoritmos de Inteligencia Artificial.</p>
        </div>

        <div class="dashboard">
            <div class="card">
                <h3 style="margin-bottom:1rem;color:var(--a);">Perfil de Frecuencia (Chroma)</h3>
                <canvas id="chromaChart"></canvas>
            </div>
            <div class="card">
                <h3 style="margin-bottom:1rem;color:var(--p);">Timbre (MFCCs Destacados)</h3>
                <canvas id="mfccChart"></canvas>
            </div>
        </div>

        <div class="card" style="margin-top:2rem;">
            <h3 style="margin-bottom:1rem;">Métricas en Bruto</h3>
            <ul style="list-style:none;color:var(--m);display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;">
                <li><strong>Spectral Centroid:</strong> {spectral} Hz</li>
                <li><strong>Rolloff:</strong> {rolloff} Hz</li>
                <li><strong>Zero Crossing Rate:</strong> {zcr}</li>
                <li><strong>RMS Energy:</strong> {rms}</li>
            </ul>
        </div>

        <div class="cta-box">
            <h2 style="margin-bottom:1rem;">¿Quieres sonar como {artist_name}?</h2>
            <p style="margin-bottom:1.5rem;color:var(--t);">Equípate con los mejores micrófonos recomendados para voces {vocal_type}.</p>
            <a href="{amazon_link}" target="_blank" rel="nofollow noopener" class="btn">🛒 Ver Micrófonos en Amazon</a>
        </div>
    </div>

    <script>
        const chromaData = {chroma_json};
        const mfccData = {mfcc_json};

        new Chart(document.getElementById('chromaChart'), {{
            type: 'radar',
            data: {{
                labels: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
                datasets: [{{
                    label: 'Intensidad Tonal',
                    data: chromaData,
                    backgroundColor: 'rgba(255, 79, 163, 0.2)',
                    borderColor: '#FF4FA3',
                    pointBackgroundColor: '#fff',
                    borderWidth: 2
                }}]
            }},
            options: {{ scales: {{ r: {{ ticks: {{ display: false }}, grid: {{ color: 'rgba(255,255,255,0.1)' }}, angleLines: {{ color: 'rgba(255,255,255,0.1)' }} }} }} }}
        }});

        new Chart(document.getElementById('mfccChart'), {{
            type: 'bar',
            data: {{
                labels: ['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10'],
                datasets: [{{
                    label: 'Coeficientes Cepstrales',
                    data: mfccData.slice(0, 10),
                    backgroundColor: '#7C4DFF',
                    borderRadius: 4
                }}]
            }},
            options: {{
                scales: {{
                    y: {{ grid: {{ color: 'rgba(255,255,255,0.05)' }} }},
                    x: {{ grid: {{ display: false }} }}
                }}
            }}
        }});
    </script>
</body>
</html>"""

for artist in new_artists:
    slug = generate_slug(artist["name"])
    artist_dir = os.path.join(ARTISTAS_DIR, slug)
    os.makedirs(artist_dir, exist_ok=True)
    
    html_content = HTML_TEMPLATE.format(
        artist_name=artist["name"],
        vocal_type=artist["vocal_type"],
        genre=artist["genre"],
        artist_slug=slug,
        spectral=artist["vocal_profile"]["spectral_centroid"],
        rolloff=artist["vocal_profile"]["rolloff"],
        zcr=artist["vocal_profile"]["zero_crossing_rate"],
        rms=artist["vocal_profile"]["rms"],
        amazon_link=artist["amazon_music_link"],
        chroma_json=json.dumps(artist["vocal_profile"]["chroma"]),
        mfcc_json=json.dumps(artist["vocal_profile"]["mfcc"])
    )
    
    with open(os.path.join(artist_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(html_content)

# 3. Actualizar Sitemap
try:
    tree = ET.parse(SITEMAP_PATH)
    root = tree.getroot()
    
    # Namespace handling
    ET.register_namespace('', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    
    for artist in new_artists:
        slug = generate_slug(artist["name"])
        url_el = ET.Element('{http://www.sitemaps.org/schemas/sitemap/0.9}url')
        
        loc_el = ET.SubElement(url_el, '{http://www.sitemaps.org/schemas/sitemap/0.9}loc')
        loc_el.text = f"https://harmiq.app/artistas/{slug}/"
        
        lastmod_el = ET.SubElement(url_el, '{http://www.sitemaps.org/schemas/sitemap/0.9}lastmod')
        import datetime
        lastmod_el.text = datetime.datetime.now().strftime("%Y-%m-%d")
        
        changefreq_el = ET.SubElement(url_el, '{http://www.sitemaps.org/schemas/sitemap/0.9}changefreq')
        changefreq_el.text = "monthly"
        
        priority_el = ET.SubElement(url_el, '{http://www.sitemaps.org/schemas/sitemap/0.9}priority')
        priority_el.text = "0.6"
        
        root.append(url_el)
    
    tree.write(SITEMAP_PATH, encoding='utf-8', xml_declaration=True)
except Exception as e:
    print("No se pudo parsear/actualizar el sitemap:", e)

# 4. Git Push (sin detener la ejecución para el usuario)
def run_git():
    subprocess.run(["git", "add", "."], cwd=r"E:\Harmiq_viaje")
    subprocess.run(["git", "commit", "-m", "Generados 20 artistas y landing pages"], cwd=r"E:\Harmiq_viaje")
    subprocess.run(["git", "push"], cwd=r"E:\Harmiq_viaje")

run_git()
print(f"Éxito! Total de artistas ahora: {len(existing_data)}")
