# Distributed bitcoin mining Server

This server distributes hashcash computations among a number of clients by
providing the proof-of-work puzzle and starting nonce. It doesn't track client
states and doesn't require 'work done' messages. Clients are expected to compute
hashes for nonces in a given range and are expected to call /submit when a
successful nonce has been found.

# Endpoints

GET /work

POST /submit
