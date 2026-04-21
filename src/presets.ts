import { Rando } from './'
import { CLARITY, PASSWORD, NUMBERS } from './constants'

// Rando (like a compact UUIDv4)
export const rando = new Rando()

// Sorto (like a compact UUIDv7)
export const sorto = new Rando({
  sortable: true,
})

// Locker (secure key with over 256 bits of entropy)
export const locker = new Rando({
  length: 46,
})

//  Clarion (lowercase, easy to read, type, verbally relay)
export const clarion = new Rando({
  sortable: true,
  alphabet: CLARITY,
  length: 14,
})

// Sesame (secure password with over 128 bits of entropy)
export const sesame = new Rando({
  alphabet: PASSWORD,
  length: 16,
})

// Pinto (for verification codes, etc)
export const pinto = new Rando({
  alphabet: NUMBERS,
  length: 6,
})
