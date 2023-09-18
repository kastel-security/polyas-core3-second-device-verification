# Polyas-Verifier

Polyas-Verifier is a web application for the individual second-device verification of the [POLYAS](https://www.polyas.com/) 3.0 E-Voting System for [individual verifiability](https://gi.de/wahlen/verifikation-der-gi-wahlen-tools-gesucht) (cast-as-intended verification), see also the original [publication](https://publikationen.bibliothek.kit.edu/1000117999).
The POLYAS 3.0 E-Voting System is used in the [elections for the executive and the managing committee](https://gi.de/wahlen/) of the [German Informatics Society](https://gi.de/) in autumn 2023.

## Deployment
### Requirement
* [Node.js](https://nodejs.org/en)

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
### Unit Tests
```bash
npm run t
```

## Configuration of an Election Instance
For testing the application against a real election instance, open ``.env.development`` and set ``VITE_BACKEND`` to the URL of your instance or a proxy to your instance.
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

## Building a Docker Instance
### Requirement
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Configuration
Edit the file docker-compose.yml and change values of keys under args:
* ``FINGERPRINT``: The fingerprint of the election the verificationtool is deployed for
* ``SERVER_NAME``: The base URL the tool is running on and that has a valid SSL certificate
* ``URL``: The URL the verificationtool will be available at
* ``INSTANCE``: The link to the polyas instance the election is running on
* ``ADMIN``: Email of the server admin (Currently unused, so this does not need to be configured)
* ``CERT``: relative path to server .crt certificate file, has to be under current location 
* ``KEY``: relative path to server .key secret key file, has to be under current location 

### Build and Setup of the Instance
Run
```
docker compose build
docker compose up -d
```
to build and start the container

## Licence
See [LICENSE](LICENSE)

## Contributors
The principal development of this software has been done by [Christoph Niederbudde](mailto:udqps@student.kit.edu).

## Contact
For more information, please contact [Michael Kirsten](https://formal.kastel.kit.edu/~kirsten/?lang=en).
