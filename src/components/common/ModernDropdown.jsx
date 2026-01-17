import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const ModernDropdown = ({ options, value, onChange, placeholder = "Select...", className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt === value || (typeof opt === 'object' && opt.value === value));
    const displayLabel = selectedOption
        ? (typeof selectedOption === 'object' ? selectedOption.label : selectedOption)
        : placeholder;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        const val = typeof option === 'object' ? option.value : option;
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className={`relative inline-block w-full text-sm ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left px-4 pr-10 py-2.5 border rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all focus:outline-none flex items-center justify-between min-h-[42px]"
            >
                <span className="truncate">{displayLabel}</span>
                <ChevronDown
                    size={18}
                    className={`absolute right-3 text-slate-400 transition-transform duration-300 ease-in-out ${isOpen ? "rotate-180" : "rotate-0"}`}
                />
            </button>

            {isOpen && (
                <ul className="absolute z-[100] w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg shadow-xl mt-1.5 py-1.5 max-h-60 overflow-y-auto scrollbar-premium backdrop-blur-xl bg-opacity-95 dark:bg-opacity-95 animate-in fade-in slide-in-from-top-2 duration-150 ease-out">
                    {options.length > 0 ? (
                        options.map((option, index) => {
                            const optLabel = typeof option === 'object' ? option.label : option;
                            const optValue = typeof option === 'object' ? option.value : option;
                            const isSelected = optValue === value;

                            return (
                                <li
                                    key={index}
                                    className={`px-4 py-2 cursor-pointer transition-colors text-xs font-medium ${isSelected ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}`}
                                    onClick={() => handleSelect(option)}
                                >
                                    {optLabel}
                                </li>
                            );
                        })
                    ) : (
                        <li className="px-4 py-2 text-slate-400 text-xs italic">No options available</li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default ModernDropdown;
