import { EventEmitter } from "stream";
import { MyServer } from "./MyServer";
import { WebSocket, WebSocketServer } from "ws";
import { IModel } from "../Common/Model";

interface IListenItem {
    cb: (cn: Connection, data: any) => void,
    ctx: unknown,
}

const em = new EventEmitter();

export class Connection extends EventEmitter {
    private msgMap: Map<string, Array<IListenItem>> = new Map();
    // playerId: number;
    constructor(private server: MyServer, private ws: WebSocket) {
        super();
        this.ws.on("close", () => {
            this.emit("close");
        });

        this.ws.on("message", (message) => {
            const str = message.toString();
            try {
                const msg = JSON.parse(str);
                const { name, data } = msg;
                // const { frameId, input } = data;
                if (this.server.apiMap.has(name)) {
                    try {
                        const cb = this.server.apiMap.get(name);
                        const res = cb.call(null, this, data);
                        this.sendMsg(name, {
                            success: true,
                            res
                        });
                    } catch (e) {
                        this.sendMsg(name, {
                            success: false,
                            error: e.message
                        });
                    }
                } else {
                    try {
                        if (this.msgMap.has(name)) {
                            this.msgMap.get(name).forEach(({ cb, ctx }) => {
                                cb.call(ctx, this, data);
                            })
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }
            } catch (e) {
                console.log(e);
            }
        });

    }

    public sendMsg<T extends keyof IModel['msg']>(name: T, data: IModel['msg'][T]) {
        const msg = { name, data };
        this.ws.send(JSON.stringify(msg));
    }

    public listenMsg<T extends keyof IModel['msg']>(name: T, cb: (cn: Connection, args: IModel['msg'][T]) => void, ctx: unknown) {
        if (this.msgMap.has(name)) {
            this.msgMap.get(name).push({ cb, ctx })
        } else {
            this.msgMap.set(name, [{ cb, ctx }])
        }
    }

    public unlistenMsg<T extends keyof IModel['msg']>(name: T, cb: (cn: Connection, args: IModel['msg'][T]) => void, ctx: unknown) {
        if (this.msgMap.has(name)) {
            const index = this.msgMap.get(name).findIndex(i => i.cb === cb && i.ctx === ctx);
            index > -1 && this.msgMap.get(name).splice(index, 1);
        }
    }
}