# polyas-3-second-device-verification

## Inconsistencies/ Questions
value c in URL is not a valid base64 code because of the -
If c could be decoded, the result would have a length of 60 which is not  multiple of 16 (block length of AES)
What mode should be used to decrypt? ECB? CBC with first block as IV? Something else? 