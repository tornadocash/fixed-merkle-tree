import simpleHash from './simpleHash'

const defaultHash = (left: Element, right: Element): string => simpleHash([left, right])

export default class MerkleTree {
  get layers(): Array<Element[]> {
    return this._layers.slice()
  }

  set layers(value: Array<Element[]>) {
    this._layers = value
  }

  levels: number
  capacity: number
  private _hashFn: HashFunction
  private zeroElement: Element
  private _zeros: Element[]
  private _layers: Array<Element[]>

  constructor(levels: number, elements: Element[] = [], {
    hashFunction = defaultHash,
    zeroElement = 0,
  }: MerkleTreeOptions = {}) {
    this.levels = levels
    this.capacity = 2 ** levels
    if (elements.length > this.capacity) {
      throw new Error('Tree is full')
    }
    this._hashFn = hashFunction
    this.zeroElement = zeroElement
    this._zeros = []
    this._zeros[0] = zeroElement
    for (let i = 1; i <= levels; i++) {
      this._zeros[i] = this._hashFn(this._zeros[i - 1], this._zeros[i - 1])
    }
    this._layers = []
    this._layers[0] = elements.slice()
    this._rebuild()
  }

  _rebuild() {
    for (let level = 1; level <= this.levels; level++) {
      this._layers[level] = []
      for (let i = 0; i < Math.ceil(this._layers[level - 1].length / 2); i++) {
        this._layers[level][i] = this._hashFn(
          this._layers[level - 1][i * 2],
          i * 2 + 1 < this._layers[level - 1].length
            ? this._layers[level - 1][i * 2 + 1]
            : this._zeros[level - 1],
        )
      }
    }
  }

  /**
   * Get tree root
   */
  root(): string {
    return `${this._layers[this.levels].length > 0 ? this._layers[this.levels][0] : this._zeros[this.levels]}`
  }

  /**
   * Insert new element into the tree
   * @param element Element to insert
   */
  insert(element: Element) {
    if (this._layers[0].length >= this.capacity) {
      throw new Error('Tree is full')
    }
    this.update(this._layers[0].length, element)
  }

  /**
   * Insert multiple elements into the tree.
   * @param {Array} elements Elements to insert
   */
  bulkInsert(elements: Element[]) {
    if (!elements.length) {
      return
    }

    if (this._layers[0].length + elements.length > this.capacity) {
      throw new Error('Tree is full')
    }
    // First we insert all elements except the last one
    // updating only full subtree hashes (all layers where inserted element has odd index)
    // the last element will update the full path to the root making the tree consistent again
    for (let i = 0; i < elements.length - 1; i++) {
      this._layers[0].push(elements[i])
      let level = 0
      let index = this._layers[0].length - 1
      while (index % 2 === 1) {
        level++
        index >>= 1
        this._layers[level][index] = this._hashFn(
          this._layers[level - 1][index * 2],
          this._layers[level - 1][index * 2 + 1],
        )
      }
    }
    this.insert(elements[elements.length - 1])
  }

  /**
   * Change an element in the tree
   * @param {number} index Index of element to change
   * @param element Updated element value
   */
  update(index: number, element: Element) {
    if (isNaN(Number(index)) || index < 0 || index > this._layers[0].length || index >= this.capacity) {
      throw new Error('Insert index out of bounds: ' + index)
    }
    this._layers[0][index] = element
    for (let level = 1; level <= this.levels; level++) {
      index >>= 1
      this._layers[level][index] = this._hashFn(
        this._layers[level - 1][index * 2],
        index * 2 + 1 < this._layers[level - 1].length
          ? this._layers[level - 1][index * 2 + 1]
          : this._zeros[level - 1],
      )
    }
  }

  /**
   * Get merkle path to a leaf
   * @param {number} index Leaf index to generate path for
   * @returns {{pathElements: Object[], pathIndex: number[]}} An object containing adjacent elements and left-right index
   */
  path(index: Element): ProofPath {
    if (isNaN(Number(index)) || index < 0 || index >= this._layers[0].length) {
      throw new Error('Index out of bounds: ' + index)
    }
    let elIndex = +index
    const pathElements: Element[] = []
    const pathIndices: number[] = []
    const pathPositions: number [] = []
    for (let level = 0; level < this.levels; level++) {
      pathIndices[level] = elIndex % 2
      const leafIndex = elIndex ^ 1
      if (leafIndex < this._layers[level].length) {
        pathElements[level] = this._layers[level][leafIndex]
        pathPositions[level] = leafIndex
      } else {
        pathElements[level] = this._zeros[level]
        pathPositions[level] = 0
      }
      elIndex >>= 1
    }
    return {
      pathElements,
      pathIndices,
      pathPositions,
    }
  }

  /**
   * Find an element in the tree
   * @param element An element to find
   * @param comparator A function that checks leaf value equality
   * @returns {number} Index if element is found, otherwise -1
   */
  indexOf(element: Element, comparator?: <T, R> (arg0: T, arg1: T) => R): number {
    if (comparator) {
      return this._layers[0].findIndex((el) => comparator<Element, number>(element, el))
    } else {
      return this._layers[0].indexOf(element)
    }
  }

  getTreeEdge(edgeElement: Element, index?: number) {
    if (edgeElement === 'undefined') {
      throw new Error('element is required')
    }
    let edgeIndex: number
    if (!Number.isInteger(index)) {
      index = -1
      const leaves = this._layers[0]
      index = leaves.indexOf(edgeElement)
      edgeIndex = index
    }

    if (index <= -1) {
      return []
    }
    const edgePath = this.path(index)
    return { edgePath, edgeElement, edgeIndex }
  }

  /**
   * Returns a copy of non-zero tree elements.
   */
  get elements() {
    return this._layers[0].slice()
  }

  /**
   * Returns a copy of n-th zero elements array
   */
  get zeros() {
    return this._zeros.slice()
  }

  getLayersAsObject() {
    const layers = this.layers
    const objs = []
    for (let i = 0; i < this.levels; i++) {
      const arr = []
      for (let j = 0; j < layers[i].length; j++) {
        const obj = { [layers[i][j]]: null }
        if (objs.length) {
          obj[layers[i][j]] = {}
          const a = objs.shift()
          const akey = Object.keys(a)[0]
          obj[layers[i][j]][akey] = a[akey]
          if (objs.length) {
            const b = objs.shift()
            const bkey = Object.keys(b)[0]
            obj[layers[i][j]][bkey] = b[bkey]
          }
        }
        arr.push(obj)
      }
      objs.push(...arr)
    }
    return objs[0]
  }

  /**
   * Serialize entire tree state including intermediate layers into a plain object
   * Deserializing it back will not require to recompute any hashes
   * Elements are not converted to a plain type, this is responsibility of the caller
   */
  serialize(): SerializedTreeState {
    return {
      levels: this.levels,
      _zeros: this._zeros,
      _layers: this._layers,
    }
  }

  /**
   * Deserialize data into a MerkleTree instance
   * Make sure to provide the same hashFunction as was used in the source tree,
   * otherwise the tree state will be invalid
   */
  static deserialize(data: SerializedTreeState, hashFunction?: HashFunction): MerkleTree {
    return new MerkleTree(data.levels, data._layers[0], { hashFunction, zeroElement: data._zeros[0] })
  }
}

export type HashFunction = {
  (left: string | number, right: string | number): string
}
export type MerkleTreeOptions = {
  hashFunction?: HashFunction
  zeroElement?: Element
}

export type  Element = string | number

export type SerializedTreeState = {
  levels: number,
  _zeros: Array<Element>,
  _layers: Array<Element[]>
}

export type ProofPath = {
  pathElements: Element[],
  pathIndices: number[],
  pathPositions: number[],
}
