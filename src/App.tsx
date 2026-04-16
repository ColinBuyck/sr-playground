import { useState, useRef, useEffect } from 'react'
import './App.css'
import { type FormData, type StepIndex, STEP_TITLES, TOTAL_STEPS, INITIAL_FORM_DATA } from './types/form'

function App() {
  const [currentStep, setCurrentStep] = useState<StepIndex>(0)
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const [submitted, setSubmitted] = useState(false)
  const [liveMessage, setLiveMessage] = useState('')

  const headingRef = useRef<HTMLHeadingElement>(null)
  const completionRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const id = requestAnimationFrame(() => headingRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [currentStep])

  useEffect(() => {
    if (submitted) {
      const id = requestAnimationFrame(() => completionRef.current?.focus())
      return () => cancelAnimationFrame(id)
    }
  }, [submitted])

  const handleChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const goNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      const next = (currentStep + 1) as StepIndex
      setCurrentStep(next)
      setLiveMessage(`Step ${next + 1} of ${TOTAL_STEPS}: ${STEP_TITLES[next]}`)
    }
  }

  const goBack = () => {
    if (currentStep > 0) {
      const prev = (currentStep - 1) as StepIndex
      setCurrentStep(prev)
      setLiveMessage(`Step ${prev + 1} of ${TOTAL_STEPS}: ${STEP_TITLES[prev]}`)
    }
  }

  const goToStep = (step: StepIndex) => {
    setCurrentStep(step)
    setLiveMessage(`Step ${step + 1} of ${TOTAL_STEPS}: ${STEP_TITLES[step]}`)
  }

  const handleSubmit = () => {
    setSubmitted(true)
    setLiveMessage('Form submitted. You have completed the playground.')
  }

  const renderStep = () => {
    const stepPlaceholders: Record<StepIndex, string> = {
      0: STEP_TITLES[0],
      1: STEP_TITLES[1],
      2: STEP_TITLES[2],
      3: STEP_TITLES[3],
      4: STEP_TITLES[4],
      5: STEP_TITLES[5],
    }
    return (
      <section aria-labelledby="step-heading" className="step-content">
        <h1
          id="step-heading"
          ref={headingRef}
          tabIndex={-1}
          className="step-title"
        >
          Step {currentStep + 1}: {stepPlaceholders[currentStep]}
        </h1>
        <p style={{ color: 'var(--text)', marginTop: 'var(--space-lg)' }}>
          Step content coming soon.
        </p>
        <div className="step-actions">
          {currentStep > 0 && (
            <button type="button" className="btn btn-secondary" onClick={goBack}>
              Back
            </button>
          )}
          {currentStep < TOTAL_STEPS - 1 ? (
            <button type="button" className="btn btn-primary" onClick={goNext}>
              Next
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={handleSubmit}>
              Submit
            </button>
          )}
        </div>
      </section>
    )
  }

  // handleChange and goToStep will be wired up in later phases
  void handleChange
  void goToStep
  void formData

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveMessage}
      </div>

      <header className="site-header">
        <p className="site-name">Screen Reader Playground</p>
      </header>

      <main>
        {submitted ? (
          <div className="step-content">
            <h1
              ref={completionRef}
              tabIndex={-1}
              className="step-title"
            >
              You've completed the playground!
            </h1>
            <p style={{ marginTop: 'var(--space-lg)', color: 'var(--text)' }}>
              Thank you for exploring the five most important screen reader patterns used on the web.
            </p>
          </div>
        ) : (
          renderStep()
        )}
      </main>

      <footer className="site-footer">
        <p>Screen Reader Playground — an educational tool for first-time screen reader users.</p>
      </footer>
    </>
  )
}

export default App
