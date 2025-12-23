import { IPlayer, IPlayerListInfo, IRoom } from "./Api";
import { IClientInput, IState } from "./State";

export interface IMsgClientSync{
    input:IClientInput,
    frameId:number
}

export interface IMsgServerSync{
    inputs:IClientInput[],
    lastFrameId:number
}

export interface IMsgPlayerList{
    list:IPlayerListInfo[]
}

export interface IMsgRoomList{
    list:IRoom[]
}
/**
 * 房间场景内同步
 */
export interface IMsgRoom{
    room:IRoom
}

export interface IMsgGameStart{
    state:IState
}