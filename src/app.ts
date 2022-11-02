import { join } from "path";
import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload";
import { FastifyPluginAsync } from "fastify";
import fastifyMultipart = require("@fastify/multipart");
import fastifyStatic = require("@fastify/static");
import path = require("path");
import fastifyCookie = require("@fastify/cookie");
import fastifyJwt, { JWT } from "@fastify/jwt";

declare module "fastify" {
  interface FastifyRequest {
    verify: JWT["verify"];
  }
}

export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  // Place here your custom code!

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
    options: opts,
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "routes"),
    options: opts,
  });

  fastify.register(fastifyMultipart);
  fastify.register(fastifyStatic, {
    root: path.join(__dirname, "..", "public"),
    prefix: "/public/",
  });
  fastify.register(fastifyCookie, {
    secret: "secretz",
  });
  fastify.register(fastifyJwt, {
    secret: "secret",
  });
};

export default app;
export { app, options };
