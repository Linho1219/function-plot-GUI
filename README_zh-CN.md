# Function-Plot-GUI

[![Deploy site to Pages](https://github.com/Linho1219/function-plot-GUI/actions/workflows/deploy.yml/badge.svg)](https://github.com/Linho1219/function-plot-GUI/actions/workflows/deploy.yml) [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Linho1219/function-plot-GUI)

[English README](./README.md)

实例：<https://plot.linho.cc/>

为 [function-plot](https://mauriciopoppe.github.io/function-plot/) 构建的图形化编辑器，使用 Vue3 & Vite 构建。

Function-plot 通过一个 JS 对象传入选项。Function-plot-GUI 提供了一个易用的图形界面编辑器用来生成选项，并输出为 JSON5 格式。JSON5 与 JS 的对象字面量语法是兼容的，因此可以直接复制粘贴使用。

## 与 GeoGebra/Desmos 等工具的关系

GeoGebra/Desmos 等工具拥有更强大的绘制能力、更多的辅助功能，并且支持导出为多样的图像格式。如果你只是需要一个教学用的绘图工具，它们是更好的选择。

GeoGebra 提供完善的部署方案与 API，但部署和集成到 Web 服务中相当复杂。Desmos 不是开源的，这意味着你无法自行部署，如果要将图像嵌入你的网页，只能用他们提供的 `iframe`。依赖外部服务会带来更多的维护成本和不可靠性。因此，使用 function-plot-GUI 编辑、使用 function-plot 库绘制是一个不错的选择。并且配置文件可以以 JSON/JSON5/YAML 等纯文本格式书写，甚至还能通过定义一些私有语法直接放在 Markdown 文件中渲染。文档仓库 [LinhoNotes](https://notes.linho.cc/) 便采用此路线。

## 接入你的应用

Function-plot-GUI 支持通过 base64 编码的 URL 参数传入数据。

例如，对于：

```js
functionPlot({
  target: "example",
  data: [
    {
      fn: "x^2-1",
    },
  ],
});
```

将选项转换为 JSON 或 JSON5，忽略 `target` 字段：

```json
{"data":[{"fn":"x^2-1"}]}
```

然后使用 base64 编码（结尾的 `=` 省略）：

```txt
eyJkYXRhIjpbeyJmbiI6InheMi0xIn1dfQ
```

然后在 hash 部分插入：

```txt
https://plot.linho.cc/#code=eyJkYXRhIjpbeyJmbiI6InheMi0xIn1dfQ
```

> 兼容旧版本：作为 `code` 参数传入：
>
> ```txt
> https://plot.linho.cc/?code=eyJkYXRhIjpbeyJmbiI6InheMi0xIn1dfQ
> ```

打开的网页即可编辑此选项并预览图像。
