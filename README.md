# Rando

Rando is a library for generating identifiers. IDs are random and universally unique by default. Options can be modified to fit a wide variety of requirements. In a node environment, randomness is provided by the `node:crypto` module. In a browser environment, randomness is provided by the Web Crypto API.

### Install

```
npm i @nextform/rando
```

### Usage

Import the rando class and create an instance. The instance generates IDs with the `generate()` method.

```js
import { Rando } from '@nextform/rando'

const rando = new Rando()
rando.generate() // => "Jb46bM8xM3mhDLnpQrwNvN"
```

### Customizing the Length

If you want a longer random string, for example if you want extra security for an API key, it's easy to modify the length. The example below generates a 46-character ID with over 256 bits of entropy:

```js
const rando = new Rando({ length: 46 })
rando.generate() //=> "X5533mwXPH6V2nMN5548t1vkFVN4RTJqM89JNQcbVjmt1G"
```

### Sortable IDs

Rando can generate sortable IDs where the beginning of the ID is an encoded timestamp using the given `alphabet`. Rando will evaluate the `alphabet` length and automatically determine how many characters are required to encode a timestamp at millisecond precision. The `length` must be sufficient for millisecond precision. Refer to the table below for guidance on the length needed to support a given year with a given alphabet base.

Sortable IDs are monotonic. The first four characters of the random segment will be incremented if multiple IDs are generated in the same millisecond.

```js
const rando = new Rando({ sortable: true })
rando.generate()

// Output:
//
// "13DNYFr2DBJvhWfWCs58Nb"
//  |------||------------|
//  Sortable    Random
//  Segment     Segment
```

Sortable IDs can be decoded to return a date. Note that the instance doing the decoding must have the same options as the instance that generated it.

```js
rando.getDate('13DNYFr2DBJvhWfWCs58Nb').toISOString() //=> "2025-02-25T13:11:45.061Z"
```

### All Options

Rando instances can be extensively customized to generate the perfect identifier for your requirements. Here's the type definition of all available options, with details below:

```ts
type RandoOptions = {
  alphabet?: string
  length?: number
  sortable?: boolean
  supportDate?: Date
}
```

| Property      | Default   | Description                                                                                                                                               |
| ------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `alphabet`    | `BASE_50` | A string of characters to use to generate your IDs. Each character must be unique. The default base 50 alphabet excludes vowels and ambiguous characters. |
| `length`      | `22`      | The length of the ID. By default, the `length` is `22` which provides 124 bits of entropy, slightly more than a UUIDv4.                                   |
| `sortable`    | `false`   | Makes the ID sortable when set to `true`. The leading characters encode a timestamp at millisecond precision.                                             |
| `supportDate` | `'4000'`  | Allows you to specify a target date for the sortable segment. See below for additional details.                                                           |

### Special Considerations for Sortable IDs

The `length` and base of the `alphabet` together determine how long the sortable segment must be for millisecond precision. If the `length` is too short, Rando will throw an error when instantiated. The `supportDate` property allows you to specify a target date for the sortable segment to support. The sortable segment will be left-padded to support the target date with a consistent overall length.

Note that making an ID sortable will reduce the number of random characters in the ID. If you `console.log` the instance, you will see several helpful properties such as `randomBits` that can help you determine whether or not the ID meets your requirements.

```js
const rando = new Rando({ sortable: true })

// Output:
//
// Rando {
//   alphabet: '123456789BCDFGHJKLMNPQRSTVWXYZbcdfghjkmnpqrstvwxyz',
//   length: 22,
//   randomLength: 13,
//   base: 50,
//   randomBits: 73.37013046707142,
//   randomLimit: 1.2207031249999986e+22,
//   sortable: true,
//   supportDate: 4000-01-01T00:00:00.000Z,
//   sortableLength: 9,
//   sortableLimit: +063862-01-25T10:13:20.000Z
// }
```

### Presets

Rando comes with a few presets to make it easy to generate IDs for common use cases.

```js
import { rando, sorto, locker, sesame, pinto } from '@nextform/rando/presets'

rando.generate() //=> "7kFD8XHYp1JdXXzYsxRvXT"
sorto.generate() //=> "13DNYDsRBvc6TQ2HwHh1GW"
locker.generate() //=> "5Myvnv4BQm7rDhz3zntYGMXf9Srr71z7wFwF1SSYMQVvQQ"
clarion.generate() //=> "26NSBR257GFD2L"
sesame.generate() //=> "E@MvHJG4JbA$o8li"
pinto.generate() //=> "368230"
```

- `rando` Default, like a compact UUIDv4
- `sorto` Sortable, like a compact UUIDv7
- `locker` Over 256 bits of entropy, suitable for API keys
- `clarion` Optimal readability, suitable for non-distributed systems
- `sesame` Secure 16-character password
- `pinto` Numerical 6-digit pin for verification codes

### Appendix: Guidance for Sortable IDs

The following table is a guide for the length needed to support at least the year 3000 with a given alphabet base.

| Base | Length | Max Year |
| ---- | ------ | -------- |
| 2    | 46     | 4199     |
| 3    | 29     | 4144     |
| 4    | 23     | 4199     |
| 5    | 20     | 4992     |
| 6    | 18     | 5188     |
| 7    | 17     | 9341     |
| 8    | 16     | 10889    |
| 9    | 15     | 8494     |
| 10   | 14     | 5138     |
| 11   | 14     | 14003    |
| 12   | 13     | 5360     |
| 13   | 13     | 11567    |
| 14   | 13     | 27121    |
| 15   | 12     | 6081     |
| 16   | 12     | 10889    |
| 17   | 12     | 20432    |
| 18   | 11     | 4006     |
| 19   | 11     | 5661     |
| 20   | 11     | 8459     |
| 21   | 11     | 13069    |
| 22   | 11     | 20486    |
| 23   | 11     | 32163    |
| 24   | 11     | 50190    |
| 25   | 10     | 4992     |
| 26   | 10     | 6443     |
| 27   | 10     | 8494     |
| 28   | 10     | 11356    |
| 29   | 10     | 15301    |
| 30   | 10     | 20681    |
| 31   | 10     | 27942    |
| 32   | 10     | 37648    |
| 33   | 10     | 50503    |
| 34   | 10     | 67387    |
| 35   | 9      | 4467     |
| 36   | 9      | 5188     |
| 37   | 9      | 6088     |
| 38   | 9      | 7205     |
| 39   | 9      | 8584     |
| 40   | 9      | 10277    |
| 41   | 9      | 12344    |
| 42   | 9      | 14856    |
| 43   | 9      | 17896    |
| 44   | 9      | 21557    |
| 45   | 9      | 25948    |
| 46   | 9      | 31193    |
| 47   | 9      | 37433    |
| 48   | 9      | 44832    |
| 49   | 9      | 53572    |
| 50   | 9      | 63862    |
| 51   | 9      | 75936    |
| 52   | 9      | 90061    |
| 53   | 9      | 106535   |
| 54   | 8      | 4261     |
| 55   | 8      | 4623     |
| 56   | 8      | 5034     |
| 57   | 8      | 5501     |
| 58   | 8      | 6028     |
| 59   | 8      | 6622     |
| 60   | 8      | 7292     |
| 61   | 8      | 8044     |
| 62   | 8      | 8888     |
| 63   | 8      | 9833     |
| 64   | 8      | 10889    |
