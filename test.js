const { spawn } = require('child_process');
const request = require('request');
const test = require('tape');

// Start the app
const env = Object.assign({}, process.env, {PORT: 5000});
const child = spawn('node', ['index.js'], {env});

test('GET /work issues a job', (t) => {
  t.plan(5);

  // Wait until the server is ready
  child.stdout.on('data', _ => {
    // Make a request to our app
    request('http://127.0.0.1:5000/work', (error, response, body) => {
      // stop the server
      child.kill();

      // No error
      t.false(error);
      // Successful response
      t.equal(response.statusCode, 200);

      console.log(body)
      // Assert content
      const json = JSON.parse(body)
      t.true(['jobId'] in json);
      t.true(['clientId'] in json);
      t.true(['prevBlockhash'] in json.blockHeader);
    });
  });
});
