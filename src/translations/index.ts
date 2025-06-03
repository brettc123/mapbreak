import { Language } from '../contexts/LanguageContext';

type TranslationKey = 
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'nav.maps'
  | 'nav.search'
  | 'nav.explore'
  | 'nav.favorites'
  | 'nav.settings'
  | 'settings.language'
  | 'settings.notifications'
  | 'settings.theme'
  | 'settings.textSize'
  | 'settings.account'
  | 'settings.legal'
  | 'map.coordinates'
  | 'map.share'
  | 'map.random'
  | 'map.favorite'
  | 'subscription.title'
  | 'subscription.description'
  | 'subscription.features'
  | 'subscription.button';

type Translations = {
  [key in TranslationKey]: string;
};

const translations: Record<string, Translations> = {
  en: {
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success',
    'nav.maps': 'Maps',
    'nav.search': 'Search',
    'nav.explore': 'Explore',
    'nav.favorites': 'Favorites',
    'nav.settings': 'Settings',
    'settings.language': 'Language',
    'settings.notifications': 'Notifications',
    'settings.theme': 'Theme',
    'settings.textSize': 'Text Size',
    'settings.account': 'Account',
    'settings.legal': 'Legal',
    'map.coordinates': 'Coordinates',
    'map.share': 'Share',
    'map.random': 'Random',
    'map.favorite': 'Favorite',
    'subscription.title': 'Unlock All Features',
    'subscription.description': 'Subscribe to access favorites and save your preferred locations.',
    'subscription.features': 'What you\'ll get:',
    'subscription.button': 'Subscribe Now'
  },
  es: {
    'common.loading': 'Cargando...',
    'common.error': 'Se produjo un error',
    'common.success': 'Éxito',
    'nav.maps': 'Mapas',
    'nav.search': 'Buscar',
    'nav.explore': 'Explorar',
    'nav.favorites': 'Favoritos',
    'nav.settings': 'Ajustes',
    'settings.language': 'Idioma',
    'settings.notifications': 'Notificaciones',
    'settings.theme': 'Tema',
    'settings.textSize': 'Tamaño del texto',
    'settings.account': 'Cuenta',
    'settings.legal': 'Legal',
    'map.coordinates': 'Coordenadas',
    'map.share': 'Compartir',
    'map.random': 'Aleatorio',
    'map.favorite': 'Favorito',
    'subscription.title': 'Desbloquea todas las funciones',
    'subscription.description': 'Suscríbete para acceder a favoritos y guardar tus ubicaciones preferidas.',
    'subscription.features': 'Lo que obtendrás:',
    'subscription.button': 'Suscribirse ahora'
  }
};

export const getTranslation = (language: Language, key: TranslationKey): string => {
  return translations[language.code]?.[key] || translations.en[key];
};

export type { TranslationKey };