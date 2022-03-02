import {
  Element,
  HashFunction,
  LeafWithIndex,
  MerkleTreeOptions,
  ProofPath,
  SerializedPartialTreeState,
  simpleHash,
  TreeEdge,
} from './'

export const defaultHash = (left: Element, right: Element): string => simpleHash([left, right])

export class PartialMerkleTree {
  levels: number
  private zeroElement: Element
  private _zeros: Element[]
  private _layers: Array<Element[]>
  private _leaves: Element[]
  private _leavesAfterEdge: Element[]
  private _edgeLeaf: LeafWithIndex
  private _initialRoot: Element
  private _hashFn: HashFunction<Element>
  private _edgeLeafProof: ProofPath

  constructor(levels: number, {
    edgePath,
    edgeElement,
    edgeIndex,
  }: TreeEdge, leaves: Element[], root: Element, { hashFunction, zeroElement }: MerkleTreeOptions = {}) {
    hashFunction = hashFunction || defaultHash
    const hashFn = (left, right) => (left !== null && right !== null) ? hashFunction(left, right) : null
    this._edgeLeafProof = edgePath
    this.zeroElement = zeroElement ?? 0
    this._edgeLeaf = { data: edgeElement, index: edgeIndex }
    this._leavesAfterEdge = leaves
    this._initialRoot = root
    this.levels = levels
    this._hashFn = hashFn
    this._buildTree()
  }

  get capacity() {
    return this.levels ** 2
  }

  get layers(): Array<Element[]> {
    return this._layers.slice()
  }

  get zeros(): Element[] {
    return this._zeros.slice()
  }

  get elements(): Element[] {
    return this._layers[0].slice()
  }

  get root(): Element {
    return this._layers[this.levels][0] ?? this._zeros[this.levels]
  }

  private _buildTree(): void {
    const edgeLeafIndex = this._edgeLeaf.index
    this._leaves = [...Array.from({ length: edgeLeafIndex }, () => null), ...this._leavesAfterEdge]
    if (this._edgeLeafProof.pathIndices[0] === 1) {
      this._leaves[this._edgeLeafProof.pathPositions[0]] = this._edgeLeafProof.pathElements[0]
    }
    this._layers = [this._leaves]
    this._buildZeros()
    this._buildHashes()

  }

  private _buildZeros() {
    this._zeros = [this.zeroElement]
    for (let i = 1; i <= this.levels; i++) {
      this._zeros[i] = this._hashFn(this._zeros[i - 1], this._zeros[i - 1])
    }
  }

  _buildHashes() {
    for (let level = 1; level <= this.levels; level++) {
      this._layers[level] = []
      for (let i = 0; i < Math.ceil(this._layers[level - 1].length / 2); i++) {
        const left = this._layers[level - 1][i * 2]
        const right = i * 2 + 1 < this._layers[level - 1].length
          ? this._layers[level - 1][i * 2 + 1]
          : this._zeros[level - 1]
        let hash: Element = this._hashFn(left, right)
        if (!hash && this._edgeLeafProof.pathPositions[level] === i) hash = this._edgeLeafProof.pathElements[level]
        if (level === this.levels) hash = hash || this._initialRoot
        this._layers[level][i] = hash
      }
    }
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
    if (index < this._edgeLeaf.index) {
      throw new Error(`Index ${index} is below the edge: ${this._edgeLeaf.index}`)
    }
    this._layers[0][index] = element
    for (let level = 1; level <= this.levels; level++) {
      index >>= 1
      const left = this._layers[level - 1][index * 2]
      const right = index * 2 + 1 < this._layers[level - 1].length
        ? this._layers[level - 1][index * 2 + 1]
        : this._zeros[level - 1]
      let hash: Element = this._hashFn(left, right)
      if (!hash && this._edgeLeafProof.pathPositions[level] === index) {
        hash = this._edgeLeafProof.pathElements[level]
      }
      if (level === this.levels) {
        hash = hash || this._initialRoot
      }
      this._layers[level][index] = hash
    }
  }

  path(index: Element): ProofPath {
    if (isNaN(Number(index)) || index < 0 || index >= this._layers[0].length) {
      throw new Error('Index out of bounds: ' + index)
    }
    if (index < this._edgeLeaf.index) {
      throw new Error(`Index ${index} is below the edge: ${this._edgeLeaf.index}`)
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

  indexOf(element: Element, comparator?: <T> (arg0: T, arg1: T) => boolean): number {
    if (comparator) {
      return this._layers[0].findIndex((el) => comparator<Element>(element, el))
    } else {
      return this._layers[0].indexOf(element)
    }
  }

  serialize(): SerializedPartialTreeState {
    const leaves = this.layers[0].slice(this._edgeLeaf.index)
    return {
      _initialRoot: this._initialRoot,
      _edgeLeafProof: this._edgeLeafProof,
      _edgeLeaf: this._edgeLeaf,
      levels: this.levels,
      leaves,
      _zeros: this._zeros,
    }
  }

  static deserialize(data: SerializedPartialTreeState, hashFunction?: HashFunction<Element>): PartialMerkleTree {
    const edge: TreeEdge = {
      edgePath: data._edgeLeafProof,
      edgeElement: data._edgeLeaf.data,
      edgeIndex: data._edgeLeaf.index,
    }
    return new PartialMerkleTree(data.levels, edge, data.leaves, data._initialRoot, {
      hashFunction,
      zeroElement: data._zeros[0],
    })
  }

  toString() {
    return JSON.stringify(this.serialize())
  }
}
