import {
  defaultHash,
  Element,
  HashFunction,
  MerkleTreeOptions,
  ProofPath,
  SerializedTreeState,
  TreeEdge,
} from './'


export default class MerkleTree {
  get layers(): Array<Element[]> {
    return this._layers.slice()
  }

  levels: number
  capacity: number
  private _hashFn: HashFunction<Element>
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

    this._layers = []
    this._layers[0] = elements.slice()
    this._buildZeros()
    this._rebuild()
  }

  private _buildZeros() {
    this._zeros = [this.zeroElement]
    for (let i = 1; i <= this.levels; i++) {
      this._zeros[i] = this._hashFn(this._zeros[i - 1], this._zeros[i - 1])
    }
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
  root(): Element {
    return this._layers[this.levels][0] ?? this._zeros[this.levels]
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
  bulkInsert(elements: Element[]): void {
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
  indexOf(element: Element, comparator?: <T> (arg0: T, arg1: T) => boolean): number {
    if (comparator) {
      return this._layers[0].findIndex((el) => comparator<Element>(element, el))
    } else {
      return this._layers[0].indexOf(element)
    }
  }

  getTreeEdge(edgeElement: Element): TreeEdge {
    const leaves = this._layers[0]
    const edgeIndex = leaves.indexOf(edgeElement)
    if (edgeIndex <= -1) {
      return null
    }
    const edgePath = this.path(edgeIndex)
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
  static deserialize(data: SerializedTreeState, hashFunction?: HashFunction<Element>): MerkleTree {
    return new MerkleTree(data.levels, data._layers[0], { hashFunction, zeroElement: data._zeros[0] })
  }
}
