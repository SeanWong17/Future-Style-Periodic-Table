# ⚛️ Future Style Periodic Table | 未来风格元素周期表

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## 📖 项目简介

这是一个基于原生 HTML、CSS 和 JavaScript 构建的交互式**未来风格元素周期表**。

本项目旨在通过现代化的 Web 技术（如 CSS Grid 布局、3D 变换、CSS 变量等）展示化学元素数据，方便学生和开发者学习相关知识，同时也探索了前端视觉特效在教育类应用中的可能性。

整体设计采用深色赛博朋克（Cyberpunk）风格，包含霓虹光效、玻璃拟态（Glassmorphism）以及平滑的交互动画。

![效果总览](overview.png)
![单个元素](gold.png)

## ✨ 核心功能

1.  **炫酷视觉体验**：
    * 沉浸式深色背景与动态粒子特效。
    * 元素的分类颜色高亮与悬停发光效果。
    * 全响应式设计，适配桌面端、平板及移动端（包含横屏提示）。

2.  **多维度数据可视化（热力图模式）**：
    * 除了标准的周期表视图，支持切换以下属性的热力图展示：
        * 原子半径
        * 电负性
        * 电离能
        * 熔点 / 沸点

3.  **3D 原子结构模拟**：
    * 点击元素可查看详细信息弹窗。
    * **CSS 3D 原子模型**：实时渲染电子轨道和电子运动，支持鼠标/手指拖拽旋转视角。
    * 展示电子排布（Shells & Subshells）。

4.  **详细的元素数据**：
    * 包含原子序数、相对原子质量、英文名、同位素稳定性、常见化合价等详细信息。

5.  **便捷的搜索与交互**：
    * 支持通过元素符号、中文名、英文名或原子序数快速检索。
    * 点击图例可筛选特定类别的元素（如过渡金属、卤素等）。
  
## 🛠️ 技术栈

本项目完全使用原生技术栈构建，无需安装 Node.js 或构建工具：

* **HTML5**: 语义化标签构建结构。
* **CSS3**: 
    * 使用 `Grid` 和 `Flexbox` 进行复杂布局。
    * 利用 `transform-style: preserve-3d` 实现原子模型。
    * CSS Variables 实现主题颜色管理。
    * Media Queries 实现响应式适配。
* **JavaScript (ES6+)**: 
    * DOM 操作与事件处理。
    * JSON 数据驱动的元素渲染。
    * 动态计算电子排布算法。

## 🚀 快速开始

由于本项目是纯静态网页，部署和运行非常简单。

### 本地运行
1.  克隆本项目或下载源码：
2.  直接使用浏览器打开 `index.html` 文件即可查看效果。

### 在线体验
  https://seanwong17.github.io/Future-Style-Periodic-Table/

  https://periodic-table-of-element-pro.netlify.app/

### 学习建议
你可以通过阅读源码学习以下知识点：
* 如何使用 CSS Grid 绘制非规则的网格布局（周期表形状）。
* 如何使用 CSS 关键帧动画制作电子绕核旋转效果。
* JS 如何处理数组数据并动态生成 DOM 节点。

## 👏 致谢 (Credits)

本项目的基础代码灵感来源于网络博主的分享，在此表示由衷的感谢！项目的完善是为了更好地学习前端技术与化学知识。

* **视频链接**: [https://www.douyin.com/video/7575067444734622385]

*如果您是原作者并希望修改此处的署名方式，请随时提交 Issue 或联系我。*

## 📄 开源协议 (License)

本项目采用 [MIT License](LICENSE) 开源协议。

这意味着你可以自由地使用、复制、修改和分发本项目，只需在你的衍生作品中保留原作者的版权声明和许可声明即可。
