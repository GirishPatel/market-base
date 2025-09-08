'use client';

import { useState, useRef } from 'react';

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange: (value: number) => void;
  label?: string;
  suffix?: string;
  disabled?: boolean;
  markers?: number[];
}

export function Slider({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  label,
  suffix = '',
  disabled = false,
  markers = []
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const percentage = (((value || 0) - min) / (max - min)) * 100;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    updateValue(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || disabled) return;
    updateValue(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateValue = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const rawValue = min + (percentage / 100) * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));
    
    onChange(clampedValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      onChange(Math.max(min, Math.min(max, newValue)));
    }
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={handleInputChange}
              className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
              disabled={disabled}
            />
            {suffix && <span className="text-xs text-gray-500">{suffix}</span>}
          </div>
        </div>
      )}
      
      <div
        ref={sliderRef}
        className={`relative h-2 bg-gray-200 rounded-full ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute h-2 bg-blue-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
        
        {/* Markers */}
        {markers.map((marker) => {
          const markerPercentage = ((marker - min) / (max - min)) * 100;
          if (markerPercentage < 0 || markerPercentage > 100) return null;
          
          return (
            <div
              key={marker}
              className="absolute w-2 h-2 bg-red-500 rounded-full transform -translate-y-1 border border-white"
              style={{ left: `calc(${markerPercentage}% - 4px)`, top: '2px' }}
              title={`${marker}${suffix}`}
            />
          );
        })}
        
        <div
          className={`absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full transform -translate-y-1 ${
            disabled ? '' : 'shadow-md hover:shadow-lg transition-shadow'
          }`}
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  );
}