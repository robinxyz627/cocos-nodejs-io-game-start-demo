export const toFixed = (num: number, fix: number = 3) => {
    const scale = 10 ** fix;
    return Math.floor(num * scale) / scale;
}