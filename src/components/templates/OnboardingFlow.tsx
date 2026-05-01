import { useState, useRef, useEffect } from 'react'
import { ChevronLeftIcon, SearchIcon, XIcon, CheckIcon, LayoutGridIcon } from 'lucide-react'
import type { ModelConfig, OutcomeType, DataElement } from '../../types'
import { dataElements } from '../../data'

interface OutcomeOption {
  id: OutcomeType
  title: string
  description: string
}

const outcomes: OutcomeOption[] = [
  { id: 'decline', title: 'Decline', description: 'Decline the applicant and assign turndown reasons' },
  { id: 'credit-limit', title: 'Assign Credit Limit', description: 'Assign the credit limit that a customer should receive' },
  { id: 'require-action', title: 'Require Action', description: 'Require additional actions to be taken before a decision' },
  { id: 'award-rewards', title: 'Award Rewards', description: 'Award rewards points or cash back to a customer' },
  { id: 'accumulate-rewards', title: 'Accumulate Rewards', description: 'Accumulate rewards points or cash back to be awarded later' },
  { id: 'minimum-credit-limit', title: 'Assign Minimum Credit Limit', description: 'Assign the lowest of the policy assigned credit limits and caps' },
]

const CATEGORIES = ['Financial', 'Employment', 'Account', 'Identity'] as const

interface OnboardingFlowProps {
  onComplete: (config: ModelConfig) => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<OutcomeType | ''>('')
  const [modelName, setModelName] = useState('')
  const [modelDescription, setModelDescription] = useState('')
  const [nameTouched, setNameTouched] = useState(false)
  const [descTouched, setDescTouched] = useState(false)
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [previewElement, setPreviewElement] = useState<DataElement | null>(null)

  const step1Ref = useRef<HTMLDivElement>(null)
  const step2Ref = useRef<HTMLDivElement>(null)
  const step3Ref = useRef<HTMLDivElement>(null)

  // Auto-scroll to step 2 when outcome is selected
  useEffect(() => {
    if (selectedOutcome && step2Ref.current) {
      setTimeout(() => {
        step2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 120)
    }
  }, [selectedOutcome])

  const completedSteps = [
    !!selectedOutcome,
    !!(modelName.trim() && modelDescription.trim()),
    selectedElements.length > 0,
  ].filter(Boolean).length

  const step1Complete = !!selectedOutcome
  const step2Complete = !!(modelName.trim() && modelDescription.trim())
  const step3Complete = selectedElements.length > 0

  const progress = (completedSteps / 3) * 100

  const filteredElements = dataElements.filter(
    (el) =>
      el.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      el.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      el.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function toggleElement(id: string) {
    setSelectedElements((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    )
  }

  function toggleCategory(ids: string[], allSelected: boolean) {
    setSelectedElements((prev) =>
      allSelected
        ? prev.filter((e) => !ids.includes(e))
        : [...prev, ...ids.filter((id) => !prev.includes(id))]
    )
  }

  function handleNext() {
    if (!selectedOutcome) {
      step1Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    if (!modelName.trim() || !modelDescription.trim()) {
      setNameTouched(true)
      setDescTouched(true)
      step2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    if (selectedElements.length === 0) {
      step3Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    onComplete({
      outcomeType: selectedOutcome,
      modelName: modelName.trim(),
      modelDescription: modelDescription.trim(),
      selectedDataElements: selectedElements,
    })
  }

  const selectedOutcomeOption = outcomes.find((o) => o.id === selectedOutcome)

  return (
    <div className="ob-page">
      {/* Top nav */}
      <header className="ob-header">
        <button className="ob-nav-back">
          <ChevronLeftIcon size={16} />
          Return to dashboard
        </button>
        <span className="ob-header-title">Create a new decision model</span>
        <button className="ob-nav-cancel">Cancel and exit</button>
      </header>

      {/* Progress bar */}
      <div className="ob-progress-track">
        <div className="ob-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Scrollable body */}
      <main className="ob-body">

        {/* Step 1 */}
        <section ref={step1Ref} className="ob-section">
          <div className="ob-step-label-row">
            <span className="ob-step-label">Step 1 of 3</span>
            {step1Complete && <span className="ob-step-check"><CheckIcon size={10} /></span>}
          </div>
          <h2 className="ob-step-title">Assign an outcome for ruleset</h2>
          <p className="ob-step-description">
            Decision models are built using rulesets. Each ruleset can only contain rules that share the same outcome. If you have multiple outcomes, you can add additional rulesets from the next screen.
          </p>
          <div className="ob-outcome-list">
            {outcomes.map((outcome) => (
              <label key={outcome.id} className={`ob-outcome-item${selectedOutcome === outcome.id ? ' ob-outcome-item--selected' : ''}`}>
                <input
                  type="radio"
                  name="outcome"
                  value={outcome.id}
                  checked={selectedOutcome === outcome.id}
                  onChange={() => setSelectedOutcome(outcome.id)}
                  className="ob-radio"
                />
                <span className="ob-outcome-text">
                  <span className="ob-outcome-label">{outcome.title}</span>
                  <span className="ob-outcome-desc">{outcome.description}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Step 2 */}
        <section ref={step2Ref} className={`ob-section${!selectedOutcome ? ' ob-section--dimmed' : ''}`}>
          <div className="ob-step-label-row">
            <span className="ob-step-label">Step 2 of 3</span>
            {step2Complete && <span className="ob-step-check"><CheckIcon size={10} /></span>}
          </div>
          <h2 className="ob-step-title">Add a model name and description</h2>
          {selectedOutcomeOption && (
            <p className="ob-step-context">
              Outcome type: <strong>{selectedOutcomeOption.title}</strong>
            </p>
          )}
          <div className="ob-field">
            <label className="ob-label">
              Decision model name <span className="ob-required">*</span>
            </label>
            <input
              type="text"
              className={`ob-input${nameTouched && !modelName.trim() ? ' ob-input--error' : ''}`}
              placeholder="Enter model name"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              onBlur={() => setNameTouched(true)}
              disabled={!selectedOutcome}
            />
            {nameTouched && !modelName.trim() && (
              <p className="ob-field-error">Model name is required</p>
            )}
          </div>
          <div className="ob-field">
            <label className="ob-label">
              Decision model description <span className="ob-required">*</span>
            </label>
            <textarea
              className={`ob-textarea${descTouched && !modelDescription.trim() ? ' ob-input--error' : ''}`}
              placeholder="Enter model description"
              value={modelDescription}
              onChange={(e) => setModelDescription(e.target.value)}
              onBlur={() => setDescTouched(true)}
              disabled={!selectedOutcome}
              rows={3}
            />
            {descTouched && !modelDescription.trim() && (
              <p className="ob-field-error">Model description is required</p>
            )}
          </div>
        </section>

        {/* Step 3 */}
        <section ref={step3Ref} className={`ob-section${!selectedOutcome ? ' ob-section--dimmed' : ''}`}>
          <div className="ob-step-label-row">
            <span className="ob-step-label">Step 3 of 3</span>
            {step3Complete && <span className="ob-step-check"><CheckIcon size={10} /></span>}
          </div>
          <h2 className="ob-step-title">Create your first rule</h2>
          <p className="ob-step-description">
            Pick one or more data elements to author your first rule. Click on a data element to preview details about the data before selecting it.
          </p>

          <div className="ob-selector">
            {/* Left: searchable list */}
            <div className="ob-selector-list">
              <div className="ob-search-wrap">
                <SearchIcon size={14} className="ob-search-icon" />
                <input
                  type="text"
                  className="ob-search-input"
                  placeholder="Filter data elements…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="ob-search-clear" onClick={() => setSearchQuery('')}>
                    <XIcon size={12} />
                  </button>
                )}
              </div>

              {CATEGORIES.map((cat) => {
                const items = filteredElements.filter((el) => el.category === cat)
                if (items.length === 0) return null
                return (
                  <div key={cat} className="ob-category">
                    {(() => {
                      const ids = items.map((el) => el.id)
                      const allSelected = ids.every((id) => selectedElements.includes(id))
                      const someSelected = ids.some((id) => selectedElements.includes(id))
                      return (
                        <label className="ob-category-label">
                          <input
                            type="checkbox"
                            className="ob-category-checkbox"
                            checked={allSelected}
                            ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected }}
                            onChange={() => toggleCategory(ids, allSelected)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          {cat}
                        </label>
                      )
                    })()}
                    {items.map((el) => (
                      <div
                        key={el.id}
                        className={`ob-element-row${previewElement?.id === el.id ? ' ob-element-row--focused' : ''}${selectedElements.includes(el.id) ? ' ob-element-row--selected' : ''}`}
                        onClick={() => setPreviewElement(el)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedElements.includes(el.id)}
                          onChange={() => toggleElement(el.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="ob-checkbox"
                        />
                        <span className="ob-element-label">{el.label}</span>
                        <span className={`ob-type-badge ob-type-badge--${el.dataType}`}>{el.dataType}</span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>

            {/* Right: preview panel */}
            <div className="ob-selector-preview">
              {previewElement ? (
                <div className="ob-preview-content">
                  <div className="ob-preview-header">
                    <span className="ob-preview-label">{previewElement.label}</span>
                    <span className={`ob-type-badge ob-type-badge--${previewElement.dataType}`}>{previewElement.dataType}</span>
                  </div>
                  <p className="ob-preview-description">{previewElement.description}</p>
                  <div className="ob-preview-meta">
                    <div className="ob-preview-meta-row">
                      <span className="ob-preview-meta-key">Category</span>
                      <span className="ob-preview-meta-val">{previewElement.category}</span>
                    </div>
                    <div className="ob-preview-meta-row">
                      <span className="ob-preview-meta-key">Attribute path</span>
                      <code className="ob-preview-path">{previewElement.attributePath}</code>
                    </div>
                    <div className="ob-preview-meta-row">
                      <span className="ob-preview-meta-key">Exception values</span>
                      <span className="ob-preview-meta-val">—</span>
                    </div>
                  </div>
                  <button
                    className={`ob-select-btn${selectedElements.includes(previewElement.id) ? ' ob-select-btn--selected' : ''}`}
                    onClick={() => toggleElement(previewElement.id)}
                  >
                    {selectedElements.includes(previewElement.id) ? 'Remove from ruleset' : 'Add to ruleset'}
                  </button>
                </div>
              ) : (
                <div className="ob-preview-empty">
                  <LayoutGridIcon size={24} className="ob-preview-empty-icon" />
                  <p>Select a data element<br />to preview details</p>
                </div>
              )}
            </div>
          </div>

          {selectedElements.length > 0 && (
            <div className="ob-selection-count">
              <span>{selectedElements.length} element{selectedElements.length !== 1 ? 's' : ''} selected</span>
              <button className="ob-unselect-all-btn" onClick={() => setSelectedElements([])}>
                Unselect all
              </button>
            </div>
          )}
        </section>

        {/* Spacer for sticky footer */}
        <div style={{ height: '88px' }} />
      </main>

      {/* Sticky footer */}
      <footer className="ob-footer">
        <div className="ob-footer-inner">
          <button className="ob-next-btn" onClick={handleNext}>
            {completedSteps === 3 ? 'Save and create model' : 'Next'}
          </button>
        </div>
      </footer>
    </div>
  )
}
