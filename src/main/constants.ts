const k = "0373744f99d31509eb5f8caaabc0cc3fab70e571a5db4d762020723b9cd6ada260"
const g = "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"
const q = "fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"
const decodingK = 80
const pointLength = 66
const plaintextBlockSize = 31

class EnvironmentVariables {
    public mockMode: boolean
    public backendUrl: string
    public fingerprint: string
    public static instance: EnvironmentVariables
    public static init() {
        if (this.instance == undefined) {
            this.instance = new EnvironmentVariables()
        }
        return this.instance
    }
} 
export{k, g, q, pointLength, plaintextBlockSize, decodingK, EnvironmentVariables}