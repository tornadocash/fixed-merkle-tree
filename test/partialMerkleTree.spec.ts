import { Element, MerkleTree, PartialMerkleTree } from '../src'
import { it } from 'mocha'
import { should } from 'chai'

describe('PartialMerkleTree', () => {
  const getTestTrees = (levels: number, elements: Element[], edgeElement: Element) => {
    const fullTree = new MerkleTree(levels, elements)
    const edge = fullTree.getTreeEdge(edgeElement)
    const leavesAfterEdge = elements.slice(edge.edgeIndex)
    const partialTree = new PartialMerkleTree(levels, edge, leavesAfterEdge, fullTree.root)
    return { fullTree, partialTree }
  }
  describe('#constructor', () => {
    const { fullTree, partialTree } = getTestTrees(20, ['0', '1', '2', '3', '4', '5'], '2')
    it('should initialize merkle tree with same root', () => {
      should().equal(fullTree.root, partialTree.root)
    })

    it('should initialize merkle tree with same leaves count', () => {
      should().equal(fullTree.elements.length, partialTree.elements.length)
    })
  })

  describe('#insert', () => {

    it('should have equal root to full tree after insertion ', () => {
      const { fullTree, partialTree } = getTestTrees(10, ['0', '1', '2', '3', '4', '5', '6', '7'], '5')
      fullTree.insert('9')
      partialTree.insert('9')
      should().equal(fullTree.root, partialTree.root)
    })

    it('should fail to insert when tree is full', () => {
      const { partialTree } = getTestTrees(3, ['0', '1', '2', '3', '4', '5', '6', '7', '8'], '5')
      const call = () => partialTree.insert('9')
      should().throw(call, 'Tree is full')
    })
  })

  describe('#bulkInsert', () => {

    it('should work like full tree', () => {
      const { fullTree, partialTree } = getTestTrees(20, [1, 2, 3, 4, 5], 3)
      partialTree.bulkInsert([6, 7, 8])
      fullTree.bulkInsert([6, 7, 8])
      should().equal(fullTree.root, partialTree.root)
    })

    it('should give the same result as sequential inserts', () => {
      const initialArray = [
        [1],
        [1, 2],
        [1, 2, 3],
        [1, 2, 3, 4],
      ]
      const insertedArray = [
        [11],
        [11, 12],
        [11, 12, 13],
        [11, 12, 13, 14],
      ]
      for (const initial of initialArray) {
        for (const inserted of insertedArray) {
          const { partialTree: tree1 } = getTestTrees(10, initial, initial.length > 1 ? initial.length - 1 : initial.length)
          const { partialTree: tree2 } = getTestTrees(10, initial, initial.length > 1 ? initial.length - 1 : initial.length)
          tree1.bulkInsert(inserted)
          for (const item of inserted) {
            tree2.insert(item)
          }
          should().equal(tree1.root, tree2.root)
        }
      }
    }).timeout(10000)

    it('should fail to insert too many elements', () => {
      const { fullTree, partialTree } = getTestTrees(2, [1, 2, 3, 4], 3)
      const call = () => partialTree.bulkInsert([5, 6, 7])
      should().throw(call, 'Tree is full')
    })

  })

  describe('#indexOf', () => {
    it('should return same result as full tree', () => {
      const { fullTree, partialTree } = getTestTrees(10, [1, 2, 3, 4, 5, 6, 7, 8], 4)
      should().equal(partialTree.indexOf(5), fullTree.indexOf(5))
    })

    it('should find index', () => {
      const { partialTree } = getTestTrees(10, [1, 2, 3, 4, 5], 3)
      should().equal(partialTree.indexOf(3), 2)
    })

    it('should work with comparator', () => {
      const { partialTree } = getTestTrees(10, [1, 2, 3, 4, 5], 3)
      should().equal(partialTree.indexOf(4, (arg0, arg1) => arg0 === arg1), 3)
    })

    it('should return -1 for non existent element', () => {
      const { partialTree } = getTestTrees(10, [1, 2, 3, 4, 5], 3)
      should().equal(partialTree.indexOf(42), -1)
    })
  })
})

