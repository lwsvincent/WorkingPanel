import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface UIContextType {
    zoomLevel: number;
    setZoomLevel: (level: number) => void;
    resetZoom: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

const STORAGE_KEY = 'app_ui_settings';

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize from storage or default to 100%
    const [zoomLevel, setZoomLevel] = useState<number>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return parsed.zoomLevel || 100;
            } catch (e) {
                console.error('Failed to parse UI settings', e);
            }
        }
        return 100;
    });

    // Persist to storage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ zoomLevel }));
    }, [zoomLevel]);

    // Apply zoom to root element


    const resetZoom = () => setZoomLevel(100);

    return (
        <UIContext.Provider value={{ zoomLevel, setZoomLevel, resetZoom }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};
