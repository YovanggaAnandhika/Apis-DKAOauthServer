

export interface CallbackHTTPResponse {
    status ?: boolean,
    code : number,
    msg ?: string,
    data ?: object,
    error : Array<string>
}