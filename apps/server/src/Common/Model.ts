import {
    IApiGameStartReq,
    IApiGameStartRes,
    IApiPlayerJoinReq, IApiPlayerJoinRes, IApiPlayerListReq, IApiPlayerListRes,
    IApiRoomCreateReq, IApiRoomCreateRes, IApiRoomJoinReq, IApiRoomJoinRes, IApiRoomLeaveReq, IApiRoomLeaveRes, IApiRoomListReq, IApiRoomListRes
} from "./Api";
import {
    IMsgClientSync, IMsgServerSync, IMsgPlayerList, IMsgRoomList,
    IMsgRoom,
    IMsgGameStart
} from "./Msg";
import { ApiMsgEnum } from "./Enum";


export interface IModel {
    api: {
        [ApiMsgEnum.ApiPlayerJoin]: {
            req: IApiPlayerJoinReq,
            res: IApiPlayerJoinRes
        }
        [ApiMsgEnum.ApiPlayerList]: {
            req: IApiPlayerListReq,
            res: IApiPlayerListRes
        }
        [ApiMsgEnum.ApiRoomCreate]: {
            req: IApiRoomCreateReq,
            res: IApiRoomCreateRes
        }
        [ApiMsgEnum.ApiRoomList]: {
            req: IApiRoomListReq,
            res: IApiRoomListRes
        }
        [ApiMsgEnum.ApiRoomJoin]: {
            req: IApiRoomJoinReq,
            res: IApiRoomJoinRes
        }
        [ApiMsgEnum.ApiRoomLeave]: {
            req: IApiRoomLeaveReq,
            res: IApiRoomLeaveRes
        }
        [ApiMsgEnum.ApiGameStart]: {
            req: IApiGameStartReq,
            res: IApiGameStartRes
        }

    }
    msg: {
        [ApiMsgEnum.MsgClientSync]: IMsgClientSync,
        [ApiMsgEnum.MsgServerSync]: IMsgServerSync,
        [ApiMsgEnum.MsgPlayerList]: IMsgPlayerList,
        [ApiMsgEnum.MsgRoomList]: IMsgRoomList,
        [ApiMsgEnum.MsgRoom]: IMsgRoom,
        [ApiMsgEnum.MsgGameStart]: IMsgGameStart,
    }
}
