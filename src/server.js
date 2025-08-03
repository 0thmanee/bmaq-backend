"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fastify_1 = require("fastify");
var dotenv_1 = require("dotenv");
var chalk_1 = require("chalk");
var client_1 = require("@prisma/client");
// Load environment variables
(0, dotenv_1.config)();
// Initialize Prisma client
var prisma = new client_1.PrismaClient();
// Create Fastify instance with logging
var app = (0, fastify_1.default)({
    logger: {
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
                colorize: true,
            },
        },
    },
});
// Add Prisma to Fastify instance
app.decorate('prisma', prisma);
// Graceful shutdown
var gracefulShutdown = function (signal) { return __awaiter(void 0, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log(chalk_1.default.yellow("\n\uD83D\uDD04 Received ".concat(signal, ", shutting down gracefully...")));
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, prisma.$disconnect()];
            case 2:
                _a.sent();
                console.log(chalk_1.default.green('✅ Database connection closed'));
                return [4 /*yield*/, app.close()];
            case 3:
                _a.sent();
                console.log(chalk_1.default.green('✅ Server closed'));
                process.exit(0);
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.error(chalk_1.default.red('❌ Error during shutdown:'), error_1);
                process.exit(1);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
// Register shutdown handlers
process.on('SIGTERM', function () { return gracefulShutdown('SIGTERM'); });
process.on('SIGINT', function () { return gracefulShutdown('SIGINT'); });
// Start server
var start = function () { return __awaiter(void 0, void 0, void 0, function () {
    var port, host, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 19, , 20]);
                // Test database connection
                return [4 /*yield*/, prisma.$connect()];
            case 1:
                // Test database connection
                _a.sent();
                console.log(chalk_1.default.green('✅ Database connected successfully'));
                // Register plugins
                return [4 /*yield*/, app.register(require('./plugins/swagger'))];
            case 2:
                // Register plugins
                _a.sent();
                return [4 /*yield*/, app.register(require('./plugins/cors'))];
            case 3:
                _a.sent();
                return [4 /*yield*/, app.register(require('./plugins/helmet'))];
            case 4:
                _a.sent();
                return [4 /*yield*/, app.register(require('./plugins/rate-limit'))];
            case 5:
                _a.sent();
                // Register routes with /api/v1 prefix
                return [4 /*yield*/, app.register(require('./routes/health'), { prefix: '/api/v1' })];
            case 6:
                // Register routes with /api/v1 prefix
                _a.sent();
                return [4 /*yield*/, app.register(require('./routes/auth'), { prefix: '/api/v1' })];
            case 7:
                _a.sent();
                return [4 /*yield*/, app.register(require('./routes/dashboard'), { prefix: '/api/v1' })];
            case 8:
                _a.sent();
                return [4 /*yield*/, app.register(require('./routes/analytics'), { prefix: '/api/v1' })];
            case 9:
                _a.sent();
                return [4 /*yield*/, app.register(require('./routes/settings'), { prefix: '/api/v1' })];
            case 10:
                _a.sent();
                return [4 /*yield*/, app.register(require('./routes/users'), { prefix: '/api/v1' })];
            case 11:
                _a.sent();
                return [4 /*yield*/, app.register(require('./routes/startups'), { prefix: '/api/v1' })];
            case 12:
                _a.sent();
                return [4 /*yield*/, app.register(require('./routes/budget'), { prefix: '/api/v1' })];
            case 13:
                _a.sent();
                return [4 /*yield*/, app.register(require('./routes/events'), { prefix: '/api/v1' })];
            case 14:
                _a.sent();
                return [4 /*yield*/, app.register(require('./routes/resources'), { prefix: '/api/v1' })];
            case 15:
                _a.sent();
                return [4 /*yield*/, app.register(require('./routes/requests'), { prefix: '/api/v1' })];
            case 16:
                _a.sent();
                return [4 /*yield*/, app.register(require('./routes/suivi'), { prefix: '/api/v1' })];
            case 17:
                _a.sent();
                port = Number(process.env.PORT) || 3000;
                host = process.env.HOST || '0.0.0.0';
                return [4 /*yield*/, app.listen({ port: port, host: host })];
            case 18:
                _a.sent();
                console.log(chalk_1.default.cyan.bold('\n🚀 BMAQ Backend Server Started!'));
                console.log(chalk_1.default.cyan("\uD83D\uDCE1 Server running on: http://".concat(host, ":").concat(port)));
                console.log(chalk_1.default.cyan("\uD83D\uDCDA Swagger docs: http://".concat(host, ":").concat(port, "/docs")));
                console.log(chalk_1.default.cyan("\uD83D\uDD0D Health check: http://".concat(host, ":").concat(port, "/api/v1/health")));
                console.log(chalk_1.default.cyan("\uD83D\uDD10 Auth endpoint: http://".concat(host, ":").concat(port, "/api/v1/auth/login")));
                console.log(chalk_1.default.gray('Press Ctrl+C to stop the server\n'));
                return [3 /*break*/, 20];
            case 19:
                error_2 = _a.sent();
                console.error(chalk_1.default.red('❌ Error starting server:'), error_2);
                process.exit(1);
                return [3 /*break*/, 20];
            case 20: return [2 /*return*/];
        }
    });
}); };
// Handle uncaught exceptions
process.on('uncaughtException', function (error) {
    console.error(chalk_1.default.red('❌ Uncaught Exception:'), error);
    process.exit(1);
});
process.on('unhandledRejection', function (reason, promise) {
    console.error(chalk_1.default.red('❌ Unhandled Rejection at:'), promise, 'reason:', reason);
    process.exit(1);
});
start();
// Export for testing
exports.default = app;
