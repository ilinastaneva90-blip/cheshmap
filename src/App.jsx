import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, CircleMarker } from 'react-leaflet';
import { Map, List, Gift, Navigation, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Compass, X, CheckCircle, BookOpen, ArrowDown, Camera, Menu as MenuIcon, Info, FileText, Phone, MapPin, Trophy, Heart, Filter } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import confetti from 'canvas-confetti';

// --- ЛОГО ---
const CheshMapLogo = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5 0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" clipRule="evenodd"/>
    <path d="M12 11.5c-1.38 0-2.5-1.12-2.5-2.5C9.5 7.62 12 5.5 12 5.5s2.5 2.12 2.5 3.5c0 1.38-1.12 2.5-2.5 2.5z" fill="white"/>
  </svg>
);

// --- ИКОНИ ЗА КАРТАТА ---
const createSvgMarkerIcon = (color) => {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1">
          <path fill-rule="evenodd" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5 0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          <path d="M12 11.5c-1.38 0-2.5-1.12-2.5-2.5C9.5 7.62 12 5.5 12 5.5s2.5 2.12 2.5 3.5c0 1.38-1.12 2.5-2.5 2.5z" fill="white"/>
        </svg>`;
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

const BlueMarkerIcon = L.icon({ iconUrl: createSvgMarkerIcon('#2563eb'), iconSize: [38, 38], iconAnchor: [19, 38], popupAnchor: [0, -38] });
const RedMarkerIcon = L.icon({ iconUrl: createSvgMarkerIcon('#dc2626'), iconSize: [48, 48], iconAnchor: [24, 48], popupAnchor: [0, -48] });
const GreenMarkerIcon = L.icon({ iconUrl: createSvgMarkerIcon('#16a34a'), iconSize: [38, 38], iconAnchor: [19, 38], popupAnchor: [0, -38] });

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&q=80&w=1000";

// --- ДАННИ (15 ЧЕШМИ) ---
const FOUNTAINS_DATA = [
  { 
    id: 1, 
    name: "Чешма Център", 
    coords: [41.61487552647749, 25.006342871370794], 
    description: "Главната, централна чешма на с.Баните, в непосредствена близост до Санаториума; Минерална вода – хипертермална 42⁰С, рН 9,4 с обща минерализация 0,94 g/l.", 
    features: ["Минерална вода", "Изворна вода", "Пейка"], 
    images: ["/images/1.jpg", "/images/2.jpg", "/images/3.jpg"] 
  },
  { 
    id: 2, 
    name: "Чешма Читалище", 
    coords: [41.614986938272715, 25.005367848566177], 
    description: "Най-удобната чешма за пълнене на минерална вода, разположена до централния паркинг. Четирите чучура са елегантно представени от статуята на млада девойка.", 
    features: ["Минерална вода", "Изворна вода", "Пейки", "Паркинг"], 
    images: ["/images/4.jpg", "/images/5.jpg"] 
  },
  { 
    id: 3, 
    name: "Чешма Родопчанка", 
    coords: [41.615373694868055, 25.004824986560823], 
    description: "Студена, бистра вода за разхлаждане на жарките летни дни.", 
    features: ["Изворна вода", "Паркинг"], 
    images: ["/images/6.jpg"] 
  },
  { 
    id: 4, 
    name: "Чешма до пощата", 
    coords: [41.615645142844194, 25.00388594955287], 
    description: "Красива възпоменателна чешма, идеална за отмора.", 
    features: ["Изворна вода", "Пейки", "Навес"], 
    images: ["/images/9.jpg"] 
  },
  { 
    id: 5, 
    name: "Чешма Здраве", 
    coords: [41.61610666310426, 24.999976654054453], 
    description: "Прекрасна беседка за събиране на компанията. Намира се точно на “входа” на с.Баните от към с.Оряховец. Има външен фитнес.", 
    features: ["Изворна вода", "Беседка", "Фитнес", "Гледка"], 
    images: ["/images/11.jpg"] 
  },
  { 
    id: 6, 
    name: "Чешма Родопа", 
    coords: [41.61365618919042, 25.006942385519846], 
    description: "Възпоменателна чешма намираща се в подножието на Параклис “Успение Пресвети Богородици”.", 
    features: ["Изворна вода", "Пейки"], 
    images: ["/images/8.jpg"] 
  },
  { 
    id: 7, 
    name: "Чешма Църквата", 
    coords: [41.613349373541986, 25.0068672836741], 
    description: "Беседка в подножието на Параклис “Успение Пресвети Богородици”, подходяща за събиране с приятели и изходен пункт към екопътеки.", 
    features: ["Изворна вода", "Беседка", "Гледка"], 
    images: [PLACEHOLDER_IMG] 
  },
  { 
    id: 8, 
    name: "Чешма Мечката", 
    coords: [41.61216974548534, 25.014001984963844], 
    description: "Емблематична чешма между с.Баните и с.Дрянка. Легендата гласи, че тук са си почивали мечкарите.", 
    features: ["Изворна вода", "Беседка", "Паркинг"], 
    images: ["/images/7.jpg"] 
  },
  { 
    id: 9, 
    name: "Чешмата на Емил Маджуров", 
    coords: [41.61771515490414, 25.012948903157618], 
    description: "Възпоменателна чешма с уникален реден камък. Място за отмора и глътка бистра вода.", 
    features: ["Изворна вода", "Пейки", "Навес", "Стенопис"], 
    images: ["/images/13.jpg"] 
  },
  { 
    id: 10, 
    name: "Малчевата чешма", 
    coords: [41.62068278273291, 25.007691773734983], 
    description: "Наричат я още „Любовната чешма“. Тук камъкът оживява в уникален стенопис, изобразяващ римски мост и родопски къщи. Дар от Мина и Илчо Малчеви за техните деца, но отворен с щедрост за всеки пътник.", 
    features: ["Изворна вода", "Беседка", "Барбекю", "Паркинг", "Стенопис"], 
    images: ["/images/17.jpg"] 
  },
  { 
    id: 11, 
    name: "Заевата чешма", 
    coords: [41.62521095851035, 24.96900607304783], 
    description: "Просторна беседка с всичко необходимо за да си прекарате един приятен следобед със семейство и приятели.", 
    features: ["Изворна вода", "Беседка", "Паркинг", "Барбекю"], 
    images: ["/images/12.jpg"] 
  },
  { 
    id: 12, 
    name: "Чешма Пожарната", 
    coords: [41.61765178981794, 24.995527755722257], 
    description: "Голяма беседка с дебела сянка, пазеща от жаркото слънце.", 
    features: ["Изворна вода", "Беседка"], 
    images: ["/images/10.jpg"] 
  },
  { 
    id: 13, 
    name: "Габера", 
    coords: [41.63176682163616, 24.996452785146516], 
    description: "Монолитна беседка за събиране на семейство и приятели. Интересен факт- всеки един от чучурите на чешмата е хванат от различна “майка”.", 
    features: ["Изворна вода", "Беседка", "Паркинг", "Огнище"], 
    images: ["/images/14.jpg"] 
  },
  { 
    id: 14, 
    name: "Чешма на Биляна и Илчо Русеви", 
    coords: [41.631878097265, 24.999013803178684], 
    description: "Тук ще опитате тествана изворна вода с изключително качествени показатели, а архитектурното майсторство и прекрасната градина ще ви оставят без думи.", 
    features: ["Изворна вода", "Беседка", "Гледка", "Паркинг"], 
    images: ["/images/15.jpg"] 
  },
  { 
    id: 15, 
    name: "Чешма Студената вода", 
    coords: [41.62614334832297, 24.99808113582526], 
    description: "Ледено студена вода под дебела сянка.", 
    features: ["Изворна вода", "Паркинг"], 
    images: ["/images/16.jpg"] 
  }
];

// --- COMPONENTS ---
const MapController = ({ targetCoords }) => {
    const map = useMap();
    useEffect(() => {
        if (targetCoords) {
            map.flyTo(targetCoords, 18, { animate: true, duration: 1.5 });
        }
    }, [targetCoords]);
    return null;
};

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  if (!images || images.length === 0) return <div className="h-full bg-gray-200 flex items-center justify-center text-gray-400">Няма снимка</div>;
  const nextSlide = (e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)); };
  const prevSlide = (e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); };

  return (
    <div className="relative w-full h-full bg-gray-100 group overflow-hidden">
      <img src={images[currentIndex]} alt="Cheshma" className="w-full h-full object-cover transition-all duration-500"/>
      {images.length > 1 && (
        <>
            <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"><ChevronLeft size={20} /></button>
            <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"><ChevronRight size={20} /></button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, idx) => (<div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`} />))}
            </div>
        </>
      )}
    </div>
  );
};

// --- MODAL ЗА ДЕТАЙЛИ НА КАРТАТА ---
const FountainDetailModal = ({ fountain, onClose, userLocation }) => {
    if (!fountain) return null;

    const dist = userLocation 
        ? getDistanceFromLatLonInKm(userLocation[0], userLocation[1], fountain.coords[0], fountain.coords[1]).toFixed(2)
        : null;

    return (
        <div className="absolute inset-0 z-[2000] flex flex-col justify-end sm:justify-center items-center pointer-events-none">
            {/* Тъмен фон */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose}></div>
            
            {/* Картата с детайли */}
            <div className="bg-white w-full max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300">
                
                {/* Хедър на картата */}
                <div className="relative h-64 shrink-0">
                    <ImageSlider images={fountain.images} />
                    <button onClick={onClose} className="absolute top-4 right-4 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors z-10">
                        <X size={24} className="text-gray-700" />
                    </button>
                    {dist && (
                        <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-blue-700 shadow-sm flex items-center gap-1">
                            📍 {dist} км
                        </div>
                    )}
                </div>

                {/* Съдържание */}
                <div className="p-6 overflow-y-auto">
                    <div className="flex justify-between items-start mb-2">
                        <h2 className="text-2xl font-bold text-slate-900 leading-tight">{fountain.name}</h2>
                    </div>

                    {/* Екстри */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {fountain.features?.map((feat, i) => (
                            <span key={i} className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100">
                                {feat}
                            </span>
                        ))}
                    </div>

                    {/* Описание (Пълно) */}
                    <div className="prose prose-sm text-gray-600 mb-6 leading-relaxed">
                        {fountain.description}
                    </div>

                    {/* Статус */}
                    {fountain.isFound ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3 text-green-800 font-bold text-sm mb-4">
                            <CheckCircle size={20} className="text-green-600" />
                            Обектът е открит!
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-3 text-gray-500 text-sm mb-4 italic">
                            <Camera size={20} />
                            Сканирай кода на място, за да отключиш.
                        </div>
                    )}

                    {/* Бутон за навигация */}
                    <a 
                        href={`http://googleusercontent.com/maps.google.com/maps?q=${fountain.coords[0]},${fountain.coords[1]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all no-underline"
                    >
                        <Navigation size={20} />
                        Навигирай до тук
                    </a>
                </div>
            </div>
        </div>
    );
};

// --- CARD В СПИСЪКА (С РАЗПЪВАНЕ) ---
const FountainListCard = ({ fountain, dist, onSelect }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Проверка дали текстът е дълъг (над 80 символа)
    const isLongText = fountain.description.length > 80;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col transition-all">
            <div className="aspect-video w-full relative">
                <ImageSlider images={fountain.images} />
                {dist && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
                        {dist} км
                    </div>
                )}
            </div>
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800 text-xl leading-tight">{fountain.name}</h3>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                    {fountain.features?.slice(0, 3).map((feat, i) => (
                        <span key={i} className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">{feat}</span>
                    ))}
                    {fountain.features?.length > 3 && <span className="text-[10px] text-gray-400">+{fountain.features.length - 3}</span>}
                </div>

                {/* Текст с разпъване */}
                <div className="text-sm text-gray-500 mb-4 leading-relaxed relative">
                    <p className={!isExpanded ? "line-clamp-2" : ""}>
                        {fountain.description}
                    </p>
                    {isLongText && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} 
                            className="text-blue-600 font-bold text-xs mt-1 hover:underline flex items-center gap-1"
                        >
                            {isExpanded ? "Скрий" : "Виж още..."}
                        </button>
                    )}
                </div>

                <button 
                    onClick={() => onSelect(fountain)} 
                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium py-3 rounded-lg flex items-center justify-center gap-2 border border-blue-100 transition-colors"
                >
                    <MapPin size={18} /> Виж на картата
                </button>
            </div>
        </div>
    );
};

// --- МЕНЮ АКОРДЕОН ---
const MenuItem = ({ icon: Icon, title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-100 last:border-0 pb-4">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full flex justify-between items-center py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
                <div className="flex items-center gap-3 text-blue-900 font-bold text-lg">
                    <Icon size={20} className="text-blue-600"/> {title}
                </div>
                {isOpen ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                <div className="text-gray-600 text-sm leading-relaxed pl-8 pr-2">
                    {children}
                </div>
            </div>
        </div>
    );
};

const SideMenu = ({ onClose }) => (
    <div className="fixed inset-0 z-[9999] bg-white text-slate-800 flex flex-col animate-in slide-in-from-left duration-300">
        <div className="bg-blue-600 text-white p-6 flex justify-between items-center shadow-md shrink-0">
            <h2 className="text-2xl font-bold flex items-center gap-2"><CheshMapLogo size={28}/> CheshMap Меню</h2>
            <button onClick={onClose} className="p-2 hover:bg-blue-700 rounded-full"><X size={28}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <MenuItem icon={Info} title="За Община Баните">
                Ти се намираш в минералното сърце на Родопа планина. Тук, водата и хората лекуват, затова специално за теб създадохме маршрут от история, култура и традиции. 
                <br/><br/>
                В приложението CheshMap ще откриеш някои от най-интересните и значими чешми в региона.
                <br/><br/>
                <strong className="text-blue-700">Община Баните ти пожелава незабравимо приключение по Пътя на водата!</strong>
            </MenuItem>
            
            <MenuItem icon={Heart} title="Защо чешми?">
                <strong className="text-blue-700">Повече от просто вода</strong>
                <br/><br/>
                В Родопите водата е свещена, а чешмата е памет. Тук хората не градят просто извори – те съграждат „хаир“ (добротворство). 
                <br/><br/>
                Всяка чешма и беседка по пътя ти е построена с мисъл за пътника – да спреш, да отпиеш ледена вода, да починеш под сянката и да благословиш майстора.
                <br/><br/>
                В община Баните водата лекува не само тялото, но и душата. Създадохме този маршрут, за да ти покажем скритите архитектурни бижута на нашия край – местата, където местните се събират, празнуват и споделят.
            </MenuItem>

            <MenuItem icon={Camera} title="Как работи играта?">
                <strong className="text-blue-700">Предизвикателството в Стъпки:</strong>
                <br/><br/>
                📍 <strong>1. Открий:</strong> Използвай картата, за да намериш маркираните чешми и кътове за отдих.
                <br/><br/>
                📸 <strong>2. Сканирай:</strong> На всяка чешма има скрит QR код. Сканирай го с камерата на телефона си, за да "отключиш" обекта.
                <br/><br/>
                🏆 <strong>3. Спечели:</strong> Събери всички кодове и ела в Туристическия център на Община Баните, за да получиш своя сертификат "Пазител на водата" и специален подарък.
            </MenuItem>

            <MenuItem icon={Phone} title="Контакти">
                <strong>Община Баните</strong><br/>
                с. Баните, ул. "Стефан Стамболов" 3<br/>
                тел: 03025/22-20<br/>
                email: obbanite@abv.bg
            </MenuItem>
        </div>
        <div className="p-4 bg-gray-50 text-center text-xs text-gray-400 border-t border-gray-200 shrink-0">
            CheshMap v1.0 • 2026
        </div>
    </div>
);

// --- СЕРТИФИКАТ (ФИНАЛ) ---
const VictoryModal = ({ onClose }) => {
    useEffect(() => {
        try { confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } }); } catch(e) {}
    }, []);

    return (
        <div className="fixed inset-0 z-[6000] bg-black/80 flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-500">
            <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative">
                <div className="bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 p-6 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-50" style={{backgroundImage: 'radial-gradient(circle, white 2px, transparent 2.5px)', backgroundSize: '20px 20px'}}></div>
                    <Trophy size={64} className="text-white mx-auto drop-shadow-md relative z-10 mb-2" />
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest drop-shadow-sm relative z-10">ПОБЕДА!</h2>
                </div>
                <div className="p-6 text-center space-y-4">
                    <h3 className="text-xl font-bold text-blue-900">Ти премина Пътя на водата! 🎉</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        Поздравления! Ти обиколи най-емблематичните кътчета на община Баните и се докосна до магията на Родопа планина.
                    </p>
                    
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-left space-y-2 mt-2">
                        <p className="font-bold text-blue-800 text-sm text-center mb-2">Твоят сертификат и подарък те очакват!</p>
                        <div className="text-xs text-gray-700 space-y-1.5">
                            <p>📍 <strong>Къде:</strong> Община Баните, Информационен център</p>
                            <p>⏰ <strong>Работно време:</strong> Пон-Пет, 08:00 - 17:00 ч.</p>
                            <p>📞 <strong>Телефон за връзка:</strong> 0883 33 71 81</p>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors">ЗАТВОРИ</button>
            </div>
        </div>
    );
};

// --- TUTORIAL ---
const TutorialOverlay = ({ step, onNext, onFinish }) => {
    return (
        <div className="fixed inset-0 z-[4000] bg-black/70 flex flex-col animate-in fade-in duration-300" onClick={onNext}>
            {step === 1 && (
                <div className="absolute bottom-20 left-4 text-white max-w-xs">
                    <div className="bg-blue-600 p-4 rounded-xl shadow-xl border-2 border-white/30 mb-2 animate-pulse-slow origin-bottom-left">
                        <h3 className="font-bold text-lg mb-1">Разгледайте картата</h3>
                        <p className="text-sm opacity-90">Менюто долу ви позволява да виждате списък с всички обекти.</p>
                    </div>
                    <ArrowDown size={40} className="text-white ml-6 animate-bounce" />
                </div>
            )}
            {step === 2 && (
                <div className="absolute bottom-40 right-4 text-white max-w-xs flex flex-col items-end">
                    <div className="bg-blue-600 p-4 rounded-xl shadow-xl border-2 border-white/30 mb-2 text-right animate-pulse-slow origin-bottom-right">
                        <h3 className="font-bold text-lg mb-1 flex items-center justify-end gap-2"><Compass size={20}/> Вашето начало</h3>
                        <p className="text-sm opacity-90">Натиснете тук, за да намерите най-близката чешма.</p>
                    </div>
                    <ArrowDown size={40} className="text-white mr-8 animate-bounce" />
                </div>
            )}
            {step === 3 && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-white text-slate-800 p-6 rounded-3xl shadow-2xl max-w-sm border-4 border-blue-500 animate-in zoom-in duration-500">
                        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Camera size={32} className="text-blue-600"/>
                        </div>
                        <h3 className="font-bold text-xl mb-2">Как се отключва чешма?</h3>
                        <p className="text-gray-600 mb-4">Намерете стикера на чешмата и <strong>сканирайте QR кода с камерата на телефона</strong>.</p>
                        <button onClick={(e) => { e.stopPropagation(); onFinish(); }} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm">Разбрах</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- WELCOME (НАЧАЛЕН ЕКРАН) ---
const WelcomeScreen = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-[4000] bg-gradient-to-br from-cyan-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-between p-6 text-center animate-in fade-in duration-1000 overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto mt-10">
          <div className="bg-white/10 p-5 rounded-full mb-6 backdrop-blur-md border border-white/20 shadow-[0_0_30px_rgba(59,130,246,0.3)] animate-pulse">
             <CheshMapLogo size={64} className="text-cyan-300 drop-shadow-lg" />
          </div>
          
          <h1 className="text-5xl font-extrabold mb-1 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-white">CheshMap</h1>
          <p className="text-cyan-200/80 text-sm font-light tracking-widest uppercase mb-8">Приложение на община Баните</p>
          
          <div className="bg-black/30 p-6 rounded-3xl backdrop-blur-md w-full mb-8 border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold mb-3 text-white">Пътят на водата<br/> <span className="text-xl font-normal text-cyan-200">Открий душата на Родопа планина</span></h2>
            <p className="text-sm leading-relaxed mb-0 text-gray-200 font-light">
                Обиколи едни от най-красивите чешми на община Баните, събери кодовете и стани част от легендата.
            </p>
          </div>

          <button onClick={onStart} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg shadow-cyan-500/30 hover:scale-105 hover:shadow-cyan-500/50 active:scale-95 transition-all flex items-center gap-2 mb-10">
            Започни приключението <ChevronRight />
          </button>
      </div>
      <div className="w-full pb-4">
        <p className="text-[11px] text-cyan-200/60 font-light flex flex-col items-center gap-1 text-center px-4">
            Вдъхновено от труда на Маргарита и Алекси Димитрови
        </p>
      </div>
    </div>
  );
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; var dLat = deg2rad(lat2-lat1); var dLon = deg2rad(lon2-lon1); 
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); return R * c; 
}
function deg2rad(deg) { return deg * (Math.PI/180) }

const STORAGE_KEY = 'cheshmap_progress_v1';
const TUTORIAL_KEY = 'cheshmap_tutorial_seen_v1';
const getSavedProgress = () => { try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : []; } catch (e) { return []; } };
const saveProgress = (ids) => { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); };

// --- MAIN APP ---
export default function App() {
  const [showWelcome, setShowWelcome] = useState(false); 
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [fountains, setFountains] = useState(FOUNTAINS_DATA.map(f => ({...f, isFound: false})));
  const [foundCount, setFoundCount] = useState(0);
  const [flyToCoords, setFlyToCoords] = useState(null);
  const [findingNearest, setFindingNearest] = useState(false);
  
  // States for target logic
  const [nearestResult, setNearestResult] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(null);

  // NEW: State for selected fountain modal
  const [selectedFountain, setSelectedFountain] = useState(null);

  // Извличане на всички уникални екстри за филтъра
  const uniqueFeatures = useMemo(() => {
    const allFeatures = new Set();
    FOUNTAINS_DATA.forEach(f => f.features?.forEach(feat => allFeatures.add(feat)));
    return Array.from(allFeatures).sort();
  }, []);

  useEffect(() => {
    // Вземаме само прогреса, без GPS
    const savedIds = getSavedProgress();
    const params = new URLSearchParams(window.location.search);
    const scanId = parseInt(params.get('scan'));
    const tutorialSeen = localStorage.getItem(TUTORIAL_KEY);
    let newFoundId = null;

    if (scanId && FOUNTAINS_DATA.find(f => f.id === scanId)) {
        if (!savedIds.includes(scanId)) { savedIds.push(scanId); saveProgress(savedIds); newFoundId = scanId; } 
        else { newFoundId = scanId; }
    }
    const updatedFountains = FOUNTAINS_DATA.map(f => ({ ...f, isFound: savedIds.includes(f.id) }));
    setFountains(updatedFountains);
    setFoundCount(savedIds.length);

    if (newFoundId) {
        const found = FOUNTAINS_DATA.find(f => f.id === newFoundId);
        setActiveTab('map'); setFlyToCoords(found.coords); setScanResult(found);
        setTimeout(() => setScanResult(null), 6000);
        if (savedIds.length === FOUNTAINS_DATA.length) { setTimeout(() => setShowVictory(true), 2000); }
    } else {
        if (!tutorialSeen) { setShowWelcome(true); }
    }
    if (scanId) { window.history.replaceState({}, document.title, "/"); }
  }, []);

  // Функция за пускане на локация
  const enableLocationForList = () => {
    if (!navigator.geolocation) { alert("Браузърът не поддържа GPS."); return; }
    navigator.geolocation.getCurrentPosition(
        (position) => { setUserLocation([position.coords.latitude, position.coords.longitude]); },
        (error) => { console.error(error); alert("Моля, разрешете GPS."); }
    );
  };

  const findNearestFountain = () => {
    if (!navigator.geolocation) { alert("Браузърът ви не поддържа локализация."); return; }
    setFindingNearest(true); setNearestResult(null);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLat = position.coords.latitude; const userLng = position.coords.longitude;
            setUserLocation([userLat, userLng]);
            let minDistance = Infinity; let nearestId = null;
            fountains.forEach(f => {
                const dist = getDistanceFromLatLonInKm(userLat, userLng, f.coords[0], f.coords[1]);
                if (dist < minDistance) { minDistance = dist; nearestId = f.id; }
            });
            if (nearestId) {
                const nearest = fountains.find(f => f.id === nearestId);
                setActiveTab('map'); setFlyToCoords(nearest.coords);
                setNearestResult({ id: nearest.id, name: nearest.name, dist: minDistance.toFixed(2) });
                // NEW: Open modal immediately
                setSelectedFountain(nearest);
            }
            setFindingNearest(false);
        },
        (error) => { console.error(error); alert("Моля, разрешете GPS."); setFindingNearest(false); }
    );
  };

  const startApp = () => { setShowWelcome(false); setTutorialStep(1); };
  const finishTutorial = () => { setTutorialStep(0); localStorage.setItem(TUTORIAL_KEY, 'true'); };
  const nextTutorialStep = () => { if (tutorialStep < 3) { setTutorialStep(prev => prev + 1); } else { finishTutorial(); } };

  const selectFountainFromList = (fountain) => {
      setActiveTab('map'); 
      setFlyToCoords(fountain.coords); 
      setNearestResult(null);
      // Open the modal
      setSelectedFountain(fountain);

      navigator.geolocation.getCurrentPosition((pos) => { setUserLocation([pos.coords.latitude, pos.coords.longitude]); }, () => {}, {timeout: 5000});
  };

  // ФИЛТРИРАНЕ + СОРТИРАНЕ
  const processFountains = (list) => {
    // 1. Филтриране
    let filtered = list;
    if (selectedFilter) {
        filtered = list.filter(f => f.features && f.features.includes(selectedFilter));
    }
    
    // 2. Сортиране по дистанция (ако има GPS)
    if (userLocation) {
        return [...filtered].sort((a, b) => {
            const distA = getDistanceFromLatLonInKm(userLocation[0], userLocation[1], a.coords[0], a.coords[1]);
            const distB = getDistanceFromLatLonInKm(userLocation[0], userLocation[1], b.coords[0], b.coords[1]);
            return distA - distB;
        });
    }
    
    return filtered;
  };

  if (showWelcome) return <WelcomeScreen onStart={startApp} />;

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 text-slate-800 font-sans relative">
      {tutorialStep > 0 && <TutorialOverlay step={tutorialStep} onNext={nextTutorialStep} onFinish={finishTutorial} />}
      {showMenu && <SideMenu onClose={() => setShowMenu(false)} />}
      {showVictory && <VictoryModal onClose={() => setShowVictory(false)} />}

      <header className="bg-blue-600 text-white p-4 shadow-lg z-10 flex justify-between items-center relative shrink-0">
        <div className="flex items-center gap-2 cursor-pointer active:opacity-80 transition-opacity" onClick={() => setShowMenu(true)}>
            <div className="bg-white p-1.5 rounded-full"><CheshMapLogo className="text-blue-600 w-6 h-6" /></div>
            <div><h1 className="text-xl font-bold tracking-wide leading-none">CheshMap</h1><span className="text-[10px] text-blue-200 uppercase tracking-widest flex items-center gap-1">Меню <MenuIcon size={10}/></span></div>
        </div>
        <button onClick={() => setActiveTab('list')} className="text-sm font-bold bg-blue-700 hover:bg-blue-800 px-4 py-1.5 rounded-full shadow-inner flex items-center gap-2 transition-colors"><span>{foundCount} / {fountains.length}</span><span className="text-[10px] opacity-70 uppercase">Открити</span></button>
      </header>

      <main className="flex-1 relative overflow-hidden">
        {activeTab === 'map' && (
          <div className="h-full w-full relative">
            <MapContainer center={[41.6167, 25.0167]} zoom={14} style={{ height: "100%", width: "100%" }} zoomControl={false}>
              <TileLayer attribution='© OSM' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapController targetCoords={flyToCoords} />
              {userLocation && <CircleMarker center={userLocation} pathOptions={{ color: 'white', fillColor: '#2563eb', fillOpacity: 1 }} radius={8}><Popup>📍 Вие сте тук</Popup></CircleMarker>}
              
              {fountains.map(fountain => (
                <Marker 
                    key={fountain.id} 
                    position={fountain.coords}
                    icon={fountain.isFound ? GreenMarkerIcon : BlueMarkerIcon}
                    eventHandlers={{
                        click: () => {
                            setSelectedFountain(fountain);
                            setFlyToCoords(fountain.coords);
                        },
                    }}
                />
              ))}
            </MapContainer>
            
            {/* NEW MODAL OVERLAY */}
            <FountainDetailModal 
                fountain={selectedFountain} 
                onClose={() => setSelectedFountain(null)} 
                userLocation={userLocation}
            />

            {scanResult && (
                <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur shadow-xl rounded-xl p-4 border-l-4 border-green-500 z-[1000] animate-in fade-in slide-in-from-top-4 duration-500 max-w-md mx-auto">
                    <div className="flex justify-between items-start">
                        <div><p className="text-xs text-green-600 font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle size={14} /> УСПЕХ!</p><h3 className="text-lg font-bold text-gray-800">Открихте: {scanResult.name}</h3></div>
                        <button onClick={() => setScanResult(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-400" /></button>
                    </div>
                </div>
            )}

            <button onClick={findNearestFountain} disabled={findingNearest} className="absolute bottom-24 right-4 z-[999] bg-white text-blue-600 p-3 rounded-full shadow-xl border border-blue-100 active:scale-95 transition-all flex items-center gap-2 font-bold text-sm">
                <Compass className={`w-6 h-6 ${findingNearest ? 'animate-spin' : ''}`} />{findingNearest ? 'Най-близка чешма' : 'Най-близка чешма'}
            </button>
          </div>
        )}

        {activeTab === 'list' && (
          <div className="p-4 overflow-y-auto h-full pb-24 max-w-md mx-auto w-full">
            {/* БУТОН ЗА ВКЛЮЧВАНЕ НА ЛОКАЦИЯ */}
            {!userLocation && (
                <button onClick={enableLocationForList} className="w-full bg-blue-100 text-blue-700 text-xs font-bold py-3 px-4 rounded-xl mb-4 flex items-center justify-center gap-2 border border-blue-200 animate-pulse">
                    <MapPin size={16} /> Включи локация за разстояние
                </button>
            )}

            {/* ЛЕНТА С ФИЛТРИ */}
            <div className="mb-4">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button 
                        onClick={() => setSelectedFilter(null)}
                        className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${!selectedFilter ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}
                    >
                        Всички
                    </button>
                    {uniqueFeatures.map(feat => (
                        <button 
                            key={feat}
                            onClick={() => setSelectedFilter(selectedFilter === feat ? null : feat)}
                            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedFilter === feat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                            {feat}
                        </button>
                    ))}
                </div>
            </div>

            {foundCount > 0 && processFountains(fountains.filter(f => f.isFound)).length > 0 && (
                <div className="mb-6">
                    <h2 className="text-sm font-bold text-green-600 uppercase tracking-wider mb-3 flex items-center gap-2 bg-green-50 p-2 rounded-lg border border-green-100"><CheckCircle size={16}/> Вече открити</h2>
                    <div className="space-y-4">
                        {processFountains(fountains.filter(f => f.isFound)).map(fountain => (
                            <div key={fountain.id} className="bg-white rounded-xl shadow border border-green-200 overflow-hidden flex opacity-90">
                                <div className="w-24 h-24 shrink-0"><img src={fountain.images[0]} className="w-full h-full object-cover"/></div>
                                <div className="p-3 flex flex-col justify-center">
                                    <h3 className="font-bold text-slate-800 text-sm">{fountain.name}</h3>
                                    <p className="text-xs text-green-600 font-medium mt-1">✅ Добавена в колекцията</p>
                                    <button onClick={() => selectFountainFromList(fountain)} className="mt-2 text-xs text-blue-600 font-bold underline text-left">Виж на картата</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div>
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2 bg-gray-100 p-2 rounded-lg border border-gray-200"><Compass size={16}/> Очакващи откриване</h2>
                <div className="space-y-6">
                    {processFountains(fountains.filter(f => !f.isFound)).length === 0 ? (
                        <div className="text-center p-10 text-gray-400 text-sm italic">Няма намерени обекти с този филтър.</div>
                    ) : (
                        processFountains(fountains.filter(f => !f.isFound)).map(fountain => (
                            <FountainListCard 
                                key={fountain.id} 
                                fountain={fountain} 
                                dist={userLocation ? getDistanceFromLatLonInKm(userLocation[0], userLocation[1], fountain.coords[0], fountain.coords[1]).toFixed(2) : null}
                                onSelect={selectFountainFromList} 
                            />
                        ))
                    )}
                </div>
            </div>
          </div>
        )}

        {activeTab === 'reward' && (
            <div className="p-6 h-full flex flex-col items-center justify-center text-center bg-white pb-24">
                <div className="bg-yellow-50 p-8 rounded-full mb-6 border-4 border-yellow-100"><Gift className="w-16 h-16 text-yellow-500" /></div>
                <h2 className="text-2xl font-extrabold text-slate-800 mb-3">Вашата Награда</h2>
                {foundCount === fountains.length ? (
                     <div className="space-y-4">
                        <p className="text-green-600 font-bold text-lg animate-pulse">ВИЕ УСПЯХТЕ!</p>
                        <button onClick={() => setShowVictory(true)} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-4 px-8 rounded-full shadow-xl text-xl hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
                            <Trophy size={24}/> ВЗЕМИ СЕРТИФИКАТ
                        </button>
                     </div>
                ) : (
                    <>
                        <p className="text-gray-600 mb-8 max-w-xs mx-auto leading-relaxed">Открийте всички <strong>15 чешми</strong> в района, за да отключите Вашия подарък!</p>
                        <div className="w-full max-w-xs bg-gray-100 rounded-full h-6 mb-3 overflow-hidden border border-gray-200"><div className="bg-gradient-to-r from-blue-500 to-blue-400 h-full transition-all duration-1000 ease-out" style={{ width: `${(foundCount / fountains.length) * 100}%` }}></div></div>
                        <p className="text-sm font-medium text-gray-500">Прогрес: {foundCount} / {fountains.length}</p>
                    </>
                )}
            </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.03)] z-[9999] max-w-md mx-auto w-full">
        <button onClick={() => {setActiveTab('map'); setShowMenu(false);}} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'map' ? 'text-blue-600 scale-105' : 'text-gray-400'}`}><Map size={24} strokeWidth={activeTab === 'map' ? 2.5 : 2} /><span className="text-[10px] font-medium mt-1">Карта</span></button>
        <button onClick={() => {setActiveTab('list'); setShowMenu(false);}} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'list' ? 'text-blue-600 scale-105' : 'text-gray-400'}`}><List size={24} strokeWidth={activeTab === 'list' ? 2.5 : 2} /><span className="text-[10px] font-medium mt-1">Списък</span></button>
        <button onClick={() => {setActiveTab('reward'); setShowMenu(false);}} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'reward' ? 'text-blue-600 scale-105' : 'text-gray-400'}`}><Gift size={24} strokeWidth={activeTab === 'reward' ? 2.5 : 2} /><span className="text-[10px] font-medium mt-1">Награда</span></button>
      </nav>
    </div>
  );
}