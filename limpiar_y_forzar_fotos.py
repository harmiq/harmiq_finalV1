import json, time, os, sys

# Reusar lógica de búsqueda
sys.path.append('e:/Harmiq_viaje')
from upgrade_artist_pages_v3 import get_itunes_image_url, VERIFIED_ARTISTS

CACHE_PATH = r"E:\Harmiq_viaje\itunes_img_cache.json"

VIP_PHOTOS = {
    "Lola Indigo": "https://i.scdn.co/image/ab6761610000e5eb1d248b94df9f6e9b46df5de4",
    "Madonna": "https://i.scdn.co/image/ab6761610000e5eb4f395758eb090a2cf7252f2f",
    "Ed Sheeran": "https://i.scdn.co/image/ab6761610000e5eb121f1e63717208d2ae374244",
    "Rihanna": "https://i.scdn.co/image/ab6761610000e5eb5629da76f3f01b777a83b28b",
    "Michael Jackson": "https://i.scdn.co/image/ab6761610000e5eb0933758b7538965f375ba31a",
    "Enrique Iglesias": "https://i.scdn.co/image/ab6761610000e5ebf898a3d684990cd3a936a04e",
    "Shakira": "https://i.scdn.co/image/ab6761610000e5eb662057d2a09c2a6886e08c4e",
    "Bad Bunny": "https://i.scdn.co/image/ab6761610000e5eb9bb6bca061266ec568c0919d",
    "Quevedo": "https://i.scdn.co/image/ab6761610000e5eb03af700140224b7501b33334",
    "Rosalía": "https://i.scdn.co/image/ab6761610000e5eb3dbf697486e963945ca35e0d",
    "Maluma": "https://i.scdn.co/image/ab6761610000e5eb9f270059346617ba84df3634",
    "Lady Gaga": "https://i.scdn.co/image/ab6761610000e5eb3fbb49479e00185906ef455a",
    "Mariah Carey": "https://i.scdn.co/image/ab6761610000e5eb061eb0d507c81373507c5765",
    "Justin Bieber": "https://i.scdn.co/image/ab6761610000e5eb9910901eff269e86307137f6",
    "Melanie Martinez": "https://i.scdn.co/image/ab6761610000e5eb478ce13e54737aa6e17e3352",
    "Mick Jagger": "https://i.scdn.co/image/ab6761610000e5eb629731495dec503c5ec82333",
    "Miley Cyrus": "https://i.scdn.co/image/ab6761610000e5eb5cf2468305001a1c7268808d",
    "Nina Simone": "https://i.scdn.co/image/ab6761610000e5eb6046e2794b17f51b6e4e844b",
    "Norah Jones": "https://i.scdn.co/image/ab6761610000e5eb4e0193496c5676a084c718be",
    "Olivia Rodrigo": "https://i.scdn.co/image/ab6761610000e5eba094a97491d90060d4734731",
    "Peso Pluma": "https://i.scdn.co/image/ab6761610000e5eb9687e74266858e70588665da",
    "Post Malone": "https://i.scdn.co/image/ab6761610000e5ebeb4c54cb1168ef9e1882d2eb",
    "Prince": "https://i.scdn.co/image/ab6761610000e5eb7304be36111059f33b1e32d5",
    "Raphael": "https://i.scdn.co/image/ab6761610000e5eb659972322aff4864c233c091",
    "Rels B": "https://i.scdn.co/image/ab6761610000e5eb005370ab945391c53e00fcda",
    "Sam Smith": "https://i.scdn.co/image/ab6761610000e5eb8e578c74070a2fde6d8f61e8",
    "Shawn Mendes": "https://i.scdn.co/image/ab6761610000e5eb2913e618ce525048cd7cbdee",
    "Snoop Dogg": "https://i.scdn.co/image/ab6761610000e5eb944062828b801a61c3905187",
    "Sza": "https://i.scdn.co/image/ab6761610000e5eb78bd90a4fa779435b6c20173",
    "Taylor Swift": "https://i.scdn.co/image/ab6761610000e5eb5a009695c07206fbb2328851",
    "The Weeknd": "https://i.scdn.co/image/ab6761610000e5eb20790938b8ca7067f9659b9a",
    "Tina Turner": "https://i.scdn.co/image/ab6761610000e5eb6f4c8033878b277b21239c87",
    "Tove Lo": "https://i.scdn.co/image/ab6761610000e5eb1d277a06a275466827f31cfa",
    "Travis Scott": "https://i.scdn.co/image/ab6761610000e5eb1903c404dfcf8f0d8ef6a63a",
    "Daddy Yankee": "https://i.scdn.co/image/ab6761610000e5ebcc755cb92d29485f319520ea",
    "David Bisbal": "https://i.scdn.co/image/ab6761610000e5eb592c30058b7301c18d9ef673",
    "David Bowie": "https://i.scdn.co/image/ab6761610000e5eb76db01b1b1178351586715f6",
    "Drake": "https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558179927c",
    "Elvis Presley": "https://i.scdn.co/image/ab6761610000e5eb98759714856658997a61d1e4",
    "Frank Sinatra": "https://i.scdn.co/image/ab6761610000e5ebf898a3d684990cd3a936a04e",
    "Harry Styles": "https://i.scdn.co/image/ab6761610000e5eba2503d89953258a69919f939",
    "J Balvin": "https://i.scdn.co/image/ab6761610000e5eb994191d4e0e564bd9d55aa61",
    "Julio Iglesias": "https://i.scdn.co/image/ab6761610000e5eb56e8739678e727988358f2da",
    "Karol G": "https://i.scdn.co/image/ab6761610000e5eb0010c265691079361a87e35b",
    "Katy Perry": "https://i.scdn.co/image/ab6761610000e5eb0072a392e9d2983c27db1277",
    "Kendrick Lamar": "https://i.scdn.co/image/ab6761610000e5eb43769913165a3d02446d6912",
    "Lana Del Rey": "https://i.scdn.co/image/ab6761610000e5eb3e85e98583487c6999a4e8d3",
    "Maria Callas": "https://i.scdn.co/image/ab6761610000e5eb662057d2a09c2a6886e08c4e",
    "Robert Plant": "https://i.scdn.co/image/ab6761610000e5eb914f6b0f023f03e2c310fb4e",
    "Rocio Jurado": "https://i.scdn.co/image/ab6761610000e5eb6e902b4d96ef492cc59654d3",
    "Sabrina Carpenter": "https://i.scdn.co/image/ab6761610000e5eb36d7d515a133f92bf4cc8330",
    "Sebastian Yatra": "https://i.scdn.co/image/ab6761610000e5eb743a60a778efcf813a8548c2",
    "Whitney Houston": "https://i.scdn.co/image/ab6761610000e5eb4911762e557b7fde92d84784"
}

# Mapeo de slugs conflictivos (acentos/puntos)
SPECIAL_NAMES = {
    "rosal-a": "Rosalía",
    "c-tangana": "C. Tangana",
    "dani-mart-n": "Dani Martín",
    "joaqu-n-sabina": "Joaquín Sabina",
    "pablo-albor-n": "Pablo Alborán",
    "vicente-fern-ndez": "Vicente Fernández",
    "alejandro-fernandez": "Alejandro Fernández",
}

def clean_and_force():
    if os.path.exists(CACHE_PATH):
        try:
            with open(CACHE_PATH, "r", encoding="utf-8") as f:
                cache = json.load(f)
        except:
            cache = {}
    else:
        cache = {}

    # 1. Eliminar CUALQUIER SVG o entrada corrupta
    cache = {k: v for k, v in cache.items() if v and not v.startswith("data:image/svg")}

    # 2. Inyectar VIPs
    for name, url in VIP_PHOTOS.items():
        cache[name] = url
        print(f"[VIP] Forzando foto para: {name}")

    # 3. Buscar lo que falta de VERIFIED_ARTISTS con SLEEP
    for slug, info in VERIFIED_ARTISTS.items():
        if slug in SPECIAL_NAMES:
            display_name = SPECIAL_NAMES[slug]
        else:
            display_name = slug.replace("-", " ").title()
            
        if display_name not in cache:
            print(f"[BUSQUEDA] Buscando foto para: {display_name}...")
            url = get_itunes_image_url(display_name)
            if url:
                cache[display_name] = url
                print(f"  -> Encontrada!")
            else:
                print(f"  -> No encontrada en iTunes.")
            time.sleep(0.5) 

    with open(CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(cache, f, indent=4, ensure_ascii=False)
    
    print("\n[FIN] Caché actualizada correctamente. Ejecutando generador...")

if __name__ == "__main__":
    clean_and_force()
    # Importar y ejecutar el generador de directorio
    from generate_artist_directory import generate_directory
    generate_directory()
    print("[EXITO] Directorio regenerado con fotos reales.")
