import { Element, HashFunction, MerkleTreeOptions, ProofPath, SerializedTreeState, TreeEdge, TreeSlice } from './';
import { BaseTree } from './BaseTree';
export default class MerkleTree extends BaseTree {
    constructor(levels: number, elements?: Element[], { hashFunction, zeroElement, }?: MerkleTreeOptions);
    private _buildHashes;
    /**
     * Insert multiple elements into the tree.
     * @param {Array} elements Elements to insert
     */
    bulkInsert(elements: Element[]): void;
    indexOf(element: Element, comparator?: <T>(arg0: T, arg1: T) => boolean): number;
    proof(element: Element): ProofPath;
    getTreeEdge(edgeIndex: number): TreeEdge;
    /**
     * 🪓
     * @param count
     */
    getTreeSlices(count?: number): TreeSlice[];
    /**
     * Serialize entire tree state including intermediate layers into a plain object
     * Deserializing it back will not require to recompute any hashes
     * Elements are not converted to a plain type, this is responsibility of the caller
     */
    serialize(): SerializedTreeState;
    /**
     * Deserialize data into a MerkleTree instance
     * Make sure to provide the same hashFunction as was used in the source tree,
     * otherwise the tree state will be invalid
     */
    static deserialize(data: SerializedTreeState, hashFunction?: HashFunction<Element>): MerkleTree;
    toString(): string;
}
