import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, CircleMarker, Popup } from 'react-leaflet';
import { Map, List, Gift, Navigation, Compass, X, CheckCircle, Camera, Menu as MenuIcon, Info, Heart, MapPin, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5">
          <path fill-rule="evenodd" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5 0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          <path d="M12 11.5c-1.38 0-2.5-1.12-2.5-2.5C9.5 7.62 12 5.5 12 5.5s2.5 2.12 2.5 3.5c0 1.38-1.12 2.5-2.5 2.5z" fill="white"/>
        </svg>`;
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

const BlueMarkerIcon = L.icon({ iconUrl: createSvgMarkerIcon('#2563eb'), iconSize: [42, 42], iconAnchor: [21, 42], popupAnchor: [0, -42] });
const RedMarkerIcon = L.icon({ iconUrl: createSvgMarkerIcon('#dc2626'), iconSize: [48, 48], iconAnchor: [24, 48], popupAnchor: [0, -48] });
const GreenMarkerIcon = L.icon({ iconUrl: createSvgMarkerIcon('#16a34a'), iconSize: [42, 42], iconAnchor: [21, 42], popupAnchor: [0, -42] });

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
  var R = 6371; var dLat = deg2rad(lat2-lat1); var dLon = deg2rad(lon2-lon1); 
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); return R * c; 
}
function deg2rad(deg) { return deg * (Math.PI/180) }

// --- COMPONENTS ---
const MapController = ({ targetCoords }) => {
    const map = useMap();
    useEffect(() => {
        if (targetCoords && Array.isArray(targetCoords) && targetCoords.length === 2) {
            map.flyTo(targetCoords, 18, { animate: true, duration: 1.5 });
        }
    }, [targetCoords]);
    return null;
};

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!images || images.length === 0) {
      return <div className="h-full bg-gray-200 flex items-center justify-center text-gray-400">Няма снимка</div>;
  }

  const nextSlide = (e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)); };
  const prevSlide = (e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); };

  return (
    <div className="relative w-full h-full bg-gray-100 group overflow-hidden">
      <img 
        src={images[currentIndex]} 
        alt="Cheshma" 
        className="w-full h-full object-cover transition-all duration-500"
        onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
      />
      {images.length > 1 && (
        <>
            <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 z-10"><ChevronLeft size={24} /></button>
            <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 z-10"><ChevronRight size={24} /></button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {images.map((_, idx) => (<div key={idx} className={`w-2 h-2 rounded-full shadow ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`} />))}
            </div>
        </>
      )}
    </div>
  );
};

// --- MODAL ЗА ДЕТАЙЛИ ---
const FountainDetailModal = ({ fountain, onClose, userLocation }) => {
    if (!fountain) return null;

    const dist = userLocation 
        ? getDistanceFromLatLonInKm(userLocation[0], userLocation[1], fountain.coords[0], fountain.coords[1]).toFixed(2)
        : null;

    const googleMapsUrl = `http://googleusercontent.com/maps.google.com/maps?q=${fountain.coords[0]},${fountain.coords[1]}`;

    return (
        <div className="fixed inset-0 z-[12000] flex flex-col justify-end items-center h-[100dvh]">
            <div className="absolute inset-0 bg-black/60 transition-opacity" onClick={onClose}></div>
            
            <div className="relative bg-white w-full max-h-[85vh] sm:h-auto sm:max-h-[80vh] sm:max-w-md sm:rounded-t-2xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
                
                <div className="relative h-64 shrink-0 bg-gray-200">
                    <ImageSlider images={fountain.images} />
                    <button onClick={onClose} className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors z-20 text-gray-900">
                        <X size={26} />
                    </button>
                    {dist && (
                        <div className="absolute bottom-4 left-4 bg-white/95 px-3 py-1.5 rounded-full text-xs font-bold text-blue-700 shadow-md">
                            📍 {dist} км (по въздух)
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto bg-white p-6 pb-32">
                    <h2 className="text-2xl font-extrabold text-slate-900 leading-tight mb-3">{fountain.name}</h2>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {fountain.features?.map((feat, i) => (
                            <span key={i} className="text-xs font-bold bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full border border-blue-100">
                                {feat}
                            </span>
                        ))}
                    </div>

                    <div className="text-slate-800 text-base leading-7 mb-8 whitespace-pre-line font-medium">
                        {fountain.description}
                    </div>

                    <div className="mb-6">
                        {fountain.isFound ? (
                            <div className="bg-green-100 border border-green-200 rounded-xl p-4 flex items-center justify-center gap-2 text-green-900 font-bold">
                                <CheckCircle size={22} className="text-green-700" />
                                Обектът е открит!
                            </div>
                        ) : (
                            <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 flex items-center justify-center gap-2 text-gray-600 font-medium italic">
                                <Camera size={22} />
                                Сканирай кода на място, за да отключиш.
                            </div>
                        )}
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 pb-8 z-30">
                    <a 
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all text-lg no-underline"
                    >
                        <Navigation size={22} />
                        Навигирай с Google Maps
                    </a>
                </div>
            </div>
        </div>
    );
};

// --- LIST CARD ---
const FountainListCard = ({ fountain, dist, onSelect }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLongText = fountain.description.length > 100;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col mb-4">
            <div className="aspect-video w-full relative bg-gray-100">
                <ImageSlider images={fountain.images} />
                {dist && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
                        {dist} км
                    </div>
                )}
            </div>
            <div className="p-5">
                <h3 className="font-bold text-slate-900 text-lg mb-2">{fountain.name}</h3>
                
                <div className="flex flex-wrap gap-2 mb-3">
                    {fountain.features?.slice(0, 3).map((feat, i) => (
                        <span key={i} className="text-[10px] font-bold bg-gray-50 text-slate-700 px-2 py-1 rounded border border-gray-200">{feat}</span>
                    ))}
                </div>

                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-4">
                    {isExpanded ? fountain.description : (
                        <span>
                            {fountain.description.slice(0, 90)}
                            {isLongText && "..."}
                        </span>
                    )}
                    {isLongText && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} 
                            className="text-blue-600 font-bold ml-1"
                        >
                            {isExpanded ? "Скрий" : "Виж още"}
                        </button>
                    )}
                </div>

                <button 
                    onClick={() => onSelect(fountain)} 
                    className="w-full bg-white text-blue-600 border border-blue-200 font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
                >
                    <MapPin size={18} /> Виж на картата
                </button>
            </div>
        </div>
    );
};

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
  const [userLocation, setUserLocation] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedFountain, setSelectedFountain] = useState(null);

  const uniqueFeatures = useMemo(() => {
    const allFeatures = new Set();
    FOUNTAINS_DATA.forEach(f => f.features?.forEach(feat => allFeatures.add(feat)));
    return Array.from(allFeatures).sort();
  }, []);

  const STORAGE_KEY = 'cheshmap_progress_v1';
  const TUTORIAL_KEY = 'cheshmap_tutorial_seen_v1';

  useEffect(() => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const savedIds = saved ? JSON.parse(saved) : [];
        
        const params = new URLSearchParams(window.location.search);
        const scanId = parseInt(params.get('scan'));
        const tutorialSeen = localStorage.getItem(TUTORIAL_KEY);
        let newFoundId = null;

        if (scanId && FOUNTAINS_DATA.find(f => f.id === scanId)) {
            if (!savedIds.includes(scanId)) { savedIds.push(scanId); localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds)); newFoundId = scanId; } 
            else { newFoundId = scanId; }
        }
        
        setFountains(FOUNTAINS_DATA.map(f => ({ ...f, isFound: savedIds.includes(f.id) })));
        setFoundCount(savedIds.length);

        if (newFoundId) {
            const found = FOUNTAINS_DATA.find(f => f.id === newFoundId);
            setActiveTab('map'); 
            setFlyToCoords(found.coords); 
            setScanResult(found);
            setTimeout(() => setScanResult(null), 6000);
            if (savedIds.length === FOUNTAINS_DATA.length) { setTimeout(() => setShowVictory(true), 2000); }
        } else {
            if (!tutorialSeen) { setShowWelcome(true); }
        }
        if (scanId) { window.history.replaceState({}, document.title, "/"); }
    } catch (e) {
        console.error("Error loading progress", e);
    }
  }, []);

  const enableLocationForList = () => {
    if (!navigator.geolocation) { alert("Браузърът не поддържа GPS."); return; }
    navigator.geolocation.getCurrentPosition(
        (position) => { setUserLocation([position.coords.latitude, position.coords.longitude]); },
        (error) => { console.error(error); alert("Моля, разрешете GPS достъпа."); }
    );
  };

  const findNearestFountain = () => {
    if (!navigator.geolocation) { alert("GPS не се поддържа."); return; }
    
    setFindingNearest(true);
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLat = position.coords.latitude; 
            const userLng = position.coords.longitude;
            setUserLocation([userLat, userLng]);
            
            let minDistance = Infinity; 
            let nearestId = null;
            
            fountains.forEach(f => {
                const dist = getDistanceFromLatLonInKm(userLat, userLng, f.coords[0], f.coords[1]);
                if (dist < minDistance) { minDistance = dist; nearestId = f.id; }
            });
            
            if (nearestId) {
                const nearest = fountains.find(f => f.id === nearestId);
                if (nearest) {
                    setActiveTab('map'); 
                    setFlyToCoords(nearest.coords);
                    setTimeout(() => setSelectedFountain(nearest), 500); 
                }
            }
            setFindingNearest(false);
        },
        (error) => { 
            console.error(error); 
            alert("Не успяхме да ви намерим. Моля, проверете GPS настройките."); 
            setFindingNearest(false); 
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const selectFountainFromList = (fountain) => {
      setActiveTab('map'); 
      setFlyToCoords(fountain.coords); 
      setSelectedFountain(fountain);
  };

  const processFountains = (list) => {
    let filtered = list;
    if (selectedFilter) {
        filtered = list.filter(f => f.features && f.features.includes(selectedFilter));
    }
    if (userLocation) {
        return [...filtered].sort((a, b) => {
            const distA = getDistanceFromLatLonInKm(userLocation[0], userLocation[1], a.coords[0], a.coords[1]);
            const distB = getDistanceFromLatLonInKm(userLocation[0], userLocation[1], b.coords[0], b.coords[1]);
            return distA - distB;
        });
    }
    return filtered;
  };

  if (showWelcome) return <WelcomeScreen onStart={() => { setShowWelcome(false); setTutorialStep(1); }} />;

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 text-slate-800 font-sans relative overflow-hidden">
      {tutorialStep > 0 && <TutorialOverlay step={tutorialStep} onNext={() => setTutorialStep(p => p < 3 ? p + 1 : 0)} onFinish={() => { setTutorialStep(0); localStorage.setItem(TUTORIAL_KEY, 'true'); }} />}
      {showMenu && <SideMenu onClose={() => setShowMenu(false)} />}
      {showVictory && <VictoryModal onClose={() => setShowVictory(false)} />}

      <header className="bg-blue-600 text-white p-4 shadow-lg z-10 flex justify-between items-center relative shrink-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowMenu(true)}>
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
                            setFlyToCoords(fountain.coords);
                            setSelectedFountain(fountain);
                        },
                    }}
                />
              ))}
            </MapContainer>
            
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

            <button onClick={findNearestFountain} disabled={findingNearest} className="absolute bottom-24 right-4 z-[999] bg-white text-blue-600 p-4 rounded-full shadow-2xl border border-blue-100 active:scale-95 transition-all flex items-center gap-2 font-bold text-sm">
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

            <div className="space-y-4">
                {processFountains(fountains).map(fountain => (
                    <FountainListCard 
                        key={fountain.id} 
                        fountain={fountain} 
                        dist={userLocation ? getDistanceFromLatLonInKm(userLocation[0], userLocation[1], fountain.coords[0], fountain.coords[1]).toFixed(2) : null}
                        onSelect={selectFountainFromList} 
                    />
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

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.03)] z-[10000] max-w-md mx-auto w-full">
        <button onClick={() => {setActiveTab('map'); setShowMenu(false);}} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'map' ? 'text-blue-600 scale-105' : 'text-gray-400'}`}><Map size={24} strokeWidth={activeTab === 'map' ? 2.5 : 2} /><span className="text-[10px] font-medium mt-1">Карта</span></button>
        <button onClick={() => {setActiveTab('list'); setShowMenu(false);}} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'list' ? 'text-blue-600 scale-105' : 'text-gray-400'}`}><List size={24} strokeWidth={activeTab === 'list' ? 2.5 : 2} /><span className="text-[10px] font-medium mt-1">Списък</span></button>
        <button onClick={() => {setActiveTab('reward'); setShowMenu(false);}} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'reward' ? 'text-blue-600 scale-105' : 'text-gray-400'}`}><Gift size={24} strokeWidth={activeTab === 'reward' ? 2.5 : 2} /><span className="text-[10px] font-medium mt-1">Награда</span></button>
      </nav>
    </div>
  );
}