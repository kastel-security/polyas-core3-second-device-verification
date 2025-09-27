# Polyas-Verifier

Polyas-Verifier is a web application for the individual second-device verification of the [POLYAS](https://www.polyas.com/) 3.0 E-Voting System
for [individual verifiability](https://gi.de/wahlen/verifikation-der-gi-wahlen-tools-gesucht) (cast-as-intended verification), see also the original
[publication](https://publikationen.bibliothek.kit.edu/1000117999).
The POLYAS 3.0 E-Voting System is used in the [elections for the executive and the managing committee](https://gi.de/wahlen/) of the
[German Informatics Society](https://gi.de/) in autumn 2025, see [polyas3.0-verifiable-1.3.2.pdf](doc/polyas3.0-verifiable-1.3.2.pdf)
for its system specification and [second-device-spec-1.0.pdf](doc/second-device-spec-1.0.pdf) for the system specification
of its second device verification protocol.

## Deployment
### Requirement
* [Node.js](https://nodejs.org/en)

### Installation
```bash
npm install
```

### GUI Development
For executing the GUI in mock mode, run the following command:
```bash
npm run mock
```
Then, open the following link:
```bash
http://localhost:5000/?c=kFpsHZFLr8j-2yDySJzMhLTyEFx6Nu4oqxFSE4oIaeV3IZRlF0987AlWeCQC4AHpznYchLE_gI3nwXmS&vid=voter24&nonce=cd02cad970d6b5659e097d09545c605518d4061cf3751c5a19ffc298193d62f2
```

## Testing
### Unit Tests
```bash
npm run t
```

## Configuration of an Election Instance
For testing the application against a real election instance, open ``.env.development`` and set ``VITE_ELECTION_BACKEND`` to the URL of your instance or a proxy to your instance.
Set ``VITE_ELECTION_FINGERPRINT`` to the election fingerprint of the election running on your election instance, ``VITE_ELECTION_URL`` to the instance of the base address of the election server and ``VITE_ELECTION_HASH`` to the election hash of the running election.
If the URL provided by the instance for the individual (second device) verification links to a localhost port other than *5000*, open ``package.json`` and change the following line
```bash
"dev": "vite --port 5000",
```
to this:
```bash
"dev": "vite --port <port number>",
```
Then, run the following command:
```bash
npm run dev
```

## Building a Docker Instance
### Requirement
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows or macOS)
* [Docker Compose](https://github.com/docker/compose) (Linux)

### Configuration
Edit the file [docker-compose.yml](docker-compose.yml) and change the values of the following keys within ``services.vite_docker.environment``:
* ``VITE_ELECTION_FINGERPRINT``: The fingerprint of the election for which the verifier is deployed
* ``VITE_ELECTION_URL``: The URL of the election server instance
* ``VITE_ELECTION_HASH``: The election hash of the running election
* ``VITE_ELECTION_BACKEND``: The URL of your instance or a proxy to your instance

### Build and Setup of the Instance
Run
```
docker-compose build
docker-compose up -d
```
to build and start the container.
If you are using *Docker Desktop*, omit the hyphen (``docker compose`` instead of ``docker-compose``).

## Licence
See [LICENSE](LICENSE)

## Contributors
The principal development of this software has been done by [Christoph Niederbudde](mailto:udqps@student.kit.edu).

## Contact
For more information, please contact [Michael Kirsten](https://www.tcs.ifi.lmu.de/mitarbeiter/michael-kirsten_de.html).
