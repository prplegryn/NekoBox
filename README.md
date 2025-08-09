# FreeMote WebGL 示例项目分析

## 项目概述

这是一个基于 Emote 3.9 WebGL 示例的 FreeMote 项目，用于在网页中渲染和交互式控制 2D 角色动画。

## 项目结构

```
WebGL/
├── data/                    # 数据文件目录
│   └── choco.psb           # 角色数据文件 (17MB)
├── driver/                  # 核心驱动文件
│   ├── FreeMoteDriver.js   # FreeMote 主驱动文件 (1.2MB)
│   ├── emoteplayer.js      # Emote 播放器实现 (39KB, 1243行)
│   └── iemote.h            # Emote 接口头文件 (9.1KB, 280行)
├── interactivedemo/         # 交互式演示
│   ├── index.html          # 主页面文件
│   └── main.js             # 交互逻辑实现
└── readme.md               # 项目说明文件
```

## 核心组件分析

### 1. EmotePlayer 类 (`emoteplayer.js`)

主要的播放器类，提供以下功能：

#### 初始化
- `createRenderCanvas(width, height)` - 创建渲染画布
- `constructor(canvas)` - 初始化播放器实例

#### 属性控制
- `scale` - 缩放比例
- `speed` - 播放速度
- `coord` - 坐标位置
- `rot` - 旋转角度
- `globalColor` - 全局颜色
- `globalAlpha` - 全局透明度
- `grayscale` - 灰度效果

#### 时间轴控制
- `mainTimelineLabel` - 主时间轴标签
- `diffTimelineSlot1-6` - 差分时间轴槽位
- `playTimeline(label, flags)` - 播放时间轴
- `stopTimeline(label)` - 停止时间轴
- `fadeInTimeline(label, ms, easing)` - 淡入时间轴
- `fadeOutTimeline(label, ms, easing)` - 淡出时间轴

#### 变量控制
- `setVariable(label, value, ms, easing)` - 设置变量
- `setVariableDiff(module, label, value, ms, easing)` - 设置差分变量
- `getVariable(label)` - 获取变量值

#### 物理效果
- `windSpeed` - 风速
- `windPowMin/Max` - 风力范围
- `meshDivisionRatio` - 网格分割比例
- `hairScale` - 头发缩放
- `partsScale` - 部件缩放
- `bustScale` - 胸部缩放

### 2. 交互功能 (`main.js`)

实现了丰富的交互功能：

#### 眼球追踪
- 根据鼠标位置计算眼球转动角度
- 支持头部和身体的跟随转动
- 不同距离触发不同部位的转动

#### 触摸反应
- 胸部触摸：触发愤怒表情和手臂动作
- 眼部触摸：触发困惑表情和眨眼动作
- 支持鼠标点击和移动端触摸

#### 事件绑定
- `onmousemove` - 鼠标移动事件
- `onclick` - 鼠标点击事件
- `touchmove` - 触摸移动事件
- `touchstart/touchend` - 触摸开始/结束事件

### 3. WebGL 渲染 (`emoteplayer.js`)

#### 渲染设备
- `EmoteDevice` 类负责 WebGL 上下文管理
- 支持抗锯齿、透明度、深度测试等
- 自动处理动画循环和帧更新

#### 着色器
- 顶点着色器：处理位置、纹理坐标、MVP矩阵
- 片段着色器：处理纹理采样和颜色混合

#### 渲染流程
- 初始化 WebGL 环境
- 创建渲染纹理
- 设置动画循环
- 处理多播放器渲染

### 4. 接口定义 (`iemote.h`)

定义了完整的 Emote 接口：

#### 设备接口
- `IEmoteDevice` - 设备创建和管理
- `IEmotePlayer` - 播放器控制接口

#### 平台支持
- Windows (OpenGL/GLEW)
- macOS (OpenGL)
- iOS (OpenGL ES)
- Android (OpenGL ES)
- Emscripten (WebGL)

## 使用方法

### 1. 环境要求
- 支持 WebGL 的现代浏览器
- 需要本地 Web 服务器（不能直接打开 HTML 文件）

### 2. 服务器配置
某些服务器需要为 `.emtbytes` 文件设置 MIME 类型：

```bash
# IIS 配置示例
appcmd set config /section:staticContent /+[fileExtension='.emtbytes',mimeType='text/plain']
```

### 3. 基本使用步骤

```javascript
// 1. 创建播放器
const canvas = document.getElementById('canvas');
const player = new EmotePlayer(canvas);

// 2. 设置基本属性
player.scale = 0.5;

// 3. 加载数据
player.promiseLoadDataFromURL("../data/emote_test2.pure.emtbytes")
.then(() => {
    // 4. 开始交互
    // 设置事件监听器...
});
```

### 4. 数据文件
需要将 `emote_test2.pure.emtbytes` 文件放置在 `data` 文件夹中。

## 技术特点

1. **跨平台支持** - 支持多种操作系统和平台
2. **高性能渲染** - 基于 WebGL 的硬件加速渲染
3. **丰富的交互** - 眼球追踪、触摸反应等
4. **模块化设计** - 清晰的类层次和接口定义
5. **动画控制** - 灵活的时间轴和变量控制
6. **物理效果** - 风力、重力等物理模拟

## 在线演示

- [GitHub Pages 演示](https://project-azusa.github.io/)
- [Gitee 演示](http://projectazusa.gitee.io/project-azusa.github.io/)

## 项目信息

- **项目名称**: Project AZUSA
- **基于**: Emote 3.9 WebGL 示例
- **许可证**: 开源项目
- **主要功能**: 2D 角色动画渲染和交互

## 开发说明

这是一个完整的 WebGL 动画播放器实现，展示了如何在网页中实现复杂的 2D 角色动画系统。代码结构清晰，功能完整，可以作为学习 WebGL 动画开发的优秀参考。

