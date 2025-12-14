import { Connection } from "../Core";
export class Player {
    /**
     * 玩家id
     */ 
    id: number;
    /**
     * 玩家昵称
     */
    nickName: string;
    /**
     * 玩家连接
     */
    connection: Connection;
    /**
     * 房间id
     */
    rid: number;

    constructor({id, nickName, connection}:Pick<Player, "id" | "nickName" | "connection">) {
        this.id = id;
        this.nickName = nickName;
        this.connection = connection;
    }

}
