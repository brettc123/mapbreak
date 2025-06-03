import React, { createContext, useContext, useEffect, useState } from 'react';

type TextSize = 'default' | 'large';

interface TextSizeContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
}

const TextSizeContext = createContext<TextSizeContextType | undefined>(undefined);

export function TextSizeProvider({ children }: { children: React.ReactNode }) {
  const [textSize, setTextSize] = useState<TextSize>(() => {
    const saved = localStorage.getItem('textSize');
    return (saved as TextSize) || 'default';
  });

  useEffect(() => {
    localStorage.setItem('textSize', textSize);
    document.documentElement.classList.remove('text-default', 'text-large');
    document.documentElement.classList.add(`text-${textSize}`);
  }, [textSize]);

  return (
    <TextSizeContext.Provider value={{ textSize, setTextSize }}>
      {children}
    </TextSizeContext.Provider>
  );
}

export function useTextSize() {
  const context = useContext(TextSizeContext);
  if (context === undefined) {
    throw new Error('useTextSize must be used within a TextSizeProvider');
  }
  return context;
}