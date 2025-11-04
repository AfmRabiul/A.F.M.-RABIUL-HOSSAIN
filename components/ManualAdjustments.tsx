import React, { useState, useEffect } from 'react';
import { CropIcon, ResetIcon, RotateIcon } from './Icons';

interface ManualAdjustmentsProps {
    brightness: number;
    contrast: number;
    saturation: number;
    isCropping: boolean;
    onCropToggle: () => void;
    onCropApply: () => void;
    onRotateClick: () => void;
    onReset: () => void;
    onCommitChange: (values: { brightness?: number, contrast?: number, saturation?: number }) => void;
}

const Slider: React.FC<{
    label: string;
    value: number;
    setValue: (value: number) => void;
    onCommit: () => void;
    min?: number;
    max?: number;
    unit?: string;
}> = ({ label, value, setValue, onCommit, min = 0, max = 200, unit = '%' }) => (
    <div>
        <label className="flex justify-between items-center text-sm font-medium text-gray-300">
            <span>{label}</span>
            <span>{value}{unit}</span>
        </label>
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => setValue(parseInt(e.target.value))}
            onMouseUp={onCommit}
            onTouchEnd={onCommit}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
    </div>
);


const ManualAdjustments: React.FC<ManualAdjustmentsProps> = ({
    brightness,
    contrast,
    saturation,
    isCropping, onCropToggle, onCropApply, onRotateClick, onReset,
    onCommitChange
}) => {
    const [liveBrightness, setLiveBrightness] = useState(brightness);
    const [liveContrast, setLiveContrast] = useState(contrast);
    const [liveSaturation, setLiveSaturation] = useState(saturation);

    useEffect(() => {
        setLiveBrightness(brightness);
    }, [brightness]);
    
    useEffect(() => {
        setLiveContrast(contrast);
    }, [contrast]);

    useEffect(() => {
        setLiveSaturation(saturation);
    }, [saturation]);

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-indigo-400">Manual Adjustments</h2>
                <button 
                    onClick={onReset} 
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Reset adjustments"
                    title="Reset adjustments"
                >
                    <ResetIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-4">
                <Slider 
                    label="Brightness" 
                    value={liveBrightness} 
                    setValue={setLiveBrightness}
                    onCommit={() => onCommitChange({ brightness: liveBrightness })}
                />
                <Slider 
                    label="Contrast" 
                    value={liveContrast}
                    setValue={setLiveContrast}
                    onCommit={() => onCommitChange({ contrast: liveContrast })}
                />
                <Slider 
                    label="Saturation" 
                    value={liveSaturation}
                    setValue={setLiveSaturation}
                    onCommit={() => onCommitChange({ saturation: liveSaturation })}
                />
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
                {isCropping ? (
                    <div className="flex gap-2">
                        <button
                            onClick={onCropApply}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                        >
                            Apply Crop
                        </button>
                        <button
                            onClick={onCropToggle}
                            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={onCropToggle}
                            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition-colors"
                        >
                            <CropIcon className="h-5 w-5 mr-2" />
                            Crop
                        </button>
                         <button
                            onClick={onRotateClick}
                            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition-colors"
                        >
                            <RotateIcon className="h-5 w-5 mr-2" />
                            Rotate
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManualAdjustments;
