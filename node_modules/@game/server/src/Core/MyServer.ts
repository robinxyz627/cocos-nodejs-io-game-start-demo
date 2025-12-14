import { WebSocketServer, WebSocket } from "ws";
import { Connection } from "./Connection";
import { ApiMsgEnum } from "../Common/Enum";
import { EventEmitter } from "stream";
import { IModel } from "../Common/Model";
export class MyServer extends EventEmitter {
    port: number = 9876;
    wss: WebSocketServer;
    connections: Set<Connection> = new Set();
    apiMap: Map<ApiMsgEnum, Function> = new Map();
    constructor({ port }: { port: number }) {
        super();
        this.port = port;
    }

    async start() {
        return new Promise((resolve, reject) => {
            this.wss = new WebSocketServer({ port: this.port });
            this.wss.on("listening", () => {
                console.log(`Server listening on port ${this.port}`);
                resolve(true);
            });
            this.wss.on("error", (e) => {
                console.log("Server error:", e);
                reject(e);
            });
            this.wss.on("close", () => {
                console.log("Server closed");
                reject(false);
            });
            this.wss.on("connection", (ws: WebSocket) => {
                const cn = new Connection(this, ws);
                this.connections.add(cn);
                this.emit("connection", cn);
                console.log("新连接，当前连接数->", this.connections.size);
                cn.on("close", () => {
                    this.connections.delete(cn);
                    console.log("断开连接，当前连接数->", this.connections.size);
                    this.emit("disconnection", cn);
                })
            })
        })

    }

    /**
     * 添加api,绑定回调,回调会在onmessage中执行
     * @param name 
     * @param cb 
     */
    setApi<T extends keyof IModel['api']>(name: T, cb: (cn:Connection,args:IModel['api'][T]['req'])=>void) {
        this.apiMap.set(name, cb);
    }
}