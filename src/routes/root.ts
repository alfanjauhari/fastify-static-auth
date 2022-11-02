import { FastifyPluginAsync } from "fastify";
import { existsSync } from "fs";
import path = require("path");

const data = {
  email: "alfan@zog.com",
  password: "pass",
};

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/", async function (request, reply) {
    return { root: true };
  });

  fastify.get<{ Params: { file: string } }>(
    "/public/:file",
    async (req, reply) => {
      const { file } = req.params;

      if (!req.cookies.token) {
        return reply.status(403).send({
          status: "Forbidden",
          cookies: req.cookies,
        });
      }

      const verifyToken = fastify.jwt.verify(req.cookies.token as string);

      if (!verifyToken) {
        return reply.status(403).send({
          status: "Forbidden",
        });
      }

      const isFileExist = existsSync(
        path.join(__dirname, "../..", "public", file)
      );

      if (!isFileExist) {
        return reply.status(404).send({
          notfound: true,
        });
      }

      return reply.sendFile(file);
    }
  );

  fastify.post<{ Body: typeof data }>(
    "/api/v1/auth/login",
    async (req, reply) => {
      const { email, password } = req.body;

      if (email !== data.email || password !== data.password) {
        reply.status(400).send({
          error: "Invalid data",
        });
      }

      const token = fastify.jwt.sign(data);

      reply
        .setCookie("token", token, {
          expires: new Date(new Date().setMilliseconds(1000 * 60 * 60 * 24)),
          httpOnly: true,
          path: "/",
        })
        .status(200)
        .send({
          token,
        });
    }
  );
};

export default root;
