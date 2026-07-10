import { useState } from 'react'
import { OnboardingFlow } from './components/templates/OnboardingFlow'
import { DecisioningEngine } from './components/templates/DecisioningEngine'
import type { ModelConfig } from './types'
import { demoRulesets, validationRulesets } from './data'

const params = new URLSearchParams(window.location.search)
const demoParam = params.get('demo')
const isDemo = demoParam === '1'
const isValidationDemo = demoParam === 'validation'
const inDemo = isDemo || isValidationDemo

const DEMO_CONFIG: ModelConfig = {
  outcomeType: 'decline',
  modelName: 'Demo Decision Model',
  modelDescription: 'Pre-populated demo with sample rulesets.',
  selectedDataElements: ['annual-income', 'monthly-expenses', 'credit-score'],
}

const VALIDATION_CONFIG: ModelConfig = {
  outcomeType: 'decline',
  modelName: 'Validation Demo',
  modelDescription: 'Shows the validation system with incomplete rules.',
  selectedDataElements: ['annual-income', 'monthly-expenses', 'credit-score'],
}

export default function App() {
  const [view, setView] = useState<'onboarding' | 'table'>(inDemo ? 'table' : 'onboarding')
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(
    isValidationDemo ? VALIDATION_CONFIG : isDemo ? DEMO_CONFIG : null
  )

  function handleOnboardingComplete(config: ModelConfig) {
    setModelConfig(config)
    setView('table')
  }

  if (view === 'onboarding') {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  return (
    <DecisioningEngine
      modelConfig={modelConfig}
      initialRulesets={isValidationDemo ? validationRulesets : isDemo ? demoRulesets : undefined}
    />
  )
}
