import { Element, HashFunction, ProofPath } from './';
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
     * @param element An element to find
     * @param comparator A function that checks leaf value equality
     * @returns {number} Index if element is found, otherwise -1
     */
    indexOf(element: Element, comparator?: <T>(arg0: T, arg1: T) => boolean): number;
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
    proof(element: Element): ProofPath;
    /**
     * Get merkle path to a leaf
     * @param {number} index Leaf index to generate path for
     * @returns {{pathElements: Object[], pathIndex: number[]}} An object containing adjacent elements and left-right index
     */
    path(index: number): ProofPath;
    protected _buildZeros(): void;
    protected _processNodes(nodes: Element[], layerIndex: number): any[];
    protected _processUpdate(index: number): void;
}
