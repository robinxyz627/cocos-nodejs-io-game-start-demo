export interface IPlayAttachment {
    weaponId: number;
    actorId: number;
}

export interface IPlayer {
    id: number;
    nickName: string;
    rid: number;
    attachment: IPlayAttachment;
}

export interface IPlayerListInfo {
    id: number;
    nickName: string;
    rid: number;
}

export interface IRoom {
    rid: number;
    players: IPlayerListInfo[];
    master?: number;//房主id
}

export interface IApiPlayerJoinReq {
    nickName: string;
    attachment: IPlayAttachment;
}

export interface IApiPlayerJoinRes {
    id: number;
}

export interface IApiPlayerListReq {

}

export interface IApiPlayerListRes {
    players: IPlayerListInfo[];
}

export interface IApiRoomCreateReq {

}

export interface IApiRoomCreateRes {
    room: IRoom;
}

export interface IApiRoomListReq {

}

export interface IApiRoomListRes {
    list: IRoom[];
}

export interface IApiRoomJoinReq {
    rid: number;
}

export interface IApiRoomJoinRes {
    room: IRoom;
}

export interface IApiRoomLeaveReq {

}

export interface IApiRoomLeaveRes {

}

export interface IApiGameStartReq {

}

export interface IApiGameStartRes {

}