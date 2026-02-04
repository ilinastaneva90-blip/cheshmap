import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker, Polyline } from 'react-leaflet';
import { Map, List, Gift, Navigation, QrCode, ChevronLeft, ChevronRight, Compass, X, CheckCircle, BookOpen, ArrowDown, Camera, Menu as MenuIcon, Info, FileText, Phone, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- ЛОГО ---
const CheshMapLogo = ({ className, size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5 0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" clipRule="evenodd"/>
    <path d="M12 11.5c-1.38 0-2.5-1.12-2.5-2.5C9.5 7.62 12 5.5 12 5.5s2.5 2.12 2.5 3.5c0 1.38-1.12 2.5-2.5 2.5z" fill="white"/>
  </svg>
);

// --- ИКОНИ ---
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

// --- ДАННИ ---
const FOUNTAINS_DATA = [
  { id: 1, name: "Чешма Център", coords: [41.61487552647749, 25.006342871370794], description: "Главната, централна чешма на с.Баните, в непосредствена близост до Санаториума; Минерална вода – хипертермална 42⁰С, рН 9,4.", features: ["Минерална вода", "Изворна вода", "Пейка"], images: ["/images/cheshma_center_banite_1.png", "/images/cheshma_center_banite_2.png", "/images/cheshma_center_banite_3.png"] },
  { id: 2, name: "Чешма Читалище", coords: [41.614986938272715, 25.005367848566177], description: "Най-удобната чешма за пълнене на минерална вода, разположена до централния паркинг. Статуя на млада девойка.", features: ["Минерална вода", "Изворна вода", "Пейки", "Паркинг"], images: ["/images/cheshma_center_banite_4.png", "/images/cheshma_center_banite_5.png"] },
  { id: 3, name: "Чешма Родопчанка", coords: [41.615373694868055, 25.004824986560823], description: "Студена, бистра вода за разхлаждане на жарките летни дни.", features: ["Изворна вода", "Паркинг"], images: ["/images/cheshma_devojka_banite_6.png"] },
  { id: 4, name: "Възпоменателна Чешма", coords: [41.615645142844194, 25.00388594955287], description: "Красива възпоменателна чешма, идеална за отмора.", features: ["Изворна вода", "Пейки", "Навес"], images: ["/images/cheshma_center_banite_7.jpg"] },
  { id: 5, name: "Чешма Здраве", coords: [41.61610666310426, 24.999976654054453], description: "Прекрасна беседка за събиране на компанията. Външен фитнес.", features: ["Изворна вода", "Беседка", "Фитнес", "Гледка"], images: ["/images/cheshma_curch_banite_8.png"] },
  { id: 6, name: "Чешма Родопа", coords: [41.61365618919042, 25.006942385519846], description: "Възпоменателна чешма в подножието на Параклис “Успение Пресвети Богородици”.", features: ["Изворна вода", "Пейки"], images: ["/images/cheshma_curch_banite_10.png"] },
  { id: 7, name: "Чешма Църквата", coords: [41.613349373541986, 25.0068672836741], description: "Беседка в подножието на Параклиса, подходяща за събиране с приятели.", features: ["Изворна вода", "Беседка", "Гледка"], images: [PLACEHOLDER_IMG] },
  { id: 8, name: "Чешма Мечката", coords: [41.61216974548534, 25.014001984963844], description: "Легендарна чешма, където са си почивали мечкарите.", features: ["Изворна вода", "Беседка", "Паркинг"], images: ["/images/cheshma_mechkata_9.png"] },
  { id: 9, name: "Чешмата на Емил Маджуров", coords: [41.61771515490414, 25.012948903157618], description: "Възпоменателна чешма с уникален реден камък.", features: ["Изворна вода", "Пейки", "Навес", "Стенопис"], images: [PLACEHOLDER_IMG] },
  { id: 10, name: "Малчевата чешма", coords: [41.62068278273291, 25.007691773734983], description: "Изключително красива и поддържана беседка.", features: ["Изворна вода", "Беседка", "Барбекю", "Паркинг"], images: [PLACEHOLDER_IMG] },
  { id: 11, name: "Заевата чешма", coords: [41.62521095851035, 24.96900607304783], description: "Просторна беседка с всичко необходимо.", features: ["Изворна вода", "Беседка", "Паркинг", "Барбекю"], images: [PLACEHOLDER_IMG] },
  { id: 12, name: "Чешма Пожарната", coords: [41.61765178981794, 24.995527755722257], description: "Голяма беседка с дебела сянка.", features: ["Изворна вода", "Беседка"], images: [PLACEHOLDER_IMG] }
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

// --- МЕНЮ СТРАНИЧНО ---
const SideMenu = ({ onClose }) => (
    <div className="fixed inset-0 z-[3000] bg-white text-slate-800 flex flex-col animate-in slide-in-from-left duration-300">
        <div className="bg-blue-600 text-white p-6 flex justify-between items-center shadow-md">
            <h2 className="text-2xl font-bold flex items-center gap-2"><CheshMapLogo size={28}/> Меню</h2>
            <button onClick={onClose} className="p-2 hover:bg-blue-700 rounded-full"><X size={28}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="space-y-2">
                <h3 className="font-bold text-xl text-blue-900 flex items-center gap-2"><Info size={20}/> За Община Баните</h3>
                <p className="text-gray-600 leading-relaxed text-sm">Община Баните е сърцето на Родопите, известна със своите лековити минерални извори и гостоприемство.</p>
            </div>
            <div className="space-y-2">
                <h3 className="font-bold text-xl text-blue-900 flex items-center gap-2"><BookOpen size={20}/> Мисията</h3>
                <p className="text-gray-600 leading-relaxed text-sm">Това приложение е създадено, за да популяризира традицията на "хайр"-а – съграждането на чешми.</p>
                <p className="text-xs text-gray-500 italic mt-2">Вдъхновено от книгата "Водата дарява живот" на сем. Димитрови.</p>
            </div>
            <div className="space-y-2">
                <h3 className="font-bold text-xl text-blue-900 flex items-center gap-2"><FileText size={20}/> Правила</h3>
                <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                    <li>Пазете природата чиста.</li>
                    <li>Сканирайте QR кодовете само на място.</li>
                </ul>
            </div>
            <div className="space-y-2">
                <h3 className="font-bold text-xl text-blue-900 flex items-center gap-2"><Phone size={20}/> Контакти</h3>
                <p className="text-gray-600 text-sm">Община Баните<br/>с. Баните, ул. "Стефан Стамболов" 1</p>
            </div>
        </div>
        <div className="p-4 bg-gray-50 text-center text-xs text-gray-400 border-t border-gray-200">CheshMap v1.0 • 2026</div>
    </div>
);

// --- TUTORIAL OVERLAY ---
const TutorialOverlay = ({ step, onNext, onFinish }) => {
    return (
        <div className="fixed inset-0 z-[2000] bg-black/70 flex flex-col animate-in fade-in duration-300" onClick={onNext}>
            {step === 1 && (
                <div className="absolute bottom-20 left-4 text-white max-w-xs">
                    <div className="bg-blue-600 p-4 rounded-xl shadow-xl border-2 border-white/30 mb-2 animate-pulse-slow origin-bottom-left">
                        <h3 className="font-bold text-lg mb-1">Разгледайте картата</h3>
                        <p className="text-sm opacity-90">Използвайте менюто, за да превключвате между картата и списъка с обекти.</p>
                    </div>
                    <ArrowDown size={40} className="text-white ml-6 animate-bounce" />
                </div>
            )}
            {step === 2 && (
                <div className="absolute bottom-24 right-4 text-white max-w-xs flex flex-col items-end">
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
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm">Разбрах</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- WELCOME SCREEN ---
const WelcomeScreen = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-cyan-900 via-blue-900 to-slate-900 text-white flex flex-col items-center justify-between p-6 text-center animate-in fade-in duration-1000 overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto mt-10">
          <div className="bg-white/10 p-5 rounded-full mb-6 backdrop-blur-md border border-white/20 shadow-[0_0_30px_rgba(59,130,246,0.3)] animate-pulse">
             <CheshMapLogo size={64} className="text-cyan-300 drop-shadow-lg" />
          </div>
          <h1 className="text-5xl font-extrabold mb-1 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-white">CheshMap</h1>
          <p className="text-cyan-200/80 text-sm font-light tracking-widest uppercase mb-8">Иновация на Община Баните</p>
          <div className="bg-black/30 p-6 rounded-3xl backdrop-blur-md w-full mb-8 border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white italic">"Там, където е текло,<br/> пак ще тече"</h2>
            <p className="text-sm leading-relaxed mb-4 text-gray-200 font-light">Потопете се в преживяване като никое друго.</p>
          </div>
          <button onClick={onStart} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg shadow-cyan-500/30 hover:scale-105 hover:shadow-cyan-500/50 active:scale-95 transition-all flex items-center gap-2 mb-10">
            Започни приключението <ChevronRight />
          </button>
      </div>
      <div className="w-full pb-4"><p className="text-[11px] text-cyan-200/60 font-light flex flex-col items-center gap-1"><span className="flex items-center gap-1 uppercase tracking-wider font-medium"><BookOpen size={12} /> Вдъхновение</span><span className="text-sm text-cyan-100">"Водата дарява живот"</span></p></div>
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
const getSavedProgress = () => { try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : []; } catch (e) { return []; } };
const saveProgress = (ids) => { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); };

// --- MAIN APP ---
export default function App() {
  const [showWelcome, setShowWelcome] = useState(true); 
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  const [activeTab, setActiveTab] = useState('map');
  const [fountains, setFountains] = useState(FOUNTAINS_DATA.map(f => ({...f, isFound: false})));
  
  const [foundCount, setFoundCount] = useState(0);
  const [flyToCoords, setFlyToCoords] = useState(null);
  const [findingNearest, setFindingNearest] = useState(false);
  const [targetFountainId, setTargetFountainId] = useState(null);
  const [targetDistance, setTargetDistance] = useState(null);

  const [nearestResult, setNearestResult] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    const savedIds = getSavedProgress();
    const params = new URLSearchParams(window.location.search);
    const scanId = parseInt(params.get('scan'));
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
        setActiveTab('map');
        setFlyToCoords(found.coords);
        setScanResult(found);
        setTimeout(() => setScanResult(null), 6000);
        setShowWelcome(false); setTutorialStep(0);
    }
    if (scanId) { window.history.replaceState({}, document.title, "/"); }
  }, []);

  useEffect(() => {
    if (userLocation && targetFountainId) {
        const target = fountains.find(f => f.id === targetFountainId);
        if (target) {
            const dist = getDistanceFromLatLonInKm(userLocation[0], userLocation[1], target.coords[0], target.coords[1]);
            setTargetDistance(dist.toFixed(2));
        }
    }
  }, [userLocation, targetFountainId]);

  const findNearestFountain = () => {
    if (!navigator.geolocation) { alert("Браузърът ви не поддържа локализация."); return; }
    setFindingNearest(true); setNearestResult(null); setTargetFountainId(null);
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
                setTargetFountainId(nearestId);
            }
            setFindingNearest(false);
        },
        (error) => { console.error(error); alert("Моля, разрешете GPS."); setFindingNearest(false); }
    );
  };

  const startApp = () => { setShowWelcome(false); setTutorialStep(1); };
  const nextTutorialStep = () => { if (tutorialStep < 3) { setTutorialStep(prev => prev + 1); } else { setTutorialStep(0); } };

  const selectFountainFromList = (fountain) => {
      setActiveTab('map'); setFlyToCoords(fountain.coords); setTargetFountainId(fountain.id); setNearestResult(null);
      navigator.geolocation.getCurrentPosition((pos) => { setUserLocation([pos.coords.latitude, pos.coords.longitude]); }, () => {}, {timeout: 5000});
  };

  if (showWelcome) return <WelcomeScreen onStart={startApp} />;

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-slate-800 font-sans">
      {tutorialStep > 0 && <TutorialOverlay step={tutorialStep} onNext={nextTutorialStep} onFinish={() => setTutorialStep(0)} />}
      {showMenu && <SideMenu onClose={() => setShowMenu(false)} />}

      <header className="bg-blue-600 text-white p-4 shadow-lg z-10 flex justify-between items-center relative">
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
              <TileLayer attribution='&copy; OSM' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapController targetCoords={flyToCoords} />
              {userLocation && <CircleMarker center={userLocation} pathOptions={{ color: 'white', fillColor: '#2563eb', fillOpacity: 1 }} radius={8}><Popup>📍 Вие сте тук</Popup></CircleMarker>}
              
              {/* ПУНКТИРАНАТА ЛИНИЯ (НОВО) */}
              {userLocation && targetFountainId && (
                  <Polyline 
                    positions={[userLocation, fountains.find(f => f.id === targetFountainId).coords]}
                    pathOptions={{ color: '#3b82f6', dashArray: '10, 15', weight: 4, opacity: 0.7 }}
                  />
              )}

              {fountains.map(fountain => (
                <Marker 
                    key={fountain.id} 
                    position={fountain.coords}
                    zIndexOffset={targetFountainId === fountain.id ? 1000 : 0}
                    icon={targetFountainId === fountain.id ? RedMarkerIcon : (fountain.isFound ? GreenMarkerIcon : BlueMarkerIcon)}
                >
                  <Popup className="custom-popup p-0 overflow-hidden" maxWidth={250} minWidth={250}>
                    <div className="flex flex-col p-0 m-0 w-full overflow-hidden rounded-t-lg">
                      <div className="w-full h-40"><ImageSlider images={fountain.images} /></div>
                      <div className="p-3 text-center">
                        <h3 className="font-bold text-blue-900 text-lg mb-1">{fountain.name}</h3>
                        
                        {targetFountainId === fountain.id && (
                            <div className="mb-3 space-y-2">
                                {targetDistance && <div className="text-xs font-bold text-red-500 animate-pulse">📍 На {targetDistance} км от вас</div>}
                                {/* БУТОН ЗА GOOGLE MAPS (НОВО) */}
                                <a 
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${fountain.coords[0]},${fountain.coords[1]}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
                                >
                                    <MapPin size={14}/> Навигирай с Google Maps
                                </a>
                            </div>
                        )}

                        <div className="flex flex-wrap justify-center gap-1 mb-2">
                            {fountain.features?.map((feat, i) => (<span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">{feat}</span>))}
                        </div>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-3">{fountain.description}</p>
                        {fountain.isFound ? (
                          <div className="bg-green-100 text-green-700 text-sm font-bold py-2 rounded-lg border border-green-200 flex items-center justify-center gap-2"><CheckCircle size={16}/> Успешно открита!</div>
                        ) : (<div className="bg-gray-50 text-gray-500 text-xs py-2 px-3 rounded-lg border border-gray-200 italic">📷 Сканирайте стикера на място.</div>)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            
            {scanResult && (
                <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur shadow-xl rounded-xl p-4 border-l-4 border-green-500 z-[1000] animate-in fade-in slide-in-from-top-4 duration-500 max-w-md mx-auto">
                    <div className="flex justify-between items-start">
                        <div><p className="text-xs text-green-600 font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle size={14} /> УСПЕХ!</p><h3 className="text-lg font-bold text-gray-800">Открихте: {scanResult.name}</h3></div>
                        <button onClick={() => setScanResult(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-400" /></button>
                    </div>
                </div>
            )}

            {(nearestResult || (targetFountainId && targetDistance)) && (
                <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur shadow-xl rounded-xl p-4 border-l-4 border-red-500 z-[1000] animate-in fade-in slide-in-from-top-4 duration-500 max-w-md mx-auto">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">ЦЕЛТА Е:</p>
                            <h3 className="text-lg font-bold text-red-600">{nearestResult ? nearestResult.name : fountains.find(f => f.id === targetFountainId)?.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">Разстояние: <strong>{nearestResult ? nearestResult.dist : targetDistance} км</strong></p>
                        </div>
                        <button onClick={() => {setNearestResult(null); setTargetFountainId(null);}} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-400" /></button>
                    </div>
                </div>
            )}

            <button onClick={findNearestFountain} disabled={findingNearest} className="absolute bottom-6 right-4 z-[999] bg-white text-blue-600 p-3 rounded-full shadow-xl border border-blue-100 active:scale-95 transition-all flex items-center gap-2 font-bold text-sm">
                <Compass className={`w-6 h-6 ${findingNearest ? 'animate-spin' : ''}`} />{findingNearest ? 'Търсене...' : 'Най-близка'}
            </button>
          </div>
        )}

        {activeTab === 'list' && (
          <div className="p-4 overflow-y-auto h-full pb-20 max-w-md mx-auto w-full">
            {foundCount > 0 && (
                <div className="mb-6">
                    <h2 className="text-sm font-bold text-green-600 uppercase tracking-wider mb-3 flex items-center gap-2 bg-green-50 p-2 rounded-lg border border-green-100"><CheckCircle size={16}/> Вече открити ({foundCount})</h2>
                    <div className="space-y-4">
                        {fountains.filter(f => f.isFound).map(fountain => (
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
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2 bg-gray-100 p-2 rounded-lg border border-gray-200"><Compass size={16}/> Очакващи откриване ({fountains.length - foundCount})</h2>
                <div className="space-y-6">
                    {fountains.filter(f => !f.isFound).map(fountain => (
                    <div key={fountain.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
                        <div className="aspect-video w-full relative"><ImageSlider images={fountain.images} /></div>
                        <div className="p-5">
                        <h3 className="font-bold text-slate-800 text-xl leading-tight mb-2">{fountain.name}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">{fountain.features?.map((feat, i) => (<span key={i} className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">{feat}</span>))}</div>
                        <p className="text-sm text-gray-500 mb-5 leading-relaxed">{fountain.description}</p>
                        <button onClick={() => selectFountainFromList(fountain)} className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium py-3 rounded-lg flex items-center justify-center gap-2 border border-blue-100 transition-colors"><Navigation size={18} /> Навигирай до там</button>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
          </div>
        )}

        {activeTab === 'reward' && (
            <div className="p-6 h-full flex flex-col items-center justify-center text-center bg-white">
                <div className="bg-yellow-50 p-8 rounded-full mb-6 border-4 border-yellow-100"><Gift className="w-16 h-16 text-yellow-500" /></div>
                <h2 className="text-2xl font-extrabold text-slate-800 mb-3">Вашата Награда</h2>
                <p className="text-gray-600 mb-8 max-w-xs mx-auto leading-relaxed">Открийте всички <strong>12 чешми</strong> в района, за да отключите кошницата с подаръци!</p>
                <div className="w-full max-w-xs bg-gray-100 rounded-full h-6 mb-3 overflow-hidden border border-gray-200"><div className="bg-gradient-to-r from-blue-500 to-blue-400 h-full transition-all duration-1000 ease-out" style={{ width: `${(foundCount / fountains.length) * 100}%` }}></div></div>
                <p className="text-sm font-medium text-gray-500">Прогрес: {foundCount} / {fountains.length}</p>
            </div>
        )}
      </main>

      <nav className="bg-white border-t border-gray-200 flex justify-around p-2 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.03)] z-20 max-w-md mx-auto w-full">
        <button onClick={() => setActiveTab('map')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'map' ? 'text-blue-600 scale-105' : 'text-gray-400'}`}><Map size={24} strokeWidth={activeTab === 'map' ? 2.5 : 2} /><span className="text-[10px] font-medium mt-1">Карта</span></button>
        <button onClick={() => setActiveTab('list')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'list' ? 'text-blue-600 scale-105' : 'text-gray-400'}`}><List size={24} strokeWidth={activeTab === 'list' ? 2.5 : 2} /><span className="text-[10px] font-medium mt-1">Списък</span></button>
        <button onClick={() => setActiveTab('reward')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'reward' ? 'text-blue-600 scale-105' : 'text-gray-400'}`}><Gift size={24} strokeWidth={activeTab === 'reward' ? 2.5 : 2} /><span className="text-[10px] font-medium mt-1">Награда</span></button>
      </nav>
    </div>
  );
}