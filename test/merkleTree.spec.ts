import MerkleTree from '../src'
import { assert, should } from 'chai'
import { it } from 'mocha'

describe('MerkleTree', () => {

  describe('#constructor', () => {

    it('should have correct zero root', () => {
      const tree = new MerkleTree(10, [])
      return should().equal(tree.root(), '14030416097908897320437553787826300082392928432242046897689557706485311282736')
    })

    it('should have correct 1 element root', () => {
      const tree = new MerkleTree(10, [1])
      should().equal(tree.root(), '8423266420989796135179818298985240707844287090553672312129988553683991994663')
    })

    it('should have correct even elements root', () => {
      const tree = new MerkleTree(10, [1, 2])
      should().equal(tree.root(), '6632020347849276860492323008882350357301732786233864934344775324188835172576')
    })

    it('should have correct odd elements root', () => {
      const tree = new MerkleTree(10, [1, 2, 3])
      should().equal(tree.root(), '13605252518346649016266481317890801910232739395710162921320863289825142055129')
    })

    it('should be able to create a full tree', () => {
      new MerkleTree(2, [1, 2, 3, 4])
    })

    it('should fail to create tree with too many elements', () => {
      const call = () => new MerkleTree(2, [1, 2, 3, 4, 5])
      should().throw(call, 'Tree is full')
    })
  })

  describe('#insert', () => {
    it('should insert into empty tree', () => {
      const tree = new MerkleTree(10)
      tree.insert(42)
      should().equal(tree.root(), '5305397050004975530787056746976521882221645950652996479084366175595194436378')
    })

    it('should insert into odd tree', () => {
      const tree = new MerkleTree(10, [1])
      tree.insert(42)
      should().equal(tree.root(), '4732716818150428188641303198013632061441036732749853605989871103991103096471')
    })

    it('should insert into even tree', () => {
      const tree = new MerkleTree(10, [1, 2])
      tree.insert(42)
      should().equal(tree.root(), '6204016789747878948181936326719724987136198810274146408545977300318734508764')
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
      should().equal(tree.root(), '10132905325673518287563057607527946096399700874345297651940963130460267058606')
    })

    it('should give the same result as sequental inserts', () => {
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
          should().equal(tree1.root(), tree2.root())
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
  })

  describe('#update', () => {
    it('should update first element', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      tree.update(0, 42)
      should().equal(tree.root(), '153077538697962715163231177553585573790587443799974092612333826693999310199')
    })

    it('should update last element', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      tree.update(4, 42)
      should().equal(tree.root(), '1955192134603843666100093417117434845771298375724087600313714421260719033775')
    })

    it('should update odd element', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      tree.update(1, 42)
      should().equal(tree.root(), '6642888742811380760154112624880866754768235565211186414088321870395007150538')
    })

    it('should update even element', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      tree.update(2, 42)
      should().equal(tree.root(), '11739358667442647096377238675718917508981868161724701476635082606510350785683')
    })

    it('should update extra element', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4])
      tree.update(4, 5)
      should().equal(tree.root(), '6341751103515285836339987888606244815365572869367801108789753151704260302930')
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
        '19814528709687996974327303300007262407299502847885145507292406548098437687919',
        '21305827034995891902714687670641862055126514524916463201449278400604999416145',
        '14506027710748750947258687001455876266559341618222612722926156490737302846427',
        '4766583705360062980279572762279781527342845808161105063909171241304075622345',
        '16640205414190175414380077665118269450294358858897019640557533278896634808665',
        '13024477302430254842915163302704885770955784224100349847438808884122720088412',
        '11345696205391376769769683860277269518617256738724086786512014734609753488820',
        '17235543131546745471991808272245772046758360534180976603221801364506032471936',
        '155962837046691114236524362966874066300454611955781275944230309195800494087',
      ])
    })

    it('should work for odd index', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      const path = tree.path(3)
      assert.deepEqual(path.pathIndices, [1, 1, 0, 0, 0, 0, 0, 0, 0, 0])
      assert.deepEqual(path.pathElements, [
        3,
        '19814528709687996974327303300007262407299502847885145507292406548098437687919',
        '21305827034995891902714687670641862055126514524916463201449278400604999416145',
        '14506027710748750947258687001455876266559341618222612722926156490737302846427',
        '4766583705360062980279572762279781527342845808161105063909171241304075622345',
        '16640205414190175414380077665118269450294358858897019640557533278896634808665',
        '13024477302430254842915163302704885770955784224100349847438808884122720088412',
        '11345696205391376769769683860277269518617256738724086786512014734609753488820',
        '17235543131546745471991808272245772046758360534180976603221801364506032471936',
        '155962837046691114236524362966874066300454611955781275944230309195800494087',
      ])
    })

    it('should fail on incorrect index', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4])
      should().throw((() => tree.path(-1)), 'Index out of bounds: -1')
      should().throw((() => tree.path(5)), 'Index out of bounds: 5')
      should().throw((() => tree.path('qwe')), 'Index out of bounds: qwe')
    })

    it('should work for correct string index', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      const path = tree.path('2')
      assert.deepEqual(path.pathIndices, [0, 1, 0, 0, 0, 0, 0, 0, 0, 0])
      assert.deepEqual(path.pathElements, [
        4,
        '19814528709687996974327303300007262407299502847885145507292406548098437687919',
        '21305827034995891902714687670641862055126514524916463201449278400604999416145',
        '14506027710748750947258687001455876266559341618222612722926156490737302846427',
        '4766583705360062980279572762279781527342845808161105063909171241304075622345',
        '16640205414190175414380077665118269450294358858897019640557533278896634808665',
        '13024477302430254842915163302704885770955784224100349847438808884122720088412',
        '11345696205391376769769683860277269518617256738724086786512014734609753488820',
        '17235543131546745471991808272245772046758360534180976603221801364506032471936',
        '155962837046691114236524362966874066300454611955781275944230309195800494087',
      ])
    })
  })

  describe('#getters', () => {
    const elements = [1, 2, 3, 4, 5]
    const layers = [
      [1, 2, 3, 4, 5],
      [
        '19814528709687996974327303300007262407299502847885145507292406548098437687919',
        '9256022917525827637821171443533757190340579068025270193352322268529570863974',
        '21652272025144185891702495507858700052653521882982711576347377471507927142323',
      ],
      [
        '6464294476958346139385024074008223400825166653076969388043746597957512245037',
        '21305827034995891902714687670641862055126514524916463201449278400604999416145',
      ],
      ['13482485030738390475684870940688026655293260583748749623167469686138055064771'],
      ['5734482689596254215043546232260442114954448597263096309106433719494772338840'],
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
  })

  describe('#serialize', () => {
    it('should work', () => {
      const src = new MerkleTree(10, [1, 2, 3, 4, 5, 6, 7, 8, 9])
      const data = src.serialize()
      const dst = MerkleTree.deserialize(data)
      should().equal(src.root(), dst.root())

      src.insert(10)
      dst.insert(10)

      should().equal(src.root(), dst.root())
    })
  })
})
