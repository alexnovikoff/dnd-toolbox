// names.js — races and their names. Hand-formatted (.prettierignore).
// [ru, en] pairs keep the long lists readable. First names are one word (the
// engine joins them with a family name); `w` is the roll weight, `age` the
// plausible adult range. Names are written for this tool, not taken from a book.
const p = (list) => list.map(([ru, en]) => ({ ru, en }));

const HUMAN_LAST = p([
  ['Кожевник', 'Tanner'], ['Мельник', 'Miller'], ['Эшфорд', 'Ashford'], ['Торн', 'Thorne'],
  ['Блэквуд', 'Blackwood'], ['Марлоу', 'Marlowe'], ['Вэнс', 'Vance'], ['Харроу', 'Harrow'],
  ['Уитлок', 'Whitlock'], ['Бриггс', 'Briggs'], ['Холлоу', 'Hollow'], ['Пэйн', 'Payne'],
]);

export const RACES = [
  {
    id: 'human', ru: 'человек', en: 'human', w: 6, age: [16, 78],
    names: {
      m: p([['Брам', 'Bram'], ['Тобин', 'Tobin'], ['Олдрик', 'Aldric'], ['Эдрик', 'Edric'], ['Хью', 'Hugh'], ['Кормак', 'Cormac'],
            ['Лукас', 'Lucas'], ['Родерик', 'Roderick'], ['Симон', 'Simon'], ['Вилем', 'Vilem'], ['Джаспер', 'Jasper'], ['Осберт', 'Osbert']]),
      f: p([['Марта', 'Martha'], ['Эльза', 'Elsa'], ['Агата', 'Agatha'], ['Роза', 'Rosa'], ['Ивонна', 'Yvonne'], ['Тереза', 'Theresa'],
            ['Беата', 'Beata'], ['Гвен', 'Gwen'], ['Йоланда', 'Yolanda'], ['Клара', 'Clara'], ['Нора', 'Nora'], ['Сабина', 'Sabine']]),
    },
    last: HUMAN_LAST,
  },
  {
    id: 'dwarf', ru: 'дварф', en: 'dwarf', w: 2, age: [40, 340],
    names: {
      m: p([['Гримбальд', 'Grimbald'], ['Хорнар', 'Hornar'], ['Дурмир', 'Durmir'], ['Кольдар', 'Koldar'], ['Брундир', 'Brundir'],
            ['Торвек', 'Torvek'], ['Ульмар', 'Ulmar'], ['Балдрум', 'Baldrum'], ['Мордан', 'Mordan'], ['Стенрик', 'Stenrik']]),
      f: p([['Сигрун', 'Sigrun'], ['Дагмар', 'Dagmar'], ['Хельга', 'Helga'], ['Рагна', 'Ragna'], ['Тордис', 'Thordis'],
            ['Гудрун', 'Gudrun'], ['Астрид', 'Astrid'], ['Бергит', 'Bergit'], ['Эйдис', 'Eydis'], ['Ульфхильд', 'Ulfhild']]),
    },
    last: p([['Каменный Щит', 'Stoneshield'], ['Глубокий Горн', 'Deepforge'], ['Рудознатец', 'Orefinder'], ['Чёрная Наковальня', 'Blackanvil'],
             ['Крепкая Борода', 'Stoutbeard'], ['Угольная Рука', 'Coalhand'], ['Железная Клятва', 'Ironoath'], ['Седой Забой', 'Greyshaft']]),
  },
  {
    id: 'elf', ru: 'эльф', en: 'elf', w: 2, age: [110, 680],
    names: {
      m: p([['Лаэрис', 'Laeris'], ['Сирандил', 'Sirandil'], ['Фаэлан', 'Faelan'], ['Ниэрин', 'Nierin'], ['Элмарин', 'Elmarin'],
            ['Орисель', 'Orisel'], ['Тавриэль', 'Tavriel'], ['Каэлис', 'Kaelis'], ['Исандор', 'Isandor'], ['Вирэн', 'Viren']]),
      f: p([['Иллиэн', 'Illien'], ['Мирэль', 'Mirel'], ['Ланэя', 'Lanaya'], ['Аэнна', 'Aenna'], ['Тиэль', 'Tiel'],
            ['Нимрэ', 'Nimre'], ['Сириэль', 'Siriel'], ['Эльвейн', 'Elwain'], ['Кайлин', 'Kailyn'], ['Вэлия', 'Velia']]),
    },
    last: p([['Лунный Лист', 'Moonleaf'], ['Тихая Река', 'Stillriver'], ['Серебряный Ясень', 'Silverash'], ['Звёздный Шёпот', 'Starwhisper'],
             ['Утренняя Роса', 'Morningdew'], ['Ветвь Ивы', 'Willowbough'], ['Зимний Свет', 'Winterlight'], ['Дальняя Песнь', 'Farsong']]),
  },
  {
    id: 'halfling', ru: 'полурослик', en: 'halfling', w: 2, age: [20, 140],
    names: {
      m: p([['Тоддо', 'Toddo'], ['Бармо', 'Barmo'], ['Хэмли', 'Hamlie'], ['Дилль', 'Dill'], ['Моррен', 'Morren'],
            ['Ларби', 'Larby'], ['Фоббин', 'Fobbin'], ['Уиллок', 'Willock'], ['Пиппер', 'Pipper'], ['Нед', 'Ned']]),
      f: p([['Мэйбл', 'Mabel'], ['Тилли', 'Tilly'], ['Пенни', 'Penny'], ['Дорри', 'Dorrie'], ['Хэйзел', 'Hazel'],
            ['Молли', 'Molly'], ['Розмари', 'Rosemary'], ['Лотти', 'Lottie'], ['Бесси', 'Bessie'], ['Фиалка', 'Violet']]),
    },
    last: p([['Тёплый Очаг', 'Warmhearth'], ['Медовый Пирог', 'Honeycake'], ['Яблочный Холм', 'Applehill'], ['Полный Котёл', 'Fullpot'],
             ['Мягкая Трава', 'Softgrass'], ['Рыжая Кисть', 'Redbrush'], ['Долгий Ужин', 'Longsupper'], ['Вишнёвый Ручей', 'Cherrybrook']]),
  },
  {
    id: 'gnome', ru: 'гном', en: 'gnome', w: 1, age: [40, 420],
    names: {
      m: p([['Тинкло', 'Tinklo'], ['Физзик', 'Fizzik'], ['Брамбо', 'Brambo'], ['Виззен', 'Wizzen'], ['Ниббс', 'Nibbs'],
            ['Квиллин', 'Quillin'], ['Доббл', 'Dobble'], ['Пимбл', 'Pimble'], ['Зоккет', 'Zocket'], ['Трэмбо', 'Trambo']]),
      f: p([['Тикси', 'Tixie'], ['Мимбла', 'Mimbla'], ['Пиппа', 'Pippa'], ['Дизза', 'Dizza'], ['Квилла', 'Quilla'],
            ['Нибби', 'Nibby'], ['Зинни', 'Zinny'], ['Брикса', 'Brixa'], ['Фенни', 'Fennie'], ['Лимбра', 'Limbra']]),
    },
    last: p([['Шестерёнка', 'Cogspin'], ['Медная Пружина', 'Coppersprocket'], ['Пятый Винт', 'Fifthscrew'], ['Звонкий Болт', 'Boltwhistle'],
             ['Шлифовальщик', 'Glassgrinder'], ['Кривой Рычаг', 'Bentlever'], ['Тройной Узел', 'Tripleknot'], ['Искра', 'Sparkwick']]),
  },
  {
    id: 'half-elf', ru: 'полуэльф', en: 'half-elf', w: 1, age: [20, 170],
    names: {
      m: p([['Дариэн', 'Darien'], ['Элиас', 'Elias'], ['Ронан', 'Ronan'], ['Каэл', 'Kael'], ['Лисандр', 'Lysander'],
            ['Тэйн', 'Thane'], ['Севрин', 'Sevrin'], ['Арлен', 'Arlen']]),
      f: p([['Лиара', 'Liara'], ['Сэра', 'Sera'], ['Илэна', 'Ilena'], ['Марисса', 'Marissa'], ['Ариэна', 'Ariena'],
            ['Тэсса', 'Tessa'], ['Камилла', 'Camilla'], ['Элоиза', 'Eloise']]),
    },
    last: HUMAN_LAST,
  },
  {
    id: 'half-orc', ru: 'полуорк', en: 'half-orc', w: 1, age: [14, 68],
    names: {
      m: p([['Гарок', 'Garok'], ['Брог', 'Brog'], ['Дурган', 'Durgan'], ['Ургат', 'Urgat'], ['Морк', 'Mork'],
            ['Краг', 'Krag'], ['Тургх', 'Turgh'], ['Шагар', 'Shagar'], ['Варог', 'Varog'], ['Хорг', 'Horg']]),
      f: p([['Шара', 'Shara'], ['Гурза', 'Gurza'], ['Морга', 'Morga'], ['Ургала', 'Urgala'], ['Дарга', 'Darga'],
            ['Ярга', 'Yarga'], ['Зула', 'Zula'], ['Тага', 'Taga'], ['Брунха', 'Brunha'], ['Хашка', 'Hashka']]),
    },
    last: p([['Сломанный Клык', 'Brokentusk'], ['Тихий Кулак', 'Quietfist'], ['Три Шрама', 'Threescars'], ['Чёрное Ухо', 'Blackear'],
             ['Кузнечный Пёс', 'Forgehound'], ['Друг Ворон', 'Crowfriend'], ['Долгий Шаг', 'Longstride'], ['Железный Зуб', 'Irontooth']]),
  },
  {
    id: 'tiefling', ru: 'тифлинг', en: 'tiefling', w: 1, age: [16, 88],
    // Tieflings here go by one name: an old infernal name or a chosen word.
    names: {
      m: p([['Малакор', 'Malakor'], ['Верезий', 'Verezius'], ['Каспиан', 'Kaspian'], ['Дамиус', 'Damius'], ['Оррус', 'Orrus'],
            ['Покаяние', 'Penance'], ['Молчание', 'Silence'], ['Завтра', 'Tomorrow'], ['Упрёк', 'Reproach']]),
      f: p([['Маликсара', 'Maliksara'], ['Вересса', 'Veressa'], ['Зефира', 'Zephira'], ['Дамия', 'Damia'], ['Орисса', 'Orissa'],
            ['Утешение', 'Solace'], ['Терпение', 'Patience'], ['Честность', 'Honesty'], ['Тщета', 'Futility']]),
    },
    last: [],
  },
  {
    id: 'dragonborn', ru: 'драконорождённый', en: 'dragonborn', w: 1, age: [15, 72], scaly: true,
    names: {
      m: p([['Кзарин', 'Kzarin'], ['Рхазор', 'Rhazor'], ['Тормаш', 'Tormash'], ['Зехир', 'Zehir'], ['Дравак', 'Dravak'],
            ['Вошар', 'Voshar'], ['Хазим', 'Hazim'], ['Ашкар', 'Ashkar']]),
      f: p([['Сизара', 'Sizara'], ['Кэвира', 'Kavira'], ['Зэлла', 'Zella'], ['Тхарис', 'Tharis'], ['Аршия', 'Arshia'],
            ['Мизра', 'Mizra'], ['Шайра', 'Shaira'], ['Рэза', 'Reza']]),
    },
    last: p([['из клана Вирак', 'of clan Virak'], ['из клана Тхазид', 'of clan Thazid'], ['из клана Ошмар', 'of clan Oshmar'],
             ['из клана Дренн', 'of clan Drenn'], ['из клана Кассур', 'of clan Kassur'], ['из клана Ирхет', 'of clan Irhet']]),
  },
];
