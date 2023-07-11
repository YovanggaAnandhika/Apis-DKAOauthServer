import {ConfigFastifyServerMain} from "@dkaframework/server/dist/Component/Fastify/Types/TypesFastifyServer";
import v1 from "./v1";


export const Oauth2 : ConfigFastifyServerMain = async (app, opts, next) => {


    await app.register(v1, { prefix : "/v1"});

    await next();
}

export default Oauth2;