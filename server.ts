import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization helper for Google GenAI client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Using fallback mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Robust retry wrapper to handle transient errors like 503 Service Unavailable / high demand
async function generateContentWithRetry(ai: GoogleGenAI, options: {
  model: string;
  contents: string | any;
  config?: any;
}) {
  let lastError: any = null;
  // Try the requested model first (e.g. gemini-3.5-flash), then a robust stable fallback if available
  const modelsToTry = [options.model, "gemini-flash-latest"];
  
  for (const currentModel of modelsToTry) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[Gemini API] Requesting model ${currentModel} (Attempt ${attempt}/3)...`);
        const response = await ai.models.generateContent({
          ...options,
          model: currentModel,
        });
        if (response && response.text) {
          console.log(`[Gemini API] Successfully generated content using ${currentModel}`);
          return response;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini API] Attempt ${attempt} with ${currentModel} failed:`, err.message || err);
        
        // Skip or retry based on whether the error is transient/demands-related
        const isTransient = !err.status || err.status === 503 || err.status === 429 || 
                            err.message?.includes("503") || err.message?.includes("demand") ||
                            err.message?.includes("UNAVAILABLE") || err.message?.includes("exhausted");
        if (!isTransient) {
          // If it is a bad request or non-transient, switch to another model right away
          break;
        }
        
        // Wait before retrying with an elegant backoff delay
        if (attempt < 3) {
          const delay = attempt * 800;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  }
  
  throw lastError || new Error("Failed to generate content from Gemini after retries and fallback models.");
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// 1. Generate Lesson with Quiz Interactive Flow
app.post("/api/generate-lesson", async (req, res) => {
  try {
    const { topic, gradeLevel, language = "en", childName = "the student" } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const ai = getAI();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return beautiful fallback mock data so the application is immediately usable without a key
      return res.json(getFallbackLesson(topic, gradeLevel, language, childName));
    }

    const promptText = `
      Create a charming, highly encouraging, children's micro-learning lesson about "${topic}".
      Target Grade Level: ${gradeLevel || "3rd Grade"}.
      Student Name: ${childName}.
      Generate ALL output in the following language: ${language === "es" ? "Spanish" : language === "fr" ? "French" : "English"}.
      
      Requirements:
      1. Use a wonderful, gamified real-world story or interactive analogy (friendly tone, high narrative engagement) as the core teaching session ("storySession").
      2. Provide 2-3 brief key takeaway bullet points ("keyConcepts").
      3. Create 3 child-friendly quiz questions ("quiz") based on the lesson contents to test understanding. Each question should have 3 or 4 clear multiple-choice options, a correct answer index (0-based), and an encouraging, constructive explanation of the concept which is shown whether the child gets it right or wrong.
      4. Provide an "illustrationKeyword" which contains 2-3 child-friendly words describing a concrete visual scene or main characters from the story (e.g., 'dragons sharing apples', 'astronaut on mars planet', 'magical autumn colored leaves') to help displaying matching pictures.
    `;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: "You are a master children's educator and storytelling tutor. You explain difficult academic or analytical concepts using warm analogies. Your goal is to inspire children and make them feel safe, capable, and proud of themselves.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "gradeLevel", "topic", "storySession", "keyConcepts", "quiz", "illustrationKeyword", "galleryMetadata"],
          properties: {
            title: { type: Type.STRING, description: "Captivating and fun title for the micro-lesson" },
            gradeLevel: { type: Type.STRING },
            topic: { type: Type.STRING },
            storySession: { type: Type.STRING, description: "Friendly interactive story lesson or creative analogy explaining the concept" },
            illustrationKeyword: { type: Type.STRING, description: "2-3 fun words identifying the main story visual (e.g. 'dragons with fruit', 'bears in space')" },
            galleryMetadata: {
              type: Type.OBJECT,
              required: ["characterDescription", "settingDescription", "actionDescription"],
              properties: {
                characterDescription: { type: Type.STRING, description: "Detailed child-friendly phrase describing the main story character(s) (e.g., 'three friendly baby dragons with small colorful wings')" },
                settingDescription: { type: Type.STRING, description: "Detailed child-friendly phrase describing the visual backdrop setting (e.g., 'a majestic crystal castle inside a glowing enchanted forest')" },
                actionDescription: { type: Type.STRING, description: "Detailed child-friendly phrase describing the adventure action or puzzle moment (e.g., 'a cheerful dragon happily sharing shiny red apples with friends')" }
              }
            },
            keyConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2 or 3 short key facts or rules from the story"
            },
            quiz: {
              type: Type.ARRAY,
              description: "Array of exactly 3 multiple-choice questions for the student",
              items: {
                type: Type.OBJECT,
                required: ["question", "options", "correctAnswerIndex", "explanation"],
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswerIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING, description: "Encouraging explanation explaining the core logic simply" }
                }
              }
            }
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text from Gemini");
    }

    const lessonData = JSON.parse(response.text.trim());
    res.json(lessonData);

  } catch (error: any) {
    console.error("Error generating lesson:", error);
    res.status(500).json({ error: "Failed to generate lesson: " + error.message });
  }
});

// 2. Translate Dashboard or Generate Activity Homework Insights for Parents
app.post("/api/generate-parent-insights", async (req, res) => {
  try {
    const { 
      childName = "Ethan", 
      topic = "General Support", 
      performanceHistory, // array of { question, selectedOption, correctOption, isCorrect }
      language = "en" 
    } = req.body;

    const ai = getAI();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json(getFallbackInsights(childName, topic, performanceHistory, language));
    }

    const performanceSummary = JSON.stringify(performanceHistory || []);
    const promptText = `
      You are an expert child educational psychologist and friendly parenting coach.
      Analyze the following quiz performance data for ${childName} on the topic of "${topic}":
      Child Performance Details: ${performanceSummary}

      Generate an actionable feedback summary, a master at-home learning plan, AND a highly interactive "Co-Learning Challenge".
      ALL written output must be in the selected language: ${language === "es" ? "Spanish" : language === "fr" ? "French" : "English"}.

      Specifically output a JSON object with:
      - "overallFeedback": Empathetic parent feedback. Give positive notes about trying and explain the main cognitive challenge (e.g., struggling with fractional parts or remainders in division) without complex jargon.
      - "struggleKeywords": 2-3 tags representing conceptual hurdles (e.g., ["place value", "remainders", "sharing equally"]).
      - "atHomeActivities": exactly 2 hands-on, ultra-simple 5-minute activities that don't look like tutoring and require only basic household items (like coins, food, toys), complete with title, quick materials list, parent dialog/guidance instructions, and a loving pro-tip for keeping it light.
      - "coLearningChallenge": A specific offline 5-minute parent-child gameplay guide containing:
        1. "conceptMastering": Key academic/analytical sub-concept they are currently mastering.
        2. "challengeTitle": Fun, playful name for this screen-free mission.
        3. "householdItems": List of easily found household objects (spoon, cups, leaves, pebbles, books) to use.
        4. "parentScript": List of exactly 2-3 simple verbal cue dialogue scripts for the parent to say so they guide without taking over.
        5. "reflectionPrompt": One beautiful reflection question for the parent to ask the child to lock in learning.
    `;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: "You are an empathetic, highly supportive family counselor and learning specialist. You write with deep psychological support, encouraging parents and explaining cognitive gaps using playful real-life play ideas.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["overallFeedback", "struggleKeywords", "atHomeActivities", "coLearningChallenge"],
          properties: {
            overallFeedback: { type: Type.STRING },
            struggleKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            atHomeActivities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["title", "intro", "materialsNeeded", "instructions", "parentProTip"],
                properties: {
                  title: { type: Type.STRING, description: "Fun, creative name of the game/activity" },
                  intro: { type: Type.STRING, description: "Short description of the playful goal" },
                  materialsNeeded: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  instructions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Step-by-step instructions for the parent on what to say and do"
                  },
                  parentProTip: { type: Type.STRING, description: "Coaching quote for stress-free connection" }
                }
              }
            },
            coLearningChallenge: {
              type: Type.OBJECT,
              required: ["conceptMastering", "challengeTitle", "householdItems", "parentScript", "reflectionPrompt"],
              properties: {
                conceptMastering: { type: Type.STRING, description: "The specific sub-concept the child is mastering right now" },
                challengeTitle: { type: Type.STRING, description: "Cute name for the 5-Minute Power Activity" },
                householdItems: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of common household items"
                },
                parentScript: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Simple dialogue cues / leading scripting for the parent"
                },
                reflectionPrompt: { type: Type.STRING, description: "One simple reflection question to ask the child at the end of the activity" }
              }
            }
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text from Gemini");
    }

    const insightsData = JSON.parse(response.text.trim());
    res.json(insightsData);

  } catch (error: any) {
    console.error("Error generating parent insights:", error);
    res.status(500).json({ error: "Failed to generate insights: " + error.message });
  }
});

// -------------------------------------------------------------
// Fallback Generators if GEMINI_API_KEY is not configured
// -------------------------------------------------------------

function getFallbackLesson(topic: string, gradeLevel: string, language: string, childName: string) {
  const isEs = language === "es";
  const isFr = language === "fr";

  if (isEs) {
    return {
      title: `🏰 ¡La Gran Aventura de: ${topic}!`,
      gradeLevel: gradeLevel || "3er Grado",
      topic: topic,
      storySession: `¡Hola, ${childName}! Imagina que eres un valiente explorador en un reino amigable de castillos y magos. Hoy descubrimos el asombroso secreto de "${topic}". En este reino, todos los problemas misteriosos se resuelven compartiendo de forma divertida o resolviendo acertijos paso a paso. Por ejemplo, imagina que tienes 12 deliciosas manzanas mágicas que debes repartir de manera equitativa entre 3 amigables dragones bebés que lanzan chispas de colores. Si le das a cada dragón la misma cantidad exacta de manzanas, ¡cada uno obtendrá exactamente 4 manzanas mágicas! Eso demuestra que al división de las cosas con paciencia, creamos armonía y sonrisas en todo el reino. ¡Siempre estás aprendiendo cosas increíbles!`,
      illustrationKeyword: "dragones manzanas mágicas",
      galleryMetadata: {
        characterDescription: "Tres dragones bebés adorables que lanzan chispas y sonríen con orejas grandes.",
        settingDescription: "El patio mágico del castillo dorado bajo un sol radiante de la mañana.",
        actionDescription: "Un dragón amigable repartiendo manzanas rojas brillantes a sus hermanos con mucho cuidado."
      },
      keyConcepts: [
        "Compartir en partes perfectamente iguales es la clave del éxito.",
        "Los problemas grandes se vuelven súper sencillos si los dividimos en pequeños pasos amistosos.",
        "¡Cada intento te hace más sabio y más fuerte!"
      ],
      quiz: [
        {
          question: `Si tenemos 12 manzanas mágicas y queremos repartirlas equitativamente entre 3 dragones de juguete, ¿cuántas manzanas se lleva cada dragón?`,
          options: ["3 manzanas mágicas", "4 manzanas mágicas", "6 manzanas mágicas", "Ninguna, ¡se las come el mago!"],
          correctAnswerIndex: 1,
          explanation: "¡Eso es perfecto! 12 repartido en 3 grupos iguales da exactamente 4 para cada uno. ¡Eres increíblemente inteligente!"
        },
        {
          question: "¿Qué es lo más importante que debemos hacer cuando dividimos o resolvemos problemas grandes?",
          options: [
            "Tener miedo y rendirse de inmediato",
            "Dividir el problema en pequeños pasos amigables y avanzar paso a paso con paciencia",
            "Hacerlo todo súper rápido sin mirar nada",
            "Llorar con los dragones del castillo"
          ],
          correctAnswerIndex: 1,
          explanation: "¡Excelente! Ir paso a paso con paciencia hace que cualquier misterio sea muy fácil de resolver."
        },
        {
          question: `¿Cómo te sientes hoy respecto a aprender sobre ${topic}?`,
          options: [
            "Con entusiasmo y capaz de lograr cualquier gran meta",
            "Un poco confundido, ¡pero sé que con práctica lo dominaré perfectamente!",
            "¡Listo para jugar y brillar como una estrella!"
          ],
          correctAnswerIndex: 0,
          explanation: "¡Sigue con esa excelente actitud brillante! Cada vez que lo intentas, tu mente se expande."
        }
      ]
    };
  } else if (isFr) {
    return {
      title: `🏰 La Fabuleuse Quête de: ${topic}!`,
      gradeLevel: gradeLevel || "3ème Année",
      topic: topic,
      storySession: `Bonjour, ${childName}! Imagine que tu es un courageux explorateur dans le royaume enchanté de la connaissance. Aujourd'hui, nous partons à la recherche de "${topic}". Pour réussir ta quête, imagine que tu as 12 délicieuses crêpes magiques à distribuer équitablement à 3 bébés pandas. Si chaque panda reçoit exactement la même part, chacun obtiendra exactement 4 crêpes savoureuses ! C'est ce qu'on appelle un partage parfait. Grâce à cette méthode douce, tout le monde est heureux et sourit. Tu vois, apprendre de nouvelles choses est un jeu passionnant que tu maîtrises de mieux en mieux chaque jour !`,
      illustrationKeyword: "pandas crêpes magiques",
      galleryMetadata: {
        characterDescription: "Trois bébés pandas mignons mangeant de délicieuses crêpes.",
        settingDescription: "Une magnifique forêt de bambous lumineuse et enchantée.",
        actionDescription: "Un bébé panda joyeux distribuant avec soin des crêpes magiques."
      },
      keyConcepts: [
        "Un partage juste et équitable permet de résoudre bien des mystères.",
        "Les grands défis deviennent très simples quand on les découpe en petits pas joyeux.",
        "Chaque erreur est une marche de géant pour grandir et devenir plus fort !"
      ],
      quiz: [
        {
          question: `Si tu partages 12 crêpes magiques de manière égale entre 3 pandas gourmands, combien de crêpes aura chaque panda ?`,
          options: ["3 crêpes magiques", "4 crêpes magiques", "6 crêpes magiques", "Aucune, le dragon a tout mangé !"],
          correctAnswerIndex: 1,
          explanation: "Fantastique ! 12 divisé équitablement par 3 donne bien 4. Tu es un champion du partage !"
        },
        {
          question: "Quelle est la meilleure technique face à un grand défi difficile ?",
          options: [
            "S'enfuir en courant très vite",
            "Diviser le défi en petites étapes simples et avancer pas à pas avec confiance",
            "Deviner au hasard les yeux fermés",
            "Attendre que la magie fasse tout le travail"
          ],
          correctAnswerIndex: 1,
          explanation: "Bravo ! En découpant les difficultés en petites étapes, tu peux accomplir absolument tout !"
        },
        {
          question: "Comment te sens-tu après avoir découvert cette aventure ?",
          options: [
            "Super fort et prêt à continuer d'apprendre avec joie",
            "Un petit peu hésitant, mais je sais qu'avec la pratique je vais y arriver !",
            "Prêt à partager de gentils sourires tout autour de moi"
          ],
          correctAnswerIndex: 0,
          explanation: "Merveilleux ! Garde toujours cette étincelle de curiosité en toi !"
        }
      ]
    };
  } else {
    return {
      title: `🏰 The Sweet Castle Quest: ${topic}!`,
      gradeLevel: gradeLevel || "3rd Grade",
      topic: topic,
      storySession: `Hey there, ${childName}! Imagine you are a friendly explorer in the sweet learning castle. Today, we're uncovering the secret keys of "${topic}". Imagine you've gathered 12 glowing magic berries to share with 3 hungry little baby dragons. If each baby dragon gets the exact same amount so they don't fight, each one gets exactly 4 glowing berries! That is division! By sharing nicely and going slowly, we made everyone happy. Learning helper tools like these are just small puzzles that you are fully capable of solving. You're doing a fantastic job, and your brain is growing bigger with every single word you read!`,
      illustrationKeyword: "dragons strawberries dessert",
      galleryMetadata: {
        characterDescription: "Three friendly little baby dragons with small glittering wings.",
        settingDescription: "A beautiful golden crystal castle courtyard under a bright yellow sun.",
        actionDescription: "One clever dragon carefully dividing sweet strawberries into three equal bowls."
      },
      keyConcepts: [
        "Equal sharing is the happy secret behind solving big number puzzles.",
        "Breaking massive problems into small, magical steps ensures you succeed without feeling stressed.",
        "Your effort counts the most! Working with patience is your true superpower."
      ],
      quiz: [
        {
          question: "If there are 12 glowing berries and 3 friendly baby dragons, how many berries does each dragon receive to have equal shares?",
          options: ["3 magic berries", "4 magic berries", "6 magic berries", "None, they preferred marshmallow cookies!"],
          correctAnswerIndex: 1,
          explanation: "Spot on! 12 shared equally into 3 groups gives exactly 4. You are very good at this !"
        },
        {
          question: "What is the best way to handle a huge, scary academic challenge?",
          options: [
            "Give up immediately and go back to sleep",
            "Break the challenge down into tiny, encouraging baby steps and take your time",
            "Speed through as fast as you can without reading first",
            "Hide your notebook under the bed"
          ],
          correctAnswerIndex: 1,
          explanation: "Absolutely! Baby steps always lead to incredible discoveries. You're a natural detective!"
        },
        {
          question: "How do you feel about learning new things today?",
          options: [
            "Excited, proud, and fully ready to try my best!",
            "A bit confused, but I know that practicing will help me master it inside-out!",
            "Ready to conquer the castle of books and earn my star!"
          ],
          correctAnswerIndex: 0,
          explanation: "That energy is beautiful! Your willingness to try makes you a superstar explorer!"
        }
      ]
    };
  }
}

function getFallbackInsights(childName: string, topic: string, history: any[], language: string) {
  const isEs = language === "es";
  const isFr = language === "fr";

  if (isEs) {
    return {
      overallFeedback: `¡${childName} lo hizo fantástico! Demostró gran paciencia leyendo la aventura de "${topic}". Se nota un esfuerzo maravilloso. El principal reto conceptual identificado es consolidar los pasos intermedios de los cálculos numéricos. ¡Su energía y perseverancia son admirables!`,
      struggleKeywords: ["Pasos numéricos", "Confianza al intentar", "Enfoque paso a paso"],
      atHomeActivities: [
        {
          title: "🎯 El Juego de los Dragones Glotones",
          intro: "Una forma táctil de visualizar agrupaciones utilizando pequeños juguetes o alimentos.",
          materialsNeeded: ["12 monedas o frijoles mágicos", "3 vasos pequeños o juguetes"],
          instructions: [
            `Siente a ${childName} a tu lado con los 12 frijoles mágicos y dile: ¡Mira! Tenemos dragones con hambre.`,
            "Pídele que reparta los frijoles de uno en uno en los 3 vasos hasta que se acaben.",
            "Cuenten juntos cuántos frijoles hay en cada vaso y celebren con un '¡Choca esos cinco mágico!'"
          ],
          parentProTip: "No corrijas el cálculo de inmediato. Si comete un error, pídele de manera juguetona que verifique si los dragones están felices con su parte justa."
        },
        {
          title: "🧩 La Torre de los Retos Pequeños",
          intro: "Desglosar tareas cotidianas para fortalecer la secuencia mental y la paciencia.",
          materialsNeeded: ["Bloques de juguete, LEGOs o tazas apilables"],
          instructions: [
            "Propongan un reto simple como 'ordenar la mesa'. En lugar de pedirlo todo, colóquelo por pasos con bloques.",
            "Por cada paso completado (poner tenedores, luego vasos), dejen que coloque un bloque en una súper pila.",
            "¡Al terminar, celebren el trabajo de detective completado paso a paso!"
          ],
          parentProTip: "Usa palabras como 'Paso Aventura 1' en lugar de obligaciones para mantener el juego emocionante."
        }
      ],
      coLearningChallenge: {
        conceptMastering: "División equitativa y correspondencia uno a uno",
        challengeTitle: "⚡ Desafío de Energía de 5 Minutos: Cucharitas en la Cocina",
        householdItems: ["6 cucharas soperas", "2 tazas de plástico o platos hondos"],
        parentScript: [
          "¡Hagamos magia de reparto! ¿Cómo podemos poner el mismo número de cucharas en cada taza para que no haya peleas?",
          "¡Prueba a poner una a una! ¿Cuántas recibió cada súper taza?"
        ],
        reflectionPrompt: "¿Por qué crees que repartir de uno en uno nos ayuda a que las partes sean exactamente iguales?"
      }
    };
  } else if (isFr) {
    return {
      overallFeedback: `Quelle belle tentative d'apprentissage pour ${childName} ! L'attention portée à l'histoire de "${topic}" était excellente. L'analyse des réponses indique que l'essentiel est de renforcer la décomposition des tâches en étapes simples pour bâtir une confiance solide. Sa persévérance est un atout précieux !`,
      struggleKeywords: ["Décomposition visuelle", "Confiance en soi", "Progression douce"],
      atHomeActivities: [
        {
          title: "🎯 Le Goûter Partagé des Pandas",
          intro: "Apprendre la division de manière gourmande et tactile pendant le goûter.",
          materialsNeeded: ["12 petits biscuits ou bonbons", "3 petites assiettes ou jouets"],
          instructions: [
            `Dites à ${childName} : 'Nos trois amis pandas ont très faim d'aventure. Partageons ce goûter équitablement !'`,
            "Laissez l'enfant répartir le trésor entre les assiettes une pièce à la fois.",
            "Validez ensemble le calme et l'équité du trésor."
          ],
          parentProTip: "Laissez l'enfant avoir le contrôle. S'il y a un déséquilibre, demandez en rigolant : 'Est-ce que le panda rouge n'est pas un peu jaloux ?'"
        },
        {
          title: "🧩 La Pyramide des Petits Pas",
          intro: "Encourager la patience en découpant les tâches au quotidien à l'aide de cubes.",
          materialsNeeded: ["Petits cubes de bois ou briques LEGO"],
          instructions: [
            "Choisissez un objectif amusant à accomplir.",
            "Pour chaque étape réussie (ex : écrire son prénom, lire un paragraphe), ajoutez un cube sur la pyramide.",
            "Félicitez chaudement l'effort à la fin !"
          ],
          parentProTip: "Insistez sur le plaisir de l'apprentissage plutôt que sur la rapidité."
        }
      ],
      coLearningChallenge: {
        conceptMastering: "Partage équitable et repères visuels simples",
        challengeTitle: "⚡ Défi Énergie 5 Min : Les petites cuillères magiques",
        householdItems: ["6 petites cuillères", "2 tasses ou bols en plastique"],
        parentScript: [
          "Jetons un sort de partage ! Comment pouvons-nous placer ces cuillères équitablement dans chaque bol ?",
          "Essaie de distribuer une par une pour voir ! Combien de cuillères chaque bol a-t-il reçu ?"
        ],
        reflectionPrompt: "Pourquoi penses-tu que distribuer un par un évite que l'un des bols soit jaloux ?"
      }
    };
  } else {
    return {
      overallFeedback: `${childName} did absolutely fantastic today ! They spent excellent effort looking through the narrative for "${topic}". The core area to practice here is step-by-step sequencing while building their conceptual confidence. They are so eager to try, which is the most beautiful thing !`,
      struggleKeywords: ["Equal Partitioning", "Pacing & Sequence", "Confidence Play"],
      atHomeActivities: [
        {
          title: "🎯 The Hungry Toys Equal Division",
          intro: "A fun physical game to master sharing and division with physical items around the table.",
          materialsNeeded: ["12 coins, buttons, or dry pasta shells", "3 small cups or action figures"],
          instructions: [
            `Sit with ${childName} and say: 'Look, our baby toys got a box of delicious magical pearls. Let's make sure they are divided equally!'`,
            "Guide them to hand out the pasta pieces one-by-one into the cups so everything remains fair.",
            "Count and see there are exactly 4 in each. Finish with a giant high-five!"
          ],
          parentProTip: "Let them lead the division. If they miscount, just ask with a smile: 'Oh wait, is this little dinosaur's stomach rumbling because it got fewer than the others?'"
        },
        {
          title: "🧩 Building Blocks Sequence Castle",
          intro: "Reinforce breaking down overwhelming homework questions into baby steps with building blocks.",
          materialsNeeded: ["LEGO bricks or toy blocks"],
          instructions: [
            "Whenever they meet a multi-step task, set standard LEGO bricks out representing step 1, step 2, and step 3.",
            "Once they read and explain step 1, click that block. Build them into a sturdy castle together as you progress.",
            "Praise their focus: 'We are building our castle of intelligence brick by brick!'"
          ],
          parentProTip: "Celebrate progress rather than perfect scores. Your joyful energy makes learning feel safe."
        }
      ],
      coLearningChallenge: {
        conceptMastering: "Equal distribution & physical 1-to-1 matching",
        challengeTitle: "⚡ 5-Minute Power Challenge: The Hungry Cup Division",
        householdItems: ["6 teaspoons or crayons", "2 plastic drinking cups"],
        parentScript: [
          "Let's play a physical dividing quest! How can we make sure these items get shared perfectly between these two cups?",
          "What if we put them in one-by-one? Give it a go and count with me!"
        ],
        reflectionPrompt: "Why does putting items in one-by-one help us make sure the groups are exactly equal?"
      }
    };
  }
}

// -------------------------------------------------------------
// Vite Dev Server / Static Hosting Integration
// -------------------------------------------------------------
async function run() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Mount Vite dev server middleware to render/serve React + assets
    app.use(vite.middlewares);
  } else {
    // In production, serve absolute built assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Umbrella Learning] Server online at http://0.0.0.0:${PORT}`);
  });
}

run().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
