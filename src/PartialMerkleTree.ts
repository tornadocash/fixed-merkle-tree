import {
  Element,
  HashFunction,
  LeafWithIndex,
  MerkleTreeOptions,
  ProofPath,
  SerializedPartialTreeState,
  TreeEdge,
} from './'
import defaultHash from './simpleHash'
import { BaseTree } from './BaseTree'

export class PartialMerkleTree extends BaseTree {
  private _leaves: Element[]
  private _leavesAfterEdge: Element[]
  private _edgeLeaf: LeafWithIndex
  private _initialRoot: Element
  private _edgeLeafProof: ProofPath
  private _proofMap: Map<number, [i: number, el: Element]>

  constructor(levels: number, {
    edgePath,
    edgeElement,
    edgeIndex,
    edgeElementsCount,
  }: TreeEdge, leaves: Element[], { hashFunction, zeroElement }: MerkleTreeOptions = {}) {
    super()
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

  get edgeIndex(): number {
    return this._edgeLeaf.index
  }

  get edgeElement(): Element {
    return this._edgeLeaf.data
  }

  get edgeLeafProof(): ProofPath {
    return this._edgeLeafProof
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

  private _buildHashes() {
    for (let layerIndex = 1; layerIndex <= this.levels; layerIndex++) {
      const nodes = this._layers[layerIndex - 1]
      const currentLayer = this._processNodes(nodes, layerIndex)
      if (this._proofMap.has(layerIndex)) {
        const [proofPos, proofEl] = this._proofMap.get(layerIndex)
        if (!currentLayer[proofPos]) currentLayer[proofPos] = proofEl
      }
      this._layers[layerIndex] = currentLayer
    }
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
    this._processUpdate(index)
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
        pathElements[level] = this._layers[level][leafIndex]
        pathPositions[level] = leafIndex
      } else {
        pathElements[level] = this._zeros[level]
        pathPositions[level] = 0
      }
      const [proofPos, proofEl] = this._proofMap.get(level)
      pathElements[level] = pathElements[level] ?? (proofPos === leafIndex ? proofEl : this._zeros[level])
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
    return BaseTree.indexOf(this._layers[0], element, this.edgeIndex, comparator)
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
    return {
      _edgeLeafProof: this._edgeLeafProof,
      _edgeLeaf: this._edgeLeaf,
      _layers: this._layers,
      _zeros: this._zeros,
      levels: this.levels,
    }
  }

  static deserialize(data: SerializedPartialTreeState, hashFunction?: HashFunction<Element>): PartialMerkleTree {
    const instance: PartialMerkleTree = Object.assign(Object.create(this.prototype), data)
    instance._hashFn = hashFunction || defaultHash
    instance._initialRoot = data._edgeLeafProof.pathRoot
    instance.zeroElement = instance._zeros[0]
    instance._leavesAfterEdge = instance._layers[0].slice(data._edgeLeaf.index)
    instance._createProofMap()
    return instance
  }

  toString() {
    return JSON.stringify(this.serialize())
  }
}
