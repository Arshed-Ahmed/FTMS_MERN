import React from 'react';
import { Info } from 'lucide-react';

const BodySilhouette = ({ onPartClick, activePart }) => {
  // Simple SVG silhouette with clickable zones
  // This is a simplified geometric representation for the demo
  return (
    <svg viewBox="0 0 200 400" className="w-full h-full max-h-[500px] mx-auto">
      {/* Head / Neck */}
      <g 
        onClick={() => onPartClick('Neck')} 
        className={`cursor-pointer transition-colors ${activePart === 'Neck' ? 'fill-blue-200 stroke-blue-600' : 'fill-gray-100 stroke-gray-400 hover:fill-gray-200'}`}
      >
        <circle cx="100" cy="50" r="25" strokeWidth="2" />
        <text x="100" y="55" textAnchor="middle" fontSize="10" className="fill-gray-600 pointer-events-none">Neck</text>
      </g>

      {/* Shoulders */}
      <g 
        onClick={() => onPartClick('Shoulder')} 
        className={`cursor-pointer transition-colors ${activePart === 'Shoulder' ? 'fill-blue-200 stroke-blue-600' : 'fill-gray-100 stroke-gray-400 hover:fill-gray-200'}`}
      >
        <path d="M40 80 Q100 90 160 80 L170 100 L30 100 Z" strokeWidth="2" />
        <text x="100" y="95" textAnchor="middle" fontSize="10" className="fill-gray-600 pointer-events-none">Shoulder</text>
      </g>

      {/* Chest */}
      <g 
        onClick={() => onPartClick('Chest')} 
        className={`cursor-pointer transition-colors ${activePart === 'Chest' ? 'fill-blue-200 stroke-blue-600' : 'fill-gray-100 stroke-gray-400 hover:fill-gray-200'}`}
      >
        <rect x="40" y="100" width="120" height="60" rx="5" strokeWidth="2" />
        <text x="100" y="135" textAnchor="middle" fontSize="10" className="fill-gray-600 pointer-events-none">Chest</text>
      </g>

      {/* Sleeve (Left) */}
      <g 
        onClick={() => onPartClick('Sleeve')} 
        className={`cursor-pointer transition-colors ${activePart === 'Sleeve' ? 'fill-blue-200 stroke-blue-600' : 'fill-gray-100 stroke-gray-400 hover:fill-gray-200'}`}
      >
        <path d="M30 100 L10 200 L30 200 L50 100 Z" strokeWidth="2" />
        <text x="30" y="150" textAnchor="middle" fontSize="10" className="fill-gray-600 pointer-events-none">Sleeve</text>
      </g>

      {/* Sleeve (Right) */}
      <g 
        onClick={() => onPartClick('Sleeve')} 
        className={`cursor-pointer transition-colors ${activePart === 'Sleeve' ? 'fill-blue-200 stroke-blue-600' : 'fill-gray-100 stroke-gray-400 hover:fill-gray-200'}`}
      >
        <path d="M170 100 L190 200 L170 200 L150 100 Z" strokeWidth="2" />
      </g>

      {/* Waist */}
      <g 
        onClick={() => onPartClick('Waist')} 
        className={`cursor-pointer transition-colors ${activePart === 'Waist' ? 'fill-blue-200 stroke-blue-600' : 'fill-gray-100 stroke-gray-400 hover:fill-gray-200'}`}
      >
        <rect x="45" y="160" width="110" height="40" rx="5" strokeWidth="2" />
        <text x="100" y="185" textAnchor="middle" fontSize="10" className="fill-gray-600 pointer-events-none">Waist</text>
      </g>

      {/* Length (Torso) */}
      <g 
        onClick={() => onPartClick('Length')} 
        className={`cursor-pointer transition-colors ${activePart === 'Length' ? 'fill-blue-200 stroke-blue-600' : 'fill-gray-100 stroke-gray-400 hover:fill-gray-200'}`}
      >
        <rect x="45" y="200" width="110" height="100" rx="5" strokeWidth="2" />
        <text x="100" y="250" textAnchor="middle" fontSize="10" className="fill-gray-600 pointer-events-none">Length</text>
      </g>
    </svg>
  );
};

const MeasurementGuide = ({ activeField, onFieldSelect, customImage }) => {
  const instructions = {
    Neck: "Measure around the base of the neck, inserting two fingers between the tape and neck for comfort.",
    Chest: "Measure under the armpits around the fullest part of the chest, keeping the tape horizontal.",
    Waist: "Measure around the natural waistline, usually at the belly button level.",
    Shoulder: "Measure from the end of one shoulder bone to the other across the back.",
    Sleeve: "Measure from the shoulder seam down to the wrist bone (or desired length).",
    Length: "Measure from the highest point of the shoulder down to the desired hemline."
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 h-full">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Visual Guide</h3>
      
      <div className="flex flex-col items-center">
        <div className="w-full max-w-[200px] mb-6">
          {customImage ? (
             <div className="relative w-full h-full flex flex-col items-center">
               <img 
                 src={`http://localhost:5000${customImage}`} 
                 alt="Measurement Guide" 
                 className="max-w-full max-h-[400px] object-contain rounded-md"
                 onError={(e) => {
                   e.target.onerror = null; 
                   e.target.src = 'https://placehold.co/400x600?text=No+Image';
                 }}
               />
            </div>
          ) : (
            <BodySilhouette onPartClick={onFieldSelect} activePart={activeField} />
          )}
        </div>

        <div className="w-full bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1">
                {activeField ? `How to measure: ${activeField}` : 'Select a body part'}
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {activeField ? instructions[activeField] : 'Click on the diagram or select a field to see measurement instructions.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeasurementGuide;
