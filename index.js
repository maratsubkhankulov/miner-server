const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const sha256 = require('sha256')
const { Pool } = require('pg')
const PORT = process.env.PORT || 5000

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
})

const bodyParser = require('body-parser')

const difficultyTarget = 5;
const jobs = [
  {
    jobId: 1,
    clientId: 1,
    blockHeader: {
      version: 2,
      prevBlockhash: "00000000000008a3a41b85b8b29ad444def299fee21793cd8b9e567eab02cd81",
      merkleRoot: "2b12fcf1b09288fcaff797d71e950e71ae42b91e8bdb2304758dfcffc2b620e3",
      timestamp: 1305998791,
      difficultyTarget: 17,
      Nonce: 2504433986,
      blockHash: "myhash"
    }
  }
]

const clients = [
  {
    id: 1,
    name: "samsung galaxy"
  }
]

function incrementNonce(job) {
  job.blockHeader.Nonce += 1
}

function generatePuzzle(clientId, prevBlockhash) {
  const puzzle = {
    jobId: jobs.length,
    clientId: clientId,
    blockHeader: {
      version: 2,
      prevBlockhash: prevBlockhash,
      merkleRoot: sha256('concatenated transaction hashes'),
      timestamp: (new Date).getTime(),
      difficultyTarget: difficultyTarget,
      Nonce: 0,
    }
  }
  return puzzle;
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
  .get('/work', async (req, res) => {
    var job = jobs[jobs.length - 1]
    if ('blockHash' in job.blockHeader) {
      job = generatePuzzle(1, job.blockHeader.blockHash)
      jobs.push(job)
    } else {
      incrementNonce(job)
    }
    res.send(JSON.stringify(job))
  })
  .post('/submit', (req, res) => {
    res.send('submitted')
  })
  .post('/tokens', (req, res) => {
    const token = {
      'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    }
    res.send(JSON.stringify(token))
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
