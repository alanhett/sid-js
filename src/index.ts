import crypto from 'crypto'
import { BASE_58, TIMESTAMP_DEFAULTS } from './constants'

type RandoOptions = {
  alphabet?: string
  randomAlphabet?: string
  randomLength?: number
  requireAllClasses?: boolean
  includeTimestamp?: boolean
  obfuscateTimestamp?: boolean
  timestampPosition?: 'start' | 'end'
  timestampAlphabet?: string
  timestampLength?: number
  prefix?: string
  separator?: string
  suffix?: string
}

type GenerateOptions = {
  date?: Date
}

type GenerateTimestampOptions = {
  date?: Date
  randomSegment?: string
}

export class Rando {
  // Properties
  readonly alphabet: string
  readonly randomAlphabet: string
  readonly randomLength: number
  readonly randomBase: number
  readonly randomEntropy: number
  readonly randomClasses: {
    lowercase: boolean
    uppercase: boolean
    numbers: boolean
    special: boolean
  }
  readonly requireAllClasses: boolean
  readonly includeTimestamp?: boolean
  readonly obfuscateTimestamp: boolean
  readonly timestampPosition: 'start' | 'end'
  readonly timestampAlphabet: string
  readonly timestampLength: number
  readonly timestampBase: number
  readonly timestampMax: Date
  readonly prefix: string
  readonly separator: string
  readonly suffix: string

  // Constructor
  constructor({
    alphabet = BASE_58,
    randomLength = 21,
    randomAlphabet = undefined,
    requireAllClasses = false,
    includeTimestamp = false,
    obfuscateTimestamp = false,
    timestampPosition = 'start',
    timestampAlphabet = undefined,
    timestampLength = undefined,
    prefix = '',
    separator = '',
    suffix = '',
  }: RandoOptions = {}) {
    // Validation logic
    if (typeof alphabet !== 'string' || alphabet.length < 2) {
      throw new Error('alphabet must be at least two characters.')
    }
    if (randomAlphabet && (typeof randomAlphabet !== 'string' || randomAlphabet.length < 2)) {
      throw new Error('randomAlphabet must be a string or null.')
    }
    if (timestampAlphabet && (typeof timestampAlphabet !== 'string' || timestampAlphabet.length < 2)) {
      throw new Error('timestampAlphabet must be a string or null.')
    }
    const uniqueAlphabet = new Set(alphabet)
    if (uniqueAlphabet.size !== alphabet.length) {
      throw new Error('alphabet must have unique characters.')
    }
    if (randomAlphabet) {
      const uniqueRandomAlphabet = new Set(randomAlphabet)
      if (uniqueRandomAlphabet.size !== randomAlphabet.length) {
        throw new Error('randomAlphabet must have unique characters.')
      }
    }
    if (timestampAlphabet) {
      const uniqueTimestampAlphabet = new Set(timestampAlphabet)
      if (uniqueTimestampAlphabet.size !== timestampAlphabet.length) {
        throw new Error('timestampAlphabet must have unique characters.')
      }
    }
    if (typeof randomLength !== 'number' || randomLength <= 0) {
      throw new Error('randomLength must be greater than zero.')
    }

    if (timestampPosition && timestampPosition !== 'start' && timestampPosition !== 'end') {
      throw new Error('includeTimestamp must be "start" or "end".')
    }

    if (typeof obfuscateTimestamp !== 'boolean') {
      throw new Error('obfuscateTimestamp must be a boolean.')
    }

    if (typeof separator !== 'string') {
      throw new Error('separator must be a string.')
    }

    if (timestampLength && (typeof timestampLength !== 'number' || timestampLength <= 0)) {
      throw new Error('timestampLength must be greater than zero.')
    }

    // Assign properties
    this.alphabet = alphabet
    this.randomAlphabet = randomAlphabet ?? alphabet
    this.randomLength = randomLength
    this.randomBase = this.alphabet.length
    this.randomEntropy = Math.floor(Math.log2(Math.pow(this.randomBase, this.randomLength)))
    this.randomClasses = this.getClasses(this.randomAlphabet)
    this.requireAllClasses = requireAllClasses
    this.includeTimestamp = includeTimestamp
    this.obfuscateTimestamp = obfuscateTimestamp
    this.timestampPosition = timestampPosition
    this.timestampAlphabet = timestampAlphabet ?? alphabet
    this.timestampBase = this.timestampAlphabet.length
    this.prefix = prefix
    this.separator = separator
    this.suffix = suffix

    // Ensure timestamp.length is at least the default length for the given base
    const timestampDefaultLength = TIMESTAMP_DEFAULTS[this.timestampBase].length
    if (timestampLength && timestampLength < timestampDefaultLength) {
      throw new Error('timestamp.length must be at least the default length for the given base.')
    }

    this.timestampLength = timestampLength ?? timestampDefaultLength
    this.timestampMax = new Date(Math.pow(this.timestampBase, this.timestampLength))
  }

  // Methods
  generate({ date = new Date() }: GenerateOptions = {}): string {
    const randomSegment = this.generateRandomSegment()
    if (!this.includeTimestamp) return this.prefix + randomSegment + this.suffix
    const timestampSegment = this.generateTimestampSegment({ date, randomSegment })
    if (this.timestampPosition === 'start') {
      return this.prefix + timestampSegment + this.separator + randomSegment + this.suffix
    } else {
      return this.prefix + randomSegment + this.separator + timestampSegment + this.suffix
    }
  }

  getClasses(s: string = this.randomAlphabet) {
    const classes = {
      lowercase: false,
      uppercase: false,
      numbers: false,
      special: false,
    }
    for (const char of s) {
      if (char >= 'a' && char <= 'z') classes.lowercase = true
      else if (char >= 'A' && char <= 'Z') classes.uppercase = true
      else if (char >= '0' && char <= '9') classes.numbers = true
      else classes.special = true
    }
    return classes
  }

  hasAllClasses(s: string) {
    const generatedClasses = this.getClasses(s)
    return (
      (!this.randomClasses.lowercase || generatedClasses.lowercase) &&
      (!this.randomClasses.uppercase || generatedClasses.uppercase) &&
      (!this.randomClasses.numbers || generatedClasses.numbers) &&
      (!this.randomClasses.special || generatedClasses.special)
    )
  }

  generateRandomSegment(): string {
    const arr = Array.from({ length: this.randomLength }, () => this.randomAlphabet[crypto.randomInt(this.randomBase)])
    let s = arr.join('')
    if (this.requireAllClasses && !this.hasAllClasses(s)) return this.generateRandomSegment()
    return s
  }

  obfuscateTimestampSegment({
    randomSegment,
    timestampSegment,
  }: {
    randomSegment: string
    timestampSegment: string
  }): string {
    if (!this.includeTimestamp) throw new Error('obfuscateTimestampSegment requires including a timestamp.')

    const offset = this.generateOffset(randomSegment)

    let obfuscated = ''
    for (const char of timestampSegment) {
      let index = this.timestampAlphabet.indexOf(char) + offset
      index = index % this.timestampBase
      obfuscated = obfuscated + this.timestampAlphabet[index]
    }
    return obfuscated
  }

  deobfuscateTimestampSegment({
    randomSegment,
    timestampSegment,
  }: {
    randomSegment: string
    timestampSegment: string
  }): string {
    if (!this.includeTimestamp) throw new Error('deobfuscateTimestampSegment requires including a timestamp.')

    const deoffset = this.timestampBase - this.generateOffset(randomSegment)

    let deobfuscated = ''
    for (const char of timestampSegment) {
      let index = this.timestampAlphabet.indexOf(char) + deoffset
      index = index % this.timestampBase
      deobfuscated = deobfuscated + this.timestampAlphabet[index]
    }
    return deobfuscated
  }

  generateTimestampSegment({ date = new Date(), randomSegment = '' }: GenerateTimestampOptions = {}): string {
    if (!this.includeTimestamp) throw new Error('generateTimestampSegment requires including a timestamp.')

    let timestampSegment = ''
    let remaining = date.getTime()

    while (remaining > 0 || timestampSegment.length < this.timestampLength) {
      const index = remaining % this.timestampBase
      timestampSegment = this.timestampAlphabet[index] + timestampSegment
      remaining = Math.floor(remaining / this.timestampBase)
    }

    if (this.obfuscateTimestamp) {
      timestampSegment = this.obfuscateTimestampSegment({ randomSegment, timestampSegment })
    }

    return timestampSegment
  }

  getRandomSegment(id: string): string {
    if (!this.includeTimestamp) throw new Error('getRandomSegment requires including a timestamp.')
    if (this.prefix) id = id.slice(this.prefix.length)
    if (this.suffix) id = id.slice(0, -this.suffix.length)
    if (this.timestampPosition === 'start') id = id.slice(this.timestampLength + this.separator.length)
    if (this.timestampPosition === 'end') id = id.slice(0, -this.timestampLength - this.separator.length)
    return id
  }

  getTimestampSegment(id: string): string {
    if (!this.includeTimestamp) throw new Error('getTimestampSegment requires including a timestamp.')
    if (this.prefix) id = id.slice(this.prefix.length)
    if (this.suffix) id = id.slice(0, -this.suffix.length)
    if (this.timestampPosition === 'start') id = id.slice(0, this.timestampLength)
    if (this.timestampPosition === 'end') id = id.slice(-this.timestampLength)
    return id
  }

  generateOffset(randomSegment: string): number {
    if (!this.includeTimestamp) throw new Error('generateOffset requires including a timestamp.')

    // Sum the indexes
    let offset = 0
    for (const char of randomSegment) {
      offset = offset + this.alphabet.indexOf(char)
    }

    // Get the modulus of the offset relative to the timestamp base
    offset = offset % this.timestampBase

    return offset
  }

  sortAlphabet(alphabet: string): string {
    return alphabet.split('').sort().join('')
  }

  getDate(id: string): Date {
    if (!this.includeTimestamp) throw new Error('getDate requires including a timestamp.')

    let timestampSegment = this.getTimestampSegment(id)

    if (this.obfuscateTimestamp) {
      const randomSegment = this.getRandomSegment(id)
      timestampSegment = this.deobfuscateTimestampSegment({ randomSegment, timestampSegment })
    }

    let decoded = 0
    for (let i = 0; i < timestampSegment.length; i++) {
      decoded = decoded * this.timestampBase + this.timestampAlphabet.indexOf(timestampSegment[i])
    }
    return new Date(decoded)
  }

  getInfo() {
    return {
      alphabet: this.alphabet,
      randomAlphabet: this.randomAlphabet,
      randomLength: this.randomLength,
      randomBase: this.randomBase,
      randomEntropy: this.randomEntropy,
      includeTimestamp: this.includeTimestamp,
      obfuscateTimestamp: this.obfuscateTimestamp,
      timestampPosition: this.timestampPosition,
      timestampAlphabet: this.timestampAlphabet,
      timestampLength: this.timestampLength,
      timestampBase: this.timestampBase,
      timestampMax: this.timestampMax,
      separator: this.separator,
      totalLength: this.timestampLength + this.separator.length + this.randomLength,
    }
  }
}
