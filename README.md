# Polyas-Verifier

Polyas-Verifier is a web application for the individual second-device verification of the [POLYAS](https://www.polyas.com/) 3.0 E-Voting System for [individual verifiability](https://gi.de/wahlen/verifikation-der-gi-wahlen-tools-gesucht) (cast-as-intended verification), see also the original [publication](https://publikationen.bibliothek.kit.edu/1000117999).
The POLYAS 3.0 E-Voting System is used in the [elections for the executive and the managing committee](https://gi.de/wahlen/) of the [German Informatics Society](https://gi.de/) in autumn 2023.

## Requirements
* [Node.js](https://nodejs.org/en)

## Deployment
### Installation
```bash
npm install
```

### GUI Development
For executing the GUI in mock mode, run
```bash
npm run mock
```
Then open the link
```bash
localhost:4300?c=vtWXj-YxxTV2ektefJ5pk7AWc9saoPbu6wJZUZ9R1t8ekU89x7SCYLcg8ODi3fHST4BTmAK97XN3XqWc&vid=voter8&nonce=4bf8cecf3fb4c4b4372005e13a53dce705123fab5b9e9288461e6d8fbf9644ea
```

## Testing
## Unit Tests
```bash
npm run t
```

### Testing with a Real Instance
For testing the application against a real Polyas instance, open ``.env.development`` and set ``VITE_BACKEND`` to the URL of your instance or a proxy to your instance.
Set ``VITE_FINGERPRINT`` to the election fingerprint of the election running on your Polyas instance.
If the URL provided by the instance for the individual (second device) verification links to a localhost port other than 4300, open ``package.json`` and change the line
```bash
"dev": "vite --port 4300",
```
to
```bash
"dev": "vite --port <port number>",
```
Then run 
```bash
npm run dev
```

## Licence
To be declared.

## Contributors
The principal development of this software has been done by [Christoph Niederbudde](mailto:udqps@student.kit.edu).

## Contact
For more information, please contact [Michael Kirsten](https://formal.kastel.kit.edu/~kirsten/?lang=en).
