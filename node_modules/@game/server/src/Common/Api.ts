export interface IPlayer{
    id: number;
    nickName: string;
    rid: number;
}

export interface IRoom{
    rid: number;
    players:IPlayer[];
    master?: number;//房主id
}

export interface IApiPlayerJoinReq{
    nickName: string;

}

export interface IApiPlayerJoinRes{
    player: IPlayer;
}

export interface IApiPlayerListReq{

}

export interface IApiPlayerListRes{
    players: IPlayer[];
}

export interface IApiRoomCreateReq{

}

export interface IApiRoomCreateRes{
    room:IRoom;
}

export interface IApiRoomListReq{

}

export interface IApiRoomListRes{
    list:IRoom[];
}

export interface IApiRoomJoinReq{
    rid:number;
}

export interface IApiRoomJoinRes{
    room:IRoom;
}

export interface IApiRoomLeaveReq{

}

export interface IApiRoomLeaveRes{

}

export interface IApiGameStartReq{

}

export interface IApiGameStartRes{

}