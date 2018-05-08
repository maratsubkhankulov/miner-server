# Distributed bitcoin mining server

This server distributes hashcash computations among a number of clients by
providing the proof-of-work puzzle and starting nonce. It doesn't track client
states and doesn't require 'work done' messages. Clients are expected to compute
hashes for nonces in a given range and are expected to call /submit when a
successful nonce has been found.

Client implementation can be found here: https://github.com/maratsubkhankulov/miner-client

_This is a work in progress_

# Try it

At the time of writing the code was hosted at https://frozen-refuge-70388.herokuapp.com/

# Endpoints

## GET /work
```
```

```
HTTP 200
{
  "jobId": 1,
  "clientId": 2,
  "nonceRange": 200,
  "blockHeader": {
    "version": 2,
    "prevBlockhash": "00000000000008a3a41b85b8b29ad444def299fee21793cd8b9e567eab02cd81",
    "merkleRoot": "2b12fcf1b09288fcaff797d71e950e71ae42b91e8bdb2304758dfcffc2b620e3",
    "timestamp": 1305998791,
    "difficultyTarget": 17,
    "nonce": 2504433986
  }
}
```

## POST /submit
```
{
  "nonce": 2504433986
}
```

```
HTTP 200
{
  "correctSolution": false
}
```

# To do

- [ ] Verify that submitted nonce is a valid solution
- [ ] Authentication: allow clients to login and track their sessions
- [ ] Authentication: authenticate API calls
- [ ] Obtain blockHeader from the real bitcoin network
