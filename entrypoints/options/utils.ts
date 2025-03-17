import * as v from 'valibot'
import {
  validateNoDuplicateDeadnames,
  validateNoRecursiveMappings,
  validateNoSelfMappings,
} from '@/utils/validations'
import { Names, trimmedEmail } from '@/utils/types'
import {
  deadnameErrorMessages,
  emailErrorMessages,
} from './constants'

type SetFieldErrorInput = {
  target: HTMLInputElement
  type: 'deadname' | 'properName'
  nameCategory: keyof Omit<Names, 'email'>
  index: number
  errorType: keyof typeof deadnameErrorMessages
} | {
  target: HTMLInputElement
  type: 'deadname' | 'properName'
  nameCategory: keyof Pick<Names, 'email'>
  index: number
  errorType: keyof typeof emailErrorMessages
}

export function validateNameField({
  target,
  type,
  nameCategory,
  index,
  names,
}: {
  target: HTMLInputElement
  type: 'deadname' | 'properName'
  nameCategory: keyof Names
  index: number
  names: Names
}) {
  if (target.value.trim().length === 0) {
    setNameFieldError({
      target,
      type,
      nameCategory,
      index,
      errorType: type === 'deadname' ? 'emptyDeadname' : 'emptyProperName',
    })
    return
  }

  if (type === 'deadname') {
    const noDuplicates = validateNoDuplicateDeadnames(names)
    if (!noDuplicates) {
      setNameFieldError({
        target,
        type,
        nameCategory,
        index,
        errorType: 'duplicate',
      })
      return
    }
  }

  const noSelfMappings = validateNoSelfMappings(names)
  if (!noSelfMappings) {
    setNameFieldError({
      target,
      type,
      nameCategory,
      index,
      errorType: 'self',
    })
    return
  }

  const noRecursiveMappings = validateNoRecursiveMappings(names)
  if (!noRecursiveMappings) {
    setNameFieldError({
      target,
      type,
      nameCategory,
      index,
      errorType: 'recursive',
    })
    return
  }

  if (nameCategory === 'email') {
    const isValidEmail = v.safeParse(trimmedEmail, target.value)
    if (!isValidEmail.success) {
      setNameFieldError({
        target,
        type,
        nameCategory,
        index,
        errorType: 'invalidEmail',
      })
      return
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const errorField: HTMLParagraphElement = document.querySelector(`#nameField-error-${nameCategory}-${String(index)}`)!
  if (errorField.dataset.errorType === 'self' || errorField.dataset.nameType === type) {
    target.ariaInvalid = 'false'
    errorField.dataset.nameType = ''
    errorField.dataset.errorType = ''
    errorField.textContent = ''
    target.removeAttribute('aria-describedby')
  }
}

function setNameFieldError({
  target,
  type,
  nameCategory,
  index,
  errorType,
}: SetFieldErrorInput) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const errorField: HTMLParagraphElement = document.querySelector(`#nameField-error-${nameCategory}-${String(index)}`)!
  target.ariaInvalid = 'true'
  errorField.dataset.nameType = type
  errorField.dataset.errorType = errorType
  const content = nameCategory === 'email' ? emailErrorMessages[errorType] : deadnameErrorMessages[errorType]
  errorField.textContent = content
  target.setAttribute('aria-describedby', `nameField-error-${nameCategory}-${String(index)}`)
}
