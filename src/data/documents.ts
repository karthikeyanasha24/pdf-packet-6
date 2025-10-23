import type { Document } from '@/types'

// Real PDF documents from your PDFS folder
export const availableDocuments: Document[] = [
  {
    id: 'tds-maxterra',
    name: 'Technical Data Sheet',
    description: 'MAXTERRA® MgO Non-Combustible Single Layer Structural Floor Panels',
    filename: 'TDS - MAXTERRA® MgO Non-Combustible Single Layer Structural Floor Panels 01-14-25 Version 1.2 Email (1) (1).pdf',
    url: '/PDFS/TDS - MAXTERRA® MgO Non-Combustible Single Layer Structural Floor Panels 01-14-25 Version 1.2 Email (1) (1).pdf',
    size: 1769344, // 1.77MB
    type: 'TDS',
    required: false,
  },
  {
    id: 'esr-5194',
    name: 'ESR-5194 Evaluation Report',
    description: 'MAXTERRA™ MgO Non-Combustible Single Layer Structural Floor Panels',
    filename: 'ESR-5194 - MAXTERRA™ MgO Non-Combustible Single Layer Structural Floor Panels - June 2024 (4) (1).pdf',
    url: '/PDFS/ESR-5194 - MAXTERRA™ MgO Non-Combustible Single Layer Structural Floor Panels - June 2024 (4) (1).pdf',
    size: 660331, // 660KB
    type: 'ESR',
    required: false,
  },
  {
    id: 'msds-safety',
    name: 'Material Safety Data Sheet',
    description: 'MAXTERRA™ MgO Non-Combustible Single Layer Structural Floor Panels',
    filename: 'MSDS - MAXTERRA™ MgO Non-Combustible Single Layer Structural Floor Panels - Version 1 Sept 2024.pdf',
    url: '/PDFS/MSDS - MAXTERRA™ MgO Non-Combustible Single Layer Structural Floor Panels - Version 1 Sept 2024.pdf',
    size: 300088, // 300KB
    type: 'MSDS',
    required: false,
  },
  {
    id: 'leed-credit-guide',
    name: 'LEED Credit Guide',
    description: 'LEED v4 Credit Information for MAXTERRA®',
    filename: 'LEED Credit Guide 7-16-25 (1).pdf',
    url: '/PDFS/LEED Credit Guide 7-16-25 (1).pdf',
    size: 522459, // 522KB
    type: 'LEED',
    required: false,
  },
  {
    id: 'installation-guide',
    name: 'Installation Guide',
    description: 'MAXTERRA™ MgO Non-Combustible Single-Layer Subfloor Installation Instructions',
    filename: 'Installation Guide - MAXTERRA™ MgO Non-Combustible Single-Layer Subfloor - V 1.02.pdf',
    url: '/PDFS/Installation Guide - MAXTERRA™ MgO Non-Combustible Single-Layer Subfloor - V 1.02.pdf',
    size: 2699385, // 2.7MB
    type: 'Installation',
    required: false,
  },
  {
    id: 'limited-warranty',
    name: 'Limited Warranty',
    description: 'Product Warranty Information',
    filename: 'Limited Warranty - 8-31-2023.pdf',
    url: '/PDFS/Limited Warranty - 8-31-2023.pdf',
    size: 123375, // 123KB
    type: 'Warranty',
    required: false,
  },
  {
    id: 'acoustic-certification',
    name: 'Acoustic Certification',
    description: 'ESL-1645 Certified Floor/Ceiling Acoustical Performance',
    filename: 'ESL-1645 Certified FloorCeiling Acoustical Performance - June 2025 (2).pdf',
    url: '/PDFS/ESL-1645 Certified FloorCeiling Acoustical Performance - June 2025 (2).pdf',
    size: 535035, // 535KB
    type: 'Acoustic',
    required: false,
  },
]

// Document type configurations
export const documentTypeConfig = {
  TDS: {
    color: 'blue',
    icon: '📋',
    priority: 1,
  },
  ESR: {
    color: 'green',
    icon: '✅',
    priority: 2,
  },
  MSDS: {
    color: 'red',
    icon: '⚠️',
    priority: 8,
  },
  LEED: {
    color: 'emerald',
    icon: '🌿',
    priority: 6,
  },
  Installation: {
    color: 'orange',
    icon: '🔧',
    priority: 3,
  },
  Warranty: {
    color: 'purple',
    icon: '🛡️',
    priority: 4,
  },
  Acoustic: {
    color: 'indigo',
    icon: '🔊',
    priority: 7,
  },
  PartSpec: {
    color: 'gray',
    icon: '📐',
    priority: 5,
  },
}
