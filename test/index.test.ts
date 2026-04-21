import test from 'node:test'
import assert from 'node:assert'
import { Rando, Serious } from '../src'
import { rando, sorto, locker, clarion, sesame, pinto } from '../src/presets'
import { NUMBERS } from '../src/constants'

test('Rando default', () => {
  const rando = new Rando()
  assert.strictEqual(rando.generate().length, 22)
})

test('Rando with custom length', () => {
  const rando = new Rando({ length: 32 })
  assert.strictEqual(rando.generate().length, 32)
})

test('Rando with custom alphabet', () => {
  const rando = new Rando({ alphabet: 'ab' })
  assert.strictEqual(
    rando
      .generate()
      .split('')
      .every((char) => 'ab'.includes(char)),
    true,
  )
})

test('Date matches after encode and decode', () => {
  const date = new Date()
  const rando = new Rando({ sortable: true })
  const id = rando.generate({ date })
  assert.strictEqual(date.getTime(), rando.getDate(id)?.getTime())
})

test('Date matches after encode and decode with all options', () => {
  const date = new Date()
  const rando = new Rando({
    alphabet: NUMBERS,
    length: 32,
    sortable: true,
    supportDate: new Date('5022-01-01'),
  })
  const id = rando.generate({ date })
  assert.strictEqual(date.getTime(), rando.getDate(id)?.getTime())
})

test('Info returns bits of entropy', () => {
  const rando = new Rando()
  assert.strictEqual(Math.floor(rando.randomBits), 124)
})

test('Get invalid date', () => {
  const rando = new Rando({ sortable: true })
  assert.strictEqual(rando.getDate('OIl0'), null)
})

test('Rando preset', () => {
  assert.strictEqual(rando.generate().length, 22)
})

test('Sorto preset', () => {
  assert.strictEqual(sorto.generate().length, 22)
})

test('Locker preset', () => {
  assert.strictEqual(locker.generate().length, 46)
})

test('Clarion preset', () => {
  assert.strictEqual(clarion.generate().length, 14)
})

test('Serious preset', () => {
  console.log(Serious.generate())
  console.log(Serious.generate())
  console.log(Serious.generate())
  console.log(Serious.generate())
  console.log(Serious.generate())
  console.log(Serious.generate())
  const id = Serious.generate()
  assert.strictEqual(id.toString().length, 16)
  assert.strictEqual(/^\d{16}$/.test(id.toString()), true)
  assert.strictEqual(id <= Number.MAX_SAFE_INTEGER, true)
})

test('Sesame preset', () => {
  assert.strictEqual(sesame.generate().length, 16)
})

test('Pinto preset', () => {
  const pin = pinto.generate()
  assert.strictEqual(/^\d{6}$/.test(pin), true)
})

test('Generate 1000 monotonic sorto IDs and ensure they are sorted', () => {
  const ids = []
  for (let i = 0; i < 1000; i++) {
    ids.push(sorto.generate())
  }
  const sortedIds = [...ids].sort()
  assert.deepStrictEqual(ids, sortedIds)
})

test('Generate 1000 monotonic serious IDs and ensure they are sorted', () => {
  const ids = []
  for (let i = 0; i < 1000; i++) {
    ids.push(Serious.generate())
  }
  const sortedIds = [...ids].sort()
  assert.deepStrictEqual(ids, sortedIds)
})

test('Generate as many IDs as possible within 1 second to test performance', () => {
  // const rando = new Rando()
  const endTime = Date.now() + 1000
  let count = 0
  while (Date.now() < endTime) {
    clarion.generate()
    count++
  }
  console.log(`Generated ${count} clarionIDs in 1 second`)

  // Do the math to log how many per ms
  console.log(`Generated ${count / 1000} clarion IDs per ms`)

  assert.ok(count > 10000) // Expect at least 10,000 IDs generated in 1 second
})

// Test how many serious IDs can be generated in 1 second
test('Generate as many serious IDs as possible within 1 second to test performance', () => {
  const endTime = Date.now() + 1000
  let count = 0
  while (Date.now() < endTime) {
    Serious.generate()
    count++
  }
  console.log(`Generated ${count} serious IDs in 1 second`)

  // Do the math to log how many per ms
  console.log(`Generated ${count / 1000} serious IDs per ms`)

  assert.ok(count > 10000) // Expect at least 10,000 serious IDs generated in 1 second
})
