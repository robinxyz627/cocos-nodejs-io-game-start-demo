import Singleton from "../Base/Singleton";
import { IApiPlayerJoinReq } from "../Common/Api";
import { ApiMsgEnum } from "../Common/Enum";
import { Connection } from "../Core";
import { Player } from "./Player";

export class PlayerManager extends Singleton {
    static get Instance() {
        return super.GetInstance<PlayerManager>();
    }

    nextPlayerId = 1;
    players: Set<Player> = new Set();
    playerIdMap: Map<number, Player> = new Map();
    createPlayer({ nickName, connection }: IApiPlayerJoinReq & { connection: Connection }) {
        const player = new Player({ id: this.nextPlayerId++, nickName, connection });
        connection.playerId = player.id;
        this.players.add(player);
        this.playerIdMap.set(player.id, player);
        return player;
    }

    removePlayer(pid: number) {
        if (!this.playerIdMap.has(pid)) {
            return;
        }
        const player = this.playerIdMap.get(pid);
        this.players.delete(player);
        this.playerIdMap.delete(pid);
    }

    getPlayer(pid: number) {
        return this.playerIdMap.get(pid);
    }

    syncPlayers() { 
        for(const player of this.players){
            player.connection.sendMsg(ApiMsgEnum.MsgPlayerList,{
                list:this.getPlayersView(),
            })
        }
    }


    /**
     * 过滤玩家视图端需要的数据
     * { id, nickName, rid }
     */
    getPlayerView({ id, nickName, rid }: Player) {
        return { id, nickName, rid };
    }

    /**
     * 获取所有玩家视图
     * @param players 玩家集合，默认全部玩家,可自己指定
     * @return '{ id, nickName, rid }[]'
     */
    getPlayersView(players: Set<Player> = this.players) {
        return [...players].map((player)=>this.getPlayerView(player));
    }
}