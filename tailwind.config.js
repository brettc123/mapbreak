/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html', 
    './src/**/*.{js,ts,jsx,tsx}',
    // ENHANCED: More specific paths to ensure all components are scanned
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/hooks/**/*.{js,ts,jsx,tsx}',
    './src/contexts/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'antique': '#F4F1DE',
        'terra': '#E07A5F',
        'slate': '#3D405B',
        'sage': '#81B29A',
        'parchment': '#F5E6D3',
        'compass': {
          50: '#F7F9F9',
          100: '#E2ECF0',
          200: '#C5D9E3',
          300: '#A3C3D1',
          400: '#7FA8BC',
          500: '#5B8CA3',
          600: '#456A7C',
          700: '#2F4856',
          800: '#1A2830',
          900: '#0B1013'
        },
        'terrain': {
          50: '#F4F1ED',
          100: '#E2D5C3',
          200: '#D1B99A',
          300: '#BF9D71',
          400: '#AD8148',
          500: '#8B6739',
          600: '#694D2B',
          700: '#47341D',
          800: '#251B0F',
          900: '#120D07'
        }
      },
      fontFamily: {
        'display': ['Cal Sans', 'sans-serif'],
        'sans': ['Outfit', 'sans-serif']
      }
    },
  },
  plugins: [],
  
  // CRITICAL FIX: Force include classes that mobile builds might miss
  safelist: [
    // Layout classes
    'fixed',
    'inset-0', 
    'absolute',
    'relative',
    'z-[60]',
    'z-[70]',
    
    // Background colors
    'bg-white',
    'bg-gray-900',
    'bg-gray-800',
    'bg-gray-700',
    'bg-blue-50',
    'bg-blue-600',
    'bg-blue-700',
    'bg-indigo-600',
    'bg-indigo-700',
    'bg-indigo-500',
    'bg-red-50',
    'bg-orange-600',
    'bg-orange-700',
    
    // Dark mode backgrounds
    'dark:bg-gray-900',
    'dark:bg-gray-800', 
    'dark:bg-gray-700',
    'dark:bg-blue-900/20',
    'dark:bg-red-900/50',
    'dark:bg-indigo-500',
    'dark:bg-indigo-600',
    
    // Safe area classes
    'pt-safe',
    'pl-safe',
    'pr-safe', 
    'pb-safe',
    'top-safe',
    'right-safe',
    
    // Layout & Flex
    'h-full',
    'h-screen',
    'min-h-screen',
    'w-full',
    'w-6',
    'w-5',
    'w-4',
    'h-6',
    'h-5', 
    'h-4',
    'flex',
    'flex-col',
    'flex-1',
    'items-center',
    'justify-center',
    'justify-between',
    
    // Spacing
    'p-4',
    'p-3',
    'py-3',
    'py-2',
    'px-4',
    'px-10',
    'px-2',
    'mx-auto',
    'mt-16',
    'mt-8',
    'mt-6',
    'mt-2',
    'mt-0.5',
    'mb-6',
    'mb-4',
    'mb-2',
    'mr-2',
    'mr-1',
    'gap-3',
    'space-y-4',
    'space-y-6',
    '-space-y-px',
    
    // Sizing & Positioning
    'max-w-md',
    'left-3',
    'top-1/2',
    'transform',
    '-translate-y-1/2',
    'block',
    
    // Text styles
    'text-center',
    'text-3xl',
    'text-xl',
    'text-lg', 
    'text-sm',
    'text-xs',
    'font-extrabold',
    'font-bold',
    'font-semibold',
    'font-medium',
    
    // Text colors
    'text-white',
    'text-gray-900',
    'text-gray-800',
    'text-gray-700',
    'text-gray-600',
    'text-gray-500',
    'text-gray-400',
    'text-gray-300',
    'text-gray-200',
    'text-blue-800',
    'text-blue-600',
    'text-red-600',
    'text-indigo-600',
    'text-orange-600',
    
    // Dark mode text colors
    'dark:text-white',
    'dark:text-gray-400',
    'dark:text-gray-300',
    'dark:text-gray-200',
    'dark:text-blue-300',
    'dark:text-blue-400',
    'dark:text-red-400',
    'dark:text-indigo-400',
    'dark:text-indigo-300',
    'dark:text-orange-400',
    
    // Borders
    'border',
    'border-t',
    'border-gray-300',
    'border-gray-600',
    'border-blue-200',
    'border-blue-700',
    'border-red-200',
    'border-red-700',
    'border-transparent',
    'rounded-lg',
    'rounded-md',
    'rounded-t-md',
    'rounded-b-md',
    'rounded-full',
    
    // Dark mode borders
    'dark:border-gray-600',
    'dark:border-gray-700',
    'dark:border-blue-700',
    'dark:border-red-700',
    
    // Interactive states
    'hover:bg-gray-50',
    'hover:bg-gray-700',
    'hover:bg-blue-700',
    'hover:bg-indigo-700',
    'hover:bg-orange-700',
    'hover:text-gray-900',
    'hover:text-white',
    'hover:text-blue-600',
    'hover:text-blue-200',
    'hover:text-indigo-500',
    'hover:text-indigo-300',
    
    // Dark mode hover states
    'dark:hover:bg-gray-700',
    'dark:hover:bg-indigo-600',
    'dark:hover:text-white',
    'dark:hover:text-blue-200',
    'dark:hover:text-indigo-300',
    
    // Focus states
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'focus:ring-indigo-500',
    'focus:border-indigo-500',
    'focus:z-10',
    
    // Disabled states
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    
    // Misc utility classes
    'shadow-sm',
    'shadow-lg',
    'shadow-xl',
    'cursor-pointer',
    'appearance-none',
    'sr-only',
    'flex-shrink-0',
    'underline',
    'backdrop-blur-sm',
    
    // Placeholder colors
    'placeholder-gray-500',
    'dark:placeholder-gray-400',
    
    // Special z-index values used in your components
    'z-\\[60\\]',
    'z-\\[70\\]',
    
    // Modal/overlay backgrounds
    'bg-black/50',
    'bg-white/95',
    'bg-gray-800/95',
    'bg-white/10',
    'bg-white/20',
  ],
};