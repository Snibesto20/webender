import { 
  MdArchive, MdCancel, MdPending, MdTrendingUp, 
  MdCheckCircle, MdStar, MdPhoneInTalk, MdPersonOutline
} from 'react-icons/md';

export const VALIDATION_CONFIG = {
  MIN_PASSWORD_LENGTH: 6,
  MIN_USERNAME_LENGTH: 3,
  ALLOWED_ROLES: ['admin', 'marketing', 'guest'],
};

export const TAG_PRIORITY = { 
  'active client': 100, 'approved': 90, 'potential 10': 85, 'potential 9': 84, 
  'potential 8': 83, 'potential 7': 82, 'potential 6': 81, 'potential 5': 80, 
  'potential 4': 79, 'potential 3': 78, 'potential 2': 77, 'potential 1': 76, 
  'pending': 50, 'unprocessed': 20, 'archived client': 10, 'disapproved': 0 
};

export const CLIENT_TAGS_CONFIG = {
  'unprocessed': { colorClass: 'text-emerald-600 dark:text-emerald-400 font-medium', styles: 'bg-emerald-50 text-emerald-600 border-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-400', icon: MdPhoneInTalk },
  'disapproved': { colorClass: 'text-red-600 dark:text-red-400 font-medium', styles: 'bg-red-50 text-red-600 border-red-600 dark:bg-red-950/30 dark:text-red-400 dark:border-red-400', icon: MdCancel },
  'pending': { colorClass: 'text-yellow-600 dark:text-yellow-400 font-medium', styles: 'bg-yellow-50 text-yellow-600 border-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-400', icon: MdPending },
  'approved': { colorClass: 'text-green-600 dark:text-green-400 font-medium', styles: 'bg-green-50 text-green-600 border-green-600 dark:bg-green-950/30 dark:text-green-400 dark:border-green-400', icon: MdCheckCircle },
  'active client': { colorClass: 'text-blue-600 dark:text-blue-400 font-medium', styles: 'bg-blue-50 text-blue-600 border-blue-600 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-400', icon: MdStar },
  'archived client': { colorClass: 'text-amber-800 dark:text-amber-500 font-medium', styles: 'bg-amber-100 text-amber-800 border-amber-800 dark:bg-amber-950/40 dark:text-amber-500 dark:border-amber-600', icon: MdArchive },
  'potential 1': { colorClass: 'text-red-600 dark:text-red-400 font-medium', styles: 'bg-red-50 text-red-600 border-red-600 dark:bg-red-950/30 dark:text-red-400 dark:border-red-400', icon: MdCancel },
  'potential 2': { colorClass: 'text-red-600 dark:text-red-400 font-medium', styles: 'bg-red-50 text-red-600 border-red-600 dark:bg-red-950/30 dark:text-red-400 dark:border-red-400', icon: MdCancel },
  'potential 3': { colorClass: 'text-red-600 dark:text-red-400 font-medium', styles: 'bg-red-50 text-red-600 border-red-600 dark:bg-red-950/30 dark:text-red-400 dark:border-red-400', icon: MdCancel },
  'potential 4': { colorClass: 'text-red-600 dark:text-red-400 font-medium', styles: 'bg-red-50 text-red-600 border-red-600 dark:bg-red-950/30 dark:text-red-400 dark:border-red-400', icon: MdCancel },
  'potential 5': { colorClass: 'text-yellow-600 dark:text-yellow-400 font-medium', styles: 'bg-yellow-50 text-yellow-600 border-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-400', icon: MdTrendingUp },
  'potential 6': { colorClass: 'text-yellow-600 dark:text-yellow-400 font-medium', styles: 'bg-yellow-50 text-yellow-600 border-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-400', icon: MdTrendingUp },
  'potential 7': { colorClass: 'text-yellow-600 dark:text-yellow-400 font-medium', styles: 'bg-yellow-50 text-yellow-600 border-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-400', icon: MdTrendingUp },
  'potential 8': { colorClass: 'text-green-600 dark:text-green-400 font-medium', styles: 'bg-green-50 text-green-600 border-green-600 dark:bg-green-950/30 dark:text-green-400 dark:border-green-400', icon: MdTrendingUp },
  'potential 9': { colorClass: 'text-green-600 dark:text-green-400 font-medium', styles: 'bg-green-50 text-green-600 border-green-600 dark:bg-green-950/30 dark:text-green-400 dark:border-green-400', icon: MdTrendingUp },
  'potential 10': { colorClass: 'text-green-600 dark:text-green-400 font-medium', styles: 'bg-green-50 text-green-600 border-green-600 dark:bg-green-950/30 dark:text-green-400 dark:border-green-400', icon: MdTrendingUp }
};

export const ROLE_BADGE = {
  admin: {
    className: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/40',
    icon: null
  },
  marketing: {
    className: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/40',
    icon: MdTrendingUp
  },
  guest: {
    className: 'text-slate-600 bg-slate-100 dark:bg-slate-800/60 dark:text-slate-400 border-slate-300 dark:border-slate-600',
    icon: MdPersonOutline
  }
};

export const INITIAL_TAGS = [
  ...Array.from({ length: 10 }, (_, i) => `potential ${i + 1}`),
  'pending',
  'disapproved',
  'unprocessed'
];

/** @deprecated Prefer useT().err(code) — kept for gradual migration / non-React modules */
export const ERRORS = {
  GLOBAL_NOT_FOUND: "Klaida: Objektas nerastas sistemoje.",
  GLOBAL_VALIDATION_ERROR: "Klaida: Duomenų struktūros validacijos klaida.",
  GLOBAL_UNKNOWN_ERROR: "Įvyko nenumatyta sisteminė klaida.",
  CLIENT_NAME_REQUIRED: "Klaida: Įmonės pavadinimas yra privalomas.",
  CLIENT_TAG_REQUIRED: "Klaida: Nepasirinktas kliento statusas.",
  CLIENT_CONTACTS_REQUIRED_FOR_UNPROCESSED: "Klaida: Neapdorotiems klientams būtina pridėti bent vieną validų kontaktą.",
  CLIENT_DUPLICATE_NAME: "Klaida: Klientas su tokiu pavadinimu jau egzistuoja sistemoje.",
  CLIENT_FETCH_ERROR: "Nepavyko užkrauti klientų sąrašo.",
  CLIENT_CREATE_ERROR: "Nepavyko sukurti kliento paskyros.",
  CLIENT_UPDATE_ERROR: "Nepavyko atnaujinti kliento duomenų.",
  CLIENT_UPDATE_SUCCESS: "Kliento duomenys sėkmingai atnaujinti!",
  CLIENT_DELETE_ERROR: "Nepavyko ištrinti kliento iš sistemos.",
  CLIENT_DELETE_SUCCESS: "Kliento paskyra sėkmingai pašalinta iš sistemos.",
  CLIENT_DELETE_FORBIDDEN: "Neturite teisės ištrinti šio kliento.",
  CLIENT_EDIT_FORBIDDEN: "Neturite teisės redaguoti šio kliento.",
  CLIENT_GUEST_SIMULATED: "Svečio režimas: klientas pridėtas tik lokaliai.",
  CLIENT_GUEST_FORBIDDEN: "Svečio režimas: pakeitimai į duomenų bazę nėra leidžiami.",
  USER_USERNAME_REQUIRED: "Vartotojo vardas yra privalomas.",
  USER_USERNAME_INVALID: "Vartotojo vardas gali turėti tik raides, skaičius, taškus, brūkšnelius (3–32 simb.).",
  USER_PASSWORD_TOO_SHORT: "Slaptažodis privalo būti ne trumpesnis nei 6 simboliai.",
  USER_INVALID_ROLE: "Neteisingas rolės pasirinkimas.",
  USER_DUPLICATE_USERNAME: "Šis vartotojo vardas jau užimtas.",
  USER_FETCH_ERROR: "Nepavyko užkrauti vartotojų.",
  USER_DELETE_ADMIN_FORBIDDEN: "Adminų trinti negalima.",
  USER_DELETE_ERROR: "Klaida trinant vartotoją.",
  USER_CREATE_SUCCESS: "Naujas vartotojas sukurtas sėkmingai.",
  USER_CREATE_ERROR: "Nepavyko sukurti vartotojo dėl serverio klaidos.",
  AUTH_CREDENTIALS_REQUIRED: "Įveskite vartotojo vardą ir slaptažodį.",
  AUTH_INVALID_CREDENTIALS: "Neteisingas vartotojo vardas arba slaptažodis.",
  AUTH_LOGIN_SUCCESS: "Sėkmingai prisijungta!",
  AUTH_SERVER_ERROR: "Serverio klaida prisijungimo metu.",
  AUTH_UNAUTHORIZED: "Sesija negalioja. Prisijunkite iš naujo.",
  AUTH_FORBIDDEN: "Prieiga uždrausta.",
  AUTH_PASSWORD_FIELDS_REQUIRED: "Užpildykite abu slaptažodžio laukus.",
  AUTH_PASSWORD_TOO_SHORT: "Naujas slaptažodis privalo būti ne trumpesnis nei 6 simboliai.",
  AUTH_CURRENT_PASSWORD_INVALID: "Dabartinis slaptažodis neteisingas.",
  AUTH_PASSWORD_UPDATED: "Slaptažodis sėkmingai atnaujintas!",
  AUTH_PASSWORD_UPDATE_ERROR: "Nepavyko atnaujinti slaptažodžio.",
  FORM_ALL_FIELDS_REQUIRED: "Prašome užpildyti visus laukus.",
  FORM_USERNAME_REQUIRED: "Prašome įvesti vartotojo vardą.",
  FORM_PASSWORD_REQUIRED: "Prašome įvesti laikiną slaptažodį.",
  FORM_CREATE_SUCCESS: "Naujas vartotojas sukurtas sėkmingai.",
  FORM_CREATE_ERROR: "Nepavyko pridėti vartotojo dėl serverio klaidos.",
  EVENT_NOTE_REQUIRED: "Įvykio pastaba yra privaloma.",
  EVENT_DATE_REQUIRED: "Įvykio data yra privaloma.",
  EVENT_DATE_INVALID: "Neteisingas datos formatas.",
  EVENT_CLIENT_NOT_FOUND: "Pasirinktas klientas nerastas.",
  EVENT_FETCH_ERROR: "Nepavyko užkrauti įvykių.",
  EVENT_CREATE_ERROR: "Nepavyko sukurti įvykio.",
  EVENT_UPDATE_ERROR: "Nepavyko atnaujinti įvykio.",
  EVENT_DELETE_ERROR: "Nepavyko ištrinti įvykio.",
  EVENT_CREATE_SUCCESS: "Įvykis sėkmingai sukurtas!",
  EVENT_UPDATE_SUCCESS: "Įvykis sėkmingai atnaujintas!",
  EVENT_DELETE_SUCCESS: "Įvykis sėkmingai pašalintas.",
  EVENT_GUEST_SIMULATED: "Svečio režimas: įvykis pridėtas tik lokaliai.",
};
