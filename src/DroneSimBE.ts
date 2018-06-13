import { DroneWebSocketServer } from './Model/server';

let app = new DroneWebSocketServer().getApp();

export { app };
