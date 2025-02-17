import { describe, expect, it } from 'vitest'
import { validateNoRecursiveMappings, validateNoDuplicateDeadnames, validateNoSelfMappings } from '../validations'
import type { Names } from '../types'

describe('validateNoDuplicateDeadnames', () => {
  it('should return true for no names provided', () => {
    const nameMappings: Names = {
      first: [],
      middle: [],
      last: [],
    }
    const result = validateNoDuplicateDeadnames(nameMappings)
    expect(result).toBe(true)
  })

  it('should return true for no duplicate deadnames', () => {
    const nameMappings: Names = {
      first: [{ mappings: ['John', 'Doe'] }],
      middle: [],
      last: [],
    }
    const result = validateNoDuplicateDeadnames(nameMappings)
    expect(result).toBe(true)
  })

  it('should return true for duplicate proper names in same category', () => {
    const nameMappings: Names = {
      first: [{ mappings: ['John', 'Doe'] }, { mappings: ['Smith', 'Doe'] }],
      middle: [],
      last: [],
    }
    const result = validateNoDuplicateDeadnames(nameMappings)
    expect(result).toBe(true)
  })

  it('should return true for duplicate proper names in different categories', () => {
    const nameMappings: Names = {
      first: [{ mappings: ['John', 'Doe'] }],
      middle: [{ mappings: ['Smith', 'Doe'] }],
      last: [],
    }
    const result = validateNoDuplicateDeadnames(nameMappings)
    expect(result).toBe(true)
  })

  it('should return true for no duplicate deadnames (complex case)', () => {
    const nameMappings: Names = {
      first: [{ mappings: ['John', 'Emma'] }, { mappings: ['Josh', 'Rachel'] }],
      middle: [{ mappings: ['Jessica', 'Rachel'] }, { mappings: ['Olivia', 'Emma'] }],
      last: [{ mappings: ['Smith', 'Rachel'] }, { mappings: ['Miller', 'Emma'] }],
    }
    const result = validateNoDuplicateDeadnames(nameMappings)
    expect(result).toBe(true)
  })

  it('should return false for duplicate deadnames in same category', () => {
    const nameMappings: Names = {
      first: [{ mappings: ['John', 'Doe'] }, { mappings: ['John', 'Smith'] }],
      middle: [],
      last: [],
    }
    const result = validateNoDuplicateDeadnames(nameMappings)
    expect(result).toBe(false)
  })

  it('should return false for duplicate deadnames in different categories', () => {
    const nameMappings: Names = {
      first: [{ mappings: ['John', 'Doe'] }],
      middle: [{ mappings: ['John', 'Smith'] }],
      last: [],
    }
    const result = validateNoDuplicateDeadnames(nameMappings)
    expect(result).toBe(false)
  })

  it('should return false for multiple duplicate deadnames', () => {
    const nameMappings: Names = {
      first: [{ mappings: ['John', 'Doe'] }, { mappings: ['John', 'Smith'] }],
      middle: [],
      last: [{ mappings: ['Smith', 'Doe'] }, { mappings: ['Smith', 'Smith'] }],
    }
    const result = validateNoDuplicateDeadnames(nameMappings)
    expect(result).toBe(false)
  })
})

describe('validateNoSelfMappings', () => {
  it('should return true for no names provided', () => {
    const nameMappings: Names = {
      first: [],
      middle: [],
      last: [],
    }
    const result = validateNoSelfMappings(nameMappings)
    expect(result).toBe(true)
  })

  it('should return true for no self mappings', () => {
    const nameMappings: Names = {
      first: [{ mappings: ['John', 'Doe'] }],
      middle: [],
      last: [],
    }
    const result = validateNoSelfMappings(nameMappings)
    expect(result).toBe(true)
  })

  it('should return false for self mappings in the same category', () => {
    const nameMappings: Names = {
      first: [{ mappings: ['John', 'John'] }],
      middle: [],
      last: [],
    }
    const result = validateNoSelfMappings(nameMappings)
    expect(result).toBe(false)
  })

  it('should return false for multiple self mappings', () => {
    const nameMappings: Names = {
      first: [{ mappings: ['John', 'Doe'] }, { mappings: ['Doe', 'Doe'] }],
      middle: [],
      last: [{ mappings: ['Smith', 'Smith'] }],
    }
    const result = validateNoSelfMappings(nameMappings)
    expect(result).toBe(false)
  })
})

describe('validateNoRecursiveMappings', () => {
  it('should return true for no names provided', () => {
    const nameMappings: Names = {
      first: [],
      middle: [],
      last: [],
    }
    const result = validateNoRecursiveMappings(nameMappings)
    expect(result).toBe(true)
  })

  it('should return true for no recursive mappings', () => {
    const nameMappings: Names = {
      first: [{ mappings: ['John', 'Doe'] }],
      middle: [],
      last: [{ mappings: ['Smith', 'Doe'] }],
    }
    const result = validateNoRecursiveMappings(nameMappings)
    expect(result).toBe(true)
  })

  it('should return false for same-category recursive mappings', () => {
    const nameMappings: Names = {
      first: [{ mappings: ['John', 'Doe'] }, { mappings: ['Doe', 'Smith'] }],
      middle: [],
      last: [],
    }
    const result = validateNoRecursiveMappings(nameMappings)
    expect(result).toBe(false)
  })

  it('should return false for cross-category recursive mappings', () => {
    const nameMappings: Names = {
      first: [{ mappings: ['John', 'Doe'] }],
      middle: [{ mappings: ['Doe', 'Smith'] }],
      last: [],
    }
    const result = validateNoRecursiveMappings(nameMappings)
    expect(result).toBe(false)
  })

  it('should return false for multiple cross-category mappings', () => {
    const nameMappings: Names = {
      first: [{ mappings: ['John', 'Doe'] }],
      middle: [{ mappings: ['Doe', 'Smith'] }],
      last: [{ mappings: ['Smith', 'John'] }],
    }
    const result = validateNoRecursiveMappings(nameMappings)
    expect(result).toBe(false)
  })
})
