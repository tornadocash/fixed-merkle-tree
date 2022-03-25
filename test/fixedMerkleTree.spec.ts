import { MerkleTree, PartialMerkleTree, TreeEdge } from '../src'
import { assert, should } from 'chai'
import { createHash } from 'crypto'
import { it } from 'mocha'

const sha256Hash = (left, right) => createHash('sha256').update(`${left}${right}`).digest('hex')
const ZERO_ELEMENT = '21663839004416932945382355908790599225266501822907911457504978515578255421292'

describe('MerkleTree', () => {

  describe('#constructor', () => {

    it('should have correct zero root', () => {
      const tree = new MerkleTree(10, [])
      return should().equal(tree.root, '3060353338620102847451617558650138132480')
    })

    it('should have correct 1 element root', () => {
      const tree = new MerkleTree(10, [1])
      should().equal(tree.root, '4059654748770657324723044385589999697920')
    })

    it('should have correct even elements root', () => {
      const tree = new MerkleTree(10, [1, 2])
      should().equal(tree.root, '3715471817149864798706576217905179918336')
    })

    it('should have correct odd elements root', () => {
      const tree = new MerkleTree(10, [1, 2, 3])
      should().equal(tree.root, '5199180210167621115778229238102210117632')
    })

    it('should be able to create a full tree', () => {
      new MerkleTree(2, [1, 2, 3, 4])
    })

    it('should fail to create tree with too many elements', () => {
      const call = () => new MerkleTree(2, [1, 2, 3, 4, 5])
      should().throw(call, 'Tree is full')
    })

    it('should work with optional hash function and zero element', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5, 6], { hashFunction: sha256Hash, zeroElement: 'zero' })
      should().equal(tree.root, 'a377b9fa0ed41add83e56f7e1d0e2ebdb46550b9d8b26b77dece60cb67283f19')
    })
  })

  describe('#insert', () => {
    it('should insert into empty tree', () => {
      const tree = new MerkleTree(10)
      tree.insert(42)
      should().equal(tree.root, '750572848877730275626358141391262973952')
    })

    it('should insert into odd tree', () => {
      const tree = new MerkleTree(10, [1])
      tree.insert(42)
      should().equal(tree.root, '5008383558940708447763798816817296703488')
    })

    it('should insert into even tree', () => {
      const tree = new MerkleTree(10, [1, 2])
      tree.insert(42)
      should().equal(tree.root, '5005864318873356880627322373636156817408')
    })

    it('should insert last element', () => {
      const tree = new MerkleTree(2, [1, 2, 3])
      tree.insert(4)
    })

    it('should fail to insert when tree is full', () => {
      const tree = new MerkleTree(2, [1, 2, 3, 4])
      const call = () => tree.insert(5)
      should().throw(call, 'Tree is full')
    })
  })

  describe('#bulkInsert', () => {
    it('should work', () => {
      const tree = new MerkleTree(10, [1, 2, 3])
      tree.bulkInsert([4, 5, 6])
      should().equal(tree.root, '4066635800770511602067209448381558554624')
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
          const tree1 = new MerkleTree(10, initial)
          const tree2 = new MerkleTree(10, initial)
          tree1.bulkInsert(inserted)
          for (const item of inserted) {
            tree2.insert(item)
          }
          should().equal(tree1.root, tree2.root)
        }
      }
    }).timeout(10000)

    it('should work with max elements', () => {
      const tree = new MerkleTree(2, [1, 2])
      tree.bulkInsert([3, 4])
    })

    it('should fail to insert too many elements', () => {
      const tree = new MerkleTree(2, [1, 2])
      const call = () => tree.bulkInsert([3, 4, 5])
      should().throw(call, 'Tree is full')
    })

    it('should bypass empty elements', () => {
      const elements = [1, 2, 3, 4]
      const tree = new MerkleTree(2, elements)
      tree.bulkInsert([])
      assert.deepEqual(tree.elements, elements, 'No elements inserted')
    })
  })

  describe('#update', () => {
    it('should update first element', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      tree.update(0, 42)
      should().equal(tree.root, '3884161948856565981263417078389340635136')
    })

    it('should update last element', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      tree.update(4, 42)
      should().equal(tree.root, '3564959811529894228734180300843252711424')
    })

    it('should update odd element', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      tree.update(1, 42)
      should().equal(tree.root, '4576704573778433422699674477203122290688')
    })

    it('should update even element', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      tree.update(2, 42)
      should().equal(tree.root, '1807994110952186123819489133812038762496')
    })

    it('should update extra element', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4])
      tree.update(4, 5)
      should().equal(tree.root, '1099080610107164849381389194938128793600')
    })

    it('should fail to update incorrect index', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      should().throw((() => tree.update(-1, 42)), 'Insert index out of bounds: -1')
      should().throw((() => tree.update(6, 42)), 'Insert index out of bounds: 6')
      // @ts-ignore
      should().throw((() => tree.update('qwe', 42)), 'Insert index out of bounds: qwe')
    })

    it('should fail to update over capacity', () => {
      const tree = new MerkleTree(2, [1, 2, 3, 4])
      const call = () => tree.update(4, 42)
      should().throw(call, 'Insert index out of bounds: 4')
    })
  })

  describe('#indexOf', () => {
    it('should find index', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      should().equal(tree.indexOf(3), 2)
    })

    it('should work with comparator', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      should().equal(tree.indexOf(4, (arg0, arg1) => arg0 === arg1), 3)
    })

    it('should return -1 for non existent element', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      should().equal(tree.indexOf(42), -1)
    })
  })

  describe('#path', () => {
    it('should work for even index', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      const path = tree.path(2)
      assert.deepEqual(path.pathIndices, [0, 1, 0, 0, 0, 0, 0, 0, 0, 0])
      assert.deepEqual(path.pathElements, [
        4,
        '4027992409016347597424110157229339967488',
        '3591172241203040147397382471352592629760',
        '938972308169430750202858820582946897920',
        '3743880566844110745576746962917825445888',
        '2074434463882483178614385966084599578624',
        '2808856778596740691845240322870189490176',
        '4986731814143931240516913804278285467648',
        '1918547053077726613961101558405545328640',
        '5444383861051812288142814494928935059456',

      ])
    })

    it('should work for odd index', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      const path = tree.path(3)
      assert.deepEqual(path.pathIndices, [1, 1, 0, 0, 0, 0, 0, 0, 0, 0])
      assert.deepEqual(path.pathElements, [
        3,
        '4027992409016347597424110157229339967488',
        '3591172241203040147397382471352592629760',
        '938972308169430750202858820582946897920',
        '3743880566844110745576746962917825445888',
        '2074434463882483178614385966084599578624',
        '2808856778596740691845240322870189490176',
        '4986731814143931240516913804278285467648',
        '1918547053077726613961101558405545328640',
        '5444383861051812288142814494928935059456',
      ])
    })

    it('should fail on incorrect index', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4])
      should().throw((() => tree.path(-1)), 'Index out of bounds: -1')
      should().throw((() => tree.path(5)), 'Index out of bounds: 5')
      // @ts-ignore
      should().throw((() => tree.path('qwe')), 'Index out of bounds: qwe')
    })

    it('should work for correct string index', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      // @ts-ignore
      const path = tree.path('2')
      assert.deepEqual(path.pathIndices, [0, 1, 0, 0, 0, 0, 0, 0, 0, 0])
      assert.deepEqual(path.pathElements, [
        4,
        '4027992409016347597424110157229339967488',
        '3591172241203040147397382471352592629760',
        '938972308169430750202858820582946897920',
        '3743880566844110745576746962917825445888',
        '2074434463882483178614385966084599578624',
        '2808856778596740691845240322870189490176',
        '4986731814143931240516913804278285467648',
        '1918547053077726613961101558405545328640',
        '5444383861051812288142814494928935059456',

      ])
    })
  })
  describe('#proof', () => {
    it('should return proof for leaf', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      assert.deepEqual(tree.proof(4), tree.path(3))
    })
  })

  describe('#getTreeEdge', () => {
    it('should return correct treeEdge', () => {
      const expectedEdge: TreeEdge = {
        edgePath: {
          pathElements: [
            5,
            '1390935134112885103361924701261056180224',
            '1952916572242076545231119328171167580160',
            '938972308169430750202858820582946897920',
          ],
          pathIndices: [0, 0, 1, 0],
          pathPositions: [5, 0, 0, 0],
          pathRoot: '3283298202329284319899364273680487022592',
        },
        edgeElement: 4,
        edgeIndex: 4,
        edgeElementsCount: 6,
      }
      const tree = new MerkleTree(4, [0, 1, 2, 3, 4, 5])
      assert.deepEqual(tree.getTreeEdge(4), expectedEdge)
    })
    it('should fail if element not found', () => {
      const tree = new MerkleTree(4, [0, 1, 2, 3, 4, 5])
      const call = () => tree.getTreeEdge(6)
      should().throw(call, 'Element not found')
    })
  })
  describe('#getTreeSlices', () => {
    let fullTree: MerkleTree
    before(async () => {
      const elements = Array.from({ length: 2 ** 10 }, (_, i) => i)
      fullTree = new MerkleTree(10, elements)
      return Promise.resolve()
    })
    it('should return correct slices count', () => {
      const count = 4
      const slicesCount = fullTree.getTreeSlices(4).length
      should().equal(count, slicesCount)
    }).timeout(10000)

    it('should be able to create partial tree from last slice', () => {
      const [, , , lastSlice] = fullTree.getTreeSlices()
      const partialTree = new PartialMerkleTree(10, lastSlice.edge, lastSlice.elements)
      assert.deepEqual(fullTree.root, partialTree.root)
    }).timeout(10000)

    it('should be able to build full tree from slices', () => {
      const slices = fullTree.getTreeSlices()
      const lastSlice = slices.pop()
      const partialTree = new PartialMerkleTree(10, lastSlice.edge, lastSlice.elements)
      slices.reverse().forEach(({ edge, elements }) => {
        partialTree.shiftEdge(edge, elements)
      })
      assert.deepEqual(fullTree.layers, partialTree.layers)
    }).timeout(10000)

    it('should return same path', () => {
      const slices = fullTree.getTreeSlices()
      const lastSlice = slices.pop()
      const partialTree = new PartialMerkleTree(10, lastSlice.edge, lastSlice.elements)
      slices.reverse().forEach(({ edge, elements }) => {
        partialTree.shiftEdge(edge, elements)
      })
      assert.deepEqual(fullTree.path(100), partialTree.path(100))
    }).timeout(10000)

    it('should throw if invalid number of elements', () => {
      const [firstSlice] = fullTree.getTreeSlices()
      const call = () => new PartialMerkleTree(10, firstSlice.edge, firstSlice.elements)
      should().throw(call, 'Invalid number of elements')
    }).timeout(10000)
  })
  describe('#getters', () => {
    const elements = [1, 2, 3, 4, 5]
    const layers = [
      [1, 2, 3, 4, 5],
      [
        '4027992409016347597424110157229339967488',
        '923221781152860005594997320673730232320',
        '752191049236692618445397735417537626112',

      ],
      [
        '81822854828781486047086122479545722339328',
        '3591172241203040147397382471352592629760',

      ],
      ['2729943778107054496417267081388406865920'],
      ['4562739390655416913642128116127918718976'],
    ]

    it('should return same elements in array', () => {
      const tree = new MerkleTree(10, elements)
      assert.deepEqual(tree.elements, elements)
    })
    it('should return copy of elements array', () => {
      const tree = new MerkleTree(10, elements)
      const elements1 = tree.elements
      tree.insert(6)
      const elements2 = tree.elements
      should().not.equal(elements1, elements2)
    })

    it('should return same layers in array', () => {
      const tree = new MerkleTree(4, elements)
      assert.deepEqual(tree.layers, layers)
    })
    it('should return copy of elements array', () => {
      const tree = new MerkleTree(4, elements)
      const layers1 = tree.layers
      tree.insert(6)
      const layers2 = tree.layers
      should().not.equal(layers1, layers2)
    })
    it('should return correct zeros array', () => {
      const zeros = [
        0,
        '1390935134112885103361924701261056180224',
        '3223901263414086620636498663535535980544',
        '938972308169430750202858820582946897920',
        '3743880566844110745576746962917825445888',
      ]
      const tree = new MerkleTree(4, [])
      assert.deepEqual(tree.zeros, zeros, 'Not equal')
    })
    it('should return copy of zeros array', () => {
      const tree = new MerkleTree(4, [])
      const zeros1 = tree.zeros
      tree.insert(6)
      const zeros2 = tree.zeros
      should().not.equal(zeros1, zeros2)
    })
  })

  describe('#serialize', () => {
    it('should work', () => {
      const src = new MerkleTree(10, [1, 2, 3, 4, 5, 6, 7, 8, 9])
      const data = src.serialize()
      const dst = MerkleTree.deserialize(data)
      should().equal(src.root, dst.root)

      src.insert(10)
      dst.insert(10)

      should().equal(src.root, dst.root)
    })
  })
  describe('#toString', () => {
    it('should return correct stringified representation', () => {
      const src = new MerkleTree(10, [1, 2, 3, 4, 5, 6, 7, 8, 9])
      const str = src.toString()
      const dst = MerkleTree.deserialize(JSON.parse(str))
      should().equal(src.root, dst.root)

      src.insert(10)
      dst.insert(10)

      should().equal(src.root, dst.root)

    })
  })
})
