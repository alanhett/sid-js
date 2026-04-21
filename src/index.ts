import { rng } from './rng'
import { BASE_50 } from './constants'

type RandoOptions = {
  alphabet?: string
  length?: number
  sortable?: boolean
  supportDate?: Date
}

type GenerateOptions = {
  date?: Date
}

export class Rando {
  // Properties
  readonly alphabet: string
  readonly length: number
  readonly randomLength: number
  readonly base: number
  readonly randomBits: number
  readonly randomLimit: number
  readonly sortable: boolean
  readonly supportDate: Date
  readonly sortableLength: number
  readonly sortableLimit: Date

  // Save the last monotonic ID
  private lastMonotonic: string | null = null

  // Constructor
  constructor({
    alphabet = BASE_50,
    length = 22,
    sortable = false,
    supportDate = new Date('4000-01-01'),
  }: RandoOptions = {}) {
    // Validation logic
    if (typeof alphabet !== 'string' || alphabet.length < 2) {
      throw new Error('alphabet must be at least two characters.')
    }

    const uniqueAlphabet = new Set(alphabet)
    if (uniqueAlphabet.size !== alphabet.length) {
      throw new Error('alphabet must have unique characters.')
    }

    if (typeof length !== 'number' || length <= 0) {
      throw new Error('length must be greater than zero.')
    }

    if (typeof sortable !== 'boolean') {
      throw new Error('sortable must be a boolean.')
    }

    if (!(supportDate instanceof Date)) {
      throw new Error('supportDate must be a Date object.')
    }

    if (supportDate.getTime() < Date.now()) {
      throw new Error('supportDate must be in the future.')
    }

    // Assign the options
    this.alphabet = this.sortAlphabet(alphabet)
    this.length = length
    this.base = this.alphabet.length
    this.sortable = sortable
    this.supportDate = supportDate

    // Length of the sortable segment needed to support the target date at maximum resolution
    this.sortableLength = this.sortable ? Math.floor(Math.log(this.supportDate.getTime()) / Math.log(this.base)) + 1 : 0

    if (this.sortableLength > this.length) {
      throw new Error('length insufficient for sortable segment.')
    }

    // Set the remaining properties
    this.sortableLimit = new Date(Math.pow(this.base, this.sortableLength))
    this.randomLength = this.length - this.sortableLength
    this.randomBits = Math.log2(Math.pow(this.base, this.randomLength))
    this.randomLimit = Math.round(Math.pow(2, this.randomBits))
  }

  // Methods
  generate({ date }: GenerateOptions = {}): string {
    let randomSegment = this.generateRandomSegment()
    if (!this.sortable) return randomSegment
    let sortableSegment = this.generateSortableSegment({ date })
    if (date) return sortableSegment + randomSegment

    // If no date is provided, ensure monotonic IDs
    const lastSortableSegment = this.lastMonotonic ? this.getSortableSegment(this.lastMonotonic) : ''
    const lastRandomSegment = this.lastMonotonic ? this.getRandomSegment(this.lastMonotonic) : ''

    // If the new sortable segment is greater than the last one, nothing needs to be incremented
    if (sortableSegment > lastSortableSegment) {
      this.lastMonotonic = sortableSegment + randomSegment
      return this.lastMonotonic
    }

    // Get the lexicographically maximum sortable segment between sortableSegment and lastSortableSegment
    // This ensures that IDs are always increasing even if it has been incremented into the future
    if (sortableSegment < lastSortableSegment) sortableSegment = lastSortableSegment

    // Increment the sortable segment plus up to four characters of the last random segment
    const monotonicSegment = this.increment(sortableSegment + lastRandomSegment.slice(0, 3))
    const remainingRandomSegment = randomSegment.slice(3)

    // Set the last monotonic ID
    this.lastMonotonic = monotonicSegment + remainingRandomSegment
    return this.lastMonotonic
  }

  generateRandomSegment(): string {
    return Array.from({ length: this.randomLength }, () => this.alphabet[rng(this.base)]).join('')
  }

  generateSortableSegment({ date = new Date() }: GenerateOptions = {}): string {
    if (!this.sortable) throw new Error('generateSortableSegment requires sortable.')

    let sortableSegment = ''
    let remaining = date.getTime()

    while (remaining > 0 || sortableSegment.length < this.sortableLength) {
      const i = remaining % this.base
      sortableSegment = this.alphabet[i] + sortableSegment
      remaining = Math.floor(remaining / this.base)
    }

    return sortableSegment
  }

  private increment(segment: string): string {
    if (segment.length === 0) throw new Error('Cannot increment empty segment.')
    let incremented = ''
    let cursor = segment.length - 1
    while (cursor >= 0) {
      const index = this.alphabet.indexOf(segment[cursor])
      if (index === -1) throw new Error('Invalid character in segment.')
      if (index + 1 === this.base) {
        incremented = this.alphabet[0] + incremented
        cursor--
      } else {
        incremented = this.alphabet[index + 1] + incremented
        return segment.slice(0, cursor) + incremented
      }
    }
    throw new Error('Cannot increment beyond maximum value.')
  }

  getRandomSegment(id: string): string {
    return id.slice(this.sortableLength)
  }

  getSortableSegment(id: string): string {
    if (!this.sortable) throw new Error('getSortableSegment requires including a timestamp.')
    return id.slice(0, this.sortableLength)
  }

  sortAlphabet(alphabet: string): string {
    return alphabet.split('').sort().join('')
  }

  getDate(id: string): Date | null {
    if (!this.sortable) return null
    if (id.length < this.sortableLength) return null

    let sortableSegment = this.getSortableSegment(id)

    let decoded = 0
    for (let i = 0; i < sortableSegment.length; i++) {
      const alphabetIndex = this.alphabet.indexOf(sortableSegment[i])
      if (alphabetIndex === -1) return null
      decoded = decoded * this.base + alphabetIndex
    }
    return new Date(decoded)
  }
}
