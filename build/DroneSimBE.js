"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./Model/server");
let app = new server_1.DroneWebSocketServer().getApp();
exports.app = app;
