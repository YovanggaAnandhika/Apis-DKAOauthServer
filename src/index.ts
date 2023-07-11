import { Server, Options } from "@dkaframework/server";
import AppController from "./Controller";
import {readFileSync} from "fs";
import * as path from "path";

(async () => {
    await Server<{ engine : "FASTIFY"}>({
        state : Options.STATE.DEVELOPMENT,
        host : Options.HOST.WILDCARD,
        port : 40001,
        app : AppController,
        settings : {
            engine : {
                type : Options.SETTINGS.ENGINE.PROTOCOL.HTTP2,
                options : {
                    http2 : true,
                    https : {
                        key: readFileSync(path.join(__dirname, "./Cert/Server/localhost.key"), "utf-8"),
                        cert: readFileSync(path.join(__dirname, "./Cert/Server/localhost.crt"), "utf-8"),
                        ca: [
                            readFileSync(path.join(__dirname, "./Cert/CA/localhost.crt"), "utf-8")
                        ],
                        rejectUnauthorized: true,
                        requestCert: false
                    }
                }
            },
        }
    }).then(async (res) => {
        console.log("Server Berjalan")
    }).catch(async (error) => {
        console.error(JSON.stringify(error))
    })
})();