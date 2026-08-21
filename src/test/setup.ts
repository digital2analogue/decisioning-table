import '@testing-library/jest-dom'
import { toHaveNoViolations } from 'jest-axe'
import { expect } from 'vitest'

expect.extend(toHaveNoViolations)

// jsdom doesn't implement scrollIntoView
Element.prototype.scrollIntoView = () => {}
