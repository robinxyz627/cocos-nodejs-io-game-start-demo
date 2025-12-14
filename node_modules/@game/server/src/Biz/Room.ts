import { get } from "http";
import { ApiMsgEnum, EntityTypeEnum, InputTypeEnum } from "../Common/Enum";
import { IActorMove, IClientInput, IState } from "../Common/State";
import { Connection } from "../Core";
import { Player } from "./Player";
import { PlayerManager } from "./PlayerManager";
import { RoomManager } from "./RoomManager";
import { IMsgClientSync } from "../Common/Msg";
import { toFixed } from "../Common/toFix";
export class Room {
    /**
     * 房主id
     */
    master: number;
    /**
     * 玩家集合
     */
    players: Set<Player> = new Set();
    /**
     * 房间id
     */
    rid: number;

    pendingInput: IClientInput[] = [];

    lastTime: number;

    lastPlayerFrameIdMap: Map<number, number> = new Map();

    constructor(rid: number) {
        this.rid = rid;
    }

    addPlayer(playerId: number) {
        const player = PlayerManager.Instance.getPlayer(playerId);
        if (player) {
            this.players.add(player);
            player.rid = this.rid;
        }
    }

    /**
     * 移除玩家（都走了则关闭房间）
     * @param playerId 玩家id
     */
    removePlayer(playerId: number) {
        const player = PlayerManager.Instance.getPlayer(playerId);
        if (player && this.players.has(player)) {
            this.players.delete(player);
            player.rid = -1;
            //如果是房主离开，则房主转移给集合的第一个玩家
            if (this.master === playerId && this.players.size > 0) {
                this.master = this.players.values().next().value.id;
            }
            //如果房间没人了，则解散房间
            if (this.players.size <= 0) {
                RoomManager.Instance.removeRoom(this.rid);
            }
        }
    }

    close() {
        this.players.clear();
        //删除引用
    }

    sync() {
        for (const player of this.players) {
            player.connection.sendMsg(ApiMsgEnum.MsgRoom, {
                room: RoomManager.Instance.getRoomView(this),
            })
        }
    }

    /** 
     * 游戏开始,初始化帧数据结构
     * 参考帧同步
     * */
    start() {
        const state: IState = {
            actors: [...this.players].map((player, index) => ({
                userId: player.id,
                nickName: player.nickName,
                hp: 100,
                type: EntityTypeEnum.Actor1,
                weaponType: EntityTypeEnum.Weapon1,
                bulletType: EntityTypeEnum.Bullet2,
                position: {
                    x: -150 + index * 100,
                    y: -150 + index * 100,
                },
                direction: {
                    x: 1,
                    y: 0
                },
            })),
            bullets: [],
            nextBulletId: 1,
            seed: Math.random()*1024,
        };
        for (const player of this.players) {
            player.connection.sendMsg(ApiMsgEnum.MsgGameStart, {
                state,
            })
            player.connection.listenMsg(ApiMsgEnum.MsgClientSync, this.getClientSync, this);
        }

        const timer = setInterval(() => {
            this.sendServerSync();
        }, 100);

        const timer2 = setInterval(() => {
            this.timePast();
        }, 16);

    }

    /**
     * 接收玩家输入
     */
    getClientSync(cn: Connection, { input, frameId }: IMsgClientSync) {
        // console.log("getClientSync",input);
        this.pendingInput.push(input);
        this.lastPlayerFrameIdMap.set(cn.playerId, frameId);//覆盖记录玩家最后的帧数
    }

    sendServerSync() {
        const inputs = this.pendingInput;
        this.pendingInput = [];
        for (const player of this.players) {
            player.connection.sendMsg(ApiMsgEnum.MsgServerSync, {
                inputs,
                lastFrameId: this.lastPlayerFrameIdMap.get(player.id) ?? 0,
            })
        }
        // inputs.forEach(input=>{
        //     switch(input.type){
        //         case InputTypeEnum.ActorMove:
        //             const moveInput = input as IActorMove;
        //             console.log("moveInput",moveInput);
        //     }
        // })
    }

    timePast() {
        // console.log("timePast",dt);
        const now = process.uptime();
        const dt = now - (this.lastTime ?? now);
        this.pendingInput.push({
            type: InputTypeEnum.TimePast,
            dt:toFixed(dt),
        });
        this.lastTime = now;
    }

}
