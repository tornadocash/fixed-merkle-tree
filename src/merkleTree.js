// keccak256("tornado") % BN254_FIELD_SIZE
const DEFAULT_ZERO = '21663839004416932945382355908790599225266501822907911457504978515578255421292'
const defaultHash = require('./mimc')

// todo ensure consistent types in tree and inserted elements?
// todo make sha3 default hasher (and update tests) to get rid of mimc/snarkjs/circomlib dependency
class MerkleTree {
  constructor(levels, elements = [], zeroElement = DEFAULT_ZERO, hashFunction) {
    this.levels = levels
    this.capacity = 2 << levels
    this.zeroElement = zeroElement
    this._hash = hashFunction ?? defaultHash

    this._zeros = []
    this._layers = []
    this._layers[0] = elements
    this._zeros[0] = this.zeroElement
    for (let i = 1; i <= levels; i++) {
      this._zeros[i] = this._hash(this._zeros[i - 1], this._zeros[i - 1])
    }
    this._rebuild()
  }

  _rebuild() {
    for (let level = 1; level <= this.levels; level++) {
      this._layers[level] = []
      for (let i = 0; i < Math.ceil(this._layers[level - 1].length / 2); i++) {
        this._layers[level][i] = this._hash(
          this._layers[level - 1][i * 2],
          this._layers[level - 1]?.[i * 2 + 1] ?? this._zeros[level - 1],
        )
      }
    }
  }

  root() {
    return this._layers[this.levels]?.[0] ?? this._zeros[this.levels]
  }

  insert(element) {
    if (this._layers[0].length >= this.capacity) {
      throw new Error('Tree is full')
    }
    this.update(this._layers[0].length, element)
  }

  bulkInsert(elements) {
    if (this._layers[0].length + elements > this.capacity) {
      throw new Error('Tree is full')
    }
    this._layers[0].push(...elements)
    this._rebuild()
  }

  update(index, element) {
    if (index < 0 || index > this._layers[0].length || index >= this.capacity) {
      throw new Error('Insert index out of bounds: ' + index)
    }
    this._layers[0][index] = element
    for (let level = 1; level <= this.levels; level++) {
      index >>= 1
      this._layers[level][index] = this._hash(
        this._layers[level - 1][index * 2],
        this._layers[level - 1]?.[index * 2 + 1] ?? this._zeros[level - 1],
      )
    }
  }

  proof(index) {
    if (index < 0 || index >= this._layers[0].length) {
      throw new Error('Index out of bounds: ' + index)
    }
    const pathElements = []
    const pathIndex = []
    for (let level = 0; level < this.levels; level++) {
      pathIndex[level] = index % 2
      pathElements[level] = this._layers[level]?.[index ^ 1] ?? this._zeros[level]
      index >>= 1
    }
    return {
      pathElements,
      pathIndex,
    }
  }

  indexOf(element) {
    return this._layers[0].indexOf(element)
  }
}

module.exports = MerkleTree
