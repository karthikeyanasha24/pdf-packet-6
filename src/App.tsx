import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// Components
import Layout from '@/components/Layout'
import StepWizard from '@/components/StepWizard'
import ProjectForm from '@/components/steps/ProjectForm'
import DocumentSelection from '@/components/steps/DocumentSelection'
import DocumentOrdering from '@/components/steps/DocumentOrdering'
import PacketGeneration from '@/components/steps/PacketGeneration'
import ThemeProvider from '@/components/ThemeProvider'

// Types
import type { AppState, ProjectFormData, SelectedDocument } from '@/types'

// Utils
import { storage } from '@/utils'

const STORAGE_KEY = 'pdf-packet-builder-state'

function App() {
  const [appState, setAppState] = useState<AppState>(() => {
    const savedState = storage.get<AppState>(STORAGE_KEY)
    return {
      currentStep: savedState?.currentStep || 1,
      formData: savedState?.formData || {},
      selectedDocuments: savedState?.selectedDocuments || [],
      isGenerating: false,
      darkMode: savedState?.darkMode || false,
    }
  })

  // Save state to localStorage whenever it changes
  useEffect(() => {
    storage.set(STORAGE_KEY, appState)
  }, [appState])

  // Update form data with useCallback to prevent infinite loops
  const updateFormData = useCallback((data: Partial<ProjectFormData>) => {
    setAppState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data }
    }))
  }, [])

  // Update selected documents with useCallback
  const updateSelectedDocuments = useCallback((documents: SelectedDocument[]) => {
    setAppState(prev => ({
      ...prev,
      selectedDocuments: documents
    }))
  }, [])

  // Navigate to step
  const goToStep = (step: number) => {
    setAppState(prev => ({
      ...prev,
      currentStep: step
    }))
  }

  // Next step
  const nextStep = () => {
    setAppState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 4)
    }))
  }

  // Previous step
  const prevStep = () => {
    setAppState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1)
    }))
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    setAppState(prev => ({
      ...prev,
      darkMode: !prev.darkMode
    }))
  }

  // Set generating state
  const setIsGenerating = (isGenerating: boolean) => {
    setAppState(prev => ({
      ...prev,
      isGenerating
    }))
  }

  // Reset application state
  const resetApp = () => {
    setAppState({
      currentStep: 1,
      formData: {},
      selectedDocuments: [],
      isGenerating: false,
      darkMode: appState.darkMode, // Preserve dark mode preference
    })
    storage.remove(STORAGE_KEY)
  }

  const stepComponents = {
    1: ProjectForm,
    2: DocumentSelection,
    3: DocumentOrdering,
    4: PacketGeneration,
  }

  return (
    <ThemeProvider darkMode={appState.darkMode}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <Routes>
          <Route
            path="/"
            element={
              <Layout
                currentStep={appState.currentStep}
                darkMode={appState.darkMode}
                onToggleDarkMode={toggleDarkMode}
                onReset={resetApp}
              >
                <div className="container mx-auto px-4 py-8 max-w-6xl">
                  {/* Header */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                  >
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent mb-4">
                      PDF Packet Builder
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                      Create professional documentation packets with MAXTERRA® technical specifications, 
                      warranties, and installation guides in just a few simple steps.
                    </p>
                  </motion.div>

                  {/* Step Wizard */}
                  <StepWizard
                    currentStep={appState.currentStep}
                    onStepClick={goToStep}
                    formData={appState.formData}
                    selectedDocuments={appState.selectedDocuments}
                  />

                  {/* Main Content */}
                  <motion.div
                    key={appState.currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="mt-12"
                  >
                    <AnimatePresence mode="wait">
                      {(() => {
                        const StepComponent = stepComponents[appState.currentStep as keyof typeof stepComponents]
                        
                        if (!StepComponent) {
                          return <Navigate to="/" replace />
                        }

                        return (
                          <StepComponent
                            formData={appState.formData}
                            selectedDocuments={appState.selectedDocuments}
                            onUpdateFormData={updateFormData}
                            onUpdateSelectedDocuments={updateSelectedDocuments}
                            onNext={nextStep}
                            onPrevious={prevStep}
                            isGenerating={appState.isGenerating}
                            onSetGenerating={setIsGenerating}
                          />
                        )
                      })()}
                    </AnimatePresence>
                  </motion.div>

                  {/* Progress Indicator */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                    className="fixed bottom-6 right-6 z-50"
                  >
                    <div className="glass-card dark:glass-card-dark p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Step {appState.currentStep} of 4
                    </div>
                  </motion.div>
                </div>
              </Layout>
            }
          />
          
          {/* Redirect any other routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ThemeProvider>
  )
}

export default App
