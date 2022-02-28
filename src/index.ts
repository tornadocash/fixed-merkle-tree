import { simpleHash } from './simpleHash'

export { default as MerkleTree } from './fixedMerkleTree'
export { PartialMerkleTree } from './partialMerkleTree'
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
export const defaultHash = (left: Element, right: Element): string => simpleHash([left, right])
