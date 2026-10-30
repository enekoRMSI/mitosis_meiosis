/**
 * CitoLab Cell Graphics & Chromosome Model Generator
 * Genera SVG interactivos y didácticos con rigor científico para la célula modelo 2n = 4.
 */

const CellColors = {
    pair1Paternal: '#2563eb', // Azul cobalto (Cromosoma 1 Paterno)
    pair1Maternal: '#e11d48', // Rojo carmín (Cromosoma 1 Materno)
    pair2Paternal: '#059669', // Verde esmeralda (Cromosoma 2 Paterno)
    pair2Maternal: '#d97706', // Naranja ámbar (Cromosoma 2 Materno)
    centromere: '#f8fafc',
    centromereBorder: '#475569',
    spindleFiber: 'rgba(56, 189, 248, 0.45)',
    nuclearEnvelope: 'rgba(168, 85, 247, 0.55)',
    membrane: '#38bdf8',
    membraneMitosis: '#38bdf8',
    membraneMeiosis: '#d946ef',
    membraneForensic: '#f59e0b'
};

class CellGraphics {
    /**
     * Dibuja una cromátida simple (brazo p, centrómero, brazo q)
     */
    static createSimpleChromatid(x, y, length, color, angle = 0, recombinantTipColor = null, id = '') {
        const halfL = length / 2;
        const width = 12;
        const r = width / 2;

        let recombinantSvg = '';
        if (recombinantTipColor) {
            // Segmento distal recombinado (30% final del brazo q)
            const tipH = length * 0.32;
            recombinantSvg = `
                <rect x="${-r}" y="${halfL - tipH}" width="${width}" height="${tipH}" rx="${r}" fill="${recombinantTipColor}" class="recombinant-segment" />
                <line x1="${-r}" y1="${halfL - tipH}" x2="${r}" y2="${halfL - tipH}" stroke="#ffffff" stroke-dasharray="2,2" stroke-width="1.2" />
            `;
        }

        return `
        <g class="chromatid-simple" id="${id}" transform="translate(${x}, ${y}) rotate(${angle})">
            <!-- Cuerpo de la cromátida -->
            <rect x="${-r}" y="${-halfL}" width="${width}" height="${length}" rx="${r}" fill="${color}" stroke="#0f172a" stroke-width="1.5" />
            <!-- Bandas cromosómicas para realismo científico -->
            <rect x="${-r + 1}" y="${-halfL + 6}" width="${width - 2}" height="3" fill="rgba(255,255,255,0.4)" rx="1" />
            <rect x="${-r + 1}" y="${halfL - 16}" width="${width - 2}" height="3" fill="rgba(0,0,0,0.3)" rx="1" />
            ${recombinantSvg}
            <!-- Centrómero -->
            <circle cx="0" cy="0" r="5" fill="${CellColors.centromere}" stroke="${CellColors.centromereBorder}" stroke-width="1.5" />
        </g>`;
    }

    /**
     * Dibuja un cromosoma duplicado (2 cromátidas hermanas unidas por el centrómero en 'X')
     */
    static createDuplicatedChromosome(x, y, length, baseColor, angle = 0, recombinantConfig = null, id = '', isDraggable = false) {
        const halfL = length / 2;
        const width = 11;
        const r = width / 2;
        const spreadAngle = 18; // Ángulo de apertura de las cromátidas hermanas

        let sister1Recomb = null;
        let sister2Recomb = null;
        if (recombinantConfig) {
            sister1Recomb = recombinantConfig.sister1 || null;
            sister2Recomb = recombinantConfig.sister2 || null;
        }

        const dragAttr = isDraggable ? 'class="chromosome-interactive" cursor="grab"' : 'class="chromosome-visual"';

        return `
        <g id="${id}" ${dragAttr} transform="translate(${x}, ${y}) rotate(${angle})">
            <!-- Cromátida Izquierda -->
            <g transform="rotate(${-spreadAngle})">
                <rect x="${-r}" y="${-halfL}" width="${width}" height="${length}" rx="${r}" fill="${baseColor}" stroke="#0f172a" stroke-width="1.5" />
                <rect x="${-r + 1}" y="${-halfL + 7}" width="${width - 2}" height="3" fill="rgba(255,255,255,0.35)" rx="1" />
                <rect x="${-r + 1}" y="${halfL - 14}" width="${width - 2}" height="3" fill="rgba(0,0,0,0.25)" rx="1" />
                ${sister1Recomb ? `
                    <rect x="${-r}" y="${halfL - length * 0.35}" width="${width}" height="${length * 0.35}" rx="${r}" fill="${sister1Recomb}" />
                    <line x1="${-r}" y1="${halfL - length * 0.35}" x2="${r}" y2="${halfL - length * 0.35}" stroke="#fff" stroke-dasharray="2,2" stroke-width="1" />
                ` : ''}
            </g>
            <!-- Cromátida Derecha -->
            <g transform="rotate(${spreadAngle})">
                <rect x="${-r}" y="${-halfL}" width="${width}" height="${length}" rx="${r}" fill="${baseColor}" stroke="#0f172a" stroke-width="1.5" />
                <rect x="${-r + 1}" y="${-halfL + 7}" width="${width - 2}" height="3" fill="rgba(255,255,255,0.35)" rx="1" />
                <rect x="${-r + 1}" y="${halfL - 14}" width="${width - 2}" height="3" fill="rgba(0,0,0,0.25)" rx="1" />
                ${sister2Recomb ? `
                    <rect x="${-r}" y="${halfL - length * 0.35}" width="${width}" height="${length * 0.35}" rx="${r}" fill="${sister2Recomb}" />
                    <line x1="${-r}" y1="${halfL - length * 0.35}" x2="${r}" y2="${halfL - length * 0.35}" stroke="#fff" stroke-dasharray="2,2" stroke-width="1" />
                ` : ''}
            </g>
            <!-- Centrómero Común y Cinetocoros -->
            <circle cx="0" cy="0" r="6" fill="${CellColors.centromere}" stroke="${CellColors.centromereBorder}" stroke-width="1.8" />
            <circle cx="-5" cy="0" r="2" fill="#38bdf8" />
            <circle cx="5" cy="0" r="2" fill="#38bdf8" />
        </g>`;
    }

    /**
     * Dibuja una célula base con membrana, citoplasma, centriolos y envoltura nuclear opcional
     */
    static createCellBase(width = 500, height = 340, options = {}) {
        const {
            showNuclearEnvelope = false,
            nuclearEnvelopeDissolving = false,
            showCentrioles = true,
            centriolePosition = 'poles', // 'together' o 'poles'
            spindleFibersToPoles = false
        } = options;

        const cx = width / 2;
        const cy = height / 2;
        const rx = width / 2 - 20;
        const ry = height / 2 - 20;

        let nuclearSvg = '';
        if (showNuclearEnvelope) {
            const dash = nuclearEnvelopeDissolving ? 'stroke-dasharray="6,8" opacity="0.6"' : 'stroke-dasharray="none" opacity="0.9"';
            nuclearSvg = `
                <ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.65}" ry="${ry * 0.65}" 
                    fill="rgba(147, 51, 234, 0.08)" stroke="${CellColors.nuclearEnvelope}" 
                    stroke-width="2.5" ${dash} class="nuclear-envelope" />
                <text x="${cx}" y="${cy - ry * 0.65 - 8}" text-anchor="middle" fill="#c084fc" font-size="11" font-family="sans-serif">
                    ${nuclearEnvelopeDissolving ? 'Envoltura nuclear fragmentándose' : 'Envoltura nuclear íntegra'}
                </text>
            `;
        }

        let centriolesSvg = '';
        let spindleSvg = '';

        if (showCentrioles) {
            if (centriolePosition === 'together') {
                centriolesSvg = `
                    <g transform="translate(${cx - 80}, ${cy - 70})">
                        <rect x="0" y="0" width="12" height="5" fill="#facc15" stroke="#ca8a04" />
                        <rect x="4" y="-3.5" width="5" height="12" fill="#facc15" stroke="#ca8a04" />
                        <circle cx="6" cy="2.5" r="14" fill="none" stroke="rgba(250, 204, 21, 0.3)" stroke-dasharray="2,2" />
                    </g>
                `;
            } else {
                // Polos opuestos (Izquierda y Derecha)
                const poleLeftX = 45;
                const poleRightX = width - 45;

                centriolesSvg = `
                    <!-- Polo Celular Izquierdo -->
                    <g transform="translate(${poleLeftX}, ${cy})">
                        <rect x="-6" y="-3" width="12" height="6" fill="#facc15" stroke="#ca8a04" />
                        <rect x="-3" y="-6" width="6" height="12" fill="#facc15" stroke="#ca8a04" />
                        <circle cx="0" cy="0" r="15" fill="none" stroke="rgba(250, 204, 21, 0.4)" stroke-dasharray="2,2" />
                        <text x="0" y="-18" fill="#fde047" font-size="10" text-anchor="middle">Áster / Polo Izq.</text>
                    </g>
                    <!-- Polo Celular Derecho -->
                    <g transform="translate(${poleRightX}, ${cy})">
                        <rect x="-6" y="-3" width="12" height="6" fill="#facc15" stroke="#ca8a04" />
                        <rect x="-3" y="-6" width="6" height="12" fill="#facc15" stroke="#ca8a04" />
                        <circle cx="0" cy="0" r="15" fill="none" stroke="rgba(250, 204, 21, 0.4)" stroke-dasharray="2,2" />
                        <text x="0" y="-18" fill="#fde047" font-size="10" text-anchor="middle">Áster / Polo Der.</text>
                    </g>
                `;

                if (spindleFibersToPoles) {
                    spindleSvg = `
                        <!-- Huso Acromático / Microtúbulos -->
                        <g class="spindle-network" stroke="${CellColors.spindleFiber}" stroke-width="1.2">
                            <line x1="${poleLeftX}" y1="${cy}" x2="${cx}" y2="${cy - 70}" />
                            <line x1="${poleLeftX}" y1="${cy}" x2="${cx}" y2="${cy - 25}" />
                            <line x1="${poleLeftX}" y1="${cy}" x2="${cx}" y2="${cy + 25}" />
                            <line x1="${poleLeftX}" y1="${cy}" x2="${cx}" y2="${cy + 70}" />
                            <line x1="${poleRightX}" y1="${cy}" x2="${cx}" y2="${cy - 70}" />
                            <line x1="${poleRightX}" y1="${cy}" x2="${cx}" y2="${cy - 25}" />
                            <line x1="${poleRightX}" y1="${cy}" x2="${cx}" y2="${cy + 25}" />
                            <line x1="${poleRightX}" y1="${cy}" x2="${cx}" y2="${cy + 70}" />
                        </g>
                    `;
                }
            }
        }

        const membraneStroke = options.membraneColor || CellColors.membrane;
        const membraneGlow = options.membraneGlow || 'rgba(56, 189, 248, 0.4)';

        return `
        <!-- Membrana Celular Plasmática -->
        <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" 
            fill="radial-gradient(circle, #0f172a 30%, #070d18 90%)" 
            stroke="${membraneStroke}" stroke-width="3" filter="drop-shadow(0 0 14px ${membraneGlow})" />
        
        <!-- Línea ecuatorial imaginaria (Placa Metafásica) -->
        <line x1="${cx}" y1="${35}" x2="${cx}" y2="${height - 35}" stroke="rgba(148, 163, 184, 0.2)" stroke-dasharray="4,4" stroke-width="1.5" />
        <text x="${cx}" y="${height - 18}" text-anchor="middle" fill="#64748b" font-size="10" font-family="monospace">Eje Ecuatorial</text>

        ${spindleSvg}
        ${nuclearSvg}
        ${centriolesSvg}
        `;
    }
}

window.CellGraphics = CellGraphics;
window.CellColors = CellColors;
