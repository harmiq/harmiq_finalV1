"""
fix_vocalista_pages.py
Corrige las páginas de artistas que tienen tipo vocal "Vocalista" (placeholder).

Estrategia:
1. Busca el artista en harmiq_db_completa.json
2. Normaliza el voice_type del DB al español
3. Aplica corrección de género (artistas masculinos no pueden ser Soprano/Mezzo/Contralto)
4. Actualiza: tipo vocal, bio genérica, hardware recomendado
"""

import os, re, json

ARTISTAS_DIR = r"E:\harmiq-app-final\cloudflare\artistas"
DB_PATH = r"E:\harmiq-app-final\harmiq_db_completa.json"

# ── Carga DB ─────────────────────────────────────────────────────────────────
with open(DB_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

def db_id_to_slug(db_id):
    s = db_id.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')

db_by_slug = {}
for singer in data.get('singers', []):
    slug_key = db_id_to_slug(singer['id'])
    if slug_key not in db_by_slug:
        db_by_slug[slug_key] = singer

# ── Mapeo de valores DB → español ────────────────────────────────────────────
VT_NORM = {
    'soprano':       'Soprano',
    'mezzo-soprano': 'Mezzosoprano',
    'contralto':     'Contralto',
    'tenor':         'Tenor',
    'baritone':      'Barítono',
    'bass-baritone': 'Barítono',
    'bass':          'Bajo',
    'countertenor':  'Tenor',
}

FEMALE_VT   = {"Soprano", "Mezzosoprano", "Contralto"}
MALE_EQUIV  = {"Soprano": "Tenor", "Mezzosoprano": "Barítono", "Contralto": "Bajo"}

# Lista de artistas conocidos como femeninos (no aplicar corrección masculina)
KNOWN_FEMALE = {
    "adele", "ariana-grande", "beyonc", "billie-eilish", "celine-dion",
    "dua-lipa", "ella-fitzgerald", "katy-perry", "lady-gaga", "lana-del-rey",
    "madonna", "mariah-carey", "nina-simone", "norah-jones", "olivia-rodrigo",
    "rosal-a", "sabrina-carpenter", "shakira", "taylor-swift", "whitney-houston",
    "anne-marie", "aitana", "karol-g", "lola-indigo", "melanie-martinez",
    "donna-summer", "janis-joplin", "alicia-keys", "tove-lo", "amy-winehouse",
    "cher", "miley-cyrus", "natalia-lafourcade", "tarja", "lisa", "newjeans",
    "mamamoo", "seiko-matsuda", "violette-wautier", "palmy", "hirie",
    "tanya-stephens", "little-dragon", "otep", "janelle-mon-e", "zorra",
    "jovelina-perola-negra", "beth-carvalho", "elba-ramalho", "nelly-omar",
    "mercedes-simone", "tita-merello", "cristina-mel", "elaine-paige",
    "lea-michele", "bernadette-peters", "angela-lansbury", "ailee",
    "sammi-cheng", "mc-tha", "mariana-nolasco",
}

# ── Hardware por tipo vocal ───────────────────────────────────────────────────
VOCAL_HARDWARE = {
    "Tenor":       ("Neumann U87 Ai",     "LEWITT LCT 440 PURE"),
    "Barítono":    ("Shure SM7B",          "Warm Audio WA-87 R2"),
    "Bajo":        ("Electro-Voice RE20",  "Rode NT2-A"),
    "Soprano":     ("AKG C414 XLII",       "Neumann TLM 103"),
    "Mezzosoprano":("Neumann TLM 102",     "Aston Microphones Origin"),
    "Contralto":   ("Shure KSM32",         "Warm Audio WA-47jr"),
}

# Hardware por defecto que usa "Vocalista" (Tenor defaults del upgrade_v4)
DEFAULT_HW = VOCAL_HARDWARE["Tenor"]

# ── Bio genérica por tipo vocal ───────────────────────────────────────────────
GENERIC_BIO = {
    "Tenor":
        "{name} posee una voz de tenor, con proyección brillante y facilidad natural "
        "en los registros agudos que definen su estilo musical.",
    "Barítono":
        "{name} posee una voz de barítono, con un timbre cálido y equilibrado que le "
        "aporta presencia y expresividad a sus interpretaciones.",
    "Bajo":
        "{name} posee una voz de bajo, con un timbre profundo y oscuro que transmite "
        "autoridad e intensidad vocal.",
    "Soprano":
        "{name} posee una voz de soprano, con un timbre cristalino y una capacidad "
        "natural para alcanzar los registros más agudos con facilidad.",
    "Mezzosoprano":
        "{name} posee una voz de mezzosoprano, con un timbre rico y versátil que "
        "domina el registro medio con potencia y emotividad.",
    "Contralto":
        "{name} posee una voz de contralto, el registro femenino más grave, con un "
        "timbre profundo, oscuro y de gran densidad sonora.",
}

# ── Función de corrección ─────────────────────────────────────────────────────
def fix_page(html_path, new_vt, artist_name):
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Solo procesamos páginas Vocalista
    if '>Vocalista</div>' not in content:
        return False

    # 1. Reemplazar tipo vocal en el hero
    content = content.replace('>Vocalista</div>', f'>{new_vt}</div>', 1)

    # 2. Reemplazar bio placeholder
    bio = GENERIC_BIO[new_vt].format(name=artist_name)
    content = content.replace(
        'Análisis vocal avanzado en desarrollo.',
        bio
    )

    # 3. Actualizar hardware (Tenor default → correcto para el tipo vocal)
    new_hw = VOCAL_HARDWARE[new_vt]
    if DEFAULT_HW[0] in content:
        content = content.replace(DEFAULT_HW[0], new_hw[0], 1)
    if DEFAULT_HW[1] in content:
        content = content.replace(DEFAULT_HW[1], new_hw[1], 1)

    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(content)
    return True


# ── Main ──────────────────────────────────────────────────────────────────────
print("=" * 65)
print("🔧  CORRECCIÓN MASIVA: VOCALISTA → TIPO VOCAL REAL")
print("=" * 65)

fixed = 0
skipped_ok = 0
not_found = 0
errors = 0

for slug in sorted(os.listdir(ARTISTAS_DIR)):
    html_path = os.path.join(ARTISTAS_DIR, slug, 'index.html')
    if not os.path.isfile(html_path):
        continue

    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if '>Vocalista</div>' not in content:
        skipped_ok += 1
        continue

    # Nombre del artista desde el HTML
    m = re.search(r'<h1>(.*?)</h1>', content)
    artist_name = m.group(1).strip() if m else slug.replace('-', ' ').title()

    # Buscar en DB
    singer = db_by_slug.get(slug)
    if not singer:
        not_found += 1
        continue

    raw_vt = singer.get('voice_type', '').lower().strip()
    vt = VT_NORM.get(raw_vt)
    if not vt:
        not_found += 1
        continue

    # Corrección de género: artista masculino con tipo femenino → equivalente masculino
    if vt in FEMALE_VT and slug not in KNOWN_FEMALE:
        vt = MALE_EQUIV[vt]

    try:
        if fix_page(html_path, vt, artist_name):
            fixed += 1
        else:
            skipped_ok += 1
    except Exception as e:
        errors += 1
        print(f"  ❌ Error en {slug}: {e}")

print(f"\n{'=' * 65}")
print(f"📊  RESUMEN:")
print(f"   ✅ Corregidos:         {fixed}")
print(f"   ⏭️  Ya correctos:       {skipped_ok}")
print(f"   ❓ Sin datos en DB:    {not_found}")
print(f"   ❌ Errores:            {errors}")
print(f"   📁 Total procesados:  {fixed + skipped_ok + not_found + errors}")
print(f"{'=' * 65}")
