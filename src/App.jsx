import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import { Map, List, Gift, Navigation, Compass, X, CheckCircle, Camera, Menu as MenuIcon, Info, Heart, MapPin, Trophy, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
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

// --- ИКОНИ ---
const createSvgMarkerIcon = (color, size) => {
    // По-голям и ясен маркер
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2">
          <path fill-rule="evenodd" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5 0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          <circle cx="12" cy="9" r="2.5" fill="white"/>
        </svg>`;
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

const BlueMarkerIcon = L.icon({ iconUrl: createSvgMarkerIcon('#2563eb'), iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -36] });
const GreenMarkerIcon = L.icon({ iconUrl: createSvgMarkerIcon('#16a34a'), iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -36] });
// Специален голям червен маркер за избраната чешма
const RedMarkerIcon = L.icon({ iconUrl: createSvgMarkerIcon('#dc2626'), iconSize: [55, 55], iconAnchor: [27, 55], popupAnchor: [0, -50] });

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&q=80&w=1000";

// --- ДАННИ (15 ЧЕШМИ) ---
const FOUNTAINS_DATA = [
  { 
    id: 1, 
    name: "Чешма Център", 
    coords: [41.61487552647749, 25.006342871370794], 
    description: "Главната, централна чешма на с.Баните, в непосредствена близост до Санаториума. Минерална вода – хипертермална 42⁰С, рН 9,4 с обща минерализация 0,94 g/l.", 
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
    description: "Наричат я още „Любовната чешма“. \n\nТук камъкът оживява в уникален стенопис, изобразяващ римски мост и родопски къщи. Дар от Мина и Илчо Малчеви за техните деца, но отворен с щедрост за всеки пътник.", 
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

// --- HELPER FUNCTIONS ---
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; 
  var dLat = (lat2-lat1) * (Math.PI/180); 
  var dLon = (lon2-lon1) * (Math.PI/180); 
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
}

// --- COMPONENTS ---
const MapController = ({ targetCoords, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (targetCoords) {
            map.flyTo(targetCoords, zoom || 16, { animate: true, duration: 1.5 });
        }
    }, [targetCoords, zoom, map]);
    return null;
};

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!images || images.length === 0) return <div className="h-full bg-gray-200 flex items-center justify-center text-gray-400">Няма снимка</div>;

  const nextSlide = (e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)); };
  const prevSlide = (e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); };

  return (
    <div className="relative w-full h-full bg-gray-100 group overflow-hidden">
      <img 
        src={images[currentIndex]} 
        alt="Cheshma" 
        className="w-full h-full object-cover" 
        onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
      />
      {images.length > 1 && (
        <>
            <button onClick={prevSlide} className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"><ChevronLeft size={20} /></button>
            <button onClick={nextSlide} className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"><ChevronRight size={20} /></button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, idx) => (<div key={idx} className={`w-1.5 h-1.5 rounded-full shadow ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`} />))}
            </div>
        </>
      )}
    </div>
  );
};

// --- SIDE MENU ---
const MenuItem = ({ icon: Icon, title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-100 last:border-0 pb-4">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3 text-blue-900 font-bold text-lg"><Icon size={20} className="text-blue-600"/> {title}</div>
                {isOpen ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
            </button>
            <div className={`${isOpen ? 'block' : 'hidden'} mt-2`}>
                <div className="text-slate-700 text-sm leading-relaxed pl-8 pr-2 font-medium">{children}</div>
            </div>
        </div>
    );
};

const SideMenu = ({ onClose }) => (
    <div className="fixed inset-0 z-[5000] flex">
        {/* Тъмен фон */}
        <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
        {/* Самото меню */}
        <div className="relative bg-white w-4/5 max-w-xs h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="bg-blue-600 text-white p-6 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold flex items-center gap-2"><CheshMapLogo size={24}/> Меню</h2>
                <button onClick={onClose}><X size={28}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <MenuItem icon={Info} title="За Община Баните">Ти се намираш в минералното сърце на Родопа планина...</MenuItem>
                <MenuItem icon={Heart} title="Защо чешми?">В Родопите водата е свещена, а чешмата е памет...</MenuItem>
                <MenuItem icon={Camera} title="Как се играе?">1. Открий. 2. Сканирай. 3. Спечели.</MenuItem>
                <MenuItem icon={Phone} title="Контакти">Община Баните<br/>тел: 03025/22-20</MenuItem>
            </div>
            <div className="p-4 bg-gray-50 text-center text-xs text-gray-400 border-t">CheshMap v1.0 • 2026</div>
        </div>
    </div>
);

// --- MAIN APP ---
export default function App() {
  const [showWelcome, setShowWelcome] = useState(false); 
  const [showMenu, setShowMenu] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [fountains, setFountains] = useState(FOUNTAINS_DATA.map(f => ({...f, isFound: false})));
  const [foundCount, setFoundCount] = useState(0);
  const [flyToCoords, setFlyToCoords] = useState(null);
  const [targetFountainId, setTargetFountainId] = useState(null); // За червения маркер
  const [findingNearest, setFindingNearest] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [nearestMessage, setNearestMessage] = useState(null); // Съобщение за най-близката
  const [selectedFilter, setSelectedFilter] = useState(null);

  // Load Initial State
  useEffect(() => {
    try {
        const saved = localStorage.getItem('cheshmap_progress_v1');
        const savedIds = saved ? JSON.parse(saved) : [];
        const seen = localStorage.getItem('cheshmap_tutorial_seen_v1');
        
        // Scan Logic
        const params = new URLSearchParams(window.location.search);
        const scanId = parseInt(params.get('scan'));
        
        if (scanId && FOUNTAINS_DATA.find(f => f.id === scanId)) {
            if (!savedIds.includes(scanId)) { 
                savedIds.push(scanId); 
                localStorage.setItem('cheshmap_progress_v1', JSON.stringify(savedIds)); 
            }
            const found = FOUNTAINS_DATA.find(f => f.id === scanId);
            setActiveTab('map'); 
            setFlyToCoords(found.coords); 
            setTargetFountainId(found.id);
            setScanResult(found);
            setTimeout(() => setScanResult(null), 5000);
            if (savedIds.length === FOUNTAINS_DATA.length) setTimeout(() => setShowVictory(true), 1500);
        } else if (!seen) {
            setShowWelcome(true);
        }
        
        setFountains(FOUNTAINS_DATA.map(f => ({ ...f, isFound: savedIds.includes(f.id) })));
        setFoundCount(savedIds.length);
        if (scanId) window.history.replaceState({}, document.title, "/");
    } catch(e) { console.error(e); }
  }, []);

  const uniqueFeatures = useMemo(() => {
    const all = new Set();
    FOUNTAINS_DATA.forEach(f => f.features?.forEach(feat => all.add(feat)));
    return Array.from(all).sort();
  }, []);

  // Filter Logic
  const filteredFountains = useMemo(() => {
    let list = fountains;
    if (selectedFilter) list = list.filter(f => f.features && f.features.includes(selectedFilter));
    if (userLocation) {
        return [...list].sort((a,b) => {
            const dA = getDistanceFromLatLonInKm(userLocation[0], userLocation[1], a.coords[0], a.coords[1]);
            const dB = getDistanceFromLatLonInKm(userLocation[0], userLocation[1], b.coords[0], b.coords[1]);
            return dA - dB;
        });
    }
    return list;
  }, [fountains, selectedFilter, userLocation]);

  // Actions
  const enableLocationForList = () => {
    if (!navigator.geolocation) return alert("Браузърът не поддържа GPS.");
    navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => alert("Моля, разрешете GPS.")
    );
  };

  const findNearestFountain = () => {
    if (!navigator.geolocation) return alert("GPS не се поддържа.");
    setFindingNearest(true);
    setNearestMessage(null);
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const uLat = pos.coords.latitude, uLng = pos.coords.longitude;
            setUserLocation([uLat, uLng]);
            let min = Infinity, nearest = null;
            fountains.forEach(f => {
                const d = getDistanceFromLatLonInKm(uLat, uLng, f.coords[0], f.coords[1]);
                if (d < min) { min = d; nearest = f; }
            });
            if (nearest) {
                setActiveTab('map');
                setTargetFountainId(nearest.id); // Правим го червен
                setFlyToCoords(nearest.coords); // Летим до него
                setNearestMessage(`Най-близка: ${nearest.name}`); // Показваме съобщение
                setTimeout(() => setNearestMessage(null), 5000);
            }
            setFindingNearest(false);
        },
        () => { alert("Не мога да ви намеря."); setFindingNearest(false); },
        { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const onSelectFromList = (f) => {
      setActiveTab('map');
      setTargetFountainId(f.id); // Правим го червен
      setFlyToCoords(f.coords); // Летим
  };

  // Welcome Screen Component
  if (showWelcome) return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-cyan-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500 overflow-y-auto">
      <div className="max-w-sm mx-auto mt-10">
          <div className="bg-white/10 p-5 rounded-full mb-6 backdrop-blur-md border border-white/20 shadow-xl inline-block">
             <CheshMapLogo size={64} className="text-cyan-300 drop-shadow-lg" />
          </div>
          <h1 className="text-5xl font-extrabold mb-1 tracking-tight">CheshMap</h1>
          <p className="text-cyan-200/80 text-sm font-light tracking-widest uppercase mb-8">Приложение на община Баните</p>
          <div className="bg-black/30 p-6 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl mb-8">
            <h2 className="text-2xl font-bold mb-3 text-white">Пътят на водата<br/> <span className="text-xl font-normal text-cyan-200">Открий душата на Родопа планина</span></h2>
            <p className="text-sm leading-relaxed mb-0 text-gray-200 font-light">
                Обиколи едни от най-красивите чешми на община Баните, събери кодовете и стани част от легендата.
            </p>
          </div>
          <button onClick={() => {setShowWelcome(false); localStorage.setItem('cheshmap_tutorial_seen_v1', 'true');}} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg transition-all flex items-center gap-2 mx-auto">
            Започни приключението <ChevronRight />
          </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 text-slate-800 font-sans relative overflow-hidden">
      {showMenu && <SideMenu onClose={() => setShowMenu(false)} />}
      {showVictory && <VictoryModal onClose={() => setShowVictory(false)} />}

      <header className="bg-blue-600 text-white p-4 shadow-md z-10 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowMenu(true)}>
            <div className="bg-white p-1.5 rounded-full"><CheshMapLogo className="text-blue-600 w-6 h-6" /></div>
            <div><h1 className="text-xl font-bold tracking-wide leading-none">CheshMap</h1><span className="text-[10px] text-blue-200 uppercase tracking-widest flex items-center gap-1">Меню <MenuIcon size={10}/></span></div>
        </div>
        <button onClick={() => setActiveTab('list')} className="text-sm font-bold bg-blue-700 hover:bg-blue-800 px-4 py-1.5 rounded-full shadow-inner flex items-center gap-2 transition-colors"><span>{foundCount} / {fountains.length}</span><span className="text-[10px] opacity-70 uppercase">Открити</span></button>
      </header>

      <main className="flex-1 relative overflow-hidden">
        {activeTab === 'map' && (
          <div className="h-full w-full relative z-0">
            <MapContainer center={[41.6167, 25.0167]} zoom={14} style={{ height: "100%", width: "100%" }} zoomControl={false}>
              <TileLayer attribution='&copy; OSM' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapController targetCoords={flyToCoords} zoom={16} />
              {userLocation && <CircleMarker center={userLocation} pathOptions={{ color: 'white', fillColor: '#2563eb', fillOpacity: 1 }} radius={8}><Popup>📍 Вие сте тук</Popup></CircleMarker>}
              
              {fountains.map(f => {
                  // Избираме икона: Ако е таргет -> Червена, иначе ако е намерена -> Зелена, иначе -> Синя
                  const icon = (targetFountainId === f.id) ? RedMarkerIcon : (f.isFound ? GreenMarkerIcon : BlueMarkerIcon);
                  // Z-index: Таргетът е най-отгоре (1000), другите са 0
                  const zIndex = (targetFountainId === f.id) ? 1000 : 0;

                  return (
                    <Marker 
                        key={f.id} 
                        position={f.coords} 
                        icon={icon} 
                        zIndexOffset={zIndex}
                        eventHandlers={{ click: () => { setFlyToCoords(f.coords); setTargetFountainId(f.id); } }}
                    >
                        <Popup className="custom-popup" maxWidth={300} minWidth={280}>
                            <div className="flex flex-col w-full rounded-lg overflow-hidden p-0 m-0">
                                <div className="w-full h-40 relative bg-gray-100">
                                    <ImageSlider images={f.images} />
                                </div>
                                <div className="p-3">
                                    <h3 className="font-bold text-lg mb-1">{f.name}</h3>
                                    <div className="text-sm text-gray-600 mb-3 line-clamp-4">{f.description}</div>
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {f.features?.map((feat, i) => <span key={i} className="text-[10px] bg-gray-100 px-2 py-1 rounded border">{feat}</span>)}
                                    </div>
                                    {/* ОФИЦИАЛЕН ЛИНК ЗА GOOGLE MAPS NAVIGATION */}
                                    <a 
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${f.coords[0]},${f.coords[1]}`}
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-bold text-sm mb-2 no-underline shadow-md"
                                    >
                                        Навигирай до тук
                                    </a>
                                    {f.isFound ? <div className="text-green-600 font-bold text-xs text-center">✅ Открита</div> : <div className="text-gray-400 text-xs text-center italic">📷 Сканирай за да отключиш</div>}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                  );
              })}
            </MapContainer>
            
            {scanResult && (
                <div className="absolute top-4 left-4 right-4 bg-white shadow-xl rounded-xl p-4 border-l-4 border-green-500 z-[1000] flex justify-between animate-in fade-in slide-in-from-top-4">
                    <div><p className="text-xs text-green-600 font-bold">УСПЕХ!</p><h3 className="font-bold">Открихте: {scanResult.name}</h3></div>
                    <button onClick={() => setScanResult(null)}><X /></button>
                </div>
            )}

            {/* Съобщение за най-близка чешма */}
            {nearestMessage && (
                <div className="absolute top-4 left-4 right-4 bg-blue-600 text-white shadow-xl rounded-xl p-3 z-[1000] text-center font-bold animate-in fade-in slide-in-from-top-4">
                    {nearestMessage}
                </div>
            )}

            <button onClick={findNearestFountain} disabled={findingNearest} className="absolute bottom-24 right-4 z-[400] bg-white text-blue-600 p-4 rounded-full shadow-2xl border border-blue-100 active:scale-95 transition-all flex items-center gap-2 font-bold text-sm">
                <Compass className={`w-6 h-6 ${findingNearest ? 'animate-spin' : ''}`} />{findingNearest ? 'Търся...' : 'Най-близка чешма'}
            </button>
          </div>
        )}

        {activeTab === 'list' && (
          <div className="p-4 overflow-y-auto h-full pb-32 max-w-md mx-auto w-full">
            {!userLocation && (
                <button onClick={enableLocationForList} className="w-full bg-blue-100 text-blue-700 text-xs font-bold py-4 px-4 rounded-xl mb-4 flex items-center justify-center gap-2 border border-blue-200 animate-pulse">
                    <MapPin size={16} /> Включи локация за разстояние
                </button>
            )}

            <div className="mb-4">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button onClick={() => setSelectedFilter(null)} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border transition-all ${!selectedFilter ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}>Всички</button>
                    {uniqueFeatures.map(feat => (
                        <button key={feat} onClick={() => setSelectedFilter(selectedFilter === feat ? null : feat)} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium border transition-all ${selectedFilter === feat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}>{feat}</button>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                {filteredFountains.map(fountain => (
                    <div key={fountain.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex flex-col">
                        <div className="h-48 w-full relative bg-gray-100">
                            <img src={fountain.images[0]} className="w-full h-full object-cover" alt={fountain.name} onError={(e) => { e.target.src = PLACEHOLDER_IMG; }} />
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold text-slate-900 text-xl mb-2">{fountain.name}</h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {fountain.features?.slice(0, 3).map((feat, i) => (
                                    <span key={i} className="text-[10px] font-bold bg-gray-100 text-slate-700 px-2 py-1 rounded border border-gray-200">{feat}</span>
                                ))}
                            </div>
                            <p className="text-sm text-slate-600 mb-4 line-clamp-3">{fountain.description}</p>
                            <button onClick={() => onSelectFromList(fountain)} className="w-full bg-white text-blue-600 border border-blue-200 font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors">
                                <MapPin size={18} /> Виж на картата
                            </button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'reward' && (
            <div className="p-6 h-full flex flex-col items-center justify-center text-center bg-white pb-32">
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

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.03)] z-[4000] max-w-md mx-auto w-full">
        <button onClick={() => {setActiveTab('map'); setShowMenu(false);}} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'map' ? 'text-blue-600 scale-105' : 'text-gray-400'}`}><Map size={24} strokeWidth={activeTab === 'map' ? 2.5 : 2} /><span className="text-[10px] font-medium mt-1">Карта</span></button>
        <button onClick={() => {setActiveTab('list'); setShowMenu(false);}} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'list' ? 'text-blue-600 scale-105' : 'text-gray-400'}`}><List size={24} strokeWidth={activeTab === 'list' ? 2.5 : 2} /><span className="text-[10px] font-medium mt-1">Списък</span></button>
        <button onClick={() => {setActiveTab('reward'); setShowMenu(false);}} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'reward' ? 'text-blue-600 scale-105' : 'text-gray-400'}`}><Gift size={24} strokeWidth={activeTab === 'reward' ? 2.5 : 2} /><span className="text-[10px] font-medium mt-1">Награда</span></button>
      </nav>
    </div>
  );
}