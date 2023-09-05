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




## Executing
### Executing the tool in command line
```bash
python src/verificationtool.py [-s | --second-device] [-r | --receipt] [--log] [-l | --language lang] src
src: Absolute path to election files
-s, --second-device: Check second device public parameters in file src/second-device-public-parameters.json
-r, --receipt: Check ballot cast confirmation files (receipts) in src/receipts
--log: Log the status of ballots for all checked ballot cast confirmations
-l, --language: Sets the preferred language. Texts that are available will be displayed in the preferred language, other texts will be displayed in the default language

```

## Deployment
To deploy the application on a server such as ngix or apache, that server first needs to be configured as a proxy To forward certain requests to the Polyas instance. The URL paths <server>/electionData, <server>/login and <server>/challenge must forward to <polyas>/electionData, <polyas>/login, <polyas>/challenge where <backend> is the url the application is going to run at and <polyas> ist the url of the Polyas instance.
Open the file env and set VITE_BACKEND to the url where your application will be running and set VITE_FINGERPRINT to the election fingerprint your apllication will be running for.
Then run
```bash
npm run build-only
```
The build output will be in folder dist
