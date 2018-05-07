var assert = require('assert')
const Controller = require('../controller')

describe('index', function() {
  describe('#verifySolution()', function() {
    it('Return true for a correct nonce', function() {
      const controller = new Controller()
      const puzzle = {
        version: 2,
        prevBlockhash: "00000000000008a3a41b85b8b29ad444def299fee21793cd8b9e567eab02cd81",
        merkleRoot: "2b12fcf1b09288fcaff797d71e950e71ae42b91e8bdb2304758dfcffc2b620e3",
        timestamp: 1305998791,
        difficultyTarget: 17,
      }
      assert(controller.verifySolution(puzzle, 2504433986))
    })
  })
})
