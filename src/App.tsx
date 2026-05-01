import { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { OnboardingFlow } from './components/templates/OnboardingFlow'
import { DecisioningEngine } from './components/templates/DecisioningEngine'
import type { ModelConfig } from './types'

const isDemo = new URLSearchParams(window.location.search).get('demo') === '1'

const DEMO_CONFIG: ModelConfig = {
  outcomeType: 'decline',
  modelName: 'Demo Decision Model',
  modelDescription: 'Pre-populated demo with sample rulesets.',
  selectedDataElements: ['annual-income', 'monthly-expenses', 'credit-score'],
}

export default function App() {
  const [view, setView] = useState<'onboarding' | 'table'>(isDemo ? 'table' : 'onboarding')
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(isDemo ? DEMO_CONFIG : null)

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
