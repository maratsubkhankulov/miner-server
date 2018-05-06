const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const sha256 = require('sha256')
const assert = require('assert')
const { Pool } = require('pg')
const PORT = process.env.PORT || 5000

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
})

const bodyParser = require('body-parser')

const difficultyTarget = 5;
const nonceRange = 100; // Each job iterates over 100 nonces
const nonceMax = 8589934591; // Max value of nonce

var currentPuzzle = {
  version: 2,
  prevBlockhash: "00000000000008a3a41b85b8b29ad444def299fee21793cd8b9e567eab02cd81",
  merkleRoot: "2b12fcf1b09288fcaff797d71e950e71ae42b91e8bdb2304758dfcffc2b620e3",
  timestamp: 1305998791,
  difficultyTarget: 17,
}

const solutions = []

const jobs = []

const clients = [
  {
    id: 1,
    name: "samsung galaxy"
  }
]

// A job will compute hashcash for puzzle and nonce values in range nonceRange
// or client dies
function createJob(clientId, puzzle) {
  const job = {
    jobId: jobs.length,
    clientId: clientId || "",
    nonceRange: nonceRange,
    blockHeader: {},
  }
  job.blockHeader = currentPuzzle
  job.blockHeader.nonce = Math.floor(Math.random() * Math.floor(nonceMax))
  return job
}

function generatePuzzle(clientId, prevBlockhash) {
  const puzzle = {
      version: 2,
      prevBlockhash: prevBlockhash,
      merkleRoot: sha256('concatenated transaction hashes'),
      timestamp: (new Date).getTime(),
      difficultyTarget: difficultyTarget,
  }
  return puzzle;
}

function verifySolution(puzzle, nonce) {
  const data = puzzle.version + puzzle.prevBlockhash + puzzle.markleRoot + puzzle.timestamp + puzzle.difficultyTarget + nonce
  const hash = sha256(sha256(data))
  var leadingZeros = 0
  for (i = 0; i < puzzle.difficultyTarget; i++) {
    if (hash[i] === '0') {
      leadingZeros += 1
    }
  }
  return leadingZeros == puzzle.difficultyTarget
  return true
}

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser.urlencoded({ extended: true}))
  .use(bodyParser.json())
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/cool', (req, res) => res.send(cool()))
  .get('/times', (req, res) => {
    let result = ''
    const times = process.env.TIMES || 5
    for (i = 0; i < times; i++) {
      result += i + ' '
    }
    res.send(result)
  })
  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM test_table')
      res.render('pages/db', result)
      client.release()
    } catch (err) {
      console.error(err)
      res.send('Error: ' + err)
    }
  })
  // Server will not track client states, simply deal out jobs for them to do
  // for some time
  .get('/work', async (req, res) => {
    if (currentPuzzle == null) {
      currentPuzzle = generatePuzzle()
    }
    const job = createJob(req.body.clientId, currentPuzzle)
    jobs.push(job)
    res.send(JSON.stringify(job))
  })
  // Clients submit nonce solutions. If the nonce is a real solution to the currentPuzzle
  // record the solution and clear current puzzle
  .post('/submit', (req, res) => {
    if (currentPuzzle == null) {
      res.status(400).send({error: 'No current puzzle.'})
      return
    }
    if (verifySolution(currentPuzzle, req.body.nonce)) {
      currentPuzzle.nonce = req.body.nonce
      solutions.push(currentPuzzle)
      currentPuzzle = null
      res.send({correctSolution: true})
    } else {
      res.send({correctSolution: false})
    }
  })
  .post('/tokens', (req, res) => {
    const token = {
      'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    }
    res.send(JSON.stringify(token))
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
