import { Element, HashFunction, MerkleTreeOptions, ProofPath, SerializedPartialTreeState, TreeEdge } from './';
import { BaseTree } from './BaseTree';
export declare class PartialMerkleTree extends BaseTree {
    private _leaves;
    private _leavesAfterEdge;
    private _edgeLeaf;
    private _initialRoot;
    private _edgeLeafProof;
    private _proofMap;
    constructor(levels: number, { edgePath, edgeElement, edgeIndex, edgeElementsCount, }: TreeEdge, leaves: Element[], { hashFunction, zeroElement }?: MerkleTreeOptions);
    get edgeIndex(): number;
    get edgeElement(): Element;
    get edgeLeafProof(): ProofPath;
    private _createProofMap;
    private _buildTree;
    private _buildHashes;
    /**
     * Change an element in the tree
     * @param {number} index Index of element to change
     * @param element Updated element value
     */
    update(index: number, element: Element): void;
    path(index: number): ProofPath;
    indexOf(element: Element, comparator?: <T>(arg0: T, arg1: T) => boolean): number;
    proof(element: Element): ProofPath;
    /**
     * Shifts edge of tree to left
     * @param edge new TreeEdge below current edge
     * @param elements leaves between old and new edge
     */
    shiftEdge(edge: TreeEdge, elements: Element[]): void;
    serialize(): SerializedPartialTreeState;
    static deserialize(data: SerializedPartialTreeState, hashFunction?: HashFunction<Element>): PartialMerkleTree;
    toString(): string;
}
