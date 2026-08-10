import React, { useState, useEffect } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  BookOpen, 
  Award, 
  ShieldCheck, 
  Settings, 
  User, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Lock, 
  Key, 
  Languages, 
  Play, 
  Pause,
  Square,
  Volume2,
  ListTodo, 
  ArrowRight,
  PlusCircle,
  Lightbulb,
  Heart,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Home,
  Compass,
  CreditCard,
  Download,
  Maximize2,
  Minimize2,
  X
} from "lucide-react";
import { Language, LessonData, QuizQuestion, ScorePlayRecord, ParentInsights } from "./types";
import { translations } from "./utils/localization";
import { BOOKS, getBookById } from "./books";

// Avatars Definition
const PRESET_AVATARS = [
  { id: "lion", emoji: "🦁", name: "Leo the Brave", color: "bg-amber-100 border-amber-400 text-amber-700", isPremium: false },
  { id: "rocket", emoji: "🚀", name: "Captain Mia", color: "bg-blue-100 border-blue-400 text-blue-700", isPremium: false },
  { id: "octopus", emoji: "🐙", name: "Toby the Curious", color: "bg-purple-100 border-purple-400 text-purple-700", isPremium: false },
  { id: "wizard", emoji: "🧙", name: "Zoe the Wise", color: "bg-emerald-100 border-emerald-400 text-emerald-700", isPremium: false },
  { id: "unicorn", emoji: "🦄", name: "Sparkles", color: "bg-pink-100 border-pink-400 text-pink-700", isPremium: true },
  { id: "dragon", emoji: "🐉", name: "Ignis", color: "bg-rose-100 border-rose-400 text-rose-700", isPremium: true },
  { id: "fawn", emoji: "🦌", name: "Freya", color: "bg-orange-100 border-orange-400 text-orange-700", isPremium: true }
];

// Story Illustration Image Lookup Helper
function getStoryImage(topic: string, keyword?: string): string {
  const norm = (topic || "").toLowerCase();
  const normKw = (keyword || "").toLowerCase();
  
  if (norm.includes("division") || norm.includes("fraction") || norm.includes("división") || norm.includes("math") || norm.includes("matemáticas") || norm.includes("calcul") || norm.includes("chiffre")) {
    return "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=800&q=80"; // Book and learning space
  }
  if (norm.includes("leaves") || norm.includes("nature") || norm.includes("hojas") || norm.includes("árbol") || norm.includes("plant") || norm.includes("science") || norm.includes("couleur")) {
    return "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80"; // Autumn bright woods or leaves
  }
  if (norm.includes("astronomy") || norm.includes("space") || norm.includes("solar") || norm.includes("planets") || norm.includes("estrella") || norm.includes("étoile") || norm.includes("système")) {
    return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"; // Glowing nebula and planet
  }
  if (norm.includes("geo") || norm.includes("map") || norm.includes("ocean") || norm.includes("explorer") || norm.includes("islas") || norm.includes("carte") || norm.includes("océan")) {
    return "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80"; // Compass and maps treasure look
  }
  if (norm.includes("castle") || norm.includes("history") || norm.includes("knight") || norm.includes("caballero") || norm.includes("mago") || norm.includes("château") || norm.includes("fort")) {
    return "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80"; // Castle tower sunset ruins
  }
  if (norm.includes("sport") || norm.includes("play") || norm.includes("olympic") || norm.includes("juego") || norm.includes("deporte") || norm.includes("jeux")) {
    return "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80"; // Run track field
  }
  
  // Custom high-quality fallback seed images that look marvelous
  const seeds = ["magic", "creative", "explorer", "panda", "dragon", "rocket", "castle", "shapes", "colors"];
  const matchedSeed = seeds.find(s => normKw.includes(s) || norm.includes(s)) || "learning";
  
  const themeImages = {
    magic: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=800&q=80",
    creative: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
    explorer: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80",
    panda: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=800&q=80",
    dragon: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
    rocket: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=850&q=80",
    castle: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
    shapes: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80",
    colors: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80"
  };
  
  return themeImages[matchedSeed as keyof typeof themeImages] || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80";
}

// Dynamic Gallery Image Lookup Helper
function getStoryImages(topic: string, keyword?: string): string[] {
  const norm = (topic || "").toLowerCase();
  const normKw = (keyword || "").toLowerCase();

  // Division / math / fractions / numbers
  if (norm.includes("division") || norm.includes("fraction") || norm.includes("división") || norm.includes("math") || norm.includes("matemáticas") || norm.includes("calcul") || norm.includes("chiffre")) {
    return [
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=800&q=80", // Books and writing
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80", // Brainstorming sketching math/shapes
      "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=800&q=80"  // Magic glowing creative
    ];
  }
  
  // Leaves / nature / science / trees
  if (norm.includes("leaves") || norm.includes("nature") || norm.includes("hojas") || norm.includes("árbol") || norm.includes("plant") || norm.includes("science") || norm.includes("couleur")) {
    return [
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80", // Autumn colored leaves/woods
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80", // Beautiful trees and green sky sunrays
      "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80"  // Whimsical magical green forest path
    ];
  }

  // Astronomy / space / solar system / planets
  if (norm.includes("astronomy") || norm.includes("space") || norm.includes("solar") || norm.includes("planets") || norm.includes("estrella") || norm.includes("étoile") || norm.includes("système")) {
    return [
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80", // Nebula glowing planet
      "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=800&q=80", // Space stars starry sky
      "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=850&q=80"  // Rocket lift off
    ];
  }

  // Geography / maps / oceans / islands
  if (norm.includes("geo") || norm.includes("map") || norm.includes("ocean") || norm.includes("explorer") || norm.includes("islas") || norm.includes("carte") || norm.includes("océan")) {
    return [
      "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80", // Compass and map lookup
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", // Sunny ocean beach island vibe
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80"  // Colorful child watercolor map / creative
    ];
  }

  // Castle / Knights / History
  if (norm.includes("castle") || norm.includes("history") || norm.includes("knight") || norm.includes("caballero") || norm.includes("mago") || norm.includes("château") || norm.includes("fort")) {
    return [
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80", // Castle ruins sunset
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80", // Beautiful school learning castle look
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80"  // Kid fantasy explorer castle/bridge
    ];
  }

  // Sports / olympics / games
  if (norm.includes("sport") || norm.includes("play") || norm.includes("olympic") || norm.includes("juego") || norm.includes("deporte") || norm.includes("jeux")) {
    return [
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80", // Olympic track field lanes
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80", // Kids playground sports soccer balls
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80"  // Creative colorful field outdoor
    ];
  }

  // Pandas or cute bears
  if (normKw.includes("panda") || norm.includes("panda")) {
    return [
      "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=800&q=80", // Cute panda sitting eating bamboo
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80", // Creative kids library
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80"  // Vibrant splash of colors/art
    ];
  }

  // Dragons / magical creatures
  if (normKw.includes("dragon") || norm.includes("dragon") || normKw.includes("mágic") || norm.includes("mágic")) {
    return [
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80", // Majestic glowing colorful anime/fantasy dragon artwork
      "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=800&q=80", // Mystical particles glowing open book magic
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80"  // Fantasy kid exploring a colorful forest bridge
    ];
  }

  // Fallback defaults
  return [
    "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80", // Whimsical cloud artwork
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80", // Kids learning inside library
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80"  // Kids paints and crafts creativity
  ];
}

// Generate localized descriptions for each slider image based on active topic
function getGalleryCaptions(index: number, topic: string, lang: string): string {
  const isEs = lang === "es";
  const isFr = lang === "fr";
  
  if (index === 0) {
    if (isEs) return `Aventura 1: El fantástico escenario de ${topic}`;
    if (isFr) return `Aventure 1 : Le paysage fantastique de ${topic}`;
    return `Adventure 1: The magical setting of ${topic}`;
  } else if (index === 1) {
    if (isEs) return "Aventura 2: Los asombrosos detalles divertidos del cuento";
    if (isFr) return "Aventure 2 : Les détails d'illustration secrets de l'histoire";
    return "Adventure 2: The fun characters and secrets of the story";
  } else {
    if (isEs) return "Aventura 3: ¡Listo para resolver el enigma y triunfar!";
    if (isFr) return "Aventure 3 : Prêt à résoudre l'énigme et à briller !";
    return "Adventure 3: Setting off to complete the quest!";
  }
}

// Curated Educational Practice Topics for Quick Start
const RECOMMEND_TOPICS = [
  { id: "division", titleEn: "Simple Long Division", titleEs: "División Larga Simple", titleFr: "Division simple à un chiffre", icon: "📊" },
  { id: "leaves", titleEn: "Why do leaves change color?", titleEs: "¿Por qué cambian de color las hojas?", titleFr: "Pourquoi les feuilles changent-elles de couleur ?", icon: "🍁" },
  { id: "fractions", titleEn: "Understanding Fractions", titleEs: "Entender Fracciones Sencillas", titleFr: "Comprendre les fractions simples", icon: "🍰" },
  { id: "astronomy", titleEn: "Mysteries of the Solar System", titleEs: "Misterios del Sistema Solar", titleFr: "Mystères du système solaire", icon: "🪐" },
  { id: "geography", titleEn: "Map Treasures & Oceans", titleEs: "Tesoros del Mapa y Océanos", titleFr: "Trésors de cartes & Océans", icon: "🌍" },
  { id: "history", titleEn: "Ancient Castles and Knights", titleEs: "Castillos Antiguos y Caballeros", titleFr: "Châteaux anciens et Chevaliers", icon: "🏰" },
  { id: "sports", titleEn: "The Magic of the Olympics", titleEs: "La Magia de los Juegos Olímpicos", titleFr: "La magie des Jeux olympiques", icon: "🏆" }
];

export default function App() {
  // Localization state
  const [lang, setLang] = useState<Language>("en");
  const t = translations[lang];

  // Selected view
  const [currentView, setCurrentView] = useState<"landing" | "app">("landing");
  const [isParentMode, setIsParentMode] = useState<boolean>(false);

  // Pre-load Interactive Demo states to explore Dashboard and Co-Learning immediately
  const handlePreloadDemo = (persona: "math" | "science" | "astronomy") => {
    let demoRecord: ScorePlayRecord;
    let demoInsights: ParentInsights;

    if (persona === "math") {
      setChildName("Lucas");
      setGradeLevel("3rd");
      setSelectedAvatarId("lion");
      
      demoRecord = {
        id: "demo-math-123",
        topic: lang === "es" ? "División Larga Simple" : lang === "fr" ? "Division simple à un chiffre" : "Simple Long Division",
        gradeLevel: "3rd",
        childName: "Lucas",
        score: 60,
        totalQuestions: 5,
        timestamp: new Date().toLocaleString(),
        history: [
          { question: "What is 15 divided by 3?", selectedOption: "5", correctOption: "5", isCorrect: true },
          { question: "If you have 14 cookies and share them equally among 3 friends, how many are left over?", selectedOption: "1", correctOption: "2", isCorrect: false }
        ]
      };

      demoInsights = {
        overallFeedback: lang === "es" 
          ? "Lucas entiende el concepto de la división larga, pero muestra confusión al calcular el residuo (lo sobrante) en situaciones de reparto equitativo. Se beneficia de la visualización manipulativa física."
          : lang === "fr"
          ? "Lucas comprend la division simple mais trébuche sur la notion de reste lors d'un partage équitable. L'intégration d'objets physiques aide énormément à débloquer ce verrou."
          : "Lucas understands the core mechanics of division, but struggles with identifying the remainder ('what is left over') when items cannot be shared perfectly. Physical grouping helps solidify this concept.",
        struggleKeywords: ["remainders", "equal sharing", "fractions"],
        atHomeActivities: [
          {
            title: lang === "es" ? "Reparto con Monedas" : lang === "fr" ? "Partage de Pièces" : "Coin Sharing Quest",
            intro: lang === "es" ? "Una actividad táctil de monedas para explorar divisiones y residuos." : lang === "fr" ? "Une activité concrète de pièces pour comprendre la division." : "A hands-on coin sharing game to explore leftovers.",
            materialsNeeded: lang === "es" ? ["10 monedas de juguete"] : lang === "fr" ? ["10 pièces de monnaie"] : ["10 toy coins or buttons"],
            instructions: lang === "es" 
              ? ["Pídele que divida las monedas entre 3 juguetes y observe qué sobra."] 
              : lang === "fr" 
              ? ["Demandez-lui de diviser 10 pièces entre 3 peluches."] 
              : ["Ask your child to share 10 coins among 3 stuffed animals and count the leftovers together."],
            parentProTip: lang === "es" ? "Celebra el error como un paso de detective." : lang === "fr" ? "Célébrez l'erreur comme une découverte de détective." : "Frame the leftover coin as a funny chef's bonus!"
          }
        ],
        coLearningChallenge: {
          conceptMastering: lang === "es" ? "División equitativa y correspondencia uno a uno" : lang === "fr" ? "Partage équitable et repères visuels simples" : "Equal distribution & physical 1-to-1 matching",
          challengeTitle: lang === "es" ? "⚡ Desafío de Energía de 5 Minutos: Cucharitas en la Cocina" : lang === "fr" ? "⚡ Défi Énergie 5 Min : Les petites cuillères magiques" : "⚡ 5-Minute Power Challenge: The Hungry Cup Division",
          householdItems: lang === "es" ? ["6 cucharas soperas", "2 tazas de plástico o platos hondos"] : lang === "fr" ? ["6 petites cuillères", "2 tasses ou bols en plastique"] : ["6 teaspoons or crayons", "2 plastic drinking cups"],
          parentScript: lang === "es" ? [
            "¡Hagamos magia de reparto! ¿Cómo podemos poner el mismo número de cucharas en cada taza para que no haya peleas?",
            "¡Prueba a poner una a una! ¿Cuántas recibió cada súper taza?"
          ] : lang === "fr" ? [
            "Jetons un sort de partage ! Comment pouvons-nous placer ces cuillères équitablement dans chaque bol ?",
            "Essaie de distribuer une par une pour voir ! Combien de cuillères chaque bol a-t-il reçu ?"
          ] : [
            "Let's play a physical dividing quest! How can we make sure these items get shared perfectly between these two cups?",
            "What if we put them in one-by-one? Give it a go and count with me!"
          ],
          reflectionPrompt: lang === "es" ? "¿Por qué crees que repartir de uno en uno nos ayuda a que las partes sean exactamente iguales?" : lang === "fr" ? "Pourquoi penses-tu que distribuer un par un évite que l'un des bols soit jaloux ?" : "Why does putting items in one-by-one help us make sure the groups are exactly equal?"
        }
      };
    } else if (persona === "science") {
      setChildName("Sophia");
      setGradeLevel("4th");
      setSelectedAvatarId("wizard");

      demoRecord = {
        id: "demo-science-456",
        topic: lang === "es" ? "¿Por qué cambian de color las hojas?" : lang === "fr" ? "Pourquoi les feuilles changent-elles de couleur ?" : "Why do leaves change color?",
        gradeLevel: "4th",
        childName: "Sophia",
        score: 80,
        totalQuestions: 5,
        timestamp: new Date().toLocaleString(),
        history: [
          { question: "What is the green pigment in leaves called?", selectedOption: "Chlorophyll", correctOption: "Chlorophyll", isCorrect: true },
          { question: "Why do leaves shut down their food factories in winter?", selectedOption: "They get tired", correctOption: "To save water and energy from freezing cold", isCorrect: false }
        ]
      };

      demoInsights = {
        overallFeedback: lang === "es"
          ? "Sofía adora la biología y comprende el papel de la clorofila, pero confunde cómo los cambios climáticos invernales activan la hibernación de las plantas físicas."
          : lang === "fr"
          ? "Sophie adore la biologie et comprend la chlorophylle, mais confond de quelle manière le gel hivernal déclenche la mise en sommeil des tissus végétaux."
          : "Sophia loves nature science and understands photosynthesis beautifully, but struggles with identifying why plants trigger hibernation during freezing temperatures.",
        struggleKeywords: ["seasonal adaptions", "hibernation", "botany"],
        atHomeActivities: [
          {
            title: lang === "es" ? "Aventureros de Hojas" : lang === "fr" ? "Aventure des Feuilles" : "Leaf Scavenger Hunt",
            intro: lang === "es" ? "Busca hojas reales para entender adaptaciones climáticas." : lang === "fr" ? "Trouvez de vraies feuilles pour observer le froid." : "Find real winter leaves to explore temperature adaptions.",
            materialsNeeded: lang === "es" ? ["Hojas de jardín o parque"] : lang === "fr" ? ["Feuilles du jardin ou parc"] : ["A few outdoor leaves"],
            instructions: lang === "es" 
              ? ["Busquen juntos 3 tipos de hojas y sientan su textura."] 
              : lang === "fr" 
              ? ["Observez 3 feuilles différentes et comparez leur souplesse."] 
              : ["Collect 3 outdoor leaves. Compare dried brittle winter leaves vs flexible evergreen needles."],
            parentProTip: lang === "es" ? "Haz que adivinen cuál hoja vive mejor en el frío." : lang === "fr" ? "Demandez-lui laquelle résiste le mieux au froid." : "Let them crunch the dry ones for sensory exploration!"
          }
        ],
        coLearningChallenge: {
          conceptMastering: lang === "es" ? "Conservación botánica y adaptación estacional" : lang === "fr" ? "Adaptation végétale et survie au froid" : "Plant hibernation & cell protection mechanisms",
          challengeTitle: lang === "es" ? "⚡ Desafío Botánico: El Abrigo de la Hoja Esponjosa" : lang === "fr" ? "⚡ Défi Botanique : Le manteau de la feuille d'hiver" : "⚡ 5-Minute Power Challenge: The Cozy Leaf Blanket",
          householdItems: lang === "es" ? ["2 hojas frescas o cubitos de hielo", "Un pañuelo pequeño de tela"] : lang === "fr" ? ["2 glaçons ou feuilles vertes", "Un petit tissu ou mouchoir"] : ["2 ice cubes or leaves", "A small cloth or paper towel"],
          parentScript: lang === "es" ? [
            "Si el hielo es el invierno frío, ¿cómo crees que las plantas se abrigan de las heladas?",
            "¡Envolvamos una hoja! ¿Sientes cómo la tela la aísla del viento helado?"
          ] : lang === "fr" ? [
            "Si ce glaçon représente l'hiver rigoureux, comment penses-tu que les arbres se protègent du gel ?",
            "Enveloppons celui-ci ! Est-ce que ce petit manteau en tissu empêche le froid d'agresser de suite ?"
          ] : [
            "If this ice represents freezing winter cold, how do you think trees stop their cells from bursting?",
            "Let's wrap one up! Do you feel how this protective blanket keeps the direct frost away?"
          ],
          reflectionPrompt: lang === "es" ? "¿Cómo ayuda la corteza gruesa del árbol de la misma manera que nuestra tela hoy?" : lang === "fr" ? "Comment penses-tu que l'écorce joue le même rôle que notre tissu ?" : "How does a tree's thick bark act like our cozy blanket during freezing storms?"
        }
      };
    } else {
      setChildName("Matthew");
      setGradeLevel("5th");
      setSelectedAvatarId("rocket");

      demoRecord = {
        id: "demo-space-789",
        topic: lang === "es" ? "Misterios del Sistema Solar" : lang === "fr" ? "Mystères du système solaire" : "Mysteries of the Solar System",
        gradeLevel: "5th",
        childName: "Matthew",
        score: 100,
        totalQuestions: 5,
        timestamp: new Date().toLocaleString(),
        history: []
      };

      demoInsights = {
        overallFeedback: lang === "es"
          ? "¡Mateo ha tenido un desempeño perfecto! Comprende las órbitas planetarias y la fuerza gravitacional del Sol. Listo para temas más avanzados como astrofísica básica."
          : lang === "fr"
          ? "Mathéo a réalisé un parcours sans faute ! Il maîtrise les orbites et la gravitation. Il est prêt à explorer la vie des étoiles et les galaxies."
          : "Matthew achieved a perfect score! He deeply understands planetary orbits, system scales, and gravity. He is ready for next-level challenges in astrophysics.",
        struggleKeywords: ["stellar expansion", "gravity dynamics"],
        atHomeActivities: [
          {
            title: lang === "es" ? "Danza de la Gravedad" : lang === "fr" ? "Danse de la Gravité" : "Gravity Orbit Dance",
            intro: lang === "es" ? "Experimenta la fuerza centrípeta y orbitas planetarias rítmicas." : lang === "fr" ? "Expérimentez les forces orbitales de manière amusante." : "Experience centripetal force and orbital rotations.",
            materialsNeeded: lang === "es" ? ["Una fruta pesada y un hilo"] : lang === "fr" ? ["Un fruit lourd et une ficelle"] : ["An apple or keys and a shoelace"],
            instructions: lang === "es"
              ? ["Aten las llaves y gírenlas suavemente para simular órbitas lunares."]
              : lang === "fr"
              ? ["Faites tourner doucement l'objet au bout du fil para mimer une orbite."]
              : ["Swing a bundle of keys safely on a shoelace to feel orbital centripetal force in action."],
            parentProTip: lang === "es" ? "Explica que la cuerda representa la fuerza invisible de la gravedad." : lang === "fr" ? "Expliquez que le fil représente la force invisible de la gravité." : "The string is the invisible tug of gravity holding planets in!"
          }
        ],
        coLearningChallenge: {
          conceptMastering: lang === "es" ? "Fuerza centrípeta y dinámicas de gravedad espacial" : lang === "fr" ? "Forces orbitales et lois d'attraction céleste" : "Centripetal pull & gravitational mechanics",
          challengeTitle: lang === "es" ? "⚡ Desafío Gravedad: El Remolino de la Orbita Invisble" : lang === "fr" ? "⚡ Défi Gravité : Le tourbillon cosmique de poche" : "⚡ 5-Minute Power Challenge: Pocket Cosmic Whirl",
          householdItems: lang === "es" ? ["Una taza pequeña", "Una canica o moneda pequeña"] : lang === "fr" ? ["Une tasse", "Une bille ou petite pièce"] : ["One mug or bowl", "One marble or coin"],
          parentScript: lang === "es" ? [
            "Si movemos la taza en círculos, ¿por qué la canica trepa las paredes pero no sale volando de inmediato?",
            "¡Mira qué rápido gira! ¡La fuerza circular la mantiene atrapada como a los planetas en el espacio!"
          ] : lang === "fr" ? [
            "Si on fait tourner la tasse, pourquoi la bille grimpe-t-elle le long du bord sans s'échapper de suite ?",
            "C'est la force du mouvement circulaire ! Elle maintient la bille en orbite como les planètes !"
          ] : [
            "If we swirl this mug in circles, why does the coin ride up the wall instead of falling over?",
            "Try swirling it slow, then fast! That centrifugal balance mimics gravity keeping satellites locked in orbit!"
          ],
          reflectionPrompt: lang === "es" ? "¿Qué pasaría con los planetas si el Sol perdiera su atracción de gravedad de repente?" : lang === "fr" ? "Qu'arriverait-il aux planètes si le Soleil perdait son attraction instantanément ?" : "What would happen to planets if the Sun suddenly lost its gravitational pull?"
        }
      };
    }

    // Insert into state list
    setHistoryRecords([demoRecord, ...historyRecords.filter(r => r.id !== demoRecord.id)]);
    setSelectedHistoryId(demoRecord.id);
    setGeneratedInsights(demoInsights);
    
    // Switch layout directly
    setIsParentMode(true);
    setCurrentView("app");
  };

  // Parent Gate Security State
  const [showParentGate, setShowParentGate] = useState<boolean>(false);
  const [parentGateQuestion, setParentGateQuestion] = useState<{ q: string; ans: number }>({ q: "", ans: 0 });
  const [parentGateInput, setParentGateInput] = useState<string>("");
  const [parentGateError, setParentGateError] = useState<boolean>(false);

  // Student Settings State
  const [childName, setChildName] = useState<string>("Ethan");
  const [gradeLevel, setGradeLevel] = useState<string>("3rd");
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("lion");
  const [studentStars, setStudentStars] = useState<number>(35);
  const [isProfileSaved, setIsProfileSaved] = useState<boolean>(false);

  // Learning Engine State
  const [selectedPresetTopic, setSelectedPresetTopic] = useState<string>("");
  const [customTopic, setCustomTopic] = useState<string>("");
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const activeBook = getBookById(selectedBookId);
  const activeTopics = activeBook ? activeBook.topics : [];
  const [isGeneratingLesson, setIsGeneratingLesson] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Current Active Lesson & Quiz State
  const [currentLesson, setCurrentLesson] = useState<LessonData | null>(null);
  const [quizAttemptAnswers, setQuizAttemptAnswers] = useState<number[]>([]); // stores index of selected answers
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(-1); // -1 means they are reading the lesson, >= 0 is active quiz
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState<boolean>(false);
  const [lastQuizScore, setLastQuizScore] = useState<number>(0);

  // Voice Narration Audio States
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1); // 0.75, 1, 1.25

  // Active gallery index state
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'setting' | 'character' | 'action'>('all');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Cancel any speaking session if active lesson changes or on component teardown
  useEffect(() => {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn("Speech synthesis error or not supported", e);
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveImageIndex(0);
    setCategoryFilter('all');
    setIsFullscreen(false);
  }, [currentLesson]);

  // Exit fullscreen on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-adjust active image index if current category filter changes and excludes it
  useEffect(() => {
    const currentFilteredIndices = categoryFilter === 'all' 
      ? [0, 1, 2] 
      : categoryFilter === 'setting' 
        ? [0] 
        : categoryFilter === 'character' 
          ? [1] 
          : [2];

    if (!currentFilteredIndices.includes(activeImageIndex)) {
      setActiveImageIndex(currentFilteredIndices[0]);
    }
  }, [categoryFilter, activeImageIndex]);

  const startSpeakingStory = (text: string) => {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      let langCode = "en-US";
      if (lang === "es") {
        langCode = "es-ES";
      } else if (lang === "fr") {
        langCode = "fr-FR";
      }
      utterance.lang = langCode;

      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(v => v.lang.startsWith(langCode));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.rate = speechSpeed;

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      setIsSpeaking(true);
      setIsPaused(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS launch failed:", e);
    }
  };

  const pauseSpeakingStory = () => {
    try {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } catch (e) {
      console.warn(e);
    }
  };

  const resumeSpeakingStory = () => {
    try {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } catch (e) {
      console.warn(e);
    }
  };

  const stopSpeakingStory = () => {
    try {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    } catch (e) {
      console.warn(e);
    }
  };

  const updateSpeechRate = (rate: number) => {
    setSpeechSpeed(rate);
    if (isSpeaking && currentLesson) {
      setTimeout(() => {
        startSpeakingStory(currentLesson.storySession);
      }, 50);
    }
  };

  // Image Gallery Download States & Handlers
  const [isDownloadingImage, setIsDownloadingImage] = useState<boolean>(false);
  const [downloadSuccessIdx, setDownloadSuccessIdx] = useState<number | null>(null);

  const handleDownloadImage = async (url: string, topicName: string, index: number) => {
    setIsDownloadingImage(true);
    setDownloadSuccessIdx(null);
    const safeName = topicName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    const filename = `super_explorer_${safeName}_illustration_${index + 1}.jpg`;

    try {
      // 1. Attempt standard fetch blob
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) {
        throw new Error("Blob fetch returned non-ok status");
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      setDownloadSuccessIdx(index);
      setTimeout(() => setDownloadSuccessIdx(null), 3000);
    } catch (err) {
      console.warn("Direct blob download failed, falling back to window open:", err);
      // 2. Fallback: Open in new tab which allows the kid to save/download
      try {
        const link = document.createElement("a");
        link.href = url + (url.includes("?") ? "&" : "?") + "dl=1";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setDownloadSuccessIdx(index);
        setTimeout(() => setDownloadSuccessIdx(null), 3000);
      } catch (e) {
        console.error("All download pathways failed:", e);
      }
    } finally {
      setIsDownloadingImage(false);
    }
  };

  // Historical Records (saved to LocalStorage for Parents)
  const [historyRecords, setHistoryRecords] = useState<ScorePlayRecord[]>([]);

  // Selected history record & insights state on Parent Dashboard
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>("");
  const [isGeneratingParentInsights, setIsGeneratingParentInsights] = useState<boolean>(false);
  const [generatedInsights, setGeneratedInsights] = useState<ParentInsights | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [showArchitectureInfo, setShowArchitectureInfo] = useState<boolean>(false);

  // Subscription & Families state
  const [subStatus, setSubStatus] = useState<"free" | "premium" | "family">("free");
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [familyProfiles, setFamilyProfiles] = useState<{ name: string; grade: string; avatarId: string; stars: number }[]>([
    { name: "Ethan", grade: "3rd Grade", avatarId: "lion", stars: 35 },
    { name: "Lily", grade: "1st Grade", avatarId: "unicorn", stars: 120 },
    { name: "Mason", grade: "5th Grade", avatarId: "rocket", stars: 90 }
  ]);
  const [activeProfileIndex, setActiveProfileIndex] = useState<number>(0);
  const [showCertificateForRecord, setShowCertificateForRecord] = useState<ScorePlayRecord | null>(null);

  // Theme & Layout States
  const [themeMode, setThemeMode] = useState<"charcoal" | "light">("charcoal");
  const [isCellphoneBorderMode, setIsCellphoneBorderMode] = useState<boolean>(false);

  // Interactive Payment / Billing States
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState<boolean>(false);
  const [pendingPlanTier, setPendingPlanTier] = useState<"premium" | "family" | null>(null);
  const [creditCardNumber, setCreditCardNumber] = useState<string>("");
  const [cardHolderName, setCardHolderName] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCVV, setCardCVV] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [paymentHistory, setPaymentHistory] = useState<{ id: string; date: string; amount: string; status: string; plan: string }[]>([
    { id: "TX-4929", date: "2026-06-22", amount: "$9.99", status: "Completed", plan: "Gold Umbrella" },
    { id: "TX-2931", date: "2026-05-15", amount: "$9.99", status: "Completed", plan: "Gold Umbrella" }
  ]);

  // Landing Page Interactive Phone Simulator States
  const [simulatedView, setSimulatedView] = useState<"kid" | "parent" | "payment">("kid");
  const [simulatedPoints, setSimulatedPoints] = useState<number>(35);
  const [simulatedInputOption, setSimulatedInputOption] = useState<number | null>(null);
  const [simulatedCompletedChallenge, setSimulatedCompletedChallenge] = useState<boolean>(false);
  const [simulatedActivePlan, setSimulatedActivePlan] = useState<"free" | "gold" | "family">("free");

  // Load from Storage
  useEffect(() => {
    const savedName = localStorage.getItem("umbrella_childName");
    if (savedName) setChildName(savedName);

    const savedGrade = localStorage.getItem("umbrella_grade");
    if (savedGrade) setGradeLevel(savedGrade);

    const savedAvatar = localStorage.getItem("umbrella_avatar");
    if (savedAvatar) setSelectedAvatarId(savedAvatar);

    const savedStars = localStorage.getItem("umbrella_stars");
    if (savedStars) setStudentStars(parseInt(savedStars, 10));

    const savedSubStatus = localStorage.getItem("umbrella_subStatus");
    if (savedSubStatus) setSubStatus(savedSubStatus as any);

    const savedFamilyProfiles = localStorage.getItem("umbrella_familyProfiles");
    if (savedFamilyProfiles) {
      try {
        setFamilyProfiles(JSON.parse(savedFamilyProfiles));
      } catch (e) {
        console.error(e);
      }
    }

    const savedActiveProfile = localStorage.getItem("umbrella_activeProfileIndex");
    if (savedActiveProfile) setActiveProfileIndex(parseInt(savedActiveProfile, 10));

    const savedCompleted = localStorage.getItem("umbrella_completedCoLearning");
    if (savedCompleted) {
      try {
        setCompletedChallenges(JSON.parse(savedCompleted));
      } catch (e) {
        console.error(e);
      }
    }

    const savedHistory = localStorage.getItem("umbrella_history");
    if (savedHistory) {
      try {
        setHistoryRecords(JSON.parse(savedHistory));
      } catch (e) {
        console.error(e);
      }
    }

    const savedTheme = localStorage.getItem("umbrella_themeMode");
    if (savedTheme) setThemeMode(savedTheme as any);

    const savedDevice = localStorage.getItem("umbrella_deviceMode");
    if (savedDevice) setIsCellphoneBorderMode(savedDevice === "true");
  }, []);

  // Save state helpers
  const saveStudentStars = (newStars: number) => {
    setStudentStars(newStars);
    localStorage.setItem("umbrella_stars", newStars.toString());
  };

  const handleSaveProfile = () => {
    localStorage.setItem("umbrella_childName", childName);
    localStorage.setItem("umbrella_grade", gradeLevel);
    localStorage.setItem("umbrella_avatar", selectedAvatarId);
    setIsProfileSaved(true);
    setTimeout(() => setIsProfileSaved(false), 2000);
  };

  // Generate math puzzle for the Parent Safety Gate
  const triggerParentGate = () => {
    const num1 = Math.floor(Math.random() * 8) + 3; // 3 to 10
    const num2 = Math.floor(Math.random() * 8) + 3; // 3 to 10
    const action = Math.random() > 0.5 ? "multiply" : "add";
    
    if (action === "multiply") {
      setParentGateQuestion({
        q: `${num1} × ${num2} = ?`,
        ans: num1 * num2
      });
    } else {
      setParentGateQuestion({
        q: `${num1 * 4} - ${num2} = ?`,
        ans: (num1 * 4) - num2
      });
    }
    setParentGateInput("");
    setParentGateError(false);
    setShowParentGate(true);
  };

  const handleVerifyParentGate = (e: React.FormEvent) => {
    e.preventDefault();
    const ansInt = parseInt(parentGateInput.trim(), 10);
    if (ansInt === parentGateQuestion.ans) {
      setShowParentGate(false);
      setIsParentMode(true);
      setParentGateError(false);
    } else {
      setParentGateError(true);
      // regen another puzzle
      setTimeout(() => {
        const num1 = Math.floor(Math.random() * 8) + 4;
        const num2 = Math.floor(Math.random() * 8) + 4;
        setParentGateQuestion({
          q: `${num1} × ${num2} = ?`,
          ans: num1 * num2
        });
        setParentGateInput("");
        setParentGateError(false);
      }, 1500);
    }
  };

  // Learning Engine trigger lesson generation
  const handleGenerateLesson = async () => {
    // Determine target topic
    const topicToQuery = customTopic.trim() || selectedPresetTopic;
    if (!topicToQuery) {
      setErrorMessage("Please choose or type a topic!");
      return;
    }

    // Free plan cap of 2 custom topic generations
    if (subStatus === "free" && customTopic.trim().length > 0) {
      const customCount = historyRecords.filter(r => !r.id.startsWith("demo")).length;
      if (customCount >= 2) {
        setErrorMessage(
          lang === "es"
            ? "✨ Límite Gratuito Alcanzado: Has generado tus 2 temas de prueba de forma gratuita. ¡Actualiza a Gold Umbrella para un sinfín de temas y personajes mágicos!"
            : lang === "fr"
            ? "✨ Limite gratuite atteinte : Vous avez déjà généré vos 2 sujets personnalisés de test. Passez à la formule Gold Umbrella pour créer des cours illimités !"
            : "✨ Free limit reached! You've generated your 2 test custom topics. Upgrade to Gold Umbrella or Supernova Family for unlimited custom topics and special characters!"
        );
        setShowSubscriptionModal(true);
        return;
      }
    }

    setIsGeneratingLesson(true);
    setErrorMessage(null);
    setCurrentLesson(null);
    setQuizAttemptAnswers([]);
    setActiveQuestionIndex(-1);
    setHasCompletedQuiz(false);

    try {
      const res = await fetch("/api/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicToQuery,
          gradeLevel: gradeLevel,
          language: lang,
          childName: childName
        })
      });

      if (!res.ok) {
        throw new Error("Generation server returned an error.");
      }

      const lessonData: LessonData = await res.json();
      setCurrentLesson(lessonData);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "An error occurred while calling the educational brain. Please try again.");
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  // Select Option on Quiz
  const handleSelectQuizOption = (optionIndex: number) => {
    const updated = [...quizAttemptAnswers];
    updated[activeQuestionIndex] = optionIndex;
    setQuizAttemptAnswers(updated);
  };

  // Advance Quiz
  const handleNextQuizQuestion = () => {
    if (!currentLesson) return;
    if (activeQuestionIndex < currentLesson.quiz.length - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
    } else {
      // Quiz Completed!
      let scoreNum = 0;
      const historyItems = currentLesson.quiz.map((q, idx) => {
        const isCorrect = quizAttemptAnswers[idx] === q.correctAnswerIndex;
        if (isCorrect) scoreNum++;
        return {
          question: q.question,
          selectedOption: q.options[quizAttemptAnswers[idx]] || "No Answer",
          correctOption: q.options[q.correctAnswerIndex],
          isCorrect
        };
      });

      setLastQuizScore(scoreNum);
      setHasCompletedQuiz(true);

      // Award dynamic star points
      const starReward = scoreNum * 10 + 5; // e.g. 35 stars for perfect score
      saveStudentStars(studentStars + starReward);

      // Save historic record
      const record: ScorePlayRecord = {
        id: "record_" + Date.now(),
        topic: currentLesson.topic,
        gradeLevel: currentLesson.gradeLevel,
        timestamp: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        childName: childName,
        score: scoreNum,
        totalQuestions: currentLesson.quiz.length,
        history: historyItems
      };

      const updatedHistory = [record, ...historyRecords];
      setHistoryRecords(updatedHistory);
      localStorage.setItem("umbrella_history", JSON.stringify(updatedHistory));
    }
  };

  // Parent Insight Generator
  const handleGenerateParentInsights = async (record: ScorePlayRecord) => {
    setSelectedHistoryId(record.id);
    setIsGeneratingParentInsights(true);
    setGeneratedInsights(null);

    try {
      const res = await fetch("/api/generate-parent-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName: record.childName,
          topic: record.topic,
          performanceHistory: record.history,
          language: lang
        })
      });

      if (!res.ok) throw new Error("Failed to generate parent advice.");
      const data: ParentInsights = await res.json();
      setGeneratedInsights(data);
    } catch (e) {
      console.error(e);
      // Show graceful fallback based on selected language
    } finally {
      setIsGeneratingParentInsights(false);
    }
  };

  const handleToggleCoLearningComplete = (recordId: string) => {
    let updated: string[];
    const isCompleted = completedChallenges.includes(recordId);
    if (isCompleted) {
      updated = completedChallenges.filter(id => id !== recordId);
      saveStudentStars(Math.max(0, studentStars - 15));
    } else {
      updated = [...completedChallenges, recordId];
      saveStudentStars(studentStars + 15);
    }
    setCompletedChallenges(updated);
    localStorage.setItem("umbrella_completedCoLearning", JSON.stringify(updated));
  };

  // Find Avatar Details
  const activeAvatar = PRESET_AVATARS.find(a => a.id === selectedAvatarId) || PRESET_AVATARS[0];

  return (
    <div className={`min-h-screen flex flex-col selection:bg-indigo-100 selection:text-indigo-900 ${themeMode === "charcoal" ? "theme-charcoal bg-[#0b0f19] text-slate-100" : "bg-slate-50 text-slate-800"}`}>
      
      {/* Visual Header / Brand Bar */}
      <header className={`sticky top-0 z-50 shadow-xs border-b transition-all duration-200 ${themeMode === "charcoal" ? "bg-[#0b0f19]/95 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-800"}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          
          {/* Main Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <span className="text-2xl" role="img" aria-label="Umbrella">☔</span>
            </div>
            <div>
              <h1 className="text-xl font-bold font-sans tracking-tight text-slate-900">
                {t.brandName}
              </h1>
              <p className="text-xs text-slate-500 font-sans tracking-wide">
                {t.brandTagline}
              </p>
            </div>
          </div>

          {/* Quick Stats, English/Spanish/French Toggle and Mode Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Dark/Light Theme Switcher Button */}
            <button
              onClick={() => {
                const nextTheme = themeMode === "charcoal" ? "light" : "charcoal";
                setThemeMode(nextTheme);
                localStorage.setItem("umbrella_themeMode", nextTheme);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all ${
                themeMode === "charcoal" ? "bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
              title="Toggle theme mode"
            >
              <span>{themeMode === "charcoal" ? "☀️ Light" : "🌙 Charcoal"}</span>
            </button>

            {/* Cell Phone View Switcher Button */}
            <button
              onClick={() => {
                const toggled = !isCellphoneBorderMode;
                setIsCellphoneBorderMode(toggled);
                localStorage.setItem("umbrella_deviceMode", toggled.toString());
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all ${
                isCellphoneBorderMode ? "bg-indigo-600 border-indigo-700 text-white hover:bg-indigo-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
              title="Toggle interactive mobile phone wrapper"
            >
              <span>📱 {isCellphoneBorderMode ? "Desktop" : "Phone View"}</span>
            </button>

            {/* Landing page vs Workspace toggle */}
            <button
              onClick={() => setCurrentView(currentView === "landing" ? "app" : "landing")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all ${
                currentView === "landing"
                  ? "bg-indigo-600 border-indigo-700 text-white shadow-xs hover:bg-indigo-700"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{currentView === "landing" ? (lang === "es" ? "Entrar al Simulador" : lang === "fr" ? "Simulateur" : "Enter Simulator") : (lang === "es" ? "Página Principal" : lang === "fr" ? "Accueil" : "Landing Page")}</span>
            </button>

            {/* Subscription active badge */}
            <button
              onClick={() => setShowSubscriptionModal(true)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black rounded-full border transition-all ${
                subStatus === "family"
                  ? "bg-purple-150 hover:bg-purple-200 border-purple-300 text-purple-750 shadow-xs scale-102"
                  : subStatus === "premium"
                  ? "bg-amber-100 hover:bg-amber-100 border-amber-300 text-amber-800 shadow-xs scale-102"
                  : "bg-slate-100 hover:bg-slate-205 border-slate-200 text-slate-700"
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>
                {subStatus === "family"
                  ? (lang === "es" ? "Familia Supernova 🚀" : lang === "fr" ? "Famille Supernova 🚀" : "Supernova Family 🚀")
                  : subStatus === "premium"
                  ? (lang === "es" ? "Gold Premium ⭐" : lang === "fr" ? "Formule Gold ⭐" : "Gold Premium ⭐")
                  : (lang === "es" ? "Suscripción Gratuita ☔" : lang === "fr" ? "Formule Gratuite ☔" : "Silver Free ☔")}
              </span>
            </button>

            {/* Stars Counter */}
            <motion.div 
              key={studentStars}
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-amber-700 text-sm font-semibold shadow-2xs"
            >
              <span className="text-base">⭐</span>
              <span>{studentStars} {t.points}</span>
            </motion.div>

            {/* Language Toggle */}
            <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">
              <button 
                onClick={() => setLang("en")}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${lang === "en" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                🇺🇸 EN
              </button>
              <button 
                onClick={() => setLang("es")}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${lang === "es" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                🇪🇸 ES
              </button>
              <button 
                onClick={() => setLang("fr")}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${lang === "fr" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                🇫🇷 FR
              </button>
            </div>

            {/* Student Mode / Parent Dashboard Selector */}
            <div className="flex bg-slate-100 rounded-full p-1 border border-slate-200">
              <button
                onClick={() => {
                  setIsParentMode(false);
                  setGeneratedInsights(null);
                }}
                className={`flex items-center gap-1 px-4 py-1.5 text-xs font-bold rounded-full transition-all ${!isParentMode ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-600 hover:text-slate-950"}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {t.modeStudent}
              </button>
              <button
                onClick={() => {
                  if (isParentMode) {
                    setIsParentMode(false);
                  } else {
                    triggerParentGate();
                  }
                }}
                className={`flex items-center gap-1 px-4 py-1.5 text-xs font-bold rounded-full transition-all ${isParentMode ? "bg-slate-800 text-white shadow-md" : "text-slate-600 hover:text-slate-950"}`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {t.modeParent}
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Main Container Area */}
      <main className={`flex-1 w-full mx-auto p-4 sm:p-6 transition-all duration-300 ${isCellphoneBorderMode ? "max-w-md" : "max-w-7xl lg:p-8"}`}>
        
        {isCellphoneBorderMode && (
          <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between text-xs text-indigo-900">
            <div className="flex items-center gap-1.5 font-sans font-medium">
              <span>📱</span>
              <span><strong>Interactive Phone Wrapper:</strong> Testing workspace in mobile layout!</span>
            </div>
            <button
              onClick={() => setIsCellphoneBorderMode(false)}
              className="text-[10px] font-black underline uppercase"
            >
              Disable
            </button>
          </div>
        )}
        
        <div className={isCellphoneBorderMode ? "border-[12px] border-slate-900 rounded-[44px] shadow-2xl relative overflow-hidden bg-white p-4 outline-8 outline-indigo-500/5 min-h-[750px] flex flex-col" : ""}>
          {isCellphoneBorderMode && (
            <div className="h-6 flex items-center justify-between text-[11px] font-sans font-bold text-slate-400 select-none border-b border-slate-150 pb-2 mb-4">
              <span>9:41 AM</span>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">CO-PLAY UNIT</span>
              <div className="flex items-center gap-1">
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>
          )}
        
        {/* Verification Secure Parent Gate Modal */}
        <AnimatePresence>
          {showParentGate && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100"
              >
                <div className="flex items-center gap-3 mb-4 text-slate-800">
                  <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold font-sans">
                    {t.parentGateTitle}
                  </h3>
                </div>

                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  {t.parentGateDetail}
                </p>

                <form onSubmit={handleVerifyParentGate} className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center font-mono text-2xl font-bold tracking-wider text-indigo-700">
                    {parentGateQuestion.q}
                  </div>

                  <div>
                    <input 
                      type="number"
                      required
                      className="w-full text-center text-lg font-bold bg-slate-50 border-2 border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={t.parentGatePlaceholder}
                      value={parentGateInput}
                      onChange={(e) => setParentGateInput(e.target.value)}
                    />
                  </div>

                  {parentGateError && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-semibold text-rose-500 text-center"
                    >
                      {t.parentGateError}
                    </motion.p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => setShowParentGate(false)}
                      className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Key className="w-4 h-4" />
                      {t.verify}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ----------------- Active View: LANDING PAGE OR WORKSPACE ----------------- */}
        {currentView === "landing" ? (
          <div className="space-y-12 py-4">
            {/* Awesome Hero banner - 2 columns layout on desktop with Live Interactive phone frame */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-7xl mx-auto pt-6 px-4">
              {/* Left Column: Hero texts */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-7 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start"
              >
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                  <span>☔ Umbrella Learning Co-Discovery™ Project</span>
                </div>
                
                <h2 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-black font-sans tracking-tight text-slate-900 leading-tight">
                  {t.landingHeroTitle}
                </h2>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-sans max-w-2xl mx-auto font-medium lg:mx-0">
                  {t.landingHeroSubtitle}
                </p>

                {/* Main Landing Calls To Action */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2 w-full">
                  <button
                    onClick={() => setCurrentView("app")}
                    className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-sm transition-all shadow-md shadow-indigo-100 hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <Compass className="w-4 h-4" />
                    <span>{t.landingBtnTest}</span>
                  </button>
                  
                  {/* Payments trigger button */}
                  <button
                    type="button"
                    onClick={() => {
                      setPendingPlanTier("premium");
                      setShowPaymentDetailsModal(true);
                    }}
                    className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl text-sm transition-all shadow-md hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4 text-slate-950" />
                    <span>{lang === "es" ? "Aceptar Pagos" : lang === "fr" ? "Portail de Paiement" : "Payment & Billing"}</span>
                  </button>
                </div>
              </motion.div>

              {/* Right Column: High-fidelity Interactive Mobile Simulator */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-5 flex justify-center py-4 relative w-full"
              >
                {/* Simulated Smartphone Shell */}
                <div className="w-[320px] h-[645px] bg-slate-950 rounded-[44px] border-[12px] border-slate-900 shadow-2xl relative overflow-hidden flex flex-col justify-between p-1 ring-8 ring-indigo-500/5 transition-all duration-300">
                  {/* Inner Phone Speaker and Camera */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-black rounded-full z-40 flex items-center justify-between px-3.5 text-[8px] text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-505/50 animate-pulse"></span>
                    <span className="font-extrabold text-[7px] text-slate-400">CO-PLAY</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                  </div>

                  {/* Phone Status Bar */}
                  <div className="h-8 min-h-[32px] px-6 text-[10px] font-sans font-bold flex items-center justify-between text-slate-400 select-none z-30 pt-1">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>

                  {/* Live Interactive Canvas of Mobile Simulation */}
                  <div className="flex-1 overflow-y-auto scrollbar-none rounded-[32px] bg-white flex flex-col relative text-slate-800">
                    {/* Simulator Header */}
                    <div className="bg-indigo-600 text-white p-3 pt-4 text-center space-y-1 rounded-t-[30px] shadow-sm">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-800 px-1.5 py-0.5 rounded">
                          {simulatedView === "kid" ? "🦁 Kid Quest" : simulatedView === "parent" ? "👩 Parent Hub" : "💳 Billing"}
                        </span>
                        <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[9px] font-bold">
                          <span>⭐</span>
                          <span>{simulatedPoints}</span>
                        </div>
                      </div>
                    </div>

                    {/* Simulator Tab bar inside device */}
                    <div className="grid grid-cols-3 bg-indigo-50 p-1 border-b border-indigo-100 text-center gap-0.5">
                      <button
                        onClick={() => setSimulatedView("kid")}
                        className={`py-1.5 text-[9px] font-bold rounded-md transition-colors ${simulatedView === "kid" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-105"}`}
                      >
                        🦁 {lang === "es" ? "Estudiante" : lang === "fr" ? "Élève" : "Student"}
                      </button>
                      <button
                        onClick={() => setSimulatedView("parent")}
                        className={`py-1.5 text-[9px] font-bold rounded-md transition-colors ${simulatedView === "parent" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-105"}`}
                      >
                        👩 {lang === "es" ? "Padre" : lang === "fr" ? "Tuteur" : "Coach"}
                      </button>
                      <button
                        onClick={() => setSimulatedView("payment")}
                        className={`py-1.5 text-[9px] font-bold rounded-md transition-colors ${simulatedView === "payment" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-105"}`}
                      >
                        💳 {lang === "es" ? "Pagar" : lang === "fr" ? "Abonner" : "Payment"}
                      </button>
                    </div>

                    {/* Simulator Main Feed Area */}
                    <div className="flex-1 p-3 flex flex-col justify-between text-left font-sans text-xs space-y-3">
                      
                      {/* VIEW: KID QUEST */}
                      {simulatedView === "kid" && (
                        <div className="space-y-2 flex-1 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <div className="p-2 bg-blue-50 border border-blue-100 rounded-xl space-y-1">
                              <span className="text-[9px] font-black uppercase text-blue-600 block">Active Story Lesson</span>
                              <h5 className="font-extrabold text-slate-900 leading-tight">Leon's Baking Division Adventure</h5>
                              <p className="text-[10px] text-slate-500 leading-relaxed">
                                "We have 10 chocolate chips and want to divide them equally between 3 cookies. How many leftover chips are left?"
                              </p>
                            </div>

                            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Choose option:</span>
                            
                            <div className="space-y-1">
                              {/* Option A */}
                              <button
                                type="button"
                                onClick={() => setSimulatedInputOption(0)}
                                className={`w-full p-2 rounded-xl border text-left font-bold text-[10px] transition-all flex items-center justify-between ${
                                  simulatedInputOption === 0 ? "border-rose-400 bg-rose-50 text-rose-800" : "border-slate-205 bg-white hover:bg-slate-50"
                                }`}
                              >
                                <span>A. 0 chips (No remainder)</span>
                                {simulatedInputOption === 0 && <span className="text-xs">❌</span>}
                              </button>
                              
                              {/* Option B (Correct) */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSimulatedInputOption(1);
                                  if (simulatedInputOption !== 1) {
                                    setSimulatedPoints(p => p + 15);
                                  }
                                }}
                                className={`w-full p-2 rounded-xl border text-left font-bold text-[10px] transition-all flex items-center justify-between ${
                                  simulatedInputOption === 1 ? "border-emerald-400 bg-emerald-50 text-emerald-800" : "border-slate-205 bg-white hover:bg-slate-50"
                                }`}
                              >
                                <span>B. Only 1 chip left over!</span>
                                {simulatedInputOption === 1 && <span className="text-xs animate-bounce">⭐ +15 Points</span>}
                              </button>

                              {/* Option C */}
                              <button
                                type="button"
                                onClick={() => setSimulatedInputOption(2)}
                                className={`w-full p-2 rounded-xl border text-left font-bold text-[10px] transition-all flex items-center justify-between ${
                                  simulatedInputOption === 2 ? "border-rose-400 bg-rose-50 text-rose-800" : "border-slate-205 bg-white hover:bg-slate-50"
                                }`}
                              >
                                <span>C. 3 leftover chips</span>
                                {simulatedInputOption === 2 && <span className="text-xs">❌</span>}
                              </button>
                            </div>
                          </div>

                          {simulatedInputOption === 1 && (
                            <div className="p-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-center text-[10px] text-emerald-800 font-extrabold animate-pulse">
                              🎉 Awesome! Star added to parent scoreboard!
                            </div>
                          )}

                          <div className="text-[9px] text-slate-400 text-center italic">
                            Click option B to test correct answer trigger!
                          </div>
                        </div>
                      )}

                      {/* VIEW: PARENT HUB */}
                      {simulatedView === "parent" && (
                        <div className="space-y-2 flex-1 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 justify-between">
                              <span className="text-[9px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-black uppercase">
                                At-Home Action Coach
                              </span>
                              <span className="text-[10px] font-bold text-slate-500">Ethan's Progress</span>
                            </div>

                            <div className="p-2 bg-slate-100 border border-slate-200 rounded-xl space-y-1">
                              <h5 className="font-extrabold text-slate-900 leading-tight">🔬 Division Teaspoon Game</h5>
                              <p className="text-[10px] text-slate-650 leading-relaxed font-semibold">
                                "Wait for your child to complain! Then, ask them to divide 7 teaspoons equally between 3 cups. Ask them what to do with the leftover teaspoon."
                              </p>
                            </div>

                            <ul className="text-[9px] space-y-1 font-medium text-slate-500 select-none">
                              <li className="flex items-center gap-1">
                                <span className="text-emerald-500 font-bold">✓</span>
                                <span>Provides physical, visual co-learning.</span>
                              </li>
                              <li className="flex items-center gap-1">
                                <span className="text-emerald-500 font-bold">✓</span>
                                <span>Offline, 100% screen-free exercise.</span>
                              </li>
                              <li className="flex items-center gap-1">
                                <span className="text-emerald-500 font-bold">✓</span>
                                <span>Master remainder arithmetic concepts.</span>
                              </li>
                            </ul>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSimulatedCompletedChallenge(true);
                              setSimulatedPoints(p => p + 15);
                            }}
                            disabled={simulatedCompletedChallenge}
                            className={`w-full py-2 px-3 rounded-xl text-[10px] font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                              simulatedCompletedChallenge 
                                ? "bg-indigo-50 text-indigo-400 cursor-default" 
                                : "bg-indigo-650 hover:bg-indigo-700 text-white shadow-xs"
                            }`}
                          >
                            <span>{simulatedCompletedChallenge ? "✅ Challenge Logged!" : "🏆 Log Challenge Completed (+15 pts)"}</span>
                          </button>
                        </div>
                      )}

                      {/* VIEW: PAYMENT / BILLING */}
                      {simulatedView === "payment" && (
                        <div className="space-y-2 flex-1 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-black uppercase text-amber-600 block">Accelerated Sandbox Upgrades</span>
                            
                            <div className="space-y-1">
                              {/* Gold Sim Plan */}
                              <div className="p-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex items-center justify-between">
                                <div className="text-left">
                                  <h6 className="font-black text-slate-900 text-[9px]">Gold Pro Plan</h6>
                                  <p className="text-[8px] text-slate-400 leading-none">Infinite custom topics</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSimulatedActivePlan("gold");
                                    setSimulatedPoints(p => p + 50);
                                  }}
                                  className="py-1 px-2 bg-amber-500 text-slate-950 font-black text-[9px] rounded-lg hover:bg-amber-600 shrink-0"
                                >
                                  {simulatedActivePlan === "gold" || simulatedActivePlan === "family" ? "Active" : "$9.99"}
                                </button>
                              </div>

                              {/* Family Sim Plan */}
                              <div className="p-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl flex items-center justify-between">
                                <div className="text-left">
                                  <h6 className="font-black text-slate-900 text-[9px]">Supernova Sibling</h6>
                                  <p className="text-[8px] text-slate-400 leading-none">Multi-sibling switcher</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSimulatedActivePlan("family");
                                    setSimulatedPoints(p => p + 100);
                                  }}
                                  className="py-1 px-2 bg-purple-600 text-white font-black text-[9px] rounded-lg hover:bg-purple-750 shrink-0"
                                >
                                  {simulatedActivePlan === "family" ? "Active" : "$14.99"}
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="p-1 bg-slate-50 rounded text-[8px] text-slate-400 text-center">
                            Toggle simulated plans to view features instantly!
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Simulated Mobile Navigation Line */}
                    <div className="h-5 flex items-center justify-center select-none bg-slate-950 pb-1 rounded-b-[32px]">
                      <div className="w-20 h-1 bg-slate-700 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick-Start Demo Presets segment */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto text-center shadow-xs"
            >
              <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1 font-extrabold uppercase tracking-wide rounded-full">
                🚀 Skip Quizzes: Pre-populate Sandbox
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-3 mb-2">
                {lang === "es" ? "Prueba un perfil pre-cargado al instante" : lang === "fr" ? "Testez un profil pré-chargé instantanément" : "Test a Pre-loaded Persona Instantaneously"}
              </h3>
              <p className="text-xs text-slate-500 font-sans max-w-lg mx-auto mb-6">
                {lang === "es" 
                  ? "Evita responder los cuestionarios tú mismo. Haz clic en cualquiera de estos estudiantes para rellenar el Panel Parental con historial académico y desafíos de juego físico de inmediato." 
                  : lang === "fr"
                  ? "Évitez de remplir les quiz vous-même. Cliquez sur un élève pour charger directement le tableau de bord avec un historique et un défi physique de co-apprentissage."
                  : "Skip the student quiz step. Select a persona below to populate the Parent Dashboard with full history & interactive physical challenges immediately."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
                {/* Math Persona */}
                <button
                  type="button"
                  onClick={() => handlePreloadDemo("math")}
                  className="group bg-slate-50 hover:bg-gradient-to-br hover:from-slate-50 hover:to-indigo-50/40 p-5 rounded-2xl border border-slate-200/80 transition-all text-left hover:scale-[1.02] hover:border-indigo-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🦁</span>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-950 transition-colors">
                        {lang === "es" ? "Lucas (Mate - Grado 3)" : lang === "fr" ? "Lucas (Maths - CE2)" : "Lucas (Gr. 3 Math)"}
                      </h4>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded-md">
                        {lang === "es" ? "División Larga" : lang === "fr" ? "Division simple" : "Long Division"}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-3 leading-relaxed">
                    {lang === "es" 
                      ? "Verás cómo sus errores con los sobrantes generan un divertido juego físico de reparto de cucharas."
                      : lang === "fr"
                      ? "Découvrez comment ses erreurs sur les restes génèrent un jeu réel de petites cuillères."
                      : "See how his struggles with division remainders compile into a kitchen teaspoon-sharing offline game."}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 mt-3 group-hover:translate-x-1 transition-transform">
                    {lang === "es" ? "Cargar caso Lucas →" : lang === "fr" ? "Charger Lucas →" : "Load Lucas Demo →"}
                  </span>
                </button>

                {/* Science Persona */}
                <button
                  type="button"
                  onClick={() => handlePreloadDemo("science")}
                  className="group bg-slate-50 hover:bg-gradient-to-br hover:from-slate-50 hover:to-indigo-50/40 p-5 rounded-2xl border border-slate-200/80 transition-all text-left hover:scale-[1.02] hover:border-indigo-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🧙</span>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-950 transition-colors">
                        {lang === "es" ? "Sofía (Ciencia - Grado 4)" : lang === "fr" ? "Sophie (Science - CM1)" : "Sophia (Gr. 4 Science)"}
                      </h4>
                      <span className="text-[10px] bg-purple-50 text-purple-700 font-extrabold px-1.5 py-0.5 rounded-md">
                        {lang === "es" ? "Botánica Natural" : lang === "fr" ? "Botanique" : "Plants & Cold"}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-3 leading-relaxed">
                    {lang === "es"
                      ? "Su confusión sobre la hibernación de hojas activa un desafío táctil de mantas térmicas."
                      : lang === "fr"
                      ? "Ses hésitations sur la survie végétale l'hiver ouvrent un jeu tactile de manteau pour les feuilles."
                      : "Sophia's stumbles on plant cell freezing trigger a physical sensory tissue-wrapping forest leaf blanket quest."}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 mt-3 group-hover:translate-x-1 transition-transform">
                    {lang === "es" ? "Cargar caso Sofía →" : lang === "fr" ? "Charger Sophie →" : "Load Sophia Demo →"}
                  </span>
                </button>

                {/* Astronomy Persona */}
                <button
                  type="button"
                  onClick={() => handlePreloadDemo("astronomy")}
                  className="group bg-slate-50 hover:bg-gradient-to-br hover:from-slate-50 hover:to-indigo-50/40 p-5 rounded-2xl border border-slate-200/80 transition-all text-left hover:scale-[1.02] hover:border-indigo-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🚀</span>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-950 transition-colors">
                        {lang === "es" ? "Mateo (Espacio - Grado 5)" : lang === "fr" ? "Mathéo (Espace - CM2)" : "Matthew (Gr. 5 Space)"}
                      </h4>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded-md">
                        {lang === "es" ? "Órbitas y Sol" : lang === "fr" ? "Gravitation" : "Orbits & Gravity"}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-3 leading-relaxed">
                    {lang === "es"
                      ? "Su avance perfecto genera recomendaciones avanzadas y un juego físico de taza giratoria orbital."
                      : lang === "fr"
                      ? "Son parcours parfait mène à des conseils d'extension stellaire et un défi physique de tasse rotative gravitationnelle."
                      : "His high performance unlocks orbital velocity games swirling physical coins around household mugs."}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 mt-3 group-hover:translate-x-1 transition-transform">
                    {lang === "es" ? "Cargar caso Mateo →" : lang === "fr" ? "Charger Mathéo →" : "Load Matthew Demo →"}
                  </span>
                </button>
              </div>
            </motion.div>

            {/* Testimonials Box and Client Confidence Bar */}
            <motion.div 
              initial={{ opacity: 0 }} 
              whileInView={{ opacity: 1 }} 
              className="max-w-4xl mx-auto rounded-3xl bg-indigo-900 text-white p-6 sm:p-8 relative overflow-hidden shadow-md"
            >
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4 select-none pointer-events-none">
                <span className="text-9xl">☔</span>
              </div>
              <div className="relative space-y-3 z-10 text-left">
                <span className="text-amber-300 font-sans text-sm tracking-wider block">★★★★★ Trusted by Parents</span>
                <p className="text-sm sm:text-base italic leading-relaxed font-serif text-indigo-100">
                  {t.landingTestimonial}
                </p>
              </div>
            </motion.div>

            {/* Feature presentation Bento Grid */}
            <div className="max-w-5xl mx-auto space-y-6 pt-2 font-sans">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 text-center">
                {t.landingFeatureTitle}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {/* Feature 1 */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs space-y-2.5">
                  <div className="h-9 w-9 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg">
                    🧠
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{t.landingFeature1Title}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {t.landingFeature1Desc}
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs space-y-2.5">
                  <div className="h-9 w-9 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center font-bold text-lg">
                    🤝
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{t.landingFeature2Title}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {t.landingFeature2Desc}
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs space-y-2.5">
                  <div className="h-9 w-9 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center font-bold text-lg">
                    📊
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{t.landingFeature3Title}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {t.landingFeature3Desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Sandbox Guide step stepper */}
            <div className="bg-slate-100 border border-slate-200/40 rounded-3xl p-6 max-w-4xl mx-auto space-y-4 font-sans text-left">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-500" />
                {t.landingHowItWorksTitle}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-600 font-medium">
                <div className="p-3 bg-white rounded-xl border border-slate-200/50">
                  {t.landingHowStep1}
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/50">
                  {t.landingHowStep2}
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/50">
                  {t.landingHowStep3}
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/50">
                  {t.landingHowStep4}
                </div>
              </div>
            </div>

            {/* Premium Pricing & Subscriptions Section */}
            <div className="max-w-5xl mx-auto space-y-8 pt-8 font-sans text-center">
              <div className="space-y-3">
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-3 py-1 font-extrabold uppercase tracking-wide rounded-full">
                  💎 Premium Subscription Plans
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {lang === "es" ? "Planes Diseñados para Familias Reales" : lang === "fr" ? "Abonnements conçus pour les familles" : "Subscription Tiers Built for Every Family"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                  {lang === "es" 
                    ? "Elige el plan ideal para desbloquear temas ilimitados, avatares mágicos y múltiples perfiles para tus hijos." 
                    : lang === "fr"
                    ? "Choisissez l'abonnement idéal pour débloquer des sujets illimités, des avatars magiques et la gestion multi-profils."
                    : "Select the perfect roadmap to unlock endless custom learning directions, premium characters, and multiple sibling profiles."}
                </p>

                {/* Billing Cycle Toggle */}
                <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 p-1 rounded-xl mt-4">
                  <button
                    type="button"
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      billingCycle === "monthly" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {lang === "es" ? "Mensual" : lang === "fr" ? "Mensuel" : "Monthly"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle("annual")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                      billingCycle === "annual" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <span>{lang === "es" ? "Anual" : lang === "fr" ? "Annuel" : "Annual"}</span>
                    <span className="text-[9px] bg-purple-100 text-purple-700 font-extrabold px-1 rounded-sm leading-none py-0.5">
                      Save 20%
                    </span>
                  </button>
                </div>
              </div>

              {/* Pricing Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left items-stretch pt-2">
                
                {/* Silver Free Tier */}
                <div className={`bg-white rounded-3xl p-6 border-2 transition-all flex flex-col justify-between ${
                  subStatus === "free" ? "border-slate-300 shadow-xs" : "border-slate-100 opacity-90 hover:opacity-100"
                }`}>
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                          ☔ Silver Plan
                        </span>
                        <h4 className="text-lg font-black text-slate-900 mt-1">
                          {lang === "es" ? "Gratuito Básico" : lang === "fr" ? "Standard Gratuit" : "Silver Free"}
                        </h4>
                      </div>
                      {subStatus === "free" && (
                        <span className="bg-slate-100 text-slate-600 font-bold text-[9px] uppercase px-2 py-0.5 rounded-md">
                          Active
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-4 mb-5">
                      <span className="text-3xl font-black text-slate-900">$0</span>
                      <span className="text-xs text-slate-400 font-bold"> / {lang === "es" ? "por siempre" : lang === "fr" ? "pour toujours" : "forever"}</span>
                    </div>

                    <ul className="space-y-3 border-t border-slate-100 pt-4 text-xs font-medium text-slate-600">
                      <li className="flex items-center gap-2">
                        <span className="text-slate-400 text-xs">✓</span>
                        <span>{lang === "es" ? "Temas preestablecidos ilimitados" : lang === "fr" ? "Cours préexistants illimités" : "Unlimited Preset Topics"}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-slate-400 text-xs">✓</span>
                        <span>{lang === "es" ? "Máximo 2 temas generados por IA" : lang === "fr" ? "2 sujets IA de test max" : "Max 2 AI generated custom topics"}</span>
                      </li>
                      <li className="flex items-center gap-2 text-slate-400">
                        <span>✗</span>
                        <span>{lang === "es" ? "Impresión de certificados" : lang === "fr" ? "Imprimer des certificats" : "No Certificate Printing"}</span>
                      </li>
                      <li className="flex items-center gap-2 text-slate-400">
                        <span>✗</span>
                        <span>{lang === "es" ? "Personajes premium de avatar" : lang === "fr" ? "Avatars magiques premium" : "Locked premium characters"}</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSubStatus("free");
                      localStorage.setItem("umbrella_subStatus", "free");
                      alert(lang === "es" ? "Suscripción Gratuita activada correctamente." : lang === "fr" ? "Formule gratuite activée." : "Successfully switched back to Silver Free subscription.");
                    }}
                    className={`w-full mt-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      subStatus === "free"
                        ? "bg-slate-100 text-slate-500 cursor-default"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                    }`}
                  >
                    {subStatus === "free" 
                      ? (lang === "es" ? "Suscripción Activa" : lang === "fr" ? "Actif" : "Active Plan") 
                      : (lang === "es" ? "Cambiar a Gratis" : lang === "fr" ? "Passer au Gratuit" : "Downgrade to Free")}
                  </button>
                </div>

                {/* Gold Pro Tier */}
                <div className={`bg-gradient-to-b from-white to-amber-50/10 rounded-3xl p-6 border-2 transition-all flex flex-col justify-between relative ${
                  subStatus === "premium" ? "border-amber-400 shadow-md shadow-amber-50" : "border-slate-100 hover:border-amber-100"
                }`}>
                  <span className="absolute -top-3 right-4 bg-amber-500 text-white font-black text-[9px] uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-xs leading-none">
                    ⭐ BEST VALUE
                  </span>

                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-black text-amber-600 uppercase tracking-widest block">
                          ⚡ Gold Umbrella
                        </span>
                        <h4 className="text-lg font-black text-slate-900 mt-1">
                          {lang === "es" ? "Paraguas Dorado Pro" : lang === "fr" ? "Formule Gold Pro" : "Gold Umbrella Pro"}
                        </h4>
                      </div>
                      {subStatus === "premium" && (
                        <span className="bg-amber-100 text-amber-800 font-bold text-[9px] uppercase px-2 py-0.5 rounded-md">
                          Active Premium
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-4 mb-5">
                      <span className="text-3xl font-black text-slate-900">
                        {billingCycle === "monthly" ? "$9.99" : "$7.99"}
                      </span>
                      <span className="text-xs text-slate-400 font-bold"> / {lang === "es" ? "mes" : lang === "fr" ? "mois" : "month"}</span>
                      {billingCycle === "annual" && (
                        <p className="text-[9px] text-amber-600 font-bold mt-0.5">* Billed Annually ($95.88 / year)</p>
                      )}
                    </div>

                    <ul className="space-y-3 border-t border-amber-100 pt-4 text-xs font-medium text-slate-600">
                      <li className="flex items-center gap-2">
                        <span className="text-amber-500 text-xs">✓</span>
                        <span className="font-semibold text-slate-800">
                          {lang === "es" ? "Temas de IA de educación ilimitados" : lang === "fr" ? "Cours d'IA personnalisés illimités" : "Unlimited AI Custom Topics"}
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-amber-500 text-xs">✓</span>
                        <span>{lang === "es" ? "Impresión de certificados de oro 📜" : lang === "fr" ? "Impression de certificats d'or 📜" : "Print Gold Milestone Certificates 📜"}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-amber-500 text-xs">✓</span>
                        <span>{lang === "es" ? "Desbloquea personajes (Unicornio, Dragón)" : lang === "fr" ? "Débloque licornes et dragons" : "Unlock Premium Characters (Unicorn & Dragon)"}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-amber-500 text-xs">✓</span>
                        <span>{lang === "es" ? "Consejos de tutoría profunda" : lang === "fr" ? "Conseils pédagogiques avancés" : "Expanded Parental Analytics"}</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSubStatus("premium");
                      localStorage.setItem("umbrella_subStatus", "premium");
                      alert(lang === "es" 
                        ? "🎉 ¡Actualizado al plan Paraguas Dorado Pro! Recibes generación ilimitada de temas personalizados y desbloqueas avatars premium." 
                        : lang === "fr"
                        ? "🎉 Bienvenue dans la formule Gold ! Accès illimité aux sujets personnalisés activé."
                        : "🎉 Successfully updated to Gold Umbrella Pro (Simulated checkout completion)! Infinite customized AI lessons and premium characters are now unlocked!");
                    }}
                    className={`w-full mt-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      subStatus === "premium"
                        ? "bg-amber-500 text-white cursor-default"
                        : "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                    }`}
                  >
                    {subStatus === "premium" 
                      ? (lang === "es" ? "Plan Activo Premiado" : lang === "fr" ? "Actif" : "Active Plan") 
                      : (lang === "es" ? "Probar Gold Pro (Simulación)" : lang === "fr" ? "Souscrire Gold (Simulé)" : "Upgrade to Gold Pro (Simulated)")}
                  </button>
                </div>

                {/* Supernova Family Tier */}
                <div className={`bg-gradient-to-b from-white to-purple-50/10 rounded-3xl p-6 border-2 transition-all flex flex-col justify-between relative ${
                  subStatus === "family" ? "border-purple-400 shadow-md shadow-purple-50" : "border-slate-100 hover:border-purple-100"
                }`}>
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-black text-purple-600 uppercase tracking-widest block">
                          🚀 Galaxy Tier
                        </span>
                        <h4 className="text-lg font-black text-slate-900 mt-1">
                          {lang === "es" ? "Familia Supernova" : lang === "fr" ? "Famille Supernova" : "Supernova Family"}
                        </h4>
                      </div>
                      {subStatus === "family" && (
                        <span className="bg-purple-100 text-purple-800 font-bold text-[9px] uppercase px-2 py-0.5 rounded-md">
                          Active Family
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-4 mb-5">
                      <span className="text-3xl font-black text-slate-900">
                        {billingCycle === "monthly" ? "$14.99" : "$11.99"}
                      </span>
                      <span className="text-xs text-slate-400 font-bold"> / {lang === "es" ? "mes" : lang === "fr" ? "mois" : "month"}</span>
                      {billingCycle === "annual" && (
                        <p className="text-[9px] text-purple-600 font-bold mt-0.5">* Billed Annually ($143.88 / year)</p>
                      )}
                    </div>

                    <ul className="space-y-3 border-t border-purple-100 pt-4 text-xs font-medium text-slate-600">
                      <li className="flex items-center gap-2">
                        <span className="text-purple-500 text-xs">✓</span>
                        <span className="font-semibold text-slate-800">
                          {lang === "es" ? "Gestión de perfiles de hermanos" : lang === "fr" ? "Gestion multi-profils (fratrie)" : "Multi-Child Profile Switcher"}
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-purple-500 text-xs">✓</span>
                        <span>{lang === "es" ? "Todo lo incluido en el plan Gold Pro" : lang === "fr" ? "Tout le contenu Gold inclus" : "Everything in Gold Pro Plan"}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-purple-500 text-xs">✓</span>
                        <span>{lang === "es" ? "Generaciones rápidas prioritarias" : lang === "fr" ? "Générations prioritaires ultrarapides" : "Priority Processing Speeds"}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-purple-500 text-xs">✓</span>
                        <span>{lang === "es" ? "Añadir hasta 5 niños personalizados" : lang === "fr" ? "Ajouter jusqu'à 5 profils" : "Add up to 5 custom child profiles"}</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSubStatus("family");
                      localStorage.setItem("umbrella_subStatus", "family");
                      alert(lang === "es" 
                        ? "🎉 ¡Actualizado al plan Familiar Supernova! Has habilitado el selector de perfiles de hijos en la barra lateral." 
                        : lang === "fr"
                        ? "🎉 Formule Famille activée ! Gestion de plusieurs profils activée dans la barre latérale."
                        : "🎉 Successfully upgraded to Supernova Family Plan (Simulated check-out)! Multi-Child Profile Switcher bar is now enabled directly within your workspace sidebar.");
                    }}
                    className={`w-full mt-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      subStatus === "family"
                        ? "bg-purple-600 text-white cursor-default"
                        : "bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                    }`}
                  >
                    {subStatus === "family" 
                      ? (lang === "es" ? "Plan Activo Familiar" : lang === "fr" ? "Actif" : "Active Plan") 
                      : (lang === "es" ? "Probar Familia (Simulación)" : lang === "fr" ? "Souscrire Famille (Simulé)" : "Upgrade to Family (Simulated)")}
                  </button>
                </div>

              </div>
            </div>

            {/* Bottom CTA Card */}
            <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-800 text-white p-8 text-center space-y-5 shadow-lg shadow-indigo-100 font-sans">
              <h3 className="text-xl sm:text-2xl font-extrabold">{t.landingSandboxTitle}</h3>
              <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-semibold max-w-lg mx-auto">
                {lang === "es" 
                  ? "Crea lecciones a medida sobre cualquier tema imaginable, pon a prueba la IA de Gemini, y conviértete en el compañero de aventuras de tu hijo hoy." 
                  : lang === "fr"
                  ? "Créez vos propres micro-cours sur n'importe quel sujet, testez de vrais quiz et connectez-vous avec votre enfant dès aujourd'hui."
                  : "Generate custom lessons on any subject imaginable, run Gemini-powered quizzes, and claim your physical Co-Learning stars now."}
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    handlePreloadDemo("math");
                  }}
                  className="px-8 py-3.5 bg-white text-indigo-700 font-black rounded-xl text-xs hover:bg-slate-50 hover:scale-[1.01] transition-all shadow-md shadow-indigo-900/10"
                >
                  {t.landingSandboxBtn}
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* WORKSPACE WRAPPER */
          <>
            {/* ----------------- Active View: STUDENT MODE ----------------- */}
            {!isParentMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Student Profile Configuration & Topic Explorer (Outer width: 4 or 5 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Profile Card & Avatar Selection */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-500" />
                    {t.studentProfile}
                  </h3>
                  <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded-md">
                    {gradeLevel} {t.grade}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Family Profiles Switcher Selector */}
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold text-slate-700 tracking-wider uppercase flex items-center gap-1">
                        👥 {lang === "es" ? "Perfiles Familiares" : lang === "fr" ? "Profils de Famille" : "Student Profiles"}
                      </span>
                      {subStatus !== "family" && (
                        <button 
                          onClick={() => setShowSubscriptionModal(true)}
                          className="text-[9px] bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-650 hover:to-indigo-650 text-white font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider scale-95"
                        >
                          👑 Family Option
                        </button>
                      )}
                    </div>

                    <div className="flex gap-1.5 pb-1 overflow-x-auto scrollbar-none">
                      {familyProfiles.map((p, pIdx) => {
                        const avDetail = PRESET_AVATARS.find(a => a.id === p.avatarId) || PRESET_AVATARS[0];
                        const isSelected = activeProfileIndex === pIdx && subStatus === "family";
                        return (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => {
                              if (subStatus !== "family") {
                                setShowSubscriptionModal(true);
                                return;
                              }
                              setActiveProfileIndex(pIdx);
                              localStorage.setItem("umbrella_activeProfileIndex", pIdx.toString());
                              setChildName(p.name);
                              setGradeLevel(p.grade);
                              setSelectedAvatarId(p.avatarId);
                              setStudentStars(p.stars);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all whitespace-nowrap ${
                              isSelected
                                ? "bg-purple-600 text-white border-purple-600 shadow-xs scale-102"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            } ${subStatus !== "family" ? "opacity-75 cursor-pointer" : ""}`}
                          >
                            <span className="text-sm">{avDetail.emoji}</span>
                            <span>{p.name}</span>
                          </button>
                        );
                      })}
                      
                      {subStatus === "family" && (
                        <button
                          type="button"
                          onClick={() => {
                            const name = prompt(lang === "es" ? "¿Nombre del nuevo estudiante?" : lang === "fr" ? "Nom de l'enfant ?" : "Enter child's name:");
                            if (name) {
                              const newProfiles = [...familyProfiles, { name, grade: "3rd Grade", avatarId: "rocket", stars: 20 }];
                              setFamilyProfiles(newProfiles);
                              localStorage.setItem("umbrella_familyProfiles", JSON.stringify(newProfiles));
                              setActiveProfileIndex(newProfiles.length - 1);
                              localStorage.setItem("umbrella_activeProfileIndex", (newProfiles.length - 1).toString());
                              setChildName(name);
                              setGradeLevel("3rd Grade");
                              setSelectedAvatarId("rocket");
                              setStudentStars(20);
                            }
                          }}
                          className="flex items-center justify-center h-7 w-7 rounded-full bg-white border border-dashed border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-800 shrink-0"
                          title="Add child profile"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      {t.childNameLabel}
                    </label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                    />
                  </div>

                  {/* Target Grade level selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      {t.gradeLevel}
                    </label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(e.target.value)}
                    >
                      <option value="Kindergarten">{t.gradeOptions.kindergarten}</option>
                      <option value="1st Grade">{t.gradeOptions["1st"]}</option>
                      <option value="2nd Grade">{t.gradeOptions["2nd"]}</option>
                      <option value="3rd Grade">{t.gradeOptions["3rd"]}</option>
                      <option value="4th Grade">{t.gradeOptions["4th"]}</option>
                      <option value="5th Grade">{t.gradeOptions["5th"]}</option>
                    </select>
                  </div>

                  {/* Avatar Picker */}
                  <div>
                    <span className="block text-xs font-bold text-slate-600 mb-2">
                      {t.avatarSelect}
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {PRESET_AVATARS.map((av) => (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => {
                            if (av.isPremium && subStatus === "free") {
                              setShowSubscriptionModal(true);
                            } else {
                              setSelectedAvatarId(av.id);
                            }
                          }}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all relative ${
                            selectedAvatarId === av.id 
                              ? "border-indigo-600 bg-indigo-50/50 scale-102" 
                              : "border-slate-100 bg-slate-50 hover:border-slate-200"
                          } ${av.isPremium && subStatus === "free" ? "opacity-80 hover:opacity-100 hover:border-amber-200" : ""}`}
                        >
                          {av.isPremium && subStatus === "free" && (
                            <span className="absolute top-1 right-1 text-[8px] bg-amber-500 text-white font-extrabold rounded-full px-1 py-0.5 scale-90 leading-none" title="Premium Avatar">
                              👑
                            </span>
                          )}
                          <span className="text-2xl mb-1">{av.emoji}</span>
                          <span className="text-[9px] font-semibold truncate max-w-full text-slate-600">
                            {av.emoji && av.name.split(" ")[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Save profile locally */}
                  <div className="pt-2">
                    <button
                      onClick={handleSaveProfile}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all"
                    >
                      {isProfileSaved ? t.saved : t.saveProfile}
                    </button>
                  </div>
                </div>
              </div>

              {/* SquareCircle Series Library */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  Choose your book
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {BOOKS.map((book) => {
                    const bookTitle =
                      lang === "es" ? book.titleEs :
                      lang === "fr" ? book.titleFr :
                      book.titleEn;
                    const isActive = selectedBookId === book.id;
                    return (
                      <button
                        key={book.id}
                        type="button"
                        onClick={() => {
                          setSelectedBookId(book.id);
                          setSelectedPresetTopic("");
                          setCustomTopic("");
                        }}
                        className="flex flex-col items-center text-center gap-2 p-3 rounded-2xl border-2 transition-all"
                        style={{
                          borderColor: isActive ? book.color : "#e2e8f0",
                          background: isActive ? book.bg : "#f8fafc",
                        }}
                      >
                        <span className="text-3xl">{book.coverEmoji}</span>
                        <span
                          className="text-xs font-bold leading-tight"
                          style={{ color: isActive ? book.color : "#0f172a" }}
                        >
                          {bookTitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Topic Treasure Picker */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  {t.selectTopic}
                </h3>

                {/* Preset Options Cards */}
                <div className="space-y-2">
                  {!selectedBookId && (
                    <p className="text-xs text-slate-500 font-medium">👆 Pick a book above to see its lessons.</p>
                  )}
                  {activeTopics.map((topic) => {
                    const titleText = 
                      lang === "es" ? topic.titleEs : 
                      lang === "fr" ? topic.titleFr : 
                      topic.titleEn;
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => {
                          setSelectedPresetTopic(topic.titleEn);
                          setCustomTopic("");
                        }}
                        className={`w-full flex items-center gap-3 p-3 text-left rounded-2xl border-2 transition-all text-sm font-semibold ${
                          selectedPresetTopic === topic.titleEn && !customTopic 
                            ? "border-indigo-600 bg-indigo-50 text-indigo-950 shadow-xs" 
                            : "border-slate-100 bg-slate-50 hover:bg-slate-100/50"
                        }`}
                      >
                        <span className="text-xl">{topic.icon}</span>
                        <span>{titleText}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Topic Input */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    {t.customTopic}
                  </label>
                  <textarea
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                    placeholder={t.customTopicPlaceholder}
                    value={customTopic}
                    onChange={(e) => {
                      setCustomTopic(e.target.value);
                      setSelectedPresetTopic("");
                    }}
                  />
                </div>

                <button
                  type="button"
                  disabled={isGeneratingLesson || (!selectedPresetTopic && !customTopic)}
                  onClick={handleGenerateLesson}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 text-white font-bold text-sm shadow-md shadow-indigo-100 hover:shadow-lg hover:shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                >
                  {isGeneratingLesson ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {t.generateBtn}
                </button>
              </div>

            </div>

            {/* RIGHT COLUMN: Active Magical Reading & Dynamic Interactive Quiz (Outer width: 8 cols) */}
            <div className="lg:col-span-8">
              
              {/* Initial Screen / Empty State */}
              {!currentLesson && !isGeneratingLesson && (
                <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[460px]">
                  {/* Floating guide illustration with selected avatar */}
                  <div className={`h-24 w-24 rounded-full border-4 ${activeAvatar.color} flex items-center justify-center text-4xl mb-4 animate-bounce`}>
                    {activeAvatar.emoji}
                  </div>
                  
                  <span className="text-xs uppercase tracking-widest text-indigo-600 font-bold mb-1">
                    {activeAvatar.name}
                  </span>
                  
                  <h2 className="text-2xl font-bold text-slate-800 font-sans tracking-tight mb-2 max-w-md">
                    {lang === "es" 
                      ? `¡Hola, ${childName}! ¿Qué aventura aprenderemos hoy?` 
                      : lang === "fr" 
                        ? `Bonjour, ${childName} ! Quelle aventure allons-nous découvrir aujourd'hui ?` 
                        : `Hi, ${childName}! What magical adventure are we figuring out today?`
                    }
                  </h2>
                  <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-6">
                    {lang === "es" 
                      ? "Elige uno de los temas recomendados al lado o inventa el tuyo. Crearé una historia explicativa especial con rompecabezas divertidos pensados para ti." 
                      : lang === "fr" 
                        ? "Choisis l'un des sujets recommandés à côté ou invente le tien. Je vais créer une histoire amusante avec des petites énigmes de connaissances juste pour toi !" 
                        : "Pick one of our fun topics on the left or type your own question. Your custom guide will generate a lovely bedtime story lesson and friendly check-in question!"
                    }
                  </p>

                  <div className="flex gap-2">
                    <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-md">
                      🌍 Spanish/English/French
                    </span>
                    <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-md">
                      ✨ Powered by Gemini
                    </span>
                  </div>
                </div>
              )}

              {/* Loader Loading state */}
              {isGeneratingLesson && (
                <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[460px]">
                  <div className="relative mb-6">
                    <div className="h-16 w-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                    <span className="absolute inset-x-0 inset-y-0 flex items-center justify-center text-2xl animate-pulse">
                      🪄
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">
                    {t.generating}
                  </h3>
                  <p className="text-xs font-mono text-slate-400 max-w-xs leading-relaxed">
                    Analyzing target grade level & customizing vocabulary to preserve encouraging tone...
                  </p>
                </div>
              )}

              {/* Error messages */}
              {errorMessage && (
                <div className="p-4 mb-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold rounded-2xl flex items-center gap-2">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* ACTIVE LESSON VIEW CONTAINER */}
              {currentLesson && !isGeneratingLesson && (
                <div className="space-y-6">
                  
                  {/* Interactive Quiz Mode Not Started yet: Show Story Reading Section first */}
                  {activeQuestionIndex === -1 ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs"
                    >
                      {/* Top banner of story */}
                      <div className="bg-gradient-to-tr from-indigo-50 via-purple-50 to-indigo-50 p-6 border-b border-indigo-100/40 relative">
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-indigo-700">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Interactive Story Lesson</span>
                        </div>
                        <span className="text-xs uppercase font-extrabold tracking-wider text-purple-600 block mb-1">
                          {currentLesson.gradeLevel} • {currentLesson.topic}
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
                          {currentLesson.title}
                        </h2>
                      </div>

                      {/* Active Visual Illustration for the story (Dynamic Multi-Image Gallery with Categories) */}
                      {(() => {
                        const galleryImages = getStoryImages(currentLesson.topic, currentLesson.illustrationKeyword);
                        
                        // Categories with customized metadata returned by the lesson generator of Gemini
                        const fullGallery = [
                          {
                            index: 0,
                            category: 'setting' as const,
                            url: galleryImages[0] || "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80",
                            labelEn: "Setting",
                            labelEs: "Escenario",
                            labelFr: "Décor",
                            emoji: "🏰",
                            description: currentLesson.galleryMetadata?.settingDescription || getGalleryCaptions(0, currentLesson.topic, lang)
                          },
                          {
                            index: 1,
                            category: 'character' as const,
                            url: galleryImages[1] || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
                            labelEn: "Character",
                            labelEs: "Personaje",
                            labelFr: "Personnage",
                            emoji: "🦄",
                            description: currentLesson.galleryMetadata?.characterDescription || getGalleryCaptions(1, currentLesson.topic, lang)
                          },
                          {
                            index: 2,
                            category: 'action' as const,
                            url: galleryImages[2] || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
                            labelEn: "Action",
                            labelEs: "Acción",
                            labelFr: "Action",
                            emoji: "🚀",
                            description: currentLesson.galleryMetadata?.actionDescription || getGalleryCaptions(2, currentLesson.topic, lang)
                          }
                        ];

                        const filteredGallery = categoryFilter === 'all'
                          ? fullGallery
                          : fullGallery.filter(item => item.category === categoryFilter);

                        // Ensure we always have an item to show
                        const safeActiveIndex = Math.min(Math.max(activeImageIndex, 0), 2);
                        const activeItem = fullGallery[safeActiveIndex] || fullGallery[0];
                        const activeUrl = activeItem.url;

                        return (
                          <div className="relative w-full bg-slate-100 border-b border-indigo-100 flex flex-col" id="student-gallery-block">
                            
                            {/* Visual Filter UI Header */}
                            <div className="px-4 py-3 sm:px-6 bg-slate-50 border-b border-indigo-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                              <span className="text-xs font-bold text-indigo-950/70 flex items-center gap-1.5 font-sans uppercase tracking-wider">
                                🔍 {lang === "es" ? "Filtrar por categoría:" : lang === "fr" ? "Filtrer par catégorie :" : "Filter by category:"}
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  { key: 'all', emoji: '🌈', labelEn: 'All', labelEs: 'Todo', labelFr: 'Tout' },
                                  { key: 'setting', emoji: '🏰', labelEn: 'Setting', labelEs: 'Escenario', labelFr: 'Décor' },
                                  { key: 'character', emoji: '🦄', labelEn: 'Character', labelEs: 'Personaje', labelFr: 'Personnage' },
                                  { key: 'action', emoji: '🚀', labelEn: 'Action', labelEs: 'Acción', labelFr: 'Action' }
                                ].map((pill) => {
                                  const active = categoryFilter === pill.key;
                                  const transLabel = lang === 'es' ? pill.labelEs : lang === 'fr' ? pill.labelFr : pill.labelEn;
                                  return (
                                    <button
                                      key={pill.key}
                                      onClick={() => setCategoryFilter(pill.key as any)}
                                      className={`px-3 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1 shadow-sm border ${
                                        active 
                                          ? 'bg-indigo-600 border-indigo-500 text-white scale-102 ring-2 ring-indigo-100' 
                                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-900 border active:scale-95'
                                      }`}
                                      id={`btn-filter-${pill.key}`}
                                      aria-label={`Filter by ${pill.labelEn}`}
                                    >
                                      <span>{pill.emoji}</span>
                                      <span>{transLabel}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Main Image Slider Container */}
                            <div className="relative h-56 sm:h-72 md:h-80 w-full overflow-hidden group select-none">
                              <AnimatePresence mode="wait">
                                <motion.img 
                                  key={safeActiveIndex}
                                  src={activeUrl}
                                  alt={`${currentLesson.title} image ${safeActiveIndex + 1}`}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.4, ease: "easeInOut" }}
                                  drag="x"
                                  dragConstraints={{ left: 0, right: 0 }}
                                  dragElastic={0.5}
                                  onDragEnd={(e, info) => {
                                    const threshold = 50;
                                    if (info.offset.x < -threshold) {
                                      // Swiped Left -> show next
                                      const activeFilteredIdx = filteredGallery.findIndex(i => i.index === safeActiveIndex);
                                      const nextIdxInFiltered = activeFilteredIdx < filteredGallery.length - 1 ? activeFilteredIdx + 1 : 0;
                                      setActiveImageIndex(filteredGallery[nextIdxInFiltered].index);
                                    } else if (info.offset.x > threshold) {
                                      // Swiped Right -> show prev
                                      const activeFilteredIdx = filteredGallery.findIndex(i => i.index === safeActiveIndex);
                                      const prevIdxInFiltered = activeFilteredIdx > 0 ? activeFilteredIdx - 1 : filteredGallery.length - 1;
                                      setActiveImageIndex(filteredGallery[prevIdxInFiltered].index);
                                    }
                                  }}
                                  className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-102 cursor-grab active:cursor-grabbing"
                                  referrerPolicy="no-referrer"
                                  onClick={(e) => {
                                    // Only open fullscreen if they tapped and did not drag
                                    if (e.defaultPrevented) return;
                                    setIsFullscreen(true);
                                  }}
                                  title="Drag to swipe or Click to view full screen"
                                />
                              </AnimatePresence>

                              {/* Left & Right control arrows overlay */}
                              {filteredGallery.length > 1 && (
                                <>
                                  <button
                                    onClick={() => {
                                      const activeFilteredIdx = filteredGallery.findIndex(i => i.index === safeActiveIndex);
                                      const prevIdxInFiltered = activeFilteredIdx > 0 ? activeFilteredIdx - 1 : filteredGallery.length - 1;
                                      setActiveImageIndex(filteredGallery[prevIdxInFiltered].index);
                                    }}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/95 hover:bg-white text-indigo-900 shadow-md transition-all opacity-90 hover:opacity-100 active:scale-95 focus:outline-hidden z-10"
                                    title="Previous picture"
                                    aria-label="Previous image"
                                    id="btn-prev-image"
                                  >
                                    <ChevronLeft className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const activeFilteredIdx = filteredGallery.findIndex(i => i.index === safeActiveIndex);
                                      const nextIdxInFiltered = activeFilteredIdx < filteredGallery.length - 1 ? activeFilteredIdx + 1 : 0;
                                      setActiveImageIndex(filteredGallery[nextIdxInFiltered].index);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/95 hover:bg-white text-indigo-900 shadow-md transition-all opacity-90 hover:opacity-100 active:scale-95 focus:outline-hidden z-10"
                                    title="Next picture"
                                    aria-label="Next image"
                                    id="btn-next-image"
                                  >
                                    <ChevronRight className="w-5 h-5" />
                                  </button>
                                </>
                              )}

                              {/* Gradient shadow for text overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

                              {/* Badges Overlay */}
                              <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none z-10">
                                <span className="text-[10px] sm:text-xs font-black text-white bg-indigo-600/90 backdrop-blur-md px-3 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
                                  🎨 {currentLesson.illustrationKeyword || currentLesson.topic}
                                </span>
                                <span className="text-[10px] sm:text-xs font-black text-white bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
                                  📸 {activeItem.emoji} {lang === "es" ? activeItem.labelEs : lang === "fr" ? activeItem.labelFr : activeItem.labelEn}
                                </span>
                              </div>

                              {/* Actions Button Overlay (Full Screen & Download) */}
                              <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                                <button
                                  onClick={() => setIsFullscreen(true)}
                                  className="p-2 sm:px-3 sm:py-2 rounded-xl text-white font-extrabold text-xs tracking-wider uppercase backdrop-blur-md bg-slate-900/85 hover:bg-slate-900 border border-white/20 hover:scale-105 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 focus:outline-hidden"
                                  title="View image in Full Screen"
                                  id="btn-maximize-illustration"
                                >
                                  <Maximize2 className="w-4 h-4" />
                                  <span className="hidden xs:inline">
                                    {lang === "es" ? "Ampliar" : lang === "fr" ? "Plein Écran" : "Full Screen"}
                                  </span>
                                </button>

                                <button
                                  onClick={() => handleDownloadImage(activeUrl, currentLesson.topic, safeActiveIndex)}
                                  disabled={isDownloadingImage}
                                  className={`p-2 sm:px-3 sm:py-2 rounded-xl text-white font-extrabold text-xs tracking-wider uppercase backdrop-blur-md transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 focus:outline-hidden ${
                                    downloadSuccessIdx === safeActiveIndex
                                      ? "bg-emerald-600 border border-emerald-400 text-white"
                                      : isDownloadingImage
                                      ? "bg-amber-600/90 border border-amber-500 cursor-not-allowed"
                                      : "bg-slate-900/85 hover:bg-slate-900 border border-white/20 hover:scale-105 active:scale-95"
                                  }`}
                                  title="Save illustration to your computer or phone"
                                  id="btn-download-illustration"
                                >
                                  <Download className="w-4 h-4" />
                                  <span className="hidden xs:inline">
                                    {downloadSuccessIdx === safeActiveIndex
                                      ? (lang === "es" ? "¡Guardado!" : lang === "fr" ? "Enregistré !" : "Saved! ✓")
                                      : isDownloadingImage
                                      ? (lang === "es" ? "Guardando..." : lang === "fr" ? "Enregistrement..." : "Saving...")
                                      : (lang === "es" ? "Guardar" : lang === "fr" ? "Sauver" : "Save Image")}
                                  </span>
                                </button>
                              </div>

                              {/* Story Caption Overlay containing metadata description */}
                              <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 text-white text-xs sm:text-sm font-bold tracking-wide drop-shadow-sm pointer-events-none z-10">
                                <span className="bg-slate-950/60 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10 inline-block font-sans">
                                  ⭐ {activeItem.description}
                                </span>
                              </div>
                            </div>

                            {/* Visual Pagination Indicator (Dots) */}
                            {filteredGallery.length > 1 && (
                              <div 
                                className="flex justify-center items-center gap-2 py-3.5 bg-slate-50/50 border-b border-slate-100" 
                                id="gallery-pagination-dots"
                              >
                                {filteredGallery.map((item) => {
                                  const isActive = safeActiveIndex === item.index;
                                  return (
                                    <button
                                      key={item.index}
                                      onClick={() => setActiveImageIndex(item.index)}
                                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer focus:outline-hidden ${
                                        isActive 
                                          ? "w-6 bg-indigo-600 shadow-xs scale-102" 
                                          : "w-2 bg-slate-300 hover:bg-slate-400 active:scale-90"
                                      }`}
                                      title={lang === "es" ? `Ir a la imagen ${item.index + 1}` : lang === "fr" ? `Aller à l'image ${item.index + 1}` : `Go to image ${item.index + 1}`}
                                      aria-label={lang === "es" ? `Imagen ${item.index + 1}` : lang === "fr" ? `Image ${item.index + 1}` : `Image ${item.index + 1}`}
                                      id={`btn-pagination-dot-${item.index}`}
                                    />
                                  );
                                })}
                              </div>
                            )}

                            {/* Full Screen View Modal Portal/Overlay */}
                            <AnimatePresence>
                              {isFullscreen && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="fixed inset-0 bg-slate-950/98 z-[9999] flex flex-col items-center justify-center"
                                  id="gallery-fullscreen-modal"
                                  onClick={() => setIsFullscreen(false)}
                                >
                                  {/* Top Bar inside Full Screen */}
                                  <div 
                                    className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between bg-gradient-to-b from-slate-950/90 to-transparent z-[10000]"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="flex gap-2 items-center">
                                      <span className="text-xs font-black text-white bg-indigo-600/90 px-3 py-1.5 rounded-full uppercase tracking-wider hidden sm:inline">
                                        🎨 {currentLesson.illustrationKeyword || currentLesson.topic}
                                      </span>
                                      <span className="text-xs font-black text-white bg-slate-800/90 px-2.5 py-1.5 rounded-full uppercase tracking-wider">
                                        📸 {activeItem.emoji} {lang === "es" ? activeItem.labelEs : lang === "fr" ? activeItem.labelFr : activeItem.labelEn}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {/* Download button inside Full Screen */}
                                      <button
                                        onClick={() => handleDownloadImage(activeUrl, currentLesson.topic, safeActiveIndex)}
                                        disabled={isDownloadingImage}
                                        className={`p-2 px-3 sm:px-4 rounded-xl text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 focus:outline-hidden ${
                                          downloadSuccessIdx === safeActiveIndex
                                            ? "bg-emerald-600 border border-emerald-400"
                                            : isDownloadingImage
                                            ? "bg-amber-600/90 border border-amber-500 cursor-not-allowed"
                                            : "bg-slate-800 hover:bg-slate-755 border border-white/10"
                                        }`}
                                        id="btn-fullscreen-download"
                                      >
                                        <Download className="w-4 h-4" />
                                        <span>
                                          {downloadSuccessIdx === safeActiveIndex 
                                            ? "✓" 
                                            : isDownloadingImage 
                                              ? "..." 
                                              : (lang === "es" ? "Guardar" : lang === "fr" ? "Sauver" : "Save")}
                                        </span>
                                      </button>

                                      {/* Close Full Screen */}
                                      <button
                                        onClick={() => setIsFullscreen(false)}
                                        className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-white/10 transition-all active:scale-95"
                                        id="btn-close-fullscreen"
                                        aria-label="Exit Full Screen"
                                      >
                                        <Minimize2 className="w-5 h-5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Center Image Container inside Full Screen */}
                                  <div 
                                    className="relative w-full max-w-5xl px-4 md:px-12 flex items-center justify-center"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {/* Left & Right navigation triggers inside Full Screen */}
                                    {filteredGallery.length > 1 && (
                                      <>
                                        <button
                                          onClick={() => {
                                            const activeFilteredIdx = filteredGallery.findIndex(i => i.index === safeActiveIndex);
                                            const prevIdxInFiltered = activeFilteredIdx > 0 ? activeFilteredIdx - 1 : filteredGallery.length - 1;
                                            setActiveImageIndex(filteredGallery[prevIdxInFiltered].index);
                                          }}
                                          className="absolute left-4 sm:left-6 md:left-8 p-3 rounded-full bg-slate-905/90 hover:bg-slate-900 text-white shadow-xl border border-white/10 transition-all opacity-80 hover:opacity-100 active:scale-95 focus:outline-hidden z-[10001]"
                                          id="btn-prev-fullscreen"
                                          aria-label="Previous illustration"
                                        >
                                          <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            const activeFilteredIdx = filteredGallery.findIndex(i => i.index === safeActiveIndex);
                                            const nextIdxInFiltered = activeFilteredIdx < filteredGallery.length - 1 ? activeFilteredIdx + 1 : 0;
                                            setActiveImageIndex(filteredGallery[nextIdxInFiltered].index);
                                          }}
                                          className="absolute right-4 sm:right-6 md:right-8 p-3 rounded-full bg-slate-905/90 hover:bg-slate-900 text-white shadow-xl border border-white/10 transition-all opacity-80 hover:opacity-100 active:scale-95 focus:outline-hidden z-[10001]"
                                          id="btn-next-fullscreen"
                                          aria-label="Next illustration"
                                        >
                                          <ChevronRight className="w-6 h-6" />
                                        </button>
                                      </>
                                    )}

                                    <motion.img
                                      key={safeActiveIndex}
                                      src={activeUrl}
                                      alt={`${currentLesson.title} image ${safeActiveIndex + 1}`}
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.95 }}
                                      transition={{ duration: 0.3 }}
                                      drag="x"
                                      dragConstraints={{ left: 0, right: 0 }}
                                      dragElastic={0.5}
                                      onDragEnd={(e, info) => {
                                        const threshold = 60;
                                        if (info.offset.x < -threshold) {
                                          // Swiped Left -> show next
                                          const activeFilteredIdx = filteredGallery.findIndex(i => i.index === safeActiveIndex);
                                          const nextIdxInFiltered = activeFilteredIdx < filteredGallery.length - 1 ? activeFilteredIdx + 1 : 0;
                                          setActiveImageIndex(filteredGallery[nextIdxInFiltered].index);
                                        } else if (info.offset.x > threshold) {
                                          // Swiped Right -> show prev
                                          const activeFilteredIdx = filteredGallery.findIndex(i => i.index === safeActiveIndex);
                                          const prevIdxInFiltered = activeFilteredIdx > 0 ? activeFilteredIdx - 1 : filteredGallery.length - 1;
                                          setActiveImageIndex(filteredGallery[prevIdxInFiltered].index);
                                        }
                                      }}
                                      className="max-w-full max-h-[70vh] sm:max-h-[75vh] md:max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10 cursor-grab active:cursor-grabbing select-none"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>

                                  {/* Bottom caption with the story text */}
                                  <div 
                                    className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 to-transparent flex flex-col items-center justify-center text-center z-[10000]"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="max-w-2xl bg-slate-900/90 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/10 text-white text-sm sm:text-base font-bold font-sans shadow-lg">
                                      ⭐ {activeItem.description}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Clickable Small Thumbnail Previews for Kids */}
                            <div className="p-3 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-100 gap-3">
                              <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest pl-2">
                                {lang === "es" ? "👉 HAZ CLIC PARA VER MÁS DIBUJOS" : lang === "fr" ? "👉 CLIQUE POUR VOIR LES DESSINS" : "👉 CLICK TO SEE OTHER PICTURES:"}
                              </span>
                              <div className="flex items-center gap-2">
                                {filteredGallery.map((item, idx) => (
                                  <button
                                    key={item.index}
                                    onClick={() => setActiveImageIndex(item.index)}
                                    className={`relative w-12 sm:w-16 h-8 sm:h-11 rounded-lg overflow-hidden border-2 transition-all p-0 ${safeActiveIndex === item.index ? 'border-indigo-600 scale-105 ring-2 ring-indigo-100 shadow-xs' : 'border-slate-200 opacity-60 hover:opacity-100 hover:scale-[1.02]'}`}
                                    aria-label={`Go to slide ${item.index + 1}`}
                                    id={`btn-thumbnail-${item.index}`}
                                  >
                                    <img 
                                      src={item.url} 
                                      alt="" 
                                      className="w-full h-full object-cover" 
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute bottom-0 right-0 bg-slate-900/70 text-[8px] text-white px-0.5 rounded-tl font-sans">
                                      {item.emoji}
                                    </div>
                                    {safeActiveIndex === item.index && (
                                      <div className="absolute inset-0 bg-indigo-600/15 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Creative Analogy Story Prose */}
                      <div className="p-6 sm:p-8 space-y-6">
                        
                        {/* Friendly Guide Coach Advice */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3 items-start">
                          <span className="text-3xl filter drop-shadow-xs">{activeAvatar.emoji}</span>
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-800">{activeAvatar.name}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              {lang === "es" 
                                ? `¡Hola ${childName}! Lee esta emocionante historia a tu propio ritmo. Cuando sientas que la comprendes del todo, juguemos a resolver la recompensa.` 
                                : lang === "fr" 
                                  ? `Salut ${childName} ! Prends ton temps pour lire cette jolie histoire. Quand tu te sens prêt, clique sur le bouton en bas pour t'entraîner !` 
                                  : `Let's read this together, ${childName}! Use your index finger to follow along. When ready, click the play button to start our quiz!`
                              }
                            </p>
                          </div>
                        </div>

                        {/* Kid-Friendly Voice Narration Player Panel */}
                        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-indigo-100/60 rounded-2xl p-4 sm:p-5 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-full ${isSpeaking ? 'bg-indigo-600 text-white animate-pulse' : 'bg-indigo-100 text-indigo-700'}`}>
                                <Volume2 className="w-5 h-5 animate-none" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-800">
                                  {lang === "es" ? "Compañero de Voz Inclusivo" : lang === "fr" ? "Compagnon de Lecture Vocal" : "Listen & Learn Narration"}
                                </h4>
                                <p className="text-xs text-slate-500">
                                  {isSpeaking 
                                    ? (lang === "es" ? "¡Escucha con atención y sigue con tu dedo!" : lang === "fr" ? "Écoute bien et suis la lecture !" : "Listen carefully and follow along!")
                                    : (lang === "es" ? "Haz clic para escuchar el cuento narrado" : lang === "fr" ? "Clique pour écouter l'histoire racontée" : "Click to hear the story narrated")
                                  }
                                </p>
                              </div>
                            </div>

                            {/* Waveform indicator when voice is active */}
                            {isSpeaking && (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100/50 rounded-full shrink-0">
                                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                <span className="text-[10px] font-extrabold text-indigo-700 tracking-wider animate-pulse uppercase">
                                  {lang === "es" ? "NARRANDO" : lang === "fr" ? "LECTURE" : "PLAYING"}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Control Buttons row */}
                          <div className="flex flex-wrap items-center gap-2">
                            {!isSpeaking ? (
                              <button
                                onClick={() => startSpeakingStory(currentLesson.storySession)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                              >
                                <Play className="w-4 h-4 fill-current" />
                                <span>{lang === "es" ? "Escuchar" : lang === "fr" ? "Écouter" : "Hear Story"}</span>
                              </button>
                            ) : (
                              <>
                                {isPaused ? (
                                  <button
                                    onClick={resumeSpeakingStory}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                                  >
                                    <Play className="w-4 h-4 fill-current" />
                                    <span>{lang === "es" ? "Reanudar" : lang === "fr" ? "Reprendre" : "Resume"}</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={pauseSpeakingStory}
                                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                                  >
                                    <Pause className="w-4 h-4" />
                                    <span>{lang === "es" ? "Pausar" : lang === "fr" ? "Pause" : "Pause"}</span>
                                  </button>
                                )}

                                <button
                                  onClick={stopSpeakingStory}
                                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                                >
                                  <Square className="w-3.5 h-3.5 fill-current" />
                                  <span>{lang === "es" ? "Detener" : lang === "fr" ? "Arrêter" : "Stop"}</span>
                                </button>
                              </>
                            )}

                            {/* Speed controls */}
                            <div className="ml-auto flex items-center gap-1 bg-white border border-slate-100 rounded-xl p-1 shrink-0">
                              <span className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wide">
                                {lang === "es" ? "Velocidad" : lang === "fr" ? "Vitesse" : "Speed"}
                              </span>
                              <button
                                onClick={() => updateSpeechRate(0.75)}
                                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors ${speechSpeed === 0.75 ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                title="Slow pace reading"
                              >
                                {lang === "es" ? "🐢 Lento" : lang === "fr" ? "🐢 Lent" : "🐢 Slow"}
                              </button>
                              <button
                                onClick={() => updateSpeechRate(1)}
                                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors ${speechSpeed === 1 ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                title="Normal speed reading"
                              >
                                {lang === "es" ? "🐰 Normal" : lang === "fr" ? "🐰 Normal" : "🐰 Normal"}
                              </button>
                              <button
                                onClick={() => updateSpeechRate(1.25)}
                                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors ${speechSpeed === 1.25 ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                title="Fast pace reading"
                              >
                                {lang === "es" ? "⚡ Rápido" : lang === "fr" ? "⚡ Rapide" : "⚡ Fast"}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Story Content with Generous Typography */}
                        <div className="prose prose-slate max-w-none">
                          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                            {currentLesson.storySession}
                          </p>
                        </div>

                        {/* Magical Takeaway bullet cards */}
                        <div className="space-y-2 pt-4 border-t border-slate-100">
                          <h4 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase flex items-center gap-1.5 mb-3">
                            {t.keyTakeaways}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {currentLesson.keyConcepts.map((concept, idx) => (
                              <div key={idx} className="bg-indigo-50/45 border border-indigo-100/50 p-3 rounded-xl flex gap-2 items-start">
                                <span className="text-indigo-600 font-bold text-xs bg-white rounded-full h-5 w-5 flex items-center justify-center shrink-0 shadow-3xs">{idx + 1}</span>
                                <p className="text-xs font-medium text-slate-700 leading-relaxed">{concept}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Start Interactive Quiz trigger */}
                        <div className="pt-4 flex justify-end">
                          <button
                            onClick={() => setActiveQuestionIndex(0)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-100 hover:shadow-xl transition-all flex items-center gap-2"
                          >
                            <span>{t.startQuiz}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  ) : (
                    
                    /* ACTIVE INTERACTIVE QUIZ MODE */
                    <div className="space-y-6">
                      
                      {/* Interactive Header with back-to-story button */}
                      <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
                        <button
                          onClick={() => {
                            setActiveQuestionIndex(-1);
                            setHasCompletedQuiz(false);
                          }}
                          className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-all"
                        >
                          ⬅️ Back to Story
                        </button>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-indigo-600">
                            {t.questionOf} {activeQuestionIndex + 1} / {currentLesson.quiz.length}
                          </span>
                        </div>
                      </div>

                      {/* Not completed yet */}
                      {!hasCompletedQuiz ? (
                        <AnimatePresence mode="wait">
                          {currentLesson.quiz.map((q: QuizQuestion, qIdx: number) => {
                            if (qIdx !== activeQuestionIndex) return null;
                            const chosenOption = quizAttemptAnswers[qIdx];
                            const hasPickedAny = chosenOption !== undefined;

                            return (
                              <motion.div
                                key={qIdx}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm"
                              >
                                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-sans mb-6">
                                  {q.question}
                                </h3>

                                <div className="space-y-3 mb-6">
                                  {q.options.map((option, optIdx) => {
                                    const isSelected = chosenOption === optIdx;
                                    const isCorrectOpt = optIdx === q.correctAnswerIndex;
                                    
                                    // Visual card states based on chosen selection
                                    let btnStyle = "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300";
                                    let badgeStyle = "bg-slate-100 text-slate-500";

                                    if (isSelected) {
                                      if (optIdx === q.correctAnswerIndex) {
                                        btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-950";
                                        badgeStyle = "bg-emerald-600 text-white";
                                      } else {
                                        btnStyle = "border-rose-500 bg-rose-50 text-rose-950";
                                        badgeStyle = "bg-rose-600 text-white";
                                      }
                                    } else if (hasPickedAny && isCorrectOpt) {
                                      // Highlight correct answer if they picked the wrong one
                                      btnStyle = "border-emerald-300 bg-emerald-100/40 text-emerald-950";
                                      badgeStyle = "bg-emerald-500 text-white";
                                    }

                                    return (
                                      <button
                                        key={optIdx}
                                        type="button"
                                        disabled={hasPickedAny}
                                        onClick={() => handleSelectQuizOption(optIdx)}
                                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between text-sm sm:text-base font-semibold ${btnStyle}`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <span className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold ${badgeStyle}`}>
                                            {String.fromCharCode(65 + optIdx)}
                                          </span>
                                          <span className="leading-tight">{option}</span>
                                        </div>

                                        {/* Verification mark icon */}
                                        {hasPickedAny && isCorrectOpt && (
                                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
                                        )}
                                        {isSelected && optIdx !== q.correctAnswerIndex && (
                                          <XCircle className="w-5 h-5 text-rose-600 shrink-0 ml-2" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Dynamic Explanation feedback area after option is chosen */}
                                {hasPickedAny && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-2xl mb-6 flex gap-3 ${
                                      chosenOption === q.correctAnswerIndex 
                                        ? "bg-emerald-50/80 border border-emerald-100 text-emerald-900" 
                                        : "bg-amber-50/80 border border-amber-100 text-amber-900"
                                    }`}
                                  >
                                    <div className="text-3xl shrink-0">
                                      {chosenOption === q.correctAnswerIndex ? "🎉" : "💡"}
                                    </div>
                                    <div className="space-y-1">
                                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                                        {chosenOption === q.correctAnswerIndex ? t.correctWord : t.incorrectWord}
                                      </h4>
                                      <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
                                        {q.explanation}
                                      </p>
                                    </div>
                                  </motion.div>
                                )}

                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-1">
                                    {/* Hearts indicator */}
                                    <Heart className={`w-4 h-4 fill-rose-500 text-rose-500 ${hasPickedAny ? "animate-pulse" : ""}`} />
                                    <span className="text-xs font-bold text-slate-500">Practice focus</span>
                                  </div>

                                  <button
                                    onClick={handleNextQuizQuestion}
                                    disabled={!hasPickedAny}
                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-md shadow-indigo-100 transition-all flex items-center gap-1.5"
                                  >
                                    <span>{t.nextQuestion}</span>
                                  </button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      ) : (
                        
                        /* INTERACTIVE QUEST COMPLETED SUMMARY CARD */
                        <motion.div 
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="bg-white rounded-3xl p-8 border border-slate-100 text-center shadow-md space-y-6 max-w-lg mx-auto"
                        >
                          <div className="flex justify-center">
                            <div className="h-24 w-24 rounded-full bg-amber-50 border-4 border-amber-300 flex items-center justify-center text-5xl animate-bounce">
                              ⭐
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 block">
                              {t.quizCompleted}
                            </span>
                            <h2 className="text-2xl font-bold font-sans text-slate-900">
                              {t.congratsTitle}
                            </h2>
                          </div>

                          <div className="bg-slate-50 rounded-2xl p-4 inline-block px-8 py-4">
                            <span className="text-xs font-bold text-slate-500 block uppercase mb-1">
                              {t.scoreWord}
                            </span>
                            <div className="font-mono text-3xl font-extrabold text-indigo-700">
                              {lastQuizScore} / {currentLesson.quiz.length}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              {t.quizCompletedScore} +{(lastQuizScore * 10) + 5} {t.points}!
                            </p>
                          </div>

                          <div className="space-y-2 max-w-xs mx-auto">
                            <button
                              onClick={() => {
                                setQuizAttemptAnswers([]);
                                setActiveQuestionIndex(0);
                                setHasCompletedQuiz(false);
                              }}
                              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              {t.retakeQuiz}
                            </button>
                            
                            <button
                              onClick={() => {
                                setCurrentLesson(null);
                                setQuizAttemptAnswers([]);
                                setActiveQuestionIndex(-1);
                                setHasCompletedQuiz(false);
                              }}
                              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-100"
                            >
                              {t.claimStars}
                            </button>
                          </div>
                        </motion.div>
                      )}

                    </div>
                  )}

                </div>
              )}

            </div>

          </div>
        ) : (
          
          /* ----------------- Active View: PARENT DASHBOARD ----------------- */
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Parent Header Dashboard Info */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
              <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center text-9xl pr-6 font-extrabold font-mono hover:scale-105 transition-all">
                ☔
              </div>
              
              <div className="relative z-10 max-w-2xl">
                <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-300 block mb-1">
                  {t.modeParent}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans">
                  Hello, Parent Coach!
                </h2>
                <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
                  {t.parentDashboardIntro}
                </p>
              </div>
            </div>

            {/* Split Panel: Left List History Records vs Right AI Offline Play Advisor */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Recent Learning Log Items (width: 5 col) */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <ListTodo className="w-4.5 h-4.5 text-indigo-500" />
                  {t.recentPerformance}
                </h3>

                {historyRecords.length === 0 ? (
                  <div className="text-center py-10 px-4 text-slate-400 space-y-2">
                    <span className="block text-4xl">🏝️</span>
                    <p className="text-xs font-semibold leading-relaxed">
                      {t.noAdventure}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historyRecords.map((record) => {
                      const isSelected = selectedHistoryId === record.id;
                      return (
                        <div
                          key={record.id}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                            isSelected 
                              ? "border-indigo-600 bg-indigo-50/20" 
                              : "border-slate-100 bg-slate-50/55 hover:bg-slate-50"
                          }`}
                          onClick={() => handleGenerateParentInsights(record)}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h4 className="text-xs font-extrabold text-indigo-700 uppercase tracking-wider">
                                {record.gradeLevel}
                              </h4>
                              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                                {record.topic}
                              </h3>
                            </div>

                            <span className="text-xs font-mono text-slate-400 shrink-0">
                              {record.timestamp}
                            </span>
                          </div>

                          {/* Answers summary circles bar */}
                          <div className="flex items-center justify-between mt-3 gap-2">
                            <div className="flex gap-1.5">
                              {record.history.map((quest, qIdx) => (
                                <span
                                  key={qIdx}
                                  className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    quest.isCorrect 
                                      ? "bg-emerald-100 text-emerald-700" 
                                      : "bg-rose-100 text-rose-700"
                                  }`}
                                  title={quest.question}
                                >
                                  {quest.isCorrect ? "✓" : "✗"}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center gap-1 text-xs">
                              <span className="font-bold text-slate-800">
                                {record.score} / {record.totalQuestions}
                              </span>
                              <span className="text-slate-400">Score</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                          </div>

                          {/* Small quick analytics pill for clicked items */}
                          {isSelected && (
                            <div className="mt-3 pt-3 border-t border-indigo-100/40 flex justify-end">
                              <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Selected For AI Analysis
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: AI Actionable "Hands-On At-Home Game Plan" (width: 7 col) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Visual Coach Content display */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm min-h-[400px] flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                      <Lightbulb className="w-5 h-5 text-indigo-500 animate-pulse" />
                      {t.parentAdviceTitle}
                    </h3>

                    {/* Waiting condition when no history record is highlighted yet */}
                    {!selectedHistoryId && (
                      <div className="text-center py-16 text-slate-400 flex flex-col items-center justify-center space-y-4">
                        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl">
                          🎈
                        </div>
                        <p className="text-xs sm:text-sm max-w-xs font-semibold leading-relaxed">
                          {t.noHistorySelect}
                        </p>
                      </div>
                    )}

                    {/* Loading details when requesting server dynamic activity plans */}
                    {isGeneratingParentInsights && (
                      <div className="text-center py-16 flex flex-col items-center justify-center space-y-3">
                        <div className="h-10 w-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                          Mapping cognitive stumbles into play ideas ...
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Preserving cozy and supportive tones using cross-lingual systems...
                        </p>
                      </div>
                    )}

                    {/* Generated Activity Advice Output */}
                    {generatedInsights && !isGeneratingParentInsights && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6 pt-4"
                      >
                        {/* Overall Psychological feedback */}
                        <div className="bg-indigo-50/50 border border-indigo-100/40 p-4 rounded-2xl">
                          <h4 className="text-xs font-extrabold text-indigo-800 uppercase tracking-wider mb-1">
                            {lang === "es" ? "Análisis General" : lang === "fr" ? "Analyse Globale" : "AI Analysis"}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                            "{generatedInsights.overallFeedback}"
                          </p>
                          
                          {/* Struggle keywords tags */}
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {generatedInsights.struggleKeywords.map((tag, tIdx) => (
                              <span 
                                key={tIdx} 
                                className="text-[10px] font-bold bg-white text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100 shadow-2xs"
                              >
                                🎯 {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Hands-On Play Activities list */}
                        <div className="space-y-5">
                          {generatedInsights.atHomeActivities.map((act, idx) => (
                            <div key={idx} className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs bg-slate-50/20">
                              
                              {/* Header Title of play game */}
                              <div className="bg-slate-50 border-b border-slate-100 p-3 flex justify-between items-center bg-gradient-to-r from-slate-50 to-indigo-50/30">
                                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                  <span className="text-base">🎈</span>
                                  {act.title}
                                </span>
                                <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200">
                                  Activity {idx + 1}
                                </span>
                              </div>

                              <div className="p-4 space-y-3.5">
                                <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                                  "{act.intro}"
                                </p>

                                {/* Materials needed */}
                                <div className="space-y-1">
                                  <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-wide">
                                    {t.materials}:
                                  </h5>
                                  <div className="flex flex-wrap gap-1">
                                    {act.materialsNeeded.map((mat, mIdx) => (
                                      <span key={mIdx} className="text-xs bg-white text-slate-600 px-2 py-0.5 rounded-md border border-slate-100 font-medium">
                                        • {mat}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Step-by-step guidance */}
                                <div className="space-y-1.5">
                                  <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-wide">
                                    {t.activityInstructions}:
                                  </h5>
                                  <ol className="list-decimal list-outside pl-4 space-y-1">
                                    {act.instructions.map((step, sIdx) => (
                                      <li key={sIdx} className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
                                        {step}
                                      </li>
                                    ))}
                                  </ol>
                                </div>

                                {/* Parenting coaching pro tip */}
                                <div className="bg-amber-50/40 border border-amber-100 p-3 rounded-xl flex gap-2 items-start mt-2">
                                  <span className="text-base text-amber-500">💡</span>
                                  <div className="space-y-0.5">
                                    <h6 className="text-[9px] font-extrabold text-amber-800 tracking-wide uppercase">
                                      {t.proTip}
                                    </h6>
                                    <p className="text-[11px] italic text-slate-800 leading-relaxed">
                                      {act.parentProTip}
                                    </p>
                                  </div>
                                </div>

                              </div>
                            </div>
                          ))}
                        </div>

                        {/* CO-LEARNING CHALLENGE COMPONENT */}
                        {generatedInsights.coLearningChallenge && (
                          <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="mt-6 border-2 border-indigo-200 rounded-2xl bg-gradient-to-br from-indigo-50/40 via-purple-50/20 to-white overflow-hidden shadow-xs"
                          >
                            {/* Card Decorative Header */}
                            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div>
                                <span className="bg-indigo-500/50 text-[10px] font-black uppercase tracking-wider text-white px-2.5 py-1 rounded-full border border-indigo-400/40">
                                  🎮 5-Minute Power Activity
                                </span>
                                <h4 className="text-sm font-bold mt-1 tracking-tight">
                                  {t.coLearningTitle}
                                </h4>
                              </div>
                              <span className="text-xs font-bold text-indigo-100 bg-indigo-950/40 px-3 py-1 rounded-xl">
                                🤝 Shared Screen-Free
                              </span>
                            </div>

                            {/* Main Content Area */}
                            <div className="p-5 sm:p-6 space-y-5">
                              {/* Mastering Alert Banner */}
                              <div className="bg-white border-l-4 border-indigo-600 p-3.5 rounded-r-xl shadow-2xs">
                                <span className="text-[10px] font-extrabold text-indigo-700 tracking-wider uppercase block mb-0.5">
                                  🎯 {t.coLearningUserPrompt || t.coLearningMastering}
                                </span>
                                <h5 className="text-xs sm:text-sm font-bold text-slate-800">
                                  {generatedInsights.coLearningChallenge.conceptMastering}
                                </h5>
                              </div>

                              <div className="p-4 bg-white/70 border border-indigo-100/40 rounded-xl space-y-4">
                                <h5 className="text-xs sm:text-sm font-extrabold text-indigo-950 border-b border-indigo-50 pb-2">
                                  ⚡ {generatedInsights.coLearningChallenge.challengeTitle}
                                </h5>

                                {/* Household Items Scavenger Checkoff */}
                                <div className="space-y-2">
                                  <h6 className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    🏠 {t.coLearningItems}:
                                  </h6>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {generatedInsights.coLearningChallenge.householdItems.map((item, iIdx) => (
                                      <div key={iIdx} className="flex items-center gap-2 text-xs text-slate-700 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        <span className="text-indigo-500">🧺</span>
                                        <span>{item}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Dialogue Helper Script */}
                                <div className="space-y-2.5 pt-1">
                                  <div className="space-y-0.5">
                                    <h6 className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                      {t.coLearningScript}
                                    </h6>
                                    <p className="text-[10px] text-slate-400 font-medium">
                                      {t.coLearningScriptDesc}
                                    </p>
                                  </div>
                                  <div className="space-y-2.5">
                                    {generatedInsights.coLearningChallenge.parentScript.map((phrase, pIdx) => (
                                      <div key={pIdx} className="flex gap-2.5 items-start pl-2">
                                        <span className="text-xs bg-indigo-100/70 text-indigo-700 font-black h-5 w-5 rounded-full flex items-center justify-center shrink-0">
                                          {pIdx + 1}
                                        </span>
                                        <p className="text-xs sm:text-sm italic text-slate-700 leading-relaxed font-sans font-medium">
                                          "{phrase}"
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Reflection Question Prompt to Lock in Knowledge */}
                                <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-3.5 space-y-2">
                                  <div className="space-y-0.5">
                                    <span className="text-[9px] font-extrabold text-indigo-800 uppercase tracking-widest block">
                                      {t.coLearningReflection}
                                    </span>
                                    <p className="text-[10px] text-slate-400 font-semibold">
                                      {t.coLearningReflectionDesc}
                                    </p>
                                  </div>
                                  <div className="p-3 bg-white rounded-lg border border-indigo-100/60 shadow-3xs">
                                    <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed text-indigo-900">
                                      "{generatedInsights.coLearningChallenge.reflectionPrompt}"
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Interactive checkmark logger complete */}
                              <div className="pt-2">
                                <button
                                  type="button"
                                  onClick={() => handleToggleCoLearningComplete(selectedHistoryId)}
                                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs ${
                                    completedChallenges.includes(selectedHistoryId)
                                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100"
                                      : "bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.01]"
                                  }`}
                                >
                                  {completedChallenges.includes(selectedHistoryId) ? (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 text-white animate-pulse" />
                                      <span>{lang === "es" ? "🎉 ¡Desafío Completado con Éxito! (+15 Estrellas)" : lang === "fr" ? "🎉 Défi réussi avec succès ! (+15 Étoiles)" : "🎉 Challenge Completed Successfully! (+15 Stars)"}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Heart className="w-4 h-4 fill-current text-white" />
                                      <span>{lang === "es" ? "🤝 Marcar Desafío Completado (+15 Estrellas)" : lang === "fr" ? "🤝 Marquer le défi comme réussi (+15 Étoiles)" : "🤝 Mark Challenge Completed (+15 Stars)"}</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* Milestone Certificate Printer / Unlock Banner */}
                              <div className="pt-2">
                                {subStatus === "free" ? (
                                  <button
                                    type="button"
                                    onClick={() => setShowSubscriptionModal(true)}
                                    className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-all flex items-center justify-center gap-2 border border-indigo-200"
                                  >
                                    <span>👑 Unlock Co-Discovery Milestone Certificate (Gold Pro)</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const matchedRecord = historyRecords.find(r => r.id === selectedHistoryId);
                                      if (matchedRecord) {
                                        setShowCertificateForRecord(matchedRecord);
                                      } else {
                                        // fallback to a mock record generated if they preloaded
                                        setShowCertificateForRecord({
                                          id: selectedHistoryId,
                                          topic: generatedInsights?.coLearningChallenge?.challengeTitle || "Co-Discovery Adventure",
                                          childName: childName,
                                          gradeLevel: gradeLevel,
                                          score: 100,
                                          totalQuestions: 5,
                                          timestamp: new Date().toLocaleDateString(),
                                          history: []
                                        });
                                      }
                                    }}
                                    className="w-full py-3 px-4 rounded-xl font-extrabold text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transition-all flex items-center justify-center gap-2 shadow-xs hover:scale-[1.01]"
                                  >
                                    <span>📜 Render & Print Co-Discovery Milestone Certificate</span>
                                  </button>
                                )}
                              </div>

                              {/* Collaborative Wireframe Blueprint & Logic Breakdown Segment */}
                              <div className="border-t border-indigo-100 pt-4 mt-2">
                                <button
                                  type="button"
                                  onClick={() => setShowArchitectureInfo(!showArchitectureInfo)}
                                  className="text-xs font-extrabold text-indigo-700 hover:text-indigo-800 transition-colors flex items-center justify-between w-full"
                                >
                                  <span>{lang === "es" ? "🛠️ Ver Wireframe del Panel y Flujo de IA" : lang === "fr" ? "🛠️ Voir le Wireframe du Dashboard & Flux IA" : "🛠️ View Dashboard Wireframe Specification & AI System Logic"}</span>
                                  <span className="text-[10px] bg-indigo-100/60 text-indigo-700 px-2 py-0.5 rounded-md font-bold">{showArchitectureInfo ? "Hide" : "Expand"}</span>
                                </button>

                                {showArchitectureInfo && (
                                  <div className="mt-4 bg-slate-50 border border-slate-200/60 rounded-xl p-4 text-slate-700 space-y-4 text-xs font-sans leading-relaxed">
                                    <div className="space-y-1.5 animate-fadeIn">
                                      <h6 className="text-[10px] font-extrabold text-indigo-800 tracking-wider uppercase">
                                        📐 Parent Dashboard Wireframe Schema
                                      </h6>
                                      <p className="text-[11px] text-slate-500 font-medium">
                                        This describes how the "Co-Learning Challenge" wireframe fits within the child-parent educational dashboard:
                                      </p>
                                      <ul className="list-disc pl-4 space-y-1 text-slate-600 font-medium text-[11px]">
                                        <li><strong>Outer Container:</strong> Box with a high-contrast top-gradient bar indicating screen-free playground format.</li>
                                        <li><strong>Mastering Target Header:</strong> Block framing the target cognitive skill to remind parents what deep idea the child is mastering offline.</li>
                                        <li><strong>Household Materials Box:</strong> Dual-column quick checkoff items mapping common indoor tools (spoons, cups, crayons) to make the physical challenge zero-friction.</li>
                                        <li><strong>Interactive Script Dialog bubbles:</strong> Distinct speech cue tags numbering the steps of discussion. This guides parents specifically what questions to ask to lead curiosity.</li>
                                        <li><strong>End Reflection Bubble:</strong> Highlighted card framing the final consolidating prompt.</li>
                                        <li><strong>Gamification Checkoff:</strong> Synced button checking completion off the local profile and feeding +15 stars into student states.</li>
                                      </ul>
                                    </div>

                                    <div className="space-y-1.5 pt-2 border-t border-slate-200/60 animate-fadeIn">
                                      <h6 className="text-[10px] font-extrabold text-indigo-800 tracking-wider uppercase">
                                        🧠 AI Personalized Activity Generation Logic
                                      </h6>
                                      <p className="text-[11px] text-slate-500 font-medium">
                                        Underneath, this explains how the Google Gemini AI engine creates custom offline activities matching performance:
                                      </p>
                                      <ol className="list-decimal pl-4 space-y-1 text-slate-600 font-medium text-[11px]">
                                        <li><strong>Data Intake:</strong> Takes the child's profile details and current history record (topics, grade level, percentage correct, mistake paths).</li>
                                        <li><strong>Gap Identification:</strong> Analyzes wrong answers to isolate underlying conceptual stumbles rather than general topics (e.g. struggles splitting remaining leftovers in division).</li>
                                        <li><strong>Material Scavenger Lookup:</strong> AI checks category of topic and maps basic available household variables: Math &rarr; cooking spoons/containers; Science &rarr; natural leaves/shadows; Arts &rarr; color blends.</li>
                                        <li><strong>Guiding Questions Synthesis:</strong> Generates 2 leading verbal dialogue hints keeping tutoring fun and avoiding outright giving correct answers.</li>
                                        <li><strong>Memory Reflection Consolidation:</strong> Creates the final query allowing kids to re-explain the concept in their own terms to solidifying knowledge.</li>
                                      </ol>
                                    </div>
                                  </div>
                                )}
                              </div>

                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Supportive coaching brand quote footer */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
                    <span>Generated dynamics are offline games requiring zero screen duration.</span>
                    <span className="font-bold flex items-center gap-1 text-slate-500">
                      🔒 No Children Private Analytics Transmitted Out
                    </span>
                  </div>
                </div>

              </div>

            </div>

          </motion.div>
        )}
          </>
        )}

        </div>
      </main>

      {/* Sweet layout footer */}
      <footer className="bg-white border-t border-slate-100 mt-16 py-6 text-center text-xs text-slate-400">
        <p>© 2026 {t.brandName}. Academic confidence built with warm parental connections.</p>
        <div className="flex justify-center gap-4 mt-2">
          <span>English, Español, Français Localized support</span>
          <span>•</span>
          <span>Offline Family Playtime Advocate</span>
        </div>
      </footer>

      {/* ----------------- MODAL SUITE: Subscriptions Selector ----------------- */}
      <AnimatePresence>
        {showSubscriptionModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-4xl p-6 sm:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto font-sans text-slate-800"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowSubscriptionModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-extrabold text-xl p-2 rounded-full hover:bg-slate-100 transition-colors"
                title="Close Modal"
              >
                ✕
              </button>

              <div className="text-center space-y-2 mb-6">
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 font-black uppercase tracking-wider rounded-lg">
                  💎 Sandbox Checkout Simulator
                </span>
                <h3 className="text-2xl font-black text-slate-900">
                  {lang === "es" ? "Cambiar de Plan (Prueba de Funcionalidad)" : lang === "fr" ? "Modifier votre Formule" : "Select Your Active Subscription Tier"}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {lang === "es" 
                    ? "Esta es una simulación de suscripción 100% segura para probar las características de pago instantáneamente." 
                    : lang === "fr"
                    ? "C'est une simulation d'activation instantanée pour tester immédiatement toutes les fonctionnalités premium."
                    : "Simulated instant activation modal. Toggle tiers below to immediately unlock custom topic limits, kids profile lists, and certificate tools."}
                </p>

                {/* Billing Cycle Selector */}
                <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 p-1 rounded-xl mt-3">
                  <button
                    type="button"
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      billingCycle === "monthly" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {lang === "es" ? "Mensual" : lang === "fr" ? "Mensuel" : "Monthly"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle("annual")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                      billingCycle === "annual" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <span>{lang === "es" ? "Anual" : lang === "fr" ? "Annuel" : "Annual"}</span>
                    <span className="text-[8px] bg-purple-100 text-purple-700 font-extrabold px-1 rounded-sm leading-none py-0.5">
                      Save 20%
                    </span>
                  </button>
                </div>
              </div>

              {/* Grid lists inside modal */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
                {/* Free Tier Card */}
                <div className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  subStatus === "free" ? "border-slate-300 bg-slate-50/40" : "border-slate-100 bg-white"
                }`}>
                  <div>
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider">Silver Standard</h4>
                    <span className="text-2xl font-black text-slate-900 mt-2 block">$0</span>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-2">
                      Perfect for standard test drives. Generates up to 2 customized topics. Standard avatars.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSubStatus("free");
                      localStorage.setItem("umbrella_subStatus", "free");
                      setShowSubscriptionModal(false);
                    }}
                    className={`w-full mt-5 py-2 rounded-xl text-xs font-bold transition-all ${
                      subStatus === "free"
                        ? "bg-slate-200 text-slate-500 cursor-default"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                    }`}
                  >
                    {subStatus === "free" ? "Active" : "Switch to Free"}
                  </button>
                </div>

                {/* Gold Tier Card */}
                <div className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between relative ${
                  subStatus === "premium" ? "border-amber-400 bg-amber-50/5" : "border-slate-100 bg-white"
                }`}>
                  {subStatus === "premium" && (
                    <span className="absolute -top-2.5 right-3 bg-amber-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                      Active Plan
                    </span>
                  )}
                  <div>
                    <h4 className="text-sm font-black text-amber-600 uppercase tracking-wider">Gold Umbrella</h4>
                    <span className="text-2xl font-black text-slate-900 mt-2 block">
                      {billingCycle === "monthly" ? "$9.99" : "$7.99"}<span className="text-xs text-slate-400">/mo</span>
                    </span>
                    <ul className="text-[11px] text-slate-500 font-medium space-y-2 mt-3 list-none">
                      <li>✨ <strong>Infinite custom topics</strong></li>
                      <li>📜 <strong>Print custom milestone certificates</strong></li>
                      <li>🦄 Access Pro avatars: Sparkles & Ignis</li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSubStatus("premium");
                      localStorage.setItem("umbrella_subStatus", "premium");
                      setShowSubscriptionModal(false);
                    }}
                    className={`w-full mt-5 py-2 rounded-xl text-xs font-bold transition-all ${
                      subStatus === "premium"
                        ? "bg-amber-500 text-white cursor-default"
                        : "bg-amber-650 hover:bg-amber-700 text-white"
                    }`}
                  >
                    {subStatus === "premium" ? "Active" : "Activate Gold Plan"}
                  </button>
                </div>

                {/* Family Tier Card */}
                <div className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between relative ${
                  subStatus === "family" ? "border-purple-400 bg-purple-50/5" : "border-slate-100 bg-white"
                }`}>
                  {subStatus === "family" && (
                    <span className="absolute -top-2.5 right-3 bg-purple-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                      Active Plan
                    </span>
                  )}
                  <div>
                    <h4 className="text-sm font-black text-purple-600 uppercase tracking-wider">Supernova Family</h4>
                    <span className="text-2xl font-black text-slate-900 mt-2 block">
                      {billingCycle === "monthly" ? "$14.99" : "$11.99"}<span className="text-xs text-slate-400">/mo</span>
                    </span>
                    <ul className="text-[11px] text-slate-500 font-medium space-y-2 mt-3 list-none font-sans">
                      <li>👥 <strong>Multi-child profiles switcher</strong></li>
                      <li>👨‍👩‍👧 Add and configure multiple kids' details</li>
                      <li>⚡ Includes everything in Gold plan</li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSubStatus("family");
                      localStorage.setItem("umbrella_subStatus", "family");
                      setShowSubscriptionModal(false);
                    }}
                    className={`w-full mt-5 py-2 rounded-xl text-xs font-bold transition-all ${
                      subStatus === "family"
                        ? "bg-purple-600 text-white cursor-default"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                  >
                    {subStatus === "family" ? "Active" : "Activate Family Plan"}
                  </button>
                </div>
              </div>

              {/* Close prompt info */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
                <span>Toggle plans freely to preview differences in real-time.</span>
                <span className="font-bold flex items-center gap-1 text-slate-500">
                  🛡️ Simulated Gateway SSL Secured
                </span>
              </div>
            </motion.div>
          </div>
        )}

        {/* ----------------- MODAL SUITE: Milestone Certificate Viewer ----------------- */}
        {showCertificateForRecord && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-zinc-50 rounded-3xl w-full max-w-2xl p-6 relative shadow-2xl font-serif text-slate-900 border-8 border-amber-800"
            >
              {/* Certificate Inner Border */}
              <div className="border-4 border-double border-amber-600 rounded-xl p-8 text-center space-y-6 bg-amber-50/10">
                {/* Banner Header */}
                <div className="space-y-2 text-center">
                  <span className="text-4xl text-amber-500 block">☔</span>
                  <p className="text-xs font-sans font-black uppercase tracking-widest text-amber-800">
                    Milestone Co-Discovery Academic Achievement
                  </p>
                  <h3 className="text-3xl font-black text-slate-900 italic tracking-wider">
                    Certificate of Discovery
                  </h3>
                </div>

                <div className="py-2">
                  <p className="text-sm font-sans text-slate-500 font-semibold italic">
                    This document proudly verifies that the brave cosmic explorer
                  </p>
                  <h4 className="text-2xl font-black text-indigo-900 tracking-wide underline mt-3 decoration-indigo-200">
                    {showCertificateForRecord.childName || childName || "Ethan"}
                  </h4>
                  <p className="text-xs font-sans text-slate-400 font-bold mt-1 uppercase tracking-wider">
                    ({showCertificateForRecord.gradeLevel || gradeLevel})
                  </p>
                </div>

                <div className="space-y-3 px-4 py-3 bg-amber-50/40 rounded-2xl border border-amber-200/50 max-w-md mx-auto">
                  <p className="text-xs font-sans text-slate-600 font-medium">
                    has successfully mastered the screen-free physical co-learning curriculum for:
                  </p>
                  <h5 className="text-base font-bold text-amber-900 font-sans tracking-tight">
                    🌟 {showCertificateForRecord.topic}
                  </h5>
                  <p className="text-[10px] font-sans text-slate-400 font-bold">
                    Completed with their Parent Co-Pilot on {showCertificateForRecord.timestamp || new Date().toLocaleDateString()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 text-left border-t border-slate-200/60 max-w-md mx-auto">
                  <div className="space-y-0.5 font-sans">
                    <span className="text-[10px] uppercase font-sans font-extrabold tracking-wider text-slate-500 block">Hero Guide Signature:</span>
                    <p className="text-sm italic font-extrabold text-amber-800 tracking-wide font-sans">{activeAvatar.name}</p>
                  </div>
                  <div className="text-right space-y-0.5 font-sans">
                    <span className="text-[10px] uppercase font-sans font-extrabold tracking-wider text-slate-500 block">Academic Award:</span>
                    <p className="text-sm font-sans font-black text-indigo-700 flex items-center justify-end gap-1">⭐ +15 Points Secured</p>
                  </div>
                </div>

                {/* Interactive modal footer with instant printable triggers */}
                <div className="pt-6 font-sans flex gap-3 print:hidden">
                  <button
                    type="button"
                    onClick={() => {
                      window.print();
                    }}
                    className="flex-1 py-3 px-5 bg-gradient-to-r from-amber-600 to-orange-650 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-100 transition-all hover:scale-[1.01]"
                  >
                    🖨️ Launch Print System
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCertificateForRecord(null)}
                    className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- MODAL SUITE: Interactive Payment Portal ----------------- */}
      <AnimatePresence>
        {showPaymentDetailsModal && (
          <div className="fixed inset-0 z-[105] flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-4xl p-6 sm:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto font-sans text-slate-800 border border-slate-150"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setShowPaymentDetailsModal(false);
                  setPaymentStatus("idle");
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-extrabold text-xl p-2 rounded-full hover:bg-slate-100 transition-colors"
                title="Close Portal"
              >
                ✕
              </button>

              <div className="flex items-center gap-3 mb-6 border-b border-indigo-100 pb-4">
                <div className="h-12 w-12 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center shadow-md shadow-amber-200 shrink-0 text-xl font-bold">
                  💳
                </div>
                <div className="text-left font-sans">
                  <h3 className="text-xl font-black text-slate-900">
                    {lang === "es" ? "Centro de Gestión de Pagos y Facturación" : lang === "fr" ? "Portail de Facturation & Paiement" : "Secure Umbrella Payment & Billing Portal"}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {lang === "es" 
                      ? "Acepta pagos de suscripción de forma segura. Simula transacciones de prueba instantáneas." 
                      : lang === "fr"
                      ? "Portail sécurisé pour accepter et gérer les abonnements des familles."
                      : "Accelerated testing playground. Instantly authorized securely with standard client simulation variables."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                {/* Left Column: Plan Select & Payment Details */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Step 1: Select Plan Tier */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider block">
                      1. Choose subscription upgrade level
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPendingPlanTier("premium")}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          pendingPlanTier === "premium" 
                            ? "border-amber-500 bg-amber-50/20 shadow-xs animate-pulse" 
                            : "border-slate-200 bg-white hover:border-slate-350"
                        }`}
                      >
                        <div className="flex items-center justify-between font-sans">
                          <span className="text-xs font-black text-amber-600 uppercase">GOLD PRO</span>
                          {pendingPlanTier === "premium" && <span className="text-xs">✓</span>}
                        </div>
                        <p className="text-base font-black text-slate-900 mt-1">$9.99<span className="text-xs font-normal text-slate-400">/mo</span></p>
                        <p className="text-[10px] text-slate-400 mt-1">Unlock certificate prints, customizable learning topics, and premium avatars.</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPendingPlanTier("family")}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          pendingPlanTier === "family" 
                            ? "border-purple-500 bg-purple-50/20 shadow-xs animate-pulse" 
                            : "border-slate-200 bg-white hover:border-slate-350"
                        }`}
                      >
                        <div className="flex items-center justify-between font-sans">
                          <span className="text-xs font-black text-purple-600 uppercase">SUPERNOVA FAMILY</span>
                          {pendingPlanTier === "family" && <span className="text-xs">✓</span>}
                        </div>
                        <p className="text-base font-black text-slate-900 mt-1">$14.99<span className="text-xs font-normal text-slate-400">/mo</span></p>
                        <p className="text-[10px] text-slate-400 mt-1">Adds multiple sibling profiles, real-time avatar locker slots, and team co-play metrics.</p>
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Payment Details Credit Card Form */}
                  {paymentStatus === "idle" && (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!creditCardNumber || !cardHolderName || !cardExpiry || !cardCVV) {
                          alert("Please fill all simulated payment fields.");
                          return;
                        }
                        setPaymentStatus("processing");
                        
                        setTimeout(() => {
                          const tier = pendingPlanTier || "premium";
                          setSubStatus(tier);
                          localStorage.setItem("umbrella_subStatus", tier);
                          
                          // Add to simulated payment log
                          const newTx = {
                            id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
                            date: new Date().toISOString().split("T")[0],
                            amount: tier === "family" ? "$14.99" : "$9.99",
                            status: "Completed",
                            plan: tier === "family" ? "Supernova Family" : "Gold Umbrella"
                          };
                          setPaymentHistory(prev => [newTx, ...prev]);
                          setPaymentStatus("success");
                        }, 2500);
                      }}
                      className="space-y-4"
                    >
                      <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider block">
                        2. Accept payment methods (Interactive Sandbox)
                      </span>

                      <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                        
                        {/* Name on Card */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-extrabold uppercase text-slate-500 font-sans block">Cardholder Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Jane Doe"
                            value={cardHolderName}
                            onChange={(e) => setCardHolderName(e.target.value)}
                            className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 text-slate-850"
                          />
                        </div>

                        {/* Card Number */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-extrabold uppercase text-slate-500 font-sans block">Debit / Credit Card Number</label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              placeholder="4111 2222 3333 4444"
                              maxLength={19}
                              value={creditCardNumber}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, "");
                                let formatted = val.match(/.{1,4}/g)?.join(" ") || val;
                                setCreditCardNumber(formatted);
                              }}
                              className="w-full text-xs font-mono font-semibold p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 pl-9 text-slate-850"
                            />
                            <span className="absolute left-3 top-2.5 text-sm">🔒</span>
                          </div>
                        </div>

                        {/* Expiry and CVV */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold uppercase text-slate-500 font-sans block">Expiration Date</label>
                            <input
                              type="text"
                              required
                              placeholder="MM/YY"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, "");
                                if (val.length > 2) {
                                  val = val.slice(0, 2) + "/" + val.slice(2, 4);
                                }
                                setCardExpiry(val);
                              }}
                              className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-200 rounded-xl text-center focus:ring-1 focus:ring-indigo-505 text-slate-850"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold uppercase text-slate-500 font-sans block">CVV Secure Code</label>
                            <input
                              type="password"
                              required
                              placeholder="***"
                              maxLength={3}
                              value={cardCVV}
                              onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, ""))}
                              className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-200 rounded-xl text-center focus:ring-1 focus:ring-indigo-505 text-slate-850"
                            />
                          </div>
                        </div>

                      </div>

                      {/* Payment Submission Button */}
                      <button
                        type="submit"
                        className="w-full py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-100 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                      >
                        <span>🛡️ Authorization Secured: Process Sandbox Payment</span>
                      </button>
                    </form>
                  )}

                  {/* Processing simulation animation state */}
                  {paymentStatus === "processing" && (
                    <div className="p-8 text-center space-y-4 bg-indigo-50/40 border border-indigo-105 rounded-3xl animate-pulse">
                      <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                      <div className="space-y-1 font-sans">
                        <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-widest">Encrypting credit connection...</h4>
                        <p className="text-[10px] text-slate-400">Verifying safe sandbox signature credentials with bank token gateway.</p>
                      </div>
                    </div>
                  )}

                  {/* Process success screen state with Receipt */}
                  {paymentStatus === "success" && (
                    <motion.div 
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl space-y-4"
                    >
                      <div className="h-10 w-10 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto text-lg">
                        ✓
                      </div>
                      <div className="text-center space-y-1 font-sans">
                        <h4 className="text-sm font-black text-emerald-850 uppercase tracking-wider">Simulated Payment Succeeded!</h4>
                        <p className="text-xs text-emerald-600 font-bold">Your academic workspace profile has been upgraded instantly.</p>
                        <p className="text-[10px] text-slate-500">Transaction TX-{Math.floor(1000 + Math.random() * 9000)} credited sandbox status.</p>
                      </div>

                      <div className="border-t border-emerald-200/60 pt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentStatus("idle")}
                          className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-colors"
                        >
                          Process another upgrade
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPaymentDetailsModal(false);
                            setPaymentStatus("idle");
                          }}
                          className="flex-1 py-1.5 px-3 bg-slate-200 text-slate-800 font-bold text-[10px] rounded-lg transition-colors"
                        >
                          Exit Portal
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Right Column: Dynamic credit card mockup preview, billing rules, invoice logs */}
                <div className="lg:col-span-5 space-y-5">
                  <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider block">
                    Card preview & payment records
                  </span>
                  
                  {/* Dynamic Virtual Bank Card Visual Mockup */}
                  <div className="w-full h-44 bg-gradient-to-br from-indigo-700 via-purple-800 to-pink-600 rounded-2xl p-4 text-white relative shadow-lg overflow-hidden flex flex-col justify-between font-mono select-none">
                    {/* Glossy overlay design lines */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-5 translate-x-5 blur-xl"></div>
                    
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-sans font-black uppercase tracking-widest text-indigo-200">CO-PLAY PLATINUM</span>
                        <h5 className="text-[11px] font-sans font-black leading-none text-white">Security Sandbox Card</h5>
                      </div>
                      <span className="text-sm font-black italic">visa</span>
                    </div>

                    {/* Sim Card chip item */}
                    <div className="w-7 h-5 bg-amber-200/80 rounded-md border border-amber-300"></div>

                    {/* Card Number display */}
                    <div className="text-sm tracking-widest text-center py-1 text-white">
                      {creditCardNumber || "•••• •••• •••• ••••"}
                    </div>

                    <div className="flex justify-between items-end font-sans">
                      <div className="space-y-0.5">
                        <span className="text-[7px] uppercase text-indigo-200 block">CARD HOLDER</span>
                        <p className="text-[10px] font-extrabold uppercase select-all text-white">{cardHolderName || "SIMULATED USER"}</p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className="text-[7px] uppercase text-indigo-200 block">EXPIRES</span>
                        <p className="text-[10px] font-extrabold text-white">{cardExpiry || "MM/YY"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment history spreadsheet logs section */}
                  <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 space-y-2">
                    <h5 className="text-[11px] font-black uppercase text-slate-800">
                      📜 Sandbox Payment & Statement Logs
                    </h5>
                    <div className="space-y-1.5 text-[10px]">
                      {paymentHistory.map((log) => (
                        <div key={log.id} className="flex justify-between items-center border-b border-slate-205 pb-1 pt-1 font-sans">
                          <div>
                            <span className="font-extrabold text-slate-900 block">{log.plan}</span>
                            <span className="text-[9px] text-slate-500">{log.date} • {log.id}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-extrabold text-emerald-700 block">{log.amount}</span>
                            <span className="text-[8px] text-slate-400 font-extrabold bg-slate-200 px-1 py-0.5 rounded leading-none">Simulated</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          alert("Receipt dynamic PDF simulation built safely. Launching print dialogue...");
                          window.print();
                        }}
                        className="text-[9px] font-extrabold text-indigo-700 hover:underline"
                      >
                        Print Statements & PDF Receipts
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
