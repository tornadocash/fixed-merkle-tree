"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const simpleHash_1 = __importDefault(require("./simpleHash"));
const BaseTree_1 = require("./BaseTree");
class MerkleTree extends BaseTree_1.BaseTree {
    constructor(levels, elements = [], { hashFunction = simpleHash_1.default, zeroElement = 0, } = {}) {
        super();
        this.levels = levels;
        if (elements.length > this.capacity) {
            throw new Error('Tree is full');
        }
        this._hashFn = hashFunction;
        this.zeroElement = zeroElement;
        this._layers = [];
        const leaves = elements.slice();
        this._layers = [leaves];
        this._buildZeros();
        this._buildHashes();
    }
    _buildHashes() {
        for (let layerIndex = 1; layerIndex <= this.levels; layerIndex++) {
            const nodes = this._layers[layerIndex - 1];
            this._layers[layerIndex] = this._processNodes(nodes, layerIndex);
        }
    }
    /**
     * Insert multiple elements into the tree.
     * @param {Array} elements Elements to insert
     */
    bulkInsert(elements) {
        if (!elements.length) {
            return;
        }
        if (this._layers[0].length + elements.length > this.capacity) {
            throw new Error('Tree is full');
        }
        // First we insert all elements except the last one
        // updating only full subtree hashes (all layers where inserted element has odd index)
        // the last element will update the full path to the root making the tree consistent again
        for (let i = 0; i < elements.length - 1; i++) {
            this._layers[0].push(elements[i]);
            let level = 0;
            let index = this._layers[0].length - 1;
            while (index % 2 === 1) {
                level++;
                index >>= 1;
                this._layers[level][index] = this._hashFn(this._layers[level - 1][index * 2], this._layers[level - 1][index * 2 + 1]);
            }
        }
        this.insert(elements[elements.length - 1]);
    }
    indexOf(element, comparator) {
        return BaseTree_1.BaseTree.indexOf(this._layers[0], element, 0, comparator);
    }
    proof(element) {
        const index = this.indexOf(element);
        return this.path(index);
    }
    getTreeEdge(edgeIndex) {
        const edgeElement = this._layers[0][edgeIndex];
        if (edgeElement === undefined) {
            throw new Error('Element not found');
        }
        const edgePath = this.path(edgeIndex);
        return { edgePath, edgeElement, edgeIndex, edgeElementsCount: this._layers[0].length };
    }
    /**
     * 🪓
     * @param count
     */
    getTreeSlices(count = 4) {
        const length = this._layers[0].length;
        let size = Math.ceil(length / count);
        if (size % 2)
            size++;
        const slices = [];
        for (let i = 0; i < length; i += size) {
            const edgeLeft = i;
            const edgeRight = i + size;
            slices.push({ edge: this.getTreeEdge(edgeLeft), elements: this.elements.slice(edgeLeft, edgeRight) });
        }
        return slices;
    }
    /**
     * Serialize entire tree state including intermediate layers into a plain object
     * Deserializing it back will not require to recompute any hashes
     * Elements are not converted to a plain type, this is responsibility of the caller
     */
    serialize() {
        return {
            levels: this.levels,
            _zeros: this._zeros,
            _layers: this._layers,
        };
    }
    /**
     * Deserialize data into a MerkleTree instance
     * Make sure to provide the same hashFunction as was used in the source tree,
     * otherwise the tree state will be invalid
     */
    static deserialize(data, hashFunction) {
        const instance = Object.assign(Object.create(this.prototype), data);
        instance._hashFn = hashFunction || simpleHash_1.default;
        instance.zeroElement = instance._zeros[0];
        return instance;
    }
    toString() {
        return JSON.stringify(this.serialize());
    }
}
exports.default = MerkleTree;
