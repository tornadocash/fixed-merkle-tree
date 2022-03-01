import { MerkleTree, PartialMerkleTree } from '../src'
import { it } from 'mocha'

describe('PartialMerkleTree', () => {

  describe('#constructor', () => {
    const leaves = [1, 2, 3, 4, 5]
    const fullTree = new MerkleTree(4, leaves)
    const root = fullTree.root()
    const edge = fullTree.getTreeEdge(3)
    const leavesAfterEdge = leaves.splice(edge.edgeIndex)
    it('should initialize merkle tree', () => {
      const partialTree = new PartialMerkleTree(edge, leavesAfterEdge, root)
      return true
    })
  })
})
