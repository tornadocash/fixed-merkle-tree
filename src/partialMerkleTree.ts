import { Element, HashFunction, ProofPath } from './index'

type LeafWithIndex = { index: number, data: Element }

export class PartialMerkleTree {
  levels: number
  private _hash: HashFunction
  private zeroElement: Element
  private _zeros: Element[]
  private _layers: Array<Element[]>
  private _leaves: Element[]
  private _leavesAfterEdge: Element[]
  private _edgeLeaf: LeafWithIndex
  private _root: string
  private _hashFn: HashFunction
  private _edgeLeafProof: ProofPath

  constructor(edgeLeafProof: ProofPath, edgeLeaf: LeafWithIndex, leaves: Element[], root: string, hashFn: HashFunction) {
    this._edgeLeafProof = edgeLeafProof
    this._edgeLeaf = edgeLeaf
    this._leavesAfterEdge = leaves
    this._root = root
    this._hashFn = hashFn

  }

  get capacity() {
    return this.levels ** 2
  }

  private _buildTree(): void {
    const edgeLeafIndex = this._edgeLeaf.index
    this._leaves = [...Array.from({ length: edgeLeafIndex - 1 }, () => null), ...this._leavesAfterEdge]
    this._layers = [this._leaves]
    this._rebuild()

  }

  _rebuild() {
    for (let level = 1; level <= this.levels; level++) {
      this._layers[level] = []
      for (let i = 0; i < Math.ceil(this._layers[level - 1].length / 2); i++) {
        this._layers[level][i] = this._hash(
          this._layers[level - 1][i * 2],
          i * 2 + 1 < this._layers[level - 1].length
            ? this._layers[level - 1][i * 2 + 1]
            : this._zeros[level - 1],
        )
      }
    }
  }
}
