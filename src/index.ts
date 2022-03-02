export { default as MerkleTree } from './FixedMerkleTree'
export { PartialMerkleTree } from './PartialMerkleTree'
export { simpleHash } from './simpleHash'

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
  levels: number,
  leaves: Element[]
  _zeros: Array<Element>,
  _edgeLeafProof: ProofPath,
  _initialRoot: Element,
  _edgeLeaf: LeafWithIndex
}

export type ProofPath = {
  pathElements: Element[],
  pathIndices: number[],
  pathPositions: number[],
}
export type TreeEdge = {
  edgeElement: Element;
  edgePath: ProofPath;
  edgeIndex: number
}
export type LeafWithIndex = { index: number, data: Element }

