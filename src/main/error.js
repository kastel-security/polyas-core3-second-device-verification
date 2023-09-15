var ErrorType;
(function (ErrorType) {
    ErrorType[ErrorType["CONNECTION"] = 0] = "CONNECTION";
    ErrorType[ErrorType["EXTERN"] = 1] = "EXTERN";
    ErrorType[ErrorType["SDPP"] = 2] = "SDPP";
    ErrorType[ErrorType["BALLOT_ACK"] = 3] = "BALLOT_ACK";
    ErrorType[ErrorType["BALLOT_ACK_FAIL"] = 4] = "BALLOT_ACK_FAIL";
    ErrorType[ErrorType["DECRYPT"] = 5] = "DECRYPT";
    ErrorType[ErrorType["FORMAT"] = 6] = "FORMAT";
    ErrorType[ErrorType["ZKP_REJECT"] = 7] = "ZKP_REJECT";
    ErrorType[ErrorType["ZKP_INV"] = 8] = "ZKP_INV";
    ErrorType[ErrorType["INVALID_OPERATION"] = 9] = "INVALID_OPERATION";
    ErrorType[ErrorType["DECODE"] = 10] = "DECODE";
    ErrorType[ErrorType["PARAMS"] = 11] = "PARAMS";
    ErrorType[ErrorType["OTHER"] = 12] = "OTHER";
})(ErrorType || (ErrorType = {}));
export { ErrorType };
