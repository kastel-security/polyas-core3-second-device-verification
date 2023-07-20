# polyas-3-second-device-verification

## Inconsistencies/ Questions
value c in URL is not a valid base64 code because of the -
If c could be decoded, the result would have a length of 60 which is not  multiple of 16 (block length of AES)
What mode should be used to decrypt? ECB? CBC with first block as IV? Something else? 
Page 11, validating ZKP: 'where u is the i-th ciphertext' apparently refers to the x component of the ciphertext.
in my opinion, this is not precise since the ciphertext includes both the x component and the y component
Page 11, Decoding ballot: It is not explicitly said what w_i, Y_i, r_i are. I assume Y_i and r_i are as above, w_i seems to be y component of ciphertext which is not specified and is not clear from context
Page 12, receipt: Election id is renamed to project id without further reference