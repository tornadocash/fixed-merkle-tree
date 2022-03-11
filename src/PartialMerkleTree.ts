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
  get edgeLeafProof(): ProofPath {
    return this._edgeLeafProof
  }

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
  private _proofMap: Map<number, [i: number, el: Element]>

  constructor(levels: number, {
    edgePath,
    edgeElement,
    edgeIndex,
    edgeElementsCount,
  }: TreeEdge, leaves: Element[], { hashFunction, zeroElement }: MerkleTreeOptions = {}) {
    if (edgeIndex + leaves.length !== edgeElementsCount) throw new Error('Invalid number of elements')
    this._edgeLeafProof = edgePath
    this._initialRoot = edgePath.pathRoot
    this.zeroElement = zeroElement ?? 0
    this._edgeLeaf = { data: edgeElement, index: edgeIndex }
    this._leavesAfterEdge = leaves
    this.levels = levels
    this._hashFn = hashFunction || defaultHash
    this._createProofMap()
    this._buildTree()
  }

  get capacity() {
    return 2 ** this.levels
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

  get edgeIndex(): number {
    return this._edgeLeaf.index
  }

  get edgeElement(): Element {
    return this._edgeLeaf.data
  }

  private _createProofMap() {
    this._proofMap = this.edgeLeafProof.pathPositions.reduce((p, c, i) => {
      p.set(i, [c, this.edgeLeafProof.pathElements[i]])
      return p
    }, new Map())
    this._proofMap.set(this.levels, [0, this.edgeLeafProof.pathRoot])
  }

  private _buildTree(): void {
    const edgeLeafIndex = this._edgeLeaf.index
    this._leaves = Array(edgeLeafIndex).concat(this._leavesAfterEdge)
    if (this._proofMap.has(0)) {
      const [proofPos, proofEl] = this._proofMap.get(0)
      this._leaves[proofPos] = proofEl
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
    for (let layerIndex = 1; layerIndex <= this.levels; layerIndex++) {
      const nodes = this._layers[layerIndex - 1]
      const length = nodes.length
      let currentLength = Math.ceil(length / 2)
      const currentLayer = new Array(currentLength)
      currentLength--
      const starFrom = length - ((length % 2) ^ 1)
      let j = 0
      for (let i = starFrom; i >= 0; i -= 2) {
        if (nodes[i - 1] === undefined) break
        const left = nodes[i - 1]
        const right = (i === starFrom && length % 2 === 1) ? this._zeros[layerIndex - 1] : nodes[i]
        currentLayer[currentLength - j] = this._hashFn(left, right)
        j++
      }
      if (this._proofMap.has(layerIndex)) {
        const [proofPos, proofEl] = this._proofMap.get(layerIndex)
        if (!currentLayer[proofPos]) currentLayer[proofPos] = proofEl
      }
      this._layers[layerIndex] = currentLayer
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

  /*
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
        const left = this._layers[level - 1][index * 2]
        const right = this._layers[level - 1][index * 2 + 1]
        this._layers[level][index] = this._hashFn(left, right)
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
      this._layers[level][index] = this._hashFn(left, right)
    }
  }

  path(index: number): ProofPath {
    if (isNaN(Number(index)) || index < 0 || index >= this._layers[0].length) {
      throw new Error('Index out of bounds: ' + index)
    }
    if (index < this._edgeLeaf.index) {
      throw new Error(`Index ${index} is below the edge: ${this._edgeLeaf.index}`)
    }
    let elIndex = Number(index)
    const pathElements: Element[] = []
    const pathIndices: number[] = []
    const pathPositions: number [] = []
    for (let level = 0; level < this.levels; level++) {
      pathIndices[level] = elIndex % 2
      const leafIndex = elIndex ^ 1
      if (leafIndex < this._layers[level].length) {
        const [proofPos, proofEl] = this._proofMap.get(level)
        pathElements[level] = proofPos === leafIndex ? proofEl : this._layers[level][leafIndex]
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
      pathRoot: this.root,
    }
  }

  indexOf(element: Element, comparator?: <T> (arg0: T, arg1: T) => boolean): number {
    if (comparator) {
      return this._layers[0].findIndex((el) => comparator<Element>(element, el))
    } else {
      return this._layers[0].indexOf(element)
    }
  }

  proof(element: Element): ProofPath {
    const index = this.indexOf(element)
    return this.path(index)
  }

  /**
   * Shifts edge of tree to left
   * @param edge new TreeEdge below current edge
   * @param elements leaves between old and new edge
   */

  shiftEdge(edge: TreeEdge, elements: Element[]) {
    if (this._edgeLeaf.index <= edge.edgeIndex) {
      throw new Error(`New edgeIndex should be smaller then ${this._edgeLeaf.index}`)
    }
    if (elements.length !== (this._edgeLeaf.index - edge.edgeIndex)) {
      throw new Error(`Elements length should be ${this._edgeLeaf.index - edge.edgeIndex}`)
    }
    this._edgeLeafProof = edge.edgePath
    this._edgeLeaf = { index: edge.edgeIndex, data: edge.edgeElement }
    this._leavesAfterEdge = [...elements, ...this._leavesAfterEdge]
    this._createProofMap()
    this._buildTree()
  }

  serialize(): SerializedPartialTreeState {
    const leaves = this.layers[0].slice(this._edgeLeaf.index)
    return {
      _edgeLeafProof: this._edgeLeafProof,
      _edgeLeaf: this._edgeLeaf,
      _edgeElementsCount: this._layers[0].length,
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
      edgeElementsCount: data._edgeElementsCount,
    }
    return new PartialMerkleTree(data.levels, edge, data.leaves, {
      hashFunction,
      zeroElement: data._zeros[0],
    })
  }

  toString() {
    return JSON.stringify(this.serialize())
  }
}
