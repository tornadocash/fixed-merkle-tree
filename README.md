# Merkle Tree [![GitHub Workflow Status](https://img.shields.io/github/workflow/status/tornadocash/fixed-merkle-tree/build)](https://github.com/tornadocash/fixed-merkle-tree/actions) [![npm](https://img.shields.io/npm/v/fixed-merkle-tree)](https://www.npmjs.com/package/fixed-merkle-tree)

This is a fixed depth merkle tree implementation with sequential inserts

## Usage

```javascript
import { MerkleTree, PartialMerkleTree } from 'fixed-merkle-tree'

const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
tree.insert(6)
tree.update(3, 42)
const path = tree.proof(3)
console.log(path)
// output
{
  pathElements: [
    42,
    '4027992409016347597424110157229339967488',
    '2008015086710634950773855228781840564224',
    '938972308169430750202858820582946897920',
    '3743880566844110745576746962917825445888',
    '2074434463882483178614385966084599578624',
    '2808856778596740691845240322870189490176',
    '4986731814143931240516913804278285467648',
    '1918547053077726613961101558405545328640',
    '5444383861051812288142814494928935059456'
  ],
  pathIndices: [
      0, 1, 0, 0, 0,
      0, 0, 0, 0, 0
    ],
  pathPositions: [
      3, 0, 1, 0, 0,
      0, 0, 0, 0, 0
    ],
  pathRoot: '3917789723822252567979048877718291611648'
}

const treeEdge = tree.getTreeEdge(2)
const partialTree = new PartialMerkleTree(10, treeEdge, tree.elements.slice(treeEdge.edgeIndex))
console.log(partialTree.elements)
//  [<2 empty items >, 3, 42, 5, 6]

const proofPath = partialTree.proof(3)
console.log(proofPath)
// output
{
  pathElements: [
    42,
    '4027992409016347597424110157229339967488',
    '2008015086710634950773855228781840564224',
    '938972308169430750202858820582946897920',
    '3743880566844110745576746962917825445888',
    '2074434463882483178614385966084599578624',
    '2808856778596740691845240322870189490176',
    '4986731814143931240516913804278285467648',
    '1918547053077726613961101558405545328640',
    '5444383861051812288142814494928935059456'
  ],
  pathIndices: [
    0, 1, 0, 0, 0,
    0, 0, 0, 0, 0
  ],
  pathPositions: [
    3, 0, 1, 0, 0,
    0, 0, 0, 0, 0
  ],
  pathRoot: '3917789723822252567979048877718291611648'
}

```
