import { Socket } from "dgram";
import { symlinkCommon } from "./Utils";
import { WebSocketServer } from "ws";

symlinkCommon();

const wss = new WebSocketServer({
    port: 9876
});
wss.on("connection", (ws) => {
    console.log("New connection");
    ws.on("message", (message) => {
        console.log(`Received: ${message}`);
    });
    ws.send("Hello client!");
    const obj = {
        name: "张三",
        data: "ohohohoh"
    };
    ws.send(JSON.stringify(obj));
});

wss.on("listening", () => {
    console.log("启动端口 9876");
})
