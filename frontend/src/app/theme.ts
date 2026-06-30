import { createTheme } from '@mui/material/styles'
import { brandConfig } from '@/config/brand'

const brandColors = brandConfig.colors

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: brandColors.primaryNavy,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: brandColors.newsRed,
      contrastText: '#FFFFFF',
    },
    success: {
      main: brandColors.successGreen,
    },
    warning: {
      main: brandColors.warningAmber,
    },
    background: {
      default: brandColors.pageBackground,
      paper: brandColors.surface,
    },
    text: {
      primary: brandColors.deepText,
      secondary: brandColors.mutedText,
    },
    divider: brandColors.border,
  },
  typography: {
    fontFamily:
      '"Noto Sans Devanagari", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontSize: '2.35rem',
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: 0,
    },
    h2: {
      fontSize: '1.65rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: 0,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 700,
      lineHeight: 1.35,
      letterSpacing: 0,
    },
    body1: {
      fontSize: '1.025rem',
      lineHeight: 1.75,
      letterSpacing: 0,
    },
    body2: {
      fontSize: '0.925rem',
      lineHeight: 1.65,
      letterSpacing: 0,
    },
    button: {
      fontWeight: 700,
      letterSpacing: 0,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiContainer: {
      defaultProps: {
        maxWidth: 'xl',
      },
      styleOverrides: {
        root: {
          width: '100%',
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: false,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: `1px solid ${brandColors.border}`,
          boxShadow: '0 1px 2px rgba(17, 24, 39, 0.06)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
})
