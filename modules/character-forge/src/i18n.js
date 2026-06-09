// i18n.js — Character Forge strings + data tables (10 languages preserved
// verbatim from the original dnd-character-generator). The generation prompt and
// language handling now live server-side (apps/hub/api/_core.js); this file only
// drives the UI.

export const LANGUAGES = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

export const SECTIONS = ['backstory', 'personality', 'goals', 'flaws', 'secret_desire'];

// Section header icons, mapped onto the shared line-icon set (no emoji in chrome).
export const SECTION_ICONS = {
  backstory: 'book',
  personality: 'npc',
  goals: 'bolt',
  flaws: 'droplet',
  secret_desire: 'wand',
};

// Emoji used only in the copy-to-clipboard plaintext export (content, not chrome).
export const SECTION_EMOJI = {
  backstory: '📜',
  personality: '🎭',
  goals: '⚔️',
  flaws: '💔',
  secret_desire: '🕯️',
};

export const RACES = [
  'Human', 'Elf', 'Half-Elf', 'Dwarf', 'Halfling', 'Gnome', 'Tiefling', 'Dragonborn',
  'Orc', 'Half-Orc', 'Aasimar', 'Tabaxi', 'Kenku', 'Firbolg', 'Genasi', 'Changeling', 'Kalashtar',
];
export const CLASSES = [
  'Fighter', 'Wizard', 'Rogue', 'Cleric', 'Ranger', 'Paladin', 'Barbarian', 'Bard',
  'Druid', 'Monk', 'Sorcerer', 'Warlock', 'Artificer', 'Blood Hunter', 'Mystic',
];
export const FIRST_NAMES = [
  'Aerin', 'Bryn', 'Calix', 'Dara', 'Edrin', 'Fael', 'Gareth', 'Hilda', 'Isra', 'Jorin',
  'Kael', 'Lyra', 'Maren', 'Nyx', 'Orin', 'Petra', 'Quill', 'Riven', 'Sable', 'Thorn',
  'Ursa', 'Vex', 'Wren', 'Xan', 'Yael', 'Zara',
];
export const LAST_NAMES = [
  'Ashwood', 'Blackthorn', 'Coldwater', 'Duskmantle', 'Emberveil', 'Frostmere', 'Graymoor',
  'Hollowfield', 'Ironforge', 'Jadewing', 'Kindlewick', 'Loreweave', 'Moonshadow', 'Nighthollow',
  'Oakenshield', 'Pyre', 'Quicksilver', 'Ravenmoor', 'Stonehaven', 'Timberfall', 'Underhill',
  'Valecroft', 'Whitlock', 'Xandrel',
];

export const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const sanitize = (str) =>
  String(str || '')
    .replace(/[\\"`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const UI = {
  ru: { title: 'Кузница Персонажей', subtitle: 'Генератор персонажей для D&D', name: 'Имя', race: 'Раса', cls: 'Класс', vibe: 'Образ / Концепция', vibeOpt: '(необязательно)', vibePlaceholder: '"мрачный бывший солдат"', randomAll: '🎲 Случайный персонаж', generate: '⚒ Создать персонажа', generating: 'Создаём…', fates: 'Судьбы ткут историю вашего персонажа…', copyAll: '📋 Копировать', copied: '✓ Скопировано!', redo: '↺ Заново', generateNew: '⚒ Создать нового', error: 'Заполните хотя бы одно поле.', gender: 'Пол', male: 'Мужской', female: 'Женский', other: 'Другой', length: 'Длина', short: 'Коротко', normal: 'Обычно', long: 'Подробно', sections: { backstory: 'Предыстория', personality: 'Личность', goals: 'Цели', flaws: 'Изъяны', secret_desire: 'Тайное желание' } },
  en: { title: 'Character Forge', subtitle: 'D&D & Storytelling Character Generator', name: 'Name', race: 'Race', cls: 'Class', vibe: 'Vibe / Concept', vibeOpt: '(optional)', vibePlaceholder: '"brooding ex-soldier"', randomAll: '🎲 Randomize All', generate: '⚒ Generate Character', generating: 'Forging…', fates: "The fates are weaving your character's story…", copyAll: '📋 Copy All', copied: '✓ Copied!', redo: '↺ Redo', generateNew: '⚒ Generate New', error: 'Fill in at least one field.', gender: 'Gender', male: 'Male', female: 'Female', other: 'Other', length: 'Length', short: 'Short', normal: 'Normal', long: 'Detailed', sections: { backstory: 'Backstory', personality: 'Personality', goals: 'Goals', flaws: 'Flaws', secret_desire: 'Secret Desire' } },
  de: { title: 'Charakterschmiede', subtitle: 'D&D Charaktergenerator', name: 'Name', race: 'Rasse', cls: 'Klasse', vibe: 'Stimmung', vibeOpt: '(optional)', vibePlaceholder: '"grüblerischer Ex-Soldat"', randomAll: '🎲 Alle zufällig', generate: '⚒ Erstellen', generating: 'Schmieden…', fates: 'Das Schicksal webt deine Geschichte…', copyAll: '📋 Kopieren', copied: '✓ Kopiert!', redo: '↺ Neu', generateNew: '⚒ Neuer Charakter', error: 'Mindestens ein Feld ausfüllen.', gender: 'Geschlecht', male: 'Männlich', female: 'Weiblich', other: 'Divers', length: 'Länge', short: 'Kurz', normal: 'Normal', long: 'Ausführlich', sections: { backstory: 'Hintergrund', personality: 'Persönlichkeit', goals: 'Ziele', flaws: 'Schwächen', secret_desire: 'Geheimer Wunsch' } },
  fr: { title: 'Forge de Personnage', subtitle: 'Générateur D&D', name: 'Nom', race: 'Race', cls: 'Classe', vibe: 'Ambiance', vibeOpt: '(optionnel)', vibePlaceholder: '"ancien soldat taciturne"', randomAll: '🎲 Tout aléatoire', generate: '⚒ Générer', generating: 'Forgeage…', fates: 'Les destins tissent votre histoire…', copyAll: '📋 Copier', copied: '✓ Copié!', redo: '↺ Refaire', generateNew: '⚒ Nouveau', error: 'Remplissez au moins un champ.', gender: 'Genre', male: 'Masculin', female: 'Féminin', other: 'Autre', length: 'Longueur', short: 'Court', normal: 'Normal', long: 'Détaillé', sections: { backstory: 'Histoire', personality: 'Personnalité', goals: 'Objectifs', flaws: 'Défauts', secret_desire: 'Désir secret' } },
  es: { title: 'Forja de Personajes', subtitle: 'Generador D&D', name: 'Nombre', race: 'Raza', cls: 'Clase', vibe: 'Vibra', vibeOpt: '(opcional)', vibePlaceholder: '"ex-soldado sombrío"', randomAll: '🎲 Aleatorizar', generate: '⚒ Generar', generating: 'Forjando…', fates: 'Los destinos tejen tu historia…', copyAll: '📋 Copiar', copied: '✓ Copiado!', redo: '↺ Rehacer', generateNew: '⚒ Nuevo', error: 'Rellena al menos un campo.', gender: 'Género', male: 'Masculino', female: 'Femenino', other: 'Otro', length: 'Longitud', short: 'Corto', normal: 'Normal', long: 'Detallado', sections: { backstory: 'Historia', personality: 'Personalidad', goals: 'Objetivos', flaws: 'Defectos', secret_desire: 'Deseo secreto' } },
  it: { title: 'Fucina dei Personaggi', subtitle: 'Generatore D&D', name: 'Nome', race: 'Razza', cls: 'Classe', vibe: 'Atmosfera', vibeOpt: '(opzionale)', vibePlaceholder: '"ex-soldato cupo"', randomAll: '🎲 Tutto casuale', generate: '⚒ Genera', generating: 'Creando…', fates: 'I fati tessono la tua storia…', copyAll: '📋 Copia', copied: '✓ Copiato!', redo: '↺ Rifai', generateNew: '⚒ Nuovo', error: 'Compila almeno un campo.', gender: 'Genere', male: 'Maschile', female: 'Femminile', other: 'Altro', length: 'Lunghezza', short: 'Breve', normal: 'Normale', long: 'Dettagliato', sections: { backstory: 'Storia', personality: 'Personalità', goals: 'Obiettivi', flaws: 'Difetti', secret_desire: 'Desiderio segreto' } },
  pt: { title: 'Forja de Personagens', subtitle: 'Gerador D&D', name: 'Nome', race: 'Raça', cls: 'Classe', vibe: 'Vibe', vibeOpt: '(opcional)', vibePlaceholder: '"ex-soldado sombrio"', randomAll: '🎲 Aleatório', generate: '⚒ Gerar', generating: 'Forjando…', fates: 'Os destinos tecem sua história…', copyAll: '📋 Copiar', copied: '✓ Copiado!', redo: '↺ Refazer', generateNew: '⚒ Novo', error: 'Preencha pelo menos um campo.', gender: 'Gênero', male: 'Masculino', female: 'Feminino', other: 'Outro', length: 'Tamanho', short: 'Curto', normal: 'Normal', long: 'Detalhado', sections: { backstory: 'História', personality: 'Personalidade', goals: 'Objetivos', flaws: 'Defeitos', secret_desire: 'Desejo secreto' } },
  pl: { title: 'Kuźnia Postaci', subtitle: 'Generator D&D', name: 'Imię', race: 'Rasa', cls: 'Klasa', vibe: 'Klimat', vibeOpt: '(opcjonalne)', vibePlaceholder: '"ponury były żołnierz"', randomAll: '🎲 Losuj wszystko', generate: '⚒ Stwórz', generating: 'Kucie…', fates: 'Losy tkają twoją historię…', copyAll: '📋 Kopiuj', copied: '✓ Skopiowano!', redo: '↺ Ponów', generateNew: '⚒ Nowa postać', error: 'Wypełnij przynajmniej jedno pole.', gender: 'Płeć', male: 'Mężczyzna', female: 'Kobieta', other: 'Inne', length: 'Długość', short: 'Krótko', normal: 'Normalnie', long: 'Szczegółowo', sections: { backstory: 'Przeszłość', personality: 'Osobowość', goals: 'Cele', flaws: 'Wady', secret_desire: 'Tajne pragnienie' } },
  ja: { title: 'キャラクター鍛冶場', subtitle: 'D&Dジェネレーター', name: '名前', race: '種族', cls: 'クラス', vibe: '雰囲気', vibeOpt: '(任意)', vibePlaceholder: '"暗い元兵士"', randomAll: '🎲 ランダム', generate: '⚒ 生成', generating: '生成中…', fates: '運命が物語を紡いでいます…', copyAll: '📋 コピー', copied: '✓ 済み!', redo: '↺ 再生成', generateNew: '⚒ 新キャラ', error: '少なくとも一つ入力してください。', gender: '性別', male: '男性', female: '女性', other: 'その他', length: '長さ', short: '短め', normal: '普通', long: '詳細', sections: { backstory: 'バックストーリー', personality: '性格', goals: '目標', flaws: '欠点', secret_desire: '秘密の欲望' } },
  zh: { title: '角色锻造炉', subtitle: 'D&D角色生成器', name: '姓名', race: '种族', cls: '职业', vibe: '氛围', vibeOpt: '(可选)', vibePlaceholder: '"阴郁的前士兵"', randomAll: '🎲 随机全部', generate: '⚒ 生成角色', generating: '锻造中…', fates: '命运正在编织你的故事…', copyAll: '📋 复制', copied: '✓ 已复制!', redo: '↺ 重做', generateNew: '⚒ 新角色', error: '请至少填写一个字段。', gender: '性别', male: '男', female: '女', other: '其他', length: '长度', short: '简短', normal: '普通', long: '详细', sections: { backstory: '背景故事', personality: '个性', goals: '目标', flaws: '缺陷', secret_desire: '隐秘渴望' } },
};
