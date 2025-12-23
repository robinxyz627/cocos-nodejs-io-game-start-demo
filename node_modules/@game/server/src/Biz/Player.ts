import { IPlayAttachment } from "../Common/Api";
import { EntityTypeEnum } from "../Common/Enum";
import { Connection } from "../Core";

interface Attachment {
    weapon: EntityTypeEnum,
    actor: EntityTypeEnum,
}
function enumToArray<T>(enumObj: T): T[keyof T][] {
    return Object.keys(enumObj)
        .filter(key => isNaN(Number(key))) // 过滤数字键
        .map(key => enumObj[key as keyof T]);
}
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
    /**
     * 玩家附加数据
     */
    attachment: Attachment = null;

    // 静态映射表：数字ID到EntityTypeEnum值的数组
    private static readonly entityTypeArray:EntityTypeEnum[] = enumToArray(EntityTypeEnum);

    constructor({ id, nickName, connection }: Pick<Player, "id" | "nickName" | "connection">) {
        this.id = id;
        this.nickName = nickName;
        this.connection = connection;
    }

    // setAttachment(attachment: IPlayAttachment) {
    //     //根据id赋字符串枚举
    //     let attach = {
    //         weapon: EntityTypeEnum[attachment.weaponId],
    //         actor: EntityTypeEnum[attachment.actorId],
    //     }
    //     this.attachment = attach;
    // }

    private isValidEntityType(id:number):boolean{
        return id >= 0 && id < Player.entityTypeArray.length
    }
    setAttachment(attachment: IPlayAttachment) {
        if(this.isValidEntityType(attachment.weaponId) && this.isValidEntityType(attachment.actorId)){
            this.attachment = {
                weapon: Player.entityTypeArray[attachment.weaponId],
                actor: Player.entityTypeArray[attachment.actorId],
            }
        }
    }


}
