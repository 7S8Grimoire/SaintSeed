import i18next from 'i18next';
import en from '../locales/en.json';
import ru from '../locales/ru.json';

export function initLocalization() {
  i18next.init({
    lng: 'ru', // if you're using a language detector, do not define the lng option
    debug: false,
    resources: { en, ru },
    interpolation: { 
      escapeValue: false,
    }
  });
}