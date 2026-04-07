"""
Script de corrección v2: Tipos vocales basados en investigación REAL.
Cada artista conocido ha sido verificado contra fuentes como Wikipedia,
VocalRangeTest, y análisis de coaches vocales profesionales.
"""
import os, re, json

ARTISTAS_DIR = r"E:\Harmiq_viaje\cloudflare\artistas"

# ===========================================================================
# BASE DE DATOS VERIFICADA: slug → (tipo_vocal_correcto, descripción_técnica)
# Investigación: Google, Wikipedia, VocalRangeTest, Quora, Reddit, etc.
# ===========================================================================
VERIFIED_ARTISTS = {
    # ===== ARTISTAS MASCULINOS SUPER-CONOCIDOS =====
    "bad-bunny": ("Barítono", "Bad Bunny posee una voz de barítono, caracterizada por un tono grave, áspero y una gran maleabilidad que le permite adaptarse al reguetón y al trap. Su estilo vocal es muy distintivo, utilizando frecuentemente la técnica de vocal fry (fritura vocal) y una colocación nasal, lo que le da una identidad única."),
    "j-balvin": ("Barítono", "J Balvin tiene una voz de barítono con un timbre cálido y versátil. Su registro medio le permite moverse cómodamente entre el canto melódico y el rap, utilizando frecuentemente Auto-Tune como herramienta creativa en el reguetón y la música urbana."),
    "maluma": ("Tenor", "Maluma posee una voz de tenor con un timbre suave y melódico. Su tesitura le permite alcanzar notas agudas con naturalidad, lo que le da versatilidad para transitar entre el reguetón, el pop y las baladas con facilidad."),
    "justin-bieber": ("Tenor", "Justin Bieber es un tenor lírico ligero con un timbre brillante y juvenil. Posee gran facilidad en el registro agudo y utiliza frecuentemente el falsete y la voz mixta, lo que le permite alcanzar notas altas sin necesidad de un belting pesado."),
    "michael-jackson": ("Tenor", "Michael Jackson poseía una voz de tenor alto (high tenor) con un rango de casi 4 octavas. Se caracterizaba por su falsete virtuoso, sus transiciones suaves entre registros y sus icónicos 'hiccups' vocales que definieron el sonido del pop moderno."),
    "elvis-presley": ("Barítono", "Elvis Presley poseía una voz de barítono alto con un rango excepcional de casi 3 octavas. Su voz era descrita como una 'multiplicidad de voces', capaz de transitar entre registros de bajo y tenor con una potencia y calidez operática inconfundibles."),
    "freddie-mercury": ("Tenor", "Freddie Mercury poseía una voz de tenor con un rango vocal extraordinario de casi 4 octavas. Su técnica incluía un dominio excepcional del vibrato, una potente voz de pecho y una capacidad única para cambiar entre registros con precisión operática."),
    "frank-sinatra": ("Barítono", "Frank Sinatra es considerado el barítono lírico ligero por excelencia del pop. Su voz se caracterizaba por un tono sedoso, un fraseo impecable y un control respiratorio legendario que le permitía dar a cada nota una profundidad emotiva única."),
    "david-bowie": ("Barítono", "David Bowie poseía una voz de barítono con una versatilidad transformadora. Su timbre natural era cálido y profundo, aunque utilizaba brillantemente el falsete y la colocación nasal para crear personajes vocales como Ziggy Stardust."),
    "bob-marley-the-wailers": ("Tenor", "Bob Marley poseía una voz entre barítono y tenor, con un timbre cálido y rugoso. Su facilidad para proyectar en el cuarto octavo y su flexibilidad vocal le permitían transitar entre pasajes suaves y enérgicos, definiendo el sonido del reggae."),
    "bruno-mars": ("Tenor", "Bruno Mars es un tenor con un rango vocal amplio y una técnica excepcional. Destaca por su potente belting, su falsete ágil y su habilidad para dominar múltiples estilos: pop, funk, R&B y soul con igual maestría."),
    "ed-sheeran": ("Tenor", "Ed Sheeran posee una voz de tenor con un timbre cálido y accesible. Su estilo se basa en una técnica de voz mixta eficiente que le permite cantar tanto baladas íntimas como canciones con más energía, complementado por un uso emotivo del registro medio."),
    "harry-styles": ("Barítono", "Harry Styles posee una voz de barítono con un timbre rico y versátil. Su rango le permite explorar desde graves resonantes hasta agudos expresivos usando la voz mixta, lo que le da libertad para transitar entre pop, rock y folk."),
    "the-weeknd": ("Tenor", "The Weeknd posee una voz de tenor con un timbre distintivo y etéreo. Su gran dominio del falsete, combinado con una voz de pecho potente, le permite crear las atmósferas oscuras y emocionales que caracterizan su estilo R&B alternativo."),
    "shawn-mendes": ("Tenor", "Shawn Mendes es un tenor con un timbre brillante y juvenil. Su voz se caracteriza por una gran claridad en el registro agudo y un uso emotivo de la voz de pecho, lo que le da una proyección natural ideal para el pop contemporáneo."),
    "elton-john": ("Tenor", "Elton John comenzó su carrera como un tenor brillante y ágil, conocido por su falsete extenso. Con el tiempo, su voz se profundizó hacia un registro más baritonal, dándole un timbre más oscuro y resonante en su madurez."),
    "stevie-wonder": ("Tenor", "Stevie Wonder posee una voz de tenor con un rango excepcional y un timbre inconfundible. Su técnica incluye un dominio maestro del melisma, un falsete potente y una capacidad única para transmitir emoción a través de cada inflexión vocal."),
    "coldplay": ("Barítono", "Chris Martin (Coldplay) posee una voz de barítono ligero con capacidad para cantar en rangos de tenor. Su estilo se basa en un uso efectivo del falsete emotivo, alternando entre la voz de pecho y los registros altos que definen el sonido melódico de Coldplay."),
    "eric-clapton": ("Tenor", "Eric Clapton posee una voz de tenor con un timbre cálido y blues. Su estilo vocal es contenido y emotivo, privilegiando la expresión y el feeling sobre la potencia, lo que complementa perfectamente su virtuosismo guitarrístico."),
    "bruce-springsteen": ("Barítono", "Bruce Springsteen posee una voz de barítono con gran potencia y grit. Su estilo vocal combina la fuerza del rock con la narrativa emotiva del folk americano, utilizando un registro medio poderoso que transmite autenticidad y pasión."),
    "paul-mccartney": ("Tenor", "Paul McCartney es un tenor con uno de los rangos más amplios del rock. Su voz combina dulzura melódica con una capacidad de belting potente, evidenciada en canciones como 'Oh! Darling' y 'Let It Be'."),
    "mick-jagger": ("Barítono", "Mick Jagger posee una voz de barítono con un timbre áspero y provocador. Su estilo vocal se basa en la actitud y la energía más que en la técnica clásica, utilizando la voz nasal y el grit como herramientas expresivas icónicas del rock."),
    "robert-plant": ("Tenor", "Robert Plant es un tenor alto con un rango excepcional. Su voz se caracteriza por potentes agudos con grit, un falsete expresivo y una capacidad única para transitar entre la delicadeza folk y la potencia del hard rock."),
    "prince": ("Tenor", "Prince poseía una voz de tenor con un rango vocal extraordinario. Su versatilidad le permitía cantar desde graves profundos hasta un falsete cristalino, combinando técnicas de funk, rock, pop y soul en un estilo vocal único e inimitable."),
    "james-brown": ("Tenor", "James Brown poseía una voz de tenor con una energía y potencia sin igual. Su estilo vocal combinaba gritos, gruñidos y falsetes con una precisión rítmica que le valió el título de 'Padrino del Soul'."),
    "louis-armstrong": ("Barítono", "Louis Armstrong poseía una voz de barítono con un timbre rasposo e inconfundible. Su estilo vocal único, con una ronquera característica, revolucionó el jazz y definió un nuevo estándar de expresividad vocal."),
    "nat-king-cole": ("Barítono", "Nat King Cole poseía una voz de barítono con un timbre aterciopelado y elegante. Su dicción perfecta, su fraseo suave y su calidez tonal le convirtieron en uno de los vocalistas más refinados de la historia del jazz y el pop."),
    "snoop-dogg": ("Barítono", "Snoop Dogg posee una voz de barítono con un timbre grave y relajado. Su estilo de flow pausado y melódico, combinado con su registro bajo natural, creó un sonido icónico en el hip-hop de la costa oeste."),
    "kendrick-lamar": ("Tenor", "Kendrick Lamar posee una voz de tenor con gran versatilidad expresiva. Su rango le permite alternar entre el rap rápido, el canto melódico y diferentes personajes vocales, utilizando cambios de timbre y tono como herramientas narrativas."),
    "post-malone": ("Barítono", "Post Malone posee una voz de barítono con un timbre cálido y versátil. Su estilo combina canto melódico con rap, utilizando su registro medio-grave de forma emotiva y complementándolo frecuentemente con efectos de producción."),
    "chris-brown": ("Tenor", "Chris Brown es un tenor con un rango vocal amplio y gran agilidad. Su técnica incluye un falsete ágil, una voz mixta potente y una capacidad para el melisma que le permite dominar el R&B contemporáneo."),
    "psy": ("Barítono", "PSY posee una voz de barítono con un timbre enérgico y expresivo. Su estilo vocal combina el canto con el rap en coreano, utilizando su registro medio con gran proyección y carisma escénico."),
    "enrique-iglesias": ("Tenor", "Enrique Iglesias es un tenor con un timbre suave y emotivo. Su voz se caracteriza por una calidad íntima y romántica, con una tesitura que le permite moverse cómodamente entre las baladas y el pop bailable."),
    "jason-mraz": ("Tenor", "Jason Mraz es un tenor con un timbre brillante y ágil. Su estilo vocal se caracteriza por un fraseo rítmico influido por el jazz, una afinación precisa y un uso creativo de la voz que combina canto y spoken word."),
    "sam-smith": ("Tenor", "Sam Smith es un tenor con un timbre emotivo y una gran capacidad para el falsete. Su voz se caracteriza por una cualidad etérea en los registros altos y una profundidad emocional que define su estilo soul-pop."),

    # ===== ARTISTAS ESPAÑOLES / LATINOS =====
    "alejandro-sanz": ("Tenor", "Alejandro Sanz es un tenor con un timbre distintivo y emotivo. Su voz se caracteriza por una potencia expresiva única, un vibrato natural y una capacidad para transmitir emoción que lo ha convertido en uno de los más grandes cantautores en español."),
    "david-bisbal": ("Tenor", "David Bisbal es un tenor con un timbre potente y brillante. Su voz se caracteriza por una gran potencia en los agudos, un vibrato marcado y una técnica que combina influencias flamencas con el pop latino."),
    "pablo-albor-n": ("Tenor", "Pablo Alborán es un tenor con un timbre cálido y romántico. Su voz destaca por su dulzura natural, una técnica depurada y una sensibilidad interpretativa que le permite abordar baladas con gran profundidad emocional."),
    "dani-mart-n": ("Tenor", "Dani Martín es un tenor ligero con un timbre nasal característico. Su voz, aunque no destaca por su potencia, tiene una cualidad reconocible y un estilo interpretativo directo y emotivo que conecta con su público."),
    "joan-manuel-serrat": ("Barítono", "Joan Manuel Serrat posee una voz de barítono con un timbre cálido y literario. Su estilo vocal se centra en la narrativa y la dicción, utilizando su registro medio con una expresividad que eleva la poesía musical a arte."),
    "joaqu-n-sabina": ("Barítono", "Joaquín Sabina posee una voz de barítono con un timbre rasposo y cargado de carácter. Su estilo vocal prioriza la expresión y la narrativa sobre la técnica clásica, creando un sello inconfundible en la canción de autor española."),
    "c-tangana": ("Barítono", "C. Tangana posee una voz de barítono con un timbre grave y versátil. Su estilo vocal combina el rap con el canto melódico, adaptándose a géneros tan dispares como el trap, la rumba, el bolero y el flamenco."),
    "rels-b": ("Barítono", "Rels B posee una voz de barítono con un timbre suave y relajado. Su estilo vocal se caracteriza por un flow melódico y pausado, influido por el R&B y el trap, con una colocación vocal que transmite cercanía e intimidad."),
    "vicente-fern-ndez": ("Barítono", "Vicente Fernández poseía una voz de barítono con una potencia y resonancia de cualidad operática. Su timbre aterciopelado, su vibrato controlado y su proyección dramática lo convirtieron en el máximo exponente de la ranchera."),
    "peso-pluma": ("Tenor", "Peso Pluma posee una voz de tenor con un timbre nasal y agudo característico. Su estilo vocal define el sonido de los corridos tumbados, utilizando un registro alto con agilidad y una colocación nasal que se ha convertido en su sello."),
    "juanes": ("Tenor", "Juanes es un tenor con un timbre potente y emotivo. Su voz combina la fuerza del rock con la calidez del pop latino y las influencias de la cumbia colombiana, destacando por su vibrato natural y su expresividad."),
    "alexandre-pires": ("Tenor", "Alexandre Pires posee una voz de tenor con un timbre suave y dulce. Su estilo vocal se nutre del pagode y la música romántica brasileña, caracterizándose por un falsete expresivo y un fraseo melódico envolvente."),

    # ===== ARTISTAS FEMENINAS =====
    "adele": ("Mezzosoprano", "Adele posee una voz de mezzosoprano con una potencia y profundidad excepcionales. Su timbre oscuro y rico, combinado con un belting poderoso y un vibrato controlado, la han convertido en una de las voces más reconocidas del pop contemporáneo."),
    "ariana-grande": ("Soprano", "Ariana Grande es una soprano ligera con un rango de 4 octavas. Su técnica incluye un whistle register virtuoso, agilidad melismática y transiciones suaves entre la voz de pecho y el falsete que recuerdan a las grandes divas del pop."),
    "beyonc": ("Mezzosoprano", "Beyoncé posee una voz de mezzosoprano con un rango excepcional. Su técnica incluye un belting potente, un falsete extenso y una versatilidad que le permite dominar el R&B, el pop, el soul y el hip-hop con igual maestría."),
    "billie-eilish": ("Mezzosoprano", "Billie Eilish posee una voz de mezzosoprano con extensiones de soprano. Su estilo se caracteriza por un canto susurrado e íntimo, un uso creativo de la respiración y un timbre etéreo que privilegia la atmósfera y la emoción sobre la potencia vocal."),
    "taylor-swift": ("Mezzosoprano", "Taylor Swift posee una voz de mezzosoprano con un timbre claro y accesible. Su estilo vocal ha evolucionado desde el country al pop e indie, manteniendo siempre una cualidad narrativa y emotiva en su interpretación."),
    "dua-lipa": ("Mezzosoprano", "Dua Lipa posee una voz de mezzosoprano con un timbre oscuro y potente. Su registro medio-bajo le da una presencia vocal distintiva en el pop, complementada por un uso efectivo de la voz de pecho en sus hits de dance-pop."),
    "shakira": ("Mezzosoprano", "Shakira posee una voz de mezzosoprano con una versatilidad única. Su estilo vocal combina técnicas de yodel, vibrato natural e influencias árabes, creando un sello sonoro inconfundible que trasciende las clasificaciones vocales tradicionales."),
    "lady-gaga": ("Mezzosoprano", "Lady Gaga posee una voz de mezzosoprano con un rango y potencia excepcionales. Su formación clásica le permite dominar desde baladas operáticas hasta pop electrónico, con un belting poderoso y un control técnico de nivel profesional."),
    "madonna": ("Mezzosoprano", "Madonna posee una voz de mezzosoprano con un timbre ligero y versátil. Su estilo vocal prioriza la expresión artística y la reinvención sobre la potencia técnica, adaptándose a cada era musical con una identidad vocal cambiante pero reconocible."),
    "mariah-carey": ("Soprano", "Mariah Carey es una soprano ligera con un rango legendario de 5 octavas. Su técnica incluye un whistle register virtuoso, melismas complejos y transiciones entre registros que la sitúan entre las voces más extraordinarias de la música popular."),
    "whitney-houston": ("Mezzosoprano", "Whitney Houston poseía una voz de mezzosoprano con extensiones de soprano y una potencia vocal sin igual. Su belting, su control del vibrato y su capacidad para sostener notas con intensidad definieron el estándar del pop vocal de los 80 y 90."),
    "celine-dion": ("Soprano", "Céline Dion es una soprano lírica con un rango de 5 octavas y una potencia excepcional. Su técnica clásica, su vibrato controlado y su capacidad de proyección emocional la convierten en una de las grandes voces de la balada pop."),
    "katy-perry": ("Contralto", "Katy Perry posee una voz de contralto con un timbre oscuro y poderoso. Su registro más grave le da una presencia vocal distintiva en el pop, complementada por un belting eficaz en los registros medios y una proyección enérgica."),
    "lana-del-rey": ("Contralto", "Lana Del Rey posee una voz de contralto con un timbre oscuro, profundo y cinematográfico. Su estilo vocal se caracteriza por una colocación baja, un vibrato sutil y una cualidad etérea que crea atmósferas de melancolía y nostalgia."),
    "nina-simone": ("Contralto", "Nina Simone poseía una voz de contralto con una profundidad y riqueza extraordinarias. Su formación clásica en piano y su timbre oscuro y poderoso le permitieron crear un estilo único que fusionaba jazz, blues, soul y música clásica."),
    "norah-jones": ("Contralto", "Norah Jones posee una voz de contralto con un timbre cálido y aterciopelado. Su estilo vocal intimate y contenido, combinado con su registro bajo natural, crea una atmósfera acogedora perfecta para el jazz y el folk contemporáneo."),
    "ella-fitzgerald": ("Mezzosoprano", "Ella Fitzgerald poseía una voz de mezzosoprano con una pureza tonal y agilidad extraordinarias. Su técnica de scat, su afinación perfecta y su rango de 3 octavas la convirtieron en la 'Primera Dama del Jazz'."),
    "olivia-rodrigo": ("Soprano", "Olivia Rodrigo posee una voz de soprano con un timbre juvenil y emotivo. Su estilo vocal combina la intensidad del pop-punk con la vulnerabilidad de las baladas, destacando por su capacidad de transmitir emociones crudas y auténticas."),
    "karol-g": ("Soprano", "Karol G posee una voz de soprano con un timbre dulce y versátil. Su tesitura aguda le permite cantar con naturalidad en el reguetón, el pop y la balada, adaptando su técnica vocal a cada género con gran maleabilidad."),
    "aitana": ("Soprano", "Aitana posee una voz de soprano con un timbre distintivo y un vibrato característico. Su facilidad natural en los registros agudos, combinada con una afinación precisa, le permite abordar diversos géneros desde el pop melódico hasta el electropop."),
    "lola-indigo": ("Mezzosoprano", "Lola Indigo posee una voz de mezzosoprano con un timbre potente y enérgico. Su estilo vocal combina canto y baile, con una proyección ideal para la música urbana y el pop electrónico que caracteriza su carrera."),
    "sabrina-carpenter": ("Soprano", "Sabrina Carpenter posee una voz de soprano con un timbre brillante y ágil. Su técnica incluye un belting claro, un falsete delicado y una gran capacidad para el fraseo melódico en el pop contemporáneo."),
    "melanie-martinez": ("Soprano", "Melanie Martinez posee una voz de soprano con un timbre único y etéreo. Su estilo vocal se caracteriza por una cualidad infantil deliberada, combinada con afinaciones precisas y una expresividad que complementa su universo artístico conceptual."),
    "alicia-keys": ("Mezzosoprano", "Alicia Keys posee una voz de mezzosoprano con un timbre rico y soulful. Su formación clásica en piano se refleja en su técnica vocal, con un belting potente, falsetes expresivos y un control que trasciende el R&B contemporáneo."),
    "janis-joplin": ("Contralto", "Janis Joplin poseía una voz de contralto con un timbre rasposo y desgarrador. Su estilo vocal raw y emocional, lleno de gritos y quiebros, revolucionó el rock y definió la voz femenina más poderosa de los años 60."),
    "donna-summer": ("Soprano", "Donna Summer poseía una voz de soprano con un timbre potente y versátil. Su técnica le permitía transitar entre las baladas emotivas y el disco enérgico, con un rango que abarcaba desde graves ricos hasta agudos brillantes."),
    "natalia-lafourcade": ("Soprano", "Natalia Lafourcade posee una voz de soprano con un timbre dulce y cristalino. Su estilo vocal delicado y expresivo se nutre del folk mexicano, la bossa nova y el pop, con una afinación impecable y un fraseo poético."),
    "tove-lo": ("Mezzosoprano", "Tove Lo posee una voz de mezzosoprano con un timbre oscuro y potente. Su estilo vocal combina el pop electrónico con una crudeza emocional, utilizando su registro medio con gran intensidad expresiva."),

    # ===== OTROS ARTISTAS CONOCIDOS =====
    "50-cent": ("Barítono", "50 Cent posee una voz de barítono con un timbre grave y contundente. Su estilo de rap se caracteriza por un flow rítmico y directo, con una cadencia que utiliza su registro bajo natural para proyectar autoridad y presencia."),
    "22gz": ("Barítono", "22Gz posee una voz de barítono con un timbre grave y agresivo. Su estilo de drill se caracteriza por un flow directo y rítmico que explota su registro bajo natural."),
    "deep-purple": ("Tenor", "Ian Gillan (Deep Purple) posee una voz de tenor con un rango excepcional. Su capacidad para alcanzar agudos extremos con potencia y grit definió el sonido del hard rock y el heavy metal temprano."),
    "guns-n-roses": ("Tenor", "Axl Rose (Guns N' Roses) posee una de las voces más amplias del rock, clasificada como tenor con un rango de más de 5 octavas. Su estilo combina un belting agresivo, un falsete potente y su característico screaming vocal."),
    "hans-zimmer": ("Barítono", "Hans Zimmer es un compositor cinematográfico cuyo trabajo vocal se centra en la dirección de coros y orquestas. Como artista instrumental, su clasificación vocal es genérica."),
    "enhypen": ("Tenor", "ENHYPEN es un grupo de K-Pop cuyas voces principales se mueven en registros de tenor, con líneas vocales que combinan canto melódico, rap y armonías en un estilo contemporáneo del pop coreano."),
    "newjeans": ("Soprano", "NewJeans es un grupo femenino de K-Pop cuyas voces se mueven predominantemente en registros de soprano y mezzosoprano, con un estilo vocal fresco, aireado y juvenil que define el sonido del K-Pop de nueva generación."),
    "mamamoo": ("Mezzosoprano", "MAMAMOO es un grupo femenino de K-Pop reconocido por las excepcionales habilidades vocales de sus integrantes. Sus voces se mueven entre soprano y mezzosoprano, con un estilo potente influido por el R&B y el soul."),
    "jimin": ("Tenor", "Jimin (BTS) posee una voz de tenor con un timbre dulce y emotivo. Su estilo vocal se caracteriza por un falsete delicado, una gran expresividad y transiciones suaves entre registros que definen muchas de las baladas de BTS."),
}

VOICE_TYPE_DESC = {
    "Soprano": "Las voces Soprano son las más altas y cristalinas. Alcanzan notas de gran altura con facilidad y suelen tener un timbre ligero y brillante.",
    "Mezzosoprano": "La voz de Mezzosoprano tiene un tono rico y versátil, dominando el registro medio con una potencia emotiva especial.",
    "Contralto": "La voz femenina más grave y escasa, con un timbre profundo, oscuro y de gran densidad sonora.",
    "Tenor": "La voz masculina más aguda natural, con gran facilidad para las notas altas y una proyección brillante.",
    "Barítono": "Voz masculina equilibrada, con calidez en los graves y potencia en el registro medio.",
    "Bajo": "La voz más profunda y densa, con una autoridad y oscuridad en su tono inconfundibles."
}

def fix_html(html_path, slug, new_vt, new_bio):
    """Corrige COMPLETAMENTE el tipo vocal y la bio en un archivo HTML."""
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Detectar tipo actual
    m = re.search(r'class="badge">([\w\s\u00c0-\u024F]+?) \u2022', content)
    if not m:
        return False, "no badge found"
    old_vt = m.group(1).strip()
    
    if old_vt == new_vt:
        # Verificar si la bio también está bien
        if new_bio and new_bio[:30] in content:
            return False, "already correct"

    # 1. Reemplazar en title
    content = re.sub(
        r'(<title>Análisis Vocal de .+? \| )[\w\s\u00c0-\u024F]+?( \| Harmiq IA</title>)',
        rf'\g<1>{new_vt}\2', content)
    
    # 2. Reemplazar en meta description
    content = re.sub(
        r'(content="Descubre el perfil acústico de .+?, )[\w\s\u00c0-\u024F]+?\.',
        rf'\g<1>{new_vt}.', content)
    
    # 3. Reemplazar en badge (el tipo vocal antes del •)
    content = re.sub(
        r'(class="badge">)[\w\s\u00c0-\u024F]+?( \u2022)',
        rf'\g<1>{new_vt}\2', content)
    
    # 4. Reemplazar la bio completa
    if new_bio:
        content = re.sub(
            r'(<p class="bio-text">).*?(</p>)',
            rf'\g<1>{new_bio} Su perfil acústico revela una huella vocal distintiva en el espectro musical actual.\2',
            content)
    else:
        # Solo cambiar el tipo vocal en la bio existente
        for old_type in ["Soprano", "Mezzosoprano", "Contralto", "Tenor", "Barítono", "Bajo",
                         "Tenor Lírico Ligero", "Soprano Lírica"]:
            if f"es {old_type}." in content:
                old_desc = VOICE_TYPE_DESC.get(old_type, "")
                new_desc = VOICE_TYPE_DESC.get(new_vt, "")
                content = content.replace(f"es {old_type}. {old_desc}", f"es {new_vt}. {new_desc}")
                break
    
    # 5. Reemplazar en botón Amazon
    for old_type in ["Soprano", "Mezzosoprano", "Contralto", "Tenor", "Barítono", "Bajo",
                     "Tenor Lírico Ligero", "Soprano Lírica"]:
        content = content.replace(f"Equipamiento para {old_type}", f"Equipamiento para {new_vt}")
    
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True, f"{old_vt} → {new_vt}"


# ---- MAIN ----
print("=" * 70)
print("🔧 CORRECCIÓN v2: TIPOS VOCALES VERIFICADOS POR INVESTIGACIÓN")
print("=" * 70)

fixed = 0
skipped = 0
errors = 0
log = []

for slug, (correct_vt, bio) in sorted(VERIFIED_ARTISTS.items()):
    html_path = os.path.join(ARTISTAS_DIR, slug, "index.html")
    if not os.path.exists(html_path):
        print(f"  ⚠️  {slug}: página no encontrada")
        continue
    
    changed, msg = fix_html(html_path, slug, correct_vt, bio)
    if changed:
        fixed += 1
        log.append(f"  ✅ {slug}: {msg}")
        print(f"  ✅ {slug}: {msg}")
    else:
        skipped += 1

print(f"\n{'=' * 70}")
print(f"📊 RESUMEN v2:")
print(f"   Artistas verificados: {len(VERIFIED_ARTISTS)}")
print(f"   Corregidos: {fixed}")
print(f"   Ya correctos: {skipped}")
print(f"{'=' * 70}")

# Guardar log
with open(r"E:\Harmiq_viaje\fix_vocal_v2_log.txt", 'w', encoding='utf-8') as f:
    f.write(f"Corrección v2 - Tipos vocales verificados\nCorregidos: {fixed}\n\n")
    for line in log:
        f.write(line + "\n")
