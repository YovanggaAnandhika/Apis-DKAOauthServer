import {ConfigFastifyServerMain} from "@dkaframework/server/dist/Component/Fastify/Types/TypesFastifyServer";
import Oauth2 from "./Oauth2";


export const Api : ConfigFastifyServerMain = async (app, opts, next) => {



    await app.register(Oauth2, { prefix : "/oauth2"});
    await next();
}

export default Api;