import fs from "fs-extra";
import path from "path";
// 文件同步（复制模式）
export const syncCommonFiles = async () => {
  const src = path.resolve(__dirname, "../Common");
  const dst = path.resolve(__dirname, "../../../client/assets/Scripts/Common");

  try {
    // 检查源目录是否存在
    const srcExists = await fs.pathExists(src);
    if (!srcExists) {
      console.error("源目录不存在:", src);
      return;
    }

    // 确保目标目录存在
    await fs.ensureDir(dst);

    // 复制整个目录，覆盖现有文件
    await fs.copy(src, dst, {
      overwrite: true,
      recursive: true
    });

    console.log("文件同步成功！");
  } catch (e) {
    console.error("文件同步失败！", e);
  }
};
//symlink同步
export const symlinkCommon = async () => {
  const src = path.resolve(__dirname, "../Common");
  const dst = path.resolve(__dirname, "../../../client/assets/Scripts/CommonSync");

  try {
    // 检查目标是否存在
    const exists = await fs.pathExists(dst);
    
    if (exists) {
      const stat = await fs.lstat(dst);
      // 如果已经是符号链接
      if (stat.isSymbolicLink()) {
        const linkTarget = await fs.readlink(dst);
        // 如果链接指向正确位置
        if (linkTarget === src) {
          console.log("同步成功！");
          return;
        } else {
          // 链接指向错误位置，删除重建
          await fs.remove(dst);
        }
      } else {
        // 目标存在但不是符号链接，需要删除
        console.warn("目标路径已存在但不是符号链接，正在删除...");
        await fs.remove(dst);
      }
    }

    // 创建符号链接
    await fs.symlink(src, dst, 'junction'); // Windows兼容
    console.log("同步成功！");
  } catch (e) {
    console.log("同步失败！", e);
  }
};