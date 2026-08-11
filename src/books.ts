// SquareCircle MultiServices — Series Catalog
// Each "book" carries its own set of topics. Selecting a book in the Library
// screen feeds its topics into the existing lesson generator (title string only,
// same shape as the original RECOMMEND_TOPICS). Real cover art is added later by
// setting `cover` to a hosted image URL; until then `coverEmoji` shows a placeholder.

export interface BookTopic {
  id: string;
  titleEn: string;
  titleEs: string;
  titleFr: string;
  icon: string;
}

export interface Book {
  id: string;
  titleEn: string;
  titleEs: string;
  titleFr: string;
  subtitleEn: string;
  subtitleEs: string;
  subtitleFr: string;
  color: string;      // primary accent (hex) taken from the cover
  bg: string;         // light background tint (hex)
  coverEmoji: string; // placeholder until a real cover image URL is set
  cover?: string;     // hosted cover image URL (added later)
  sensitive?: boolean; // topics needing age-appropriate guardrails + client review
  topics: BookTopic[];
}

export const BOOKS: Book[] = [
  // 1) THE AMAZING BODY TEAM ------------------------------------------------
  {
    id: "body-team",
    titleEn: "The Amazing Body Team",
    titleEs: "El Increíble Equipo del Cuerpo",
    titleFr: "L'Incroyable Équipe du Corps",
    subtitleEn: "How My Body Systems Work Together",
    subtitleEs: "Cómo Trabajan Juntos los Sistemas de Mi Cuerpo",
    subtitleFr: "Comment les Systèmes de Mon Corps Travaillent Ensemble",
    color: "#1E6FD9",
    bg: "#E8F1FC",
    coverEmoji: "🫀",
    sensitive: true, // includes the reproductive system
    topics: [
      { id: "circulatory", titleEn: "The Circulatory System", titleEs: "El Sistema Circulatorio", titleFr: "Le Système Circulatoire", icon: "❤️" },
      { id: "respiratory", titleEn: "The Respiratory System", titleEs: "El Sistema Respiratorio", titleFr: "Le Système Respiratoire", icon: "🫁" },
      { id: "digestive", titleEn: "The Digestive System", titleEs: "El Sistema Digestivo", titleFr: "Le Système Digestif", icon: "🍎" },
      { id: "skeletal", titleEn: "The Skeletal System", titleEs: "El Sistema Óseo", titleFr: "Le Système Squelettique", icon: "🦴" },
      { id: "muscular", titleEn: "The Muscular System", titleEs: "El Sistema Muscular", titleFr: "Le Système Musculaire", icon: "💪" },
      { id: "nervous", titleEn: "The Nervous System", titleEs: "El Sistema Nervioso", titleFr: "Le Système Nerveux", icon: "🧠" },
      { id: "endocrine", titleEn: "The Endocrine System", titleEs: "El Sistema Endocrino", titleFr: "Le Système Endocrinien", icon: "⚗️" },
      { id: "immune", titleEn: "The Immune System", titleEs: "El Sistema Inmunológico", titleFr: "Le Système Immunitaire", icon: "🛡️" },
      { id: "urinary", titleEn: "The Urinary System", titleEs: "El Sistema Urinario", titleFr: "Le Système Urinaire", icon: "💧" },
      { id: "integumentary", titleEn: "The Integumentary System (Skin, Hair & Nails)", titleEs: "El Sistema Tegumentario (Piel, Cabello y Uñas)", titleFr: "Le Système Tégumentaire (Peau, Cheveux et Ongles)", icon: "🖐️" },
      { id: "reproductive", titleEn: "The Reproductive System", titleEs: "El Sistema Reproductivo", titleFr: "Le Système Reproducteur", icon: "👶" },
    ],
  },

  // 2) ELEMENTARY 101 -------------------------------------------------------
  {
    id: "elementary-101",
    titleEn: "Elementary 101",
    titleEs: "Elemental 101",
    titleFr: "Élémentaire 101",
    subtitleEn: "My Senses & the Elements Around Me",
    subtitleEs: "Mis Sentidos y los Elementos a Mi Alrededor",
    subtitleFr: "Mes Sens et les Éléments Autour de Moi",
    color: "#F2A900",
    bg: "#FFF6E0",
    coverEmoji: "🌈",
    topics: [
      { id: "sight", titleEn: "Sight — My Eyes", titleEs: "La Vista — Mis Ojos", titleFr: "La Vue — Mes Yeux", icon: "👁️" },
      { id: "hearing", titleEn: "Hearing — My Ears", titleEs: "El Oído — Mis Oídos", titleFr: "L'Ouïe — Mes Oreilles", icon: "👂" },
      { id: "smell", titleEn: "Smell — My Nose", titleEs: "El Olfato — Mi Nariz", titleFr: "L'Odorat — Mon Nez", icon: "👃" },
      { id: "taste", titleEn: "Taste — My Mouth", titleEs: "El Gusto — Mi Boca", titleFr: "Le Goût — Ma Bouche", icon: "👅" },
      { id: "touch", titleEn: "Touch — My Hands", titleEs: "El Tacto — Mis Manos", titleFr: "Le Toucher — Mes Mains", icon: "✋" },
      { id: "sun", titleEn: "The Sun & Warmth", titleEs: "El Sol y el Calor", titleFr: "Le Soleil et la Chaleur", icon: "☀️" },
      { id: "water", titleEn: "Water All Around Us", titleEs: "El Agua a Nuestro Alrededor", titleFr: "L'Eau Autour de Nous", icon: "💧" },
      { id: "air", titleEn: "The Air We Breathe", titleEs: "El Aire que Respiramos", titleFr: "L'Air que Nous Respirons", icon: "🌬️" },
      { id: "earth", titleEn: "The Earth Beneath Us", titleEs: "La Tierra Bajo Nosotros", titleFr: "La Terre Sous Nos Pieds", icon: "🌍" },
    ],
  },

  // 3) THE ELEMENT QUAD SQUAD ----------------------------------------------
  {
    id: "quad-squad",
    titleEn: "The Element Quad Squad",
    titleEs: "El Escuadrón de los Cuatro Elementos",
    titleFr: "L'Escouade des Quatre Éléments",
    subtitleEn: "The Quadruplet Forces of Life",
    subtitleEs: "Las Cuatro Fuerzas de la Vida",
    subtitleFr: "Les Quatre Forces de la Vie",
    color: "#E8541E",
    bg: "#FDECE4",
    coverEmoji: "⚡",
    topics: [
      { id: "earth-el", titleEn: "Earth — The Ground We Stand On", titleEs: "Tierra — El Suelo que Pisamos", titleFr: "Terre — Le Sol sur Lequel Nous Marchons", icon: "🌱" },
      { id: "water-el", titleEn: "Water — The Flow of Life", titleEs: "Agua — El Fluir de la Vida", titleFr: "Eau — Le Flux de la Vie", icon: "🌊" },
      { id: "fire-el", titleEn: "Fire — Heat, Light & Energy", titleEs: "Fuego — Calor, Luz y Energía", titleFr: "Feu — Chaleur, Lumière et Énergie", icon: "🔥" },
      { id: "air-el", titleEn: "Air — The Breath of the World", titleEs: "Aire — El Aliento del Mundo", titleFr: "Air — Le Souffle du Monde", icon: "💨" },
    ],
  },

  // 4) PROGRESSION: FIRST THINGS FIRST -------------------------------------
  {
    id: "progression",
    titleEn: "Progression: First Things First",
    titleEs: "Progresión: Lo Primero es lo Primero",
    titleFr: "Progression : Les Choses Importantes d'Abord",
    subtitleEn: "The Right Order Builds the Right Result",
    subtitleEs: "El Orden Correcto Construye el Resultado Correcto",
    subtitleFr: "Le Bon Ordre Construit le Bon Résultat",
    color: "#2F6B2F",
    bg: "#EAF3EA",
    coverEmoji: "🌟",
    sensitive: true, // conception & prenatal stages — keep age-appropriate; client review
    topics: [
      { id: "beginning", titleEn: "The Beginning", titleEs: "El Comienzo", titleFr: "Le Commencement", icon: "✨" },
      { id: "trimester-1", titleEn: "The First Stage of Growing (Months 1–3)", titleEs: "La Primera Etapa del Crecimiento (Meses 1–3)", titleFr: "La Première Étape de la Croissance (Mois 1–3)", icon: "🌱" },
      { id: "trimester-2", titleEn: "The Second Stage of Growing (Months 4–6)", titleEs: "La Segunda Etapa del Crecimiento (Meses 4–6)", titleFr: "La Deuxième Étape de la Croissance (Mois 4–6)", icon: "💚" },
      { id: "trimester-3", titleEn: "The Third Stage of Growing (Months 7–9)", titleEs: "La Tercera Etapa del Crecimiento (Meses 7–9)", titleFr: "La Troisième Étape de la Croissance (Mois 7–9)", icon: "👣" },
      { id: "birth", titleEn: "Birth — Welcome to the World", titleEs: "El Nacimiento — Bienvenido al Mundo", titleFr: "La Naissance — Bienvenue au Monde", icon: "🍼" },
      { id: "infancy", titleEn: "Infancy (0–2 Years)", titleEs: "La Infancia (0–2 Años)", titleFr: "La Petite Enfance (0–2 Ans)", icon: "🧸" },
      { id: "early-childhood", titleEn: "Early Childhood (2–6 Years)", titleEs: "La Primera Niñez (2–6 Años)", titleFr: "La Petite Enfance (2–6 Ans)", icon: "🧱" },
      { id: "middle-childhood", titleEn: "Middle Childhood (6–12 Years)", titleEs: "La Niñez Media (6–12 Años)", titleFr: "L'Enfance Moyenne (6–12 Ans)", icon: "📖" },
      { id: "adolescence", titleEn: "Adolescence & Beyond (13+ Years)", titleEs: "La Adolescencia y Más Allá (13+ Años)", titleFr: "L'Adolescence et Au-delà (13+ Ans)", icon: "🌟" },
    ],
  },
];

export const getBookById = (id: string): Book | undefined =>
  BOOKS.find((b) => b.id === id);
