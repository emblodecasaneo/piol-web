import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Property } from '../api/api';

interface CompareContextType {
  selectedProperties: Property[];
  addToCompare: (property: Property) => boolean;
  removeFromCompare: (propertyId: string) => void;
  clearCompare: () => void;
  isInCompare: (propertyId: string) => boolean;
  canAddMore: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE = 3; // Maximum 3 propriétés à comparer
const STORAGE_KEY = 'piol_compare_properties';

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);

  // Charger depuis localStorage au montage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSelectedProperties(parsed);
      }
    } catch (error) {
      console.error('Error loading compare properties:', error);
    }
  }, []);

  // Sauvegarder dans localStorage quand ça change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedProperties));
    } catch (error) {
      console.error('Error saving compare properties:', error);
    }
  }, [selectedProperties]);

  const addToCompare = (property: Property): boolean => {
    if (selectedProperties.length >= MAX_COMPARE) {
      return false; // Maximum atteint
    }

    if (selectedProperties.find(p => p.id === property.id)) {
      return false; // Déjà dans la liste
    }

    setSelectedProperties(prev => [...prev, property]);
    return true;
  };

  const removeFromCompare = (propertyId: string) => {
    setSelectedProperties(prev => prev.filter(p => p.id !== propertyId));
  };

  const clearCompare = () => {
    setSelectedProperties([]);
  };

  const isInCompare = (propertyId: string): boolean => {
    return selectedProperties.some(p => p.id === propertyId);
  };

  const canAddMore = selectedProperties.length < MAX_COMPARE;

  return (
    <CompareContext.Provider
      value={{
        selectedProperties,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        canAddMore,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}

