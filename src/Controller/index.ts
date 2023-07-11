import {ConfigFastifyServerMain} from "@dkaframework/server/dist/Component/Fastify/Types/TypesFastifyServer";
import Api from "./Api";


export const AppController : ConfigFastifyServerMain = async (app, opts, next) => {
    await app.setNotFoundHandler(async (request, response) => {
        response.code(404)
            .send({ status : false, code : 404, msg : `url not found`})
    })
    await app.register(Api, { prefix : "/api"})
    await next();
}

export default AppController;