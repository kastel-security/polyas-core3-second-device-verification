import axios from 'axios';
import { ElectionData, SecondDeviceFinalMessage, SecondDeviceLoginResponse } from '../classes/communication';
import { EnvironmentVariables } from './constants';
import { ErrorType } from './error';
import data from '../mock/data.json';
class ResponseBean {
    static errorStatus = 'ERROR';
    static okStatus = 'OK';
    status;
    constructor(status) {
        this.status = status;
    }
}
class ResponseBeanError extends ResponseBean {
    errorType;
    message;
    constructor(errorType, message) {
        super(ResponseBean.errorStatus);
        this.errorType = errorType;
        this.message = message;
    }
}
class ResponseBeanOk extends ResponseBean {
    value;
    constructor(value) {
        super(ResponseBean.okStatus);
        this.value = value;
    }
}
class Comm {
    baseHeader;
    static responseOk = 'OK';
    constructor() {
        this.baseHeader = {
            'Content-Type': 'application/json'
        };
    }
    async resolveFail(errorType, msg) {
        return await Promise.resolve(new ResponseBeanError(errorType, msg));
    }
    async electionData() {
        return await axios.request({
            baseURL: EnvironmentVariables.instance.backendUrl,
            url: '/electionData',
            method: 'get',
            headers: this.baseHeader
        })
            .then(async (response) => {
            try {
                const electionData = ElectionData.fromJson(response.data);
                return await Promise.resolve(new ResponseBeanOk(electionData));
            }
            catch (error) {
                return await this.resolveFail(ErrorType.FORMAT, error.message);
            }
        }).catch(async (error) => {
            return await Promise.resolve(this.resolveFail(ErrorType.CONNECTION, error));
        });
    }
    async login(voterId, nonce, password, challenge) {
        if (challenge.length % 2 !== 0) {
            challenge = '0' + challenge;
        }
        return await axios.request({
            baseURL: EnvironmentVariables.instance.backendUrl,
            url: '/login',
            method: 'post',
            data: {
                voterId,
                nonce,
                password,
                challengeCommitment: challenge
            },
            headers: this.baseHeader
        })
            .then(async (response) => {
            if (response.data.status !== Comm.responseOk) {
                return await this.resolveFail(ErrorType.EXTERN, response.data.error);
            }
            try {
                const secondDeviceLoginResponse = SecondDeviceLoginResponse.fromJson(response.data.value);
                return await Promise.resolve(new ResponseBeanOk(secondDeviceLoginResponse));
            }
            catch (error) {
                return await this.resolveFail(ErrorType.FORMAT, error.message);
            }
        })
            .catch(async (error) => {
            return await Promise.resolve(this.resolveFail(ErrorType.CONNECTION, error.message));
        });
    }
    async challenge(token, proof) {
        const header = this.baseHeader;
        header.AuthToken = token;
        return await axios.request({
            baseURL: EnvironmentVariables.instance.backendUrl,
            url: '/challenge',
            method: 'post',
            headers: header,
            data: {
                challenge: proof.e.toString(10),
                challengeRandomCoin: proof.r.toString(10)
            }
        })
            .then(async (response) => {
            if (response.data.status !== Comm.responseOk) {
                return await this.resolveFail(ErrorType.EXTERN, response.data.error);
            }
            try {
                const finalMessage = SecondDeviceFinalMessage.fromJson(response.data.value);
                return await Promise.resolve(new ResponseBeanOk(finalMessage));
            }
            catch (error) {
                return await this.resolveFail(ErrorType.FORMAT, error.message);
            }
        })
            .catch(async (error) => {
            return await Promise.resolve(this.resolveFail(ErrorType.CONNECTION, error.message));
        });
    }
}
class CommMock {
    async electionData() {
        const electionData = ElectionData.fromJson(data.electionData);
        return await Promise.resolve(new ResponseBeanOk(electionData));
    }
    async login(voterId, nonce, c, challenge) {
        const loginResponse = SecondDeviceLoginResponse.fromJson(data.loginResponse);
        return await Promise.resolve(new ResponseBeanOk(loginResponse));
    }
    async challenge(token, proof) {
        const finalMessage = SecondDeviceFinalMessage.fromJson(data.finalMessage);
        return await Promise.resolve(new ResponseBeanOk(finalMessage));
    }
}
export { Comm, CommMock, ResponseBean, ResponseBeanError, ResponseBeanOk };
