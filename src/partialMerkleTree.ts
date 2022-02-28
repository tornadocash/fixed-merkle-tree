import { defaultHash, Element, HashFunction, MerkleTreeOptions, ProofPath, TreeEdge } from './'

type LeafWithIndex = { index: number, data: Element }

export class PartialMerkleTree {
  levels: number
  private zeroElement: Element
  private _zeros: Element[]
  private _layers: Array<Element[]>
  private _leaves: Element[]
  private _leavesAfterEdge: Element[]
  private _edgeLeaf: LeafWithIndex
  private _root: Element
  private _hashFn: HashFunction<Element>
  private _edgeLeafProof: ProofPath

  constructor({
    edgePath,
    edgeElement,
    edgeIndex,
  }: TreeEdge, leaves: Element[], root: Element, { hashFunction, zeroElement }: MerkleTreeOptions = {}) {
    this._edgeLeafProof = edgePath
    this.zeroElement = zeroElement ?? 0
    this._edgeLeaf = { data: edgeElement, index: edgeIndex }
    this._leavesAfterEdge = leaves
    this._root = root
    this._hashFn = hashFunction || defaultHash
    this._buildTree()
  }

  get capacity() {
    return this.levels ** 2
  }

  private _buildTree(): void {
    const edgeLeafIndex = this._edgeLeaf.index
    this._leaves = [...Array.from({ length: edgeLeafIndex - 1 }, () => null), ...this._leavesAfterEdge]
    this._layers = [this._leaves]
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
}
