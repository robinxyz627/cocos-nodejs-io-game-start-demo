import Singleton from "../Base/Singleton";
import { IRoom } from "../Common/Api";
import { ApiMsgEnum } from "../Common/Enum";
import { IMsgRoomList } from "../Common/Msg";
import { PlayerManager } from "./PlayerManager";
import { Room } from "./Room";


export class RoomManager extends Singleton {
    static get Instance() {
        return super.GetInstance<RoomManager>();
    }

    nextRoomId = 1;
    rooms: Set<Room> = new Set();
    roomIdMap: Map<number, Room> = new Map();
    createRoom() {
        const room = new Room(this.nextRoomId++);
        this.rooms.add(room);
        this.roomIdMap.set(room.rid, room);
        return room;
    }

    joinRoom(rid: number, playerId: number): Room | null {
        const room = this.roomIdMap.get(rid);
        if (room) {
            room.addPlayer(playerId);
            return room;
        }
        return null;
    }

    /**
     * 开始启动房间游戏
     * @param rid
     * 
     */
    startRoom(rid: number) {
        const room = this.getRoom(rid);
        if (!room) {
            return;
        }
        room.start();
    }

    /**
     * 离开房间
     * @param rid
     * @param playerId
     * 
     */
    leaveRoom(rid: number, playerId: number) {
        const room = this.roomIdMap.get(rid);
        if (room) {
            room.removePlayer(playerId);
            return room;
        }
        return null;
    }

    setRoomMaster(rid: number, playerId: number) {
        const room = this.roomIdMap.get(rid);
        if (room) {
            room.master = playerId;
        }
    }

    removeRoom(rid: number) {
        if (!this.roomIdMap.has(rid)) {
            return;
        }
        const room = this.roomIdMap.get(rid);
        if (room) {
            room.close();
            this.rooms.delete(room);
            this.roomIdMap.delete(rid);
        }

    }

    getRoom(rid: number) {
        return this.roomIdMap.get(rid);
    }

    /**
     * 获取所有房间视图
     * @param rooms 房间集合，默认全部房间,可自己指定
     * @return ' {rid, players} [] '
     */
    getRoomsView(rooms: Set<Room> = this.rooms) {
        return [...rooms].map((r) => this.getRoomView(r));
    }

    /**
     * 获取房间视图
     * @param  Room
     * @returns  ' {rid, players} '
     */
    getRoomView(r: Room) {
        const Iroom: IRoom = {
            rid: r.rid,
            players: PlayerManager.Instance.getPlayersView(r.players),
            master: r.master,
        }
        return Iroom;
    }

    /**
     * 同步房间列表,给玩家群发
     */
    syncRooms() {
        for (const player of PlayerManager.Instance.players) {
            const msg: IMsgRoomList = {
                list: this.getRoomsView(),
            }
            player.connection.sendMsg(ApiMsgEnum.MsgRoomList, msg);
        }
    }

    /**
     * 同步房间内信息,给房间内玩家群发
     */
    syncRoom(rid: number) {
        const room = this.getRoom(rid);
        if (!room) {
            return;
        }
        room.sync();
    }

}