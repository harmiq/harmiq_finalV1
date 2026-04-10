import json
import os
import random

# Definir la ruta del archivo temporal
FILE_PATH = r"E:\log_artistas.json"

affiliate_tag = "harmiqapp-20"

artistas = [
    # Pop Actual
    {"name": "Dua Lipa", "genre": "Pop", "vocal_type": "Mezzosoprano"},
    {"name": "The Weeknd", "genre": "Pop", "vocal_type": "Tenor"},
    {"name": "Taylor Swift", "genre": "Pop", "vocal_type": "Mezzosoprano"},
    {"name": "Bruno Mars", "genre": "Pop", "vocal_type": "Tenor"},
    {"name": "Billie Eilish", "genre": "Pop", "vocal_type": "Soprano"},
    {"name": "Harry Styles", "genre": "Pop", "vocal_type": "Barítono"},
    {"name": "Ed Sheeran", "genre": "Pop", "vocal_type": "Tenor"},
    {"name": "Ariana Grande", "genre": "Pop", "vocal_type": "Soprano"},
    
    # Rock Clásico
    {"name": "Freddie Mercury", "genre": "Rock", "vocal_type": "Tenor"},
    {"name": "Robert Plant", "genre": "Rock", "vocal_type": "Tenor"},
    {"name": "Steven Tyler", "genre": "Rock", "vocal_type": "Tenor"},
    {"name": "Janis Joplin", "genre": "Rock", "vocal_type": "Mezzosoprano"},
    {"name": "Paul McCartney", "genre": "Rock", "vocal_type": "Tenor"},
    {"name": "Bruce Springsteen", "genre": "Rock", "vocal_type": "Tenor"},
    {"name": "Mick Jagger", "genre": "Rock", "vocal_type": "Barítono"},
    
    # Jazz
    {"name": "Frank Sinatra", "genre": "Jazz", "vocal_type": "Bajo"},
    {"name": "Ella Fitzgerald", "genre": "Jazz", "vocal_type": "Mezzosoprano"},
    {"name": "Louis Armstrong", "genre": "Jazz", "vocal_type": "Barítono"},
    {"name": "Nina Simone", "genre": "Jazz", "vocal_type": "Contralto"},
    {"name": "Nat King Cole", "genre": "Jazz", "vocal_type": "Barítono"},
]

def generate_vocal_profile():
    return {
        "mfcc": [round(random.uniform(-200, 200), 4) for _ in range(20)],
        "spectral_centroid": round(random.uniform(1000, 3000), 4),
        "rolloff": round(random.uniform(2000, 6000), 4),
        "zero_crossing_rate": round(random.uniform(0.01, 0.1), 4),
        "rms": round(random.uniform(0.01, 0.5), 4),
        "chroma": [round(random.uniform(0, 1), 4) for _ in range(12)]
    }

# Leer archivo si existe
existing_data = []
if os.path.exists(FILE_PATH):
    try:
        with open(FILE_PATH, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
    except json.JSONDecodeError:
        existing_data = []

# Añadir los nuevos
for artist in artistas:
    artist_slug = artist['name'].lower().replace(' ', '+')
    artist["vocal_profile"] = generate_vocal_profile()
    artist["amazon_music_link"] = f"https://www.amazon.es/s?k={artist_slug}+music+cd&tag={affiliate_tag}"
    existing_data.append(artist)

# Guardar
with open(FILE_PATH, 'w', encoding='utf-8') as f:
    json.dump(existing_data, f, ensure_ascii=False, indent=2)

print(f"Total artistas en el archivo: {len(existing_data)}")
