'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from './input';
import { ChevronDown } from 'lucide-react';

interface AutocompleteProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (value: string) => void;
  suggestions: string[];
  onSuggestionsFetch?: (query: string) => Promise<void>;
  minChars?: number;
  disabled?: boolean;
}

export function Autocomplete({
  placeholder,
  value,
  onChange,
  onSelect,
  suggestions,
  onSuggestionsFetch,
  minChars = 3,
  disabled = false
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ((localValue || '').length >= minChars) {
      if (onSuggestionsFetch) {
        // Server-side filtering
        setLoading(true);
        onSuggestionsFetch(localValue || '').then(() => {
          setLoading(false);
          setFilteredSuggestions(suggestions);
          // setIsOpen(suggestions.length > 0);
          setSelectedIndex(-1);
        });
      } else {
        // Client-side filtering
        const filtered = suggestions.filter(suggestion =>
          suggestion.toLowerCase().includes((localValue || '').toLowerCase())
        ).slice(0, 10);
        setFilteredSuggestions(filtered);
        // setIsOpen(filtered.length > 0);
        setSelectedIndex(-1);
      }
    } else {
      setIsOpen(false);
      setFilteredSuggestions([]);
      setSelectedIndex(-1);
    }
  }, [localValue, suggestions, minChars, onSuggestionsFetch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    onChange?.(suggestion);
    onSelect?.(suggestion);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(newValue);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    if ((localValue || '').length >= minChars && filteredSuggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredSuggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
          handleSuggestionClick(filteredSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={localValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        {(loading || (filteredSuggestions.length > 0 && (localValue || '').length >= minChars)) && (
          <ChevronDown
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-transform ${
              isOpen ? 'rotate-180' : ''
            } ${loading ? 'animate-spin' : ''}`}
          />
        )}
      </div>
      
      {localValue && localValue.length < minChars && localValue.length > 0 && (
        <p className="text-sm text-gray-500 mt-1">
          Enter at least {minChars} characters
        </p>
      )}

      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-3 py-2 text-left focus:outline-none ${
                index === selectedIndex
                  ? 'bg-blue-50 text-blue-900'
                  : 'hover:bg-gray-50 focus:bg-gray-50'
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}