declare global {
  interface Window {
    customIcons: any
    customIconsets: any

    customCards: any
  }
}

import './icons';
import './cards/humidifier-card';
import './cards/air-purifier-card';