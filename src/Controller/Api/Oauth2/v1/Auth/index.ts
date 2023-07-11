import {ConfigFastifyServerMain} from "@dkaframework/server/dist/Component/Fastify/Types/TypesFastifyServer";
import * as jsonwebtokens from "jsonwebtoken";
import * as jose from "jose";
import * as _ from "lodash";
import {CallbackHTTPResponse} from "../../../../../Interfaces/CallbackHTTPResponse";
import {DB} from "../../../../../Database";
import useragent from "useragent";

export const Auth : ConfigFastifyServerMain = (app, opts, next) => {

    app.get("/login", (req , response) => {
        let request : typeof req & { query : any, body : any } = req;
        let returnData : any = { code : 400};

        // @todo action for android device
        function androidDevice(){
            if ("authorization" in request.headers && request.headers.authorization !== undefined){
                if (request.headers.authorization.split(" ").length === 2){
                    switch (request.headers.authorization.split(" ")[0]) {
                        case "Bearer" :
                            jsonwebtokens.verify(request.headers.authorization?.split(" ")[1],"Cyberhack2010", async (error, data) => {
                                if (!error){
                                    if (request.query.username !== undefined && "username" in request.query ){
                                        if (request.query.password !== undefined && "password" in request.query){
                                            DB.Select(`dka-user-login_credential`, {
                                                search : [
                                                    { coloumName : "username", data : request.query.username },
                                                    "AND",
                                                    { coloumName : "password", data : request.query.password }
                                                ],
                                                limit : 1
                                            }).then(async (resultDB) => {
                                                const dataUserAccount : any = resultDB.data[0];
                                                await response
                                                    .code(200)
                                                    .header("content-type","application/json")
                                                    .send(dataUserAccount);
                                            }).catch(async (error) => {
                                                switch (error.code) {
                                                    case 404 :
                                                        returnData.error = [];
                                                        returnData.error.push(`ACCOUNT_NOT_FOUND`)
                                                        _.merge(returnData, { status : false, code : 404, msg : `account not found or your login wrong` } as CallbackHTTPResponse)
                                                        response
                                                            .code(404)
                                                            .header("content-type","application/json")
                                                            .send(returnData);
                                                        break;
                                                    default :
                                                        returnData.error = [];
                                                        returnData.error.push(`ERROR_INTERNAL_SERVER_ON_DATABASE`);
                                                        returnData.error.push((error.msg as string).toUpperCase());
                                                        _.merge(returnData, { status : false, code : error.code, msg : `error internal server` } as CallbackHTTPResponse)
                                                        response
                                                            .code(error.code)
                                                            .header("content-type","application/json")
                                                            .send(returnData);
                                                        break;
                                                }
                                            })
                                        }else{
                                            returnData.error = [];
                                            returnData.error.push(`ERROR_PARAMS_BODY_PASSWORD_HEADER_IS_MISSING`)
                                            _.merge(returnData, { status : false, code : 400, msg : `bad request body password is missing` } as CallbackHTTPResponse)
                                            response
                                                .code(400)
                                                .header("content-type","application/json")
                                                .send(returnData);
                                        }
                                    }else{
                                        returnData.error = [];
                                        returnData.error.push(`ERROR_PARAMS_BODY_USERNAME_HEADER_IS_MISSING`)
                                        _.merge(returnData, { status : false, code : 400, msg : `bad request body username is missing` } as CallbackHTTPResponse)
                                        response
                                            .code(400)
                                            .header("content-type","application/json")
                                            .send(returnData);
                                    }
                                }else{
                                    returnData.error = [];
                                    returnData.error.push(error.message)
                                    await _.merge(returnData, { status : false, code : 403, msg : `Error Verification Session Serial` } as CallbackHTTPResponse)
                                    response
                                        .code(403)
                                        .header("content-type","application/json")
                                        .send(returnData)
                                }
                            });
                            break;
                        default :
                            returnData.error.push(`ERROR_GRANT_TYPE_NOT_IMPLEMENTATION`);
                            returnData.error.push(`what do you mean grant_type "client_credentials" ?`);
                            _.merge(returnData, { status : false, code : 400, msg : `Bad Request "grant_type" not implementation.` } as CallbackHTTPResponse);
                            response
                                .code(403)
                                .header("content-type","application/json")
                                .send(returnData)
                            break;
                    }
                }else{
                    returnData.error.push(`AUTHORIZATION HEADER FORMAT NOT VALID.`);
                    returnData.error.push(`headers format must <type authorization> <token>`);
                    _.merge(returnData, { status : false, msg : `headers format must <type authorization> <token>` } as CallbackHTTPResponse);
                    response
                        .code(403)
                        .header("content-type","application/json")
                        .send(returnData)
                }
            }else{
                returnData.error = [];
                returnData.error.push(`ERROR_PARAMS_AUTHORIZATION_HEADER_IS_MISSING`)
                _.merge(returnData, { status : false, code : 400, msg : `bad request header missing authorization` } as CallbackHTTPResponse)
                response
                    .code(403)
                    .header("content-type","application/json")
                    .send(returnData)
            }
        }


        // @todo check user Agent header exists
        if (request.headers["user-agent"] !== undefined){
            let UserAgentData = useragent.parse(request.headers['user-agent']);
            // @todo Detecting OS Device
            switch (UserAgentData.os.family) {
                case "Android" :
                    androidDevice()
                    break;
                default :
                    returnData.error = [];
                    returnData.error.push(`ERROR_USER_AGENT_HEADER_ILLEGAL`)
                    _.merge(returnData, { status : false, code : 400, msg : `bad request require user agents header` } as CallbackHTTPResponse)
                    response
                        .code(403)
                        .header("content-type","application/json")
                        .send(returnData);
                    break;
            }
        }else{
            returnData.error = [];
            returnData.error.push(`ERROR_USER_AGENT_HEADER_IS_REQUIRE`)
            _.merge(returnData, { status : false, code : 400, msg : `bad request require user agents header` } as CallbackHTTPResponse)
            response
                .code(403)
                .header("content-type","application/json")
                .send(returnData);
        }
    });

    app.post('/register', (req, response) => {
        let request : typeof req = req;
        response
            .code(503)
            .header("content-type","application/json")
            .send();
    });

    app.get('/forget', (req, response) => {
        let request : typeof req = req;
        response.code(503).send();
    });
    next();
}

export default Auth;