import { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { OnboardingFlow } from './components/templates/OnboardingFlow'
import { DecisioningEngine } from './components/templates/DecisioningEngine'
import type { ModelConfig } from './types'

export default function App() {
  const [view, setView] = useState<'onboarding' | 'table'>('onboarding')
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null)

  function handleOnboardingComplete(config: ModelConfig) {
    setModelConfig(config)
    setView('table')
  }

  if (view === 'onboarding') {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <DecisioningEngine modelConfig={modelConfig} />
    </DndProvider>
  )
}
