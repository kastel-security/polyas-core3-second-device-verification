declare enum ErrorType {
    CONNECTION = 0,
    EXTERN = 1,
    SDPP = 2,
    BALLOT_ACK = 3,
    BALLOT_ACK_FAIL = 4,
    DECRYPT = 5,
    FORMAT = 6,
    ZKP_REJECT = 7,
    ZKP_INV = 8,
    INVALID_OPERATION = 9,
    DECODE = 10,
    PARAMS = 11,
    OTHER = 12
}
export { ErrorType };
