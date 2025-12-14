import { EntityTypeEnum, InputTypeEnum } from "./Enum";


export interface IVector2 {
    x: number,
    y: number,
}

/**
 * @角色id userId
 * @角色类型 type
 * @血量 hp
 * @武器类型 weaponType?
 * @子弹类型 bulletType?
 * @位置 position
 * @方向 direction
 */
export interface IActor {
    userId: number,
    hp: number,
    type: EntityTypeEnum,
    weaponType?: EntityTypeEnum,
    bulletType?: EntityTypeEnum,
    position: IVector2,
    direction: IVector2,
}
/**
 * @子弹id id-用于查表获取子弹组件引用
 * @发射者 owner
 * @起始位置 initPosition
 * @射程 range-用于判断何时销毁
 * @伤害 damage
 * @位置 position
 * @方向 direction
 * +@碰撞点数组
 */
export interface IBullet {
    id: number,
    owner: number,
    initPosition: IVector2,
    range: number,
    damage: number,
    position: IVector2,
    direction: IVector2,
    type: EntityTypeEnum,
    reboundPoints: IVector2[],
}

export interface IState {
    actors: IActor[],
    bullets: IBullet[],
    nextBulletId: number,
    seed: number,
}

export type IClientInput = IActorMove | IWeaponShoot| ITimePast;

export interface IActorMove {
    userId: number,
    type: InputTypeEnum.ActorMove,
    direction: IVector2,
    dt: number,
}

/**
 * 武器发射接口
 * @类型 type
 * @持有者 owner
 * @发射位置 position
 * @弹道方向 direction
 */
export interface IWeaponShoot {
    type: InputTypeEnum.WeaponShoot,
    owner: number,
    position: IVector2,
    direction: IVector2,
}
/**
 * 时间流逝接口
 * @类型 type
 * @帧时间 dt
 */
export interface ITimePast {
    type: InputTypeEnum.TimePast,
    dt: number,
}
