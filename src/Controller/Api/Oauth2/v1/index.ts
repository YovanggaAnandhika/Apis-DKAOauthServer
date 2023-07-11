import {ConfigFastifyServerMain} from "@dkaframework/server/dist/Component/Fastify/Types/TypesFastifyServer";
import Token from "./Token";
import Auth from "./Auth";


export const V1 : ConfigFastifyServerMain = async (app, opts, next) => {
    await app.register(Token);
    await app.register(Auth, { prefix : "/auth"});
    await next();
}

export default V1;