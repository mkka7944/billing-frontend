/**
 * Logic Parity with modern-map.py
 */

export function shortenAreaName(name, district, tehsil) {
    if (!name) return 'N/A';

    // Clean name from breadcrumbs if they were prepended
    let cleanName = name
        .replace(new RegExp(`${district} - `, 'gi'), '')
        .replace(new RegExp(`${tehsil} - `, 'gi'), '');

    // Don't shorten for Khushab as per legacy logic
    if (district && district.toUpperCase() === 'KHUSHAB') {
        return cleanName.trim();
    }

    // Match patterns like MC-1, UC-4
    const match = cleanName.match(/((?:MC|UC|Zone|Ward)[-\s]*\d+)/i);
    if (match) {
        return match[1].toUpperCase().replace(/\s/g, '');
    }

    // Fallback: first word or comma split
    return cleanName.split(',')[0].trim().split(' ')[0];
}

export function formatLocationLabel(district, area) {
    if (!district) return area || 'Unknown';
    if (!area) return district;
    return `${district} - ${area}`;
}
