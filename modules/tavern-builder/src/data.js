// data.js — bilingual (ru/en) content tables for the Tavern Builder.
// Every entry carries both languages so the language toggle is instant —
// no rerolling needed. Ported VERBATIM from the design handoff
// (design_handoff_tavern_builder/design-reference/tavern-data.js); do not
// edit the texts. Kept byte-faithful via .prettierignore.
// adjective: ru = [masc, fem, neut] forms; noun: g = 0 masc / 1 fem / 2 neut
const adjs = [
  { ru: ['Пьяный', 'Пьяная', 'Пьяное'], en: 'Drunken' },
  { ru: ['Золочёный', 'Золочёная', 'Золочёное'], en: 'Gilded' },
  { ru: ['Хромой', 'Хромая', 'Хромое'], en: 'Limping' },
  { ru: ['Весёлый', 'Весёлая', 'Весёлое'], en: 'Merry' },
  { ru: ['Ржавый', 'Ржавая', 'Ржавое'], en: 'Rusty' },
  { ru: ['Шепчущий', 'Шепчущая', 'Шепчущее'], en: 'Whispering' },
  { ru: ['Медный', 'Медная', 'Медное'], en: 'Copper' },
  { ru: ['Последний', 'Последняя', 'Последнее'], en: 'Last' },
  { ru: ['Танцующий', 'Танцующая', 'Танцующее'], en: 'Dancing' },
  { ru: ['Слепой', 'Слепая', 'Слепое'], en: 'Blind' },
  { ru: ['Спящий', 'Спящая', 'Спящее'], en: 'Sleeping' },
  { ru: ['Кривой', 'Кривая', 'Кривое'], en: 'Crooked' },
];
const nouns = [
  { ru: 'Кабан', g: 0, en: 'Boar' },
  { ru: 'Грифон', g: 0, en: 'Griffin' },
  { ru: 'Котёл', g: 0, en: 'Cauldron' },
  { ru: 'Фонарь', g: 0, en: 'Lantern' },
  { ru: 'Якорь', g: 0, en: 'Anchor' },
  { ru: 'Олень', g: 0, en: 'Stag' },
  { ru: 'Гоблин', g: 0, en: 'Goblin' },
  { ru: 'Кружка', g: 1, en: 'Tankard' },
  { ru: 'Русалка', g: 1, en: 'Mermaid' },
  { ru: 'Свеча', g: 1, en: 'Candle' },
  { ru: 'Корона', g: 1, en: 'Crown' },
  { ru: 'Роза', g: 1, en: 'Rose' },
  { ru: 'Колесо', g: 2, en: 'Wheel' },
  { ru: 'Ведро', g: 2, en: 'Bucket' },
];

// sign finish — indexed by wealth tier 0..2
const signs = [
  [
    { ru: 'Вывеска облупилась так, что название угадывается с трудом.', en: 'The sign is so weathered the name is barely legible.' },
    { ru: 'Вместо вывески над дверью — доска с грубо намалёванным рисунком.', en: 'Instead of a sign, a plank with a crudely daubed picture hangs over the door.' },
  ],
  [
    { ru: 'Аккуратная вывеска недавно подкрашена.', en: 'The tidy sign has been freshly repainted.' },
    { ru: 'Кованая вывеска поскрипывает на ветру.', en: 'A wrought-iron sign creaks in the wind.' },
  ],
  [
    { ru: 'Вывеска покрыта позолотой и подсвечена парой фонарей.', en: 'The sign is gilded and lit by a pair of lanterns.' },
    { ru: 'Название выложено латунными буквами по полированному дубу.', en: 'The name is set in brass letters on polished oak.' },
  ],
];

// atmosphere fragments per tone
const atmos = {
  cozy: {
    light: [
      { ru: 'В очаге потрескивает огонь, и по стенам пляшут тёплые отсветы.', en: 'A fire crackles in the hearth, throwing warm light across the walls.' },
      { ru: 'Низкие балки увешаны пучками трав, свет мягкий и медовый.', en: 'Bundles of herbs hang from the low beams; the light is soft and honeyed.' },
    ],
    smell: [
      { ru: 'Пахнет свежим хлебом и яблочным сидром.', en: 'It smells of fresh bread and apple cider.' },
      { ru: 'Из кухни тянет жареным луком и тушёным мясом.', en: 'The smell of fried onions and stew drifts from the kitchen.' },
    ],
    detail: [
      { ru: 'У огня дремлет старый пёс, не открывая глаз даже на стук двери.', en: 'An old dog dozes by the fire, not even opening an eye at the door.' },
      { ru: 'Над стойкой висит коллекция кружек со всего королевства.', en: 'A collection of tankards from across the realm hangs above the bar.' },
      { ru: 'На каждом столе — свеча в подсвечнике из старой подковы.', en: 'Every table bears a candle in a holder bent from an old horseshoe.' },
    ],
  },
  seedy: {
    light: [
      { ru: 'Сальные свечи чадят, и углы зала тонут в темноте.', en: 'Tallow candles smoke, and the corners of the room drown in darkness.' },
      { ru: 'Единственный фонарь над стойкой давно никто не чистил.', en: 'No one has cleaned the single lantern above the bar in years.' },
    ],
    smell: [
      { ru: 'Пахнет прокисшим элем, дымом и мокрой псиной.', en: 'It smells of sour ale, smoke and wet dog.' },
      { ru: 'В воздухе висит сизая пелена дешёвого табака.', en: 'A grey haze of cheap pipe-smoke hangs in the air.' },
    ],
    detail: [
      { ru: 'На дверном косяке — свежие зарубки от ножа.', en: 'There are fresh knife-marks on the doorframe.' },
      { ru: 'Половицы липнут к подошвам.', en: 'The floorboards stick to your boots.' },
      { ru: 'Вышибала провожает взглядом каждого нового гостя.', en: 'The bouncer follows every newcomer with his eyes.' },
    ],
  },
  strange: {
    light: [
      { ru: 'Свечи горят зеленоватым пламенем и совсем не оплывают.', en: 'The candles burn with a greenish flame and never seem to melt.' },
      { ru: 'Тени движутся чуть медленнее тех, кто их отбрасывает.', en: 'The shadows move a touch slower than the people casting them.' },
    ],
    smell: [
      { ru: 'Пахнет грозой, хотя небо весь день было ясным.', en: 'It smells of thunderstorms, though the sky has been clear all day.' },
      { ru: 'Из погреба тянет ладаном и чем-то очень старым.', en: 'Incense and something very old drift up from the cellar.' },
    ],
    detail: [
      { ru: 'Часы над стойкой идут против хода.', en: 'The clock above the bar runs backwards.' },
      { ru: 'Одна из дверей ведёт не туда, куда должна.', en: 'One of the doors does not lead where it should.' },
      { ru: 'Кот хозяина смотрит так, будто понимает каждое слово.', en: 'The owner\u2019s cat watches as if it understands every word.' },
    ],
  },
  posh: {
    light: [
      { ru: 'Хрустальные люстры заливают зал ровным тёплым светом.', en: 'Crystal chandeliers flood the hall with steady, warm light.' },
      { ru: 'Свечи в серебряных канделябрах отражаются в начищенной меди.', en: 'Candles in silver candelabras glint off polished brass.' },
    ],
    smell: [
      { ru: 'Пахнет воском, пряным вином и дорогим деревом.', en: 'It smells of beeswax, mulled wine and expensive wood.' },
      { ru: 'Из кухни доносится аромат жаркого с пряностями из-за моря.', en: 'From the kitchen drifts a roast seasoned with overseas spices.' },
    ],
    detail: [
      { ru: 'Полы устланы коврами, заглушающими шаги.', en: 'Thick carpets muffle every footstep.' },
      { ru: 'Стену украшает голова виверны с памятной табличкой.', en: 'A wyvern\u2019s head with a brass plaque adorns the wall.' },
      { ru: 'Официанты двигаются бесшумно, как заговорщики.', en: 'The waiters move as silently as conspirators.' },
    ],
  },
};

// crowd line — indexed by settlement size 0..2
const crowd = [
  [
    { ru: 'Полдюжины местных знают друг друга с детства и замолкают при чужаках.', en: 'Half a dozen locals have known each other since childhood — and fall silent around strangers.' },
    { ru: 'За столами — пара фермеров и усталый возница.', en: 'A couple of farmers and a tired carter sit at the tables.' },
  ],
  [
    { ru: 'Зал заполнен наполовину: ремесленники, торговцы, пара наёмников.', en: 'The room is half full: artisans, traders, a pair of sellswords.' },
    { ru: 'Гул разговоров перекрывает стук кружек и кости на дальнем столе.', en: 'The hum of talk drowns out clinking tankards and dice at the far table.' },
  ],
  [
    { ru: 'Здесь толпятся гости со всех концов королевства, слышна чужеземная речь.', en: 'Guests from every corner of the realm crowd in; foreign tongues mix in the din.' },
    { ru: 'Между столами снуют посыльные и, вероятно, карманники.', en: 'Messengers — and probably pickpockets — weave between the tables.' },
  ],
];

// menu — [tier0, tier1, tier2]; price strings precomputed per language
const food = [
  [
    { ru: 'Похлёбка из репы', en: 'Turnip stew', pr: '3 мм', pe: '3 cp' },
    { ru: 'Каша с салом', en: 'Porridge with lard', pr: '4 мм', pe: '4 cp' },
    { ru: 'Луковый суп с чёрствым хлебом', en: 'Onion soup with stale bread', pr: '5 мм', pe: '5 cp' },
    { ru: 'Колбаса сомнительного происхождения', en: 'Sausage of uncertain origin', pr: '6 мм', pe: '6 cp' },
    { ru: 'Печёные каштаны', en: 'Roasted chestnuts', pr: '2 мм', pe: '2 cp' },
    { ru: 'Вчерашняя рыба', en: 'Yesterday\u2019s fish', pr: '4 мм', pe: '4 cp' },
  ],
  [
    { ru: 'Жаркое из кролика', en: 'Rabbit stew', pr: '4 см', pe: '4 sp' },
    { ru: 'Пирог с почками', en: 'Kidney pie', pr: '3 см', pe: '3 sp' },
    { ru: 'Курица в меду', en: 'Honey-glazed chicken', pr: '5 см', pe: '5 sp' },
    { ru: 'Рыба на углях', en: 'Charcoal-grilled fish', pr: '3 см', pe: '3 sp' },
    { ru: 'Баранья нога с травами', en: 'Leg of lamb with herbs', pr: '6 см', pe: '6 sp' },
    { ru: 'Грибная запеканка', en: 'Mushroom casserole', pr: '2 см', pe: '2 sp' },
  ],
  [
    { ru: 'Фазан в винном соусе', en: 'Pheasant in wine sauce', pr: '3 зм', pe: '3 gp' },
    { ru: 'Оленина с можжевельником', en: 'Venison with juniper', pr: '2 зм', pe: '2 gp' },
    { ru: 'Угорь в сливках', en: 'Eel in cream', pr: '2 зм', pe: '2 gp' },
    { ru: 'Кабан, томлённый в пряностях', en: 'Spiced slow-roast boar', pr: '4 зм', pe: '4 gp' },
    { ru: 'Пирог с дичью и трюфелями', en: 'Game pie with truffles', pr: '3 зм', pe: '3 gp' },
    { ru: 'Засахаренные фрукты из-за моря', en: 'Candied fruit from overseas', pr: '1 зм', pe: '1 gp' },
  ],
];
const drinks = [
  [
    { ru: 'Разбавленный эль', en: 'Watered-down ale', pr: '1 мм', pe: '1 cp' },
    { ru: 'Мутный сидр', en: 'Cloudy cider', pr: '2 мм', pe: '2 cp' },
    { ru: 'Самогон «не спрашивай»', en: '\u201cDon\u2019t ask\u201d moonshine', pr: '3 мм', pe: '3 cp' },
    { ru: 'Кипяток с мятой', en: 'Hot water with mint', pr: '1 мм', pe: '1 cp' },
  ],
  [
    { ru: 'Тёмный эль', en: 'Dark ale', pr: '8 мм', pe: '8 cp' },
    { ru: 'Пряный мёд', en: 'Spiced mead', pr: '1 см', pe: '1 sp' },
    { ru: 'Гномий стаут', en: 'Dwarven stout', pr: '2 см', pe: '2 sp' },
    { ru: 'Яблочный бренди', en: 'Apple brandy', pr: '2 см', pe: '2 sp' },
  ],
  [
    { ru: 'Эльфийское вино', en: 'Elven wine', pr: '1 зм', pe: '1 gp' },
    { ru: 'Выдержанный бренди', en: 'Aged brandy', pr: '2 зм', pe: '2 gp' },
    { ru: 'Игристое из долины', en: 'Valley sparkling wine', pr: '2 зм', pe: '2 gp' },
    { ru: 'Огненное виски с севера', en: 'Northern fire-whisky', pr: '1 зм', pe: '1 gp' },
  ],
];

const names = [
  { ru: 'Барлен', en: 'Barlen' }, { ru: 'Мирра', en: 'Mirra' }, { ru: 'Тоск', en: 'Tosk' },
  { ru: 'Ольда', en: 'Olda' }, { ru: 'Финн', en: 'Finn' }, { ru: 'Грета', en: 'Greta' },
  { ru: 'Дарвиш', en: 'Darvish' }, { ru: 'Юна', en: 'Yuna' }, { ru: 'Корвин', en: 'Corwin' },
  { ru: 'Беса', en: 'Bessa' }, { ru: 'Хальрик', en: 'Halrik' }, { ru: 'Тилли', en: 'Tilly' },
];
const races = [
  { ru: 'человек', en: 'human' }, { ru: 'дварф', en: 'dwarf' }, { ru: 'полурослик', en: 'halfling' },
  { ru: 'полуэльф', en: 'half-elf' }, { ru: 'полуорк', en: 'half-orc' }, { ru: 'гном', en: 'gnome' },
  { ru: 'тифлинг', en: 'tiefling' }, { ru: 'драконорождённый', en: 'dragonborn' },
];
const traits = [
  { ru: 'Бывший наёмник — шрамы видно даже под рубахой.', en: 'A former sellsword — the scars show even through the shirt.' },
  { ru: 'Помнит каждый долг до последней монеты.', en: 'Remembers every debt down to the last coin.' },
  { ru: 'Не задаёт вопросов и того же ждёт от гостей.', en: 'Asks no questions and expects the same of the guests.' },
  { ru: 'Знает всё, что происходит в округе.', en: 'Knows everything that happens in the district.' },
  { ru: 'Готовит сам и страшно этим гордится.', en: 'Cooks personally and is fiercely proud of it.' },
  { ru: 'Со всеми говорит как со старыми друзьями.', en: 'Talks to everyone like an old friend.' },
  { ru: 'Суеверен: на каждой балке висит оберег.', en: 'Superstitious: a charm hangs on every beam.' },
  { ru: 'Когда-то выступал в столичном театре.', en: 'Once performed in a capital theatre.' },
];
const quirks = [
  { ru: 'Протирает одну и ту же кружку весь вечер.', en: 'Polishes the same tankard all evening.' },
  { ru: 'Говорит о таверне «она», как о корабле.', en: 'Calls the tavern \u201cshe\u201d, like a ship.' },
  { ru: 'Держит ворона, который подслушивает гостей.', en: 'Keeps a raven that eavesdrops on the guests.' },
  { ru: 'Никогда не выходит из-за стойки.', en: 'Never steps out from behind the bar.' },
  { ru: 'Насвистывает один и тот же мотив.', en: 'Whistles the same tune over and over.' },
  { ru: 'Записывает что-то в потрёпанную книжицу.', en: 'Scribbles notes in a battered little book.' },
  { ru: 'Пробует каждое блюдо перед подачей.', en: 'Tastes every dish before it goes out.' },
  { ru: 'Зовёт всех гостей «капитан».', en: 'Calls every guest \u201ccaptain\u201d.' },
];
const secrets = [
  { ru: 'Должен крупную сумму гильдии воров.', en: 'Owes the thieves\u2019 guild a serious sum.' },
  { ru: 'Прячет беглеца в погребе.', en: 'Is hiding a fugitive in the cellar.' },
  { ru: 'Таверна стоит на замурованном входе в подземелье.', en: 'The tavern sits on a bricked-up dungeon entrance.' },
  { ru: 'Скупает краденое — но только у проверенных людей.', en: 'Fences stolen goods — but only for trusted faces.' },
  { ru: 'Это не настоящий хозяин: настоящий исчез год назад.', en: 'Not the real owner: the real one vanished a year ago.' },
  { ru: 'Платит страже, чтобы сюда не заглядывали.', en: 'Pays the watch to keep clear of the place.' },
  { ru: 'Хранит под половицей карту, за которой идёт охота.', en: 'Keeps a much-hunted map under a floorboard.' },
  { ru: 'Состоит в культе, о котором не говорят вслух.', en: 'Belongs to a cult no one names aloud.' },
];
const staff = [
  { role: { ru: 'Подавальщица', en: 'Serving girl' }, detail: { ru: 'слышит больше, чем показывает', en: 'hears more than she lets on' } },
  { role: { ru: 'Вышибала', en: 'Bouncer' }, detail: { ru: 'бывший гладиатор и добрейшая душа', en: 'an ex-gladiator and the gentlest soul' } },
  { role: { ru: 'Повар', en: 'Cook' }, detail: { ru: 'ругается на трёх языках, готовит на пяти', en: 'swears in three languages, cooks in five' } },
  { role: { ru: 'Конюх', en: 'Stablehand' }, detail: { ru: 'знает всех лошадей в округе по именам', en: 'knows every horse in the district by name' } },
  { role: { ru: 'Бард при заведении', en: 'House bard' }, detail: { ru: 'играет за еду и сплетни', en: 'plays for food and gossip' } },
  { role: { ru: 'Посудомой', en: 'Scullery lad' }, detail: { ru: 'мечтает стать приключенцем', en: 'dreams of becoming an adventurer' } },
  { role: { ru: 'Помощник за стойкой', en: 'Barback' }, detail: { ru: 'племянник хозяина, считает каждую монету', en: 'the owner\u2019s nephew, counts every coin' } },
];
const patrons = [
  { who: { ru: 'Наёмница в потёртой кольчуге', en: 'A sellsword in worn mail' }, doing: { ru: 'точит нож и поглядывает на дверь', en: 'whets a knife and keeps an eye on the door' } },
  { who: { ru: 'Седой картограф', en: 'A grizzled cartographer' }, doing: { ru: 'раскладывает карты, бормоча о белых пятнах', en: 'spreads out maps, muttering about blank spots' } },
  { who: { ru: 'Пара контрабандистов', en: 'A pair of smugglers' }, doing: { ru: 'спорят шёпотом над списком грузов', en: 'argue in whispers over a cargo list' } },
  { who: { ru: 'Жрец в дорожной рясе', en: 'A priest in travel robes' }, doing: { ru: 'благословляет каждого, кто подсаживается', en: 'blesses anyone who sits down beside him' } },
  { who: { ru: 'Студент академии', en: 'An academy student' }, doing: { ru: 'проигрывает в кости последние деньги', en: 'is gambling away his last coins at dice' } },
  { who: { ru: 'Охотница на чудовищ', en: 'A monster hunter' }, doing: { ru: 'молча пьёт; мешок у её ног только что шевельнулся', en: 'drinks in silence; the sack at her feet just moved' } },
  { who: { ru: 'Старик с попугаем', en: 'An old man with a parrot' }, doing: { ru: 'рассказывает о морях всем, кто готов слушать', en: 'tells sea stories to anyone who will listen' } },
  { who: { ru: 'Гонец в королевских цветах', en: 'A courier in royal colours' }, doing: { ru: 'ест, не снимая перчаток, и явно торопится', en: 'eats without removing his gloves, clearly in a hurry' } },
  { who: { ru: 'Трое шахтёров', en: 'Three miners' }, doing: { ru: 'празднуют что-то с мрачными лицами', en: 'celebrate something with grim faces' } },
  { who: { ru: 'Дама в дорогом плаще', en: 'A lady in an expensive cloak' }, doing: { ru: 'явно ждёт того, кто не приходит', en: 'is clearly waiting for someone who isn\u2019t coming' } },
  { who: { ru: 'Полурослик-торговец', en: 'A halfling trader' }, doing: { ru: 'предлагает всем «настоящие» амулеты', en: 'offers everyone \u201cgenuine\u201d amulets' } },
  { who: { ru: 'Молчаливый воин с севера', en: 'A silent northern warrior' }, doing: { ru: 'занял стол у стены, откуда виден весь зал', en: 'has taken the wall table with a view of the whole room' } },
];
const rumors = [
  { ru: 'На старой мельнице по ночам горит свет, хотя мельник умер зимой.', en: 'A light burns in the old mill at night, though the miller died last winter.', truth: 'true' },
  { ru: 'Караваны на южном тракте грабит не банда, а кто-то из стражи.', en: 'It isn\u2019t bandits robbing the south road caravans — it\u2019s someone in the watch.', truth: 'half' },
  { ru: 'В колодце на площади слышали голос, зовущий людей по именам.', en: 'A voice was heard in the square well, calling people by name.', truth: 'false' },
  { ru: 'Барон ищет тихих людей для тихой работы. Платит золотом.', en: 'The baron is hiring quiet folk for quiet work. Pays in gold.', truth: 'true' },
  { ru: 'Из храма пропала реликвия, и жрецы делают вид, что всё в порядке.', en: 'A relic vanished from the temple, and the priests pretend all is well.', truth: 'true' },
  { ru: 'Говорят, под старым рынком есть второй город.', en: 'They say there is a second city beneath the old market.', truth: 'half' },
  { ru: 'Знахарка с окраины скупает волчьи зубы. Десятками.', en: 'The hedge-witch on the edge of town is buying wolf teeth. By the dozen.', truth: 'true' },
  { ru: 'Принцесса сбежала из столицы и путешествует под чужим именем.', en: 'The princess fled the capital and travels under a false name.', truth: 'false' },
  { ru: 'В лесу нашли поляну, где не растёт трава и стрелка компаса крутится.', en: 'They found a clearing where no grass grows and compass needles spin.', truth: 'true' },
  { ru: 'Со следующей луны вводят новый налог на приключенцев.', en: 'A new tax on adventurers comes in at the next moon.', truth: 'false' },
  { ru: 'Хозяин «Золотого якоря» в порту платит за карты морского дна.', en: 'The owner of the Golden Anchor down at the port pays for seabed charts.', truth: 'half' },
  { ru: 'На севере снова видели драконьи огни.', en: 'Dragon-fires were seen in the north again.', truth: 'half' },
];

const tones = [
  { id: 'cozy', ru: 'Уютная', en: 'Cozy' },
  { id: 'seedy', ru: 'Злачная', en: 'Seedy' },
  { id: 'strange', ru: 'Странная', en: 'Uncanny' },
  { id: 'posh', ru: 'Чинная', en: 'Refined' },
];
const wealthLabels = [
  { ru: 'Трущобы', en: 'Slums' }, { ru: 'Среднее', en: 'Modest' }, { ru: 'Роскошь', en: 'Luxury' },
];
const sizeLabels = [
  { ru: 'Деревня', en: 'Village' }, { ru: 'Город', en: 'Town' }, { ru: 'Столица', en: 'Capital' },
];

export const TAVERN_DATA = {
  adjs, nouns, signs, atmos, crowd, food, drinks, names, races,
  traits, quirks, secrets, staff, patrons, rumors,
  tones, wealthLabels, sizeLabels,
};
