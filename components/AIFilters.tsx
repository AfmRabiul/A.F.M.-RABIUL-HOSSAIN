import React from 'react';
import { MagicWandIcon } from './Icons';

interface AIFiltersProps {
    onSelectFilter: (prompt: string) => void;
    isLoading: boolean;
}

const filters = [
    { name: 'Cinematic', prompt: 'Apply a cinematic look to this image, with high contrast, desaturated colors, and a teal and orange color grade.' },
    { name: 'Dreamy Glow', prompt: 'Give this image a soft, dreamy, ethereal glow. Add a gentle haze and slightly bloom the highlights.' },
    { name: 'Vintage Film', prompt: 'Make this look like a vintage photograph from the 1970s. Add film grain, slight color fading, and warm tones.' },
    { name: 'Noir', prompt: 'Transform this into a black and white noir style image. Make it high contrast, dramatic, and moody.' },
    { name: 'Cyberpunk', prompt: 'Give this image a cyberpunk aesthetic. Add neon lights, vibrant pinks and blues, and a futuristic, gritty feel.' },
    { name: 'Watercolor', prompt: 'Convert this photo into a delicate watercolor painting style.' },
];

const AIFilters: React.FC<AIFiltersProps> = ({ onSelectFilter, isLoading }) => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <div className="flex items-center mb-3">
                <MagicWandIcon className="h-6 w-6 text-indigo-400 mr-2" />
                <h2 className="text-lg font-semibold text-indigo-400">AI-Powered Filters</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filters.map((filter) => (
                    <button
                        key={filter.name}
                        onClick={() => onSelectFilter(filter.prompt)}
                        disabled={isLoading}
                        className="w-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-md text-sm transition-colors duration-200"
                        title={filter.prompt}
                    >
                        {filter.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AIFilters;
