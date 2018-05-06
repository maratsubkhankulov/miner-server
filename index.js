const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const { Pool } = require('pg')
const PORT = process.env.PORT || 5000
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
})

express()
  .use(express.static(path.join(__dirname, 'public')))
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
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
