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
  Search,
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
type Lang = "de" | "en" | "ru" | "sv" | "tr" | "es" | "pt" | "sq" | "zh" | "ja" | "vi" | "fr" | "ko" | "it" | "nl" | "cs" | "ro";
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
  sv: {
    subtitle: "Skärdata för verkstaden",
    live: "Beräknas direkt",
    setup: "Ange bearbetning",
    setupCopy: "Verktyg och material bestämmer startvärdena.",
    tool: "Sök verktyg",
    material: "Material",
    diameterTool: "Verktygsdiameter",
    diameterPart: "Arbetsstyckets diameter",
    teeth: "Antal skär z",
    auto: "Uppdatera värden automatiskt",
    autoCopy: "Rekommendationer för valt verktyg och material",
    limit: "Använd varvtalsgräns",
    limitCopy: "Lämpligt för äldre maskiner",
    maxRpm: "Maximalt spindelvarvtal",
    advanced: "Avancerade alternativ",
    grade: "Exakt materialkvalitet",
    standard: "Standard / ej angivet",
    cutting: "Skärvärden",
    cuttingCopy: "Föreslås automatiskt och kan alltid ändras.",
    speed: "Skärhastighet vc",
    feedTooth: "Matning per tand fz",
    feedRev: "Matning per varv f",
    reset: "Återställ rekommenderade värden",
    result: "Resultat",
    rpm: "Spindelvarvtal n",
    feed: "Matningshastighet vf",
    range: "Rekommenderat intervall",
    gentle: "Skonsamt",
    start: "Startvärde",
    productive: "Produktivt",
    toolSummary: "Verktyg",
    materialSummary: "Material",
    perRev: "Matning/varv",
    important: "Viktigt:",
    warning:
      "Detta är startvärden. Verktygstillverkarens uppgifter, maskinen, uppspänningen, kylningen och arbetsstyckets stabilitet har företräde.",
    language: "Välj språk",
  },
  tr: {
    subtitle: "Atölye için kesme verileri",
    live: "Anlık hesaplama",
    setup: "İşlemeyi belirle",
    setupCopy: "Takım ve malzeme başlangıç değerlerini belirler.",
    tool: "Takım ara",
    material: "Malzeme",
    diameterTool: "Takım çapı",
    diameterPart: "İş parçası çapı",
    teeth: "Kesici uç sayısı z",
    auto: "Değerleri otomatik güncelle",
    autoCopy: "Seçilen takım ve malzemeye uygun öneriler",
    limit: "Devir sınırını kullan",
    limitCopy: "Eski makineler için uygundur",
    maxRpm: "Maksimum iş mili devri",
    advanced: "Gelişmiş seçenekler",
    grade: "Kesin malzeme kalitesi",
    standard: "Standart / belirtilmedi",
    cutting: "Kesme değerleri",
    cuttingCopy: "Otomatik önerilir ve her zaman değiştirilebilir.",
    speed: "Kesme hızı vc",
    feedTooth: "Diş başına ilerleme fz",
    feedRev: "Devir başına ilerleme f",
    reset: "Önerilen değerlere sıfırla",
    result: "Sonuç",
    rpm: "İş mili devri n",
    feed: "İlerleme hızı vf",
    range: "Önerilen aralık",
    gentle: "Düşük yük",
    start: "Başlangıç değeri",
    productive: "Üretken",
    toolSummary: "Takım",
    materialSummary: "Malzeme",
    perRev: "İlerleme/dev",
    important: "Önemli:",
    warning:
      "Bunlar başlangıç değerleridir. Takım üreticisi verileri, makine, bağlama, soğutma ve iş parçası kararlılığı önceliklidir.",
    language: "Dil seçin",
  },
  es: {
    subtitle: "Datos de corte para el taller",
    live: "Cálculo en tiempo real",
    setup: "Definir el mecanizado",
    setupCopy: "La herramienta y el material determinan los valores iniciales.",
    tool: "Buscar herramienta",
    material: "Material",
    diameterTool: "Diámetro de la herramienta",
    diameterPart: "Diámetro de la pieza",
    teeth: "Número de dientes z",
    auto: "Actualizar valores automáticamente",
    autoCopy: "Recomendaciones según la herramienta y el material",
    limit: "Usar límite de revoluciones",
    limitCopy: "Adecuado para máquinas antiguas",
    maxRpm: "Velocidad máxima del husillo",
    advanced: "Opciones avanzadas",
    grade: "Calidad exacta del material",
    standard: "Estándar / no especificado",
    cutting: "Datos de corte",
    cuttingCopy: "Sugeridos automáticamente y siempre editables.",
    speed: "Velocidad de corte vc",
    feedTooth: "Avance por diente fz",
    feedRev: "Avance por revolución f",
    reset: "Restablecer valores recomendados",
    result: "Resultado",
    rpm: "Velocidad del husillo n",
    feed: "Velocidad de avance vf",
    range: "Intervalo recomendado",
    gentle: "Suave",
    start: "Valor inicial",
    productive: "Productivo",
    toolSummary: "Herramienta",
    materialSummary: "Material",
    perRev: "Avance/rev",
    important: "Importante:",
    warning:
      "Estos son valores iniciales. Tienen prioridad los datos del fabricante, la máquina, la sujeción, la refrigeración y la estabilidad de la pieza.",
    language: "Elegir idioma",
  },
  pt: {
    subtitle: "Dados de corte para a oficina",
    live: "Cálculo em tempo real",
    setup: "Definir a maquinação",
    setupCopy: "A ferramenta e o material determinam os valores iniciais.",
    tool: "Pesquisar ferramenta",
    material: "Material",
    diameterTool: "Diâmetro da ferramenta",
    diameterPart: "Diâmetro da peça",
    teeth: "Número de dentes z",
    auto: "Atualizar valores automaticamente",
    autoCopy: "Recomendações para a ferramenta e o material selecionados",
    limit: "Usar limite de rotação",
    limitCopy: "Adequado para máquinas antigas",
    maxRpm: "Rotação máxima do fuso",
    advanced: "Opções avançadas",
    grade: "Classe exata do material",
    standard: "Padrão / não especificado",
    cutting: "Dados de corte",
    cuttingCopy: "Sugeridos automaticamente e sempre editáveis.",
    speed: "Velocidade de corte vc",
    feedTooth: "Avanço por dente fz",
    feedRev: "Avanço por rotação f",
    reset: "Repor valores recomendados",
    result: "Resultado",
    rpm: "Rotação do fuso n",
    feed: "Velocidade de avanço vf",
    range: "Intervalo recomendado",
    gentle: "Suave",
    start: "Valor inicial",
    productive: "Produtivo",
    toolSummary: "Ferramenta",
    materialSummary: "Material",
    perRev: "Avanço/rot",
    important: "Importante:",
    warning:
      "Estes são valores iniciais. Têm prioridade os dados do fabricante, a máquina, a fixação, a refrigeração e a estabilidade da peça.",
    language: "Escolher idioma",
  },
  sq: {
    subtitle: "Të dhënat e prerjes për punishten",
    live: "Llogaritje në kohë reale",
    setup: "Përcakto përpunimin",
    setupCopy: "Vegla dhe materiali përcaktojnë vlerat fillestare.",
    tool: "Kërko veglën",
    material: "Materiali",
    diameterTool: "Diametri i veglës",
    diameterPart: "Diametri i pjesës",
    teeth: "Numri i dhëmbëve z",
    auto: "Përditëso vlerat automatikisht",
    autoCopy: "Rekomandime për veglën dhe materialin e zgjedhur",
    limit: "Përdor kufirin e rrotullimeve",
    limitCopy: "I përshtatshëm për makina të vjetra",
    maxRpm: "Shpejtësia maksimale e boshtit",
    advanced: "Opsione të avancuara",
    grade: "Klasa e saktë e materialit",
    standard: "Standard / e paspecifikuar",
    cutting: "Vlerat e prerjes",
    cuttingCopy: "Sugjerohen automatikisht dhe mund të ndryshohen.",
    speed: "Shpejtësia e prerjes vc",
    feedTooth: "Avancimi për dhëmb fz",
    feedRev: "Avancimi për rrotullim f",
    reset: "Rikthe vlerat e rekomanduara",
    result: "Rezultati",
    rpm: "Shpejtësia e boshtit n",
    feed: "Shpejtësia e avancimit vf",
    range: "Intervali i rekomanduar",
    gentle: "I butë",
    start: "Vlera fillestare",
    productive: "Produktiv",
    toolSummary: "Vegla",
    materialSummary: "Materiali",
    perRev: "Avancim/rrot",
    important: "E rëndësishme:",
    warning:
      "Këto janë vlera fillestare. Të dhënat e prodhuesit, makina, fiksimi, ftohja dhe qëndrueshmëria e pjesës kanë përparësi.",
    language: "Zgjidh gjuhën",
  },
  zh: {
    subtitle: "车间切削参数",
    live: "实时计算",
    setup: "设置加工条件",
    setupCopy: "刀具和材料决定初始参数。",
    tool: "搜索刀具",
    material: "材料",
    diameterTool: "刀具直径",
    diameterPart: "工件直径",
    teeth: "刀齿数 z",
    auto: "自动更新参数",
    autoCopy: "根据所选刀具和材料提供建议",
    limit: "使用转速限制",
    limitCopy: "适用于老旧机床",
    maxRpm: "主轴最高转速",
    advanced: "高级选项",
    grade: "具体材料牌号",
    standard: "标准 / 未指定",
    cutting: "切削参数",
    cuttingCopy: "自动建议，并可随时修改。",
    speed: "切削速度 vc",
    feedTooth: "每齿进给量 fz",
    feedRev: "每转进给量 f",
    reset: "恢复建议参数",
    result: "结果",
    rpm: "主轴转速 n",
    feed: "进给速度 vf",
    range: "建议范围",
    gentle: "保守",
    start: "初始值",
    productive: "高效",
    toolSummary: "刀具",
    materialSummary: "材料",
    perRev: "每转进给",
    important: "重要：",
    warning:
      "这些仅为初始参数。应优先采用刀具制造商数据，并考虑机床、装夹、冷却和工件稳定性。",
    language: "选择语言",
  },
  ja: {
    subtitle: "現場向け切削条件",
    live: "リアルタイム計算",
    setup: "加工条件を設定",
    setupCopy: "工具と材料から初期値を決定します。",
    tool: "工具を検索",
    material: "材料",
    diameterTool: "工具径",
    diameterPart: "ワーク径",
    teeth: "刃数 z",
    auto: "値を自動更新",
    autoCopy: "選択した工具と材料に合わせた推奨値",
    limit: "回転数制限を使用",
    limitCopy: "旧型機械に適しています",
    maxRpm: "主軸最高回転数",
    advanced: "詳細オプション",
    grade: "正確な材料規格",
    standard: "標準 / 指定なし",
    cutting: "切削条件",
    cuttingCopy: "自動提案され、必要に応じて変更できます。",
    speed: "切削速度 vc",
    feedTooth: "一刃当たり送り fz",
    feedRev: "一回転当たり送り f",
    reset: "推奨値に戻す",
    result: "計算結果",
    rpm: "主軸回転数 n",
    feed: "送り速度 vf",
    range: "推奨範囲",
    gentle: "安全重視",
    start: "開始値",
    productive: "高能率",
    toolSummary: "工具",
    materialSummary: "材料",
    perRev: "一回転当たり送り",
    important: "重要：",
    warning: "これらは初期値です。工具メーカーのデータ、機械、保持、冷却、ワークの安定性を優先してください。",
    language: "言語を選択",
  },
  vi: {
    subtitle: "Thông số cắt cho xưởng",
    live: "Tính toán trực tiếp",
    setup: "Thiết lập gia công",
    setupCopy: "Dụng cụ và vật liệu xác định các giá trị ban đầu.",
    tool: "Tìm dụng cụ",
    material: "Vật liệu",
    diameterTool: "Đường kính dụng cụ",
    diameterPart: "Đường kính phôi",
    teeth: "Số lưỡi cắt z",
    auto: "Tự động cập nhật giá trị",
    autoCopy: "Khuyến nghị phù hợp với dụng cụ và vật liệu đã chọn",
    limit: "Sử dụng giới hạn tốc độ quay",
    limitCopy: "Phù hợp cho máy đời cũ",
    maxRpm: "Tốc độ trục chính tối đa",
    advanced: "Tùy chọn nâng cao",
    grade: "Mác vật liệu chính xác",
    standard: "Tiêu chuẩn / chưa xác định",
    cutting: "Thông số cắt",
    cuttingCopy: "Được đề xuất tự động và có thể điều chỉnh.",
    speed: "Tốc độ cắt vc",
    feedTooth: "Lượng chạy dao mỗi răng fz",
    feedRev: "Lượng chạy dao mỗi vòng f",
    reset: "Khôi phục giá trị khuyến nghị",
    result: "Kết quả",
    rpm: "Tốc độ trục chính n",
    feed: "Tốc độ chạy dao vf",
    range: "Khoảng khuyến nghị",
    gentle: "Êm",
    start: "Giá trị ban đầu",
    productive: "Năng suất",
    toolSummary: "Dụng cụ",
    materialSummary: "Vật liệu",
    perRev: "Chạy dao/vòng",
    important: "Quan trọng:",
    warning: "Đây là các giá trị ban đầu. Dữ liệu của nhà sản xuất, máy, gá kẹp, làm mát và độ ổn định của phôi được ưu tiên.",
    language: "Chọn ngôn ngữ",
  },
  fr: {
    subtitle: "Paramètres de coupe pour l’atelier",
    live: "Calcul en temps réel",
    setup: "Définir l’usinage",
    setupCopy: "L’outil et le matériau déterminent les valeurs initiales.",
    tool: "Rechercher un outil",
    material: "Matériau",
    diameterTool: "Diamètre de l’outil",
    diameterPart: "Diamètre de la pièce",
    teeth: "Nombre de dents z",
    auto: "Actualiser automatiquement les valeurs",
    autoCopy: "Recommandations adaptées à l’outil et au matériau sélectionnés",
    limit: "Utiliser la limite de régime",
    limitCopy: "Adapté aux machines anciennes",
    maxRpm: "Régime maximal de la broche",
    advanced: "Options avancées",
    grade: "Nuance exacte du matériau",
    standard: "Standard / non spécifié",
    cutting: "Paramètres de coupe",
    cuttingCopy: "Suggérés automatiquement et modifiables si nécessaire.",
    speed: "Vitesse de coupe vc",
    feedTooth: "Avance par dent fz",
    feedRev: "Avance par tour f",
    reset: "Rétablir les valeurs recommandées",
    result: "Résultat",
    rpm: "Régime de broche n",
    feed: "Vitesse d’avance vf",
    range: "Plage recommandée",
    gentle: "Prudent",
    start: "Valeur initiale",
    productive: "Productif",
    toolSummary: "Outil",
    materialSummary: "Matériau",
    perRev: "Avance/tour",
    important: "Important :",
    warning: "Ces valeurs sont des valeurs initiales. Les données du fabricant, la machine, le serrage, le refroidissement et la stabilité de la pièce sont prioritaires.",
    language: "Choisir la langue",
  },
  ko: {
    subtitle: "현장용 절삭 조건",
    live: "실시간 계산",
    setup: "가공 조건 설정",
    setupCopy: "공구와 소재에 따라 시작값이 결정됩니다.",
    tool: "공구 검색",
    material: "소재",
    diameterTool: "공구 직경",
    diameterPart: "공작물 직경",
    teeth: "날 수 z",
    auto: "값 자동 업데이트",
    autoCopy: "선택한 공구와 소재에 맞는 권장값",
    limit: "회전수 제한 사용",
    limitCopy: "구형 장비에 적합",
    maxRpm: "최대 주축 회전수",
    advanced: "고급 옵션",
    grade: "정확한 소재 등급",
    standard: "표준 / 미지정",
    cutting: "절삭 조건",
    cuttingCopy: "자동으로 제안되며 필요에 따라 변경할 수 있습니다.",
    speed: "절삭 속도 vc",
    feedTooth: "날당 이송량 fz",
    feedRev: "회전당 이송량 f",
    reset: "권장값으로 재설정",
    result: "결과",
    rpm: "주축 회전수 n",
    feed: "이송 속도 vf",
    range: "권장 범위",
    gentle: "안정형",
    start: "시작값",
    productive: "생산형",
    toolSummary: "공구",
    materialSummary: "소재",
    perRev: "회전당 이송",
    important: "중요:",
    warning: "이 값은 시작값입니다. 공구 제조사 데이터, 장비, 고정 상태, 냉각 및 공작물 안정성을 우선하십시오.",
    language: "언어 선택",
  },
  it: {
    subtitle: "Parametri di taglio per l’officina", live: "Calcolo in tempo reale",
    setup: "Definisci la lavorazione", setupCopy: "Utensile e materiale determinano i valori iniziali.",
    tool: "Cerca utensile", material: "Materiale", diameterTool: "Diametro utensile",
    diameterPart: "Diametro pezzo", teeth: "Numero di denti z", auto: "Aggiorna automaticamente i valori",
    autoCopy: "Consigli adatti all’utensile e al materiale selezionati", limit: "Usa il limite di giri",
    limitCopy: "Adatto a macchine meno recenti", maxRpm: "Numero di giri massimo del mandrino",
    advanced: "Opzioni avanzate", grade: "Grado esatto del materiale", standard: "Standard / non specificato",
    cutting: "Parametri di taglio", cuttingCopy: "Proposti automaticamente e modificabili secondo necessità.",
    speed: "Velocità di taglio vc", feedTooth: "Avanzamento per dente fz", feedRev: "Avanzamento per giro f",
    reset: "Ripristina i valori consigliati", result: "Risultato", rpm: "Numero di giri mandrino n",
    feed: "Velocità di avanzamento vf", range: "Intervallo consigliato", gentle: "Prudente",
    start: "Valore iniziale", productive: "Produttivo", toolSummary: "Utensile", materialSummary: "Materiale",
    perRev: "Avanzamento/giro", important: "Importante:",
    warning: "Questi sono valori iniziali. Hanno priorità i dati del produttore, la macchina, il serraggio, il raffreddamento e la stabilità del pezzo.",
    language: "Scegli la lingua",
  },
  nl: {
    subtitle: "Snijgegevens voor de werkplaats", live: "Live berekening",
    setup: "Bewerking instellen", setupCopy: "Gereedschap en materiaal bepalen de beginwaarden.",
    tool: "Gereedschap zoeken", material: "Materiaal", diameterTool: "Gereedschapsdiameter",
    diameterPart: "Werkstukdiameter", teeth: "Aantal tanden z", auto: "Waarden automatisch bijwerken",
    autoCopy: "Aanbevelingen passend bij het gekozen gereedschap en materiaal", limit: "Toerentalbegrenzing gebruiken",
    limitCopy: "Geschikt voor oudere machines", maxRpm: "Maximaal spiltoerental",
    advanced: "Geavanceerde opties", grade: "Exacte materiaalkwaliteit", standard: "Standaard / niet opgegeven",
    cutting: "Snijgegevens", cuttingCopy: "Worden automatisch voorgesteld en kunnen worden aangepast.",
    speed: "Snijsnelheid vc", feedTooth: "Voeding per tand fz", feedRev: "Voeding per omwenteling f",
    reset: "Aanbevolen waarden herstellen", result: "Resultaat", rpm: "Spiltoerental n",
    feed: "Voedingssnelheid vf", range: "Aanbevolen bereik", gentle: "Voorzichtig",
    start: "Beginwaarde", productive: "Productief", toolSummary: "Gereedschap", materialSummary: "Materiaal",
    perRev: "Voeding/omw", important: "Belangrijk:",
    warning: "Dit zijn beginwaarden. Gegevens van de fabrikant, machine, opspanning, koeling en werkstukstabiliteit hebben voorrang.",
    language: "Taal kiezen",
  },
  cs: {
    subtitle: "Řezné podmínky pro dílnu", live: "Výpočet v reálném čase", setup: "Nastavit obrábění",
    setupCopy: "Nástroj a materiál určují počáteční hodnoty.", tool: "Hledat nástroj", material: "Materiál",
    diameterTool: "Průměr nástroje", diameterPart: "Průměr obrobku", teeth: "Počet zubů z",
    auto: "Automaticky aktualizovat hodnoty", autoCopy: "Doporučení podle zvoleného nástroje a materiálu",
    limit: "Použít omezení otáček", limitCopy: "Vhodné pro starší stroje", maxRpm: "Maximální otáčky vřetena",
    advanced: "Pokročilé možnosti", grade: "Přesná jakost materiálu", standard: "Standardní / neuvedeno",
    cutting: "Řezné podmínky", cuttingCopy: "Automaticky navržené a podle potřeby upravitelné.",
    speed: "Řezná rychlost vc", feedTooth: "Posuv na zub fz", feedRev: "Posuv na otáčku f",
    reset: "Obnovit doporučené hodnoty", result: "Výsledek", rpm: "Otáčky vřetena n", feed: "Rychlost posuvu vf",
    range: "Doporučený rozsah", gentle: "Šetrný", start: "Počáteční hodnota", productive: "Produktivní",
    toolSummary: "Nástroj", materialSummary: "Materiál", perRev: "Posuv/ot.", important: "Důležité:",
    warning: "Jedná se o počáteční hodnoty. Přednost mají údaje výrobce, stroj, upnutí, chlazení a stabilita obrobku.",
    language: "Vybrat jazyk",
  },
  ro: {
    subtitle: "Parametri de așchiere pentru atelier", live: "Calcul în timp real", setup: "Stabilește prelucrarea",
    setupCopy: "Scula și materialul determină valorile inițiale.", tool: "Caută scula", material: "Material",
    diameterTool: "Diametrul sculei", diameterPart: "Diametrul piesei", teeth: "Număr de dinți z",
    auto: "Actualizează automat valorile", autoCopy: "Recomandări potrivite pentru scula și materialul selectate",
    limit: "Folosește limita de turație", limitCopy: "Potrivit pentru mașini mai vechi", maxRpm: "Turația maximă a arborelui",
    advanced: "Opțiuni avansate", grade: "Clasa exactă a materialului", standard: "Standard / nespecificat",
    cutting: "Parametri de așchiere", cuttingCopy: "Sugerați automat și ajustabili după necesitate.",
    speed: "Viteza de așchiere vc", feedTooth: "Avans pe dinte fz", feedRev: "Avans pe rotație f",
    reset: "Restabilește valorile recomandate", result: "Rezultat", rpm: "Turația arborelui n", feed: "Viteza de avans vf",
    range: "Interval recomandat", gentle: "Prudent", start: "Valoare inițială", productive: "Productiv",
    toolSummary: "Sculă", materialSummary: "Material", perRev: "Avans/rot.", important: "Important:",
    warning: "Acestea sunt valori inițiale. Datele producătorului, mașina, fixarea, răcirea și stabilitatea piesei au prioritate.",
    language: "Alege limba",
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
  sv: {
    steel: "Konstruktionsstål / automatstål",
    stainless: "Rostfritt stål",
    cast: "Gråjärn",
    aluminium: "Aluminium",
    brass: "Mässing",
    copper: "Koppar",
    titanium: "Titan / titanlegering",
    plastic: "Plast",
  },
  tr: {
    steel: "Yapı çeliği / otomat çeliği",
    stainless: "Paslanmaz çelik",
    cast: "Gri dökme demir",
    aluminium: "Alüminyum",
    brass: "Pirinç",
    copper: "Bakır",
    titanium: "Titanyum / titanyum alaşımı",
    plastic: "Plastik",
  },
  es: {
    steel: "Acero estructural / acero de fácil mecanizado",
    stainless: "Acero inoxidable",
    cast: "Fundición gris",
    aluminium: "Aluminio",
    brass: "Latón",
    copper: "Cobre",
    titanium: "Titanio / aleación de titanio",
    plastic: "Plástico",
  },
  pt: {
    steel: "Aço estrutural / aço de corte fácil",
    stainless: "Aço inoxidável",
    cast: "Ferro fundido cinzento",
    aluminium: "Alumínio",
    brass: "Latão",
    copper: "Cobre",
    titanium: "Titânio / liga de titânio",
    plastic: "Plástico",
  },
  sq: {
    steel: "Çelik konstruksioni / çelik automatiku",
    stainless: "Çelik inox",
    cast: "Gizë gri",
    aluminium: "Alumin",
    brass: "Tunxh",
    copper: "Bakër",
    titanium: "Titan / aliazh titani",
    plastic: "Plastikë",
  },
  zh: {
    steel: "结构钢 / 易切削钢",
    stainless: "不锈钢",
    cast: "灰铸铁",
    aluminium: "铝",
    brass: "黄铜",
    copper: "铜",
    titanium: "钛 / 钛合金",
    plastic: "塑料",
  },
  ja: {
    steel: "構造用鋼 / 快削鋼",
    stainless: "ステンレス鋼",
    cast: "ねずみ鋳鉄",
    aluminium: "アルミニウム",
    brass: "黄銅",
    copper: "銅",
    titanium: "チタン / チタン合金",
    plastic: "プラスチック",
  },
  vi: {
    steel: "Thép kết cấu / thép dễ cắt",
    stainless: "Thép không gỉ",
    cast: "Gang xám",
    aluminium: "Nhôm",
    brass: "Đồng thau",
    copper: "Đồng",
    titanium: "Titan / hợp kim titan",
    plastic: "Nhựa",
  },
  fr: {
    steel: "Acier de construction / acier de décolletage",
    stainless: "Acier inoxydable",
    cast: "Fonte grise",
    aluminium: "Aluminium",
    brass: "Laiton",
    copper: "Cuivre",
    titanium: "Titane / alliage de titane",
    plastic: "Plastique",
  },
  ko: {
    steel: "구조용강 / 쾌삭강",
    stainless: "스테인리스강",
    cast: "회주철",
    aluminium: "알루미늄",
    brass: "황동",
    copper: "구리",
    titanium: "티타늄 / 티타늄 합금",
    plastic: "플라스틱",
  },
  it: { steel: "Acciaio da costruzione / automatico", stainless: "Acciaio inox", cast: "Ghisa grigia", aluminium: "Alluminio", brass: "Ottone", copper: "Rame", titanium: "Titanio / lega di titanio", plastic: "Plastica" },
  nl: { steel: "Constructiestaal / automatenstaal", stainless: "Roestvast staal", cast: "Grijs gietijzer", aluminium: "Aluminium", brass: "Messing", copper: "Koper", titanium: "Titanium / titaniumlegering", plastic: "Kunststof" },
  cs: { steel: "Konstrukční / automatová ocel", stainless: "Nerezová ocel", cast: "Šedá litina", aluminium: "Hliník", brass: "Mosaz", copper: "Měď", titanium: "Titan / titanová slitina", plastic: "Plast" },
  ro: { steel: "Oțel de construcții / pentru automate", stainless: "Oțel inoxidabil", cast: "Fontă cenușie", aluminium: "Aluminiu", brass: "Alamă", copper: "Cupru", titanium: "Titan / aliaj de titan", plastic: "Plastic" },
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
  sv: {
    "end-carbide": "Pinnfräs i solid hårdmetall",
    "end-hss": "HSS-pinnfräs",
    "slot-carbide": "Spårfräs i solid hårdmetall",
    "ball-carbide": "Kulfräs i solid hårdmetall",
    "face-carbide": "Planfräs med hårdmetallskär",
    "spot-carbide": "NC-centrumborr i solid hårdmetall",
    "center-hss": "HSS-centrumborr",
    "drill-carbide": "Spiralborr i solid hårdmetall",
    "drill-hss": "HSS-spiralborr",
    "drill-hssco": "HSS-Co-spiralborr",
    "countersink-hss": "HSS-försänkare 90°",
    "countersink-carbide": "Hårdmetallförsänkare 90°",
    "counterbore-hss": "HSS-planförsänkare med styrtapp",
    "reamer-hss": "HSS-maskinbrotsch",
    "reamer-carbide": "Maskinbrotsch i hårdmetall",
    "turn-rough": "Universellt hårdmetallverktyg för grovsvarvning",
    "turn-finish": "Hårdmetallverktyg för finsvarvning",
    "turn-fine": "Hårdmetallverktyg för finbearbetning",
    "turn-internal": "Hårdmetallverktyg för invändig svarvning",
    "turn-face": "Hårdmetallverktyg för plansvarvning",
    "turn-groove": "Hårdmetallverktyg för avstickning/spårstickning",
    "turn-thread-60": "Gängsvarvverktyg 60°",
    "turn-hss": "HSS-svarvverktyg",
  },
  tr: {
    "end-carbide": "Karbür parmak freze",
    "end-hss": "HSS parmak freze",
    "slot-carbide": "Karbür kanal frezesi",
    "ball-carbide": "Karbür küresel uçlu freze",
    "face-carbide": "Karbür uçlu alın frezesi",
    "spot-carbide": "Karbür NC punta matkabı",
    "center-hss": "HSS punta matkabı",
    "drill-carbide": "Karbür helisel matkap",
    "drill-hss": "HSS helisel matkap",
    "drill-hssco": "HSS-Co helisel matkap",
    "countersink-hss": "HSS 90° havşa",
    "countersink-carbide": "Karbür 90° havşa",
    "counterbore-hss": "Kılavuz pimli HSS silindirik havşa",
    "reamer-hss": "HSS makine raybası",
    "reamer-carbide": "Karbür makine raybası",
    "turn-rough": "Karbür üniversal kaba tornalama takımı",
    "turn-finish": "Karbür finiş tornalama takımı",
    "turn-fine": "Karbür hassas finiş tornalama takımı",
    "turn-internal": "Karbür iç tornalama takımı",
    "turn-face": "Karbür alın tornalama takımı",
    "turn-groove": "Karbür kesme/kanal açma takımı",
    "turn-thread-60": "60° diş açma takımı",
    "turn-hss": "HSS tornalama takımı",
  },
  es: {
    "end-carbide": "Fresa de mango de metal duro integral",
    "end-hss": "Fresa de mango HSS",
    "slot-carbide": "Fresa de ranurar de metal duro integral",
    "ball-carbide": "Fresa esférica de metal duro integral",
    "face-carbide": "Fresa de planear con plaquitas de metal duro",
    "spot-carbide": "Broca NC de puntear de metal duro integral",
    "center-hss": "Broca de centrar HSS",
    "drill-carbide": "Broca helicoidal de metal duro integral",
    "drill-hss": "Broca helicoidal HSS",
    "drill-hssco": "Broca helicoidal HSS-Co",
    "countersink-hss": "Avellanador HSS de 90°",
    "countersink-carbide": "Avellanador de metal duro de 90°",
    "counterbore-hss": "Avellanador cilíndrico HSS con guía",
    "reamer-hss": "Escariador de máquina HSS",
    "reamer-carbide": "Escariador de máquina de metal duro",
    "turn-rough": "Herramienta universal de desbaste de metal duro",
    "turn-finish": "Herramienta de acabado de metal duro",
    "turn-fine": "Herramienta de acabado fino de metal duro",
    "turn-internal": "Herramienta de mandrinar de metal duro",
    "turn-face": "Herramienta de refrentado de metal duro",
    "turn-groove": "Herramienta de tronzado/ranurado de metal duro",
    "turn-thread-60": "Herramienta de roscado de 60°",
    "turn-hss": "Herramienta de torneado HSS",
  },
  pt: {
    "end-carbide": "Fresa de topo de metal duro integral",
    "end-hss": "Fresa de topo HSS",
    "slot-carbide": "Fresa de ranhurar de metal duro integral",
    "ball-carbide": "Fresa esférica de metal duro integral",
    "face-carbide": "Fresa de facear com pastilhas de metal duro",
    "spot-carbide": "Broca NC de centrar de metal duro integral",
    "center-hss": "Broca de centrar HSS",
    "drill-carbide": "Broca helicoidal de metal duro integral",
    "drill-hss": "Broca helicoidal HSS",
    "drill-hssco": "Broca helicoidal HSS-Co",
    "countersink-hss": "Escareador HSS de 90°",
    "countersink-carbide": "Escareador de metal duro de 90°",
    "counterbore-hss": "Escareador cilíndrico HSS com guia",
    "reamer-hss": "Alargador de máquina HSS",
    "reamer-carbide": "Alargador de máquina de metal duro",
    "turn-rough": "Ferramenta universal de desbaste de metal duro",
    "turn-finish": "Ferramenta de acabamento de metal duro",
    "turn-fine": "Ferramenta de acabamento fino de metal duro",
    "turn-internal": "Ferramenta de mandrilar de metal duro",
    "turn-face": "Ferramenta de facear de metal duro",
    "turn-groove": "Ferramenta de corte/ranhurar de metal duro",
    "turn-thread-60": "Ferramenta de roscar de 60°",
    "turn-hss": "Ferramenta de torneamento HSS",
  },
  sq: {
    "end-carbide": "Frezë cilindrike prej karbidi të plotë",
    "end-hss": "Frezë cilindrike HSS",
    "slot-carbide": "Frezë kanalesh prej karbidi të plotë",
    "ball-carbide": "Frezë sferike prej karbidi të plotë",
    "face-carbide": "Frezë ballore me pllaka karbidi",
    "spot-carbide": "Punto NC prej karbidi të plotë",
    "center-hss": "Punto qendruese HSS",
    "drill-carbide": "Trapan spiral prej karbidi të plotë",
    "drill-hss": "Trapan spiral HSS",
    "drill-hssco": "Trapan spiral HSS-Co",
    "countersink-hss": "Freza konike HSS 90°",
    "countersink-carbide": "Freza konike prej karbidi 90°",
    "counterbore-hss": "Freza cilindrike HSS me udhëzues",
    "reamer-hss": "Alezator makine HSS",
    "reamer-carbide": "Alezator makine prej karbidi",
    "turn-rough": "Thikë universale karbidi për tornim të ashpër",
    "turn-finish": "Thikë karbidi për tornim përfundimtar",
    "turn-fine": "Thikë karbidi për përfundim të imët",
    "turn-internal": "Thikë karbidi për tornim të brendshëm",
    "turn-face": "Thikë karbidi për tornim ballor",
    "turn-groove": "Thikë karbidi për prerje/kanale",
    "turn-thread-60": "Thikë filetimi 60°",
    "turn-hss": "Thikë tornimi HSS",
  },
  zh: {
    "end-carbide": "整体硬质合金立铣刀",
    "end-hss": "HSS 高速钢立铣刀",
    "slot-carbide": "整体硬质合金槽铣刀",
    "ball-carbide": "整体硬质合金球头铣刀",
    "face-carbide": "硬质合金可转位面铣刀",
    "spot-carbide": "整体硬质合金 NC 定位钻",
    "center-hss": "HSS 高速钢中心钻",
    "drill-carbide": "整体硬质合金麻花钻",
    "drill-hss": "HSS 高速钢麻花钻",
    "drill-hssco": "HSS-Co 含钴高速钢麻花钻",
    "countersink-hss": "HSS 高速钢 90° 锥面锪钻",
    "countersink-carbide": "硬质合金 90° 锥面锪钻",
    "counterbore-hss": "HSS 高速钢带导柱平底锪钻",
    "reamer-hss": "HSS 高速钢机用铰刀",
    "reamer-carbide": "硬质合金机用铰刀",
    "turn-rough": "硬质合金通用粗车刀",
    "turn-finish": "硬质合金精车刀",
    "turn-fine": "硬质合金超精车刀",
    "turn-internal": "硬质合金内孔车刀",
    "turn-face": "硬质合金端面车刀",
    "turn-groove": "硬质合金切断/切槽刀",
    "turn-thread-60": "60° 螺纹车刀",
    "turn-hss": "HSS 高速钢车刀",
  },
  ja: {
    "end-carbide": "超硬ソリッドエンドミル",
    "end-hss": "HSSエンドミル",
    "slot-carbide": "超硬ソリッド溝フライス",
    "ball-carbide": "超硬ソリッドボールエンドミル",
    "face-carbide": "超硬チップ式正面フライス",
    "spot-carbide": "超硬ソリッドNCスポットドリル",
    "center-hss": "HSSセンタードリル",
    "drill-carbide": "超硬ソリッドツイストドリル",
    "drill-hss": "HSSツイストドリル",
    "drill-hssco": "HSS-Coコバルトツイストドリル",
    "countersink-hss": "HSS 90°皿もみカッター",
    "countersink-carbide": "超硬90°皿もみカッター",
    "counterbore-hss": "HSSパイロット付き座ぐりカッター",
    "reamer-hss": "HSSマシンリーマ",
    "reamer-carbide": "超硬マシンリーマ",
    "turn-rough": "超硬汎用荒加工バイト",
    "turn-finish": "超硬仕上げバイト",
    "turn-fine": "超硬精密仕上げバイト",
    "turn-internal": "超硬内径バイト",
    "turn-face": "超硬端面バイト",
    "turn-groove": "超硬突切り・溝入れバイト",
    "turn-thread-60": "60°ねじ切りバイト",
    "turn-hss": "HSS旋削バイト",
  },
  vi: {
    "end-carbide": "Dao phay ngón carbide nguyên khối",
    "end-hss": "Dao phay ngón HSS",
    "slot-carbide": "Dao phay rãnh carbide nguyên khối",
    "ball-carbide": "Dao phay cầu carbide nguyên khối",
    "face-carbide": "Dao phay mặt gắn mảnh carbide",
    "spot-carbide": "Mũi khoan định tâm NC carbide nguyên khối",
    "center-hss": "Mũi khoan tâm HSS",
    "drill-carbide": "Mũi khoan xoắn carbide nguyên khối",
    "drill-hss": "Mũi khoan xoắn HSS",
    "drill-hssco": "Mũi khoan xoắn HSS-Co",
    "countersink-hss": "Mũi vát mép HSS 90°",
    "countersink-carbide": "Mũi vát mép carbide 90°",
    "counterbore-hss": "Dao khoét bậc HSS có chốt dẫn hướng",
    "reamer-hss": "Dao doa máy HSS",
    "reamer-carbide": "Dao doa máy carbide",
    "turn-rough": "Dao tiện thô carbide đa năng",
    "turn-finish": "Dao tiện tinh carbide",
    "turn-fine": "Dao tiện siêu tinh carbide",
    "turn-internal": "Dao tiện lỗ carbide",
    "turn-face": "Dao tiện mặt đầu carbide",
    "turn-groove": "Dao cắt đứt / tiện rãnh carbide",
    "turn-thread-60": "Dao tiện ren 60°",
    "turn-hss": "Dao tiện HSS",
  },
  fr: {
    "end-carbide": "Fraise cylindrique carbure monobloc",
    "end-hss": "Fraise cylindrique HSS",
    "slot-carbide": "Fraise à rainurer carbure monobloc",
    "ball-carbide": "Fraise boule carbure monobloc",
    "face-carbide": "Fraise à surfacer à plaquettes carbure",
    "spot-carbide": "Foret à pointer NC carbure monobloc",
    "center-hss": "Foret à centrer HSS",
    "drill-carbide": "Foret hélicoïdal carbure monobloc",
    "drill-hss": "Foret hélicoïdal HSS",
    "drill-hssco": "Foret hélicoïdal HSS-Co",
    "countersink-hss": "Fraise à chanfreiner HSS 90°",
    "countersink-carbide": "Fraise à chanfreiner carbure 90°",
    "counterbore-hss": "Lamage HSS avec pilote",
    "reamer-hss": "Alésoir machine HSS",
    "reamer-carbide": "Alésoir machine carbure",
    "turn-rough": "Outil de tournage d’ébauche universel carbure",
    "turn-finish": "Outil de tournage de finition carbure",
    "turn-fine": "Outil de tournage de superfinition carbure",
    "turn-internal": "Outil d’alésage carbure",
    "turn-face": "Outil à dresser carbure",
    "turn-groove": "Outil à tronçonner / rainurer carbure",
    "turn-thread-60": "Outil de filetage 60°",
    "turn-hss": "Outil de tournage HSS",
  },
  ko: {
    "end-carbide": "초경 솔리드 엔드밀",
    "end-hss": "HSS 엔드밀",
    "slot-carbide": "초경 솔리드 슬롯 밀",
    "ball-carbide": "초경 솔리드 볼 엔드밀",
    "face-carbide": "초경 인서트 페이스 밀",
    "spot-carbide": "초경 솔리드 NC 스폿 드릴",
    "center-hss": "HSS 센터 드릴",
    "drill-carbide": "초경 솔리드 트위스트 드릴",
    "drill-hss": "HSS 트위스트 드릴",
    "drill-hssco": "HSS-Co 코발트 트위스트 드릴",
    "countersink-hss": "HSS 90° 카운터싱크",
    "countersink-carbide": "초경 90° 카운터싱크",
    "counterbore-hss": "가이드 핀형 HSS 카운터보어",
    "reamer-hss": "HSS 머신 리머",
    "reamer-carbide": "초경 머신 리머",
    "turn-rough": "초경 범용 황삭 바이트",
    "turn-finish": "초경 정삭 바이트",
    "turn-fine": "초경 초정밀 정삭 바이트",
    "turn-internal": "초경 내경 바이트",
    "turn-face": "초경 단면 바이트",
    "turn-groove": "초경 절단 / 홈가공 바이트",
    "turn-thread-60": "60° 나사 가공 바이트",
    "turn-hss": "HSS 선삭 바이트",
  },
  it: {
    "end-carbide": "Fresa cilindrica in metallo duro integrale", "end-hss": "Fresa cilindrica HSS",
    "slot-carbide": "Fresa per cave in metallo duro integrale", "ball-carbide": "Fresa sferica in metallo duro integrale",
    "face-carbide": "Fresa a spianare con inserti in metallo duro", "spot-carbide": "Punta NC in metallo duro integrale",
    "center-hss": "Punta da centro HSS", "drill-carbide": "Punta elicoidale in metallo duro integrale",
    "drill-hss": "Punta elicoidale HSS", "drill-hssco": "Punta elicoidale HSS-Co",
    "countersink-hss": "Svasatore HSS 90°", "countersink-carbide": "Svasatore in metallo duro 90°",
    "counterbore-hss": "Lamatura HSS con guida", "reamer-hss": "Alesatore a macchina HSS",
    "reamer-carbide": "Alesatore a macchina in metallo duro", "turn-rough": "Utensile universale da sgrossatura in metallo duro",
    "turn-finish": "Utensile da finitura in metallo duro", "turn-fine": "Utensile da superfinitura in metallo duro",
    "turn-internal": "Utensile per tornitura interna in metallo duro", "turn-face": "Utensile per sfacciatura in metallo duro",
    "turn-groove": "Utensile da troncatura / scanalatura in metallo duro", "turn-thread-60": "Utensile per filettatura 60°",
    "turn-hss": "Utensile da tornitura HSS",
  },
  nl: {
    "end-carbide": "Volhardmetalen schachtfrees", "end-hss": "HSS-schachtfrees",
    "slot-carbide": "Volhardmetalen spiebaanfrees", "ball-carbide": "Volhardmetalen kogelfrees",
    "face-carbide": "Vlakfrees met hardmetalen wisselplaten", "spot-carbide": "Volhardmetalen NC-aanboor",
    "center-hss": "HSS-centerboor", "drill-carbide": "Volhardmetalen spiraalboor",
    "drill-hss": "HSS-spiraalboor", "drill-hssco": "HSS-Co-spiraalboor",
    "countersink-hss": "HSS-verzinkboor 90°", "countersink-carbide": "Hardmetalen verzinkboor 90°",
    "counterbore-hss": "HSS-vlakverzinkboor met geleidepen", "reamer-hss": "HSS-machineruimer",
    "reamer-carbide": "Hardmetalen machineruimer", "turn-rough": "Universele hardmetalen voordraaibeitel",
    "turn-finish": "Hardmetalen nadraaibeitel", "turn-fine": "Hardmetalen fijnnadraaibeitel",
    "turn-internal": "Hardmetalen binnenbeitel", "turn-face": "Hardmetalen vlakbeitel",
    "turn-groove": "Hardmetalen afsteek- / groefbeitel", "turn-thread-60": "60° schroefdraadbeitel",
    "turn-hss": "HSS-draaibeitel",
  },
  cs: {
    "end-carbide": "Monolitní karbidová stopková fréza", "end-hss": "Stopková fréza HSS",
    "slot-carbide": "Monolitní karbidová drážkovací fréza", "ball-carbide": "Monolitní karbidová kulová fréza",
    "face-carbide": "Čelní fréza s karbidovými destičkami", "spot-carbide": "Monolitní karbidový NC navrtávák",
    "center-hss": "Středicí vrták HSS", "drill-carbide": "Monolitní karbidový spirálový vrták",
    "drill-hss": "Spirálový vrták HSS", "drill-hssco": "Spirálový vrták HSS-Co",
    "countersink-hss": "Kuželový záhlubník HSS 90°", "countersink-carbide": "Karbidový kuželový záhlubník 90°",
    "counterbore-hss": "Válcový záhlubník HSS s vodicím čepem", "reamer-hss": "Strojní výstružník HSS",
    "reamer-carbide": "Karbidový strojní výstružník", "turn-rough": "Univerzální karbidový hrubovací soustružnický nůž",
    "turn-finish": "Karbidový dokončovací soustružnický nůž", "turn-fine": "Karbidový jemný dokončovací nůž",
    "turn-internal": "Karbidový vnitřní soustružnický nůž", "turn-face": "Karbidový čelní soustružnický nůž",
    "turn-groove": "Karbidový upichovací / zapichovací nůž", "turn-thread-60": "Závitový nůž 60°", "turn-hss": "Soustružnický nůž HSS",
  },
  ro: {
    "end-carbide": "Freză cilindro-frontală din carbură monobloc", "end-hss": "Freză cilindro-frontală HSS",
    "slot-carbide": "Freză de canelat din carbură monobloc", "ball-carbide": "Freză sferică din carbură monobloc",
    "face-carbide": "Freză frontală cu plăcuțe din carbură", "spot-carbide": "Burghiu NC de punctare din carbură monobloc",
    "center-hss": "Burghiu de centrare HSS", "drill-carbide": "Burghiu elicoidal din carbură monobloc",
    "drill-hss": "Burghiu elicoidal HSS", "drill-hssco": "Burghiu elicoidal HSS-Co",
    "countersink-hss": "Teșitor HSS 90°", "countersink-carbide": "Teșitor din carbură 90°",
    "counterbore-hss": "Lărgitor cilindric HSS cu ghidaj", "reamer-hss": "Alezor de mașină HSS",
    "reamer-carbide": "Alezor de mașină din carbură", "turn-rough": "Cuțit universal de degroșare din carbură",
    "turn-finish": "Cuțit de finisare din carbură", "turn-fine": "Cuțit de superfinisare din carbură",
    "turn-internal": "Cuțit de strunjire interioară din carbură", "turn-face": "Cuțit de planare din carbură",
    "turn-groove": "Cuțit de retezare / canelare din carbură", "turn-thread-60": "Cuțit de filetat 60°", "turn-hss": "Cuțit de strung HSS",
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
  sv: {
    Fräser: "Fräsverktyg",
    Bohrer: "Borr",
    Senker: "Försänkare",
    Reibahle: "Brotsch",
    Drehmeißel: "Svarvverktyg",
  },
  tr: {
    Fräser: "Freze",
    Bohrer: "Matkap",
    Senker: "Havşa",
    Reibahle: "Rayba",
    Drehmeißel: "Tornalama takımı",
  },
  es: {
    Fräser: "Fresa",
    Bohrer: "Broca",
    Senker: "Avellanador",
    Reibahle: "Escariador",
    Drehmeißel: "Herramienta de torneado",
  },
  pt: {
    Fräser: "Fresa",
    Bohrer: "Broca",
    Senker: "Escareador",
    Reibahle: "Alargador",
    Drehmeißel: "Ferramenta de torneamento",
  },
  sq: {
    Fräser: "Frezë",
    Bohrer: "Trapan",
    Senker: "Freza konike",
    Reibahle: "Alezator",
    Drehmeißel: "Thikë tornimi",
  },
  zh: {
    Fräser: "铣刀",
    Bohrer: "钻头",
    Senker: "锪钻",
    Reibahle: "铰刀",
    Drehmeißel: "车刀",
  },
  ja: {
    Fräser: "フライス工具",
    Bohrer: "ドリル",
    Senker: "皿もみ工具",
    Reibahle: "リーマ",
    Drehmeißel: "旋削バイト",
  },
  vi: {
    Fräser: "Dao phay",
    Bohrer: "Mũi khoan",
    Senker: "Mũi vát mép",
    Reibahle: "Dao doa",
    Drehmeißel: "Dao tiện",
  },
  fr: {
    Fräser: "Fraise",
    Bohrer: "Foret",
    Senker: "Fraise à chanfreiner",
    Reibahle: "Alésoir",
    Drehmeißel: "Outil de tournage",
  },
  ko: {
    Fräser: "밀링 공구",
    Bohrer: "드릴",
    Senker: "카운터싱크",
    Reibahle: "리머",
    Drehmeißel: "선삭 바이트",
  },
  it: { Fräser: "Fresa", Bohrer: "Punta", Senker: "Svasatore", Reibahle: "Alesatore", Drehmeißel: "Utensile da tornitura" },
  nl: { Fräser: "Frees", Bohrer: "Boor", Senker: "Verzinkboor", Reibahle: "Ruimer", Drehmeißel: "Draaibeitel" },
  cs: { Fräser: "Fréza", Bohrer: "Vrták", Senker: "Záhlubník", Reibahle: "Výstružník", Drehmeißel: "Soustružnický nůž" },
  ro: { Fräser: "Freză", Bohrer: "Burghiu", Senker: "Teșitor", Reibahle: "Alezor", Drehmeißel: "Cuțit de strung" },
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
  sv: {
    "turn-rough": "Grovsvarvning",
    "turn-finish": "Finsvarvning",
    "turn-fine": "Finbearbetning / kontursvarvning",
    "turn-internal": "Invändig svarvning",
    "turn-face": "Plansvarvning",
    "turn-groove": "Avstickning / spårstickning",
    "turn-thread-60": "Metrisk gänga",
  },
  tr: {
    "turn-rough": "Kaba tornalama",
    "turn-finish": "Finiş tornalama",
    "turn-fine": "Hassas finiş / kontur tornalama",
    "turn-internal": "İç tornalama",
    "turn-face": "Alın tornalama",
    "turn-groove": "Kesme / kanal açma",
    "turn-thread-60": "Metrik diş",
  },
  es: {
    "turn-rough": "Desbaste",
    "turn-finish": "Acabado",
    "turn-fine": "Acabado fino / contorneado",
    "turn-internal": "Torneado interior",
    "turn-face": "Refrentado",
    "turn-groove": "Tronzado / ranurado",
    "turn-thread-60": "Rosca métrica",
  },
  pt: {
    "turn-rough": "Desbaste",
    "turn-finish": "Acabamento",
    "turn-fine": "Acabamento fino / contorno",
    "turn-internal": "Torneamento interior",
    "turn-face": "Faceamento",
    "turn-groove": "Corte / ranhuramento",
    "turn-thread-60": "Rosca métrica",
  },
  sq: {
    "turn-rough": "Tornim i ashpër",
    "turn-finish": "Tornim përfundimtar",
    "turn-fine": "Përfundim i imët / konturim",
    "turn-internal": "Tornim i brendshëm",
    "turn-face": "Tornim ballor",
    "turn-groove": "Prerje / kanalizim",
    "turn-thread-60": "Filetë metrike",
  },
  zh: {
    "turn-rough": "粗车",
    "turn-finish": "精车",
    "turn-fine": "超精车 / 轮廓加工",
    "turn-internal": "内孔车削",
    "turn-face": "端面车削",
    "turn-groove": "切断 / 切槽",
    "turn-thread-60": "公制螺纹",
  },
  ja: {
    "turn-rough": "荒加工",
    "turn-finish": "仕上げ加工",
    "turn-fine": "精密仕上げ / 輪郭加工",
    "turn-internal": "内径加工",
    "turn-face": "端面加工",
    "turn-groove": "突切り / 溝入れ",
    "turn-thread-60": "メートルねじ",
  },
  vi: {
    "turn-rough": "Tiện thô",
    "turn-finish": "Tiện tinh",
    "turn-fine": "Tiện siêu tinh / biên dạng",
    "turn-internal": "Tiện lỗ",
    "turn-face": "Tiện mặt đầu",
    "turn-groove": "Cắt đứt / tiện rãnh",
    "turn-thread-60": "Ren hệ mét",
  },
  fr: {
    "turn-rough": "Ébauche",
    "turn-finish": "Finition",
    "turn-fine": "Superfinition / contournage",
    "turn-internal": "Alésage",
    "turn-face": "Dressage",
    "turn-groove": "Tronçonnage / rainurage",
    "turn-thread-60": "Filetage métrique",
  },
  ko: {
    "turn-rough": "황삭",
    "turn-finish": "정삭",
    "turn-fine": "초정밀 정삭 / 윤곽 가공",
    "turn-internal": "내경 가공",
    "turn-face": "단면 가공",
    "turn-groove": "절단 / 홈가공",
    "turn-thread-60": "미터 나사",
  },
  it: { "turn-rough": "Sgrossatura", "turn-finish": "Finitura", "turn-fine": "Superfinitura / contornatura", "turn-internal": "Tornitura interna", "turn-face": "Sfacciatura", "turn-groove": "Troncatura / scanalatura", "turn-thread-60": "Filettatura metrica" },
  nl: { "turn-rough": "Voordraaien", "turn-finish": "Nadraaien", "turn-fine": "Fijnnadraaien / contouren", "turn-internal": "Binnendraaien", "turn-face": "Vlakdraaien", "turn-groove": "Afsteken / groefsteken", "turn-thread-60": "Metrische schroefdraad" },
  cs: { "turn-rough": "Hrubování", "turn-finish": "Dokončování", "turn-fine": "Jemné dokončování / konturování", "turn-internal": "Vnitřní soustružení", "turn-face": "Čelní soustružení", "turn-groove": "Upichování / zapichování", "turn-thread-60": "Metrický závit" },
  ro: { "turn-rough": "Degroșare", "turn-finish": "Finisare", "turn-fine": "Superfinisare / conturare", "turn-internal": "Strunjire interioară", "turn-face": "Planare", "turn-groove": "Retezare / canelare", "turn-thread-60": "Filet metric" },
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
    languageSearch: "Sprache suchen …",
    noLanguage: "Keine Sprache gefunden.",
    cameraRequired: "Kamerazugriff erforderlich",
    cameraPrivacy:
      "Die Kamera wird nur zum Erkennen des Werkzeugcodes verwendet. Es werden keine Bilder gespeichert oder hochgeladen.",
    cameraAllow: "Kamera erlauben",
    cameraStarting: "Kamera wird geöffnet …",
    cameraRetry: "Erneut versuchen",
    cameraError: "Kamerazugriff wurde abgelehnt oder ist nicht verfügbar.",
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
    languageSearch: "Search language …",
    noLanguage: "No language found.",
    cameraRequired: "Camera access required",
    cameraPrivacy:
      "The camera is used only to read the tool code. No images are stored or uploaded.",
    cameraAllow: "Allow camera",
    cameraStarting: "Starting camera …",
    cameraRetry: "Try again",
    cameraError: "Camera access was denied or is unavailable.",
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
    languageSearch: "Поиск языка …",
    noLanguage: "Язык не найден.",
    cameraRequired: "Требуется доступ к камере",
    cameraPrivacy:
      "Камера используется только для распознавания кода. Изображения не сохраняются и не загружаются.",
    cameraAllow: "Разрешить камеру",
    cameraStarting: "Камера запускается …",
    cameraRetry: "Повторить",
    cameraError: "Доступ к камере отклонён или недоступен.",
  },
  sv: {
    toolHelp:
      "Skriv ett verktygsnamn eller en grupp, till exempel fräs, försänkare eller svarvverktyg.",
    toolPlaceholder: "t.ex. borr, försänkare, svarvverktyg …",
    noTool: "Inget verktyg hittades.",
    materialHelp:
      "Materialet bestämmer det rekommenderade intervallet för skärhastigheten.",
    partDiameterHelp:
      "Vid svarvning anger du diametern som bearbetas just nu.",
    toolDiameterHelp: "Verktygets verksamma diameter vid skäreggen.",
    teethHelp:
      "Antalet skäreggar som används för att beräkna den totala matningen.",
    oldMachine: "Äldre maskin ×0,5",
    oldMachineCopy: "Halverar skärhastighet och matning",
    rpmLimit: "Använd varvtalsgräns",
    rpmLimitCopy: "Maskinens tekniska maxgräns",
    rpmHelp:
      "Endast en teknisk övre gräns – inget målvärde. Det ursprungliga rekommenderade intervallet visas fortfarande.",
    scanner: "Skanna verktygskod",
    scannerCopy: "Öppna demoskannern med ett exempelverktyg",
    scanTitle: "Skanna verktygskod",
    scanDescription:
      "Prototyp: testkoden simulerar en kod på en verktygsförpackning.",
    camera: "Rikta kameran mot en QR- eller Data Matrix-kod",
    scanDemo: "Skanna demokod",
    recognized: "Demoverktyget har identifierats",
    demoWarning: "Testdata – inte verkliga tillverkardata",
    manufacturer: "Tillverkare",
    article: "Artikelnummer",
    toolName: "Verktyg",
    steel: "Stål",
    aluminium: "Aluminium",
    titanium: "Titan",
    oldActive:
      "Läget för äldre maskin är aktivt: importerade värden halveras.",
    import: "Använd tillverkarens värden",
    gradeHelp:
      "Du kan välja en exakt kvalitet för att anpassa startvärdet. Annars används materialets allmänna standard.",
    operation: "Användning",
    profile: "Skärdataprofil",
    profileGroove: "Försiktig · stabilitet först",
    profileFine: "Högre skärhastighet · låg matning",
    profileRough: "Hög belastningstålighet · högre matning",
    balanced: "Balanserad",
    turnNote:
      "Skärsort, geometri, utstick och kylning kan påverka värdena avsevärt. Därför visar kalkylatorn ett försiktigt startintervall.",
    pitch: "Gängstigning P",
    pitchHelp:
      "Vid gängsvarvning måste matningen per varv exakt motsvara gängstigningen.",
    speedHelp:
      "Skäreggens hastighet i förhållande till materialet. Tillverkarens uppgifter har företräde.",
    feedMillHelp:
      "Förflyttning per skäregg. Kalkylatorn multiplicerar fz med varvtalet och antalet skär.",
    feedRevHelp:
      "Verktygets förflyttning per helt spindelvarv, som används för att beräkna mm/min.",
    withoutLimit: "utan maskingräns",
    limitedTo: "Begränsad till",
    calculated: "Beräknat",
    actual: "faktiskt",
    limitIsNotTarget: "Maskinens maxvarvtal är en gräns, inte ett mål.",
    helpAria: "Visa förklaring",
    languageSearch: "Sök språk …",
    noLanguage: "Inget språk hittades.",
    cameraRequired: "Kameraåtkomst krävs",
    cameraPrivacy:
      "Kameran används endast för att läsa verktygskoden. Inga bilder sparas eller laddas upp.",
    cameraAllow: "Tillåt kamera",
    cameraStarting: "Kameran startas …",
    cameraRetry: "Försök igen",
    cameraError: "Kameraåtkomst nekades eller är inte tillgänglig.",
  },
  tr: {
    toolHelp:
      "Freze, havşa veya tornalama takımı gibi bir takım adı ya da grubu yazın.",
    toolPlaceholder: "örn. matkap, havşa, tornalama takımı …",
    noTool: "Takım bulunamadı.",
    materialHelp:
      "Malzeme, önerilen kesme hızı aralığını belirler.",
    partDiameterHelp:
      "Tornalamada o anda işlenen iş parçası çapını girin.",
    toolDiameterHelp: "Kesme bölgesindeki etkin takım çapı.",
    teethHelp:
      "Toplam ilerleme hızını hesaplamak için kullanılan kesici kenar sayısı.",
    oldMachine: "Eski makine ×0,5",
    oldMachineCopy: "Kesme hızını ve ilerlemeyi yarıya indirir",
    rpmLimit: "Devir sınırını kullan",
    rpmLimitCopy: "Makinenin teknik üst sınırı",
    rpmHelp:
      "Yalnızca teknik bir üst sınırdır, hedef değer değildir. Asıl öneri aralığı görünür kalır.",
    scanner: "Takım kodunu tara",
    scannerCopy: "Örnek takımla demo tarayıcıyı aç",
    scanTitle: "Takım kodunu tara",
    scanDescription:
      "Prototip: test kodu, takım ambalajındaki bir kodu simüle eder.",
    camera: "Kamerayı QR veya Data Matrix koduna doğrultun",
    scanDemo: "Demo kodunu tara",
    recognized: "Demo takım tanındı",
    demoWarning: "Test verisi – gerçek üretici verisi değildir",
    manufacturer: "Üretici",
    article: "Ürün numarası",
    toolName: "Takım",
    steel: "Çelik",
    aluminium: "Alüminyum",
    titanium: "Titanyum",
    oldActive:
      "Eski makine modu etkin: içe aktarılan değerler yarıya indirilecektir.",
    import: "Üretici değerlerini kullan",
    gradeHelp:
      "İsterseniz başlangıç değerini uyarlamak için kesin kaliteyi seçin. Aksi halde genel malzeme standardı kullanılır.",
    operation: "Uygulama",
    profile: "Kesme verisi profili",
    profileGroove: "Temkinli · önce kararlılık",
    profileFine: "Daha yüksek kesme hızı · düşük ilerleme",
    profileRough: "Yüksek yük kapasitesi · daha yüksek ilerleme",
    balanced: "Dengeli",
    turnNote:
      "Uç kalitesi, geometri, takım çıkıntısı ve soğutma değerleri önemli ölçüde değiştirebilir. Bu nedenle hesaplayıcı temkinli bir başlangıç aralığı gösterir.",
    pitch: "Diş adımı P",
    pitchHelp:
      "Diş tornalamada devir başına ilerleme, diş adımına tam olarak eşit olmalıdır.",
    speedHelp:
      "Kesici kenarın malzemeye göre hızı. Üretici verileri önceliklidir.",
    feedMillHelp:
      "Kesici kenar başına hareket. Hesaplayıcı fz değerini devir ve kesici sayısıyla çarpar.",
    feedRevHelp:
      "Bir tam iş mili devrindeki takım hareketidir ve mm/dk hesabında kullanılır.",
    withoutLimit: "makine sınırı olmadan",
    limitedTo: "Sınırlandırıldı:",
    calculated: "Hesaplanan",
    actual: "gerçek",
    limitIsNotTarget: "Makinenin maksimum devri bir sınırdır, hedef değildir.",
    helpAria: "Açıklamayı göster",
    languageSearch: "Dil ara …",
    noLanguage: "Dil bulunamadı.",
    cameraRequired: "Kamera erişimi gerekli",
    cameraPrivacy:
      "Kamera yalnızca takım kodunu okumak için kullanılır. Hiçbir görüntü kaydedilmez veya yüklenmez.",
    cameraAllow: "Kameraya izin ver",
    cameraStarting: "Kamera başlatılıyor …",
    cameraRetry: "Tekrar dene",
    cameraError: "Kamera erişimi reddedildi veya kullanılamıyor.",
  },
  es: {
    toolHelp:
      "Escriba el nombre o grupo de una herramienta, por ejemplo fresa, avellanador o herramienta de torneado.",
    toolPlaceholder: "p. ej., broca, avellanador, herramienta de torneado …",
    noTool: "No se ha encontrado ninguna herramienta.",
    materialHelp:
      "El material determina el intervalo recomendado de velocidad de corte.",
    partDiameterHelp:
      "En torneado, introduzca el diámetro que se está mecanizando actualmente.",
    toolDiameterHelp: "Diámetro efectivo de la herramienta en el filo de corte.",
    teethHelp:
      "Número de filos utilizado para calcular la velocidad de avance total.",
    oldMachine: "Máquina antigua ×0,5",
    oldMachineCopy: "Reduce a la mitad la velocidad de corte y el avance",
    rpmLimit: "Usar límite de revoluciones",
    rpmLimitCopy: "Límite técnico de la máquina",
    rpmHelp:
      "Es solo un límite técnico superior, no un objetivo. El intervalo recomendado original permanece visible.",
    scanner: "Escanear código de herramienta",
    scannerCopy: "Abrir el escáner de demostración con una herramienta de ejemplo",
    scanTitle: "Escanear código de herramienta",
    scanDescription:
      "Prototipo: el código de prueba simula un código en el embalaje de una herramienta.",
    camera: "Apunte la cámara a un código QR o Data Matrix",
    scanDemo: "Escanear código de demostración",
    recognized: "Herramienta de demostración reconocida",
    demoWarning: "Datos de prueba, no son datos reales del fabricante",
    manufacturer: "Fabricante",
    article: "Número de artículo",
    toolName: "Herramienta",
    steel: "Acero",
    aluminium: "Aluminio",
    titanium: "Titanio",
    oldActive:
      "El modo de máquina antigua está activo: los valores importados se reducirán a la mitad.",
    import: "Usar valores del fabricante",
    gradeHelp:
      "Opcionalmente, seleccione una calidad exacta. En caso contrario se utiliza el estándar general del material.",
    operation: "Aplicación",
    profile: "Perfil de datos de corte",
    profileGroove: "Conservador · estabilidad primero",
    profileFine: "Mayor velocidad de corte · avance bajo",
    profileRough: "Alta capacidad de carga · mayor avance",
    balanced: "Equilibrado",
    turnNote:
      "La calidad de la plaquita, la geometría, el voladizo y la refrigeración pueden cambiar considerablemente los valores. Por eso se muestra un intervalo inicial prudente.",
    pitch: "Paso de rosca P",
    pitchHelp:
      "Al roscar en el torno, el avance por revolución debe coincidir exactamente con el paso de la rosca.",
    speedHelp:
      "Velocidad del filo respecto al material. Los datos del fabricante tienen prioridad.",
    feedMillHelp:
      "Recorrido por filo. El cálculo multiplica fz por las revoluciones y el número de dientes.",
    feedRevHelp:
      "Recorrido de la herramienta por cada revolución completa del husillo para calcular mm/min.",
    withoutLimit: "sin límite de máquina",
    limitedTo: "Limitado a",
    calculated: "Calculado",
    actual: "real",
    limitIsNotTarget: "El máximo de la máquina es un límite, no un objetivo.",
    helpAria: "Mostrar explicación",
    languageSearch: "Buscar idioma …",
    noLanguage: "No se ha encontrado ningún idioma.",
    cameraRequired: "Se requiere acceso a la cámara",
    cameraPrivacy:
      "La cámara solo se utiliza para leer el código de la herramienta. No se guardan ni se suben imágenes.",
    cameraAllow: "Permitir cámara",
    cameraStarting: "Iniciando cámara …",
    cameraRetry: "Intentar de nuevo",
    cameraError: "El acceso a la cámara fue rechazado o no está disponible.",
  },
  pt: {
    toolHelp:
      "Introduza o nome ou grupo de uma ferramenta, por exemplo fresa, escareador ou ferramenta de torneamento.",
    toolPlaceholder: "por ex., broca, escareador, ferramenta de torneamento …",
    noTool: "Nenhuma ferramenta encontrada.",
    materialHelp:
      "O material determina o intervalo recomendado da velocidade de corte.",
    partDiameterHelp:
      "No torneamento, introduza o diâmetro que está a ser maquinado.",
    toolDiameterHelp: "Diâmetro efetivo da ferramenta na aresta de corte.",
    teethHelp:
      "Número de arestas de corte utilizado para calcular o avanço total.",
    oldMachine: "Máquina antiga ×0,5",
    oldMachineCopy: "Reduz para metade a velocidade de corte e o avanço",
    rpmLimit: "Usar limite de rotação",
    rpmLimitCopy: "Limite técnico da máquina",
    rpmHelp:
      "Apenas um limite técnico superior, não um valor-alvo. O intervalo recomendado original continua visível.",
    scanner: "Ler código da ferramenta",
    scannerCopy: "Abrir o leitor de demonstração com uma ferramenta de exemplo",
    scanTitle: "Ler código da ferramenta",
    scanDescription:
      "Protótipo: o código de teste simula um código na embalagem de uma ferramenta.",
    camera: "Aponte a câmara para um código QR ou Data Matrix",
    scanDemo: "Ler código de demonstração",
    recognized: "Ferramenta de demonstração reconhecida",
    demoWarning: "Dados de teste, não são dados reais do fabricante",
    manufacturer: "Fabricante",
    article: "Número do artigo",
    toolName: "Ferramenta",
    steel: "Aço",
    aluminium: "Alumínio",
    titanium: "Titânio",
    oldActive:
      "O modo de máquina antiga está ativo: os valores importados serão reduzidos para metade.",
    import: "Usar valores do fabricante",
    gradeHelp:
      "Opcionalmente, selecione uma classe exata. Caso contrário, é utilizado o padrão geral do material.",
    operation: "Aplicação",
    profile: "Perfil de dados de corte",
    profileGroove: "Conservador · estabilidade primeiro",
    profileFine: "Maior velocidade de corte · avanço baixo",
    profileRough: "Elevada capacidade de carga · maior avanço",
    balanced: "Equilibrado",
    turnNote:
      "A classe da pastilha, a geometria, o balanço e a refrigeração podem alterar bastante os valores. Por isso, é apresentado um intervalo inicial prudente.",
    pitch: "Passo da rosca P",
    pitchHelp:
      "No roscamento, o avanço por rotação deve corresponder exatamente ao passo da rosca.",
    speedHelp:
      "Velocidade da aresta de corte em relação ao material. Os dados do fabricante têm prioridade.",
    feedMillHelp:
      "Percurso por aresta de corte. O cálculo multiplica fz pela rotação e pelo número de dentes.",
    feedRevHelp:
      "Percurso da ferramenta por cada rotação completa do fuso para calcular mm/min.",
    withoutLimit: "sem limite da máquina",
    limitedTo: "Limitado a",
    calculated: "Calculado",
    actual: "real",
    limitIsNotTarget: "A rotação máxima da máquina é um limite, não um objetivo.",
    helpAria: "Mostrar explicação",
    languageSearch: "Pesquisar idioma …",
    noLanguage: "Nenhum idioma encontrado.",
    cameraRequired: "É necessário acesso à câmara",
    cameraPrivacy:
      "A câmara é utilizada apenas para ler o código da ferramenta. Não são guardadas nem carregadas imagens.",
    cameraAllow: "Permitir câmara",
    cameraStarting: "A iniciar a câmara …",
    cameraRetry: "Tentar novamente",
    cameraError: "O acesso à câmara foi recusado ou não está disponível.",
  },
  sq: {
    toolHelp:
      "Shkruani emrin ose grupin e veglës, për shembull frezë, frezë konike ose thikë tornimi.",
    toolPlaceholder: "p.sh. trapan, frezë konike, thikë tornimi …",
    noTool: "Nuk u gjet asnjë vegël.",
    materialHelp:
      "Materiali përcakton intervalin e rekomanduar të shpejtësisë së prerjes.",
    partDiameterHelp:
      "Gjatë tornimit vendosni diametrin që po përpunohet aktualisht.",
    toolDiameterHelp: "Diametri efektiv i veglës në tehun prerës.",
    teethHelp:
      "Numri i teheve prerëse që përdoret për llogaritjen e avancimit total.",
    oldMachine: "Makinë e vjetër ×0,5",
    oldMachineCopy: "Përgjysmon shpejtësinë e prerjes dhe avancimin",
    rpmLimit: "Përdor kufirin e rrotullimeve",
    rpmLimitCopy: "Kufiri teknik i makinës",
    rpmHelp:
      "Vetëm kufi i sipërm teknik, jo vlerë objektiv. Intervali fillestar mbetet i dukshëm.",
    scanner: "Skano kodin e veglës",
    scannerCopy: "Hap skanerin demonstrues me një vegël shembull",
    scanTitle: "Skano kodin e veglës",
    scanDescription:
      "Prototip: kodi i testit simulon një kod në paketimin e veglës.",
    camera: "Drejtojeni kamerën te kodi QR ose Data Matrix",
    scanDemo: "Skano kodin demonstrues",
    recognized: "Vegla demonstruese u njoh",
    demoWarning: "Të dhëna testuese, jo të dhëna reale të prodhuesit",
    manufacturer: "Prodhuesi",
    article: "Numri i artikullit",
    toolName: "Vegla",
    steel: "Çelik",
    aluminium: "Alumin",
    titanium: "Titan",
    oldActive:
      "Modaliteti i makinës së vjetër është aktiv: vlerat e importuara do të përgjysmohen.",
    import: "Përdor vlerat e prodhuesit",
    gradeHelp:
      "Mund të zgjidhni klasën e saktë. Përndryshe përdoret standardi i përgjithshëm i materialit.",
    operation: "Përdorimi",
    profile: "Profili i të dhënave të prerjes",
    profileGroove: "Konservativ · stabiliteti i pari",
    profileFine: "Shpejtësi më e lartë · avancim i ulët",
    profileRough: "Ngarkesë e lartë · avancim më i madh",
    balanced: "I balancuar",
    turnNote:
      "Klasa e pllakës, gjeometria, dalja e veglës dhe ftohja mund t'i ndryshojnë shumë vlerat. Prandaj shfaqet një interval fillestar i kujdesshëm.",
    pitch: "Hapi i filetës P",
    pitchHelp:
      "Në tornimin e filetës, avancimi për rrotullim duhet të jetë saktësisht sa hapi i filetës.",
    speedHelp:
      "Shpejtësia e tehut ndaj materialit. Të dhënat e prodhuesit kanë përparësi.",
    feedMillHelp:
      "Lëvizja për teh. Llogaritësi shumëzon fz me rrotullimet dhe numrin e dhëmbëve.",
    feedRevHelp:
      "Lëvizja e veglës për një rrotullim të plotë të boshtit për llogaritjen e mm/min.",
    withoutLimit: "pa kufirin e makinës",
    limitedTo: "Kufizuar në",
    calculated: "Llogaritur",
    actual: "reale",
    limitIsNotTarget: "Maksimumi i makinës është kufi, jo objektiv.",
    helpAria: "Shfaq shpjegimin",
    languageSearch: "Kërko gjuhën …",
    noLanguage: "Nuk u gjet asnjë gjuhë.",
    cameraRequired: "Kërkohet qasje në kamerë",
    cameraPrivacy:
      "Kamera përdoret vetëm për të lexuar kodin e veglës. Imazhet nuk ruhen dhe nuk ngarkohen.",
    cameraAllow: "Lejo kamerën",
    cameraStarting: "Kamera po hapet …",
    cameraRetry: "Provo përsëri",
    cameraError: "Qasja në kamerë u refuzua ose nuk është e disponueshme.",
  },
  zh: {
    toolHelp: "输入刀具名称或类别，例如铣刀、锪钻或车刀。",
    toolPlaceholder: "例如：钻头、锪钻、车刀 …",
    noTool: "未找到刀具。",
    materialHelp: "材料决定建议的切削速度范围。",
    partDiameterHelp: "车削时请输入当前加工位置的工件直径。",
    toolDiameterHelp: "切削刃处的有效刀具直径。",
    teethHelp: "用于计算总进给速度的切削刃数量。",
    oldMachine: "老旧机床 ×0.5",
    oldMachineCopy: "将切削速度和进给量减半",
    rpmLimit: "使用转速限制",
    rpmLimitCopy: "机床技术上限",
    rpmHelp: "仅作为技术上限，并非目标值。原始建议范围仍会显示。",
    scanner: "扫描刀具代码",
    scannerCopy: "使用示例刀具打开演示扫描器",
    scanTitle: "扫描刀具代码",
    scanDescription: "原型功能：测试代码模拟刀具包装上的代码。",
    camera: "将摄像头对准二维码或 Data Matrix 码",
    scanDemo: "扫描演示代码",
    recognized: "已识别演示刀具",
    demoWarning: "测试数据，并非真实制造商数据",
    manufacturer: "制造商",
    article: "产品编号",
    toolName: "刀具",
    steel: "钢",
    aluminium: "铝",
    titanium: "钛",
    oldActive: "老旧机床模式已启用：导入参数将减半。",
    import: "采用制造商参数",
    gradeHelp: "可选择具体材料牌号；未选择时使用通用材料标准。",
    operation: "加工方式",
    profile: "切削参数模式",
    profileGroove: "保守 · 稳定性优先",
    profileFine: "较高切削速度 · 较低进给量",
    profileRough: "高负载能力 · 较高进给量",
    balanced: "均衡",
    turnNote:
      "刀片牌号、几何形状、刀具悬伸量和冷却方式都可能显著影响参数，因此本计算器仅提供谨慎的初始范围。",
    pitch: "螺距 P",
    pitchHelp: "车削螺纹时，每转进给量必须与螺距完全一致。",
    speedHelp: "切削刃相对于材料的速度。制造商数据优先。",
    feedMillHelp: "每个切削刃的移动量。计算器将 fz 乘以转速和刀齿数。",
    feedRevHelp: "主轴每完整旋转一圈时刀具的移动量，用于计算 mm/min。",
    withoutLimit: "不考虑机床限制",
    limitedTo: "限制为",
    calculated: "计算值",
    actual: "实际",
    limitIsNotTarget: "机床最高转速是上限，不是目标值。",
    helpAria: "显示说明",
    languageSearch: "搜索语言 …",
    noLanguage: "未找到语言。",
    cameraRequired: "需要摄像头权限",
    cameraPrivacy: "摄像头仅用于读取刀具代码，不会保存或上传任何图像。",
    cameraAllow: "允许使用摄像头",
    cameraStarting: "正在启动摄像头 …",
    cameraRetry: "重试",
    cameraError: "摄像头权限被拒绝或摄像头不可用。",
  },
  ja: {
    toolHelp: "工具名または工具分類を入力してください。例：フライス、皿もみ工具、旋削バイト。",
    toolPlaceholder: "例：ドリル、皿もみ工具、旋削バイト …",
    noTool: "工具が見つかりません。",
    materialHelp: "材料によって推奨切削速度の範囲が決まります。",
    partDiameterHelp: "旋削では、現在加工している位置のワーク径を入力してください。",
    toolDiameterHelp: "切れ刃位置での有効工具径です。",
    teethHelp: "総送り速度の計算に使用する切れ刃の数です。",
    oldMachine: "旧型機械 ×0.5",
    oldMachineCopy: "切削速度と送りを半分にします",
    rpmLimit: "回転数制限を使用",
    rpmLimitCopy: "機械の技術的上限",
    rpmHelp: "目標値ではなく技術的な上限です。元の推奨範囲も表示されます。",
    scanner: "工具コードをスキャン",
    scannerCopy: "サンプル工具を使ってデモスキャナーを開きます",
    scanTitle: "工具コードをスキャン",
    scanDescription: "プロトタイプ：テストコードは工具パッケージ上のコードを再現します。",
    camera: "カメラをQRコードまたはData Matrixコードに向けてください",
    scanDemo: "デモコードをスキャン",
    recognized: "デモ工具を認識しました",
    demoWarning: "テストデータです。実際のメーカー情報ではありません",
    manufacturer: "メーカー",
    article: "品番",
    toolName: "工具",
    steel: "鋼",
    aluminium: "アルミニウム",
    titanium: "チタン",
    oldActive: "旧型機械モードが有効です。読み込んだ値は半分になります。",
    import: "メーカー値を使用",
    gradeHelp: "正確な材料規格を選択できます。未選択の場合は一般的な材料標準を使用します。",
    operation: "加工用途",
    profile: "切削条件プロファイル",
    profileGroove: "安全重視 · 安定性優先",
    profileFine: "高い切削速度 · 低い送り",
    profileRough: "高負荷 · 高い送り",
    balanced: "バランス",
    turnNote: "インサート材種、形状、工具突出し量、冷却によって値は大きく変わります。そのため安全側の初期範囲を表示しています。",
    pitch: "ねじピッチ P",
    pitchHelp: "ねじ切り旋削では、一回転当たり送りをねじピッチと正確に一致させる必要があります。",
    speedHelp: "材料に対する切れ刃の速度です。メーカーのデータを優先してください。",
    feedMillHelp: "一つの切れ刃当たりの移動量です。計算機はfzに回転数と刃数を掛けます。",
    feedRevHelp: "主軸が一回転する間の工具移動量で、mm/minの計算に使用します。",
    withoutLimit: "機械制限なし",
    limitedTo: "制限値",
    calculated: "計算値",
    actual: "実際",
    limitIsNotTarget: "機械の最高回転数は上限であり、目標値ではありません。",
    helpAria: "説明を表示",
    languageSearch: "言語を検索 …",
    noLanguage: "言語が見つかりません。",
    cameraRequired: "カメラへのアクセスが必要です",
    cameraPrivacy: "カメラは工具コードの読み取りにのみ使用されます。画像は保存もアップロードもされません。",
    cameraAllow: "カメラを許可",
    cameraStarting: "カメラを起動中 …",
    cameraRetry: "再試行",
    cameraError: "カメラへのアクセスが拒否されたか、カメラを利用できません。",
  },
  vi: {
    toolHelp: "Nhập tên hoặc nhóm dụng cụ, ví dụ dao phay, mũi vát mép hoặc dao tiện.",
    toolPlaceholder: "Ví dụ: mũi khoan, mũi vát mép, dao tiện …",
    noTool: "Không tìm thấy dụng cụ.",
    materialHelp: "Vật liệu xác định khoảng tốc độ cắt khuyến nghị.",
    partDiameterHelp: "Khi tiện, hãy nhập đường kính phôi tại vị trí đang gia công.",
    toolDiameterHelp: "Đường kính hiệu dụng của dụng cụ tại lưỡi cắt.",
    teethHelp: "Số lưỡi cắt được dùng để tính tổng tốc độ chạy dao.",
    oldMachine: "Máy đời cũ ×0,5",
    oldMachineCopy: "Giảm một nửa tốc độ cắt và lượng chạy dao",
    rpmLimit: "Sử dụng giới hạn tốc độ quay",
    rpmLimitCopy: "Giới hạn kỹ thuật của máy",
    rpmHelp: "Chỉ là giới hạn kỹ thuật trên, không phải giá trị mục tiêu. Khoảng khuyến nghị ban đầu vẫn được hiển thị.",
    scanner: "Quét mã dụng cụ",
    scannerCopy: "Mở máy quét thử nghiệm với một dụng cụ mẫu",
    scanTitle: "Quét mã dụng cụ",
    scanDescription: "Bản mẫu: mã thử nghiệm mô phỏng mã trên bao bì dụng cụ.",
    camera: "Hướng camera vào mã QR hoặc Data Matrix",
    scanDemo: "Quét mã thử nghiệm",
    recognized: "Đã nhận dạng dụng cụ thử nghiệm",
    demoWarning: "Dữ liệu thử nghiệm, không phải dữ liệu thực của nhà sản xuất",
    manufacturer: "Nhà sản xuất",
    article: "Mã sản phẩm",
    toolName: "Dụng cụ",
    steel: "Thép",
    aluminium: "Nhôm",
    titanium: "Titan",
    oldActive: "Chế độ máy đời cũ đang bật: các giá trị nhập sẽ được giảm một nửa.",
    import: "Sử dụng giá trị của nhà sản xuất",
    gradeHelp: "Bạn có thể chọn mác vật liệu chính xác. Nếu không, tiêu chuẩn vật liệu chung sẽ được sử dụng.",
    operation: "Ứng dụng",
    profile: "Cấu hình thông số cắt",
    profileGroove: "Thận trọng · ưu tiên ổn định",
    profileFine: "Tốc độ cắt cao hơn · lượng chạy dao thấp",
    profileRough: "Tải cao · lượng chạy dao lớn hơn",
    balanced: "Cân bằng",
    turnNote: "Mác mảnh cắt, hình học, độ nhô dụng cụ và làm mát có thể làm thay đổi đáng kể các giá trị. Vì vậy, một khoảng khởi đầu thận trọng được hiển thị.",
    pitch: "Bước ren P",
    pitchHelp: "Khi tiện ren, lượng chạy dao mỗi vòng phải chính xác bằng bước ren.",
    speedHelp: "Tốc độ của lưỡi cắt so với vật liệu. Ưu tiên dữ liệu của nhà sản xuất.",
    feedMillHelp: "Quãng đường dịch chuyển trên mỗi lưỡi cắt. Máy tính nhân fz với tốc độ quay và số lưỡi cắt.",
    feedRevHelp: "Quãng đường dụng cụ di chuyển trong một vòng quay hoàn chỉnh của trục chính để tính mm/min.",
    withoutLimit: "không có giới hạn máy",
    limitedTo: "Giới hạn ở",
    calculated: "Đã tính",
    actual: "thực tế",
    limitIsNotTarget: "Tốc độ tối đa của máy là giới hạn, không phải mục tiêu.",
    helpAria: "Hiển thị giải thích",
    languageSearch: "Tìm ngôn ngữ …",
    noLanguage: "Không tìm thấy ngôn ngữ.",
    cameraRequired: "Cần quyền truy cập camera",
    cameraPrivacy: "Camera chỉ được dùng để đọc mã dụng cụ. Hình ảnh không được lưu hoặc tải lên.",
    cameraAllow: "Cho phép camera",
    cameraStarting: "Đang khởi động camera …",
    cameraRetry: "Thử lại",
    cameraError: "Quyền truy cập camera bị từ chối hoặc camera không khả dụng.",
  },
  fr: {
    toolHelp: "Saisissez le nom ou la famille de l’outil, par exemple fraise, fraise à chanfreiner ou outil de tournage.",
    toolPlaceholder: "p. ex. foret, fraise à chanfreiner, outil de tournage …",
    noTool: "Aucun outil trouvé.",
    materialHelp: "Le matériau détermine la plage de vitesse de coupe recommandée.",
    partDiameterHelp: "En tournage, saisissez le diamètre actuel de la zone usinée.",
    toolDiameterHelp: "Diamètre effectif de l’outil au niveau de l’arête de coupe.",
    teethHelp: "Nombre d’arêtes de coupe utilisé pour calculer l’avance totale.",
    oldMachine: "Machine ancienne ×0,5",
    oldMachineCopy: "Divise par deux la vitesse de coupe et l’avance",
    rpmLimit: "Utiliser la limite de régime",
    rpmLimitCopy: "Limite technique de la machine",
    rpmHelp: "Il s’agit uniquement d’une limite technique supérieure, pas d’une valeur cible. La plage initiale reste visible.",
    scanner: "Scanner le code de l’outil",
    scannerCopy: "Ouvrir le scanner de démonstration avec un outil exemple",
    scanTitle: "Scanner le code de l’outil",
    scanDescription: "Prototype : le code de test simule un code présent sur l’emballage de l’outil.",
    camera: "Dirigez la caméra vers le code QR ou Data Matrix",
    scanDemo: "Scanner le code de démonstration",
    recognized: "Outil de démonstration reconnu",
    demoWarning: "Données de test, pas de véritables données fabricant",
    manufacturer: "Fabricant",
    article: "Référence",
    toolName: "Outil",
    steel: "Acier",
    aluminium: "Aluminium",
    titanium: "Titane",
    oldActive: "Le mode machine ancienne est actif : les valeurs importées seront divisées par deux.",
    import: "Utiliser les valeurs du fabricant",
    gradeHelp: "Vous pouvez sélectionner la nuance exacte. Sinon, la norme générale du matériau est utilisée.",
    operation: "Utilisation",
    profile: "Profil des paramètres de coupe",
    profileGroove: "Prudent · stabilité prioritaire",
    profileFine: "Vitesse de coupe plus élevée · faible avance",
    profileRough: "Charge élevée · avance plus importante",
    balanced: "Équilibré",
    turnNote: "La nuance de plaquette, la géométrie, le porte-à-faux et le refroidissement peuvent fortement modifier les valeurs. Une plage initiale prudente est donc affichée.",
    pitch: "Pas de filetage P",
    pitchHelp: "Lors du filetage au tour, l’avance par tour doit correspondre exactement au pas du filetage.",
    speedHelp: "Vitesse de l’arête de coupe par rapport au matériau. Les données du fabricant sont prioritaires.",
    feedMillHelp: "Déplacement par arête de coupe. Le calculateur multiplie fz par le régime et le nombre de dents.",
    feedRevHelp: "Déplacement de l’outil pendant un tour complet de broche pour calculer les mm/min.",
    withoutLimit: "sans limite machine",
    limitedTo: "Limité à",
    calculated: "Calculé",
    actual: "réel",
    limitIsNotTarget: "Le régime maximal de la machine est une limite, pas une valeur cible.",
    helpAria: "Afficher l’explication",
    languageSearch: "Rechercher une langue …",
    noLanguage: "Aucune langue trouvée.",
    cameraRequired: "Accès à la caméra requis",
    cameraPrivacy: "La caméra sert uniquement à lire le code de l’outil. Les images ne sont ni enregistrées ni téléversées.",
    cameraAllow: "Autoriser la caméra",
    cameraStarting: "Démarrage de la caméra …",
    cameraRetry: "Réessayer",
    cameraError: "L’accès à la caméra a été refusé ou la caméra n’est pas disponible.",
  },
  ko: {
    toolHelp: "밀링 공구, 카운터싱크 또는 선삭 바이트와 같이 공구명이나 공구 분류를 입력하십시오.",
    toolPlaceholder: "예: 드릴, 카운터싱크, 선삭 바이트 …",
    noTool: "공구를 찾을 수 없습니다.",
    materialHelp: "소재에 따라 권장 절삭 속도 범위가 결정됩니다.",
    partDiameterHelp: "선삭 시 현재 가공 위치의 공작물 직경을 입력하십시오.",
    toolDiameterHelp: "절삭날 위치에서의 유효 공구 직경입니다.",
    teethHelp: "전체 이송 속도 계산에 사용되는 절삭날 수입니다.",
    oldMachine: "구형 장비 ×0.5",
    oldMachineCopy: "절삭 속도와 이송량을 절반으로 줄입니다",
    rpmLimit: "회전수 제한 사용",
    rpmLimitCopy: "장비의 기술적 상한",
    rpmHelp: "목표값이 아닌 기술적 상한입니다. 원래 권장 범위는 계속 표시됩니다.",
    scanner: "공구 코드 스캔",
    scannerCopy: "샘플 공구로 데모 스캐너 열기",
    scanTitle: "공구 코드 스캔",
    scanDescription: "프로토타입: 테스트 코드는 공구 포장에 있는 코드를 시뮬레이션합니다.",
    camera: "카메라를 QR 또는 Data Matrix 코드에 맞추십시오",
    scanDemo: "데모 코드 스캔",
    recognized: "데모 공구를 인식했습니다",
    demoWarning: "테스트 데이터이며 실제 제조사 데이터가 아닙니다",
    manufacturer: "제조사",
    article: "품번",
    toolName: "공구",
    steel: "강",
    aluminium: "알루미늄",
    titanium: "티타늄",
    oldActive: "구형 장비 모드가 활성화되어 가져온 값이 절반으로 줄어듭니다.",
    import: "제조사 값 사용",
    gradeHelp: "정확한 소재 등급을 선택할 수 있습니다. 선택하지 않으면 일반 소재 표준을 사용합니다.",
    operation: "가공 용도",
    profile: "절삭 조건 프로필",
    profileGroove: "안정형 · 안정성 우선",
    profileFine: "높은 절삭 속도 · 낮은 이송량",
    profileRough: "고부하 · 높은 이송량",
    balanced: "균형형",
    turnNote: "인서트 등급, 형상, 공구 돌출 길이 및 냉각 방식에 따라 값이 크게 달라질 수 있습니다. 따라서 안정적인 시작 범위를 표시합니다.",
    pitch: "나사 피치 P",
    pitchHelp: "나사 선삭 시 회전당 이송량은 나사 피치와 정확히 일치해야 합니다.",
    speedHelp: "소재에 대한 절삭날의 속도입니다. 제조사 데이터를 우선하십시오.",
    feedMillHelp: "절삭날 하나당 이동량입니다. 계산기는 fz에 회전수와 날 수를 곱합니다.",
    feedRevHelp: "mm/min 계산을 위한 주축 1회전당 공구 이동량입니다.",
    withoutLimit: "장비 제한 없음",
    limitedTo: "제한값",
    calculated: "계산값",
    actual: "실제",
    limitIsNotTarget: "장비 최대 회전수는 상한이며 목표값이 아닙니다.",
    helpAria: "설명 표시",
    languageSearch: "언어 검색 …",
    noLanguage: "언어를 찾을 수 없습니다.",
    cameraRequired: "카메라 접근 권한 필요",
    cameraPrivacy: "카메라는 공구 코드를 읽는 데만 사용됩니다. 이미지는 저장되거나 업로드되지 않습니다.",
    cameraAllow: "카메라 허용",
    cameraStarting: "카메라 시작 중 …",
    cameraRetry: "다시 시도",
    cameraError: "카메라 접근이 거부되었거나 카메라를 사용할 수 없습니다.",
  },
  it: {
    toolHelp: "Inserisci il nome o il gruppo dell’utensile, ad esempio fresa, svasatore o utensile da tornitura.",
    toolPlaceholder: "ad es. punta, svasatore, utensile da tornitura …", noTool: "Nessun utensile trovato.",
    materialHelp: "Il materiale determina l’intervallo consigliato della velocità di taglio.",
    partDiameterHelp: "Nella tornitura inserisci il diametro del pezzo nel punto attualmente lavorato.",
    toolDiameterHelp: "Diametro effettivo dell’utensile sul tagliente.", teethHelp: "Numero di taglienti usato per calcolare l’avanzamento totale.",
    oldMachine: "Macchina meno recente ×0,5", oldMachineCopy: "Dimezza velocità di taglio e avanzamento",
    rpmLimit: "Usa il limite di giri", rpmLimitCopy: "Limite tecnico della macchina",
    rpmHelp: "È solo un limite tecnico superiore, non un valore obiettivo. L’intervallo originale resta visibile.",
    scanner: "Scansiona il codice utensile", scannerCopy: "Apri lo scanner dimostrativo con un utensile di esempio",
    scanTitle: "Scansiona il codice utensile", scanDescription: "Prototipo: il codice di prova simula un codice sulla confezione dell’utensile.",
    camera: "Inquadra il codice QR o Data Matrix", scanDemo: "Scansiona il codice demo", recognized: "Utensile demo riconosciuto",
    demoWarning: "Dati di prova, non dati reali del produttore", manufacturer: "Produttore", article: "Codice articolo",
    toolName: "Utensile", steel: "Acciaio", aluminium: "Alluminio", titanium: "Titanio",
    oldActive: "La modalità macchina meno recente è attiva: i valori importati saranno dimezzati.", import: "Usa i valori del produttore",
    gradeHelp: "Puoi selezionare il grado esatto. Altrimenti viene usato lo standard generale del materiale.",
    operation: "Impiego", profile: "Profilo dei parametri di taglio", profileGroove: "Prudente · priorità alla stabilità",
    profileFine: "Velocità di taglio più alta · avanzamento basso", profileRough: "Carico elevato · avanzamento maggiore", balanced: "Bilanciato",
    turnNote: "Grado dell’inserto, geometria, sporgenza e raffreddamento possono modificare molto i valori. Perciò viene mostrato un intervallo iniziale prudente.",
    pitch: "Passo della filettatura P", pitchHelp: "Nella filettatura al tornio, l’avanzamento per giro deve corrispondere esattamente al passo.",
    speedHelp: "Velocità del tagliente rispetto al materiale. I dati del produttore hanno priorità.",
    feedMillHelp: "Spostamento per tagliente. Il calcolatore moltiplica fz per il numero di giri e di denti.",
    feedRevHelp: "Spostamento dell’utensile per un giro completo del mandrino, usato per calcolare mm/min.",
    withoutLimit: "senza limite macchina", limitedTo: "Limitato a", calculated: "Calcolato", actual: "effettivo",
    limitIsNotTarget: "Il numero di giri massimo della macchina è un limite, non un obiettivo.", helpAria: "Mostra spiegazione",
    languageSearch: "Cerca lingua …", noLanguage: "Nessuna lingua trovata.", cameraRequired: "È necessario l’accesso alla fotocamera",
    cameraPrivacy: "La fotocamera viene usata solo per leggere il codice utensile. Le immagini non vengono salvate né caricate.",
    cameraAllow: "Consenti fotocamera", cameraStarting: "Avvio fotocamera …", cameraRetry: "Riprova",
    cameraError: "L’accesso alla fotocamera è stato negato o la fotocamera non è disponibile.",
  },
  nl: {
    toolHelp: "Voer de naam of groep van het gereedschap in, bijvoorbeeld frees, verzinkboor of draaibeitel.",
    toolPlaceholder: "bijv. boor, verzinkboor, draaibeitel …", noTool: "Geen gereedschap gevonden.",
    materialHelp: "Het materiaal bepaalt het aanbevolen snijsnelheidsbereik.",
    partDiameterHelp: "Voer bij draaien de werkstukdiameter in op de plaats die wordt bewerkt.",
    toolDiameterHelp: "Effectieve gereedschapsdiameter bij de snijkant.", teethHelp: "Aantal snijkanten voor de berekening van de totale voeding.",
    oldMachine: "Oudere machine ×0,5", oldMachineCopy: "Halveert de snijsnelheid en voeding",
    rpmLimit: "Toerentalbegrenzing gebruiken", rpmLimitCopy: "Technische grens van de machine",
    rpmHelp: "Alleen een technische bovengrens, geen streefwaarde. Het oorspronkelijke bereik blijft zichtbaar.",
    scanner: "Gereedschapscode scannen", scannerCopy: "Open de demoscanner met een voorbeeldgereedschap",
    scanTitle: "Gereedschapscode scannen", scanDescription: "Prototype: de testcode simuleert een code op de gereedschapsverpakking.",
    camera: "Richt de camera op de QR- of Data Matrix-code", scanDemo: "Democode scannen", recognized: "Demogereedschap herkend",
    demoWarning: "Testgegevens, geen echte fabrikantgegevens", manufacturer: "Fabrikant", article: "Artikelnummer",
    toolName: "Gereedschap", steel: "Staal", aluminium: "Aluminium", titanium: "Titanium",
    oldActive: "De modus voor oudere machines is actief: geïmporteerde waarden worden gehalveerd.", import: "Fabrikantwaarden gebruiken",
    gradeHelp: "Je kunt de exacte materiaalkwaliteit kiezen. Anders wordt de algemene materiaalstandaard gebruikt.",
    operation: "Toepassing", profile: "Snijgegevensprofiel", profileGroove: "Voorzichtig · stabiliteit eerst",
    profileFine: "Hogere snijsnelheid · lage voeding", profileRough: "Hoge belasting · grotere voeding", balanced: "Gebalanceerd",
    turnNote: "Plaatkwaliteit, geometrie, uitsteeklengte en koeling kunnen de waarden sterk veranderen. Daarom wordt een voorzichtig beginbereik getoond.",
    pitch: "Schroefdraadspoed P", pitchHelp: "Bij schroefdraaddraaien moet de voeding per omwenteling exact overeenkomen met de spoed.",
    speedHelp: "Snelheid van de snijkant ten opzichte van het materiaal. Fabrikantgegevens hebben voorrang.",
    feedMillHelp: "Verplaatsing per snijkant. De calculator vermenigvuldigt fz met toerental en aantal tanden.",
    feedRevHelp: "Verplaatsing van het gereedschap per volledige spilomwenteling voor de berekening van mm/min.",
    withoutLimit: "zonder machinebegrenzing", limitedTo: "Begrensd op", calculated: "Berekend", actual: "werkelijk",
    limitIsNotTarget: "Het maximale machinetoerental is een grens, geen doelwaarde.", helpAria: "Uitleg tonen",
    languageSearch: "Taal zoeken …", noLanguage: "Geen taal gevonden.", cameraRequired: "Cameratoegang vereist",
    cameraPrivacy: "De camera wordt alleen gebruikt om de gereedschapscode te lezen. Beelden worden niet opgeslagen of geüpload.",
    cameraAllow: "Camera toestaan", cameraStarting: "Camera wordt gestart …", cameraRetry: "Opnieuw proberen",
    cameraError: "Cameratoegang is geweigerd of de camera is niet beschikbaar.",
  },
  cs: {
    toolHelp: "Zadejte název nebo skupinu nástroje, například frézu, záhlubník nebo soustružnický nůž.", toolPlaceholder: "např. vrták, záhlubník, soustružnický nůž …", noTool: "Nebyl nalezen žádný nástroj.",
    materialHelp: "Materiál určuje doporučený rozsah řezné rychlosti.", partDiameterHelp: "Při soustružení zadejte průměr obrobku v právě obráběném místě.", toolDiameterHelp: "Účinný průměr nástroje na břitu.", teethHelp: "Počet břitů použitý k výpočtu celkového posuvu.",
    oldMachine: "Starší stroj ×0,5", oldMachineCopy: "Sníží řeznou rychlost a posuv na polovinu", rpmLimit: "Použít omezení otáček", rpmLimitCopy: "Technický limit stroje", rpmHelp: "Pouze technická horní mez, nikoli cílová hodnota. Původní rozsah zůstává viditelný.",
    scanner: "Skenovat kód nástroje", scannerCopy: "Otevřít ukázkový skener s příkladem nástroje", scanTitle: "Skenovat kód nástroje", scanDescription: "Prototyp: testovací kód simuluje kód na obalu nástroje.", camera: "Namiřte kameru na QR nebo Data Matrix kód", scanDemo: "Naskenovat ukázkový kód", recognized: "Ukázkový nástroj rozpoznán", demoWarning: "Testovací údaje, nikoli skutečná data výrobce",
    manufacturer: "Výrobce", article: "Číslo položky", toolName: "Nástroj", steel: "Ocel", aluminium: "Hliník", titanium: "Titan", oldActive: "Režim staršího stroje je aktivní: importované hodnoty budou poloviční.", import: "Použít hodnoty výrobce",
    gradeHelp: "Můžete vybrat přesnou jakost. Jinak se použije obecný standard materiálu.", operation: "Použití", profile: "Profil řezných podmínek", profileGroove: "Šetrný · stabilita na prvním místě", profileFine: "Vyšší řezná rychlost · nízký posuv", profileRough: "Vysoké zatížení · větší posuv", balanced: "Vyvážený",
    turnNote: "Jakost destičky, geometrie, vyložení nástroje a chlazení mohou hodnoty výrazně ovlivnit. Proto se zobrazuje opatrný počáteční rozsah.", pitch: "Stoupání závitu P", pitchHelp: "Při soustružení závitu musí posuv na otáčku přesně odpovídat stoupání závitu.", speedHelp: "Rychlost břitu vůči materiálu. Přednost mají údaje výrobce.", feedMillHelp: "Pohyb na jeden břit. Kalkulátor násobí fz otáčkami a počtem zubů.", feedRevHelp: "Pohyb nástroje během jedné úplné otáčky vřetena pro výpočet mm/min.",
    withoutLimit: "bez omezení stroje", limitedTo: "Omezeno na", calculated: "Vypočteno", actual: "skutečné", limitIsNotTarget: "Maximální otáčky stroje jsou limitem, nikoli cílem.", helpAria: "Zobrazit vysvětlení", languageSearch: "Hledat jazyk …", noLanguage: "Nebyl nalezen žádný jazyk.", cameraRequired: "Je vyžadován přístup ke kameře", cameraPrivacy: "Kamera slouží pouze ke čtení kódu nástroje. Snímky se neukládají ani neodesílají.", cameraAllow: "Povolit kameru", cameraStarting: "Spouštění kamery …", cameraRetry: "Zkusit znovu", cameraError: "Přístup ke kameře byl zamítnut nebo kamera není k dispozici.",
  },
  ro: {
    toolHelp: "Introdu numele sau grupa sculei, de exemplu freză, teșitor sau cuțit de strung.", toolPlaceholder: "de ex. burghiu, teșitor, cuțit de strung …", noTool: "Nu a fost găsită nicio sculă.",
    materialHelp: "Materialul determină intervalul recomandat al vitezei de așchiere.", partDiameterHelp: "La strunjire, introdu diametrul piesei în zona prelucrată în prezent.", toolDiameterHelp: "Diametrul efectiv al sculei la muchia așchietoare.", teethHelp: "Numărul de muchii așchietoare folosit la calculul avansului total.",
    oldMachine: "Mașină mai veche ×0,5", oldMachineCopy: "Înjumătățește viteza de așchiere și avansul", rpmLimit: "Folosește limita de turație", rpmLimitCopy: "Limita tehnică a mașinii", rpmHelp: "Doar o limită tehnică superioară, nu o valoare țintă. Intervalul inițial rămâne vizibil.",
    scanner: "Scanează codul sculei", scannerCopy: "Deschide scanerul demonstrativ cu o sculă exemplu", scanTitle: "Scanează codul sculei", scanDescription: "Prototip: codul de test simulează un cod de pe ambalajul sculei.", camera: "Îndreaptă camera spre codul QR sau Data Matrix", scanDemo: "Scanează codul demonstrativ", recognized: "Scula demonstrativă a fost recunoscută", demoWarning: "Date de test, nu date reale ale producătorului",
    manufacturer: "Producător", article: "Număr articol", toolName: "Sculă", steel: "Oțel", aluminium: "Aluminiu", titanium: "Titan", oldActive: "Modul pentru mașină mai veche este activ: valorile importate vor fi înjumătățite.", import: "Folosește valorile producătorului",
    gradeHelp: "Poți selecta clasa exactă. Altfel se folosește standardul general al materialului.", operation: "Utilizare", profile: "Profilul parametrilor de așchiere", profileGroove: "Prudent · stabilitatea pe primul loc", profileFine: "Viteză de așchiere mai mare · avans redus", profileRough: "Sarcină mare · avans mai mare", balanced: "Echilibrat",
    turnNote: "Clasa plăcuței, geometria, ieșirea sculei și răcirea pot modifica semnificativ valorile. De aceea este afișat un interval inițial prudent.", pitch: "Pasul filetului P", pitchHelp: "La strunjirea filetului, avansul pe rotație trebuie să corespundă exact pasului filetului.", speedHelp: "Viteza muchiei așchietoare față de material. Datele producătorului au prioritate.", feedMillHelp: "Deplasarea pe muchie așchietoare. Calculatorul înmulțește fz cu turația și numărul de dinți.", feedRevHelp: "Deplasarea sculei la o rotație completă a arborelui, utilizată pentru calculul mm/min.",
    withoutLimit: "fără limita mașinii", limitedTo: "Limitat la", calculated: "Calculat", actual: "real", limitIsNotTarget: "Turația maximă a mașinii este o limită, nu o țintă.", helpAria: "Arată explicația", languageSearch: "Caută limba …", noLanguage: "Nu a fost găsită nicio limbă.", cameraRequired: "Este necesar accesul la cameră", cameraPrivacy: "Camera este folosită doar pentru citirea codului sculei. Imaginile nu sunt salvate sau încărcate.", cameraAllow: "Permite camera", cameraStarting: "Camera pornește …", cameraRetry: "Încearcă din nou", cameraError: "Accesul la cameră a fost refuzat sau camera nu este disponibilă.",
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
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9а-яё\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]+/gi, " ")
    .trim();

const languageOptions: {
  id: Lang;
  label: string;
  code: string;
  aliases: string;
}[] = [
  {
    id: "de",
    label: "Deutsch",
    code: "DE",
    aliases: "de deutsch deutsche german germany allemand tyska almanca",
  },
  {
    id: "en",
    label: "English",
    code: "UK",
    aliases: "en eng english englisch uk gb british anglais engelska ingilizce",
  },
  {
    id: "ru",
    label: "Русский",
    code: "RU",
    aliases: "ru rus russian russisch русский ryska rusca",
  },
  {
    id: "sv",
    label: "Svenska",
    code: "SE",
    aliases: "sv se swe swedish schwedisch svenska suédois isvecce",
  },
  {
    id: "tr",
    label: "Türkçe",
    code: "TR",
    aliases: "tr tur turkish türkisch türkçe turkce turc turkiska",
  },
  {
    id: "es",
    label: "Español",
    code: "ES",
    aliases: "es esp spanish spanisch español espanol espagnol spanska ispanyolca",
  },
  {
    id: "pt",
    label: "Português",
    code: "PT",
    aliases: "pt por portuguese portugiesisch português portugues portugais portugisiska portekizce brazil brasil",
  },
  {
    id: "sq",
    label: "Shqip",
    code: "AL",
    aliases: "sq al alb albanian albanisch shqip albanais albanska arnavutca",
  },
  {
    id: "zh",
    label: "中文（简体）",
    code: "CN",
    aliases: "zh cn zho chinese mandarin simplified 中文 简体 普通话 chinesisch chinois kinesiska cince",
  },
  {
    id: "ja",
    label: "日本語",
    code: "JP",
    aliases: "ja jp jpn japanese japanisch 日本語 にほんご japonais japanska japonca",
  },
  {
    id: "vi",
    label: "Tiếng Việt",
    code: "VN",
    aliases: "vi vn vie vietnamese vietnamesisch tiếng việt tieng viet vietnamien vietnamesiska vietnamca",
  },
  {
    id: "fr",
    label: "Français",
    code: "FR",
    aliases: "fr fra fre french französisch francais français fransyska fransizca",
  },
  {
    id: "ko",
    label: "한국어",
    code: "KR",
    aliases: "ko kr kor korean koreanisch 한국어 한국 hangug-eo coréen koreanska korece",
  },
  {
    id: "it",
    label: "Italiano",
    code: "IT",
    aliases: "it ita italian italienisch italiano italien italienska italyanca",
  },
  {
    id: "nl",
    label: "Nederlands",
    code: "NL",
    aliases: "nl nld dut dutch niederländisch niederlaendisch nederlands holländisch hollaendisch hollandais olandese",
  },
  { id: "cs", label: "Čeština", code: "CZ", aliases: "cs cz ces cze czech tschechisch čeština cestina tchèque ceco" },
  { id: "ro", label: "Română", code: "RO", aliases: "ro ron rum romanian rumänisch rumaenisch română romana roumain rumeno" },
];

const languageSortNames: Record<Lang, string> = {
  sq: "Albanisch",
  zh: "Chinesisch",
  de: "Deutsch",
  en: "Englisch",
  fr: "Französisch",
  it: "Italienisch",
  ja: "Japanisch",
  ko: "Koreanisch",
  nl: "Niederländisch",
  pt: "Portugiesisch",
  ro: "Rumänisch",
  ru: "Russisch",
  sv: "Schwedisch",
  es: "Spanisch",
  tr: "Türkisch",
  cs: "Tschechisch",
  vi: "Vietnamesisch",
};

const editDistance = (left: string, right: string) => {
  const previous = Array.from({ length: right.length + 1 }, (_, i) => i);
  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const above = previous[j];
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (left[i - 1] === right[j - 1] ? 0 : 1),
      );
      diagonal = above;
    }
  }
  return previous[right.length];
};

const languageMatches = (
  option: (typeof languageOptions)[number],
  query: string,
) => {
  const needle = normalizeSearch(query);
  if (!needle) return true;
  const words = normalizeSearch(
    `${option.label} ${option.code} ${option.aliases}`,
  ).split(" ");
  if (words.some((word) => word.includes(needle))) return true;
  const tolerance = needle.length >= 6 ? 2 : needle.length >= 4 ? 1 : 0;
  return words.some((word) => editDistance(word, needle) <= tolerance);
};
const toolAliases: Record<string, string> = {
  "end-carbide": "schaftfraeser end mill fraeser milling carbide vhm pinnfras parmak freze karbur",
  "end-hss": "schaftfraeser end mill fraeser milling hss pinnfras parmak freze",
  "slot-carbide": "nutenfraeser slot mill nut fraeser sparfras kanal frezesi",
  "ball-carbide": "kugelfraeser ball nose radius fraeser kulfras kuresel freze",
  "face-carbide": "planfraeser face mill wsp wendeplatte planfras alin frezesi",
  "spot-carbide": "anbohrer spot drill nc centrumborr punta matkabi",
  "center-hss": "zentrierbohrer center drill centrumborr punta matkabi",
  "drill-carbide": "bohrer spiralbohrer drill vhm carbide borr matkap karbur",
  "drill-hss": "bohrer spiralbohrer drill hss borr matkap",
  "drill-hssco": "bohrer spiralbohrer drill cobalt hssco hsse borr matkap kobolt",
  "countersink-hss": "senker kegelsenker countersink 90 hss forsankare havsa",
  "countersink-carbide": "senker kegelsenker countersink 90 vhm carbide forsankare havsa karbur",
  "counterbore-hss": "flachsenker counterbore zapfen hss planforsankare silindirik havsa",
  "reamer-hss": "reibahle reamer hss brotsch rayba",
  "reamer-carbide": "reibahle reamer vhm carbide brotsch rayba karbur",
  "turn-rough": "drehmeissel schrupper roughing 85 grovsvarvning kaba tornalama",
  "turn-finish": "drehmeissel schlichter finishing 60 finsvarvning finis tornalama",
  "turn-fine": "drehmeissel feinschlichter fine finishing 30 finbearbetning hassas finis",
  "turn-internal": "innendrehmeissel ausdreher boring internal invandig svarvning ic tornalama",
  "turn-face": "plandrehen planmeissel facing plansvarvning alin tornalama",
  "turn-groove": "abstechen einstechen stechmeissel parting grooving avstickning sparstickning kesme kanal acma",
  "turn-thread-60": "gewinde gewindedrehmeissel threading 60 gangsvarvning dis acma",
  "turn-hss": "drehmeissel turning hss svarvverktyg tornalama takimi",
};

type EditableNumberInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "value" | "onChange"
> & {
  value: number;
  onValueChange: (value: number) => void;
};

function EditableNumberInput({
  value,
  onValueChange,
  onBlur,
  onFocus,
  ...props
}: EditableNumberInputProps) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  return (
    <Input
      {...props}
      value={draft}
      onFocus={(event) => {
        event.currentTarget.select();
        onFocus?.(event);
      }}
      onChange={(event) => {
        const raw = event.target.value;
        const normalized = raw.replace(/^(-?)0+(?=\d)/, "$1");
        setDraft(normalized);

        if (normalized === "") return;
        const next = Number(normalized);
        if (Number.isFinite(next)) onValueChange(next);
      }}
      onBlur={(event) => {
        if (draft === "") {
          setDraft(String(value));
        } else {
          const normalized = Number(draft);
          if (Number.isFinite(normalized)) {
            setDraft(String(normalized));
            onValueChange(normalized);
          }
        }
        onBlur?.(event);
      }}
    />
  );
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("de");
  const text = words[lang];
  const ui = uiText[lang];
  const [toolQuery, setToolQuery] = useState("");
  const [toolInput, setToolInput] = useState("");
  const [languageQuery, setLanguageQuery] = useState("");
  const filteredLanguages = languageOptions
    .filter((option) => languageMatches(option, languageQuery))
    .sort((left, right) =>
      languageSortNames[left.id].localeCompare(languageSortNames[right.id], "de"),
    );
  const locale = ({
    de: "de-DE",
    en: "en-GB",
    ru: "ru-RU",
    sv: "sv-SE",
    tr: "tr-TR",
    es: "es-ES",
    pt: "pt-PT",
    sq: "sq-AL",
    zh: "zh-CN",
    ja: "ja-JP",
    vi: "vi-VN",
    fr: "fr-FR",
    ko: "ko-KR",
    it: "it-IT",
    nl: "nl-NL",
    cs: "cs-CZ",
    ro: "ro-RO",
  } satisfies Record<Lang, string>)[lang];
  const units = ({
    de: { rpm: "U/min", rev: "mm/U", tooth: "mm/Z", minute: "mm/min" },
    en: { rpm: "rpm", rev: "mm/rev", tooth: "mm/tooth", minute: "mm/min" },
    ru: { rpm: "об/мин", rev: "мм/об", tooth: "мм/зуб", minute: "мм/мин" },
    sv: { rpm: "r/min", rev: "mm/varv", tooth: "mm/tand", minute: "mm/min" },
    tr: { rpm: "dev/dk", rev: "mm/dev", tooth: "mm/diş", minute: "mm/dk" },
    es: { rpm: "rpm", rev: "mm/vuelta", tooth: "mm/diente", minute: "mm/min" },
    pt: { rpm: "rpm", rev: "mm/rot", tooth: "mm/dente", minute: "mm/min" },
    sq: { rpm: "rrot/min", rev: "mm/rrot", tooth: "mm/dhëmb", minute: "mm/min" },
    zh: { rpm: "转/分", rev: "mm/转", tooth: "mm/齿", minute: "mm/min" },
    ja: { rpm: "回/分", rev: "mm/回", tooth: "mm/刃", minute: "mm/min" },
    vi: { rpm: "vòng/phút", rev: "mm/vòng", tooth: "mm/răng", minute: "mm/phút" },
    fr: { rpm: "tr/min", rev: "mm/tr", tooth: "mm/dent", minute: "mm/min" },
    ko: { rpm: "회/분", rev: "mm/회", tooth: "mm/날", minute: "mm/분" },
    it: { rpm: "giri/min", rev: "mm/giro", tooth: "mm/dente", minute: "mm/min" },
    nl: { rpm: "omw/min", rev: "mm/omw", tooth: "mm/tand", minute: "mm/min" },
    cs: { rpm: "ot/min", rev: "mm/ot", tooth: "mm/zub", minute: "mm/min" },
    ro: { rpm: "rot/min", rev: "mm/rot", tooth: "mm/dinte", minute: "mm/min" },
  } satisfies Record<
    Lang,
    { rpm: string; rev: string; tooth: string; minute: string }
  >)[lang];
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
    setLanguageQuery("");
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
      setCameraError(ui.cameraError);
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
                <div className="language-search">
                  <Search size={16} aria-hidden="true" />
                  <Input
                    type="search"
                    value={languageQuery}
                    onChange={(event) => setLanguageQuery(event.target.value)}
                    placeholder={ui.languageSearch}
                    aria-label={ui.languageSearch}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <div className="language-options">
                  {filteredLanguages.length ? (
                    filteredLanguages.map(({ id, label, code }) => (
                      <button
                        key={id}
                        className={lang === id ? "active" : undefined}
                        aria-pressed={lang === id}
                        onClick={() => changeLanguage(id)}
                      >
                        <span>{label}</span>
                        <span className="language-choice-meta">
                          <span className="language-code">{code}</span>
                          {lang === id && <Check size={17} />}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="language-empty">{ui.noLanguage}</div>
                  )}
                </div>
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
                <EditableNumberInput
                  className="control pr-12"
                  type="number"
                  inputMode="decimal"
                  min=".1"
                  step=".1"
                  value={diameter}
                  onValueChange={setDiameter}
                />
              </Field>
              {tool.mode === "mill" && (
                <Field label={text.teeth} help={ui.teethHelp}>
                  <EditableNumberInput
                    className="control"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={teeth}
                    onValueChange={setTeeth}
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
                <EditableNumberInput
                  className="control pr-16"
                  type="number"
                  inputMode="numeric"
                  min="100"
                  step="100"
                  value={maxRpm}
                  disabled={!rpmLimitActive}
                  onValueChange={setMaxRpm}
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
                    {cameraState === "notice" ? (
                      <div className="camera-permission">
                        <ShieldCheck size={42} />
                        <strong>{ui.cameraRequired}</strong>
                        <p>{ui.cameraPrivacy}</p>
                        <button type="button" onClick={startCamera}>
                          <Camera size={18} />
                          {ui.cameraAllow}
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="scan-corners camera-frame">
                          {cameraState === "active" ? (
                            <video ref={videoRef} muted playsInline />
                          ) : (
                            <p>
                              {cameraState === "starting" ? ui.cameraStarting : cameraError}
                            </p>
                          )}
                          <span className="scan-line" />
                        </div>
                        <p>{ui.camera}</p>
                        {cameraState === "error" && (
                          <button type="button" onClick={startCamera}>
                            {ui.cameraRetry}
                          </button>
                        )}
                      </>
                    )}
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
                  <EditableNumberInput
                    className="control pr-12"
                    type="number"
                    inputMode="decimal"
                    min=".1"
                    step=".1"
                    value={threadPitch}
                    onValueChange={setThreadPitch}
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
                <EditableNumberInput
                  className="control pr-16"
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="1"
                  value={cuttingSpeed}
                  onValueChange={setCuttingSpeed}
                />
              </Field>
              <Field
                label={tool.mode === "mill" ? text.feedTooth : text.feedRev}
                help={tool.mode === "mill" ? ui.feedMillHelp : ui.feedRevHelp}
                suffix={tool.mode === "mill" ? units.tooth : units.rev}
              >
                <EditableNumberInput
                  className="control pr-14"
                  type="number"
                  inputMode="decimal"
                  min=".001"
                  step=".005"
                  value={feed}
                  onValueChange={setFeed}
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
                <button
                  className={cuttingSpeed === rangeLowSpeed ? "active" : undefined}
                  aria-pressed={cuttingSpeed === rangeLowSpeed}
                  onClick={() => setCuttingSpeed(rangeLowSpeed)}
                >
                  {cuttingSpeed === rangeLowSpeed && <Check size={15} />}
                  {text.gentle}
                </button>
                <button
                  className={
                    cuttingSpeed === recommendedSpeed ? "active" : undefined
                  }
                  aria-pressed={cuttingSpeed === recommendedSpeed}
                  onClick={() => setCuttingSpeed(recommendedSpeed)}
                >
                  {cuttingSpeed === recommendedSpeed && <Check size={15} />}
                  {text.start}
                </button>
                <button
                  className={
                    cuttingSpeed === rangeHighSpeed ? "active" : undefined
                  }
                  aria-pressed={cuttingSpeed === rangeHighSpeed}
                  onClick={() => setCuttingSpeed(rangeHighSpeed)}
                >
                  {cuttingSpeed === rangeHighSpeed && <Check size={15} />}
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
