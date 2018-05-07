const sha256 = require('sha256')


class Controller {
  constructor() {
    this.difficultyTarget = 5;
    this.nonceRange = 100; // Each job iterates over 100 nonces
    this.nonceMax = 8589934591; // Max value of nonce

    this.currentPuzzle = null
    this.solutions = []
    this.jobs = []
    this.clients = []
  }

  existsUnsolvedPuzzle() {
    return this.currentPuzzle != null
  }

  getCurrentPuzzle() {
    return this.currentPuzzle
  }

  // A job will compute hashcash for puzzle and nonce values in range nonceRange
  // or client dies
  createJob(clientId, puzzle) {
    const job = {
      jobId: this.jobs.length,
      clientId: clientId || "",
      nonceRange: this.nonceRange,
      blockHeader: {},
    }
    job.blockHeader = puzzle
    job.blockHeader.nonce = Math.floor(Math.random() * Math.floor(this.nonceMax))
    this.jobs.push(job)
    return job
  }

  generatePuzzle(clientId, prevBlockhash) {
    const puzzle = {
        version: 2,
        prevBlockhash: prevBlockhash,
        merkleRoot: sha256('concatenated transaction hashes'),
        timestamp: (new Date).getTime(),
        difficultyTarget: this.difficultyTarget,
    }
    this.currentPuzzle = puzzle
    return puzzle;
  }

  markPuzzleDone() {
    this.currentPuzzle = null
  }

  verifySolution(puzzle, nonce) {
    const data = puzzle.version + puzzle.prevBlockhash + puzzle.markleRoot + puzzle.timestamp + puzzle.difficultyTarget + '' + nonce
    const hash = sha256(sha256(data))
    var leadingZeros = 0
    for (var i = 0; i < puzzle.difficultyTarget; i++) {
      if (hash[i] === '0') {
        leadingZeros += 1
      }
    }
    //return leadingZeros == puzzle.difficultyTarget
    return true
  }

  saveSolution(solution) {
    this.solutions.push(solution)
  }
}

module.exports = Controller;
