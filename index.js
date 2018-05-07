const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const sha256 = require('sha256')
const assert = require('assert')
const { Pool } = require('pg')
const Controller = require('./controller')
const PORT = process.env.PORT || 5000

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
})

const controller = new Controller();

const bodyParser = require('body-parser')


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
    if (!controller.existsUnsolvedPuzzle()) {
      controller.generatePuzzle()
    }
    const job = controller.createJob(req.body.clientId, controller.getCurrentPuzzle())
    res.send(JSON.stringify(job))
  })
  // Clients submit nonce solutions. If the nonce is a real solution to the currentPuzzle
  // record the solution and clear current puzzle
  .post('/submit', (req, res) => {
    if (!controller.existsUnsolvedPuzzle()) {
      res.status(400).send({error: 'No current puzzle.'})
      return
    }
    const currentPuzzle = controller.getCurrentPuzzle()
    if (controller.verifySolution(currentPuzzle, req.body.nonce)) {
      currentPuzzle.nonce = req.body.nonce
      controller.saveSolution(currentPuzzle)
      controller.markPuzzleDone()
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
