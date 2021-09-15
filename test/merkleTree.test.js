const MerkleTree = require('../src/merkleTree')
require('chai').should()

describe('MerkleTree', () => {
  describe('#constructor', () => {
    it('should have correct zero root', () => {
      const tree = new MerkleTree(10)
      return tree.root().should.equal('14030416097908897320437553787826300082392928432242046897689557706485311282736')
    })

    it('should have correct 1 element root', () => {
      const tree = new MerkleTree(10, [1])
      tree.root().should.equal('8423266420989796135179818298985240707844287090553672312129988553683991994663')
    })

    it('should have correct even elements root', () => {
      const tree = new MerkleTree(10, [1, 2])
      tree.root().should.equal('6632020347849276860492323008882350357301732786233864934344775324188835172576')
    })

    it('should have correct odd elements root', () => {
      const tree = new MerkleTree(10, [1, 2, 3])
      tree.root().should.equal('13605252518346649016266481317890801910232739395710162921320863289825142055129')
    })

    it('should be able to create a full tree', () => {
      new MerkleTree(2, [1, 2, 3, 4])
    })

    it('should fail to create tree with too many elements', () => {
      const call = () => new MerkleTree(2, [1, 2, 3, 4, 5])
      call.should.throw('Tree is full')
    })
  })

  describe('#insert', () => {
    it('should insert into empty tree', () => {
      const tree = new MerkleTree(10)
      tree.insert(42)
      tree.root().should.equal('5305397050004975530787056746976521882221645950652996479084366175595194436378')
    })

    it('should insert into odd tree', () => {
      const tree = new MerkleTree(10, [1])
      tree.insert(42)
      tree.root().should.equal('4732716818150428188641303198013632061441036732749853605989871103991103096471')
    })

    it('should insert into even tree', () => {
      const tree = new MerkleTree(10, [1, 2])
      tree.insert(42)
      tree.root().should.equal('6204016789747878948181936326719724987136198810274146408545977300318734508764')
    })

    it('should insert last element', () => {
      const tree = new MerkleTree(2, [1, 2, 3])
      tree.insert(4)
    })

    it('should fail to insert when tree is full', () => {
      const tree = new MerkleTree(2, [1, 2, 3, 4])
      const call = () => tree.insert(5)
      call.should.throw('Tree is full')
    })
  })

  describe('#bulkInsert', () => {
    it('should work', () => {
      const tree = new MerkleTree(10, [1, 2, 3])
      tree.bulkInsert([4, 5, 6])
      tree.root().should.equal('10132905325673518287563057607527946096399700874345297651940963130460267058606')
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
          tree1.root().should.equal(tree2.root())
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
      call.should.throw('Tree is full')
    })
  })

  describe('#update', () => {
    it('should update first element', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      tree.update(0, 42)
      tree.root().should.equal('153077538697962715163231177553585573790587443799974092612333826693999310199')
    })

    it('should update last element', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      tree.update(4, 42)
      tree.root().should.equal('1955192134603843666100093417117434845771298375724087600313714421260719033775')
    })

    it('should update odd element', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      tree.update(1, 42)
      tree.root().should.equal('6642888742811380760154112624880866754768235565211186414088321870395007150538')
    })

    it('should update even element', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      tree.update(2, 42)
      tree.root().should.equal('11739358667442647096377238675718917508981868161724701476635082606510350785683')
    })

    it('should update extra element', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4])
      tree.update(4, 5)
      tree.root().should.equal('6341751103515285836339987888606244815365572869367801108789753151704260302930')
    })

    it('should fail to update incorrect index', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5]);
      (() => tree.update(-1, 42)).should.throw('Insert index out of bounds: -1');
      (() => tree.update(6, 42)).should.throw('Insert index out of bounds: 6');
      (() => tree.update('qwe', 42)).should.throw('Insert index out of bounds: qwe')
    })

    it('should fail to update over capacity', () => {
      const tree = new MerkleTree(2, [1, 2, 3, 4])
      const call = () => tree.update(4, 42)
      call.should.throw('Insert index out of bounds: 4')
    })
  })

  describe('#indexOf', () => {
    it('should find index', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      tree.indexOf(3).should.equal(2)
    })

    it('should return -1 for non existent element', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      tree.indexOf(42).should.equal(-1)
    })
  })

  describe('#path', () => {
    it('should work for even index', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      const path = tree.path(2)
      path.pathIndices.should.be.deep.equal([0, 1, 0, 0, 0, 0, 0, 0, 0, 0])
      path.pathElements.should.be.deep.equal([
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
      path.pathIndices.should.be.deep.equal([1, 1, 0, 0, 0, 0, 0, 0, 0, 0])
      path.pathElements.should.be.deep.equal([
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
      const tree = new MerkleTree(10, [1, 2, 3, 4]);
      (() => tree.path(-1)).should.throw('Index out of bounds: -1');
      (() => tree.path(5)).should.throw('Index out of bounds: 5');
      (() => tree.path('qwe')).should.throw('Index out of bounds: qwe')
    })

    it('should work for correct string index', () => {
      const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
      const path = tree.path('2')
      path.pathIndices.should.be.deep.equal([0, 1, 0, 0, 0, 0, 0, 0, 0, 0])
      path.pathElements.should.be.deep.equal([
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

  describe('#serialize', () => {
    it('should work', () => {
      const src = new MerkleTree(10, [1, 2, 3])
      const data = src.serialize()
      const dst = MerkleTree.deserialize(data)

      src.root().should.equal(dst.root())

      src.insert(10)
      dst.insert(10)

      src.root().should.equal(dst.root())
    })
  })
})
