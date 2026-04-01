"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const config_1 = require("prisma/config");
const databaseUrl = process.env["DATABASE_URL"];
if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
}
exports.default = (0, config_1.defineConfig)({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: databaseUrl,
    },
});
//# sourceMappingURL=prisma.config.js.map