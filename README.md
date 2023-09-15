# Polyas Second Device Verification

Polyas second device verification is a website to execute the individual (cast as intended) verification of the Polyas voting system.

## Requirements
```bash
node(https://nodejs.org/en)
```

## Development

### Installation
```bash
npm install
```

### Developing the GUI
To execute the GUI in mock mode, run
```bash
npm run mock
```
Then open the link
```bash
localhost:4300?c=vtWXj-YxxTV2ektefJ5pk7AWc9saoPbu6wJZUZ9R1t8ekU89x7SCYLcg8ODi3fHST4BTmAK97XN3XqWc&vid=voter8&nonce=4bf8cecf3fb4c4b4372005e13a53dce705123fab5b9e9288461e6d8fbf9644ea
```

### Executing tests
To execute all tests, run
```bash
npm run t
```

### Testing against a real Polyas instance
To test the application against a real Polyas instance, open .env.development and set VITE_BACKEND the URL of your instance or a proxy to your instance. Set VITE_FINGERPRINT to the election fingerprint of the election running on your Polyas instance. If the URL provided by the instance for second device verification links to a localhost port other than 4300, open package.json and change the line
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

### Deployment using Docker
Requirements: Docker Desktop
Edit the file docker-compose.yml and change values of keys under args
FINGERPRINT: The fingerprint of the election the verificationtool is deployed for
SERVER_NAME: The base URL the tool is running on and that has a valid SSL certificate
URL: The URL the verificationtool will be available at
POLYAS: The link to the polyas instance the election is running on
ADMIN: Email of the server admin (Currently unused, so this does not need to be configured)
CERT: relative path to server .crt certificate file, has to be under current location 
CERT: relative path to server .key secret key file, has to be under current location 

Then run
```
docker compose build
docker compose up -d
```
to build and start the container

