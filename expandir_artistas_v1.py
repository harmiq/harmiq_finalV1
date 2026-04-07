"""
EXPANDIR ARTISTAS v1
Añade artistas relevantes que faltan en harmiq_db_vectores.json.
Usa el mismo algoritmo de vectores que fusionar_todo.py.
Salida: harmiq_nuevos_v1.json → se fusiona con el DB principal.
"""

import json, os
import numpy as np

# ─── Mismo algoritmo que fusionar_todo.py ────────────────────────────────────
NORM_RANGES = {
    "pitch_mean":        (65.0,  520.0),
    "pitch_std":         (0.0,   80.0),
    "pitch_range":       (0.0,   600.0),
    "spectral_centroid": (200.0, 5500.0),
    "energy_rms":        (0.001, 0.3),
    "zcr":               (0.01,  0.35),
    "spectral_rolloff":  (500.0, 8000.0),
}

def norm(v, feat):
    lo, hi = NORM_RANGES.get(feat, (0.0, 1.0))
    return float(np.clip((v - lo) / max(hi - lo, 1e-9), 0.0, 1.0))

def synthesize_mfcc(pitch_hz, brillo, energy, voice_type="", pitch_range=0.0):
    pn = np.clip((pitch_hz - 65) / 455, 0, 1)
    bn = np.clip((brillo - 200) / 5300, 0, 1)
    en = np.clip((energy - 0.001) / 0.299, 0, 1)
    rn = np.clip(pitch_range / 600.0, 0, 1)
    vt_offsets = {
        "bass": (-0.08,-0.06,0.04), "bass-baritone": (-0.05,-0.04,0.03),
        "baritone": (0,0,0), "tenor": (0.05,0.04,-0.02),
        "countertenor": (0.10,0.08,-0.04), "contralto": (-0.04,-0.02,0.02),
        "mezzo-soprano": (0.02,0.03,0), "soprano": (0.08,0.06,-0.03),
    }
    o = vt_offsets.get(voice_type.lower(), (0,0,0))
    c = [
        float(np.clip(en+o[0],0,1)), float(np.clip(1.0-bn+o[1],0,1)),
        float(np.clip(pn*0.85+0.08+o[2],0,1)), float(np.clip(pn*0.70+0.12,0,1)),
        float(np.clip(pn*0.55+0.18,0,1)), float(np.clip(bn*0.60+0.20,0,1)),
        float(np.clip(rn*0.50+0.25,0,1)), float(np.clip((pn+bn)*0.40+0.15,0,1)),
        float(np.clip(en*0.45+0.22,0,1)), float(np.clip((1.0-pn)*0.35+0.28,0,1)),
        float(np.clip(bn*0.30+0.32,0,1)), float(np.clip(rn*0.25+0.35,0,1)),
    ]
    seed = int((pitch_hz*100+brillo+len(voice_type)*31) % 2147483647)
    rng = np.random.default_rng(seed)
    rest = rng.normal(0.40, 0.08, 8).clip(0.20, 0.65).tolist()
    return c + rest

def build_singer(name, voice_type, gender, era, genre, country,
                 pitch_hz, brillo, energy_rms,
                 low_hz, high_hz, songs, style_tags=None, difficulty="intermediate"):
    pitch_std   = (high_hz - low_hz) / 6.0
    pitch_range = high_hz - low_hz
    zcr         = float(np.clip(energy_rms * 0.8 + 0.04, 0.01, 0.35))
    rolloff     = float(np.clip(brillo * 1.9, 500, 8000))
    scalars = [
        norm(pitch_hz,   "pitch_mean"),
        norm(pitch_std,  "pitch_std"),
        norm(pitch_range,"pitch_range"),
        norm(brillo,     "spectral_centroid"),
        norm(energy_rms, "energy_rms"),
        norm(zcr,        "zcr"),
        norm(rolloff,    "spectral_rolloff"),
    ]
    mfcc   = synthesize_mfcc(pitch_hz, brillo, energy_rms, voice_type, pitch_range)
    vector = [round(x, 6) for x in scalars + mfcc]

    slug = name.lower()
    for ch in " '.,!?()[]{}":
        slug = slug.replace(ch, "_")
    slug = slug[:40]

    return {
        "id":             slug,
        "name":           name,
        "voice_type":     voice_type,
        "gender":         gender,
        "era":            era,
        "genre_category": genre,
        "genres":         [genre],
        "country_code":   country,
        "style_tags":     style_tags or [],
        "reference_songs":[{"title": s} for s in songs],
        "difficulty":     difficulty,
        "pitch_hz":       round(pitch_hz, 2),
        "brillo":         round(brillo, 1),
        "energy_rms":     round(energy_rms, 4),
        "range": {
            "low_hz":  round(low_hz, 1),
            "high_hz": round(high_hz, 1),
        },
        "vector": vector,
        "source": "expandir_v1",
    }

# ─────────────────────────────────────────────────────────────────────────────
# CATÁLOGO DE ARTISTAS NUEVOS
# pitch_hz: frecuencia fundamental típica de canto
# brillo:   spectral centroid (oscuro=600-1200, medio=1500-2500, brillante=2800-4500)
# energy:   energía RMS (suave=0.02-0.04, media=0.05-0.09, potente=0.10-0.18)
# low/high hz: rango vocal completo
# ─────────────────────────────────────────────────────────────────────────────

NUEVOS = [

    # ── BARÍTONOS INTERNACIONALES ACTUALES ───────────────────────────────────
    build_singer("Adam Levine","tenor","male","2000s+","pop","US",
                 220, 2600, 0.088, 165, 880,
                 ["Moves Like Jagger","This Love","She Will Be Loved","Payphone"],
                 ["pop-rock","falsetto","radio"]),

    build_singer("Robbie Williams","baritone","male","2000s+","pop","GB",
                 162, 1450, 0.082, 98, 392,
                 ["Angels","Feel","Rock DJ","She's the One","Let Me Entertain You"],
                 ["britpop","showman","nostalgic"]),

    build_singer("Lewis Capaldi","baritone","male","2020s+","pop","GB",
                 158, 1300, 0.078, 98, 370,
                 ["Someone You Loved","Before You Go","Wish You the Best","Pointless"],
                 ["emotional","ballad","confessional"]),

    build_singer("James Arthur","baritone","male","2010s","pop","GB",
                 162, 1420, 0.086, 100, 380,
                 ["Say You Won't Let Go","Recovery","Impossible","Can I Be Him"],
                 ["emotional","x-factor","pop-soul"]),

    build_singer("Nick Jonas","tenor","male","2010s","pop","US",
                 218, 2400, 0.085, 165, 698,
                 ["Jealous","Levels","Burnin Up","Close","Chains"],
                 ["pop","r&b","falsetto"]),

    build_singer("Niall Horan","baritone","male","2010s","pop","IE",
                 172, 1500, 0.074, 110, 420,
                 ["Slow Hands","This Town","Nice to Meet Ya","Heaven"],
                 ["folk-pop","1D","acoustic"]),

    build_singer("Louis Tomlinson","baritone","male","2020s+","pop","GB",
                 155, 1280, 0.071, 98, 370,
                 ["Back to You","Two of Us","We Made It","Walls"],
                 ["indie-pop","1D","emotional"]),

    build_singer("Olly Murs","tenor","male","2010s","pop","GB",
                 205, 2100, 0.080, 155, 520,
                 ["Troublemaker","Heart Skips a Beat","Dance With Me Tonight","Wrapped Up"],
                 ["pop","upbeat","british"]),

    build_singer("James Morrison","tenor","male","2000s+","pop","GB",
                 208, 1900, 0.083, 155, 540,
                 ["You Give Me Something","Broken Strings","Please Don't Stop the Rain","Up"],
                 ["soul","acoustic","british"]),

    build_singer("Gavin James","baritone","male","2010s","pop","IE",
                 160, 1350, 0.070, 98, 380,
                 ["Nervous","Always","Hearts on Fire","Glow"],
                 ["acoustic","emotional","irish"]),

    build_singer("Tom Grennan","baritone","male","2020s+","pop","GB",
                 168, 1450, 0.085, 105, 400,
                 ["Found What I've Been Looking For","Little Bit of Love","By Your Side","Amen"],
                 ["soul","indie","british"]),

    build_singer("Calum Scott","tenor","male","2010s","pop","GB",
                 210, 2000, 0.075, 155, 523,
                 ["Dancing on My Own","You Are the Reason","Biblical","If Our Love Is Wrong"],
                 ["ballad","emotional","pop"]),

    build_singer("Giveon","bass-baritone","male","2020s+","r&b","US",
                 112, 820, 0.058, 78, 330,
                 ["Heartbreak Anniversary","Like I Want You","For Tonight","Lies Again"],
                 ["deep","r&b","romantic","neo-soul"]),

    build_singer("Daniel Caesar","baritone","male","2020s+","r&b","CA",
                 182, 1600, 0.065, 116, 440,
                 ["Get You","Best Part","Peaches","Blessed","We Find Love"],
                 ["neo-soul","r&b","smooth"]),

    build_singer("Khalid","baritone","male","2020s+","r&b","US",
                 172, 1550, 0.068, 110, 415,
                 ["Location","Young Dumb & Broke","Talk","Better","Free Spirit"],
                 ["r&b","teen","chill"]),

    build_singer("Rex Orange County","tenor","male","2020s+","indie","GB",
                 200, 1850, 0.060, 150, 480,
                 ["Loving Is Easy","Television / So Far So Good","Best Friend","Never Enough"],
                 ["indie","bedroom-pop","emotional"]),

    build_singer("Finneas","baritone","male","2020s+","pop","US",
                 168, 1500, 0.062, 105, 400,
                 ["Let's Fall in Love for the Night","Lock Me Up","What They'll Say About Us"],
                 ["indie-pop","songwriter","minimalist"]),

    build_singer("JP Saxe","baritone","male","2020s+","pop","CA",
                 165, 1420, 0.064, 105, 390,
                 ["If the World Was Ending","Line by Line","Like That","3 Minutes"],
                 ["acoustic","emotional","singer-songwriter"]),

    build_singer("Dermot Kennedy","baritone","male","2020s+","indie","IE",
                 158, 1320, 0.082, 98, 375,
                 ["Giants","Outnumbered","Power Over Me","Rome","Better Days"],
                 ["folk","emotional","irish"]),

    build_singer("Matt Shultz","tenor","male","2010s","rock","US",
                 215, 2300, 0.110, 160, 620,
                 ["Shake Me Down","Ain't No Rest for the Wicked","Come a Little Closer","Mess Around"],
                 ["indie-rock","alternative","energetic"]),

    build_singer("Brandon Flowers","tenor","male","2000s+","pop-rock","US",
                 218, 2200, 0.095, 165, 590,
                 ["Mr. Brightside","Somebody Told Me","Human","All These Things That I've Done"],
                 ["new-wave","indie-rock","glamour"]),

    build_singer("Dave Grohl","baritone","male","1990s","rock","US",
                 158, 1650, 0.130, 98, 420,
                 ["Best of You","Everlong","Learn to Fly","The Pretender","These Days"],
                 ["rock","grunge","post-grunge","energetic"]),

    build_singer("Anthony Kiedis","tenor","male","1990s","rock","US",
                 210, 2100, 0.108, 158, 550,
                 ["Under the Bridge","Californication","Scar Tissue","By the Way","Soul to Squeeze"],
                 ["funk-rock","rap-rock","california"]),

    build_singer("Scott Weiland","baritone","male","1990s","rock","US",
                 162, 1700, 0.115, 100, 440,
                 ["Plush","Creep","Vasoline","Tumble in the Rough","Trippin on a Hole"],
                 ["grunge","alternative","90s"]),

    build_singer("Nick Cave","bass-baritone","male","1980s","rock","AU",
                 108, 780, 0.055, 75, 320,
                 ["Into My Arms","Red Right Hand","The Mercy Seat","Push the Sky Away"],
                 ["post-punk","dark","poetic","literary"]),

    build_singer("Tom Waits","bass","male","1970s","blues","US",
                 98, 620, 0.048, 65, 280,
                 ["Downtown Train","Tom Traubert's Blues","Jersey Girl","Ol' 55"],
                 ["jazz","blues","raspy","theatrical"]),

    # ── BARÍTONOS LATINOS ACTUALES ────────────────────────────────────────────
    build_singer("Sech","baritone","male","2020s+","reggaeton","PA",
                 170, 1580, 0.080, 108, 415,
                 ["Otro Trago","11 PM","Un Año","Relación"],
                 ["reggaeton","trap","panamanian"]),

    build_singer("Lunay","tenor","male","2020s+","reggaeton","PR",
                 198, 1950, 0.082, 148, 495,
                 ["Soltera","Perfecta","El Apagón","Tú Me Acostumbraste"],
                 ["reggaeton","latin-pop","young"]),

    build_singer("Jhay Cortez","tenor","male","2020s+","reggaeton","PR",
                 202, 2000, 0.085, 150, 510,
                 ["No Me Conoce","Dákiti","Baila Baila Baila","Vacío"],
                 ["urbano","reggaeton","melodic-trap"]),

    build_singer("Paulo Londra","baritone","male","2020s+","trap","AR",
                 162, 1480, 0.079, 102, 400,
                 ["Adan y Eva","Nena Maldición","Tal Vez","La Condena"],
                 ["trap","argentino","melodic"]),

    build_singer("Carlos Vives","baritone","male","2000s+","vallenato","CO",
                 168, 1520, 0.078, 106, 405,
                 ["La Bicicleta","Volví a Nacer","Fruta Fresca","Corazón Profundo"],
                 ["vallenato","cumbia","colombiano"]),

    build_singer("Juan Luis Guerra","tenor","male","1990s","latin","DO",
                 208, 2050, 0.075, 155, 520,
                 ["Bachata Rosa","Ojalá que Llueva Café","Burbujas de Amor","Frío Frío"],
                 ["bachata","merengue","romantic","dominicano"]),

    build_singer("Mora","baritone","male","2020s+","reggaeton","PR",
                 165, 1500, 0.082, 104, 395,
                 ["Porfa","Ay Dios Mío","Cuéntame","Fantasía"],
                 ["urbano","trap","puerto-rico"]),

    build_singer("Blessd","baritone","male","2020s+","urbano","CO",
                 160, 1450, 0.085, 100, 390,
                 ["Medallo","Amor No Tiene Cura","Medellín","Antes de Que Salga el Sol"],
                 ["trap","colombiano","urbano"]),

    build_singer("Ryan Castro","baritone","male","2020s+","urbano","CO",
                 158, 1380, 0.083, 100, 385,
                 ["Quien Soy Yo","Tusa","Feliz","El Ganador"],
                 ["urbano","trap-colombia"]),

    build_singer("Boza","tenor","male","2020s+","reggaeton","PA",
                 196, 1900, 0.080, 145, 485,
                 ["Hecha Pa Mi","Siempre","No Voy a Llorar","Imagínate"],
                 ["reggaeton","panamanian","melodic"]),

    build_singer("Reik","baritone","male","2000s+","pop","MX",
                 168, 1500, 0.074, 106, 405,
                 ["Yo Quisiera","Creo en Ti","Noviembre Sin Ti","Qué Vida La Mía"],
                 ["pop","romantic","mexico"]),

    build_singer("Piso 21","baritone","male","2020s+","latin-pop","CO",
                 165, 1480, 0.076, 104, 400,
                 ["Sin Pijama","Me Llamas","Déjame Ir","Contigo"],
                 ["pop","latin","colombiano"]),

    build_singer("Yandel","baritone","male","2000s+","reggaeton","PR",
                 155, 1350, 0.088, 98, 380,
                 ["Calentura","Mayor que Yo","Encantadora","Moviendo Caderas"],
                 ["reggaeton","duo","old-school"]),

    build_singer("Nicky Jam","baritone","male","2000s+","reggaeton","US",
                 160, 1420, 0.086, 100, 390,
                 ["X","Hasta el Amanecer","El Perdón","Lento"],
                 ["reggaeton","romantic","melodic"]),

    build_singer("Mora","baritone","male","2020s+","urbano","PR",
                 164, 1460, 0.083, 103, 393,
                 ["Porfa","Ay Dios Mío","Cuéntame"],
                 ["urbano","trap"]),

    # ── BARÍTONOS ESPAÑOLES ───────────────────────────────────────────────────
    build_singer("Los Planetas","baritone","male","1990s","indie-rock","ES",
                 162, 1650, 0.095, 100, 400,
                 ["Segundo Premio","Corrientes Circulares del Tiempo","Mi Hermana Pequeña"],
                 ["indie","shoegaze","español"]),

    build_singer("Nathy Peluso","mezzo-soprano","female","2020s+","pop","AR",
                 248, 2600, 0.092, 175, 700,
                 ["Calambre","Bzrp Music Sessions #36","Santa","Sana Sana"],
                 ["avant-pop","jazz","argentina","experimental"]),

    build_singer("El Kanka","baritone","male","2010s","pop","ES",
                 165, 1480, 0.070, 104, 398,
                 ["Tus Padres","Querida Isabel","Gracias","Con Tu Amor"],
                 ["folk","acústico","español"]),

    build_singer("Coque Malla","baritone","male","2000s+","rock","ES",
                 160, 1600, 0.085, 100, 395,
                 ["Si Tú Me Dices Ven","No Puedo Vivir Sin Ti","El Demonio en el Ángel"],
                 ["pop-rock","indie","madrid"]),

    build_singer("Mikel Erentxun","baritone","male","1990s","pop","ES",
                 162, 1520, 0.072, 100, 390,
                 ["Sin Ti","Un Año Más","Pájaros en la Cabeza","Para Siempre"],
                 ["pop","acústico","vasco"]),

    # ── K-POP ─────────────────────────────────────────────────────────────────
    build_singer("BTS (V)","baritone","male","2020s+","k-pop","KR",
                 148, 1350, 0.075, 94, 390,
                 ["Singularity","Inner Child","Blue & Grey","Christmas Tree"],
                 ["k-pop","baritone","deep","romantic"]),

    build_singer("BTS (Jin)","tenor","male","2020s+","k-pop","KR",
                 218, 2300, 0.078, 164, 580,
                 ["Epiphany","Moon","Awake","Yours"],
                 ["k-pop","ballad","clear-voice"]),

    build_singer("BTS (Jimin)","tenor","male","2020s+","k-pop","KR",
                 225, 2500, 0.080, 168, 640,
                 ["Filter","Lie","Promise","Set Me Free Pt.2"],
                 ["k-pop","falsetto","dance"]),

    build_singer("EXO (D.O.)","baritone","male","2010s","k-pop","KR",
                 162, 1450, 0.074, 100, 392,
                 ["That's Okay","Crying Out","What Is Love","Mars"],
                 ["k-pop","ballad","soulful"]),

    build_singer("EXO (Chen)","tenor","male","2010s","k-pop","KR",
                 222, 2350, 0.078, 165, 600,
                 ["Beautiful Goodbye","Make It Count","Give Me a Chance"],
                 ["k-pop","r&b","ballad"]),

    build_singer("Rosé (BLACKPINK)","soprano","female","2020s+","k-pop","KR",
                 318, 3200, 0.082, 220, 880,
                 ["On The Ground","Gone","You & Me","Hard to Love"],
                 ["k-pop","soprano","airy","sweet"]),

    build_singer("Jisoo (BLACKPINK)","soprano","female","2020s+","k-pop","KR",
                 330, 3100, 0.078, 220, 900,
                 ["Flower","MAN","All Eyes on Me","Clarity"],
                 ["k-pop","soprano","breathy"]),

    build_singer("Lisa (BLACKPINK)","mezzo-soprano","female","2020s+","k-pop","TH",
                 265, 2900, 0.095, 190, 720,
                 ["LALISA","Money","Rockstar","New Woman"],
                 ["k-pop","rap","performer","thai"]),

    # ── MEZZO-SOPRANOS / CONTRALTOS ───────────────────────────────────────────
    build_singer("Diana Krall","mezzo-soprano","female","2000s+","jazz","CA",
                 252, 1900, 0.052, 175, 660,
                 ["The Look of Love","Cry Me a River","Just the Way You Are","Feeling Good"],
                 ["jazz","piano","elegant","smooth"]),

    build_singer("Kesha","mezzo-soprano","female","2010s","pop","US",
                 242, 2700, 0.100, 170, 680,
                 ["TiK ToK","We R Who We R","Blow","Rainbow","Woman"],
                 ["pop","party","empowerment"]),

    build_singer("Megan Thee Stallion","mezzo-soprano","female","2020s+","hip-hop","US",
                 238, 2650, 0.108, 168, 660,
                 ["Savage","Hot Girl Summer","WAP","Thot Shit","Traumazine"],
                 ["rap","hip-hop","texas","empowerment"]),

    build_singer("Toni Braxton","contralto","female","1990s","r&b","US",
                 182, 1200, 0.060, 130, 480,
                 ["Un-Break My Heart","He Wasn't Man Enough","Breathe Again","Babyface"],
                 ["r&b","soul","deep","sensual"]),

    build_singer("Jennifer Lopez","mezzo-soprano","female","2000s+","pop","US",
                 242, 2500, 0.088, 170, 680,
                 ["On the Floor","Love Don't Cost a Thing","Jenny from the Block","Waiting for Tonight"],
                 ["pop","latin","dance","performer"]),

    build_singer("P!nk","mezzo-soprano","female","2000s+","pop-rock","US",
                 248, 2600, 0.115, 172, 700,
                 ["Just Give Me a Reason","Try","Raise Your Glass","So What","Just Like a Pill"],
                 ["pop-rock","powerful","feminist","raw"]),

    build_singer("Erykah Badu","contralto","female","1990s","r&b","US",
                 185, 1300, 0.055, 130, 490,
                 ["On & On","Bag Lady","Tyrone","Next Lifetime","Didn't Cha Know"],
                 ["neo-soul","r&b","soulful","spiritual"]),

    build_singer("Sade","contralto","female","1980s","r&b","GB",
                 188, 1350, 0.048, 132, 495,
                 ["Smooth Operator","No Ordinary Love","By Your Side","The Sweetest Taboo"],
                 ["soul","jazz","smooth","elegant"]),

    build_singer("Norah Jones","mezzo-soprano","female","2000s+","jazz","US",
                 245, 1800, 0.050, 172, 640,
                 ["Come Away with Me","Don't Know Why","Sunrise","Feelin' the Same Way"],
                 ["jazz","acoustic","piano","indie"]),

    build_singer("India.Arie","contralto","female","2000s+","r&b","US",
                 192, 1380, 0.058, 135, 500,
                 ["Video","I Am Not My Hair","Ready for Love","Testimony"],
                 ["neo-soul","acoustic","empowerment","natural"]),

    build_singer("Jhené Aiko","mezzo-soprano","female","2020s+","r&b","US",
                 255, 2400, 0.058, 178, 680,
                 ["The Worst","While We're Young","Bed Peace","Sativa"],
                 ["r&b","dream-pop","emotional","airy"]),

    build_singer("Solange","mezzo-soprano","female","2010s","r&b","US",
                 250, 2350, 0.065, 175, 660,
                 ["Cranes in the Sky","Don't Touch My Hair","Mad","Losing You"],
                 ["r&b","avant-garde","art-pop","soulful"]),

    # ── SOPRANOS ACTUALES ─────────────────────────────────────────────────────
    build_singer("Chappell Roan","soprano","female","2020s+","pop","US",
                 340, 3400, 0.088, 232, 932,
                 ["Good Luck Babe!","Red Wine Supernova","Hot to Go!","Casual"],
                 ["pop","theatrical","gay-icon","indie"]),

    build_singer("Gracie Abrams","soprano","female","2020s+","indie-pop","US",
                 310, 3000, 0.070, 215, 830,
                 ["I Love You I'm Sorry","Risk","That's So True","Said It First"],
                 ["indie-pop","emotional","bedroom-pop"]),

    build_singer("Reneé Rapp","soprano","female","2020s+","pop","US",
                 345, 3500, 0.082, 235, 950,
                 ["Too Well","Pretty Girls","Snow Angel","Tummy Hurts"],
                 ["pop","theatrical","broadway","powerful"]),

    build_singer("Conan Gray","tenor","male","2020s+","indie-pop","US",
                 215, 2400, 0.072, 162, 575,
                 ["Heather","Maniac","People Watching","Family Line"],
                 ["indie-pop","emotional","gen-z"]),

    build_singer("Omar Apollo","baritone","male","2020s+","r&b","US",
                 178, 1700, 0.068, 112, 430,
                 ["Evergreen","Bad Life","Only One","Petrified"],
                 ["r&b","indie","falsetto","mexican-american"]),

    build_singer("Lucky Daye","tenor","male","2020s+","r&b","US",
                 212, 2200, 0.072, 158, 568,
                 ["Roll Some Mo","Over","Real Games","Fade Away"],
                 ["r&b","soul","contemporary","falsetto"]),

    build_singer("Victoria Monét","mezzo-soprano","female","2020s+","r&b","US",
                 252, 2500, 0.072, 175, 670,
                 ["On My Mama","Smoke","Alright","Coastin"],
                 ["r&b","neo-soul","retro","sensual"]),

    build_singer("Doechii","mezzo-soprano","female","2020s+","hip-hop","US",
                 248, 2750, 0.102, 172, 680,
                 ["Nissan Altima","Anxiety","Denial Is a River","Booty"],
                 ["rap","hip-hop","eccentric","art-rap"]),

    build_singer("Tyla","soprano","female","2020s+","afrobeats","ZA",
                 325, 3100, 0.080, 225, 875,
                 ["Water","ART","On and On","No. 1"],
                 ["afrobeats","afropop","south-africa","dancehall"]),

    build_singer("Kali Uchis","soprano","female","2020s+","r&b","CO",
                 320, 3150, 0.070, 222, 862,
                 ["Telepatía","After the Storm","Feels Like Summer","I Wish You Roses"],
                 ["r&b","indie-pop","dream-pop","colombiana"]),

    build_singer("Summer Walker","contralto","female","2020s+","r&b","US",
                 195, 1500, 0.062, 138, 515,
                 ["Girls Need Love","Come Thru","Over It","No Love"],
                 ["r&b","alternative-r&b","emotional"]),

    build_singer("SZA","mezzo-soprano","female","2020s+","r&b","US",
                 252, 2480, 0.068, 175, 670,
                 ["Kill Bill","Good Days","Shirt","Snooze","Seek & Destroy"],
                 ["r&b","alternative","emotional"]),

    # ── TENORES INTERNACIONALES ───────────────────────────────────────────────
    build_singer("Harry Styles","tenor","male","2020s+","pop","GB",
                 212, 2200, 0.085, 158, 565,
                 ["As It Was","Watermelon Sugar","Adore You","Late Night Talking"],
                 ["pop","glam-rock","1D"]),

    build_singer("Troye Sivan","tenor","male","2020s+","pop","AU",
                 215, 2350, 0.072, 162, 574,
                 ["Rush","Something to Give Each Other","Angel Baby","Happy Little Pill"],
                 ["pop","indie","lgbtq","synth-pop"]),

    build_singer("Frank Ocean","baritone","male","2010s","r&b","US",
                 175, 1700, 0.065, 110, 435,
                 ["Novacane","Thinkin Bout You","Pyramids","Bad Religion","Pink + White"],
                 ["r&b","alternative","experimental"]),

    build_singer("The Weeknd","baritone","male","2020s+","r&b","CA",
                 165, 1820, 0.088, 104, 460,
                 ["Blinding Lights","Starboy","Save Your Tears","Die For You"],
                 ["r&b","synth-pop","dark","falsetto"]),

    build_singer("John Mayer","baritone","male","2000s+","pop-rock","US",
                 165, 1650, 0.082, 104, 415,
                 ["Your Body Is a Wonderland","Slow Dancing in a Burning Room","Gravity","Continuum"],
                 ["blues","pop-rock","guitar","virtuoso"]),

    build_singer("Ed Sheeran","tenor","male","2010s","pop","GB",
                 205, 2050, 0.082, 153, 545,
                 ["Shape of You","Perfect","Thinking Out Loud","Bad Habits","Shivers"],
                 ["pop","acoustic","beatbox"]),

    build_singer("Shawn Mendes","tenor","male","2010s","pop","CA",
                 215, 2300, 0.080, 162, 578,
                 ["In My Blood","Stitches","Treat You Better","There's Nothing Holdin' Me Back"],
                 ["pop","acoustic","teen"]),

    build_singer("Charlie Puth","tenor","male","2010s","pop","US",
                 210, 2250, 0.078, 158, 565,
                 ["Attention","We Don't Talk Anymore","See You Again","One Call Away"],
                 ["pop","r&b","falsetto","perfect-pitch"]),

    # ── ROCK / ALTERNATIVO ────────────────────────────────────────────────────
    build_singer("Chris Cornell","baritone","male","1990s","rock","US",
                 162, 2100, 0.130, 98, 590,
                 ["Black Hole Sun","Fell on Black Days","Like a Stone","Show Me How to Live"],
                 ["grunge","hard-rock","powerful","range"]),

    build_singer("Eddie Vedder","baritone","male","1990s","rock","US",
                 155, 1850, 0.120, 98, 490,
                 ["Even Flow","Alive","Black","Better Man","Just Breathe"],
                 ["grunge","alternative","emotional","pearl-jam"]),

    build_singer("Billy Corgan","tenor","male","1990s","rock","US",
                 215, 2200, 0.115, 162, 580,
                 ["1979","Bullet with Butterfly Wings","Tonight Tonight","Zero","Soma"],
                 ["alternative","grunge","nasal","smashing-pumpkins"]),

    build_singer("Gavin Rossdale","baritone","male","1990s","rock","GB",
                 162, 1800, 0.115, 100, 430,
                 ["Machinehead","Everything Zen","Glycerine","Comedown"],
                 ["post-grunge","british-rock","90s"]),

    build_singer("Matt Bellamy","tenor","male","2000s+","rock","GB",
                 218, 2500, 0.118, 164, 625,
                 ["Supermassive Black Hole","Uprising","Madness","Hysteria","Knights of Cydonia"],
                 ["alternative","progressive","operatic","muse"]),

    build_singer("Thom Yorke","tenor","male","1990s","rock","GB",
                 210, 2200, 0.095, 158, 570,
                 ["Creep","Karma Police","Fake Plastic Trees","No Surprises","Exit Music"],
                 ["alternative","art-rock","falsetto","radiohead"]),

    build_singer("Jack White","tenor","male","2000s+","rock","US",
                 215, 2600, 0.125, 162, 590,
                 ["Seven Nation Army","Icky Thump","Hotel Yorba","Ball and Biscuit"],
                 ["blues-rock","alternative","raw","white-stripes"]),

    build_singer("Arctic Monkeys (Alex Turner)","baritone","male","2000s+","indie-rock","GB",
                 165, 1780, 0.095, 104, 425,
                 ["R U Mine?","Do I Wanna Know?","505","Fluorescent Adolescent"],
                 ["indie-rock","british","post-punk"]),

    # ── LATIN POP / URBANO ADICIONAL ─────────────────────────────────────────
    build_singer("Jesse & Joy (Joy)","soprano","female","2010s","latin-pop","MX",
                 322, 3200, 0.076, 222, 870,
                 ["¡Corre!","Llorar","Tanto","Un Besito Más"],
                 ["pop","folk","mexicana"]),

    build_singer("Jesse & Joy (Jesse)","baritone","male","2010s","latin-pop","MX",
                 165, 1500, 0.070, 104, 398,
                 ["¡Corre!","Llorar","Tanto","Un Besito Más"],
                 ["pop","folk","mexicano"]),

    build_singer("Bunbury","baritone","male","1990s","rock","ES",
                 162, 1680, 0.090, 100, 410,
                 ["Radical Sonora","El Extranjero","Lady Blue","Cuna de Campeones"],
                 ["rock","spanish-rock","heroesdelsilencio"]),

    build_singer("Andrés Calamaro","baritone","male","1990s","rock","AR",
                 158, 1520, 0.082, 100, 390,
                 ["Flaca","Estadio Azteca","El Salmón","Loco","Te Quiero Igual"],
                 ["rock","argentina","pop-rock"]),

    build_singer("Kevin Roldán","tenor","male","2020s+","reggaeton","CO",
                 198, 1900, 0.082, 148, 495,
                 ["Un Poco Loco","Más Sexy","Quiero Más","Obsesionada"],
                 ["reggaeton","colombiano","melodic"]),

    build_singer("Sebastián Yatra","tenor","male","2020s+","latin-pop","CO",
                 200, 1980, 0.080, 150, 510,
                 ["Tacones Rojos","Chica Ideal","Robarte un Beso","Traicionera"],
                 ["pop","reggaeton","colombiano"]),

    build_singer("Manuel Turizo","baritone","male","2020s+","reggaeton","CO",
                 168, 1560, 0.082, 106, 408,
                 ["La Bachata","Una Lady Como Tú","colombia","Palmeras"],
                 ["bachata","reggaeton","colombiano"]),

    build_singer("Peso Pluma","tenor","male","2020s+","corridos","MX",
                 202, 2050, 0.088, 151, 515,
                 ["Ella Baila Sola","La Bebé","BZRP Session 55","Lady Gaga"],
                 ["corridos-tumbados","regional-mexicano","trap"]),

    build_singer("Natanael Cano","tenor","male","2020s+","corridos","MX",
                 198, 1980, 0.085, 148, 502,
                 ["Amor Tumbado","Pacas de a Mil","Con R de Reggaeton","Yendo pa'la Cumbre"],
                 ["corridos-tumbados","regional-mexicano"]),

    build_singer("Xavi (cantante)","tenor","male","2020s+","corridos","MX",
                 195, 1960, 0.083, 146, 498,
                 ["La Diabla","Suéltate","De Madrugada","Antes de Que te Vayas"],
                 ["corridos","regional-mexicano","melodic"]),

    build_singer("Junior H","baritone","male","2020s+","corridos","MX",
                 162, 1480, 0.082, 101, 398,
                 ["Mi Pas","Que Viva México","El Azul","A Tu Nombre"],
                 ["corridos-tumbados","regional-mexicano","sad-sierreño"]),

    build_singer("DannyLux","tenor","male","2020s+","corridos","MX",
                 195, 1920, 0.080, 146, 490,
                 ["Adiós Amor","Noche en el Ring","Diferente","Simplemente Amigos"],
                 ["sierreño","corridos","regional-mexicano"]),

    # ── FLAMENCO / NUEVO FLAMENCO ─────────────────────────────────────────────
    build_singer("Camarón de la Isla","baritone","male","1970s","flamenco","ES",
                 168, 1600, 0.095, 105, 440,
                 ["La Leyenda del Tiempo","Soy Gitano","Vivirán","Nana del Caballo Grande"],
                 ["flamenco","jondo","gitano","legend"]),

    build_singer("Paco de Lucía","bass-baritone","male","1970s","flamenco","ES",
                 128, 950, 0.065, 82, 350,
                 ["Entre Dos Aguas","Ríos Anados","Recuerdos de la Alhambra","Fuente y Caudal"],
                 ["flamenco","guitarra","instrumental"]),

    build_singer("Diego El Cigala","baritone","male","2000s+","flamenco","ES",
                 162, 1580, 0.085, 100, 415,
                 ["Romance de la Luna","Lágrimas Negras","Indestructible","Dos Gardenias"],
                 ["flamenco","bolero","tropical"]),

    build_singer("Mayte Martín","mezzo-soprano","female","2000s+","flamenco","ES",
                 240, 1800, 0.080, 170, 640,
                 ["La Llorona","Hay un Romance","Corazones","Encuentros"],
                 ["flamenco","copla","jazz"]),

    build_singer("Enrique Morente","baritone","male","1970s","flamenco","ES",
                 160, 1560, 0.090, 100, 405,
                 ["Omega","Pequeño Vals Vienés","Lorca","Nana de Sevilla"],
                 ["flamenco","vanguardia","legend","andaluz"]),

    # ── POP CLÁSICO ──────────────────────────────────────────────────────────
    build_singer("Phil Collins","baritone","male","1980s","pop","GB",
                 162, 1500, 0.082, 100, 395,
                 ["In the Air Tonight","Against All Odds","You Can't Hurry Love","Another Day in Paradise"],
                 ["pop","soft-rock","drums","genesis"]),

    build_singer("Sting","baritone","male","1980s","pop","GB",
                 168, 1680, 0.085, 105, 430,
                 ["Every Breath You Take","Fields of Gold","Roxanne","Desert Rose"],
                 ["pop","jazz","the-police","eclectic"]),

    build_singer("Peter Gabriel","baritone","male","1980s","art-rock","GB",
                 160, 1580, 0.085, 100, 400,
                 ["Sledgehammer","In Your Eyes","Solsbury Hill","Don't Give Up"],
                 ["art-rock","experimental","world-music"]),

    build_singer("Billy Joel","baritone","male","1970s","pop","US",
                 162, 1550, 0.080, 100, 400,
                 ["Piano Man","We Didn't Start the Fire","It's Still Rock and Roll","She's Always a Woman"],
                 ["piano-rock","soft-rock","american","storyteller"]),

    build_singer("Don Henley","baritone","male","1980s","pop-rock","US",
                 160, 1480, 0.078, 100, 390,
                 ["The Boys of Summer","The Heart of the Matter","Dirty Laundry","New York Minute"],
                 ["soft-rock","eagles","americana"]),

    build_singer("Lionel Richie","baritone","male","1980s","r&b","US",
                 162, 1500, 0.072, 100, 395,
                 ["Hello","All Night Long","Say You Say Me","Endless Love","Three Times a Lady"],
                 ["r&b","soul","romantic","pop"]),

    build_singer("Stevie Wonder","baritone","male","1970s","r&b","US",
                 172, 1750, 0.085, 108, 450,
                 ["Superstition","Sir Duke","Isn't She Lovely","I Just Called","As"],
                 ["soul","motown","harmonica","genius"]),

    # ── SOUL / R&B CLÁSICO ────────────────────────────────────────────────────
    build_singer("Al Green","tenor","male","1970s","soul","US",
                 210, 1950, 0.072, 158, 558,
                 ["Let's Stay Together","Take Me to the River","Tired of Being Alone","Love and Happiness"],
                 ["soul","gospel","smooth","memphis"]),

    build_singer("Marvin Gaye","tenor","male","1970s","soul","US",
                 215, 2050, 0.068, 162, 575,
                 ["Sexual Healing","What's Going On","Let's Get It On","Mercy Mercy Me"],
                 ["soul","motown","smooth","sensitive"]),

    build_singer("Curtis Mayfield","tenor","male","1970s","soul","US",
                 215, 1980, 0.065, 162, 570,
                 ["Superfly","Move On Up","People Get Ready","Freddie's Dead"],
                 ["soul","funk","falsetto","activist"]),

    build_singer("Otis Redding","baritone","male","1960s","soul","US",
                 165, 1720, 0.095, 104, 440,
                 ["(Sittin' On) The Dock of the Bay","Try a Little Tenderness","Respect","I've Been Loving You Too Long"],
                 ["soul","r&b","raw","passionate"]),

    build_singer("James Brown","baritone","male","1960s","funk","US",
                 168, 1900, 0.120, 105, 455,
                 ["I Got You (I Feel Good)","Papa's Got a Brand New Bag","Sex Machine","Living in America"],
                 ["funk","soul","energetic","godfather"]),

    # ── RAP / HIP-HOP ────────────────────────────────────────────────────────
    build_singer("Kendrick Lamar","baritone","male","2010s","hip-hop","US",
                 162, 1800, 0.098, 100, 415,
                 ["HUMBLE.","DNA.","Alright","Swimming Pools (Drank)","Not Like Us"],
                 ["hip-hop","conscious","west-coast","artístico"]),

    build_singer("J. Cole","baritone","male","2010s","hip-hop","US",
                 165, 1750, 0.090, 103, 420,
                 ["No Role Modelz","Middle Child","Power Trip","Love Yourz"],
                 ["hip-hop","conscious","south","lyrical"]),

    build_singer("Logic","baritone","male","2010s","hip-hop","US",
                 162, 1720, 0.095, 100, 415,
                 ["1-800-273-8255","Homicide","Under Pressure","Everybody"],
                 ["hip-hop","conscious","pop-rap"]),

    build_singer("Post Malone","baritone","male","2020s+","hip-hop","US",
                 160, 1600, 0.092, 100, 410,
                 ["Circles","Rockstar","Sunflower","Better Now","White Iverson"],
                 ["hip-hop","pop","melodic","tattoo"]),

    build_singer("Juice WRLD","tenor","male","2020s+","hip-hop","US",
                 200, 2150, 0.095, 150, 535,
                 ["Lucid Dreams","All Girls Are the Same","Legends","Robbery"],
                 ["emo-rap","melodic","young","emotional"]),

    build_singer("Rod Wave","baritone","male","2020s+","hip-hop","US",
                 165, 1620, 0.085, 103, 415,
                 ["Heart on Ice","Tombstone","Street Runner","Cold December"],
                 ["soul-trap","emotional","southern","melodic"]),

    build_singer("NF","baritone","male","2020s+","hip-hop","US",
                 158, 1500, 0.090, 100, 395,
                 ["The Search","Let You Down","Alone","Mansion"],
                 ["christian-rap","emotional","storyteller"]),

    # ── AFRICA / MUNDO ────────────────────────────────────────────────────────
    build_singer("Burna Boy","baritone","male","2020s+","afrobeats","NG",
                 168, 1750, 0.095, 105, 430,
                 ["Last Last","Ye","On the Low","Location","Way Too Big"],
                 ["afrobeats","reggae","nigeria","african-giant"]),

    build_singer("Wizkid","baritone","male","2020s+","afrobeats","NG",
                 165, 1700, 0.090, 104, 420,
                 ["Essence","Ojuelegba","Come Closer","Mood"],
                 ["afrobeats","afropop","nigeria","smooth"]),

    build_singer("Davido","baritone","male","2020s+","afrobeats","NG",
                 162, 1680, 0.092, 102, 415,
                 ["Fall","If","Fem","Stand Strong"],
                 ["afrobeats","nigeria","party"]),

    build_singer("Fireboy DML","tenor","male","2020s+","afrobeats","NG",
                 200, 1980, 0.080, 150, 510,
                 ["Peru","Jealous","Vibration","Tattoo"],
                 ["afrobeats","r&b","nigeria"]),

    build_singer("Rema","tenor","male","2020s+","afrobeats","NG",
                 195, 1950, 0.088, 146, 500,
                 ["Calm Down","Beamer (Bad Boys)","Bounce","Are You There"],
                 ["afrobeats","afropop","young","nigeria"]),

    build_singer("CKay","tenor","male","2020s+","afrobeats","NG",
                 198, 1970, 0.082, 148, 502,
                 ["Love Nwantiti","Emiliana","Watawi","Felony"],
                 ["afrobeats","melodic","guitar","ng"]),

    build_singer("Tems","contralto","female","2020s+","afrobeats","NG",
                 195, 1600, 0.072, 138, 520,
                 ["Free Mind","Higher","Try Me","Essence"],
                 ["afrobeats","r&b","deep","powerful","nigeria"]),

    build_singer("Amaarae","soprano","female","2020s+","afrobeats","GH",
                 318, 3100, 0.075, 220, 860,
                 ["SAD GIRLZ LUV MONEY","Fancy","Angels in Tibet"],
                 ["afrobeats","pop","ghana","airy"]),

    # ── ELECTRÓNICA / POP EXPERIMENTAL ───────────────────────────────────────
    build_singer("FKA twigs","soprano","female","2010s","r&b","GB",
                 330, 3400, 0.070, 226, 900,
                 ["Two Weeks","Cellophane","Water Me","Magdalene"],
                 ["art-r&b","experimental","ethereal","dancer"]),

    build_singer("Bon Iver","tenor","male","2000s+","indie","US",
                 212, 2100, 0.065, 159, 565,
                 ["Skinny Love","Holocene","Re: Stacks","Blood Bank","Calgary"],
                 ["folk","indie","falsetto","atmospheric"]),

    build_singer("James Blake","baritone","male","2010s","electronic","GB",
                 162, 1450, 0.058, 100, 400,
                 ["Retrograde","Limit to Your Love","The Wilhelm Scream","Assume Form"],
                 ["electronic","soul","falsetto","experimental"]),

    build_singer("How to Dress Well","baritone","male","2010s","r&b","US",
                 168, 1500, 0.055, 105, 412,
                 ["Ready for the World","Words I Don't Remember","Cold Nites"],
                 ["r&b","indie","experimental"]),

    build_singer("Blood Orange","tenor","male","2010s","r&b","GB",
                 205, 2050, 0.068, 153, 548,
                 ["You're Not Good Enough","Chamakay","Thank You","But You","Augustine"],
                 ["r&b","art-pop","experimental","dev-hynes"]),

    # ── CUARTETO ADICIONAL ESPAÑOL ────────────────────────────────────────────
    build_singer("Pablo López","tenor","male","2010s","pop","ES",
                 208, 2100, 0.078, 156, 558,
                 ["El Patio","Camino","Caramelo","Lo Saben Mis Zapatos"],
                 ["pop","piano","español","emotional"]),

    build_singer("Manuel Carrasco","tenor","male","2000s+","pop","ES",
                 205, 2050, 0.082, 154, 548,
                 ["Hay Que Vivir el Momento","No Dejes de Soñar","Un Millón de Cicatrices","Que el Cielo Espere"],
                 ["pop","rock","flamenco","español"]),

    build_singer("David Bisbal","tenor","male","2000s+","pop","ES",
                 210, 2150, 0.085, 158, 565,
                 ["Bulería","Ave María","Si Tú Me Miras","Esclavo de Sus Besos"],
                 ["latin-pop","flamenco-pop","español","ot"]),

    build_singer("David Bustamante","tenor","male","2000s+","pop","ES",
                 205, 2000, 0.080, 154, 545,
                 ["Me Sabe a Poco","Corazón de Madera","Dos Hombres y un Destino"],
                 ["pop","español","ot"]),

    build_singer("Antonio Orozco","baritone","male","2000s+","pop","ES",
                 165, 1520, 0.078, 104, 398,
                 ["Devuélveme la Vida","En Momentos Así","Tu Historia","Corazón"],
                 ["pop-rock","español","vocal"]),

    build_singer("Leiva","baritone","male","2010s","rock","ES",
                 162, 1650, 0.092, 100, 405,
                 ["Terriblemente Cruel","La Próxima Vez","Tormenta de Arena","Prometo"],
                 ["indie-rock","pop-rock","español","madrileño"]),

    build_singer("Anni B Sweet","soprano","female","2010s","indie-pop","ES",
                 315, 3050, 0.070, 218, 848,
                 ["Chasing Clouds","I Won't Be Your Nothing","Silver Car","Pongámonos a Tono"],
                 ["indie-pop","dream-pop","española"]),

    build_singer("Zahara","mezzo-soprano","female","2010s","pop","ES",
                 250, 2500, 0.075, 175, 668,
                 ["Merichane","Perseveranda","Quédate en el Fin del Mundo","Los Primeros Días"],
                 ["indie","pop","folk-pop","española"]),

    build_singer("Rozalén","mezzo-soprano","female","2010s","pop","ES",
                 245, 2400, 0.072, 172, 655,
                 ["La Puerta Violeta","Que el Cielo Espere Sentao","El Mundo Es Tuyo","En Un Lugar"],
                 ["pop","folk","española","social"]),

    build_singer("Valeria Castro","mezzo-soprano","female","2020s+","pop","ES",
                 248, 2420, 0.068, 174, 660,
                 ["Volver","Ojos Verdes","Antes de Nada","Cariño"],
                 ["folk-pop","española","canaria"]),

    build_singer("Elvira Sastre (feat)","soprano","female","2020s+","pop","ES",
                 318, 3100, 0.068, 220, 855,
                 ["Mil Versiones de Ti","Antes de Que Salga el Sol"],
                 ["poet","indie","española"]),

]

# ─── Carga DB actual para detectar duplicados ─────────────────────────────────
DB_PATH = "cloudflare/harmiq_db_vectores.json"
with open(DB_PATH, encoding="utf-8") as f:
    current_db = json.load(f)

existing_names = {s["name"].lower().strip() for s in current_db["singers"]}

nuevos_filtrados = []
duplicados = []
for s in NUEVOS:
    key = s["name"].lower().strip()
    if key in existing_names:
        duplicados.append(s["name"])
    else:
        nuevos_filtrados.append(s)
        existing_names.add(key)  # evitar duplicados dentro de la propia lista

print(f"Total en lista:   {len(NUEVOS)}")
print(f"Ya en DB:         {len(duplicados)} -- {', '.join(duplicados[:8])}{'...' if len(duplicados)>8 else ''}")
print(f"Nuevos a anadir:  {len(nuevos_filtrados)}")

# ─── Guardar en nuevo fichero fuente ─────────────────────────────────────────
OUTPUT = "harmiq_nuevos_v1.json"
output_data = {
    "meta": {"version": "nuevos_v1", "total": len(nuevos_filtrados)},
    "singers": nuevos_filtrados
}
with open(OUTPUT, "w", encoding="utf-8") as f:
    json.dump(output_data, f, ensure_ascii=False, indent=2)

print(f"\nGuardado: {OUTPUT} ({len(nuevos_filtrados)} artistas)")
print("\nDesglose por tipo de voz:")
vt_count = {}
for s in nuevos_filtrados:
    vt_count[s["voice_type"]] = vt_count.get(s["voice_type"],0)+1
for vt, n in sorted(vt_count.items(), key=lambda x:-x[1]):
    print(f"  {vt:<18} {n}")
