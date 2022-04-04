"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartialMerkleTree = void 0;
const simpleHash_1 = __importDefault(require("./simpleHash"));
const BaseTree_1 = require("./BaseTree");
class PartialMerkleTree extends BaseTree_1.BaseTree {
    constructor(levels, { edgePath, edgeElement, edgeIndex, edgeElementsCount, }, leaves, { hashFunction, zeroElement } = {}) {
        super();
        if (edgeIndex + leaves.length !== edgeElementsCount)
            throw new Error('Invalid number of elements');
        this._edgeLeafProof = edgePath;
        this._initialRoot = edgePath.pathRoot;
        this.zeroElement = zeroElement !== null && zeroElement !== void 0 ? zeroElement : 0;
        this._edgeLeaf = { data: edgeElement, index: edgeIndex };
        this._leavesAfterEdge = leaves;
        this.levels = levels;
        this._hashFn = hashFunction || simpleHash_1.default;
        this._createProofMap();
        this._buildTree();
    }
    get edgeIndex() {
        return this._edgeLeaf.index;
    }
    get edgeElement() {
        return this._edgeLeaf.data;
    }
    get edgeLeafProof() {
        return this._edgeLeafProof;
    }
    _createProofMap() {
        this._proofMap = this.edgeLeafProof.pathPositions.reduce((p, c, i) => {
            p.set(i, [c, this.edgeLeafProof.pathElements[i]]);
            return p;
        }, new Map());
        this._proofMap.set(this.levels, [0, this.edgeLeafProof.pathRoot]);
    }
    _buildTree() {
        const edgeLeafIndex = this._edgeLeaf.index;
        this._leaves = Array(edgeLeafIndex).concat(this._leavesAfterEdge);
        if (this._proofMap.has(0)) {
            const [proofPos, proofEl] = this._proofMap.get(0);
            this._leaves[proofPos] = proofEl;
        }
        this._layers = [this._leaves];
        this._buildZeros();
        this._buildHashes();
    }
    _buildHashes() {
        for (let layerIndex = 1; layerIndex <= this.levels; layerIndex++) {
            const nodes = this._layers[layerIndex - 1];
            const currentLayer = this._processNodes(nodes, layerIndex);
            if (this._proofMap.has(layerIndex)) {
                const [proofPos, proofEl] = this._proofMap.get(layerIndex);
                if (!currentLayer[proofPos])
                    currentLayer[proofPos] = proofEl;
            }
            this._layers[layerIndex] = currentLayer;
        }
    }
    /**
     * Change an element in the tree
     * @param {number} index Index of element to change
     * @param element Updated element value
     */
    update(index, element) {
        if (isNaN(Number(index)) || index < 0 || index > this._layers[0].length || index >= this.capacity) {
            throw new Error('Insert index out of bounds: ' + index);
        }
        if (index < this._edgeLeaf.index) {
            throw new Error(`Index ${index} is below the edge: ${this._edgeLeaf.index}`);
        }
        this._layers[0][index] = element;
        this._processUpdate(index);
    }
    path(index) {
        var _a;
        if (isNaN(Number(index)) || index < 0 || index >= this._layers[0].length) {
            throw new Error('Index out of bounds: ' + index);
        }
        if (index < this._edgeLeaf.index) {
            throw new Error(`Index ${index} is below the edge: ${this._edgeLeaf.index}`);
        }
        let elIndex = Number(index);
        const pathElements = [];
        const pathIndices = [];
        const pathPositions = [];
        for (let level = 0; level < this.levels; level++) {
            pathIndices[level] = elIndex % 2;
            const leafIndex = elIndex ^ 1;
            if (leafIndex < this._layers[level].length) {
                pathElements[level] = this._layers[level][leafIndex];
                pathPositions[level] = leafIndex;
            }
            else {
                pathElements[level] = this._zeros[level];
                pathPositions[level] = 0;
            }
            const [proofPos, proofEl] = this._proofMap.get(level);
            pathElements[level] = (_a = pathElements[level]) !== null && _a !== void 0 ? _a : (proofPos === leafIndex ? proofEl : this._zeros[level]);
            elIndex >>= 1;
        }
        return {
            pathElements,
            pathIndices,
            pathPositions,
            pathRoot: this.root,
        };
    }
    indexOf(element, comparator) {
        return BaseTree_1.BaseTree.indexOf(this._layers[0], element, this.edgeIndex, comparator);
    }
    proof(element) {
        const index = this.indexOf(element);
        return this.path(index);
    }
    /**
     * Shifts edge of tree to left
     * @param edge new TreeEdge below current edge
     * @param elements leaves between old and new edge
     */
    shiftEdge(edge, elements) {
        if (this._edgeLeaf.index <= edge.edgeIndex) {
            throw new Error(`New edgeIndex should be smaller then ${this._edgeLeaf.index}`);
        }
        if (elements.length !== (this._edgeLeaf.index - edge.edgeIndex)) {
            throw new Error(`Elements length should be ${this._edgeLeaf.index - edge.edgeIndex}`);
        }
        this._edgeLeafProof = edge.edgePath;
        this._edgeLeaf = { index: edge.edgeIndex, data: edge.edgeElement };
        this._leavesAfterEdge = [...elements, ...this._leavesAfterEdge];
        this._createProofMap();
        this._buildTree();
    }
    serialize() {
        return {
            _edgeLeafProof: this._edgeLeafProof,
            _edgeLeaf: this._edgeLeaf,
            _layers: this._layers,
            _zeros: this._zeros,
            levels: this.levels,
        };
    }
    static deserialize(data, hashFunction) {
        const instance = Object.assign(Object.create(this.prototype), data);
        instance._hashFn = hashFunction || simpleHash_1.default;
        instance._initialRoot = data._edgeLeafProof.pathRoot;
        instance.zeroElement = instance._zeros[0];
        instance._leavesAfterEdge = instance._layers[0].slice(data._edgeLeaf.index);
        instance._createProofMap();
        return instance;
    }
    toString() {
        return JSON.stringify(this.serialize());
    }
}
exports.PartialMerkleTree = PartialMerkleTree;
