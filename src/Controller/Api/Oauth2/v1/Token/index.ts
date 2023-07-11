import {ConfigFastifyServerMain} from "@dkaframework/server/dist/Component/Fastify/Types/TypesFastifyServer";
import {CallbackHTTPResponse} from "../../../../../Interfaces/CallbackHTTPResponse";
import * as _ from "lodash";
import {DB} from "../../../../../Database";
const isBase64 = require("is-base64");
import * as jose from "jose";
import * as jsonwebtokens from "jsonwebtoken"
import * as path from "path";
import {readFileSync} from "fs";

function SelectOauthFormat(request : any) : Promise<any> {
    let returnData : any = { code : 400, error : [] };
    let bodyRequest =  request.body as any;
    let headerRequest = request.headers as object;
    return new Promise(async (resolve, rejected) => {
        if ("grant_type" in bodyRequest && bodyRequest.grant_type !== undefined && typeof bodyRequest.grant_type === "string"){
            //############ checking grant type ##################################################
            switch (bodyRequest.grant_type) {
                case "client_credentials" :
                    //######################################################
                    if ("authorization" in headerRequest && headerRequest.authorization !== undefined && typeof headerRequest.authorization === "string"){
                        //########################################
                        if(headerRequest.authorization.split(" ").length === 2){
                            //#####################################
                            switch (headerRequest.authorization.split(" ")[0]) {
                                case "Basic" :
                                    if(isBase64(headerRequest.authorization.split(" ")[1])){
                                        let credentialData = Buffer.from(headerRequest.authorization.split(" ")[1], "base64").toString();
                                        let credentialDataArray = credentialData.split(":");
                                        if (credentialDataArray.length === 2){
                                            await _.merge(returnData, { status : true, code : 200, msg : `successfully checked oauth2 format`, data : { client_id : credentialDataArray[0], client_secret : credentialDataArray[1]} } as CallbackHTTPResponse);
                                            delete returnData.error;
                                            await resolve(returnData);
                                        }else{
                                            returnData.error.push(`FAILED_DECODE_BASE64_AUTHORIZATION_HEADER`);
                                            await _.merge(returnData, { status : false, msg : `failed decode authorization base64` } as CallbackHTTPResponse);
                                            await rejected(returnData)
                                        }
                                    }else{
                                        returnData.error.push(`AUTHORIZATION HEADER FORMAT NOT BASE64 FORMAT.`);
                                        await _.merge(returnData, { status : false, msg : `headers authorization not base64 format` } as CallbackHTTPResponse);
                                        await rejected(returnData)
                                    }
                                    break;
                                default :
                                    returnData.error.push(`AUTHORIZATION HEADER FORMAT NOT VALID.`);
                                    returnData.error.push(`headers format must "Basic" type`);
                                    await _.merge(returnData, { status : false, msg : `headers format must Basic type` } as CallbackHTTPResponse);
                                    await rejected(returnData)
                                    break;
                            }
                        }else{
                            returnData.error.push(`AUTHORIZATION HEADER FORMAT NOT VALID.`);
                            returnData.error.push(`headers format must <type authorization> <token>`);
                            await _.merge(returnData, { status : false, msg : `headers format must <type authorization> <token>` } as CallbackHTTPResponse);
                            await rejected(returnData)
                        }
                    }else{
                        returnData.error.push(`AUTHORIZATION HEADER IS NOT EXIST`);
                        await _.merge(returnData, { status : false, msg : `authorization header must exist` } as CallbackHTTPResponse);
                        await rejected(returnData)
                    }

                    //######################################################
                    break;
                default :
                    returnData.error.push(`ERROR_GRANT_TYPE_NOT_IMPLEMENTATION`);
                    returnData.error.push(`what do you mean grant_type "client_credentials" ?`);
                    await _.merge(returnData, { status : false, code : 400, msg : `Bad Request "grant_type" not implementation.` } as CallbackHTTPResponse);
                    await rejected(returnData)
                    break;
            }
        }else{
            returnData.error.push(`ERROR_GRANT_TYPE_NOT_IMPLEMENTATION`);
            returnData.error.push(`what do you mean grant_type "client_credentials" ?`);
            await _.merge(returnData, { status : false, code : 400, msg : `Bad Request "grant_type" not implementation.` } as CallbackHTTPResponse);
            await rejected(returnData)
        }
    });
}
function GetCredentialDeveloper(response : any) : Promise<any> {
    return new Promise(async (resolve, rejected) => {
        await DB.Select(`dka-developer_account`, {
                as : `account`,
                column : [],
                search : { coloumName : `client_id`, data : `${response.data.client_id}`},
                join : {
                    as : `apps`,
                    TableName : `dka-developer_apps`,
                    on : {
                        collNameFirst : {
                            tableAlias : `account`,
                            collName : `id_developer_account`
                        },
                        collNameSecond : {
                            tableAlias : `apps`,
                            collName : `id_developer_account`
                        }
                    },
                    search : { coloumName : `client_secret`, data : `${response.data.client_secret}`, conditionFromParents : "AND"}
                }
        }).then(async (result) => {
            await resolve(result.data[0])
        }).catch(async (error) => {
            console.log(error)
            await rejected(error)
        })
    });
}

export const rootMainPath = path.dirname(require.main?.filename!);

export const Token : ConfigFastifyServerMain = async (app, opts, next) => {

    await app.post("/token", async (request, response) => {
        /*response.code(200).send()*/
        await SelectOauthFormat(request)
            .then(async (result) => {
                await GetCredentialDeveloper(result)
                    .then(async (responseApis) => {
                        let token = jsonwebtokens.sign(responseApis, "Cyberhack2010", {
                            algorithm : "HS384",
                            issuer : "https://dka.apis",
                            expiresIn : responseApis.expires,
                        });
                        await response
                            .code(200)
                            .send({ access_token : token });
                    })
                    .catch(async (error) => {
                        console.log(error)
                        await response.code(error.code)
                            .send(error);
                    })
            })
            .catch(async (error) => {
                await response.code(error.code)
                    .send(error);
            });
    })
    await app.get("/token", async (request, response) => {
        let returnData : any = { code : 400};
        if ("authorization" in request.headers && request.headers.authorization !== undefined){
            if (request.headers.authorization.split(" ").length === 2){
                switch (request.headers.authorization.split(" ")[0]) {
                    case "Bearer" :
                        await jsonwebtokens.verify(request.headers.authorization?.split(" ")[1], "Cyberhack2010", async (error, data : any) => {
                            if (!error){
                                response.code(200).send(data);
                            }else{
                                returnData.error = [];
                                returnData.error.push(error.message)
                                await _.merge(returnData, { status : false, code : 403, msg : `Error Verification Session Serial` } as CallbackHTTPResponse)
                                await response.code(403).send(returnData);
                            }
                        });
                        break;
                    default :
                        returnData.error.push(`ERROR_GRANT_TYPE_NOT_IMPLEMENTATION`);
                        returnData.error.push(`what do you mean grant_type "client_credentials" ?`);
                        await _.merge(returnData, { status : false, code : 400, msg : `Bad Request "grant_type" not implementation.` } as CallbackHTTPResponse);
                        await response.code(400).send(returnData);
                        break;
                }
            }else{
                returnData.error.push(`AUTHORIZATION HEADER FORMAT NOT VALID.`);
                returnData.error.push(`headers format must <type authorization> <token>`);
                await _.merge(returnData, { status : false, msg : `headers format must <type authorization> <token>` } as CallbackHTTPResponse);
                await response.code(400).send(returnData);
            }
        }else{
            returnData.error = [];
            returnData.error.push(`ERROR_PARAMS_AUTHORIZATION_HEADER_IS_MISSING`)
            await _.merge(returnData, { status : false, code : 400, msg : `bad request header missing authorization` } as CallbackHTTPResponse)
            await response.code(400).send(returnData);
        }
    });
    await next();
}

export default Token;