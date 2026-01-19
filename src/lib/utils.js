import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Shadcn UI utility for merging tailwind classes
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

/**
 * Smart location name shortener ported from legacy engine
 * @param {string} name - UC/Area name
 * @param {string} district - District name
 * @param {string} tehsil - Tehsil name
 */
export function shortenAreaName(name, district, tehsil) {
    if (!name) return "";

    let processed = name
        .replace(`${district} - `, "")
        .replace(`${tehsil} - `, "");

    if (district?.toUpperCase() === 'KHUSHAB') {
        return processed.trim();
    }

    // Match patterns like MC-1, UC-4
    const match = processed.match(/((?:MC|UC|Zone|Ward)[-\s]*\d+)/i);
    if (match) {
        return match[1].toUpperCase().replace(/\s/g, '');
    }

    // Fallback to first word or comma split
    return processed.split(',')[0].trim().split(' ')[0];
}

/**
 * Formats a standardized location label
 */
export function formatLocationLabel(district, area) {
    if (!area) return district || "Unknown Location";
    if (area.includes(district)) return area;
    return `${district} - ${area}`;
}
