"""
Script de corrección masiva: Tipos vocales incorrectos en páginas de artistas.
Problema: temp_names.json clasifica MUCHOS artistas como "soprano" sin importar su género.
Un cantante masculino NO puede ser Soprano, Mezzosoprano o Contralto.

Estrategia:
- Artistas conocidos como femeninos/grupos femeninos → mantener Soprano/Mezzo/Contralto
- Artistas masculinos con "soprano" → reclasificar como Tenor
- Artistas masculinos con "mezzo" → reclasificar como Barítono  
- Grupos/bandas/DJs/orquestas → usar tipo vocal genérico según original
- Si no podemos determinar → usar Barítono (más seguro que Soprano)
"""

import os
import re
import json
import random

ARTISTAS_DIR = r"E:\Harmiq_viaje\cloudflare\artistas"
LOG_PATH = r"E:\Harmiq_viaje\log_artistas.json"

# Lista de artistas CONOCIDOS como femeninos (que SÍ pueden ser Soprano/Mezzo/Contralto)
KNOWN_FEMALE_ARTISTS = {
    "adele", "ariana-grande", "beyonc", "billie-eilish", "celine-dion", 
    "christina-perri", "dua-lipa", "ella-fitzgerald", "katy-perry", 
    "lady-gaga", "lana-del-rey", "madonna", "mariah-carey", "nina-simone",
    "norah-jones", "olivia-rodrigo", "rosal-a", "sabrina-carpenter",
    "shakira", "taylor-swift", "whitney-houston", "anne-marie", "aitana",
    "karol-g", "lola-indigo", "melanie-martinez", "zoe-wees", "zella-day",
    "tove-lo", "marina", "donna-summer", "janis-joplin", "dinah-washington",
    "lata-mangeshkar", "elba-ramalho", "maisie-peters", "gabby-barrett",
    "natalia-lafourcade", "tarja", "cristina-mel", "elaine-paige",
    "lea-michele", "bernadette-peters", "angela-lansbury", "emma-watson",
    "ailee", "sammi-cheng", "della", "seiko-matsuda", "kyoko-koizumi",
    "lisa", "newjeans", "mamamoo", "violette-wautier", "alicia-keys",
    "jovelina-perola-negra", "beth-carvalho", "elena-kamburova",
    "nelly-omar", "mercedes-simone", "tita-merello", "elba-ramalho",
    "dorothy", "bishop-briggs", "bess-atwell", "lacee", "allessa",
    "linet", "tatiana", "janelle-mon-e", "ann-bai", "seiko-oomori",
    "palmy", "hirie", "tanya-stephens", "little-dragon", "otep",
    "ingrid-olsson", "mimi-maura", "leidy-murilho", "cassandra-nestico",
    "catie-turner", "audrey-assad", "becca-folkes", "mc-tha",
    "mariana-nolasco", "tomberlin", "sunflower-bean", "zorra",
    "melody-s-echo-chamber", "rebecka-aether", "grey-skye-evans",
    "pera", "caroline-rhea", "china-anne-mcclain-disney", "stephanie-cheng",
    "malena-muyala", "imelda-miller", "tayhana", "najma-wallin",
    "misumena-sharon", "sangeetha-katti",
}

# Patrones que indican que es un grupo/banda/orquesta/DJ (no solistas individuales)
GROUP_PATTERNS = [
    r'\b(the|los|las|les|das|die|de la|el|la)\b.*\b(cast|ensemble|choir|orchestra|orquesta|quartet|trio|duo)\b',
    r'\bcast\b', r'\borchestra\b', r'\borquesta\b', r'\bchoir\b', r'\bensemble\b',
    r'\bquartet\b', r'\btrio\b',
    r';',  # Colaboraciones con punto y coma son generalmente irrelevantes para tipo vocal individual
]

# Patrones que indican DJ/Productor (no cantantes, así que genéricos)
DJ_PATTERNS = [
    r'\bdj\b', r'\bbeats?\b$', r'\bsound(s|labs)?\b', r'\bmusic\b$',
    r'\brelax\b', r'\brain\b.*\bsound', r'\basmr\b', r'\bpiano\b',
    r'\blofi\b', r'\blo-fi\b',
]

VOICE_TYPE_DESC = {
    "Soprano": "Las voces Soprano son las más altas y cristalinas. Alcanzan notas de gran altura con facilidad y suelen tener un timbre ligero y brillante.",
    "Mezzosoprano": "La voz de Mezzosoprano tiene un tono rico y versátil, dominando el registro medio con una potencia emotiva especial.",
    "Contralto": "La voz femenina más grave y escasa, con un timbre profundo, oscuro y de gran densidad sonora.",
    "Tenor": "La voz masculina más aguda natural, con gran facilidad para las notas altas y una proyección brillante.",
    "Barítono": "Voz masculina equilibrada, con calidez en los graves y potencia en el registro medio.",
    "Bajo": "La voz más profunda y densa, con una autoridad y oscuridad en su tono inconfundibles."
}

# Tipos vocales femeninos que NO deben usarse con artistas masculinos
FEMALE_VOICE_TYPES = {"Soprano", "Mezzosoprano", "Contralto"}
MALE_VOICE_TYPES = {"Tenor", "Barítono", "Bajo"}

def is_known_female(slug):
    """Comprueba si el artista es conocido como femenino."""
    return slug in KNOWN_FEMALE_ARTISTS

def is_group_or_producer(name_lower):
    """Comprueba si parece un grupo, orquesta, DJ o productor."""
    for pattern in GROUP_PATTERNS + DJ_PATTERNS:
        if re.search(pattern, name_lower, re.IGNORECASE):
            return True
    return False

def safe_vocal_type(current_vt, slug, artist_name):
    """
    Retorna un tipo vocal seguro.
    Si el artista es femenino conocido → mantiene soprano/mezzo/contralto
    Si el artista es masculino conocido con tipo femenino → cambia a equivalente masculino
    Si es grupo/DJ → usa Barítono por defecto (neutro)
    """
    if current_vt not in FEMALE_VOICE_TYPES:
        # Tenor, Barítono, Bajo son siempre seguros
        return current_vt
    
    # Es un tipo vocal femenino. ¿Es realmente una artista femenina?
    if is_known_female(slug):
        return current_vt  # OK, mantener
    
    # No es conocida como femenina → reclasificar
    if current_vt == "Soprano":
        return "Tenor"  # El equivalente masculino más alto
    elif current_vt == "Mezzosoprano":
        return "Barítono"  # Equivalente medio
    elif current_vt == "Contralto":
        return "Bajo"  # Equivalente grave
    
    return "Barítono"  # Fallback seguro

def generate_slug(name):
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    return slug.strip('-')

def fix_html_file(html_path, old_vt, new_vt, artist_name):
    """Corrige el tipo vocal en un archivo HTML existente."""
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Reemplazar en title
    content = content.replace(f"| {old_vt} |", f"| {new_vt} |")
    # Reemplazar en meta description
    content = content.replace(f", {old_vt}.", f", {new_vt}.")
    # Reemplazar en badge
    content = content.replace(f">{old_vt} •", f">{new_vt} •")
    # Reemplazar en bio text  
    content = content.replace(f"es {old_vt}.", f"es {new_vt}.")
    # Reemplazar en la descripción genérica
    old_desc = VOICE_TYPE_DESC.get(old_vt, "")
    new_desc = VOICE_TYPE_DESC.get(new_vt, "")
    if old_desc and new_desc:
        content = content.replace(old_desc, new_desc)
    # Reemplazar en botón Amazon
    content = content.replace(f"Equipamiento para {old_vt}", f"Equipamiento para {new_vt}")
    
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(content)

def detect_current_vocal_type(html_path):
    """Detecta el tipo vocal actual en un archivo HTML."""
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Buscar en el badge: >TipoVocal •
        match = re.search(r'class="badge">([\w\sÍíÓóÁáÉéÚú]+?) •', content)
        if match:
            return match.group(1).strip()
    except:
        pass
    return None

def detect_artist_name(html_path):
    """Detecta el nombre del artista desde el HTML."""
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()
        match = re.search(r'<h1>(.*?)</h1>', content)
        if match:
            return match.group(1).strip()
    except:
        pass
    return None

# ---- MAIN ----
print("=" * 70)
print("🔧 CORRECCIÓN MASIVA DE TIPOS VOCALES")
print("=" * 70)

fixed_count = 0
already_ok = 0
errors = 0
changes_log = []

# Escanear TODAS las carpetas de artistas
for slug in sorted(os.listdir(ARTISTAS_DIR)):
    artist_dir = os.path.join(ARTISTAS_DIR, slug)
    html_path = os.path.join(artist_dir, "index.html")
    
    if not os.path.isdir(artist_dir) or not os.path.exists(html_path):
        continue
    
    current_vt = detect_current_vocal_type(html_path)
    artist_name = detect_artist_name(html_path) or slug
    
    if not current_vt:
        continue
    
    safe_vt = safe_vocal_type(current_vt, slug, artist_name)
    
    if safe_vt != current_vt:
        try:
            fix_html_file(html_path, current_vt, safe_vt, artist_name)
            fixed_count += 1
            changes_log.append(f"  ✅ {artist_name}: {current_vt} → {safe_vt}")
            if fixed_count <= 30:
                print(f"  ✅ {artist_name}: {current_vt} → {safe_vt}")
        except Exception as e:
            errors += 1
            print(f"  ❌ Error en {slug}: {e}")
    else:
        already_ok += 1

if fixed_count > 30:
    print(f"  ... y {fixed_count - 30} más")

print(f"\n{'=' * 70}")
print(f"📊 RESUMEN:")
print(f"   Corregidos: {fixed_count}")
print(f"   Ya correctos: {already_ok}")
print(f"   Errores: {errors}")
print(f"{'=' * 70}")

# Guardar log de cambios
log_file = os.path.join(r"E:\Harmiq_viaje", "fix_vocal_log.txt")
with open(log_file, 'w', encoding='utf-8') as f:
    f.write(f"Corrección de tipos vocales - Total corregidos: {fixed_count}\n\n")
    for line in changes_log:
        f.write(line + "\n")

print(f"\n📋 Log guardado en: {log_file}")
