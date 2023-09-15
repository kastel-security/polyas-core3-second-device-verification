import { type SecretProof } from '../classes/ballot';
import { ElectionData, SecondDeviceFinalMessage, SecondDeviceLoginResponse } from '../classes/communication';
import { ErrorType } from './error';
type ResponseStatus = 'OK' | 'ERROR';
declare abstract class ResponseBean<T> {
    static readonly errorStatus = "ERROR";
    static readonly okStatus = "OK";
    readonly status: any;
    constructor(status: ResponseStatus);
}
declare class ResponseBeanError extends ResponseBean<any> {
    readonly errorType: ErrorType;
    readonly message?: string | undefined;
    constructor(errorType: ErrorType, message?: string | undefined);
}
declare class ResponseBeanOk<T> extends ResponseBean<T> {
    readonly value: T;
    constructor(value: T);
}
interface Communication {
    electionData: () => Promise<ResponseBean<ElectionData>>;
    login: (voterId: string, nonce: string, password: string, challenge: string) => Promise<ResponseBean<SecondDeviceLoginResponse>>;
    challenge: (token: string, proof: SecretProof) => Promise<ResponseBean<SecondDeviceFinalMessage>>;
}
declare class Comm implements Communication {
    protected readonly baseHeader: any;
    private static readonly responseOk;
    constructor();
    private resolveFail;
    electionData(): Promise<ResponseBean<ElectionData>>;
    login(voterId: string, nonce: string, password: string, challenge: string): Promise<ResponseBean<SecondDeviceLoginResponse>>;
    challenge(token: string, proof: SecretProof): Promise<ResponseBean<SecondDeviceFinalMessage>>;
}
declare class CommMock implements Communication {
    electionData(): Promise<ResponseBean<ElectionData>>;
    login(voterId: string, nonce: string, c: string, challenge: string): Promise<ResponseBean<SecondDeviceLoginResponse>>;
    challenge(token: string, proof: SecretProof): Promise<ResponseBeanOk<SecondDeviceFinalMessage>>;
}
export { type Communication, Comm, CommMock, ResponseBean, ResponseBeanError, ResponseBeanOk };
