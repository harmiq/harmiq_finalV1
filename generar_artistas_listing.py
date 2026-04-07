"""
Genera cloudflare/artistas/index.html
Las imagenes se cargan dinamicamente en el browser con el mismo sistema
que app.js: MONO_IMGS (Wikipedia) -> HF Spotify -> iTunes song -> SVG iniciales.
NO se hardcodean URLs en el HTML (evita URLs rotas).
"""
import json, re, os

OUTPUT = "cloudflare/artistas/index.html"

VOICE_COLORS = {
    "baritono":"#7C4DFF","baritono":"#7C4DFF",
    "bajo":"#1E3A5F","bajo-baritono":"#2d4a6b",
    "tenor":"#118AB2",
    "soprano":"#FF4FA3",
    "mezzosoprano":"#FF9F1C","mezzo-soprano":"#FF9F1C",
    "contralto":"#80B918",
    "contratenor":"#06D6A0"
}

# (nombre, tipo_voz_display, voz_key, genero, pais, desc, anecdota)
ARTISTS = [
    # ── TRAP / RAP ESPAÑOL ───────────────────────────────────────────────────
    ("Bad Bunny","Baritono","baritono","Reggaeton / Trap","PR",
     "Benito Antonio Martinez Ocasio es el artista latino mas escuchado en la historia de Spotify. Su voz profunda de baritono rompio con el estandar del reggaeton.",
     "Grabo su primer gran hit 'Diles' mientras trabajaba embolsando comida en un supermercado de Puerto Rico."),
    ("Quevedo","Baritono","baritono","Trap / Pop","ES",
     "Francisco Jesus Ruiz Tejera nacio en Gran Canaria y se convirtio en el artista espanol mas escuchado globalmente con la 'Bzrp Music Sessions 52'.",
     "De pequeno le llamaban asi en el colegio por sus gafas, como el poeta del siglo XVII. Y se quedo con el apodo."),
    ("C. Tangana","Baritono","baritono","Trap / Flamenco","ES",
     "Anton Alvarez Alfaro va del trap mas duro al flamenco y la musica tradicional, siempre con voz de baritono profunda y oscura.",
     "Fue expulsado del colegio de curas a los 14 anos. Anos despues colaboro con la Orquesta Nacional de Espana."),
    ("Bizarrap","Baritono","baritono","Trap / Electronica","AR",
     "Gonzalo Julian Conde es el productor mas importante de la musica urbana latinoamericana actual. Sus BZRP Sessions han lanzado al estrellato a decenas de artistas.",
     "Su productora esta en el garaje de la casa de sus padres en Buenos Aires, donde grabo las primeras 50 Music Sessions."),
    ("Saiko","Baritono","baritono","Trap","ES",
     "Jose Carlos Gomez es uno de los referentes del trap espanol actual. Su flow oscuro y su estetica sombria lo han convertido en icono de la escena.",
     "Empezo en el mundo del rap underground de Cadiz antes de explotar a nivel nacional con sus colaboraciones con grandes artistas."),
    ("Cruz Cafune","Baritono","baritono","Trap / Pop","ES",
     "Cruz Cafune mezcla el trap con el pop y el R&B. Su produccion minimalista y sus letras introspectivas lo han hecho referente de la nueva escena espanola.",
     "Nacio en Las Palmas de Gran Canaria, la misma isla que Quevedo. Las Canarias se han convertido en cuna del trap espanol."),
    ("Omar Montes","Baritono","baritono","Trap / Flamenco","ES",
     "Omar Montes nacio en Pan Bendito (Madrid) y mezcla el trap con el flamenco y el urbano espanol. Su naturalidad y autenticidad conectan con el publico.",
     "Salto a la fama tras salir en el reality 'GH VIP'. Aprovecho la exposicion mediatica para lanzar su carrera musical."),
    ("Recycled J","Tenor","tenor","Rap / Hip-Hop","ES",
     "Roberto Diaz Garcia es uno de los raperos mas solidos de Espana. Su tenor claro y sus letras trabajadas lo han consolidado como voz del rap consciente espanol.",
     "Estudio en la Universidad Complutense de Madrid mientras hacia sus primeros freestyles. Fue nominado a los Latin Grammy antes de los 25 anos."),
    ("Nach","Baritono","baritono","Rap / Hip-Hop","ES",
     "Ignacio Fornies es el padrino del rap intelectual en Espana. Llevan mas de 25 anos en activo con letras de una densidad literaria unica.",
     "Estudio Filosofia antes de dedicarse al rap. Sus letras estan llenas de referencias filosoficas y literarias que sus fans tienen que buscar en el diccionario."),
    ("Maikel Delacalle","Baritono","baritono","Trap / R&B","ES",
     "Maikel Sansegundo Delacalle fusiona el trap con el R&B y el soul. Su voz de baritono calida y sus melodias pegadizas lo hacen unico en la escena espanola.",
     "Nacio en Cantabria y se traslado a Madrid para perseguir su sueno musical. Sus primeros temas los grabo en el bano de su piso compartido."),
    ("Ptazeta","Soprano","soprano","Trap / Pop","ES",
     "Patricia Rodriguez es una de las voces femeninas mas importantes del trap espanol. Su soprano agresivo rompe con los estereotipos del genero.",
     "Empezo en la escena underground de Valencia antes de dar el salto al mainstream con colaboraciones con los grandes del trap espanol."),
    ("Dellafuente","Baritono","baritono","Trap / Flamenco","ES",
     "Rodrigo Garcia nacio en Granada y su musica tiene ADN andaluz. Mezcla el flamenco con el trap de una manera unica y autentica.",
     "Sus primeros temas los distribuia el mismo pegando carteles en los postes de Granada. Hoy llena recintos de miles de personas."),
    ("Yung Beef","Baritono","baritono","Trap","ES",
     "Alberto Postigo es uno de los padres del trap espanol. Su estetica underground y sus letras de barrio abrieron el camino para toda una generacion.",
     "Formo parte del colectivo La Zowi junto a otros pioneros del trap espanol. Sus primeras grabaciones se hacian con microfonos de 20 euros."),
    ("BENY JR","Tenor","tenor","Trap / R&B","ES",
     "Beny Jr tiene una voz de tenor suave y una estetica muy cuidada. Es de los artistas espanoles que mejor fusiona el trap con el R&B y el soul.",
     "Sus videoclips estan considerados algunos de los mejor producidos del trap espanol, con una estetica cinematografica muy trabajada."),
    # ── TRAP ARGENTINA ────────────────────────────────────────────────────────
    ("Paulo Londra","Baritono","baritono","Trap Argentina","AR",
     "Paulo Ezequiel Londra nacio en Cordoba y conquisto el mundo con su mezcla unica de trap melodico y pop. Voz de baritono con mucho soul.",
     "Su primer tema viral fue 'Nena Maldicion', que grabo con 16 anos en el cuarto de su casa de Cordoba."),
    ("Duki","Baritono","baritono","Trap Argentina","AR",
     "Mauro Ezequiel Lombardo fue uno de los pioneros del trap argentino. Su voz grave y su flow rapido son su firma sonora.",
     "Empezo en las batallas de freestyle callejeras de Buenos Aires, donde lo conocian como 'El Queso'."),
    ("Wos","Baritono","baritono","Trap Argentina","AR",
     "Valentin Oliva es probablemente el mejor freestyler de Argentina. Su paso del rap de competicion al trap lo convirtio en fenomeno de masas.",
     "Gano el Red Bull Batalla de los Gallos de Argentina cuatro veces. Su batalla contra Aczino en 2018 es considerada la mejor de la historia."),
    ("Trueno","Baritono","baritono","Trap Argentina","AR",
     "Mateo Palacios Corazzina, hijo del rapero Acru, crecio en el mundo del freestyle. Su 'Bien o Mal' fue himno de una generacion.",
     "Su padre lo entreno en el arte del rap desde los 8 anos. A los 16 ya competia contra veteranos en las plazas de Buenos Aires."),
    ("Nicki Nicole","Soprano","soprano","Trap Argentina","AR",
     "Nicol Denise Cucculelli tiene 24 anos y es la voz femenina mas importante del trap argentino. Su soprano con actitud ha roto todos los prejuicios del genero.",
     "Lanzo su primer EP desde el cuarto de su casa en Rosario a los 17 anos. Spotify la detecto como artista emergente en menos de un mes."),
    ("Cazzu","Soprano","soprano","Trap Argentina","AR",
     "Julia Cavazos es la 'Nena Trampa'. Con una voz aguda y un flow agresivo, es la reina del trap femenino en America Latina.",
     "Nacio en Jujuy, en el norte de Argentina, y se fue a Buenos Aires sola a los 17 anos para perseguir su sueno musical."),
    ("Rusherking","Baritono","baritono","Trap Argentina","AR",
     "Thomas Nicolai nacio en Santiago del Estero y llego a Buenos Aires sin nada. Hoy es uno de los jovenes mas populares del trap argentino.",
     "Fue novio de Maria Becerra durante anos. Su ruptura publica en 2023 genero tanta atencion mediatica como sus propias canciones."),
    ("FMK","Baritono","baritono","Trap Argentina","AR",
     "FMK son tres amigos de Mar del Plata que llevan haciendo musica juntos desde el colegio. Su energia en directo es contagiosa.",
     "Su nombre son las iniciales de sus apodos: 'Funiculi', 'Mikky' y 'Komeback'. Se les ocurrio el nombre en un recreo del instituto."),
    ("Maria Becerra","Soprano","soprano","Trap / Pop","AR",
     "Maria Becerra es la artista argentina femenina mas escuchada en streaming. Su soprano potente y su presencia escencial la convierten en figura global.",
     "Empezo haciendo videos de YouTube en su cuarto en Quilmes a los 15 anos. Hoy actua en el Madison Square Garden de Nueva York."),
    ("Eladio Carrion","Baritono","baritono","Trap / Reggaeton","PR",
     "Eladio Carrion tiene una de las voces de baritono mas peculiares del urbano latino. Su estilo pausado y reflexivo contrasta con el trap mas agresivo.",
     "Estudio Ciencias Politicas en la Universidad de Puerto Rico. Sus letras tienen una profundidad filosofica poco comun en el genero."),
    # ── REGGAETON / URBANO LATINO ─────────────────────────────────────────────
    ("Peso Pluma","Tenor","tenor","Corridos Tumbados","MX",
     "Hassan Emilio Kabande Laija mezcla sierrenio con trap y R&B. Su voz de tenor directa redefinio el regional mexicano para la Generacion Z.",
     "Su apodo 'Peso Pluma' refleja su caracter: ligero pero con impacto brutal. Sus rivales en el barrio le pusieron el mote."),
    ("Natanael Cano","Tenor","tenor","Corridos Tumbados","MX",
     "Nathanael Ruben Cano Berrelleza fue el primero en popularizar los corridos tumbados. Su voz de tenor nasal es inconfundible.",
     "Fue fichado por una disquera a los 17 anos tras publicar sus corridos en YouTube desde el pueblo de Los Mochis, Sinaloa."),
    ("Junior H","Baritono","baritono","Corridos Sierrenios","MX",
     "Antonio Herrera Perez es el rostro del 'sad sierrenio'. Su voz grave conecta emocionalmente con millones de fans.",
     "El termino 'sad sierrenio' fue acunado por sus propios fans en TikTok para describir el efecto emocional de sus canciones."),
    ("Eslabon Armado","Tenor","tenor","Corridos Romanticos","MX",
     "Pedro Tovar lidera a Eslabon Armado, el grupo que popularizo los corridos romanticos entre la Generacion Z latina en Estados Unidos.",
     "Se formaron en Los Angeles, con padres migrantes mexicanos. Cantan sobre amor y vida cotidiana en los dos idiomas."),
    ("Fuerza Regida","Baritono","baritono","Corridos Tumbados","MX",
     "Jesus Ortiz Paz lidera a Fuerza Regida, uno de los grupos de corridos tumbados mas influyentes. Su estilo mezcla lo tradional con el trap.",
     "El grupo nacio en San Bernardino, California, donde hay una gran comunidad de migrantes del estado de Sinaloa."),
    ("Anuel AA","Baritono","baritono","Trap Latino","PR",
     "Emmanuel Gazmey Santiago popularizo el trap latino. Voz de baritono oscura con mucha grit y presencia vocal.",
     "Grabo su album 'Real Hasta la Muerte' estando en prision, usando un telefono de contrabando."),
    ("Myke Towers","Baritono","baritono","Reggaeton / Trap","PR",
     "Michael Anthony Torres Monge tiene una voz de baritono suave con un flow melodico que mezcla reggaeton, trap y R&B.",
     "Su nombre viene de Michael Jordan: 'Myke' por Michael y 'Towers' porque era el mas alto del equipo de baloncesto de su colegio."),
    ("Rauw Alejandro","Tenor","tenor","Reggaeton / R&B","PR",
     "Raul Alejandro Ocasio Ruiz es conocido por su voz de tenor limpia y sus coreografias. Considerado el 'principe del pop urbano' latino.",
     "Fue jugador de futbol federado y estaba a punto de firmar por un equipo de primera cuando decidio dedicarse a la musica."),
    ("Ozuna","Tenor","tenor","Reggaeton / Pop","PR",
     "Juan Carlos Ozuna Rosado, 'El Negrito Ojos Claros'. Su voz de tenor dulce lo convirtio en el artista de reggaeton mas exitoso de 2017-2018.",
     "Tiene tatuajes en casi todo el cuerpo, incluyendo los parpados. Dice que cada tatuaje cuenta una historia de su vida."),
    ("Daddy Yankee","Baritono","baritono","Reggaeton","PR",
     "Ramon Luis Ayala Rodriguez, 'El Cangri', es el padrino del reggaeton. 'Gasolina' (2004) hizo despegar al genero mundialmente.",
     "'Gasolina' fue rechazada por varias disqueras. Se convirtio en la cancion de reggaeton mas vendida de la historia."),
    ("Don Omar","Baritono","baritono","Reggaeton","PR",
     "William Omar Landrón Rivera es 'El Rey del Reggaeton'. Sus batallas musicales con Daddy Yankee son legendarias en la historia del genero.",
     "Su nombre artistico 'Don Omar' lo eligio porque queria proyectar autoridad y respeto desde el principio."),
    ("Wisin","Baritono","baritono","Reggaeton","PR",
     "Juan Luis Morera Luna forma el duo Wisin & Yandel. Su voz mas grave junto al flow mas agudo de Yandel crearon el sonido definitivo del reggaeton clasico.",
     "Wisin & Yandel se separaron y reunieron varias veces. Cada reunion ha sido un evento masivo para los fans del reggaeton."),
    ("Jhay Cortez","Tenor","tenor","Reggaeton / Pop","PR",
     "Jesaias Feliciano Rivera tiene una de las voces mas versatiles del urbano latino. Su tenor agil va del reggaeton al pop mas suave.",
     "Antes de brillar como cantante, escribio hits para otros artistas como Justin Quiles y Farruko."),
    ("Sech","Baritono","baritono","Reggaeton","PA",
     "Carlos Jose De Icaza Pitti es el maximo representante del urbano panamanio. Su voz de baritono suave y romantica lo diferencia del reggaeton mas agresivo.",
     "Cuando grabo 'Otro Trago' con Darell, ninguno esperaba que se converteria en uno de los exitos mas grandes de 2019."),
    ("Nicky Jam","Baritono","baritono","Reggaeton","US/PR",
     "Nicolas Rivera Reyes, 'El Flaco', es una leyenda del reggaeton. Junto a Daddy Yankee y Don Omar construyo los cimientos del genero.",
     "En 2009 cayo en las drogas y desaparecio del mapa durante anos. Su regreso en 2014 con 'El Perdon' fue uno de los comebacks mas epicos de la historia."),
    ("Maluma","Baritono","baritono","Reggaeton / Pop","CO",
     "Juan Luis Londono Arias tiene la imagen mas trabajada del pop urbano latino. Voz de baritono con mucho carisma.",
     "Su nombre 'Maluma' es un acronimo de los nombres de su familia: MAria LUisa MAldonado."),
    ("J Balvin","Baritono","baritono","Reggaeton","CO",
     "Jose Alvaro Osorio Balvin fue el primero en llevar el reggaeton al publico masivo europeo y asiatico. Su imagen multicultural lo hizo global.",
     "Sufrio depresion severa en el punto algido de su fama. Su documental 'The Boy from Medellin' lo muestra con una honestidad brutal."),
    ("Manuel Turizo","Baritono","baritono","Bachata / Reggaeton","CO",
     "Manuel Andres Turizo Zapata tiene 22 anos y ya ha conquistado Latinoamerica con su bachata moderna. Voz de baritono suave con mucho soul.",
     "Empezo publicando covers en Instagram a los 14 anos. Su hermano mayor lo animo a escribir sus propias canciones."),
    ("Feid","Baritono","baritono","Urbano","CO",
     "Salomon Villada Hoyos es el rey del urbano colombiano actual. Su voz de baritono oscuro y su estilo visual unico lo han convertido en icono.",
     "Estudio produccion musical en Berklee Online antes de lanzarse como artista. Produce muchos de sus propios temas."),
    ("Blessd","Baritono","baritono","Trap Colombia","CO",
     "Jose Dario Gomez Lopez es el exponente mas importante del trap colombiano de la nueva generacion. Su estilo crudo lo diferencia.",
     "De nino vendia chicles en las calles de Medellin para ayudar a su familia. Hoy es el artista con mas streams de Colombia."),
    ("Mora","Baritono","baritono","Trap / Reggaeton","PR",
     "Edward Mora Rivera tiene una voz de baritono distintiva. Su estilo mezcla el trap mas oscuro con melodias de reggaeton pegadizas.",
     "Empezo publicando freestyles en SoundCloud a los 16 anos desde su barrio en Puerto Rico."),
    ("Farruko","Baritono","baritono","Reggaeton","PR",
     "Carlos Efren Reyes Rosado paso de ser pilar del reggaeton a convertirse en predicador cristiano en 2022, generando un terremoto en la industria.",
     "En pleno concierto en Miami paro la musica y pidio perdon al publico por haberse alejado de Dios. Al dia siguiente era tendencia mundial."),
    ("Lunay","Tenor","tenor","Reggaeton","PR",
     "Jeyvier Jimenez tiene una de las voces mas cristalinas del urbano latino joven. Su tenor brilla especialmente en las notas altas.",
     "Firmo su primer contrato discografico a los 17 anos, siendo uno de los artistas mas jovenes del circuito urbano latino."),
    ("Chencho Corleone","Baritono","baritono","Reggaeton / Trap","PR",
     "Jesus Manuel Castillo Arocho fue miembro del duo Plan B. Su baritono melodico y romantico lo ha convertido en referente del reggaeton romantico.",
     "Cuando Plan B se separo, muchos daban por terminada su carrera. 'Me Porto Bonito' con Bad Bunny le dio el mayor hit de su vida en solitario."),
    # ── RAP / HIP-HOP USA ───────────────────────────────────────────────────
    ("Drake","Baritono","baritono","Hip-Hop / R&B","CA",
     "Aubrey Drake Graham es el artista con mas records en la historia de Billboard. Su baritono calido entre rap y R&B lo hizo dominante durante una decada.",
     "Antes de ser rapero fue actor en la serie canadiense 'Degrassi', donde interpretaba a un jugador de baloncesto en silla de ruedas."),
    ("Kendrick Lamar","Baritono","baritono","Hip-Hop / Rap","US",
     "Kendrick Lamar Duckworth es el rapero mas aclamado de su generacion. Su baritono versatil le permite adoptar multiples personajes en sus albumes.",
     "Es el primer musico de hip-hop en ganar el Premio Pulitzer de Musica (2018) por su album 'DAMN.'."),
    ("Post Malone","Baritono","baritono","Hip-Hop / Pop","US",
     "Austin Richard Post mezcla el hip-hop con el pop y el rock. Su baritono melodico y sus tatuajes faciales son su imagen de marca.",
     "Su nombre 'Post Malone' viene de un generador de nombres de raperos que uso de broma a los 14 anos. Se quedo con el."),
    ("The Weeknd","Baritono","baritono","R&B / Pop","CA",
     "Abel Makkonen Tesfaye tiene una de las voces mas reconocibles del pop moderno. Su baritono oscuro con falsete agudo es su sello.",
     "Publico sus primeras canciones anonimamente en YouTube en 2010. El misterio fue clave para su lanzamiento."),
    ("J. Cole","Baritono","baritono","Hip-Hop Consciente","US",
     "Jermaine Lamarr Cole es conocido por su rap introspectivo y sus letras de consciencia social. Rara vez aparece en eventos de alfombra roja.",
     "Compro la casa de su infancia en Fayetteville, Carolina del Norte, y vive alli con su familia en vez de en una mansion de Los Angeles."),
    ("Travis Scott","Baritono","baritono","Hip-Hop / Trap","US",
     "Jacques Bermon Webster II es el maestro del 'Astroworld', un sonido de trap psicodelico unico. Sus conciertos son experiencias sensoriales totales.",
     "El nombre de su album 'Astroworld' viene de un parque de atracciones de Houston que cerraron cuando el era nino. Le rompio el corazon."),
    ("Future","Baritono","baritono","Trap / R&B","US",
     "Nayvadius DeMun Wilburn es el pionero del trap melodico. Su uso del autotune como instrumento emocional cambio el hip-hop para siempre.",
     "Lanzo tres albumes en tres semanas consecutivas en 2017: 'Future', 'HNDRXX' y la colabo con Drake 'What a Time to Be Alive'."),
    ("Lil Baby","Baritono","baritono","Trap","US",
     "Dominique Armani Jones paso de las calles de Atlanta a ser uno de los raperos mas ricos del mundo en menos de cinco anos.",
     "Empezo a rapear a los 21 anos tras salir de prision. Dos anos despues era uno de los artistas mas exitosos del mundo."),
    ("Tyler the Creator","Baritono","baritono","Hip-Hop / Neo-Soul","US",
     "Tyler Gregory Okonma es el artista mas versatil del hip-hop moderno. Ha pasado del rap agresivo al jazz y el soul con una coherencia artistica envidiable.",
     "Fundo el colectivo Odd Future a los 17 anos con sus amigos. Hoy es un empire: musica, moda, festivales y produccion."),
    ("A$AP Rocky","Baritono","baritono","Hip-Hop / Cloud Rap","US",
     "Rakim Athelaston Mayers define la estetica del 'cloud rap'. Es tan influyente en la moda como en la musica.",
     "Nacio en Harlem, Nueva York, y se crio en los proyectos. Su estetica de lujo es deliberadamente opuesta a sus origenes."),
    ("Eminem","Baritono","baritono","Hip-Hop / Rap","US",
     "Marshall Bruce Mathers III es el rapero blanco mas exitoso de la historia. Su velocidad de flow y su habilidad tecnica son legendarias.",
     "Fue rechazado en su primera batalla de rap. Tardo anos en ser aceptado por la escena de Detroit por no ser negro."),
    ("Jay-Z","Baritono","baritono","Hip-Hop","US",
     "Shawn Corey Carter es el rapero empresario mas exitoso. Su baritono posee una cualidad unica para contar historias de la calle con lucidez.",
     "Fundo Roc-A-Fella Records con un prestamo de 500 dolares porque las disqueras no querian saber nada de el."),
    ("Kanye West","Baritono","baritono","Hip-Hop / Gospel","US",
     "Ye es uno de los productores y artistas mas influyentes del siglo XXI. Su baritono nasal y sus samples de gospel crearon un genero propio.",
     "Grabo partes de su album 'College Dropout' con la mandibula rota y atada con alambre despues de un accidente de coche."),
    ("Rod Wave","Baritono","baritono","Soul Trap","US",
     "Rodarius Marcell Green mezcla el soul del sur de Estados Unidos con el trap moderno. Su baritono lleno de emocion lo hizo fenomeno viral.",
     "Grabo 'Heart on Ice' con un presupuesto casi nulo. El video se viralizo en TikTok y lo catapulto a la fama mundial."),
    ("Khalid","Baritono","baritono","R&B / Pop","US",
     "Khalid Donnel Robinson tiene 26 anos pero ya es un veterano del R&B moderno. Su baritono juvenil conecta especialmente con la Generacion Z.",
     "Publico 'Location' el mismo dia que empezo la universidad en El Paso, Texas. En semanas era viral y tuvo que dejar los estudios."),
    ("Giveon","Bajo Baritono","bajo-baritono","R&B","US",
     "Giveon Dezmann Evans tiene una de las voces mas graves del R&B moderno. Su bajo-baritono evoca a los grandes crooners de los anos 50.",
     "Aprendio a cantar imitando a Barry White en el salon de su casa. Sus vecinos le pedian que cantara en los picnics del barrio."),
    ("Anderson Paak","Baritono","baritono","R&B / Funk","US",
     "Brandon Paak Anderson es una de las voces mas completas de su generacion. Canta y toca la bateria al mismo tiempo en sus directos.",
     "Trabajo como cuidador de una granja de marihuana medicinal en California mientras grababa sus primeros albums. La granja cerro y le dejaron sin trabajo."),
    ("SZA","Mezzo-soprano","mezzosoprano","R&B / Soul","US",
     "Solana Imani Rowe tiene una de las voces mas singulares del R&B moderno. Su mezzo oscuro y su manera de frasear son completamente originales.",
     "Estuvo casi cinco anos sin sacar musica nueva tras 'CTRL'. Sus fans hicieron campanas en redes sociales para que lanzara nuevo material."),
    ("Frank Ocean","Baritono","baritono","R&B / Soul","US",
     "Christopher Edwin Breaux es el artista de R&B mas influyente de su generacion. Su baritono introvertido y sus letras sobre identidad lo hacen unico.",
     "Desaparecio cuatro anos entre 'Channel Orange' y 'Blonde'. Durante ese tiempo nadie sabia nada de el. Cuando volvio, el mundo se paralizo."),
    # ── POP LATINOAMERICA ─────────────────────────────────────────────────────
    ("Carlos Vives","Baritono","baritono","Vallenato / Pop","CO",
     "Carlos Eduardo Vives Restrepo es la leyenda viva del vallenato modernizado. Su baritono calido y su energia en el escenario son legendarios.",
     "Estudio teatro antes que musica. Su primer trabajo fue actuar en telenovelas colombianas, donde interpreto a Carlos Gardel."),
    ("Juan Luis Guerra","Tenor","tenor","Bachata / Merengue","DO",
     "Juan Luis Guerra Seijas es el mas grande musico dominicano de todos los tiempos. Su tenor lirico brilla en el merengue y en las baladas mas intimas.",
     "Estudio jazz en el Berklee College of Music en Boston antes de regresar a la Republica Dominicana a revolucionar el merengue."),
    ("Juanes","Tenor","tenor","Rock / Pop","CO",
     "Juan Esteban Aristizabal Vasquez es la voz del rock en espanol de nueva generacion. 22 Latin Grammy lo avalan como el artista colombiano mas premiado.",
     "Sus primeros anos en la musica fueron en el grupo Ekhymosis, una banda de metal de Medellin que nada tenia que ver con su estilo actual."),
    ("Marc Anthony","Tenor","tenor","Salsa / Pop","US",
     "Marco Antonio Muniz es el artista de salsa en vivo mas taquillero del mundo. Su tenor potente y emotivo ha vendido mas de 12 millones de discos.",
     "La industria le dijo que era demasiado flaco y feo para triunfar. Se lo dijeron varias veces. Hoy es la voz mas reconocida de la salsa."),
    ("Ricky Martin","Tenor","tenor","Pop / Salsa","PR",
     "Enrique Martin Morales empezo en el grupo Menudo a los 12 anos. Su tenor vibrante y su baile han sido su sello durante 40 anos de carrera.",
     "La revelacion de su homosexualidad en 2010 fue un momento historico para la visibilidad LGBTQ+ en el mundo latino."),
    ("Enrique Iglesias","Tenor","tenor","Pop / Dance","ES",
     "Enrique Miguel Iglesias Preysler es el artista espanol con mas exito en Estados Unidos. Su tenor romantico ha dominado las listas durante tres decadas.",
     "Empezo a grabar en secreto porque su padre, el cantante Julio Iglesias, no queria que siguiera sus pasos. Uso un pseudonimo al principio."),
    ("Camilo","Tenor","tenor","Pop / Vallenato","CO",
     "Camilo Echeverry es uno de los compositores mas prolificos del pop en espanol. Sus letras llenas de detalles cotidianos sobre el amor lo han hecho fenomeno global.",
     "Tiene un ritual antes de cada concierto: escribe el nombre de cada ciudad en un papel y lo guarda en su bolsillo durante toda la actuacion."),
    ("Sebastian Yatra","Tenor","tenor","Pop / Reggaeton","CO",
     "Sebastian Yatra Cadavid tiene una de las voces de tenor mas populares del pop latino actual. Su paso por Broadway mostro su versatilidad.",
     "Habla ingles con acento americano perfecto, lo que le abre las puertas del mercado anglosajson."),
    ("Alejandro Fernandez","Baritono","baritono","Ranchera / Pop","MX",
     "Alejandro Fernandez, el 'Potrillo', es el heredero de la tradicion de Vicente Fernandez. Su baritono puede tanto en la ranchera como en el pop.",
     "Crecio literalmente en el escenario, acompanando a su padre Vicente desde los 5 anos."),
    ("Vicente Fernandez","Baritono","baritono","Ranchera","MX",
     "Vicente Fernandez Gomez, 'Chente', es el rey de la ranchera mexicana. Su baritono ronco y poderoso es el sonido del alma de Mexico.",
     "Trabajo de lavaplatos en Estados Unidos antes de ser famoso. Rechazo un trasplante de higado por miedo a perder su voz. Murio a los 81 anos en 2021."),
    ("Luis Miguel","Tenor","tenor","Pop / Bolero","MX",
     "Luis Miguel Gallego Basteri, 'El Sol de Mexico', tiene el tenor mas reconocible del pop latinoamericano. Sus directos son leyenda.",
     "Debia hacer el servicio militar en Mexico a los 18. Fue exonerado porque su popularidad era tan grande que el gobierno temia disturbios."),
    ("Shakira","Mezzo-soprano","mezzosoprano","Pop / Rock","CO",
     "Shakira Isabel Mebarak Ripoll tiene una voz de mezzo con vibratos unicos y una presencia escenica que combina musica y danza de manera inigualable.",
     "Su profesora de canto en el colegio le dijo que no podia cantar. Hoy es la artista latina con mas seguidores en Instagram de la historia."),
    ("Karol G","Soprano","soprano","Reggaeton / Pop","CO",
     "Carolina Giraldo Navarro, 'La Bichota', es la artista femenina de reggaeton mas exitosa de la historia. Ha redefinido el rol de la mujer en el urbano latino.",
     "'Manana Sera Bonito' fue el primer album en espanol de una artista femenina en llegar al numero 1 en el chart de albumes de Billboard."),
    ("Kali Uchis","Soprano","soprano","R&B / Pop","CO",
     "Diana Milena Real nacio en Colombia pero crecio en Virginia. Su soprano etereo mezcla el soul de los 60 con el R&B contemporaneo.",
     "De adolescente vivio en el coche de sus padres durante varios meses. Esa experiencia la plasmo en su primer EP."),
    ("Anitta","Soprano","soprano","Funk Carioca / Pop","BR",
     "Larissa de Macedo Machado es la artista brasilena mas exitosa. Su soprano energetico y su dominio del funk carioca la han convertido en fenomeno global.",
     "Crecio en la favela Honorio Gurgel de Rio de Janeiro. Su madre vendia comida en la calle para que ella pudiera tomar clases de danza."),
    ("Nathy Peluso","Mezzo-soprano","mezzosoprano","Pop / Jazz","AR",
     "Natalia Peluso mezcla el jazz, el hip-hop y la electronica en un coctel completamente original. Su mezzo y su dominio vocal son de conservatorio.",
     "Estudio en el Conservatorio Superior de Musica Manuel de Falla en Buenos Aires antes de mudarse a Barcelona."),
    # ── POP ESPANOL ──────────────────────────────────────────────────────────
    ("Rosalia","Mezzo-soprano","mezzosoprano","Flamenco / Pop","ES",
     "Rosalia Vila Tobella fusiono el flamenco mas puro con la electronica y el R&B moderno. Su tecnica y su quejio son unicos.",
     "Estudio flamenco en el Conservatorio de Barcelona con beca. Su profesora le decia que tenia demasiada 'rabia' para el flamenco clasico."),
    ("Aitana","Soprano","soprano","Pop","ES",
     "Aitana Ocana Morales salto a la fama en OT 2017. Su soprano brillante la ha convertido en la artista pop espanola mas importante de su generacion.",
     "Llego segunda en OT 2017, pero fue quien mas discos vendio y mas streams genero de toda su promocion."),
    ("Alejandro Sanz","Tenor","tenor","Pop / Flamenco","ES",
     "Alejandro Sanchez Pizarro tiene una de las voces de tenor mas reconocibles del pop en espanol. Sus falsetes y su conexion emocional son inimitables.",
     "Empezo tocando guitarra en los tablaos flamencos de Madrid con 15 anos para ganarse la vida."),
    ("Pablo Alboran","Tenor","tenor","Pop","ES",
     "Pablo Morales Morales tiene una voz de tenor suave y cristalina que brilla en las baladas pop. Salto a la fama con 'Solamente Tu' a los 21 anos.",
     "Publico su primera maqueta en MySpace. Universal Espana la escucho y le ofrecio un contrato sin haberle visto actuar."),
    ("David Bisbal","Tenor","tenor","Pop / Flamenco","ES",
     "David Bisbal Ferre nacio en Almeria y compagina el pop con el flamenco. Es uno de los artistas espanoles con mas exito internacional.",
     "Fue segundo en OT 2001 pero el mas exitoso a largo plazo. Su rivalidad con David Bustamante fue uno de los grandes relatos del programa."),
    ("Ana Mena","Soprano","soprano","Pop / Electronica","ES",
     "Ana Mena Rojas de Estepona debuto con 7 anos como actriz. Su soprano pop y su versatilidad entre el espanol y el italiano la hacen unica.",
     "Hablo italiano con fluidez para grabar 'Da Zero a Cento' con Fred De Palma, que fue numero 1 en Italia durante semanas."),
    ("Beret","Tenor","tenor","Pop / R&B","ES",
     "Jose Gonzalez Garcia tiene una voz de tenor suave con mucho soul. Es el compositor detras de algunos de los mayores hits del pop espanol.",
     "Empezo en YouTube haciendo covers con guitarra acustica. Sus versiones virales acumularon millones de vistas antes de lanzar material propio."),
    ("Manuel Carrasco","Tenor","tenor","Pop / Rock","ES",
     "Manuel Carrasco Gutierrez de Bonares (Huelva) es uno de los grandes del pop espanol. Su tenor potente y sus directos llenos de energia llenan estadios.",
     "Fue finalista de OT 2003. Hoy llena el estadio Olimpico de Barcelona -55.000 personas- durante varios dias seguidos."),
    ("Morat","Tenor","tenor","Pop / Indie","CO",
     "El cuarteto colombiano Morat tiene a Juan Pablo Villamil como frontman con voz de tenor calido. Son uno de los grupos latinoamericanos con mas exito en Espana.",
     "Se conocieron en el colegio Gimnasio Moderno de Bogota. Una gira por Espana los convirtio en idolos del pop iberoamericano."),
    ("Melendi","Tenor","tenor","Pop / Flamenco","ES",
     "Ramon Melendi Espina nacio en Oviedo y es uno de los artistas mas queridos del pop espanol. Su mezcla de flamenco y pop romantico es inimitable.",
     "Fue rechazado en OT. Le dijeron que no tenia lo que hay que tener. Hoy es uno de los artistas espanoles con mas discos de platino."),
    ("El Arrebato","Baritono","baritono","Flamenco / Pop","ES",
     "Javier Miras Torres nacio en Sevilla y es el rey del 'nuevo flamenco' romantico. Su voz profunda y sus letras de amor han conquistado a varias generaciones.",
     "Estuvo a punto de dejarlo todo antes de su primer gran exito. Un productor que le escucho en un bar de Sevilla le convencio de grabar un demo."),
    ("Maluma","Baritono","baritono","Reggaeton / Pop","CO",
     "Juan Luis Londono Arias tiene la imagen mas trabajada del pop urbano latino. Voz de baritono con mucho carisma.",
     "Su nombre 'Maluma' es un acronimo de los nombres de su familia: MAria LUisa MAldonado."),
    # ── POP FEMENINO INTERNACIONAL ────────────────────────────────────────────
    ("Adele","Mezzo-soprano","mezzosoprano","Soul / Pop","GB",
     "Adele Laurie Blue Adkins tiene la voz mas reconocida del pop mundial. Su mezzosoprano oscuro convierte cada balada en un evento emocional.",
     "'Someone Like You' fue escrita en una sola noche despues de que la dejara su novio. Lo grabo en una toma, llorando de verdad."),
    ("Billie Eilish","Soprano","soprano","Pop / Indie","US",
     "Billie Eilish Pirate Baird O'Connell revoluciono el pop con su estetica oscura y su soprano susurrado. Grabo su primer album en el dormitorio de su hermano.",
     "Su cancion 'Ocean Eyes' fue grabada para una clase de danza de su hermano. La publicaron en SoundCloud y en dias tenia millones de reproducciones."),
    ("Taylor Swift","Soprano","soprano","Country / Pop","US",
     "Taylor Alison Swift es la artista mas influyente de su generacion. Su soprano claro y su capacidad de contar historias la han hecho la artista mas rentable de la historia.",
     "Se mudo a Nashville con 14 anos convenciendo a sus padres. Tocaba guitarra en todos los bares que la dejaban entrar."),
    ("Ariana Grande","Soprano","soprano","Pop / R&B","US",
     "Ariana Grande-Butera tiene un rango vocal de cuatro octavas. Sus sopranos y whistle register son legendarios.",
     "Empezo como actriz en Broadway a los 15 anos. Su papel en 'Victorious' de Nickelodeon fue clave para lanzar su carrera musical."),
    ("Dua Lipa","Mezzo-soprano","mezzosoprano","Pop / Dance","GB",
     "Dua Lipa tiene una mezzosoprano grave y fria que encaja perfectamente con el disco-pop que produce. Domino el mercado pop mundial con 'Future Nostalgia'.",
     "De adolescente fue modelo en Londres para pagar las clases de canto. Sus fotos de esa epoca circulan todavia por internet."),
    ("Olivia Rodrigo","Soprano","soprano","Pop / Rock","US",
     "Olivia Isabel Rodrigo salto a la fama con 17 anos con 'drivers license'. Su soprano emocional conecto con toda una generacion.",
     "'drivers license' lo escribio en una hora despues de que le negaran el carne de conducir por segunda vez."),
    ("Sabrina Carpenter","Soprano","soprano","Pop","US",
     "Sabrina Ann Lynn Carpenter tiene una soprano brillante y un sentido del humor acido en sus letras. Su album 'Short n' Sweet' la catapulto al top mundial.",
     "Mide 1,57 metros y ha convertido su estatura en parte de su personalidad artistica."),
    ("Doja Cat","Mezzo-soprano","mezzosoprano","Hip-Hop / Pop","US",
     "Amala Ratna Zandile Dlamini mezcla el rap, el pop y el R&B. Su mezzosoprano versatil puede desde el rap mas tecnico hasta baladas.",
     "Publico 'Mooo!' -una cancion sobre ser una vaca- como broma en 2018. Se hizo tan viral que se convirtio en su primer gran exito."),
    ("Beyonce","Mezzo-soprano","mezzosoprano","R&B / Pop","US",
     "Beyonce Giselle Knowles-Carter es la artista mas premiada en la historia de los Grammy (32 premios). Su mezzo y su dominio del escenario son insuperables.",
     "Fue rechazada en la primera ronda de audiciones de Star Search con 10 anos. Le dijeron que no tenia lo que hay que tener."),
    ("Chappell Roan","Soprano","soprano","Pop / Synth","US",
     "Kayleigh Rose Amstutz ha creado uno de los personajes artisticos mas elaborados del pop. Su soprano poderoso recuerda a Kate Bush y Cyndi Lauper.",
     "Trabajo de camarera mientras grababa su album debut. Tuvo que pedir prestado el dinero para el video de 'Good Luck Babe!'."),
    ("Tyla","Soprano","soprano","Afrobeats / Pop","ZA",
     "Tyla Laura Seethal gano el Grammy a Mejor Artista Africana en 2024. Su soprano suave de origen sudafricano mezcla el afrobeats con el R&B.",
     "'Water' fue grabada en un dia en Johannesburgo. El challenge de TikTok la viralizo en todo el mundo."),
    ("Lady Gaga","Mezzo-soprano","mezzosoprano","Pop / Rock","US",
     "Stefani Joanne Angelina Germanotta tiene un rango vocal de tres octavas. Es la unica artista en haber ganado un Grammy, Oscar, Emmy y BAFTA.",
     "Fue despedida de su disquera a los pocos meses de firmar. En ese momento escribio 'Just Dance' y la historia cambio."),
    ("Rihanna","Mezzo-soprano","mezzosoprano","Pop / R&B","BB",
     "Robyn Rihanna Fenty es la artista mas rica del mundo de la musica, gracias principalmente a su imperio de belleza Fenty Beauty.",
     "Fue descubierta con 16 anos en Barbados. Su primer single 'Pon de Replay' fue grabado cuando todavia era una adolescente."),
    ("Selena Gomez","Soprano","soprano","Pop","US",
     "Selena Marie Gomez tiene una soprano suave y accesible que conecta emocionalmente. Su carrera de actriz y cantante la han convertido en fenomeno global.",
     "Tuvo que someterse a un transplante de rinon en 2017. Su amiga Francia Raisa fue la donante. Se lo guardo en secreto durante meses."),
    ("Miley Cyrus","Mezzo-soprano","mezzosoprano","Pop / Rock","US",
     "Destiny Hope Cyrus ha reinventado su imagen varias veces. Su mezzo ronco y poderoso brilla especialmente en el rock y el pop mas sofisticado.",
     "Grabo 'Flowers' durante una semana en enero, el dia del cumpleanos de su exmarido Liam Hemsworth. Se convirtio en el single con debut mas rapido de la historia."),
    ("Lorde","Mezzo-soprano","mezzosoprano","Indie Pop","NZ",
     "Ella Yelich-O'Connor escribio 'Royals' con 15 anos. Su mezzo profundo y su sofisticacion lirica son insoluales para alguien de su edad.",
     "Universal Music la firmo con 13 anos. Le dieron una suite en Nueva Zelanda para que desarrollara su sonido. 'Pure Heroine' cambio el pop para siempre."),
    ("Lana Del Rey","Mezzo-soprano","mezzosoprano","Indie Pop / Cinematico","US",
     "Elizabeth Woolridge Grant tiene la voz mas cinematica del pop moderno. Su mezzo nostalgico y sus letras de hollywood decadente son su sello.",
     "Cambio su nombre de 'Lizzy Grant' a 'Lana Del Rey' porque queria que sonara como America, a mujeres hermosas y motocicletas."),
    ("Demi Lovato","Mezzo-soprano","mezzosoprano","Pop / Rock","US",
     "Demetria Devonne Lovato tiene una de las voces de mezzo mas potentes del pop actual. Su rango y su control vocal la ponen entre las mejores de su generacion.",
     "Canto el himno de Estados Unidos en la Super Bowl LV. Dijo que habia ensayado mas de 100 horas para ese unico momento."),
    ("Jennifer Lopez","Mezzo-soprano","mezzosoprano","Pop / Salsa","US",
     "Jennifer Lynn Lopez, 'J.Lo', es la artista latina mas influyente de los ultimos 30 anos. Actriz, cantante, bailarina y empresaria.",
     "Antes de ser famosa trabajo como bailarina de fondo en 'In Living Color'. La despidieron varias veces antes de que la fichara Selena Quintanilla."),
    ("P!nk","Mezzo-soprano","mezzosoprano","Pop / Rock","US",
     "Alecia Beth Moore tiene una mezzosoprano poderosa y cruda que brilla en el rock y el pop. Su 'Raise Your Glass' es himno de una generacion.",
     "Empezo cantando en clubes nocturnos de Filadelfia a los 14 anos. Sus padres pensaban que era una fase."),
    ("Alicia Keys","Mezzo-soprano","mezzosoprano","R&B / Soul","US",
     "Alicia Augello Cook empezo a tocar el piano a los 7 anos. Sus mezzo de pianista-compositora ha marcado la historia del R&B.",
     "Toco el himno de Estados Unidos en el Super Bowl XLVII con un piano de cola en el campo. Considerado uno de los mejores momentos musicales del evento."),
    ("Amy Winehouse","Contralto","contralto","Jazz / Soul","GB",
     "Amy Jade Winehouse fue una de las grandes voces del jazz del siglo XXI. Su contralto oscuro era inusual para alguien de su generacion. Fallecio con 27 anos.",
     "Fue rechazada en la National Youth Music Theatre por ser 'demasiado gorda y sensual'. El rechazo la empujo hacia el jazz y el soul."),
    ("Florence Welch","Mezzo-soprano","mezzosoprano","Indie Rock / Art Pop","GB",
     "Florence Leontine Mary Welch tiene una de las voces mas poderosas del rock alternativo. Su mezzo dramatico convierte cada cancion en un ritual.",
     "Tuvo una experiencia cercana a la muerte a los 18 anos. 'Dog Days Are Over' la escribio para exorcizar ese momento."),
    ("Halsey","Mezzo-soprano","mezzosoprano","Pop / Alternative","US",
     "Ashley Nicolette Frangipane tiene una mezzo andrógina muy distintiva. Ha hablado abiertamente de su bipolaridad y su lucha mental.",
     "Lanzo sus primeros temas desde el metro de Nueva York, donde dormia despues de que sus padres la echaran de casa."),
    ("Victoria Monet","Mezzo-soprano","mezzosoprano","R&B / Funk","US",
     "Victoria Monet McCants empezo como compositora de Ariana Grande. Su debut en solitario llego tarde pero con una madurez vocal impresionante.",
     "Escribio 'Thank U, Next' para Ariana Grande en 30 minutos. Hoy es una de las compositoras mas cotizadas de Hollywood."),
    ("Sam Smith","Mezzo-soprano","mezzosoprano","Pop / Soul","GB",
     "Samuel Frederick Smith ha ganado cuatro Grammy y un Oscar. Su voz no binaria es de una emotividad poco comun en el pop actual.",
     "La cancion 'Stay With Me' fue escrita despues de pasar una noche con alguien cuyo nombre no sabia. Se convirtio en una de las baladas mas reconocibles del siglo XXI."),
    # ── POP / ROCK INTERNACIONAL ─────────────────────────────────────────────
    ("Ed Sheeran","Tenor","tenor","Pop / Folk","GB",
     "Edward Christopher Sheeran es el artista en solitario con mas records de ventas en el Reino Unido. Su tenor versatil va del folk al hip-hop.",
     "Llego a Londres a los 17 anos con una guitarra y 200 libras y dormia en los bancos del metro. En 18 meses firmo con Atlantic Records."),
    ("Harry Styles","Tenor","tenor","Pop / Rock","GB",
     "Harry Edward Styles es el exmiembro de One Direction mas exitoso en solitario. Su tenor ha evolucionado del pop adolescente al rock de los 70.",
     "En la primera audicion de X Factor canto tan mal que los productores le pidieron que volviera. La segunda vez quedo finalista con One Direction."),
    ("Justin Bieber","Tenor","tenor","Pop / R&B","CA",
     "Justin Drew Bieber fue descubierto con 13 anos en YouTube. Su tenor juvenil muto hacia un sonido R&B maduro que ha mantenido su relevancia.",
     "Scooter Braun lo descubrio buscando videos de otra persona. Clico por error en un video de Justin cantando covers en el garaje de su casa."),
    ("Shawn Mendes","Tenor","tenor","Pop / Folk","CA",
     "Shawn Peter Raul Mendes empezo publicando covers en Vine con 14 anos. Su tenor claro y su guitarra acustica definen su sonido.",
     "Firmo con Island Records con 15 anos despues de que sus videos en Vine acumularan millones de reproducciones."),
    ("Bruno Mars","Tenor","tenor","Pop / Funk","US",
     "Peter Gene Hernandez tiene uno de los rangos vocales mas amplios del pop actual. Su tenor puede desde el funk mas agresivo hasta las baladas mas delicadas.",
     "Cuando llego a Los Angeles con 17 anos le cambiaron el nombre a 'Bruno Mars' porque dijeron que 'Peter Hernandez' no sonaba a estrella."),
    ("John Legend","Baritono","baritono","R&B / Soul","US",
     "John Roger Stephens es el quinto artista en la historia en ganar los cuatro grandes premios del entretenimiento: Emmy, Grammy, Oscar y Tony (EGOT).",
     "Se licencio en Literatura Inglesa en la Universidad de Pensilvania. Su nombre real es John Stephens; 'Legend' fue un apodo que le puso un amigo."),
    ("Usher","Tenor","tenor","R&B / Pop","US",
     "Usher Terry Raymond IV es el rey del R&B de los 2000. Su tenor agil y sus coreografias son el estandar del genero.",
     "Lil Jon escribio 'Yeah!' en un dia despues de que Usher le pusiera un plazo de 24 horas. Se convirtio en uno de los hits mas grandes de la decada."),
    ("Charlie Puth","Tenor","tenor","Pop / R&B","US",
     "Charles Otto Puth Jr. tiene oido absoluto. Su tenor limpio y su conocimiento musical de conservatorio le permiten producir y cantar al mas alto nivel.",
     "Fue diagnosticado con oido absoluto de nino despues de que sus padres se dieran cuenta de que tocaba canciones perfectas de oido desde los 4 anos."),
    ("Freddie Mercury","Tenor","tenor","Rock / Pop","GB",
     "Farrokh Bulsara tenia un rango vocal de cuatro octavas y era el performer en vivo mas electrizante de la historia del rock.",
     "Actuo en el Live Aid de 1985 durante 20 minutos. Los expertos lo califican como la mejor actuacion en vivo de la historia del rock."),
    ("David Bowie","Baritono","baritono","Rock / Art Pop","GB",
     "David Robert Jones creo personajes como Ziggy Stardust para explorar su rango vocal de baritono. Fue el artista de rock mas camaleonico de todos los tiempos.",
     "Sus ojos de diferentes colores no son geneticos. Quedaron asi tras una pelea de adolescente en que le dilato permanentemente la pupila izquierda."),
    ("Elvis Presley","Baritono","baritono","Rock / Country","US",
     "Elvis Aaron Presley, 'El Rey', tenia una voz de baritono con un rango de dos octavas y media. El artista mas influyente del siglo XX.",
     "Cuando fue a grabar al Sun Studio con 18 anos, pago el mismo la sesion: 4 dolares. La secretaria escribio en su ficha: 'No tiene nada especial'."),
    ("Michael Jackson","Tenor","tenor","Pop / R&B","US",
     "Michael Joseph Jackson es el artista mas vendido de la historia. Su tenor con falsete y sus innovaciones definieron el pop de los anos 80 y 90.",
     "Desarrollo el 'moonwalk' viendo bailar a Jeffrey Daniel. Lo practico en calcetines en el suelo de linóleo del estudio durante semanas."),
    ("Bruce Springsteen","Baritono","baritono","Rock","US",
     "Bruce Frederick Joseph Springsteen, 'The Boss', es el poeta del sueno americano. Su baritono aspero cuenta historias de trabajadores con honestidad brutal.",
     "En el album 'Born to Run' cambio la mezcla a las 3 de la madrugada despues de escucharlo durante semanas. Le costo 4 meses de trabajo extra."),
    ("Bob Dylan","Baritono","baritono","Folk / Rock","US",
     "Robert Allen Zimmerman tiene una de las voces mas reconocibles y discutidas de la historia. Su baritono nasal fue considerado terrible durante anos.",
     "Gano el Nobel de Literatura en 2016, el primer musico en recibirlo. Tardo semanas en responder a la Academia Sueca."),
    ("Liam Gallagher","Tenor","tenor","Rock / Britpop","GB",
     "Liam Gallagher es la voz mas reconocible del britpop. Su tenor nasal y agresivo fue el sonido de una generacion en los anos 90.",
     "Sus peleas con su hermano Noel estan catalogadas como algunas de las mas espectaculares de la historia del rock. Rompieron Oasis en un festival."),
    ("Matt Bellamy","Tenor","tenor","Rock / Art Rock","GB",
     "Matthew James Bellamy de Muse tiene un tenor dramatico y extremo. Sus notas mas agudas en concierto son parte de la leyenda del rock.",
     "Sus vecinos llamaban a la policia cuando ensayaba en casa de adolescente. Hoy actua en Wembley Stadium."),
    ("Chris Martin","Tenor","tenor","Rock / Pop","GB",
     "Christopher Anthony John Martin de Coldplay es conocido por su tenor claro y emocional. Es uno de los compositores de pop mas exitosos de su generacion.",
     "Conocio a su exmujer Gwyneth Paltrow en el backstage de un concierto. Le dio su numero diciendole que era su manager. No lo era."),
    ("Bono","Tenor","tenor","Rock / Pop","IE",
     "Paul David Hewson, Bono, de U2 tiene un tenor potente con mucha proyeccion. Ha convertido su figura artistica en vehiculo de activismo politico global.",
     "Su nombre de pila 'Bono' viene de un cartel de un audifono que habia en su barrio de Dublin: 'Bono Vox', que en latin significa 'buena voz'."),
    # ── FLAMENCO ─────────────────────────────────────────────────────────────
    ("Camaron de la Isla","Baritono","baritono","Flamenco","ES",
     "Jose Monje Cruz fue el cantaor que llevo el flamenco mas alla de sus limites. Su voz de baritono oscura y su quejio desgarrado son unicos en la historia.",
     "Su apodo 'Camaron' se lo puso un tendero de La Linea porque era rubio y palido. Nunca le gusto el apodo."),
    ("Enrique Morente","Baritono","baritono","Flamenco","ES",
     "Enrique Morente Cotelo fue el gran innovador del flamenco de la segunda mitad del siglo XX. Su baritono y su dominio de todos los palos eran legendarios.",
     "Colaboro con Sonic Youth y el grupo de rock Lagartija Nick. La fusion provoco escandalo entre los puristas. Hoy se considera un clasico."),
    ("Estrella Morente","Mezzo-soprano","mezzosoprano","Flamenco","ES",
     "Estrella Morente Carbonell es la hija de Enrique Morente y la cantaora mas importante de su generacion. Su mezzo flamenca tiene una profundidad irrepetible.",
     "Canto la muerte de su padre en el escenario tres semanas despues de perderlo. Se convirtio en el momento mas emocionalmente poderoso del flamenco del siglo XXI."),
    ("Nina Pastori","Soprano","soprano","Flamenco / Pop","ES",
     "Maria de los Angeles Paniagua Garcia nacio en San Fernando, Cadiz. Su soprano flamenca con aires de pop romantico la convirtio en fenomeno masivo en los 90.",
     "Grabo su primer disco a los 14 anos. Sus padres la acompanaban a todos los conciertos porque era menor de edad."),
    ("Diego El Cigala","Baritono","baritono","Flamenco / Bolero","ES",
     "Ramon El Cigala es el mejor embajador del flamenco en America Latina. Su colaboracion con Bebo Valdes fusiono el flamenco con el bolero cubano.",
     "Su album 'Lagrimas Negras' con Bebo Valdes fue grabado en una sola sesion de noche en un estudio de Madrid. Sin ensayos previos."),
    ("Pitingo","Tenor","tenor","Flamenco / Soul","ES",
     "Antonio Jesus Reyes Pacheco nacio en Huelva y fusiona el flamenco con el soul americano. Su cover de 'New York, New York' cantado por bulerías es legendario.",
     "James Brown fue su gran inspiracion. Cuando Brown vino a Espana, Pitingo se colo en el camerino a verle. Brown le invito a subir al escenario."),
    # ── R&B / SOUL / CLASICOS ──────────────────────────────────────────────
    ("Whitney Houston","Soprano","soprano","R&B / Pop","US",
     "Whitney Elizabeth Houston es considerada la mayor cantante de todos los tiempos. Su soprano era capaz de exprimir cada gota de emocion de cualquier cancion.",
     "Su version de 'I Will Always Love You' fue rechazada por Dolly Parton que no queria que la grabara nadie mas. Cuando la escucho, lloro."),
    ("Mariah Carey","Soprano","soprano","R&B / Pop","US",
     "Mariah Carey tiene el rango vocal mas amplio de cualquier artista comercial: cinco octavas y media. Su 'whistle register' es legendario.",
     "Cuando firmo con Columbia Records a los 18 anos, el presidente de la disquera escucho su demo en una fiesta y la siguio hasta la puerta para contratar."),
    ("Celine Dion","Soprano","soprano","Pop / R&B","CA",
     "Celine Marie Claudette Dion tiene una soprano de tres octavas con un control tecnico perfeccionista. Es la artista canadiense mas exitosa de la historia.",
     "Era la menor de 14 hermanos en una familia muy pobre del Quebec. Su madre envio una cassette al manager Rene Angelil, quien hipoteco su casa para producir su primer disco."),
    ("Aretha Franklin","Contralto","contralto","Soul / R&B","US",
     "Aretha Louise Franklin, 'La Reina del Soul', fue la primera mujer en ser incluida en el Rock and Roll Hall of Fame.",
     "Canto en el funeral de Martin Luther King Jr. en 1968. Tambien canto en la toma de posesion de Barack Obama en 2009, con 67 anos."),
    ("Stevie Wonder","Tenor","tenor","Soul / R&B","US",
     "Stevland Hardaway Morris es el artista con mas albumes consecutivos de los mejores de la historia. Su tenor de 3 octavas es uno de los mas completos del pop.",
     "Perdio la vista a los pocos dias de nacer por un exceso de oxigeno en la incubadora. Firmo con Motown Records a los 11 anos."),
    ("Ray Charles","Baritono","baritono","Soul / Blues","US",
     "Ray Charles Robinson fue el pionero del soul. Su baritono azucarado mezclo el gospel, el blues y el R&B de manera que nadie habia hecho antes.",
     "Perdio la vista a los 7 anos. Aprendio a leer musica en braille y a tocar el piano de memoria. Decia que la ceguera le permitia escuchar mejor."),
    ("Marvin Gaye","Tenor","tenor","Soul / R&B","US",
     "Marvin Pentz Gay Jr. fue el primer artista de Motown en tener control creativo total sobre su musica. 'What's Going On' cambio el soul para siempre.",
     "Motown rechazo 'What's Going On' inicialmente. Berry Gordy lo llamo el peor disco que habia escuchado. Marvin amenazo con no volver a grabar. Salio el disco."),
    ("Frank Sinatra","Baritono","baritono","Jazz / Pop","US",
     "Francis Albert Sinatra, 'Ol Blue Eyes', definio el estandar del pop americano. Su baritono era el sonido del siglo XX.",
     "En su primer concierto en el Paramount Theater de Nueva York en 1942, las fans histéricas arrancaron su ropa y lo dejaron casi desnudo en el escenario."),
    ("Tony Bennett","Baritono","baritono","Jazz / Pop","US",
     "Anthony Dominick Benedetto mantuvo su voz de baritono activo hasta los 95 anos, siendo diagnosticado con alzheimer. Su album con Lady Gaga fue grabado con la enfermedad avanzada.",
     "Tuvo un encontronazo con la mafia en los anos 50 porque se nego a cantar en eventos controlados por ellos. Lo pusieron en la lista negra durante anos."),
    ("Elvis Costello","Baritono","baritono","New Wave / Rock","GB",
     "Declan Patrick MacManus es uno de los compositores mas prolíficos y respetados del rock britanico. Su baritono versatil se adapta al rock, al jazz y a la musica de camara.",
     "Cambio su apellido a 'Costello' para que no se le asociara con su padre, el trompetista Ross MacManus."),
    # ── ROCK CLASICO ─────────────────────────────────────────────────────────
    ("Jim Morrison","Baritono","baritono","Rock / Blues","US",
     "James Douglas Morrison, 'The Lizard King', fue el baritono mas oscuro y literario del rock. Sus letras mezclan el existencialismo con el misticismo.",
     "Estudio cinematografia en UCLA antes de formas The Doors. Sus poemas los escribia en blocs de notas que siempre llevaba encima."),
    ("Mick Jagger","Tenor","tenor","Rock / Blues","GB",
     "Michael Philip Jagger es el frontman de los Rolling Stones. Su tenor con rasgos blues y su energia escenica son inimitables a sus 80 anos.",
     "Estudio en la London School of Economics antes de formar los Stones. Sus profesores decian que era uno de los estudiantes mas prometedores del curso."),
    ("Robert Plant","Tenor","tenor","Rock / Blues","GB",
     "Robert Anthony Plant de Led Zeppelin tiene el tenor mas poderoso de la historia del rock. Sus gritos agudos en 'Whole Lotta Love' son insuperables.",
     "Firmaron con su manager Peter Grant un contrato por el que ellos controlaban todo: mastering, portadas, giras. Algo inaudito en 1968."),
    ("Axl Rose","Tenor","tenor","Hard Rock","US",
     "William Bruce Rose Jr. tiene un rango vocal de mas de cinco octavas. Puede ir del registro de baritono profundo a notas de tenor agudisimas.",
     "Su nombre real es 'William Rose'. 'Axl' lo adopto porque es un anagrama de 'lax', que en argot significa borracho. Y 'Rose' es el apellido de su padrastro."),
    ("Kurt Cobain","Baritono","baritono","Grunge / Rock","US",
     "Kurt Donald Cobain de Nirvana llevo el rock alternativo al mainstream con 'Nevermind'. Su baritono ronco y su angustia existencial definieron una generacion.",
     "'Smells Like Teen Spirit' fue escrita en 15 minutos de improvisation en el local de ensayo. Al dia siguiente ya sabia que habian compuesto algo especial."),
    ("Morrissey","Baritono","baritono","Post-Punk / Indie","GB",
     "Steven Patrick Morrissey de The Smiths es el letrista mas influyente del post-punk britanico. Su baritono melancólico y sus letras ironicas son perfectamente reconocibles.",
     "Fundo The Smiths mandando una carta manuscrita a Johnny Marr. La carta era tan elocuente que Marr fue a buscarlo inmediatamente."),
]

# ─── Deduplicar ─────────────────────────────────────────────────────────────
seen = set()
ARTISTS_DEDUP = []
for a in ARTISTS:
    key = a[0].lower()
    if key not in seen:
        seen.add(key)
        ARTISTS_DEDUP.append(a)

def slug(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

def initials_svg(name, color="#7C4DFF"):
    parts = name.strip().split()
    ini = (parts[0][0] + (parts[-1][0] if len(parts)>1 else parts[0][1])).upper()
    return f"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%230d0a1f'/%3E%3Ctext x='200' y='240' font-family='Arial' font-weight='900' font-size='160' fill='{color.replace('#','%23')}' text-anchor='middle'%3E{ini}%3C/text%3E%3C/svg%3E"

def card_html(a):
    name, vtype, vkey, genre, country, desc, anecdote = a
    color = VOICE_COLORS.get(vkey, "#7C4DFF")
    s = slug(name)
    ini = initials_svg(name, color)
    safe_name = name.replace("'", "\\'").replace('"', '&quot;')
    return f'''        <a href="/artistas/{s}/" class="artist-card" data-name="{name.lower()}" data-type="{vkey}" data-genre="{genre.lower()}">
            <div class="card-img-wrap">
                <img src="{ini}" data-artist="{safe_name}" alt="{name}" loading="lazy" class="artist-img">
                <div class="card-badge" style="background:{color}33;border-color:{color}66;color:{color}">{vtype}</div>
            </div>
            <div class="artist-info">
                <h3>{name}</h3>
                <div class="artist-genre">{genre} &nbsp;&#x1F30D; {country}</div>
                <p class="artist-desc">{desc[:115]}...</p>
                <button class="anecdote-btn" onclick="event.preventDefault();toggleAnecdote(this)">Ver anecdota &#x25BC;</button>
                <div class="anecdote-text" style="display:none">{anecdote}</div>
            </div>
        </a>'''

cards = "\n".join(card_html(a) for a in ARTISTS_DEDUP)
vtypes = sorted(set(a[1] for a in ARTISTS_DEDUP))
genres = sorted(set(a[3].split(' / ')[0] for a in ARTISTS_DEDUP))
vtype_opts = "".join(f'<option value="{v.lower()}">{v}</option>' for v in vtypes)
genre_opts  = "".join(f'<option value="{g.lower()}">{g}</option>' for g in genres)

# Wikipedia URLs mapa
WIKI_MAP = {
    "Bad Bunny":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Bad_Bunny_2019.jpg/220px-Bad_Bunny_2019.jpg",
    "Peso Pluma":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Peso_Pluma_2023.jpg/220px-Peso_Pluma_2023.jpg",
    "Quevedo":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Quevedo_%28singer%29_2023.png/220px-Quevedo_%28singer%29_2023.png",
    "C. Tangana":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/C._Tangana_2021.png/220px-C._Tangana_2021.png",
    "Bizarrap":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Bizarrap_2023.jpg/220px-Bizarrap_2023.jpg",
    "Anuel AA":"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Anuel_AA_2020.jpg/220px-Anuel_AA_2020.jpg",
    "Myke Towers":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Myke_Towers_2022.jpg/220px-Myke_Towers_2022.jpg",
    "Rauw Alejandro":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/RauwAlejandro2022.jpg/220px-RauwAlejandro2022.jpg",
    "Jhay Cortez":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Jhay_Cortez_2022.jpg/220px-Jhay_Cortez_2022.jpg",
    "Ozuna":"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Ozuna_2017.jpg/220px-Ozuna_2017.jpg",
    "Nicky Jam":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Nicky_Jam_2018.jpg/220px-Nicky_Jam_2018.jpg",
    "Daddy Yankee":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Daddy_Yankee_-_Atlantic_2019.jpg/220px-Daddy_Yankee_-_Atlantic_2019.jpg",
    "Don Omar":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Don_Omar_%28cropped%29.jpg/220px-Don_Omar_%28cropped%29.jpg",
    "Maluma":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Maluma_2018.jpg/220px-Maluma_2018.jpg",
    "J Balvin":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/J_Balvin_2018.jpg/220px-J_Balvin_2018.jpg",
    "Feid":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Feid_2022.jpg/220px-Feid_2022.jpg",
    "Camilo":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Camilo_2020.jpg/220px-Camilo_2020.jpg",
    "Drake":"https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Drake_July_2016.jpg/220px-Drake_July_2016.jpg",
    "Kendrick Lamar":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Kendrick_Lamar_2018.jpg/220px-Kendrick_Lamar_2018.jpg",
    "Post Malone":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Post_Malone_2019.jpg/220px-Post_Malone_2019.jpg",
    "The Weeknd":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/The_Weeknd_2018.jpg/220px-The_Weeknd_2018.jpg",
    "Travis Scott":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Travis_Scott_2018.jpg/220px-Travis_Scott_2018.jpg",
    "Future":"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Future_%28musician%29_2018.jpg/220px-Future_%28musician%29_2018.jpg",
    "Eminem":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Eminem_2022.jpg/220px-Eminem_2022.jpg",
    "Jay-Z":"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Jay_Z_at_Cannes.jpg/220px-Jay_Z_at_Cannes.jpg",
    "Kanye West":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Kanye_West_2_--_2012.jpg/220px-Kanye_West_2_--_2012.jpg",
    "Tyler the Creator":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Tyler%2C_the_Creator_2019.jpg/220px-Tyler%2C_the_Creator_2019.jpg",
    "Frank Ocean":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Frank_Ocean_%282012%29.jpg/220px-Frank_Ocean_%282012%29.jpg",
    "SZA":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/SZA_2022.jpg/220px-SZA_2022.jpg",
    "Rosalia":"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Rosal%C3%ADa_%282019%29.jpg/220px-Rosal%C3%ADa_%282019%29.jpg",
    "Aitana":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Aitana_Los40_Music_Awards_2023.jpg/220px-Aitana_Los40_Music_Awards_2023.jpg",
    "Alejandro Sanz":"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Alejandro_Sanz_2019.jpg/220px-Alejandro_Sanz_2019.jpg",
    "Adele":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Adele_2016.jpg/220px-Adele_2016.jpg",
    "Billie Eilish":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Billie_Eilish_-_2019_by_Glenn_Francis.jpg/220px-Billie_Eilish_-_2019_by_Glenn_Francis.jpg",
    "Taylor Swift":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/191125_Taylor_Swift_at_the_2019_American_Music_Awards_%28cropped%29.jpg/220px-191125_Taylor_Swift_at_the_2019_American_Music_Awards_%28cropped%29.jpg",
    "Ariana Grande":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Ariana_Grande_in_2019.jpg/220px-Ariana_Grande_in_2019.jpg",
    "Dua Lipa":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Dua_Lipa_2018_%28cropped%29.jpg/220px-Dua_Lipa_2018_%28cropped%29.jpg",
    "Olivia Rodrigo":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Olivia_Rodrigo_2021.jpg/220px-Olivia_Rodrigo_2021.jpg",
    "Beyonce":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Beyonc%C3%A9_in_Cannes_%282012%29.jpg/220px-Beyonc%C3%A9_in_Cannes_%282012%29.jpg",
    "Sabrina Carpenter":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Sabrina_Carpenter_2023.jpg/220px-Sabrina_Carpenter_2023.jpg",
    "Doja Cat":"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Doja_Cat_2020.jpg/220px-Doja_Cat_2020.jpg",
    "Karol G":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Karol_G_2024.jpg/220px-Karol_G_2024.jpg",
    "Nathy Peluso":"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Nathy_Peluso_2021.jpg/220px-Nathy_Peluso_2021.jpg",
    "Jennifer Lopez":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Jennifer_Lopez_2019_at_Hustlers_Toronto_Premiere.jpg/220px-Jennifer_Lopez_2019_at_Hustlers_Toronto_Premiere.jpg",
    "Alicia Keys":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Alicia_Keys_2019.jpg/220px-Alicia_Keys_2019.jpg",
    "Amy Winehouse":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Amy_Winehouse_2007.jpg/220px-Amy_Winehouse_2007.jpg",
    "Camaron de la Isla":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Camarondelaisla.jpg/220px-Camarondelaisla.jpg",
    "Freddie Mercury":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Freddie_Mercury_performing_The_Works_Tour_in_New_Zealand.jpg/220px-Freddie_Mercury_performing_The_Works_Tour_in_New_Zealand.jpg",
    "David Bowie":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/David-Bowie_Chicago_2002-08-08_photoby_Adam-Bielawski_cropped.jpg/220px-David-Bowie_Chicago_2002-08-08_photoby_Adam-Bielawski_cropped.jpg",
    "Elvis Presley":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Elvis_Presley_promoting_Jailhouse_Rock.jpg/220px-Elvis_Presley_promoting_Jailhouse_Rock.jpg",
    "Michael Jackson":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Michael_Jackson_in_1988.jpg/220px-Michael_Jackson_in_1988.jpg",
    "Harry Styles":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Harry_Styles_2017_crop.jpg/220px-Harry_Styles_2017_crop.jpg",
    "Ed Sheeran":"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Ed_Sheeran_in_2017.jpg/220px-Ed_Sheeran_in_2017.jpg",
    "Bruce Springsteen":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Bruce_Springsteen_2012.jpg/220px-Bruce_Springsteen_2012.jpg",
    "Sam Smith":"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Sam_Smith_2014.jpg/220px-Sam_Smith_2014.jpg",
    "Bruno Mars":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Bruno_Mars_2021.jpg/220px-Bruno_Mars_2021.jpg",
    "Justin Bieber":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Justin_Bieber_in_2015.jpg/220px-Justin_Bieber_in_2015.jpg",
    "Shawn Mendes":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Shawn_Mendes_2019.jpg/220px-Shawn_Mendes_2019.jpg",
    "Shakira":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Shakira_2009.jpg/220px-Shakira_2009.jpg",
    "Rihanna":"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Rihanna_-_7Seven_Nation_Army_photoshoot.jpg/220px-Rihanna_-_7Seven_Nation_Army_photoshoot.jpg",
    "Lady Gaga":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Lady_Gaga_2019.jpg/220px-Lady_Gaga_2019.jpg",
    "Selena Gomez":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Selena_Gomez_2015.jpg/220px-Selena_Gomez_2015.jpg",
    "Miley Cyrus":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Miley_Cyrus_2019.jpg/220px-Miley_Cyrus_2019.jpg",
    "Whitney Houston":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Whitney_Houston_Welcome_Home_Heroes_1991.jpg/220px-Whitney_Houston_Welcome_Home_Heroes_1991.jpg",
    "Mariah Carey":"https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Mariah_Carey_2019.jpg/220px-Mariah_Carey_2019.jpg",
    "Frank Sinatra":"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Frank_Sinatra_-_publicity.jpg/220px-Frank_Sinatra_-_publicity.jpg",
    "Michael Buble":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Michael_Buble_2013.jpg/220px-Michael_Buble_2013.jpg",
    "John Legend":"https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/John_Legend_2019.jpg/220px-John_Legend_2019.jpg",
    "Usher":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Usher_2019.jpg/220px-Usher_2019.jpg",
    "Marvin Gaye":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Marvin_Gaye.jpg/220px-Marvin_Gaye.jpg",
    "Stevie Wonder":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Stevie_Wonder_2013.jpg/220px-Stevie_Wonder_2013.jpg",
    "Aretha Franklin":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Aretha_Franklin_1964.jpg/220px-Aretha_Franklin_1964.jpg",
    "Lorde":"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Lorde_2013.png/220px-Lorde_2013.png",
    "Lana Del Rey":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Lana_Del_Rey_2019.jpg/220px-Lana_Del_Rey_2019.jpg",
    "Demi Lovato":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Demi_Lovato_2018.jpg/220px-Demi_Lovato_2018.jpg",
    "Florence Welch":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Florence_Welch_2010.jpg/220px-Florence_Welch_2010.jpg",
    "P!nk":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Pink_2019.jpg/220px-Pink_2019.jpg",
    "Tyla":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Tyla_2024.jpg/220px-Tyla_2024.jpg",
    "Chappell Roan":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Chappell_Roan_2024.jpg/220px-Chappell_Roan_2024.jpg",
    "Luis Miguel":"https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Luis_Miguel_2015.jpg/220px-Luis_Miguel_2015.jpg",
    "Vicente Fernandez":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Vicente_Fernandez_%28cropped%29.jpg/220px-Vicente_Fernandez_%28cropped%29.jpg",
    "Juanes":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Juanes_2019.jpg/220px-Juanes_2019.jpg",
    "Marc Anthony":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Marc_Anthony_2016.jpg/220px-Marc_Anthony_2016.jpg",
    "Ricky Martin":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Ricky_Martin_2020.jpg/220px-Ricky_Martin_2020.jpg",
    "Enrique Iglesias":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Enrique_Iglesias_2013.jpg/220px-Enrique_Iglesias_2013.jpg",
    "Freddie Mercury":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Freddie_Mercury_performing_The_Works_Tour_in_New_Zealand.jpg/220px-Freddie_Mercury_performing_The_Works_Tour_in_New_Zealand.jpg",
    "Mick Jagger":"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Mick_Jagger_2016.jpg/220px-Mick_Jagger_2016.jpg",
    "Robert Plant":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Robert_Plant_2008.jpg/220px-Robert_Plant_2008.jpg",
    "Bob Dylan":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Bob_Dylan_-_Azkena_Rock_Festival_2010_2.jpg/220px-Bob_Dylan_-_Azkena_Rock_Festival_2010_2.jpg",
    "Kurt Cobain":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Kurt_Cobain_and_Krist_Novoselic_in_1991.jpg/220px-Kurt_Cobain_and_Krist_Novoselic_in_1991.jpg",
    "Liam Gallagher":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Liam_Gallagher_%28Oasis%29.jpg/220px-Liam_Gallagher_%28Oasis%29.jpg",
    "Bono":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Bono_2016.jpg/220px-Bono_2016.jpg",
    "Chris Martin":"https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Chris_Martin_2012_crop.jpg/220px-Chris_Martin_2012_crop.jpg",
    "Morat":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Morat_2018.jpg/220px-Morat_2018.jpg",
    "Alejandro Fernandez":"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Alejandro_Fernandez_2012.jpg/220px-Alejandro_Fernandez_2012.jpg",
    "Anitta":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Anitta_%28cantora%29.jpg/220px-Anitta_%28cantora%29.jpg",
    "Maria Becerra":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Maria_Becerra_2022.jpg/220px-Maria_Becerra_2022.jpg",
    "Nicki Nicole":"https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Nicki_Nicole_2021.jpg/220px-Nicki_Nicole_2021.jpg",
    "Estrella Morente":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Estrella_Morente.jpg/220px-Estrella_Morente.jpg",
    "Nina Pastori":"https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Nina_Pastori.jpg/220px-Nina_Pastori.jpg",
    "Celine Dion":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Celine_Dion_-_Courage_World_Tour.jpg/220px-Celine_Dion_-_Courage_World_Tour.jpg",
    "Aretha Franklin":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Aretha_Franklin_1964.jpg/220px-Aretha_Franklin_1964.jpg",
    "Whitney Houston":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Whitney_Houston_Welcome_Home_Heroes_1991.jpg/220px-Whitney_Houston_Welcome_Home_Heroes_1991.jpg",
}

wiki_js = json.dumps(WIKI_MAP, ensure_ascii=False)

HTML = f'''<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <meta name="referrer" content="no-referrer">
    <title>Artistas y Cantantes — Tipo de Voz, Fotos y Curiosidades | Harmiq</title>
    <meta name="description" content="Descubre el tipo de voz de mas de 150 artistas: Bad Bunny, Rosalia, Adele, Peso Pluma, Beyonce y muchos mas. Fotos, curiosidades y analisis vocal.">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Baloo+2:wght@700;800;900&display=swap" rel="stylesheet">
    <style>
        :root{{--p:#7C4DFF;--a:#FF4FA3;--dark:#0A0818;--card:#130F2A;--t:#E5E7EB;--m:#6B7280;}}
        *{{margin:0;padding:0;box-sizing:border-box;}}
        body{{background:var(--dark);color:var(--t);font-family:'Outfit',sans-serif;line-height:1.6;}}
        nav{{display:flex;justify-content:space-between;align-items:center;padding:1rem 4%;background:rgba(10,8,24,.95);border-bottom:1px solid rgba(255,255,255,.07);position:sticky;top:0;z-index:100;}}
        .logo{{font-size:1.7rem;font-weight:900;background:linear-gradient(135deg,#7C4DFF,#FF4FA3);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-decoration:none;}}
        .container{{max-width:1400px;margin:0 auto;padding:3rem 4%;}}
        h1{{font-family:'Baloo 2',sans-serif;font-size:2.8rem;font-weight:900;text-align:center;margin-bottom:.8rem;background:linear-gradient(135deg,#fff,#A5B4FC);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}}
        .subtitle{{color:var(--m);font-size:1.1rem;text-align:center;margin-bottom:2rem;}}
        .stats-bar{{display:flex;gap:1.5rem;justify-content:center;flex-wrap:wrap;margin-bottom:2rem;padding:1rem;background:rgba(255,255,255,.03);border-radius:16px;border:1px solid rgba(255,255,255,.07);}}
        .stat-item{{text-align:center;}}
        .stat-num{{font-family:'Baloo 2',sans-serif;font-size:1.8rem;font-weight:900;background:linear-gradient(135deg,#7C4DFF,#FF4FA3);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}}
        .stat-label{{font-size:.7rem;color:var(--m);font-weight:700;text-transform:uppercase;letter-spacing:.5px;}}
        .controls{{display:flex;gap:.8rem;flex-wrap:wrap;justify-content:center;margin-bottom:1rem;}}
        .search-wrap{{position:relative;flex:1;min-width:220px;max-width:420px;}}
        .search-wrap::before{{content:'🔍';position:absolute;left:1rem;top:50%;transform:translateY(-50%);pointer-events:none;font-size:.9rem;}}
        #artistSearch{{width:100%;padding:.75rem 1rem .75rem 2.8rem;border-radius:50px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:white;font-family:'Outfit';font-size:.9rem;outline:none;transition:border-color .2s;}}
        #artistSearch:focus{{border-color:var(--p);box-shadow:0 0 0 3px rgba(124,77,255,.15);}}
        .filter-sel{{padding:.7rem 2rem .7rem 1.1rem;border-radius:50px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#E5E7EB;font-family:'Outfit';font-size:.85rem;font-weight:600;cursor:pointer;outline:none;appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239CA3AF'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right .8rem center;}}
        .filter-sel option{{background:#1a1730;}}
        #resultCount{{color:var(--m);font-size:.85rem;text-align:center;margin-bottom:1.5rem;}}
        .artist-grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(195px,1fr));gap:1.2rem;}}
        .artist-card{{background:var(--card);border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,.07);transition:transform .25s,box-shadow .25s,border-color .25s;text-decoration:none;color:white;display:block;}}
        .artist-card:hover{{transform:translateY(-8px);border-color:var(--p);box-shadow:0 16px 40px rgba(0,0,0,.5);}}
        .card-img-wrap{{position:relative;padding-top:100%;background:#0d0a1f;overflow:hidden;}}
        .card-img-wrap img{{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .3s;}}
        .artist-card:hover .card-img-wrap img{{transform:scale(1.06);}}
        .card-badge{{position:absolute;bottom:8px;left:8px;font-size:.58rem;font-weight:900;padding:3px 9px;border-radius:20px;border:1px solid;text-transform:uppercase;letter-spacing:.5px;backdrop-filter:blur(6px);}}
        .artist-info{{padding:1rem 1.1rem;}}
        .artist-info h3{{font-family:'Baloo 2',sans-serif;font-size:1rem;font-weight:800;margin-bottom:.2rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}}
        .artist-genre{{font-size:.68rem;color:var(--m);margin-bottom:.5rem;}}
        .artist-desc{{font-size:.72rem;color:#9CA3AF;line-height:1.45;margin-bottom:.6rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}}
        .anecdote-btn{{font-size:.65rem;color:var(--p);font-weight:800;cursor:pointer;background:none;border:none;padding:.3rem 0;transition:color .15s;font-family:'Outfit';}}
        .anecdote-btn:hover{{color:var(--a);}}
        .anecdote-text{{font-size:.7rem;color:#C4B5FD;line-height:1.5;margin-top:.5rem;padding:.6rem .8rem;background:rgba(124,77,255,.08);border-radius:10px;border-left:2px solid var(--p);}}
        footer{{padding:3rem;text-align:center;color:var(--m);font-size:.9rem;border-top:1px solid rgba(255,255,255,.05);margin-top:4rem;}}
        @media(max-width:600px){{h1{{font-size:2rem;}}.artist-grid{{grid-template-columns:repeat(2,1fr);gap:.8rem;}}}}
    </style>
</head>
<body>
    <nav>
        <a href="/" class="logo">Harmiq</a>
        <a href="/" style="color:#fff;text-decoration:none;font-weight:800;background:linear-gradient(90deg,#7C4DFF,#FF4FA3);padding:.5rem 1rem;border-radius:30px;font-size:.85rem;">Analizar mi voz</a>
    </nav>

    <div class="container">
        <h1>Directorio de Artistas</h1>
        <p class="subtitle">Descubre el tipo de voz de tus artistas favoritos y sus curiosidades</p>

        <div class="stats-bar">
            <div class="stat-item"><div class="stat-num">{len(ARTISTS_DEDUP)}</div><div class="stat-label">Artistas</div></div>
            <div class="stat-item"><div class="stat-num">7</div><div class="stat-label">Tipos de voz</div></div>
            <div class="stat-item"><div class="stat-num">35+</div><div class="stat-label">Generos</div></div>
            <div class="stat-item"><div class="stat-num">13.000+</div><div class="stat-label">En nuestra DB</div></div>
        </div>

        <div class="controls">
            <div class="search-wrap">
                <input type="text" id="artistSearch" placeholder="Busca artista..." oninput="filterArtists()">
            </div>
            <select class="filter-sel" id="vtypeFilter" onchange="filterArtists()">
                <option value="">Tipo de voz</option>
                {vtype_opts}
            </select>
            <select class="filter-sel" id="genreFilter" onchange="filterArtists()">
                <option value="">Genero</option>
                {genre_opts}
            </select>
        </div>
        <div id="resultCount">{len(ARTISTS_DEDUP)} artistas</div>

        <div class="artist-grid" id="artistGrid">
{cards}
        </div>

        <div id="noResults" style="display:none;text-align:center;padding:4rem 2rem;color:var(--m);">
            <div style="font-size:3rem;margin-bottom:1rem">🔍</div>
            <h3 style="color:#fff;margin-bottom:.5rem">No encontramos ese artista aqui</h3>
            <p>Prueba a analizar tu voz y te compararemos con mas de 13.000 cantantes.</p>
            <a href="/" style="display:inline-block;margin-top:1.5rem;padding:.8rem 2rem;background:linear-gradient(135deg,#7C4DFF,#FF4FA3);color:#fff;text-decoration:none;border-radius:50px;font-weight:800;">Analizar mi voz</a>
        </div>
    </div>

    <footer>
        <p>Harmiq &copy; 2026 &mdash; <a href="/" style="color:var(--p)">Analiza tu voz</a></p>
    </footer>

    <script>
    const HF_API = "https://hamiq-harmiq-backend1.hf.space";
    const imgMap = {{}};
    const WIKI = {wiki_js};

    function getInitials(name){{
        const p=name.trim().split(/\\s+/),c=['%237C4DFF','%23FF4FA3','%23118AB2','%23FF9F1C','%2306D6A0'];
        const col=c[name.charCodeAt(0)%c.length];
        const i=(p[0][0]+(p.length>1?p[p.length-1][0]:p[0][1]||'?')).toUpperCase();
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%230d0a1f'/%3E%3Ctext x='200' y='245' font-family='Arial' font-weight='900' font-size='160' fill='${{col}}' text-anchor='middle'%3E${{i}}%3C/text%3E%3C/svg%3E`;
    }}

    async function loadArtistImg(name){{
        if(imgMap[name]) return imgMap[name];
        if(WIKI[name]){{ imgMap[name]=WIKI[name]; return WIKI[name]; }}
        try{{
            const r=await fetch(`${{HF_API}}/artist-image?name=${{encodeURIComponent(name)}}`);
            if(r.ok){{const d=await r.json();if(d.image){{imgMap[name]=d.image;return d.image;}}}}
        }}catch(e){{}}
        try{{
            const r=await fetch(`https://itunes.apple.com/search?term=${{encodeURIComponent(name)}}&entity=song&limit=1`);
            const d=await r.json();
            if(d.results&&d.results[0]){{
                const u=d.results[0].artworkUrl100?.replace('100x100bb','600x600bb');
                if(u){{imgMap[name]=u;return u;}}
            }}
        }}catch(e){{}}
        const fb=getInitials(name);imgMap[name]=fb;return fb;
    }}

    const observer=new IntersectionObserver((entries)=>{{
        entries.forEach(entry=>{{
            if(entry.isIntersecting){{
                const img=entry.target;
                const name=img.dataset.artist;
                if(name&&!img.dataset.loaded){{
                    img.dataset.loaded='1';
                    observer.unobserve(img);
                    loadArtistImg(name).then(url=>{{
                        const tmp=new Image();
                        tmp.onload=()=>{{img.src=url;}};
                        tmp.onerror=()=>{{img.src=getInitials(name);}};
                        tmp.src=url;
                    }});
                }}
            }}
        }});
    }},{{rootMargin:'250px'}});

    document.querySelectorAll('img.artist-img').forEach(img=>observer.observe(img));

    function toggleAnecdote(btn){{
        const el=btn.nextElementSibling;
        const open=el.style.display!=='none';
        el.style.display=open?'none':'block';
        btn.textContent=open?'Ver anecdota \u25BC':'Ocultar \u25B2';
    }}

    function filterArtists(){{
        const q=document.getElementById('artistSearch').value.toLowerCase().trim();
        const vt=document.getElementById('vtypeFilter').value;
        const gn=document.getElementById('genreFilter').value;
        let vis=0;
        document.querySelectorAll('.artist-card').forEach(c=>{{
            const nm=c.dataset.name||'';
            const tp=c.dataset.type||'';
            const gr=c.dataset.genre||'';
            const ok=(!q||nm.includes(q))&&(!vt||tp===vt)&&(!gn||gr.startsWith(gn));
            c.style.display=ok?'':'none';
            if(ok) vis++;
        }});
        document.getElementById('resultCount').textContent=vis+' artistas';
        document.getElementById('noResults').style.display=vis===0?'block':'none';
    }}
    </script>
</body>
</html>'''

os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
with open(OUTPUT, "w", encoding="utf-8") as f:
    f.write(HTML)

total = len(ARTISTS_DEDUP)
print(f"Generado: {OUTPUT} con {total} artistas")
