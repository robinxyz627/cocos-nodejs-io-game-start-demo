import { Socket } from "dgram";
import { symlinkCommon, syncCommonFiles } from "./Utils";
import { WebSocketServer } from "ws";
import { ApiMsgEnum } from "./Common/Enum";
import { MyServer } from "./Core";
import { Connection } from "./Core";
import { PlayerManager } from "./Biz/PlayerManager";
import { Player } from "./Biz/Player";
import {
    IApiGameStartReq,
    IApiGameStartRes,
    IApiPlayerJoinReq, IApiPlayerJoinRes, IApiPlayerListReq, IApiPlayerListRes,
    IApiRoomCreateReq, IApiRoomCreateRes, IApiRoomJoinReq, IApiRoomJoinRes,
    IApiRoomLeaveReq, IApiRoomLeaveRes, IApiRoomListReq, IApiRoomListRes
} from "./Common/Api";
import { RoomManager } from "./Biz/RoomManager";
import { Room } from "./Biz/Room";

declare module "./Core" {
    interface Connection {
        playerId: number;
    }
}

syncCommonFiles();

const sv = new MyServer({ port: 9876 });

sv.on("connection", (cn: Connection) => {
    console.log("connect->", cn.playerId);
});

sv.on("disconnection", (cn: Connection) => {
    console.log("disconnect->", cn.playerId);
    if (cn.playerId) {
        console.log(`玩家${cn.playerId} 退出游戏`);
        //判断玩家是否在房间内，若在则离开房间
        const player = PlayerManager.Instance.getPlayer(cn.playerId);
        if (player && player.rid !== -1) {
            console.log(`玩家${cn.playerId} 退出房间${player.rid}`);
            const room = RoomManager.Instance.leaveRoom(player.rid, cn.playerId);
            RoomManager.Instance.syncRooms();
            RoomManager.Instance.syncRoom(room.rid);
        }
        PlayerManager.Instance.removePlayer(cn.playerId);
        PlayerManager.Instance.syncPlayers();
    }
});


sv.setApi(ApiMsgEnum.ApiPlayerJoin, (cn: Connection, data: IApiPlayerJoinReq): IApiPlayerJoinRes => {
    const { nickName, attachment } = data;
    //判断连接是否存在（玩家反复登陆）
    let player: Player = null;
    if (cn.playerId) {
        player = PlayerManager.Instance.getPlayer(cn.playerId);
        player.nickName = nickName;
        console.log(`玩家${player.id},修改昵称${nickName}`);
    } else {
        player = PlayerManager.Instance.createPlayer({ nickName: nickName, attachment: attachment, connection: cn });
        console.log(`玩家${player.id},昵称${nickName}加入游戏`);
    }
    PlayerManager.Instance.syncPlayers();
    return {
        id: player.id,
    };
});

sv.setApi(ApiMsgEnum.ApiPlayerList, (cn: Connection, data: IApiPlayerListReq): IApiPlayerListRes => {
    console.log(`玩家${cn.playerId}请求玩家列表`);
    return {
        players: PlayerManager.Instance.getPlayersView(),
    };
});

//todo 离开房间切换房主逻辑
sv.setApi(ApiMsgEnum.ApiRoomCreate, (cn: Connection, data: IApiRoomCreateReq): IApiRoomCreateRes => {
    if (!cn.playerId) {
        throw new Error("未登录不能创建房间");
    }
    const room = RoomManager.Instance.createRoom();
    const rm = RoomManager.Instance.joinRoom(room.rid, cn.playerId);
    RoomManager.Instance.setRoomMaster(room.rid, cn.playerId);
    if (!rm) {
        throw new Error("加入房间失败");
    }
    //有玩家创建房间后群发房间列表
    RoomManager.Instance.syncRooms();
    return {
        room: RoomManager.Instance.getRoomView(rm),
    };
});
/**
 * 设置房间列表api
 */
sv.setApi(ApiMsgEnum.ApiRoomList, (cn: Connection, data: IApiRoomListReq): IApiRoomListRes => {
    console.log(`玩家${cn.playerId}请求房间列表`);
    return {
        list: RoomManager.Instance.getRoomsView(),
    };
});

/**
 * 玩家加入房间api
 */
sv.setApi(ApiMsgEnum.ApiRoomJoin, (cn: Connection, data: IApiRoomJoinReq): IApiRoomJoinRes => {
    console.log(`玩家${cn.playerId}请求加入房间${data.rid}`);
    const room = RoomManager.Instance.joinRoom(data.rid, cn.playerId);
    if (!room) {
        throw new Error("加入房间失败");
    }
    //新玩家加入后群发房间列表
    RoomManager.Instance.syncRooms();
    RoomManager.Instance.syncRoom(data.rid);
    return {
        room: RoomManager.Instance.getRoomView(room),
    };
});

sv.setApi(ApiMsgEnum.ApiRoomLeave, (cn: Connection, data: IApiRoomLeaveReq): IApiRoomLeaveRes => {
    const player = PlayerManager.Instance.getPlayer(cn.playerId);
    console.log(`玩家${cn.playerId}请求离开房间${player.rid}`);
    const room = RoomManager.Instance.leaveRoom(player.rid, cn.playerId);
    if (!room) {
        throw new Error("角色不在房间，离开房间失败");
    }
    //玩家离开后群发房间列表
    RoomManager.Instance.syncRooms();
    RoomManager.Instance.syncRoom(room.rid);
    PlayerManager.Instance.syncPlayers();
    return {};
});

sv.setApi(ApiMsgEnum.ApiGameStart, (cn: Connection, data: IApiGameStartReq): IApiGameStartRes => {
    //判断是否是房主
    const player = PlayerManager.Instance.getPlayer(cn.playerId);
    if (player.rid === -1) {
        throw new Error("未加入房间，不能开始游戏");
    }
    const room = RoomManager.Instance.getRoom(player.rid);
    if (room.master !== cn.playerId) {
        throw new Error("非房主不能开始游戏");
    }
    console.log(`房主${cn.playerId}请求开始游戏`);
    RoomManager.Instance.startRoom(player.rid);
    return {};
})

sv.start()
    .then(() => {
        console.log("server 启动完成");
    })
    .catch(e => {
        console.log("server 启动失败", e);
    });

// const wss = new WebSocketServer({
//     port: 9876,
// });

// let inputs = [];

// wss.on("connection", (ws) => {
//     console.log("New connection");
//     ws.on("message", (message) => {
//         const str = message.toString();
//         try{
//             const msg = JSON.parse(str);
//             const {name,data} = msg;
//             const {frameId,input} = data;
//             inputs.push(input);
//         }catch(e){
//             console.log(e);
//         }
//     });

//     setInterval(() => {
//         const temp = inputs;
//         inputs = [];
//         const obj = {
//             name: ApiMsgEnum.MsgServerSync,
//             data: {
//                 inputs: temp,
//             },
//         };
//         ws.send(JSON.stringify(obj));
//     }, 30);

//     ws.send("Hello client!");
//     const obj = {
//         name: "张三",
//         data: "ohohohoh"
//     };
//     ws.send(JSON.stringify(obj));
// });

// wss.on("listening", () => {
//     console.log("启动端口 9876");
// })
