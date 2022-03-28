import { default as MerkleTree } from './FixedMerkleTree';
export { PartialMerkleTree } from './PartialMerkleTree';
export { simpleHash } from './simpleHash';
export { MerkleTree };
export default MerkleTree;
export declare type HashFunction<T> = {
    (left: T, right: T): string;
};
export declare type MerkleTreeOptions = {
    hashFunction?: HashFunction<Element>;
    zeroElement?: Element;
};
export declare type Element = string | number;
export declare type SerializedTreeState = {
    levels: number;
    _zeros: Array<Element>;
    _layers: Array<Element[]>;
};
export declare type SerializedPartialTreeState = {
    levels: number;
    _layers: Element[][];
    _zeros: Array<Element>;
    _edgeLeafProof: ProofPath;
    _edgeLeaf: LeafWithIndex;
};
export declare type ProofPath = {
    pathElements: Element[];
    pathIndices: number[];
    pathPositions: number[];
    pathRoot: Element;
};
export declare type TreeEdge = {
    edgeElement: Element;
    edgePath: ProofPath;
    edgeIndex: number;
    edgeElementsCount: number;
};
export declare type TreeSlice = {
    edge: TreeEdge;
    elements: Element[];
};
export declare type LeafWithIndex = {
    index: number;
    data: Element;
};
