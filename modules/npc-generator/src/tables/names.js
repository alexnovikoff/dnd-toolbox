// names.js — races and their names. Hand-formatted (.prettierignore).
// [ru, en] pairs keep the long lists readable. First names are one word (the
// engine joins them with a family name); `w` is the roll weight, `age` the
// plausible adult range. Names are written for this tool, not taken from a book.
const p = (list) => list.map(([ru, en]) => ({ ru, en }));

const HUMAN_LAST = p([
  ['Кожевник', 'Tanner'], ['Мельник', 'Miller'], ['Эшфорд', 'Ashford'], ['Торн', 'Thorne'],
  ['Блэквуд', 'Blackwood'], ['Марлоу', 'Marlowe'], ['Вэнс', 'Vance'], ['Харроу', 'Harrow'],
  ['Уитлок', 'Whitlock'], ['Бриггс', 'Briggs'], ['Холлоу', 'Hollow'], ['Пэйн', 'Payne'],
  ['Ковач', 'Kovach'], ['Новак', 'Novak'], ['Бергман', 'Bergman'], ['Росси', 'Rossi'],
  ['Мак-Кинли', 'McKinley'], ['Фонтейн', 'Fontaine'], ['Дюран', 'Durand'], ['Вольф', 'Wolff'],
  ['Хольм', 'Holm'], ['Грейвз', 'Graves'], ['Фарроу', 'Farrow'], ['Стерн', 'Stern'],
]);

export const RACES = [
  {
    id: 'human', ru: 'человек', en: 'human', w: 6, age: [16, 78],
    names: {
      m: p([['Брам', 'Bram'], ['Тобин', 'Tobin'], ['Олдрик', 'Aldric'], ['Эдрик', 'Edric'], ['Хью', 'Hugh'], ['Кормак', 'Cormac'],
            ['Лукас', 'Lucas'], ['Родерик', 'Roderick'], ['Симон', 'Simon'], ['Вилем', 'Vilem'], ['Джаспер', 'Jasper'], ['Осберт', 'Osbert'],
            ['Амир', 'Amir'], ['Кассим', 'Kassim'], ['Тэмур', 'Temur'], ['Юсуф', 'Yusuf'], ['Иштван', 'Istvan'], ['Мирослав', 'Miroslav'],
            ['Бьорн', 'Bjorn'], ['Фергус', 'Fergus'], ['Матео', 'Mateo'], ['Лоренцо', 'Lorenzo'], ['Гуго', 'Hugo'], ['Ансельм', 'Anselm']]),
      f: p([['Марта', 'Martha'], ['Эльза', 'Elsa'], ['Агата', 'Agatha'], ['Роза', 'Rosa'], ['Ивонна', 'Yvonne'], ['Тереза', 'Theresa'],
            ['Беата', 'Beata'], ['Гвен', 'Gwen'], ['Йоланда', 'Yolanda'], ['Клара', 'Clara'], ['Нора', 'Nora'], ['Сабина', 'Sabine'],
            ['Зарина', 'Zarina'], ['Лейла', 'Leila'], ['Аиша', 'Aisha'], ['Милена', 'Milena'], ['Ядвига', 'Jadwiga'], ['Сольвейг', 'Solveig'],
            ['Бриджит', 'Brigid'], ['Изабелла', 'Isabella'], ['Лючия', 'Lucia'], ['Гертруда', 'Gertrude'], ['Оливия', 'Olivia'], ['Матильда', 'Matilda']]),
    },
    last: HUMAN_LAST,
  },
  {
    id: 'dwarf', ru: 'дварф', en: 'dwarf', w: 2, age: [40, 340],
    names: {
      m: p([['Гримбальд', 'Grimbald'], ['Хорнар', 'Hornar'], ['Дурмир', 'Durmir'], ['Кольдар', 'Koldar'], ['Брундир', 'Brundir'],
            ['Торвек', 'Torvek'], ['Ульмар', 'Ulmar'], ['Балдрум', 'Baldrum'], ['Мордан', 'Mordan'], ['Стенрик', 'Stenrik'],
            ['Тормунд', 'Thormund'], ['Гротар', 'Grothar'], ['Рагнор', 'Ragnor'], ['Хальвард', 'Halvard'], ['Скарбир', 'Skarbir']]),
      f: p([['Сигрун', 'Sigrun'], ['Дагмар', 'Dagmar'], ['Хельга', 'Helga'], ['Рагна', 'Ragna'], ['Тордис', 'Thordis'],
            ['Гудрун', 'Gudrun'], ['Астрид', 'Astrid'], ['Бергит', 'Bergit'], ['Эйдис', 'Eydis'], ['Ульфхильд', 'Ulfhild'],
            ['Ингвильд', 'Ingvild'], ['Сольрун', 'Solrun'], ['Хервёр', 'Hervor'], ['Гунвор', 'Gunvor'], ['Рагнхильд', 'Ragnhild']]),
    },
    last: p([['Каменный Щит', 'Stoneshield'], ['Глубокий Горн', 'Deepforge'], ['Рудознатец', 'Orefinder'], ['Чёрная Наковальня', 'Blackanvil'],
             ['Крепкая Борода', 'Stoutbeard'], ['Угольная Рука', 'Coalhand'], ['Железная Клятва', 'Ironoath'], ['Седой Забой', 'Greyshaft'],
             ['Тяжёлый Молот', 'Heavyhammer'], ['Рунный Резец', 'Runechisel'], ['Каменное Слово', 'Stoneword'], ['Мрачная Жила', 'Darkvein']]),
  },
  {
    id: 'elf', ru: 'эльф', en: 'elf', w: 2, age: [110, 680],
    names: {
      m: p([['Лаэрис', 'Laeris'], ['Сирандил', 'Sirandil'], ['Фаэлан', 'Faelan'], ['Ниэрин', 'Nierin'], ['Элмарин', 'Elmarin'],
            ['Орисель', 'Orisel'], ['Тавриэль', 'Tavriel'], ['Каэлис', 'Kaelis'], ['Исандор', 'Isandor'], ['Вирэн', 'Viren'],
            ['Аэрион', 'Aerion'], ['Лоринэль', 'Lorinel'], ['Сильвен', 'Sylven'], ['Тэлион', 'Thelion']]),
      f: p([['Иллиэн', 'Illien'], ['Мирэль', 'Mirel'], ['Ланэя', 'Lanaya'], ['Аэнна', 'Aenna'], ['Тиэль', 'Tiel'],
            ['Нимрэ', 'Nimre'], ['Сириэль', 'Siriel'], ['Эльвейн', 'Elwain'], ['Кайлин', 'Kailyn'], ['Вэлия', 'Velia'],
            ['Лаэтиэль', 'Laetiel'], ['Ориэль', 'Oriel'], ['Сэлиан', 'Selian'], ['Ниэла', 'Niela']]),
    },
    last: p([['Лунный Лист', 'Moonleaf'], ['Тихая Река', 'Stillriver'], ['Серебряный Ясень', 'Silverash'], ['Звёздный Шёпот', 'Starwhisper'],
             ['Утренняя Роса', 'Morningdew'], ['Ветвь Ивы', 'Willowbough'], ['Зимний Свет', 'Winterlight'], ['Дальняя Песнь', 'Farsong'],
             ['Ночной Шелест', 'Nightrustle'], ['Белая Цапля', 'Whiteheron'], ['Тихий Лук', 'Quietbow'], ['Осенний Ветер', 'Autumnwind']]),
  },
  {
    id: 'halfling', ru: 'полурослик', en: 'halfling', w: 2, age: [20, 140],
    names: {
      m: p([['Тоддо', 'Toddo'], ['Бармо', 'Barmo'], ['Хэмли', 'Hamlie'], ['Дилль', 'Dill'], ['Моррен', 'Morren'],
            ['Ларби', 'Larby'], ['Фоббин', 'Fobbin'], ['Уиллок', 'Willock'], ['Пиппер', 'Pipper'], ['Нед', 'Ned'],
            ['Гиббин', 'Gibbin'], ['Оливер', 'Oliver'], ['Сэмли', 'Samley'], ['Тоби', 'Toby']]),
      f: p([['Мэйбл', 'Mabel'], ['Тилли', 'Tilly'], ['Пенни', 'Penny'], ['Дорри', 'Dorrie'], ['Хэйзел', 'Hazel'],
            ['Молли', 'Molly'], ['Розмари', 'Rosemary'], ['Лотти', 'Lottie'], ['Бесси', 'Bessie'], ['Фиалка', 'Violet'],
            ['Петуния', 'Petunia'], ['Марджори', 'Marjorie'], ['Китти', 'Kitty'], ['Эмма', 'Emma']]),
    },
    last: p([['Тёплый Очаг', 'Warmhearth'], ['Медовый Пирог', 'Honeycake'], ['Яблочный Холм', 'Applehill'], ['Полный Котёл', 'Fullpot'],
             ['Мягкая Трава', 'Softgrass'], ['Рыжая Кисть', 'Redbrush'], ['Долгий Ужин', 'Longsupper'], ['Вишнёвый Ручей', 'Cherrybrook'],
             ['Сытое Брюхо', 'Fullbelly'], ['Толстый Гриб', 'Fatmushroom'], ['Тихий Порог', 'Quietstep'], ['Кривая Изгородь', 'Crookhedge']]),
  },
  {
    id: 'gnome', ru: 'гном', en: 'gnome', w: 1, age: [40, 420],
    names: {
      m: p([['Тинкло', 'Tinklo'], ['Физзик', 'Fizzik'], ['Брамбо', 'Brambo'], ['Виззен', 'Wizzen'], ['Ниббс', 'Nibbs'],
            ['Квиллин', 'Quillin'], ['Доббл', 'Dobble'], ['Пимбл', 'Pimble'], ['Зоккет', 'Zocket'], ['Трэмбо', 'Trambo'],
            ['Бимбл', 'Bimble'], ['Рикко', 'Ricco'], ['Тиббет', 'Tibbet'], ['Феззо', 'Fezzo']]),
      f: p([['Тикси', 'Tixie'], ['Мимбла', 'Mimbla'], ['Пиппа', 'Pippa'], ['Дизза', 'Dizza'], ['Квилла', 'Quilla'],
            ['Нибби', 'Nibby'], ['Зинни', 'Zinny'], ['Брикса', 'Brixa'], ['Фенни', 'Fennie'], ['Лимбра', 'Limbra'],
            ['Триппи', 'Trippy'], ['Вимми', 'Wimmy'], ['Оззи', 'Ozzie'], ['Бельза', 'Belza']]),
    },
    last: p([['Шестерёнка', 'Cogspin'], ['Медная Пружина', 'Coppersprocket'], ['Пятый Винт', 'Fifthscrew'], ['Звонкий Болт', 'Boltwhistle'],
             ['Шлифовальщик', 'Glassgrinder'], ['Кривой Рычаг', 'Bentlever'], ['Тройной Узел', 'Tripleknot'], ['Искра', 'Sparkwick'],
             ['Обратная Резьба', 'Backthread'], ['Три Линзы', 'Threelens'], ['Сломанный Маятник', 'Brokenpendulum'], ['Дымящая Трубка', 'Smokepipe']]),
  },
  {
    id: 'half-elf', ru: 'полуэльф', en: 'half-elf', w: 1, age: [20, 170],
    names: {
      m: p([['Дариэн', 'Darien'], ['Элиас', 'Elias'], ['Ронан', 'Ronan'], ['Каэл', 'Kael'], ['Лисандр', 'Lysander'],
            ['Тэйн', 'Thane'], ['Севрин', 'Sevrin'], ['Арлен', 'Arlen'], ['Адриан', 'Adrian'], ['Бастиан', 'Bastian'],
            ['Корвин', 'Corvin'], ['Мэррик', 'Merrick']]),
      f: p([['Лиара', 'Liara'], ['Сэра', 'Sera'], ['Илэна', 'Ilena'], ['Марисса', 'Marissa'], ['Ариэна', 'Ariena'],
            ['Тэсса', 'Tessa'], ['Камилла', 'Camilla'], ['Элоиза', 'Eloise'], ['Вивиан', 'Vivian'], ['Лианна', 'Lianna'],
            ['Розалин', 'Rosalind'], ['Эвелин', 'Evelyn']]),
    },
    last: HUMAN_LAST,
  },
  {
    id: 'half-orc', ru: 'полуорк', en: 'half-orc', w: 1, age: [14, 68],
    names: {
      m: p([['Гарок', 'Garok'], ['Брог', 'Brog'], ['Дурган', 'Durgan'], ['Ургат', 'Urgat'], ['Морк', 'Mork'],
            ['Краг', 'Krag'], ['Тургх', 'Turgh'], ['Шагар', 'Shagar'], ['Варог', 'Varog'], ['Хорг', 'Horg'],
            ['Грот', 'Grot'], ['Бург', 'Burg']]),
      f: p([['Шара', 'Shara'], ['Гурза', 'Gurza'], ['Морга', 'Morga'], ['Ургала', 'Urgala'], ['Дарга', 'Darga'],
            ['Ярга', 'Yarga'], ['Зула', 'Zula'], ['Тага', 'Taga'], ['Брунха', 'Brunha'], ['Хашка', 'Hashka'],
            ['Шагра', 'Shagra'], ['Вурга', 'Vurga']]),
    },
    last: p([['Сломанный Клык', 'Brokentusk'], ['Тихий Кулак', 'Quietfist'], ['Три Шрама', 'Threescars'], ['Чёрное Ухо', 'Blackear'],
             ['Кузнечный Пёс', 'Forgehound'], ['Друг Ворон', 'Crowfriend'], ['Долгий Шаг', 'Longstride'], ['Железный Зуб', 'Irontooth'],
             ['Мокрый Камень', 'Wetstone'], ['Кривое Копьё', 'Crookspear']]),
  },
  {
    id: 'orc', ru: 'орк', en: 'orc', w: 1, age: [12, 55],
    names: {
      m: p([['Дракх', 'Drakh'], ['Моргаш', 'Morgash'], ['Тарг', 'Targ'], ['Ургок', 'Urgok'], ['Зарг', 'Zarg'], ['Хрум', 'Hrum'],
            ['Брак', 'Brakh'], ['Оргун', 'Orgun'], ['Шакк', 'Shakk'], ['Нург', 'Nurg'], ['Вашт', 'Vasht'], ['Гролл', 'Groll']]),
      f: p([['Гарша', 'Garsha'], ['Морка', 'Morka'], ['Драга', 'Draga'], ['Шарга', 'Sharga'], ['Вулка', 'Vulka'], ['Тарга', 'Targa'],
            ['Зорга', 'Zorga'], ['Ашка', 'Ashka'], ['Ургая', 'Urgaya'], ['Нарха', 'Narkha'], ['Бугра', 'Bugra'], ['Ксара', 'Ksara']]),
    },
    last: p([['из рода Серого Волка', 'of the Grey Wolf clan'], ['из рода Красной Реки', 'of the Red River clan'], ['из рода Трёх Копий', 'of the Three Spears clan'],
             ['из рода Сухой Степи', 'of the Dry Steppe clan'], ['из рода Вороньего Холма', 'of the Crow Hill clan'], ['из рода Гнилого Дуба', 'of the Rotten Oak clan'],
             ['из рода Тяжёлой Руки', 'of the Heavy Hand clan'], ['из рода Поздней Луны', 'of the Late Moon clan']]),
  },
  {
    id: 'goliath', ru: 'голиаф', en: 'goliath', w: 1, age: [16, 90],
    names: {
      m: p([['Тхарук', 'Tharuk'], ['Кайлан', 'Kaylan'], ['Вородан', 'Vorodan'], ['Оллук', 'Olluk'], ['Рейго', 'Reigo'], ['Майрок', 'Mairok'],
            ['Найтар', 'Naitar'], ['Сутан', 'Sutan'], ['Хелуун', 'Heluun'], ['Дакор', 'Dakor'], ['Темрук', 'Temruk'], ['Аргал', 'Argal']]),
      f: p([['Ненна', 'Nenna'], ['Оруна', 'Oruna'], ['Тайю', 'Taiyu'], ['Кеола', 'Keola'], ['Вайра', 'Vaira'], ['Эруна', 'Eruna'],
            ['Соэл', 'Soel'], ['Хайна', 'Haina'], ['Майра', 'Maira'], ['Илуа', 'Ilua'], ['Рохани', 'Rohani'], ['Аталу', 'Atalu']]),
    },
    last: p([['Крепкий Узел', 'Stoutknot'], ['Снежная Тропа', 'Snowpath'], ['Седой Перевал', 'Greypass'], ['Камень-в-Реке', 'Stone-in-River'],
             ['Тихий Обвал', 'Quietslide'], ['Долгий Подъём', 'Longclimb'], ['Северный Гребень', 'Northridge'], ['Третий Рог', 'Thirdhorn']]),
  },
  {
    id: 'tiefling', ru: 'тифлинг', en: 'tiefling', w: 1, age: [16, 88],
    // Tieflings here go by one name: an old infernal name or a chosen word.
    names: {
      m: p([['Малакор', 'Malakor'], ['Верезий', 'Verezius'], ['Каспиан', 'Kaspian'], ['Дамиус', 'Damius'], ['Оррус', 'Orrus'],
            ['Азарий', 'Azarius'], ['Сорин', 'Sorin'], ['Покаяние', 'Penance'], ['Молчание', 'Silence'], ['Завтра', 'Tomorrow'],
            ['Упрёк', 'Reproach'], ['Искупление', 'Atonement'], ['Забвение', 'Oblivion']]),
      f: p([['Маликсара', 'Maliksara'], ['Вересса', 'Veressa'], ['Зефира', 'Zephira'], ['Дамия', 'Damia'], ['Орисса', 'Orissa'],
            ['Азария', 'Azaria'], ['Сорая', 'Soraya'], ['Утешение', 'Solace'], ['Терпение', 'Patience'], ['Честность', 'Honesty'],
            ['Тщета', 'Futility'], ['Милость', 'Mercy'], ['Кротость', 'Meekness']]),
    },
    last: [],
  },
  {
    id: 'dragonborn', ru: 'драконорождённый', en: 'dragonborn', w: 1, age: [15, 72], scaly: true,
    names: {
      m: p([['Кзарин', 'Kzarin'], ['Рхазор', 'Rhazor'], ['Тормаш', 'Tormash'], ['Зехир', 'Zehir'], ['Дравак', 'Dravak'],
            ['Вошар', 'Voshar'], ['Хазим', 'Hazim'], ['Ашкар', 'Ashkar'], ['Кассар', 'Kassar'], ['Мерхан', 'Merhan'],
            ['Тезмар', 'Tezmar'], ['Ужак', 'Uzhak']]),
      f: p([['Сизара', 'Sizara'], ['Кэвира', 'Kavira'], ['Зэлла', 'Zella'], ['Тхарис', 'Tharis'], ['Аршия', 'Arshia'],
            ['Мизра', 'Mizra'], ['Шайра', 'Shaira'], ['Рэза', 'Reza'], ['Иссара', 'Issara'], ['Тезира', 'Tezira'],
            ['Кессия', 'Kessia'], ['Вахира', 'Vahira']]),
    },
    last: p([['из клана Вирак', 'of clan Virak'], ['из клана Тхазид', 'of clan Thazid'], ['из клана Ошмар', 'of clan Oshmar'],
             ['из клана Дренн', 'of clan Drenn'], ['из клана Кассур', 'of clan Kassur'], ['из клана Ирхет', 'of clan Irhet'],
             ['из клана Шаррот', 'of clan Sharrot'], ['из клана Улгар', 'of clan Ulgar']]),
  },
];
