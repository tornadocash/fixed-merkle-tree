import { Element, HashFunction, ProofPath, MultiProofPath } from './';
export declare class BaseTree {
    levels: number;
    protected _hashFn: HashFunction<Element>;
    protected zeroElement: Element;
    protected _zeros: Element[];
    protected _layers: Array<Element[]>;
    get capacity(): number;
    get layers(): Array<Element[]>;
    get zeros(): Element[];
    get elements(): Element[];
    get root(): Element;
    /**
     * Find an element in the tree
     * @param elements elements of tree
     * @param element An element to find
     * @param comparator A function that checks leaf value equality
     * @param fromIndex The index to start the search at. If the index is greater than or equal to the array's length, -1 is returned
     * @returns {number} Index if element is found, otherwise -1
     */
    static indexOf(elements: Element[], element: Element, fromIndex?: number, comparator?: <T>(arg0: T, arg1: T) => boolean): number;
    /**
     * Insert new element into the tree
     * @param element Element to insert
     */
    insert(element: Element): void;
    bulkInsert(elements: Element[]): void;
    /**
     * Change an element in the tree
     * @param {number} index Index of element to change
     * @param element Updated element value
     */
    update(index: number, element: Element): void;
    /**
     * Get merkle path to a leaf
     * @param {number} index Leaf index to generate path for
     * @returns {{pathElements: Object[], pathIndex: number[]}} An object containing adjacent elements and left-right index
     */
    path(index: number): ProofPath;
    /**
     * Return the indices for the next layer in the multiPath calculation
     * @param {number} indices A list of leaf indices
     * @returns {number[]} the new list of indices
     */
    static nextLayerMultiPathIndices(indices: number[]): number[];
    /**
     * Get merkle path to a list of leaves
     * @param {number} indices A list of leaf indices to generate path for
     * @returns {{pathElements: Element[], leafIndices: number[]}} An object containing adjacent elements and leaves indices
     */
    multiPath(indices: number[]): MultiProofPath;
    /**
     * Verifies a merkle proof
     * @param {Element} root the root of the merkle tree
     * @param {number} levels the number of levels of the tree
     * @param {HashFunction<Element>} hashFn hash function
     * @param {Element} leaf the leaf to be verified
     * @param {Element[]} pathElements adjacent path elements
     * @param {number[]} pathIndices left-right indices
     * @returns {Boolean} whether the proof is valid for the given root
     */
    static verifyProof(root: Element, levels: number, hashFn: HashFunction<Element>, leaf: Element, pathElements: Element[], pathIndices: number[]): boolean;
    /**
     * Verifies a merkle multiproof
     * @param {Element} root the root of the merkle tree
     * @param {number} levels the number of levels of the tree
     * @param {HashFunction<Element>} hashFn hash function
     * @param {Element[]} leaves the list of leaves to be verified
     * @param {Element[]} pathElements multiproof path elements
     * @param {number[]} leafIndices multiproof leaf indices
     * @returns {Boolean} whether the proof is valid for the given root
     */
    static verifyMultiProof(root: Element, levels: number, hashFn: HashFunction<Element>, leaves: Element[], pathElements: Element[], leafIndices: number[]): boolean;
    protected _buildZeros(): void;
    protected _processNodes(nodes: Element[], layerIndex: number): any[];
    protected _processUpdate(index: number): void;
}
