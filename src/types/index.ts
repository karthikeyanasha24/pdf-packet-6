// Form data types
export interface ProjectFormData {
  submittedTo: string
  projectName: string
  projectNumber: string
  preparedBy: string
  email: string
  phone: string
  date: string
  status: 'Review' | 'Approval' | 'Record' | 'Info Only'
  product: string
}

// Document types
export interface Document {
  id: string
  name: string
  description: string
  filename: string
  url: string
  size?: number
  type: DocumentType
  required?: boolean
}

export type DocumentType = 
  | 'TDS'
  | 'ESR'
  | 'MSDS'
  | 'LEED'
  | 'Installation'
  | 'Warranty'
  | 'Acoustic'
  | 'PartSpec'

// Selected document for packet generation
export interface SelectedDocument {
  id: string
  document: Document
  order: number
  selected: boolean
}

// Packet generation request
export interface PacketGenerationRequest {
  formData: ProjectFormData
  selectedDocuments: SelectedDocument[]
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PacketGenerationResponse {
  success: boolean
  downloadUrl?: string
  filename?: string
  error?: string
}

// UI State types
export interface AppState {
  currentStep: number
  formData: Partial<ProjectFormData>
  selectedDocuments: SelectedDocument[]
  isGenerating: boolean
  darkMode: boolean
}

// Theme types
export type Theme = 'light' | 'dark' | 'system'

// Validation error types
export interface ValidationError {
  field: string
  message: string
}

// Step configuration
export interface StepConfig {
  id: number
  title: string
  description: string
  component: React.ComponentType<any>
  isComplete: (state: AppState) => boolean
  canProceed: (state: AppState) => boolean
}

// Drag and drop types
export interface DragEndEvent {
  active: {
    id: string
  }
  over: {
    id: string
  } | null
}

// Product options
export const PRODUCT_OPTIONS = [
  '20mm MAXTERRA®',
  '25mm MAXTERRA®',
  '30mm MAXTERRA®',
  'Custom Thickness',
] as const

export type ProductOption = typeof PRODUCT_OPTIONS[number]

// Status options
export const STATUS_OPTIONS = [
  'Review',
  'Approval', 
  'Record',
  'Info Only',
] as const

export type StatusOption = typeof STATUS_OPTIONS[number]
