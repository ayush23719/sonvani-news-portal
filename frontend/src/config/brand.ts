import { env } from './env'

export const brandConfig = {
  name: 'सोनवाणी',
  tagline: 'सच की आवाज़, आपके शहर से',
  logoPath: '/brand/sonvani-logo.svg',
  siteDomain: env.siteDomain,
  colors: {
    primaryNavy: '#07135F',
    newsRed: '#E5252A',
    deepText: '#111827',
    mutedText: '#5B6472',
    pageBackground: '#F6F7F9',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    successGreen: '#128C4A',
    warningAmber: '#F59E0B',
  },
  socialLinks: {
    facebook: '#',
    youtube: '#',
    instagram: '#',
    whatsapp: '#',
  },
} as const
