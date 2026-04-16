export interface FormData {
  tabAnswer: string   // Step 1 reflection question
  name: string        // Step 2
  email: string       // Step 3
  phone: string       // Step 4 (optional)
  postcode: string    // Step 4 (required)
  srUsage: string     // Step 5 radio
  devices: string[]   // Step 5 checkboxes
}

export type StepIndex = 0 | 1 | 2 | 3 | 4 | 5

export const TOTAL_STEPS = 6

export const STEP_TITLES: Record<StepIndex, string> = {
  0: 'Tab and Arrow Key Navigation',
  1: 'Navigating by Heading',
  2: 'Form Labels',
  3: 'Required Fields and Validation',
  4: 'Grouped Controls',
  5: 'Review and Submit',
}

export const INITIAL_FORM_DATA: FormData = {
  tabAnswer: '',
  name: '',
  email: '',
  phone: '',
  postcode: '',
  srUsage: '',
  devices: [],
}
