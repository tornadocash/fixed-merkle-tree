import { default as MerkleTree } from './FixedMerkleTree'
export { PartialMerkleTree } from './PartialMerkleTree'
export { simpleHash } from './simpleHash'
export { MerkleTree }
export default MerkleTree
export type HashFunction<T> = {
  (left: T, right: T): string
}

export type MerkleTreeOptions = {
  hashFunction?: HashFunction<Element>
  zeroElement?: Element
}

export type  Element = string | number

export type SerializedTreeState = {
  levels: number,
  _zeros: Array<Element>,
  _layers: Array<Element[]>
}

export type SerializedPartialTreeState = {
  levels: number
  _layers: Element[][]
  _zeros: Array<Element>
  _edgeLeafProof: ProofPath
  _edgeLeaf: LeafWithIndex
}

export type ProofPath = {
  pathElements: Element[],
  pathIndices: number[],
  pathPositions: number[],
  pathRoot: Element
}
export type TreeEdge = {
  edgeElement: Element;
  edgePath: ProofPath;
  edgeIndex: number;
  edgeElementsCount: number;
}

export type TreeSlice = { edge: TreeEdge, elements: Element[] }
export type LeafWithIndex = { index: number, data: Element }

