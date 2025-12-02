'use client';

import { ChakraProvider, extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      primary: '#1e3a8a',
      secondary: '#3b82f6',
      accent: '#10b981',
    },
    base: {
      100: '#ffffff',
      200: '#f3f4f6',
      300: '#e5e7eb',
    },
    text: {
      primary: '#111827',
      secondary: '#4b5563',
    },
  },
  fonts: {
    heading: 'var(--font-geist-sans), system-ui, sans-serif',
    body: 'var(--font-geist-sans), system-ui, sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: 'base.200',
        color: 'text.primary',
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
}
