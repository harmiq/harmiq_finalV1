import os
import sys

# Añadir ruta para importar VERIFIED_ARTISTS
sys.path.append(os.getcwd())
from upgrade_artist_pages_v3 import VERIFIED_ARTISTS, upgrade_html, get_itunes_image_url

ARTISTAS_DIR = r"E:\Harmiq_viaje\cloudflare\artistas"

def completar_directorios():
    print(f"Verificando {len(VERIFIED_ARTISTS)} artistas...")
    creados = 0
    actualizados = 0
    
    for slug, info in VERIFIED_ARTISTS.items():
        vocal_type, bio, songs = info
        artist_dir = os.path.join(ARTISTAS_DIR, slug)
        html_path = os.path.join(artist_dir, "index.html")
        
        if not os.path.exists(artist_dir):
            os.makedirs(artist_dir, exist_ok=True)
            # Crear un index.html básico para que upgrade_html lo reconozca
            with open(html_path, "w", encoding="utf-8") as f:
                f.write(f"<html><body><h1>{slug.replace('-', ' ').title()}</h1></body></html>")
            creados += 1
            print(f" [+] Creado directorio: {slug}")
        
        # Una vez que el archivo existe (o si ya existía), lo actualizamos con el diseño V3
        img_url = get_itunes_image_url(slug.replace("-", " ").title())
        success, msg = upgrade_html(html_path, slug, vocal_type, bio, songs, img_url)
        if success:
            actualizados += 1
            print(f"   ✓ {slug} actualizado con diseño premium.")
        else:
            print(f"   x Error actualizando {slug}: {msg}")

    print(f"\nFinalizado: {creados} carpetas creadas, {actualizados} páginas generadas.")

if __name__ == "__main__":
    completar_directorios()
