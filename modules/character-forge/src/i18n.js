// i18n.js — Character Forge strings + data tables (UI strings: 10 languages
// preserved verbatim from the original dnd-character-generator; roll tables:
// ru/en pairs, other languages fall back to en). The generation prompt and
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

// Roll tables: ru/en pairs (tavern-builder pattern; i18n.test.js guards the shape).
// Races/classes use canonical Russian D&D terms; first names are transliterated;
// surnames mix calques and transliteration, curated per entry. UI languages other
// than ru fall back to en via randL.
export const RACES = [
  { en: 'Human', ru: 'Человек' },
  { en: 'Elf', ru: 'Эльф' },
  { en: 'Half-Elf', ru: 'Полуэльф' },
  { en: 'Dwarf', ru: 'Дварф' },
  { en: 'Halfling', ru: 'Полурослик' },
  { en: 'Gnome', ru: 'Гном' },
  { en: 'Tiefling', ru: 'Тифлинг' },
  { en: 'Dragonborn', ru: 'Драконорождённый' },
  { en: 'Orc', ru: 'Орк' },
  { en: 'Half-Orc', ru: 'Полуорк' },
  { en: 'Aasimar', ru: 'Аасимар' },
  { en: 'Tabaxi', ru: 'Табакси' },
  { en: 'Kenku', ru: 'Кенку' },
  { en: 'Firbolg', ru: 'Фирболг' },
  { en: 'Genasi', ru: 'Генази' },
  { en: 'Changeling', ru: 'Подменыш' },
  { en: 'Kalashtar', ru: 'Калаштар' },
];
export const CLASSES = [
  { en: 'Fighter', ru: 'Воин' },
  { en: 'Wizard', ru: 'Волшебник' },
  { en: 'Rogue', ru: 'Плут' },
  { en: 'Cleric', ru: 'Жрец' },
  { en: 'Ranger', ru: 'Следопыт' },
  { en: 'Paladin', ru: 'Паладин' },
  { en: 'Barbarian', ru: 'Варвар' },
  { en: 'Bard', ru: 'Бард' },
  { en: 'Druid', ru: 'Друид' },
  { en: 'Monk', ru: 'Монах' },
  { en: 'Sorcerer', ru: 'Чародей' },
  { en: 'Warlock', ru: 'Колдун' },
  { en: 'Artificer', ru: 'Изобретатель' },
  { en: 'Blood Hunter', ru: 'Кровавый охотник' },
  { en: 'Mystic', ru: 'Мистик' },
];
export const FIRST_NAMES = [
  { en: 'Aerin', ru: 'Аэрин' },
  { en: 'Bryn', ru: 'Брин' },
  { en: 'Calix', ru: 'Каликс' },
  { en: 'Dara', ru: 'Дара' },
  { en: 'Edrin', ru: 'Эдрин' },
  { en: 'Fael', ru: 'Фаэль' },
  { en: 'Gareth', ru: 'Гарет' },
  { en: 'Hilda', ru: 'Хильда' },
  { en: 'Isra', ru: 'Исра' },
  { en: 'Jorin', ru: 'Джорин' },
  { en: 'Kael', ru: 'Каэль' },
  { en: 'Lyra', ru: 'Лира' },
  { en: 'Maren', ru: 'Марен' },
  { en: 'Nyx', ru: 'Никс' },
  { en: 'Orin', ru: 'Орин' },
  { en: 'Petra', ru: 'Петра' },
  { en: 'Quill', ru: 'Квилл' },
  { en: 'Riven', ru: 'Ривен' },
  { en: 'Sable', ru: 'Сейбл' },
  { en: 'Thorn', ru: 'Торн' },
  { en: 'Ursa', ru: 'Урса' },
  { en: 'Vex', ru: 'Векс' },
  { en: 'Wren', ru: 'Рен' },
  { en: 'Xan', ru: 'Ксан' },
  { en: 'Yael', ru: 'Яэль' },
  { en: 'Zara', ru: 'Зара' },
];
export const LAST_NAMES = [
  { en: 'Ashwood', ru: 'Эшвуд' },
  { en: 'Blackthorn', ru: 'Чернотерн' },
  { en: 'Coldwater', ru: 'Хладвод' },
  { en: 'Duskmantle', ru: 'Даскмантл' },
  { en: 'Emberveil', ru: 'Эмбервейл' },
  { en: 'Frostmere', ru: 'Фростмир' },
  { en: 'Graymoor', ru: 'Греймур' },
  { en: 'Hollowfield', ru: 'Холлоуфилд' },
  { en: 'Ironforge', ru: 'Стальгорн' },
  { en: 'Jadewing', ru: 'Нефритокрыл' },
  { en: 'Kindlewick', ru: 'Киндлвик' },
  { en: 'Loreweave', ru: 'Лорвив' },
  { en: 'Moonshadow', ru: 'Лунотень' },
  { en: 'Nighthollow', ru: 'Ночедол' },
  { en: 'Oakenshield', ru: 'Дубощит' },
  { en: 'Pyre', ru: 'Пламень' },
  { en: 'Quicksilver', ru: 'Квиксильвер' },
  { en: 'Ravenmoor', ru: 'Рейвенмур' },
  { en: 'Stonehaven', ru: 'Камнеград' },
  { en: 'Timberfall', ru: 'Лесопад' },
  { en: 'Underhill', ru: 'Подхолм' },
  { en: 'Valecroft', ru: 'Вейлкрофт' },
  { en: 'Whitlock', ru: 'Уитлок' },
  { en: 'Xandrel', ru: 'Ксандрел' },
];

export const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const randL = (arr, lang) => {
  const e = rand(arr);
  return e[lang] ?? e.en;
};
export const sanitize = (str) =>
  String(str || '')
    .replace(/[\\"`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const UI = {
  ru: { title: 'Кузница Персонажей', subtitle: 'Генератор персонажей для D&D', name: 'Имя', race: 'Раса', cls: 'Класс', vibe: 'Образ / Концепция', vibeOpt: '(необязательно)', vibePlaceholder: '"мрачный бывший солдат"', namePlaceholder: 'Каэль Лунотень', racePlaceholder: 'Тифлинг', clsPlaceholder: 'Колдун', randomAll: '🎲 Случайный персонаж', generate: '⚒ Создать персонажа', generating: 'Создаём…', fates: 'Судьбы ткут историю вашего персонажа…', copyAll: '📋 Копировать', copied: '✓ Скопировано!', redo: '↺ Заново', generateNew: '⚒ Создать нового', error: 'Заполните хотя бы одно поле.', gender: 'Пол', male: 'Мужской', female: 'Женский', other: 'Другой', length: 'Длина', short: 'Коротко', normal: 'Обычно', long: 'Подробно', freeLeft: 'Осталось бесплатных генераций: {n}', freeLimitText: 'Бесплатные генерации закончились. Добавьте свой API-ключ Anthropic, чтобы продолжить.', apiKey: 'API-ключ', keyPlaceholder: 'sk-ant-…', save: 'Сохранить', clearKey: 'Удалить ключ', usingOwnKey: 'Используется ваш API-ключ', invalidKey: 'Неверный API-ключ. Проверьте его и попробуйте снова.', keyNote: 'Ключ хранится только в этом браузере.', getKey: 'Получить ключ', sections: { backstory: 'Предыстория', personality: 'Личность', goals: 'Цели', flaws: 'Изъяны', secret_desire: 'Тайное желание' } },
  en: { title: 'Character Forge', subtitle: 'D&D & Storytelling Character Generator', name: 'Name', race: 'Race', cls: 'Class', vibe: 'Vibe / Concept', vibeOpt: '(optional)', vibePlaceholder: '"brooding ex-soldier"', namePlaceholder: 'Kael Duskmantle', racePlaceholder: 'Tiefling', clsPlaceholder: 'Warlock', randomAll: '🎲 Randomize All', generate: '⚒ Generate Character', generating: 'Forging…', fates: "The fates are weaving your character's story…", copyAll: '📋 Copy All', copied: '✓ Copied!', redo: '↺ Redo', generateNew: '⚒ Generate New', error: 'Fill in at least one field.', gender: 'Gender', male: 'Male', female: 'Female', other: 'Other', length: 'Length', short: 'Short', normal: 'Normal', long: 'Detailed', freeLeft: 'Free generations left: {n}', freeLimitText: 'You have used all free generations. Add your own Anthropic API key to continue.', apiKey: 'API key', keyPlaceholder: 'sk-ant-…', save: 'Save', clearKey: 'Remove key', usingOwnKey: 'Using your own API key', invalidKey: 'Invalid API key. Check it and try again.', keyNote: 'The key is stored only in this browser.', getKey: 'Get a key', sections: { backstory: 'Backstory', personality: 'Personality', goals: 'Goals', flaws: 'Flaws', secret_desire: 'Secret Desire' } },
  de: { title: 'Charakterschmiede', subtitle: 'D&D Charaktergenerator', name: 'Name', race: 'Rasse', cls: 'Klasse', vibe: 'Stimmung', vibeOpt: '(optional)', vibePlaceholder: '"grüblerischer Ex-Soldat"', randomAll: '🎲 Alle zufällig', generate: '⚒ Erstellen', generating: 'Schmieden…', fates: 'Das Schicksal webt deine Geschichte…', copyAll: '📋 Kopieren', copied: '✓ Kopiert!', redo: '↺ Neu', generateNew: '⚒ Neuer Charakter', error: 'Mindestens ein Feld ausfüllen.', gender: 'Geschlecht', male: 'Männlich', female: 'Weiblich', other: 'Divers', length: 'Länge', short: 'Kurz', normal: 'Normal', long: 'Ausführlich', freeLeft: 'Verbleibende Gratis-Generierungen: {n}', freeLimitText: 'Alle Gratis-Generierungen verbraucht. Füge deinen eigenen Anthropic-API-Schlüssel hinzu, um fortzufahren.', apiKey: 'API-Schlüssel', keyPlaceholder: 'sk-ant-…', save: 'Speichern', clearKey: 'Schlüssel entfernen', usingOwnKey: 'Eigener API-Schlüssel aktiv', invalidKey: 'Ungültiger API-Schlüssel. Bitte prüfen und erneut versuchen.', keyNote: 'Der Schlüssel wird nur in diesem Browser gespeichert.', getKey: 'Schlüssel holen', sections: { backstory: 'Hintergrund', personality: 'Persönlichkeit', goals: 'Ziele', flaws: 'Schwächen', secret_desire: 'Geheimer Wunsch' } },
  fr: { title: 'Forge de Personnage', subtitle: 'Générateur D&D', name: 'Nom', race: 'Race', cls: 'Classe', vibe: 'Ambiance', vibeOpt: '(optionnel)', vibePlaceholder: '"ancien soldat taciturne"', randomAll: '🎲 Tout aléatoire', generate: '⚒ Générer', generating: 'Forgeage…', fates: 'Les destins tissent votre histoire…', copyAll: '📋 Copier', copied: '✓ Copié!', redo: '↺ Refaire', generateNew: '⚒ Nouveau', error: 'Remplissez au moins un champ.', gender: 'Genre', male: 'Masculin', female: 'Féminin', other: 'Autre', length: 'Longueur', short: 'Court', normal: 'Normal', long: 'Détaillé', freeLeft: 'Générations gratuites restantes : {n}', freeLimitText: 'Vous avez utilisé toutes les générations gratuites. Ajoutez votre clé API Anthropic pour continuer.', apiKey: 'Clé API', keyPlaceholder: 'sk-ant-…', save: 'Enregistrer', clearKey: 'Supprimer la clé', usingOwnKey: 'Votre clé API est utilisée', invalidKey: 'Clé API invalide. Vérifiez-la et réessayez.', keyNote: 'La clé reste uniquement dans ce navigateur.', getKey: 'Obtenir une clé', sections: { backstory: 'Histoire', personality: 'Personnalité', goals: 'Objectifs', flaws: 'Défauts', secret_desire: 'Désir secret' } },
  es: { title: 'Forja de Personajes', subtitle: 'Generador D&D', name: 'Nombre', race: 'Raza', cls: 'Clase', vibe: 'Vibra', vibeOpt: '(opcional)', vibePlaceholder: '"ex-soldado sombrío"', randomAll: '🎲 Aleatorizar', generate: '⚒ Generar', generating: 'Forjando…', fates: 'Los destinos tejen tu historia…', copyAll: '📋 Copiar', copied: '✓ Copiado!', redo: '↺ Rehacer', generateNew: '⚒ Nuevo', error: 'Rellena al menos un campo.', gender: 'Género', male: 'Masculino', female: 'Femenino', other: 'Otro', length: 'Longitud', short: 'Corto', normal: 'Normal', long: 'Detallado', freeLeft: 'Generaciones gratis restantes: {n}', freeLimitText: 'Has usado todas las generaciones gratis. Añade tu propia clave API de Anthropic para continuar.', apiKey: 'Clave API', keyPlaceholder: 'sk-ant-…', save: 'Guardar', clearKey: 'Quitar clave', usingOwnKey: 'Usando tu propia clave API', invalidKey: 'Clave API no válida. Compruébala e inténtalo de nuevo.', keyNote: 'La clave se guarda solo en este navegador.', getKey: 'Obtener clave', sections: { backstory: 'Historia', personality: 'Personalidad', goals: 'Objetivos', flaws: 'Defectos', secret_desire: 'Deseo secreto' } },
  it: { title: 'Fucina dei Personaggi', subtitle: 'Generatore D&D', name: 'Nome', race: 'Razza', cls: 'Classe', vibe: 'Atmosfera', vibeOpt: '(opzionale)', vibePlaceholder: '"ex-soldato cupo"', randomAll: '🎲 Tutto casuale', generate: '⚒ Genera', generating: 'Creando…', fates: 'I fati tessono la tua storia…', copyAll: '📋 Copia', copied: '✓ Copiato!', redo: '↺ Rifai', generateNew: '⚒ Nuovo', error: 'Compila almeno un campo.', gender: 'Genere', male: 'Maschile', female: 'Femminile', other: 'Altro', length: 'Lunghezza', short: 'Breve', normal: 'Normale', long: 'Dettagliato', freeLeft: 'Generazioni gratuite rimaste: {n}', freeLimitText: 'Hai usato tutte le generazioni gratuite. Aggiungi la tua chiave API Anthropic per continuare.', apiKey: 'Chiave API', keyPlaceholder: 'sk-ant-…', save: 'Salva', clearKey: 'Rimuovi chiave', usingOwnKey: 'Stai usando la tua chiave API', invalidKey: 'Chiave API non valida. Controllala e riprova.', keyNote: 'La chiave resta solo in questo browser.', getKey: 'Ottieni una chiave', sections: { backstory: 'Storia', personality: 'Personalità', goals: 'Obiettivi', flaws: 'Difetti', secret_desire: 'Desiderio segreto' } },
  pt: { title: 'Forja de Personagens', subtitle: 'Gerador D&D', name: 'Nome', race: 'Raça', cls: 'Classe', vibe: 'Vibe', vibeOpt: '(opcional)', vibePlaceholder: '"ex-soldado sombrio"', randomAll: '🎲 Aleatório', generate: '⚒ Gerar', generating: 'Forjando…', fates: 'Os destinos tecem sua história…', copyAll: '📋 Copiar', copied: '✓ Copiado!', redo: '↺ Refazer', generateNew: '⚒ Novo', error: 'Preencha pelo menos um campo.', gender: 'Gênero', male: 'Masculino', female: 'Feminino', other: 'Outro', length: 'Tamanho', short: 'Curto', normal: 'Normal', long: 'Detalhado', freeLeft: 'Gerações grátis restantes: {n}', freeLimitText: 'Você usou todas as gerações grátis. Adicione sua própria chave de API da Anthropic para continuar.', apiKey: 'Chave de API', keyPlaceholder: 'sk-ant-…', save: 'Salvar', clearKey: 'Remover chave', usingOwnKey: 'Usando sua própria chave de API', invalidKey: 'Chave de API inválida. Verifique e tente novamente.', keyNote: 'A chave fica somente neste navegador.', getKey: 'Obter chave', sections: { backstory: 'História', personality: 'Personalidade', goals: 'Objetivos', flaws: 'Defeitos', secret_desire: 'Desejo secreto' } },
  pl: { title: 'Kuźnia Postaci', subtitle: 'Generator D&D', name: 'Imię', race: 'Rasa', cls: 'Klasa', vibe: 'Klimat', vibeOpt: '(opcjonalne)', vibePlaceholder: '"ponury były żołnierz"', randomAll: '🎲 Losuj wszystko', generate: '⚒ Stwórz', generating: 'Kucie…', fates: 'Losy tkają twoją historię…', copyAll: '📋 Kopiuj', copied: '✓ Skopiowano!', redo: '↺ Ponów', generateNew: '⚒ Nowa postać', error: 'Wypełnij przynajmniej jedno pole.', gender: 'Płeć', male: 'Mężczyzna', female: 'Kobieta', other: 'Inne', length: 'Długość', short: 'Krótko', normal: 'Normalnie', long: 'Szczegółowo', freeLeft: 'Pozostałe darmowe generacje: {n}', freeLimitText: 'Wykorzystano wszystkie darmowe generacje. Dodaj własny klucz API Anthropic, aby kontynuować.', apiKey: 'Klucz API', keyPlaceholder: 'sk-ant-…', save: 'Zapisz', clearKey: 'Usuń klucz', usingOwnKey: 'Używasz własnego klucza API', invalidKey: 'Nieprawidłowy klucz API. Sprawdź go i spróbuj ponownie.', keyNote: 'Klucz jest przechowywany tylko w tej przeglądarce.', getKey: 'Uzyskaj klucz', sections: { backstory: 'Przeszłość', personality: 'Osobowość', goals: 'Cele', flaws: 'Wady', secret_desire: 'Tajne pragnienie' } },
  ja: { title: 'キャラクター鍛冶場', subtitle: 'D&Dジェネレーター', name: '名前', race: '種族', cls: 'クラス', vibe: '雰囲気', vibeOpt: '(任意)', vibePlaceholder: '"暗い元兵士"', randomAll: '🎲 ランダム', generate: '⚒ 生成', generating: '生成中…', fates: '運命が物語を紡いでいます…', copyAll: '📋 コピー', copied: '✓ 済み!', redo: '↺ 再生成', generateNew: '⚒ 新キャラ', error: '少なくとも一つ入力してください。', gender: '性別', male: '男性', female: '女性', other: 'その他', length: '長さ', short: '短め', normal: '普通', long: '詳細', freeLeft: '残りの無料生成回数: {n}', freeLimitText: '無料生成をすべて使用しました。続行するには自分の Anthropic API キーを追加してください。', apiKey: 'APIキー', keyPlaceholder: 'sk-ant-…', save: '保存', clearKey: 'キーを削除', usingOwnKey: '自分のAPIキーを使用中', invalidKey: 'APIキーが無効です。確認して再試行してください。', keyNote: 'キーはこのブラウザにのみ保存されます。', getKey: 'キーを取得', sections: { backstory: 'バックストーリー', personality: '性格', goals: '目標', flaws: '欠点', secret_desire: '秘密の欲望' } },
  zh: { title: '角色锻造炉', subtitle: 'D&D角色生成器', name: '姓名', race: '种族', cls: '职业', vibe: '氛围', vibeOpt: '(可选)', vibePlaceholder: '"阴郁的前士兵"', randomAll: '🎲 随机全部', generate: '⚒ 生成角色', generating: '锻造中…', fates: '命运正在编织你的故事…', copyAll: '📋 复制', copied: '✓ 已复制!', redo: '↺ 重做', generateNew: '⚒ 新角色', error: '请至少填写一个字段。', gender: '性别', male: '男', female: '女', other: '其他', length: '长度', short: '简短', normal: '普通', long: '详细', freeLeft: '剩余免费生成次数：{n}', freeLimitText: '免费生成次数已用完。请添加你自己的 Anthropic API 密钥以继续。', apiKey: 'API 密钥', keyPlaceholder: 'sk-ant-…', save: '保存', clearKey: '移除密钥', usingOwnKey: '正在使用你自己的 API 密钥', invalidKey: 'API 密钥无效，请检查后重试。', keyNote: '密钥仅保存在此浏览器中。', getKey: '获取密钥', sections: { backstory: '背景故事', personality: '个性', goals: '目标', flaws: '缺陷', secret_desire: '隐秘渴望' } },
};
