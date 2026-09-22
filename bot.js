const { TwitterApi } = require('twitter-api-v2');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

// --- 78 Tarot Cards (Polish) ---
const TAROT_CARDS = [
  // WIELKIE ARKANA (0-21)
  { name: 'Głupiec', interp: 'Nowe początki czekają na Cię. Odwaga i spontaniczność otwierają drzwi, których jeszcze nie widzisz. Zrób ten krok w nieznane.' },
  { name: 'Mag', interp: 'Masz wszystkie narzędzia, by tworzyć swoją rzeczywistość. Skupienie i wola są dziś Twoją mocą.' },
  { name: 'Kapłanka', interp: 'Słuchaj głosu intuicji. Odpowiedź, której szukasz, już w Tobie jest — zanurz się w ciszę.' },
  { name: 'Cesarzowa', interp: 'Obfitość i płodność otaczają Cię. Dbaj o siebie i to, co tworzysz z miłością.' },
  { name: 'Cesarz', interp: 'Zbuduj solidne fundamenty. Struktura i dyscyplina przyniosą Ci stabilność i sukces.' },
  { name: 'Hierofant', interp: 'Tradycja i mądrość przodków niosą dzisiaj przesłanie. Szukaj nauczyciela lub zostań nim.' },
  { name: 'Kochankowie', interp: 'Stoisz przed ważnym wyborem serca. Zaufaj harmonii między rozumem a uczuciem.' },
  { name: 'Rydwan', interp: 'Twoja determinacja zwycięży wszelkie przeszkody. Jedź naprzód z pewnością siebie.' },
  { name: 'Siła', interp: 'Prawdziwa moc płynie z łagodności i wewnętrznego spokoju, nie z siły zewnętrznej.' },
  { name: 'Pustelnik', interp: 'Czas na refleksję i samotność. Mądrość znajdziesz w ciszy własnego serca.' },
  { name: 'Koło Fortuny', interp: 'Koło się obraca. Zmiany nadchodzą — przyjmij je z otwartością i wiarą.' },
  { name: 'Sprawiedliwość', interp: 'Prawda zawsze wychodzi na jaw. Działaj uczciwie, a równowaga zostanie przywrócona.' },
  { name: 'Wisielec', interp: 'Zmień perspektywę. To, co wygląda jak strata, może być głębokim przebudzeniem.' },
  { name: 'Śmierć', interp: 'Stare kończy się, by zrobić miejsce dla nowego. Transformacja jest darem, nie przekleństwem.' },
  { name: 'Umiarkowanie', interp: 'Złoty środek i cierpliwość są Twoją siłą. Harmonia rodzi się z równowagi.' },
  { name: 'Diabeł', interp: 'Zbadaj, co Cię ogranicza. Łańcuchy często są iluzją — masz moc je zdjąć.' },
  { name: 'Wieża', interp: 'Nagłe przebudzenie oczyszcza to, co już nie służy. Po burzy zawsze przychodzi spokój.' },
  { name: 'Gwiazda', interp: 'Nadzieja i uzdrowienie są na wyciągnięcie ręki. Gwiazdy świecą właśnie dla Ciebie.' },
  { name: 'Księżyc', interp: 'Podświadomość wysyła ważne sygnały. Zwróć uwagę na sny i przeczucia tej nocy.' },
  { name: 'Słońce', interp: 'Radość, sukces i witalizm napełniają dziś Twoje życie. Świeć jasno!' },
  { name: 'Sąd', interp: 'Słyszysz wyższe powołanie. Czas wstać i odpowiedzieć na wezwanie swojego serca.' },
  { name: 'Świat', interp: 'Cykl się zamyka w pełni i spełnieniu. Świętuj to, co osiągnąłeś — zasłużyłeś.' },
  // MAŁE ARKANA — KIJE (22-35)
  { name: 'As Kijów', interp: 'Nowy iskra pasji i kreatywności zapala się w Tobie. Działaj teraz!' },
  { name: 'Dwójka Kijów', interp: 'Planujesz wielką podróż lub projekt. Odwaga i wizja są Twoimi sprzymierzeńcami.' },
  { name: 'Trójka Kijów', interp: 'Twoje starania zaczynają przynosić owoce. Patrz daleko w przyszłość.' },
  { name: 'Czwórka Kijów', interp: 'Czas świętowania i wspólnoty. Doceniaj osiągnięcia i bliskich wokół Ciebie.' },
  { name: 'Piątka Kijów', interp: 'Zdrowa rywalizacja i wyzwania hartują Twój charakter. Stań do walki.' },
  { name: 'Szóstka Kijów', interp: 'Zwycięstwo jest blisko! Twój wysiłek zostanie doceniony publicznie.' },
  { name: 'Siódemka Kijów', interp: 'Broń swoich przekonań z odwagą. Stoisz na właściwej pozycji.' },
  { name: 'Ósemka Kijów', interp: 'Szybkie zmiany i wiadomości nadchodzą. Bądź gotowy na dynamiczne działanie.' },
  { name: 'Dziewiątka Kijów', interp: 'Jesteś silniejszy niż myślisz. Wytrwaj — meta jest blisko.' },
  { name: 'Dziesiątka Kijów', interp: 'Zbyt wiele ciężarów na raz. Czas oddelegować lub odłożyć część zadań.' },
  { name: 'Paź Kijów', interp: 'Entuzjazm i ciekawość otwierają nowe ścieżki. Bądź gotowy na naukę.' },
  { name: 'Rycerz Kijów', interp: 'Działaj szybko i odważnie, ale nie zapomnij o celu podróży.' },
  { name: 'Królowa Kijów', interp: 'Twoja charyzma i ciepło przyciągają dziś wszystko, czego potrzebujesz.' },
  { name: 'Król Kijów', interp: 'Przywództwo i wizja są Twoją mocą. Inspiruj innych swoim przykładem.' },
  // MAŁE ARKANA — PUCHARY (36-49)
  { name: 'As Pucharów', interp: 'Serce się otwiera na nową miłość lub głębokie emocje. Przyjmij ten dar.' },
  { name: 'Dwójka Pucharów', interp: 'Związek lub partnerstwo przynosi harmonię i wzajemne zrozumienie.' },
  { name: 'Trójka Pucharów', interp: 'Czas na świętowanie z bliskimi. Przyjaźń i radość wypełniają serce.' },
  { name: 'Czwórka Pucharów', interp: 'Zatrzymaj się i dostrzeż możliwości, które masz przed sobą. Nie pomijaj darów.' },
  { name: 'Piątka Pucharów', interp: 'Po stracie przychodzi nauka. Skup się na tym, co wciąż masz.' },
  { name: 'Szóstka Pucharów', interp: 'Przeszłość przynosi piękne wspomnienia. Nostalgia jest dziś Twoim przewodnikiem.' },
  { name: 'Siódemka Pucharów', interp: 'Wiele możliwości przed Tobą. Wybierz z sercem, nie z chciwością.' },
  { name: 'Ósemka Pucharów', interp: 'Czas opuścić to, co już nie służy Twojej duszy. Idź naprzód.' },
  { name: 'Dziewiątka Pucharów', interp: 'Życzenie zostanie spełnione. Gratuluj sobie i ciesz się dobrobytem.' },
  { name: 'Dziesiątka Pucharów', interp: 'Pełnia szczęścia rodzinnego i emocjonalnego. Prawdziwy raj na ziemi.' },
  { name: 'Paź Pucharów', interp: 'Intuicja i kreatywność przynoszą niespodziewane wiadomości od serca.' },
  { name: 'Rycerz Pucharów', interp: 'Romantyczny gest lub propozycja jest w drodze. Otwórz się na miłość.' },
  { name: 'Królowa Pucharów', interp: 'Empatia i intuicja są dziś Twoją nadprzyrodzoną mocą. Zaufaj im.' },
  { name: 'Król Pucharów', interp: 'Równowaga emocjonalna i mądrość serca prowadzą Cię do sukcesu.' },
  // MAŁE ARKANA — MIECZE (50-63)
  { name: 'As Mieczy', interp: 'Jasność umysłu i prawda przebijają się przez mgłę. Nowy pomysł może zmienić wszystko.' },
  { name: 'Dwójka Mieczy', interp: 'Stoisz przed trudnym wyborem. Zaufaj intuicji, gdy rozum milczy.' },
  { name: 'Trójka Mieczy', interp: 'Ból serca jest częścią uzdrowienia. Pozwól sobie poczuć i przejść dalej.' },
  { name: 'Czwórka Mieczy', interp: 'Czas na odpoczynek i regenerację. Cisza przywraca siły umysłu.' },
  { name: 'Piątka Mieczy', interp: 'Unikaj konfliktów, które nie służą Twojemu wzrostowi. Wybierz pokój.' },
  { name: 'Szóstka Mieczy', interp: 'Odchodzisz od trudności ku spokojniejszym wodom. Zmiana przyniesie ulgę.' },
  { name: 'Siódemka Mieczy', interp: 'Działaj strategicznie i ostrożnie. Nie wszystko można osiągnąć siłą.' },
  { name: 'Ósemka Mieczy', interp: 'Ograniczenia są częściowo iluzją. Odważ się zdjąć opaskę z oczu.' },
  { name: 'Dziewiątka Mieczy', interp: 'Lęki w nocy są większe niż w dzień. Jutro przyniesie nową perspektywę.' },
  { name: 'Dziesiątka Mieczy', interp: 'Koniec bolesnego cyklu. Po najciemniejszej chwili wschodzi nowy świt.' },
  { name: 'Paź Mieczy', interp: 'Bądź czujny i ciekaw. Nowe informacje mogą zmienić Twój punkt widzenia.' },
  { name: 'Rycerz Mieczy', interp: 'Działasz szybko i zdecydowanie. Uważaj, by nie ranić nieporozumieniami.' },
  { name: 'Królowa Mieczy', interp: 'Chłodna analiza i niezależność są dziś Twoją siłą. Mów prawdę wprost.' },
  { name: 'Król Mieczy', interp: 'Logika i sprawiedliwość prowadzą Cię do mądrych decyzji. Bądź obiektywny.' },
  // MAŁE ARKANA — PENTAKLE (64-77)
  { name: 'As Pentakli', interp: 'Nowa szansa finansowa lub materialna puka do Twoich drzwi. Otwórz je.' },
  { name: 'Dwójka Pentakli', interp: 'Żonglujesz wieloma sprawami. Elastyczność i humor są Twoimi sprzymierzeńcami.' },
  { name: 'Trójka Pentakli', interp: 'Praca zespołowa przynosi najlepsze owoce. Doceniaj każdy wkład.' },
  { name: 'Czwórka Pentakli', interp: 'Dbaj o zasoby, ale nie zamykaj się na obfitość. Skąpstwo to też pułapka.' },
  { name: 'Piątka Pentakli', interp: 'Trudny czas materialny minie. Szukaj wsparcia i nie izoluj się.' },
  { name: 'Szóstka Pentakli', interp: 'Dawanie i branie są w równowadze. Hojność wraca do Ciebie wielokrotnie.' },
  { name: 'Siódemka Pentakli', interp: 'Cierpliwość jest cnotą. Twoje wysiłki dojrzewają — daj im czas.' },
  { name: 'Ósemka Pentakli', interp: 'Mistrzostwo rodzi się z codziennej praktyki. Doskonalenie jest Twoją ścieżką.' },
  { name: 'Dziewiątka Pentakli', interp: 'Niezależność i dostatek są efektem Twojej ciężkiej pracy. Ciesz się nimi.' },
  { name: 'Dziesiątka Pentakli', interp: 'Trwały dobrobyt i szczęście rodzinne są osiągalne. Buduj z miłością.' },
  { name: 'Paź Pentakli', interp: 'Nowa nauka lub praktyczne umiejętności otwierają drzwi do sukcesu.' },
  { name: 'Rycerz Pentakli', interp: 'Wytrwałość i metodyczność doprowadzą Cię do celu. Kroku po kroku.' },
  { name: 'Królowa Pentakli', interp: 'Troska o dom i bliskich jest dziś Twoją siłą. Ziemska mądrość prowadzi.' },
  { name: 'Król Pentakli', interp: 'Sukces materialny i stabilność są owocem Twojej mądrości i pracowitości.' },
];

// --- State management (prevent same card two days in a row) ---
const STATE_FILE = path.join(__dirname, '.last_card_index');

function getLastCardIndex() {
  try {
    const data = fs.readFileSync(STATE_FILE, 'utf8').trim();
    const idx = parseInt(data, 10);
    return Number.isFinite(idx) && idx >= 0 && idx < TAROT_CARDS.length ? idx : -1;
  } catch {
    return -1;
  }
}

function saveLastCardIndex(idx) {
  fs.writeFileSync(STATE_FILE, String(idx), 'utf8');
}

function pickRandomCard() {
  const lastIdx = getLastCardIndex();
  let idx;
  do {
    idx = Math.floor(Math.random() * TAROT_CARDS.length);
  } while (idx === lastIdx && TAROT_CARDS.length > 1);
  saveLastCardIndex(idx);
  return TAROT_CARDS[idx];
}

// --- Tweet formatting ---
function formatTweet(card) {
  return `✦ Karta Dnia — Ezostylia ✦\n\n🃏 ${card.name}\n\n${card.interp}\n\nOdkryj więcej na ezostylia.com ✦\n\n#TarotPolski #KartaDnia #Ezostylia #Tarot #Runy`;
}

// --- Twitter client ---
function createTwitterClient() {
  const { TWITTER_APP_KEY, TWITTER_APP_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET } = process.env;

  if (!TWITTER_APP_KEY || !TWITTER_APP_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_SECRET) {
    throw new Error(
      'Missing Twitter credentials. Set TWITTER_APP_KEY, TWITTER_APP_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET in environment.'
    );
  }

  return new TwitterApi({
    appKey: TWITTER_APP_KEY,
    appSecret: TWITTER_APP_SECRET,
    accessToken: TWITTER_ACCESS_TOKEN,
    accessSecret: TWITTER_ACCESS_SECRET,
  });
}

// --- Post tweet ---
async function postDailyTarot() {
  const card = pickRandomCard();
  const text = formatTweet(card);

  console.log(`[${new Date().toISOString()}] Picked card: ${card.name}`);
  console.log(`Tweet length: ${text.length}/280`);

  if (text.length > 280) {
    console.error(`ERROR: Tweet exceeds 280 chars (${text.length}). Skipping.`);
    return;
  }

  try {
    const client = createTwitterClient();
    const rwClient = client.readWrite;
    const { data } = await rwClient.v2.tweet(text);
    console.log(`SUCCESS: Tweet posted! ID: ${data.id}`);
    console.log(`Tweet text:\n${text}`);
  } catch (err) {
    console.error(`ERROR posting tweet: ${err.message}`);
    if (err.data) console.error('Twitter API response:', JSON.stringify(err.data));
  }
}

// --- Scheduling (9:00 AM Warsaw time) ---
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '0 9 * * *';
const TIMEZONE = process.env.TIMEZONE || 'Europe/Warsaw';

if (require.main === module) {
  console.log(`🔮 Ezostylia Tarot Bot started`);
  console.log(`Schedule: "${CRON_SCHEDULE}" (${TIMEZONE})`);
  console.log(`Total cards: ${TAROT_CARDS.length}`);

  cron.schedule(CRON_SCHEDULE, () => {
    console.log(`\n--- Cron triggered at ${new Date().toISOString()} ---`);
    postDailyTarot();
  }, { timezone: TIMEZONE });

  console.log('Waiting for next scheduled run...\n');
}

module.exports = {
  TAROT_CARDS,
  formatTweet,
  pickRandomCard,
  getLastCardIndex,
  saveLastCardIndex,
  postDailyTarot,
  STATE_FILE,
};
