## application/octet-stream 文件校验分析

### 相关代码

[validation.ts](../src/lib/minio/validation.ts)

### application/octet-stream 出现的场景

`application/octet-stream` 是浏览器在**无法根据文件扩展名推断出具体 MIME 类型时**使用的通用二进制类型。以下场景会触发：

| 场景                     | 说明                                                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `.md` / `.markdown` 文件 | 最常见。Windows 系统的 MIME 注册表中通常没有 `.md` 映射，浏览器拿不到具体类型，就会 fallback 到 `application/octet-stream` |
| `.txt` 文件（极端情况）  | 某些老旧浏览器或配置不当的 OS 上，`.txt` 也可能被识别为 octet-stream                                                       |
| 拖拽上传                 | 通过 `drag & drop` 上传文件时，浏览器对 MIME 的识别不如 `<input type="file">` 可靠                                         |
| 某些 Linux 桌面环境      | 部分 Linux 发行版的 MIME 数据库不完整，也会导致 `.md` 被识别为 octet-stream                                                |

### 正常上传不触发的原因

如果 OS（如 macOS 或新版 Windows 11）能正确识别 `.md` 为 `text/markdown`，`file.type` 就直接匹配 `ALLOWED_MIME_TYPES` 中的 `text/markdown` 或 `text/plain`，不会走到 octet-stream fallback 分支。

### 代码中的 Bug

octet-stream 分支校验通过后**没有 `return null`**，代码会继续往下走到 `ALLOWED_MIME_TYPES` 的检查：

```typescript
// L30-44: octet-stream 校验通过后，没有 return
if (file.type === 'application/octet-stream') {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!OCTET_STREAM_ALLOWED_EXTENSIONS.includes(extension)) {
    return { ... };
  }
  if (file.size > MAX_OCTET_STREAM_SIZE) {
    return { ... };
  }
  // ❌ 缺少 return null —— 代码继续执行！
}

// L46-52: application/octet-stream 不在 ALLOWED_MIME_TYPES 中，会被拒绝
if (!(file.type in ALLOWED_MIME_TYPES)) {
  return {
    field: 'type',
    message: `File type ${file.type} is not allowed...`,
  };
}
```

**结果**：即使用户上传的是合法的 `.md` / `.txt` 文件，如果浏览器以 `application/octet-stream` 发送，第一段校验通过后会立刻被第二段拒绝。这个 fallback 分支实际上**永远不会正常工作**。

### 修复方案

在 octet-stream 校验通过后，添加 `return null` 提前返回：

```diff
     if (file.size > MAX_OCTET_STREAM_SIZE) {
       return {
         field: 'size',
         message: `...`,
       };
     }
+    return null;
   }
```

### 允许的 octet-stream 文件类型

| 扩展名      | 最大大小 |
| ----------- | -------- |
| `.md`       | 2MB      |
| `.markdown` | 2MB      |
| `.txt`      | 2MB      |
