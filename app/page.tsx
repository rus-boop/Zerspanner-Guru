"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Check,
  ChevronDown,
  Gauge,
  Globe2,
  HelpCircle,
  Info,
  QrCode,
  RotateCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Mode = "mill" | "drill" | "turn";
type Lang = "de" | "en" | "ru";
type Tool = {
  id: string;
  label: string;
  category: string;
  mode: Mode;
  teeth: number;
  feed: number;
  speeds: Record<string, number>;
  angle?: string;
  use?: string;
  spread?: number;
  feedScale?: "mill" | "hole" | "fixed";
};

const materials = [
  { id: "steel", label: "Baustahl / Automatenstahl" },
  { id: "stainless", label: "Edelstahl" },
  { id: "cast", label: "Grauguss" },
  { id: "aluminium", label: "Aluminium" },
  { id: "brass", label: "Messing" },
  { id: "copper", label: "Kupfer" },
  { id: "titanium", label: "Titan / Titanlegierung" },
  { id: "plastic", label: "Kunststoff" },
];

const words = {
  de: {
    subtitle: "Schnittdaten für die Werkstatt",
    live: "Live berechnet",
    setup: "Bearbeitung festlegen",
    setupCopy: "Werkzeug und Werkstoff bestimmen die Startwerte.",
    tool: "Werkzeug suchen",
    material: "Werkstoff",
    diameterTool: "Werkzeugdurchmesser",
    diameterPart: "Werkstückdurchmesser",
    teeth: "Schneidenzahl z",
    auto: "Werte automatisch aktualisieren",
    autoCopy: "Empfehlungen passend zu Werkzeug und Werkstoff",
    limit: "Drehzahllimit verwenden",
    limitCopy: "Ideal für ältere Maschinen",
    maxRpm: "Maximale Maschinendrehzahl",
    advanced: "Erweiterte Optionen",
    grade: "Genaue Werkstoffsorte",
    standard: "Standard / nicht angegeben",
    cutting: "Schnittwerte",
    cuttingCopy: "Automatisch vorgeschlagen und jederzeit anpassbar.",
    speed: "Schnittgeschwindigkeit vc",
    feedTooth: "Vorschub je Zahn fz",
    feedRev: "Vorschub je Umdrehung f",
    reset: "Auf Standardwerte zurücksetzen",
    result: "Ergebnis",
    rpm: "Drehzahl n",
    feed: "Vorschub vf",
    range: "Empfohlener Bereich",
    gentle: "Schonend",
    start: "Startwert",
    productive: "Produktiv",
    toolSummary: "Werkzeug",
    materialSummary: "Werkstoff",
    perRev: "Vorschub/U",
    important: "Wichtig:",
    warning:
      "Das sind Startwerte. Werkzeughersteller, Maschine, Aufspannung, Kühlung und Bauteilstabilität haben Vorrang.",
    language: "Sprache wählen",
  },
  en: {
    subtitle: "Cutting data for the workshop",
    live: "Calculated live",
    setup: "Define machining",
    setupCopy: "Tool and material determine the starting values.",
    tool: "Search tool",
    material: "Material",
    diameterTool: "Tool diameter",
    diameterPart: "Workpiece diameter",
    teeth: "Number of teeth z",
    auto: "Update values automatically",
    autoCopy: "Recommendations for the selected tool and material",
    limit: "Use spindle-speed limit",
    limitCopy: "Ideal for older machines",
    maxRpm: "Maximum spindle speed",
    advanced: "Advanced options",
    grade: "Exact material grade",
    standard: "Standard / not specified",
    cutting: "Cutting values",
    cuttingCopy: "Automatically suggested and always editable.",
    speed: "Cutting speed vc",
    feedTooth: "Feed per tooth fz",
    feedRev: "Feed per revolution f",
    reset: "Reset to recommended values",
    result: "Result",
    rpm: "Spindle speed n",
    feed: "Feed rate vf",
    range: "Recommended range",
    gentle: "Gentle",
    start: "Starting value",
    productive: "Productive",
    toolSummary: "Tool",
    materialSummary: "Material",
    perRev: "Feed/rev",
    important: "Important:",
    warning:
      "These are starting values. Tool manufacturer, machine, clamping, coolant and part stability take priority.",
    language: "Choose language",
  },
  ru: {
    subtitle: "Режимы резания для цеха",
    live: "Расчёт в реальном времени",
    setup: "Задать обработку",
    setupCopy: "Инструмент и материал определяют начальные значения.",
    tool: "Поиск инструмента",
    material: "Материал",
    diameterTool: "Диаметр инструмента",
    diameterPart: "Диаметр детали",
    teeth: "Число зубьев z",
    auto: "Обновлять значения автоматически",
    autoCopy: "Рекомендации для выбранного инструмента и материала",
    limit: "Ограничить частоту вращения",
    limitCopy: "Подходит для старых станков",
    maxRpm: "Максимальная частота вращения",
    advanced: "Расширенные настройки",
    grade: "Точная марка материала",
    standard: "Стандарт / не указано",
    cutting: "Режимы резания",
    cuttingCopy: "Предлагаются автоматически и всегда редактируются.",
    speed: "Скорость резания vc",
    feedTooth: "Подача на зуб fz",
    feedRev: "Подача на оборот f",
    reset: "Вернуть рекомендуемые значения",
    result: "Результат",
    rpm: "Частота вращения n",
    feed: "Минутная подача vf",
    range: "Рекомендуемый диапазон",
    gentle: "Щадящий",
    start: "Начальное значение",
    productive: "Производительный",
    toolSummary: "Инструмент",
    materialSummary: "Материал",
    perRev: "Подача/об",
    important: "Важно:",
    warning:
      "Это начальные значения. Данные производителя инструмента, станок, закрепление, охлаждение и жёсткость детали имеют приоритет.",
    language: "Выбрать язык",
  },
} as const;

const materialText: Record<Lang, Record<string, string>> = {
  de: {},
  en: {
    steel: "Structural / free-cutting steel",
    stainless: "Stainless steel",
    cast: "Grey cast iron",
    aluminium: "Aluminium",
    brass: "Brass",
    copper: "Copper",
    titanium: "Titanium alloy",
    plastic: "Plastic",
  },
  ru: {
    steel: "Конструкционная / автоматная сталь",
    stainless: "Нержавеющая сталь",
    cast: "Серый чугун",
    aluminium: "Алюминий",
    brass: "Латунь",
    copper: "Медь",
    titanium: "Титан / титановый сплав",
    plastic: "Пластик",
  },
};

const toolText: Record<Lang, Record<string, string>> = {
  de: {},
  en: {
    "end-carbide": "Solid-carbide end mill",
    "end-hss": "HSS end mill",
    "slot-carbide": "Solid-carbide slot mill",
    "ball-carbide": "Solid-carbide ball-nose mill",
    "face-carbide": "Carbide indexable face mill",
    "spot-carbide": "Solid-carbide NC spot drill",
    "center-hss": "HSS centre drill",
    "drill-carbide": "Solid-carbide twist drill",
    "drill-hss": "HSS twist drill",
    "drill-hssco": "HSS-Co twist drill",
    "countersink-hss": "HSS 90° countersink",
    "countersink-carbide": "Carbide 90° countersink",
    "counterbore-hss": "HSS piloted counterbore",
    "reamer-hss": "HSS machine reamer",
    "reamer-carbide": "Carbide machine reamer",
    "turn-rough": "Carbide universal roughing tool",
    "turn-finish": "Carbide finishing tool",
    "turn-fine": "Carbide fine-finishing tool",
    "turn-internal": "Carbide boring tool",
    "turn-face": "Carbide facing tool",
    "turn-groove": "Carbide parting/grooving tool",
    "turn-thread-60": "60° threading tool",
    "turn-hss": "HSS turning tool",
  },
  ru: {
    "end-carbide": "Твердосплавная концевая фреза",
    "end-hss": "Концевая фреза HSS",
    "slot-carbide": "Твердосплавная пазовая фреза",
    "ball-carbide": "Твердосплавная сферическая фреза",
    "face-carbide": "Торцевая фреза с твердосплавными пластинами",
    "spot-carbide": "Твердосплавное центровочное сверло NC",
    "center-hss": "Центровочное сверло HSS",
    "drill-carbide": "Твердосплавное спиральное сверло",
    "drill-hss": "Спиральное сверло HSS",
    "drill-hssco": "Спиральное сверло HSS-Co",
    "countersink-hss": "Коническая зенковка HSS 90°",
    "countersink-carbide": "Твердосплавная зенковка 90°",
    "counterbore-hss": "Цековка HSS с направляющей",
    "reamer-hss": "Машинная развёртка HSS",
    "reamer-carbide": "Твердосплавная машинная развёртка",
    "turn-rough": "Твердосплавный универсальный проходной резец",
    "turn-finish": "Твердосплавный чистовой резец",
    "turn-fine": "Твердосплавный резец для тонкой обработки",
    "turn-internal": "Твердосплавный расточной резец",
    "turn-face": "Твердосплавный подрезной резец",
    "turn-groove": "Твердосплавный отрезной/канавочный резец",
    "turn-thread-60": "Резьбовой резец 60°",
    "turn-hss": "Токарный резец HSS",
  },
};
const categoryText: Record<Lang, Record<string, string>> = {
  de: {},
  en: {
    Fräser: "Milling cutter",
    Bohrer: "Drill",
    Senker: "Countersink",
    Reibahle: "Reamer",
    Drehmeißel: "Turning tool",
  },
  ru: {
    Fräser: "Фреза",
    Bohrer: "Сверло",
    Senker: "Зенковка",
    Reibahle: "Развёртка",
    Drehmeißel: "Токарный резец",
  },
};
const toolUseText: Record<Lang, Record<string, string>> = {
  de: {},
  en: {
    "turn-rough": "Roughing",
    "turn-finish": "Finishing",
    "turn-fine": "Fine finishing / contouring",
    "turn-internal": "Internal turning",
    "turn-face": "Facing",
    "turn-groove": "Parting / grooving",
    "turn-thread-60": "Metric thread",
  },
  ru: {
    "turn-rough": "Черновое точение",
    "turn-finish": "Чистовое точение",
    "turn-fine": "Тонкое точение / контур",
    "turn-internal": "Внутреннее точение",
    "turn-face": "Подрезка торца",
    "turn-groove": "Отрезка / канавка",
    "turn-thread-60": "Метрическая резьба",
  },
};
const uiText = {
  de: {
    toolHelp:
      "Tippe einen Werkzeugnamen oder eine Gruppe ein, zum Beispiel Fräser, Senker oder Drehmeißel.",
    toolPlaceholder: "z. B. Bohrer, Senker, Drehmeißel …",
    noTool: "Kein Werkzeug gefunden.",
    materialHelp:
      "Der Werkstoff legt den empfohlenen Bereich für die Schnittgeschwindigkeit fest.",
    partDiameterHelp:
      "Beim Drehen zählt der aktuell bearbeitete Werkstückdurchmesser.",
    toolDiameterHelp:
      "Der wirksame Durchmesser des Werkzeugs an der Schnittstelle.",
    teethHelp:
      "Anzahl der Werkzeugschneiden. Sie wird für den Gesamtvorschub benötigt.",
    oldMachine: "Ältere Maschine ×0,5",
    oldMachineCopy: "Halbiert Schnittgeschwindigkeit und Vorschub",
    rpmLimit: "Drehzahllimit verwenden",
    rpmLimitCopy: "Technische Obergrenze der Maschine",
    rpmHelp:
      "Nur eine technische Obergrenze – kein Zielwert. Der ursprüngliche Empfehlungsbereich bleibt sichtbar.",
    scanner: "Werkzeugcode scannen",
    scannerCopy: "Demo-Scanner mit Beispielwerkzeug öffnen",
    scanTitle: "Werkzeugcode scannen",
    scanDescription:
      "Prototyp: Der Testcode simuliert einen Code auf einer Werkzeugverpackung.",
    camera: "Kamera auf QR- oder Data-Matrix-Code richten",
    scanDemo: "Demo-Code scannen",
    recognized: "Demo-Werkzeug erkannt",
    demoWarning: "Testdatensatz – keine echten Herstellerdaten",
    manufacturer: "Hersteller",
    article: "Artikelnummer",
    toolName: "Werkzeug",
    steel: "Stahl",
    aluminium: "Aluminium",
    titanium: "Titan",
    oldActive:
      "Altmaschinenmodus aktiv: Beim Übernehmen werden die Werte halbiert.",
    import: "Herstellerwerte übernehmen",
    gradeHelp:
      "Optional passt eine genaue Sorte den Startwert an. Ohne Auswahl gilt der allgemeine Standard.",
    operation: "Einsatz",
    profile: "Schnittwertprofil",
    profileGroove: "Konservativ · Stabilität zuerst",
    profileFine: "Höhere Schnittgeschwindigkeit · kleiner Vorschub",
    profileRough: "Hohe Belastbarkeit · größerer Vorschub",
    balanced: "Ausgewogen",
    turnNote:
      "Plattensorte, Geometrie, Auskragung und Kühlung können die Werte stark verändern. Der Rechner zeigt deshalb nur einen vorsichtigen Startbereich.",
    pitch: "Gewindesteigung P",
    pitchHelp:
      "Beim Gewindedrehen entspricht der Vorschub pro Umdrehung exakt der Gewindesteigung.",
    speedHelp:
      "Geschwindigkeit der Schneide relativ zum Werkstoff. Herstellerangaben haben Vorrang.",
    feedMillHelp:
      "Weg pro Schneide. Der Rechner multipliziert fz mit Drehzahl und Schneidenzahl.",
    feedRevHelp:
      "Weg pro vollständiger Spindelumdrehung. Daraus entsteht der Vorschub in mm/min.",
    withoutLimit: "ohne Maschinenlimit",
    limitedTo: "Begrenzt auf",
    calculated: "Rechnerisch",
    actual: "tatsächlich",
    limitIsNotTarget: "Das Maschinenmaximum ist eine Grenze, kein Zielwert.",
    helpAria: "Erklärung anzeigen",
  },
  en: {
    toolHelp:
      "Enter a tool name or group, such as milling cutter, countersink or turning tool.",
    toolPlaceholder: "e.g. drill, countersink, turning tool …",
    noTool: "No tool found.",
    materialHelp:
      "The material determines the recommended cutting-speed range.",
    partDiameterHelp:
      "For turning, enter the diameter currently being machined.",
    toolDiameterHelp: "Effective tool diameter at the cutting edge.",
    teethHelp: "Number of cutting edges used to calculate the total feed rate.",
    oldMachine: "Older machine ×0.5",
    oldMachineCopy: "Halves cutting speed and feed",
    rpmLimit: "Use spindle-speed limit",
    rpmLimitCopy: "Technical machine limit",
    rpmHelp:
      "A technical upper limit only—not a target. The original recommendation remains visible.",
    scanner: "Scan tool code",
    scannerCopy: "Open demo scanner with a sample tool",
    scanTitle: "Scan tool code",
    scanDescription:
      "Prototype: the test code simulates a code on tool packaging.",
    camera: "Point the camera at a QR or Data Matrix code",
    scanDemo: "Scan demo code",
    recognized: "Demo tool detected",
    demoWarning: "Test data—not genuine manufacturer data",
    manufacturer: "Manufacturer",
    article: "Part number",
    toolName: "Tool",
    steel: "Steel",
    aluminium: "Aluminium",
    titanium: "Titanium",
    oldActive: "Older-machine mode is active: imported values will be halved.",
    import: "Use manufacturer values",
    gradeHelp:
      "Optionally select an exact grade. The general material standard is used otherwise.",
    operation: "Application",
    profile: "Cutting-data profile",
    profileGroove: "Conservative · stability first",
    profileFine: "Higher cutting speed · low feed",
    profileRough: "High load capacity · higher feed",
    balanced: "Balanced",
    turnNote:
      "Insert grade, geometry, overhang and coolant can change the values considerably. This calculator therefore shows a cautious starting range.",
    pitch: "Thread pitch P",
    pitchHelp:
      "For thread turning, feed per revolution must exactly equal the thread pitch.",
    speedHelp:
      "Speed of the cutting edge relative to the material. Manufacturer data takes priority.",
    feedMillHelp:
      "Travel per cutting edge. The calculator multiplies fz by spindle speed and number of teeth.",
    feedRevHelp:
      "Tool travel per complete spindle revolution, used to calculate mm/min.",
    withoutLimit: "without machine limit",
    limitedTo: "Limited to",
    calculated: "Calculated",
    actual: "actual",
    limitIsNotTarget: "The machine maximum is a limit, not a target.",
    helpAria: "Show explanation",
  },
  ru: {
    toolHelp:
      "Введите название или группу инструмента, например фреза, зенковка или токарный резец.",
    toolPlaceholder: "например, сверло, зенковка, резец …",
    noTool: "Инструмент не найден.",
    materialHelp:
      "Материал определяет рекомендуемый диапазон скорости резания.",
    partDiameterHelp:
      "При точении укажите текущий обрабатываемый диаметр детали.",
    toolDiameterHelp: "Рабочий диаметр инструмента в зоне резания.",
    teethHelp: "Количество режущих кромок для расчёта минутной подачи.",
    oldMachine: "Старый станок ×0,5",
    oldMachineCopy: "Уменьшает скорость резания и подачу вдвое",
    rpmLimit: "Ограничить частоту вращения",
    rpmLimitCopy: "Технический предел станка",
    rpmHelp:
      "Только верхний технический предел, а не целевое значение. Исходный диапазон остаётся видимым.",
    scanner: "Сканировать код инструмента",
    scannerCopy: "Открыть демо-сканер с примером",
    scanTitle: "Сканирование кода инструмента",
    scanDescription:
      "Прототип: тестовый код имитирует код на упаковке инструмента.",
    camera: "Наведите камеру на QR- или Data Matrix-код",
    scanDemo: "Сканировать демо-код",
    recognized: "Демо-инструмент распознан",
    demoWarning: "Тестовые данные — не данные производителя",
    manufacturer: "Производитель",
    article: "Артикул",
    toolName: "Инструмент",
    steel: "Сталь",
    aluminium: "Алюминий",
    titanium: "Титан",
    oldActive:
      "Режим старого станка активен: импортируемые значения будут уменьшены вдвое.",
    import: "Применить данные производителя",
    gradeHelp:
      "При желании выберите точную марку. Иначе используется общий стандарт материала.",
    operation: "Применение",
    profile: "Профиль режимов",
    profileGroove: "Осторожный · приоритет жёсткости",
    profileFine: "Повышенная скорость · малая подача",
    profileRough: "Высокая нагрузка · большая подача",
    balanced: "Сбалансированный",
    turnNote:
      "Марка пластины, геометрия, вылет и охлаждение могут значительно менять значения. Поэтому показан осторожный начальный диапазон.",
    pitch: "Шаг резьбы P",
    pitchHelp:
      "При точении резьбы подача на оборот должна точно соответствовать шагу резьбы.",
    speedHelp:
      "Скорость режущей кромки относительно материала. Данные производителя имеют приоритет.",
    feedMillHelp:
      "Перемещение на одну режущую кромку. fz умножается на частоту вращения и число зубьев.",
    feedRevHelp:
      "Перемещение инструмента за полный оборот шпинделя для расчёта мм/мин.",
    withoutLimit: "без ограничения станка",
    limitedTo: "Ограничено до",
    calculated: "Расчётно",
    actual: "фактически",
    limitIsNotTarget: "Максимум станка — это предел, а не цель.",
    helpAria: "Показать пояснение",
  },
} as const;

const materialGrades: Record<
  string,
  { id: string; label: string; factor: number }[]
> = {
  steel: [
    { id: "s235", label: "S235", factor: 1.05 },
    { id: "c45", label: "C45", factor: 0.9 },
    { id: "42crmo4", label: "42CrMo4", factor: 0.75 },
  ],
  stainless: [
    { id: "14301", label: "1.4301", factor: 0.92 },
    { id: "14571", label: "1.4571", factor: 0.84 },
  ],
  cast: [
    { id: "en-gjl-250", label: "EN-GJL-250", factor: 1 },
    { id: "en-gjs-400", label: "EN-GJS-400", factor: 0.86 },
  ],
  aluminium: [
    { id: "6082", label: "EN AW-6082", factor: 1 },
    { id: "7075", label: "EN AW-7075", factor: 0.86 },
  ],
  brass: [{ id: "cw614n", label: "CuZn39Pb3 / CW614N", factor: 1.05 }],
  copper: [{ id: "e-cu", label: "E-Cu / CW004A", factor: 0.82 }],
  titanium: [
    { id: "grade2", label: "Titan Grade 2", factor: 1.12 },
    { id: "ti64", label: "Ti-6Al-4V / Grade 5", factor: 0.86 },
  ],
  plastic: [
    { id: "pom", label: "POM", factor: 1.08 },
    { id: "pa", label: "PA", factor: 0.9 },
    { id: "pe", label: "PE", factor: 1.12 },
  ],
};

const tools: Tool[] = [
  {
    id: "end-carbide",
    label: "VHM-Schaftfräser",
    category: "Fräser",
    mode: "mill",
    teeth: 4,
    feed: 0.06,
    spread: 0.2,
    feedScale: "mill",
    speeds: {
      steel: 160,
      stainless: 90,
      cast: 180,
      aluminium: 450,
      brass: 300,
      copper: 220,
      titanium: 45,
      plastic: 300,
    },
  },
  {
    id: "end-hss",
    label: "HSS-Schaftfräser",
    category: "Fräser",
    mode: "mill",
    teeth: 4,
    feed: 0.04,
    spread: 0.2,
    feedScale: "mill",
    speeds: {
      steel: 28,
      stainless: 16,
      cast: 25,
      aluminium: 90,
      brass: 70,
      copper: 55,
      titanium: 8,
      plastic: 100,
    },
  },
  {
    id: "slot-carbide",
    label: "VHM-Nutenfräser",
    category: "Fräser",
    mode: "mill",
    teeth: 2,
    feed: 0.045,
    spread: 0.2,
    feedScale: "mill",
    speeds: {
      steel: 140,
      stainless: 75,
      cast: 160,
      aluminium: 400,
      brass: 280,
      copper: 190,
      titanium: 38,
      plastic: 280,
    },
  },
  {
    id: "ball-carbide",
    label: "VHM-Kugelfräser",
    category: "Fräser",
    mode: "mill",
    teeth: 2,
    feed: 0.035,
    spread: 0.25,
    feedScale: "mill",
    speeds: {
      steel: 130,
      stainless: 70,
      cast: 145,
      aluminium: 350,
      brass: 240,
      copper: 175,
      titanium: 32,
      plastic: 250,
    },
  },
  {
    id: "face-carbide",
    label: "Planfräser mit HM-WSP",
    category: "Fräser",
    mode: "mill",
    teeth: 5,
    feed: 0.12,
    spread: 0.2,
    feedScale: "mill",
    speeds: {
      steel: 180,
      stainless: 110,
      cast: 220,
      aluminium: 600,
      brass: 350,
      copper: 250,
      titanium: 50,
      plastic: 350,
    },
  },
  {
    id: "spot-carbide",
    label: "NC-Anbohrer VHM",
    category: "Bohrer",
    mode: "drill",
    teeth: 1,
    feed: 0.05,
    spread: 0.2,
    feedScale: "hole",
    speeds: {
      steel: 80,
      stainless: 45,
      cast: 90,
      aluminium: 200,
      brass: 130,
      copper: 110,
      titanium: 25,
      plastic: 150,
    },
  },
  {
    id: "center-hss",
    label: "Zentrierbohrer HSS",
    category: "Bohrer",
    mode: "drill",
    teeth: 1,
    feed: 0.04,
    spread: 0.2,
    feedScale: "hole",
    speeds: {
      steel: 18,
      stainless: 10,
      cast: 16,
      aluminium: 50,
      brass: 40,
      copper: 35,
      titanium: 5,
      plastic: 60,
    },
  },
  {
    id: "drill-carbide",
    label: "VHM-Spiralbohrer",
    category: "Bohrer",
    mode: "drill",
    teeth: 1,
    feed: 0.16,
    spread: 0.2,
    feedScale: "hole",
    speeds: {
      steel: 100,
      stainless: 55,
      cast: 110,
      aluminium: 220,
      brass: 150,
      copper: 125,
      titanium: 30,
      plastic: 170,
    },
  },
  {
    id: "drill-hss",
    label: "HSS-Spiralbohrer",
    category: "Bohrer",
    mode: "drill",
    teeth: 1,
    feed: 0.12,
    spread: 0.2,
    feedScale: "hole",
    speeds: {
      steel: 50,
      stainless: 12,
      cast: 22,
      aluminium: 70,
      brass: 55,
      copper: 45,
      titanium: 7,
      plastic: 80,
    },
  },
  {
    id: "drill-hssco",
    label: "HSS-Co-Spiralbohrer",
    category: "Bohrer",
    mode: "drill",
    teeth: 1,
    feed: 0.11,
    spread: 0.2,
    feedScale: "hole",
    speeds: {
      steel: 30,
      stainless: 18,
      cast: 26,
      aluminium: 65,
      brass: 50,
      copper: 42,
      titanium: 11,
      plastic: 75,
    },
  },
  {
    id: "countersink-hss",
    label: "Kegelsenker HSS 90°",
    category: "Senker",
    mode: "drill",
    teeth: 1,
    feed: 0.08,
    spread: 0.25,
    feedScale: "hole",
    speeds: {
      steel: 12,
      stainless: 7,
      cast: 12,
      aluminium: 35,
      brass: 25,
      copper: 20,
      titanium: 4,
      plastic: 40,
    },
  },
  {
    id: "countersink-carbide",
    label: "Kegelsenker VHM 90°",
    category: "Senker",
    mode: "drill",
    teeth: 1,
    feed: 0.07,
    spread: 0.25,
    feedScale: "hole",
    speeds: {
      steel: 45,
      stainless: 25,
      cast: 50,
      aluminium: 120,
      brass: 90,
      copper: 70,
      titanium: 16,
      plastic: 100,
    },
  },
  {
    id: "counterbore-hss",
    label: "Flachsenker HSS mit Führungszapfen",
    category: "Senker",
    mode: "drill",
    teeth: 1,
    feed: 0.1,
    spread: 0.25,
    feedScale: "hole",
    speeds: {
      steel: 16,
      stainless: 9,
      cast: 15,
      aluminium: 45,
      brass: 35,
      copper: 28,
      titanium: 5,
      plastic: 50,
    },
  },
  {
    id: "reamer-hss",
    label: "Maschinenreibahle HSS",
    category: "Reibahle",
    mode: "drill",
    teeth: 1,
    feed: 0.22,
    spread: 0.2,
    feedScale: "hole",
    speeds: {
      steel: 8,
      stainless: 5,
      cast: 10,
      aluminium: 25,
      brass: 18,
      copper: 15,
      titanium: 3,
      plastic: 30,
    },
  },
  {
    id: "reamer-carbide",
    label: "Maschinenreibahle VHM",
    category: "Reibahle",
    mode: "drill",
    teeth: 1,
    feed: 0.2,
    spread: 0.2,
    feedScale: "hole",
    speeds: {
      steel: 35,
      stainless: 20,
      cast: 45,
      aluminium: 100,
      brass: 75,
      copper: 60,
      titanium: 12,
      plastic: 90,
    },
  },
  {
    id: "turn-rough",
    label: "Universal-Schruppmeißel HM",
    category: "Drehmeißel",
    mode: "turn",
    teeth: 1,
    feed: 0.28,
    use: "Schruppen",
    speeds: {
      steel: 155,
      stainless: 95,
      cast: 190,
      aluminium: 420,
      brass: 300,
      copper: 220,
      titanium: 40,
      plastic: 260,
    },
  },
  {
    id: "turn-finish",
    label: "Schlichtmeißel HM",
    category: "Drehmeißel",
    mode: "turn",
    teeth: 1,
    feed: 0.12,
    use: "Schlichten",
    speeds: {
      steel: 195,
      stainless: 125,
      cast: 235,
      aluminium: 520,
      brass: 370,
      copper: 275,
      titanium: 55,
      plastic: 320,
    },
  },
  {
    id: "turn-fine",
    label: "Feinschlichtmeißel HM",
    category: "Drehmeißel",
    mode: "turn",
    teeth: 1,
    feed: 0.06,
    use: "Feinschlichten / Kontur",
    speeds: {
      steel: 220,
      stainless: 140,
      cast: 260,
      aluminium: 580,
      brass: 410,
      copper: 300,
      titanium: 75,
      plastic: 350,
    },
  },
  {
    id: "turn-internal",
    label: "Innendrehmeißel HM",
    category: "Drehmeißel",
    mode: "turn",
    teeth: 1,
    feed: 0.14,
    use: "Innendrehen",
    speeds: {
      steel: 155,
      stainless: 95,
      cast: 190,
      aluminium: 430,
      brass: 305,
      copper: 225,
      titanium: 38,
      plastic: 270,
    },
  },
  {
    id: "turn-face",
    label: "Plandrehmeißel HM",
    category: "Drehmeißel",
    mode: "turn",
    teeth: 1,
    feed: 0.18,
    use: "Plandrehen",
    speeds: {
      steel: 170,
      stainless: 110,
      cast: 210,
      aluminium: 480,
      brass: 340,
      copper: 245,
      titanium: 42,
      plastic: 290,
    },
  },
  {
    id: "turn-groove",
    label: "Abstech-/Einstechmeißel HM",
    category: "Drehmeißel",
    mode: "turn",
    teeth: 1,
    feed: 0.06,
    spread: 0.25,
    use: "Abstechen / Einstechen",
    speeds: {
      steel: 50,
      stainless: 35,
      cast: 60,
      aluminium: 120,
      brass: 100,
      copper: 80,
      titanium: 20,
      plastic: 100,
    },
  },
  {
    id: "turn-thread-60",
    label: "Gewindedrehmeißel 60°",
    category: "Drehmeißel",
    mode: "turn",
    teeth: 1,
    feed: 1,
    angle: "60°",
    use: "Metrisches Gewinde",
    speeds: {
      steel: 90,
      stainless: 55,
      cast: 105,
      aluminium: 240,
      brass: 175,
      copper: 130,
      titanium: 22,
      plastic: 170,
    },
  },
  {
    id: "turn-hss",
    label: "Drehmeißel HSS",
    category: "Drehmeißel",
    mode: "turn",
    teeth: 1,
    feed: 0.12,
    speeds: {
      steel: 25,
      stainless: 14,
      cast: 22,
      aluminium: 80,
      brass: 60,
      copper: 45,
      titanium: 7,
      plastic: 90,
    },
  },
];
const diameterFeedFactor = (tool: Tool, diameter: number) => {
  if (tool.feedScale === "mill")
    return diameter <= 3
      ? 0.55
      : diameter <= 6
        ? 0.75
        : diameter <= 12
          ? 1
          : diameter <= 20
            ? 1.2
            : 1.35;
  if (tool.feedScale === "hole")
    return diameter <= 3
      ? 0.5
      : diameter <= 6
        ? 0.7
        : diameter <= 10
          ? 1
          : diameter <= 20
            ? 1.3
            : 1.5;
  return 1;
};
const normalizeSearch = (value: string) =>
  value
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9а-яё]+/gi, " ")
    .trim();
const toolAliases: Record<string, string> = {
  "end-carbide": "schaftfraeser end mill fraeser milling carbide vhm",
  "end-hss": "schaftfraeser end mill fraeser milling hss",
  "slot-carbide": "nutenfraeser slot mill nut fraeser",
  "ball-carbide": "kugelfraeser ball nose radius fraeser",
  "face-carbide": "planfraeser face mill wsp wendeplatte",
  "spot-carbide": "anbohrer spot drill nc",
  "center-hss": "zentrierbohrer center drill",
  "drill-carbide": "bohrer spiralbohrer drill vhm carbide",
  "drill-hss": "bohrer spiralbohrer drill hss",
  "drill-hssco": "bohrer spiralbohrer drill cobalt hssco hsse",
  "countersink-hss": "senker kegelsenker countersink 90 hss",
  "countersink-carbide": "senker kegelsenker countersink 90 vhm carbide",
  "counterbore-hss": "flachsenker counterbore zapfen hss",
  "reamer-hss": "reibahle reamer hss",
  "reamer-carbide": "reibahle reamer vhm carbide",
  "turn-rough": "drehmeissel schrupper roughing 85",
  "turn-finish": "drehmeissel schlichter finishing 60",
  "turn-fine": "drehmeissel feinschlichter fine finishing 30",
  "turn-internal": "innendrehmeissel ausdreher boring internal",
  "turn-face": "plandrehen planmeissel facing",
  "turn-groove": "abstechen einstechen stechmeissel parting grooving",
  "turn-thread-60": "gewinde gewindedrehmeissel threading 60",
  "turn-hss": "drehmeissel turning hss",
};

export default function Home() {
  const [lang, setLang] = useState<Lang>("de");
  const text = words[lang];
  const ui = uiText[lang];
  const [toolQuery, setToolQuery] = useState("");
  const [toolInput, setToolInput] = useState("");
  const locale = lang === "de" ? "de-DE" : lang === "ru" ? "ru-RU" : "en-GB";
  const units =
    lang === "de"
      ? { rpm: "U/min", rev: "mm/U", tooth: "mm/Z", minute: "mm/min" }
      : lang === "ru"
        ? { rpm: "об/мин", rev: "мм/об", tooth: "мм/зуб", minute: "мм/мин" }
        : { rpm: "rpm", rev: "mm/rev", tooth: "mm/tooth", minute: "mm/min" };
  const format = (value: number, digits = 0) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(
      value,
    );
  const searchItems = tools.map(
    (item) => toolText[lang][item.id] ?? item.label,
  );
  const filterTool = (label: string, query: string) => {
    const item = tools.find(
      (candidate) =>
        (toolText[lang][candidate.id] ?? candidate.label) === label,
    );
    if (!item) return false;
    const searchable = normalizeSearch(
      [
        toolText[lang][item.id],
        item.label,
        categoryText[lang][item.category],
        item.category,
        toolAliases[item.id],
      ]
        .filter(Boolean)
        .join(" "),
    );
    const terms = normalizeSearch(query).split(" ").filter(Boolean);
    return terms.every((term) => searchable.includes(term));
  };
  const filteredTools = toolQuery.trim()
    ? tools.filter((item) =>
        filterTool(toolText[lang][item.id] ?? item.label, toolQuery),
      )
    : tools;
  const [toolId, setToolId] = useState("end-carbide");
  const [material, setMaterial] = useState("steel");
  const [diameter, setDiameter] = useState(10);
  const [teeth, setTeeth] = useState(4);
  const [feed, setFeed] = useState(0.06);
  const [cuttingSpeed, setCuttingSpeed] = useState(160);
  const [maxRpm, setMaxRpm] = useState(3000);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [oldMachine, setOldMachine] = useState(false);
  const [rpmLimitActive, setRpmLimitActive] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [grade, setGrade] = useState("standard");
  const [threadPitch, setThreadPitch] = useState(1);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [demoScanned, setDemoScanned] = useState(false);
  const [cameraState, setCameraState] = useState<
    "notice" | "starting" | "active" | "error"
  >("notice");
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem("zerspaner-language") as Lang | null;
    if (saved && words[saved]) setLang(saved);
  }, []);
  const changeLanguage = (next: Lang) => {
    setLang(next);
    localStorage.setItem("zerspaner-language", next);
    document.documentElement.lang = next;
  };
  const tool = tools.find((item) => item.id === toolId)!;
  useEffect(() => {
    setToolInput(toolText[lang][tool.id] ?? tool.label);
    setToolQuery("");
  }, [lang, toolId, tool.id, tool.label]);
  const gradeFactor =
    materialGrades[material].find((item) => item.id === grade)?.factor ?? 1;
  const machineFactor = oldMachine ? 0.5 : 1;
  const recommendedSpeed = Math.round(
    tool.speeds[material] * gradeFactor * machineFactor,
  );
  const recommendedFeed = Number(
    (tool.id === "turn-thread-60"
      ? threadPitch
      : tool.feed * diameterFeedFactor(tool, diameter) * machineFactor
    ).toFixed(3),
  );
  const calculatedRpm = useMemo(
    () => (diameter > 0 ? (cuttingSpeed * 1000) / (Math.PI * diameter) : 0),
    [cuttingSpeed, diameter],
  );
  const rpm =
    rpmLimitActive && maxRpm > 0
      ? Math.min(calculatedRpm, maxRpm)
      : calculatedRpm;
  const isLimited = rpmLimitActive && calculatedRpm > maxRpm;
  const actualCuttingSpeed =
    diameter > 0 ? (Math.PI * diameter * rpm) / 1000 : 0;
  const feedRate = rpm * feed * (tool.mode === "mill" ? teeth : 1);
  const spread = tool.spread ?? 0.18;
  const rangeLowSpeed = Math.round(recommendedSpeed * (1 - spread));
  const rangeHighSpeed = Math.round(recommendedSpeed * (1 + spread));
  const rangeRpm = (speed: number) =>
    diameter > 0 ? (speed * 1000) / (Math.PI * diameter) : 0;

  const applyDefaults = (
    next: Tool,
    mat = material,
    factor = gradeFactor,
    reduction = machineFactor,
  ) => {
    setTeeth(next.teeth);
    setFeed(
      Number(
        (next.id === "turn-thread-60"
          ? threadPitch
          : next.feed * diameterFeedFactor(next, diameter) * reduction
        ).toFixed(3),
      ),
    );
    setCuttingSpeed(Math.round(next.speeds[mat] * factor * reduction));
  };
  const chooseTool = (id: string) => {
    const next = tools.find((item) => item.id === id)!;
    setToolId(id);
    if (autoUpdate) applyDefaults(next);
  };
  const chooseMaterial = (id: string) => {
    setMaterial(id);
    setGrade("standard");
    if (autoUpdate) applyDefaults(tool, id, 1);
  };
  const chooseGrade = (id: string) => {
    setGrade(id);
    const factor =
      materialGrades[material].find((item) => item.id === id)?.factor ?? 1;
    if (autoUpdate) applyDefaults(tool, material, factor);
  };
  const reset = () => {
    applyDefaults(tool, material);
  };
  useEffect(() => {
    if (autoUpdate) setFeed(recommendedFeed);
  }, [diameter, threadPitch, toolId, autoUpdate, recommendedFeed]);
  const toggleOldMachine = (enabled: boolean) => {
    setOldMachine(enabled);
    if (autoUpdate)
      applyDefaults(tool, material, gradeFactor, enabled ? 0.5 : 1);
  };
  const importDemoTool = () => {
    const demo = tools.find((item) => item.id === "drill-hss")!;
    setToolId(demo.id);
    setDiameter(10);
    setTeeth(1);
    setGrade("standard");
    setFeed(Number((demo.feed * (oldMachine ? 0.5 : 1)).toFixed(3)));
    setCuttingSpeed(Math.round(demo.speeds[material] * (oldMachine ? 0.5 : 1)));
    setScannerOpen(false);
    setDemoScanned(false);
  };
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };
  const startCamera = async () => {
    setCameraState("starting");
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraState("active");
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch {
      setCameraState("error");
      setCameraError(
        lang === "de"
          ? "Kamerazugriff wurde abgelehnt oder ist nicht verfügbar."
          : lang === "ru"
            ? "Доступ к камере отклонён или недоступен."
            : "Camera access was denied or is unavailable.",
      );
    }
  };
  useEffect(() => () => stopCamera(), []);

  return (
    <main className="min-h-screen px-4 py-5 sm:px-7 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between border-b pb-5">
          <div className="flex items-center gap-3">
            <img
              src="/zerspaner-guru-logo.jpeg"
              alt="Zerspaner Guru ZSG Logo"
              className="logo-image"
            />
            <div>
              <h1 className="brand-title text-xl font-bold tracking-tight sm:text-2xl">
                Zerspaner <span>GURU</span>
              </h1>
              <p className="text-sm text-slate-500">{text.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="live-pill hidden items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium sm:flex">
              <Sparkles size={15} /> {text.live}
            </div>
            <Popover>
              <PopoverTrigger
                type="button"
                className="language-trigger"
                aria-label={text.language}
              >
                <Globe2 size={21} />
              </PopoverTrigger>
              <PopoverContent align="end" className="language-menu">
                <p>{text.language}</p>
                {(
                  [
                    ["de", "Deutsch"],
                    ["en", "English"],
                    ["ru", "Русский"],
                  ] as const
                ).map(([id, label]) => (
                  <button key={id} onClick={() => changeLanguage(id)}>
                    <span>{label}</span>
                    {lang === id && <Check size={17} />}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        </header>
        <section className="grid gap-5 lg:grid-cols-[1.08fr_.92fr]">
          <div className="panel p-5 sm:p-7">
            <Title number="1" title={text.setup} copy={text.setupCopy} />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={text.tool} help={ui.toolHelp}>
                <Combobox
                  items={searchItems}
                  value={toolText[lang][tool.id] ?? tool.label}
                  inputValue={toolInput}
                  onValueChange={(label) => {
                    if (!label) {
                      setToolInput("");
                      setToolQuery("");
                      return;
                    }
                    const selected = tools.find(
                      (item) =>
                        (toolText[lang][item.id] ?? item.label) === label,
                    );
                    if (selected) {
                      setToolInput(label);
                      setToolQuery("");
                      chooseTool(selected.id);
                    }
                  }}
                  onInputValueChange={(value) => {
                    setToolInput(value);
                    setToolQuery(value);
                  }}
                  filter={null}
                  autoHighlight
                >
                  <ComboboxInput
                    className="control"
                    placeholder={ui.toolPlaceholder}
                    showClear
                    onFocus={(e) => e.currentTarget.select()}
                  />
                  <ComboboxContent>
                    <ComboboxList>
                      {filteredTools.length ? (
                        filteredTools.map((item) => (
                          <ComboboxItem
                            key={item.id}
                            value={toolText[lang][item.id] ?? item.label}
                          >
                            <span>{toolText[lang][item.id] ?? item.label}</span>
                            <span className="ml-auto text-xs text-slate-400">
                              {categoryText[lang][item.category] ??
                                item.category}
                            </span>
                          </ComboboxItem>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-center text-sm text-slate-500">
                          {ui.noTool}
                        </div>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </Field>
              <Field label={text.material} help={ui.materialHelp}>
                <Select value={material} onValueChange={chooseMaterial}>
                  <SelectTrigger className="control">
                    <SelectValue>
                      {materialText[lang][material] ??
                        materials.find((m) => m.id === material)!.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {materialText[lang][item.id] ?? item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field
                label={
                  tool.mode === "turn" ? text.diameterPart : text.diameterTool
                }
                help={
                  tool.mode === "turn"
                    ? ui.partDiameterHelp
                    : ui.toolDiameterHelp
                }
                suffix="mm"
              >
                <Input
                  className="control pr-12"
                  type="number"
                  inputMode="decimal"
                  min=".1"
                  step=".1"
                  value={diameter}
                  onFocus={(e) => e.currentTarget.select()}
                  onChange={(e) => setDiameter(Number(e.target.value))}
                />
              </Field>
              {tool.mode === "mill" && (
                <Field label={text.teeth} help={ui.teethHelp}>
                  <Input
                    className="control"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={teeth}
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => setTeeth(Number(e.target.value))}
                  />
                </Field>
              )}
              <div className="auto-card">
                <div>
                  <p className="font-semibold text-slate-800">{text.auto}</p>
                  <p className="mt-1 text-sm text-slate-500">{text.autoCopy}</p>
                </div>
                <Switch
                  checked={autoUpdate}
                  onCheckedChange={setAutoUpdate}
                  aria-label={text.auto}
                />
              </div>
              <div className="auto-card older-machine-card">
                <div>
                  <p className="font-semibold text-slate-800">
                    {ui.oldMachine}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {ui.oldMachineCopy}
                  </p>
                </div>
                <Switch
                  checked={oldMachine}
                  onCheckedChange={toggleOldMachine}
                  aria-label={ui.oldMachine}
                />
              </div>
              <div className="auto-card">
                <div>
                  <p className="font-semibold text-slate-800">{ui.rpmLimit}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {ui.rpmLimitCopy}
                  </p>
                </div>
                <Switch
                  checked={rpmLimitActive}
                  onCheckedChange={setRpmLimitActive}
                  aria-label={ui.rpmLimit}
                />
              </div>
              <Field label={text.maxRpm} help={ui.rpmHelp} suffix={units.rpm}>
                <Input
                  className="control pr-16"
                  type="number"
                  inputMode="numeric"
                  min="100"
                  step="100"
                  value={maxRpm}
                  disabled={!rpmLimitActive}
                  onFocus={(e) => e.currentTarget.select()}
                  onChange={(e) => setMaxRpm(Number(e.target.value))}
                />
              </Field>
            </div>
            <Dialog
              open={scannerOpen}
              onOpenChange={(open) => {
                setScannerOpen(open);
                if (!open) { stopCamera(); setDemoScanned(false); setCameraState("notice"); }
              }}
            >
              <DialogTrigger asChild>
                <button type="button" className="scanner-button">
                  <QrCode size={22} />
                  <span>
                    <strong>{ui.scanner}</strong>
                    <small>{ui.scannerCopy}</small>
                  </span>
                  <Camera size={19} />
                </button>
              </DialogTrigger>
              <DialogContent className="scanner-dialog">
                <DialogHeader>
                  <DialogTitle>{ui.scanTitle}</DialogTitle>
                  <DialogDescription>{ui.scanDescription}</DialogDescription>
                </DialogHeader>
                {!demoScanned ? (
                  <div className="scanner-camera">
                    {cameraState === "notice" ? <div className="camera-permission"><ShieldCheck size={42}/><strong>{lang === "de" ? "Kamerazugriff erforderlich" : lang === "ru" ? "Требуется доступ к камере" : "Camera access required"}</strong><p>{lang === "de" ? "Die Kamera wird nur zum Erkennen des Werkzeugcodes verwendet. Es werden keine Bilder gespeichert oder hochgeladen." : lang === "ru" ? "Камера используется только для распознавания кода. Изображения не сохраняются и не загружаются." : "The camera is used only to read the tool code. No images are stored or uploaded."}</p><button type="button" onClick={startCamera}><Camera size={18}/>{lang === "de" ? "Kamera erlauben" : lang === "ru" ? "Разрешить камеру" : "Allow camera"}</button></div> : <><div className="scan-corners camera-frame">{cameraState === "active" ? <video ref={videoRef} muted playsInline/> : <p>{cameraState === "starting" ? (lang === "de" ? "Kamera wird geöffnet …" : lang === "ru" ? "Камера запускается…" : "Starting camera…") : cameraError}</p>}<span className="scan-line"/></div><p>{ui.camera}</p>{cameraState === "error" && <button type="button" onClick={startCamera}>{lang === "de" ? "Erneut versuchen" : lang === "ru" ? "Повторить" : "Try again"}</button>}</>}
                    <button type="button" className="demo-scan-button" onClick={() => { stopCamera(); setDemoScanned(true); }}>
                      {ui.scanDemo}
                    </button>
                  </div>
                ) : (
                  <div className="scan-result">
                    <div className="scan-success">
                      <Check size={20} />
                      <span>{ui.recognized}</span>
                    </div>
                    <p className="demo-warning">{ui.demoWarning}</p>
                    <dl>
                      <div>
                        <dt>{ui.manufacturer}</dt>
                        <dd>DemoWerkzeuge</dd>
                      </div>
                      <div>
                        <dt>{ui.article}</dt>
                        <dd>DEMO-HSS-10</dd>
                      </div>
                      <div>
                        <dt>{ui.toolName}</dt>
                        <dd>
                          {toolText[lang]["drill-hss"] ?? "HSS-Spiralbohrer"}
                        </dd>
                      </div>
                      <div>
                        <dt>
                          {tool.mode === "turn"
                            ? text.diameterPart
                            : text.diameterTool}
                        </dt>
                        <dd>10 mm</dd>
                      </div>
                      <div>
                        <dt>{ui.steel}</dt>
                        <dd>
                          50 m/min · {format(0.12, 2)} {units.rev}
                        </dd>
                      </div>
                      <div>
                        <dt>{ui.aluminium}</dt>
                        <dd>
                          70 m/min · {format(0.12, 2)} {units.rev}
                        </dd>
                      </div>
                      <div>
                        <dt>{ui.titanium}</dt>
                        <dd>
                          7 m/min · {format(0.12, 2)} {units.rev}
                        </dd>
                      </div>
                    </dl>
                    {oldMachine && (
                      <p className="reduction-note">{ui.oldActive}</p>
                    )}
                    <button
                      type="button"
                      className="import-button"
                      onClick={importDemoTool}
                    >
                      {ui.import}
                    </button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            <div className="mt-5">
              <button
                type="button"
                className="advanced-button"
                onClick={() => setAdvanced(!advanced)}
                aria-expanded={advanced}
              >
                <span>{text.advanced}</span>
                <ChevronDown
                  size={18}
                  className={advanced ? "rotate-180 transition" : "transition"}
                />
              </button>
              {advanced && (
                <div className="advanced-panel">
                  <Field label={text.grade} help={ui.gradeHelp}>
                    <Select value={grade} onValueChange={chooseGrade}>
                      <SelectTrigger className="control">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">
                          {text.standard}
                        </SelectItem>
                        {materialGrades[material].map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              )}
            </div>
            {tool.id === "turn-thread-60" && (
              <div className="mt-5">
                <Field label={ui.pitch} help={ui.pitchHelp} suffix="mm">
                  <Input
                    className="control pr-12"
                    type="number"
                    inputMode="decimal"
                    min=".1"
                    step=".1"
                    value={threadPitch}
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => setThreadPitch(Number(e.target.value))}
                  />
                </Field>
              </div>
            )}
            {tool.mode === "turn" && tool.use && (
              <div className="turning-note">
                <div>
                  <span>{ui.operation}</span>
                  <strong>{toolUseText[lang][tool.id] ?? tool.use}</strong>
                </div>
                <div>
                  <span>{ui.profile}</span>
                  <strong>
                    {tool.id === "turn-groove"
                      ? ui.profileGroove
                      : tool.id === "turn-fine"
                        ? ui.profileFine
                        : tool.id === "turn-rough"
                          ? ui.profileRough
                          : ui.balanced}
                  </strong>
                </div>
                <p>{ui.turnNote}</p>
              </div>
            )}
            <div className="my-7 h-px bg-slate-200" />
            <Title number="2" title={text.cutting} copy={text.cuttingCopy} />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={text.speed} help={ui.speedHelp} suffix="m/min">
                <Input
                  className="control pr-16"
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="1"
                  value={cuttingSpeed}
                  onFocus={(e) => e.currentTarget.select()}
                  onChange={(e) => setCuttingSpeed(Number(e.target.value))}
                />
              </Field>
              <Field
                label={tool.mode === "mill" ? text.feedTooth : text.feedRev}
                help={tool.mode === "mill" ? ui.feedMillHelp : ui.feedRevHelp}
                suffix={tool.mode === "mill" ? units.tooth : units.rev}
              >
                <Input
                  className="control pr-14"
                  type="number"
                  inputMode="decimal"
                  min=".001"
                  step=".005"
                  value={feed}
                  onFocus={(e) => e.currentTarget.select()}
                  onChange={(e) => setFeed(Number(e.target.value))}
                />
              </Field>
            </div>
            {(cuttingSpeed !== recommendedSpeed ||
              feed !== recommendedFeed) && (
              <button type="button" onClick={reset} className="reset-button">
                {text.reset}
              </button>
            )}
          </div>
          <aside className="result-panel p-5 sm:p-7">
            <p className="result-kicker mb-4 text-sm font-bold uppercase tracking-[.18em]">
              {text.result}
            </p>
            <Result
              icon={<RotateCw />}
              label={text.rpm}
              value={format(rpm)}
              unit={units.rpm}
              accent
            />
            <div className="range-card">
              <div>
                <span>
                  {text.range} · {ui.withoutLimit}
                </span>
                <strong>
                  {format(rangeRpm(rangeLowSpeed))}–
                  {format(rangeRpm(rangeHighSpeed))} {units.rpm}
                </strong>
              </div>
              <div className="range-actions">
                <button onClick={() => setCuttingSpeed(rangeLowSpeed)}>
                  {text.gentle}
                </button>
                <button
                  className="active"
                  onClick={() => setCuttingSpeed(recommendedSpeed)}
                >
                  {text.start}
                </button>
                <button onClick={() => setCuttingSpeed(rangeHighSpeed)}>
                  {text.productive}
                </button>
              </div>
            </div>
            <Result
              icon={<Gauge />}
              label={text.feed}
              value={format(feedRate)}
              unit={units.minute}
            />
            {isLimited && (
              <div className="limit-note">
                <strong>
                  {ui.limitedTo} {format(maxRpm)} {units.rpm}
                </strong>
                <span>
                  {ui.calculated} {format(calculatedRpm)} {units.rpm} ·{" "}
                  {ui.actual} {format(actualCuttingSpeed, 1)} m/min
                </span>
                <small>{ui.limitIsNotTarget}</small>
              </div>
            )}
            <div className="summary-grid">
              <Summary
                label={text.toolSummary}
                value={toolText[lang][tool.id] ?? tool.label}
              />
              <Summary
                label={text.materialSummary}
                value={
                  grade === "standard"
                    ? (materialText[lang][material] ??
                      materials.find((m) => m.id === material)!.label)
                    : materialGrades[material].find((g) => g.id === grade)!
                        .label
                }
              />
              <Summary
                label={text.perRev}
                value={`${format(feed * (tool.mode === "mill" ? teeth : 1), 3)} ${units.rev}`}
              />
            </div>
            <div className="formula-box">
              <p>n = (vc × 1000) ÷ (π × d)</p>
              <p>vf = n × {tool.mode === "mill" ? "z × fz" : "f"}</p>
            </div>
            <div className="notice">
              <Info size={19} />
              <p>
                <strong>{text.important}</strong> {text.warning}
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Help({ text }: { text: string }) {
  return (
    <Popover>
      <PopoverTrigger type="button" aria-label={text} className="help-button">
        <HelpCircle size={18} />
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={8}
        className="help-popover"
      >
        {text}
      </PopoverContent>
    </Popover>
  );
}
function Field({
  label,
  help,
  suffix,
  children,
}: {
  label: string;
  help?: string;
  suffix?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="block">
      <div className="mb-2 flex min-h-8 items-center gap-1 text-sm font-semibold text-slate-700">
        <span>{label}</span>
        {help && <Help text={help} />}
      </div>
      <div className="relative">
        {children}
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
function Title({
  number,
  title,
  copy,
}: {
  number: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="step">{number}</div>
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{copy}</p>
      </div>
    </div>
  );
}
function Result({
  icon,
  label,
  value,
  unit,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  accent?: boolean;
}) {
  return (
    <div className={`result ${accent ? "result-accent" : ""}`}>
      <div className="result-icon">{icon}</div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-4xl font-bold tabular-nums text-slate-900 sm:text-5xl">
          {value}{" "}
          <span className="text-base font-medium text-slate-500">{unit}</span>
        </p>
      </div>
    </div>
  );
}
function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
