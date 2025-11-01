# Function-Plot-GUI

[中文文档](./README_zh-CN.md) · [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Linho1219/function-plot-GUI)

Live Demo: <https://plot.linho.cc/>

A graphical editor built for [function-plot](https://mauriciopoppe.github.io/function-plot/), developed using Vue 3 & Vite.

Function-plot accepts configuration options via a JavaScript object. Function-Plot-GUI provides an intuitive graphical interface for generating these options and outputs them in JSON5 format. JSON5 is compatible with JavaScript object literal syntax, making it easy to copy and paste directly.

## Comparison with GeoGebra/Desmos

Tools like GeoGebra and Desmos offer more powerful plotting capabilities, additional assistive features, and support for exporting to various image formats. If you're looking for a drawing tool primarily for teaching or learning purposes, they are likely better suited for your needs.

GeoGebra provides comprehensive deployment options and APIs, but setting it up and integrating it into a web service can be quite complex. Desmos is not open-source, which means you cannot self-host it. If you want to embed its graphs in your own site, you're limited to using the iframe they provide. Relying on external services can introduce additional maintenance overhead and potential instability. Therefore, using Function-Plot-GUI for editing and the function-plot library for rendering is a solid alternative. Configuration files can be written in plain text formats like JSON, JSON5, or YAML — and even embedded directly into Markdown files using custom syntax. The documentation site [LinhoNotes](https://notes.linho.cc/) adopts this approach.

## Integrating with Your Application

Function-plot-GUI supports receiving data via a base64-encoded URL parameter.

For example, given the following function-plot configuration:

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

Convert the options to JSON or JSON5, excluding the `target` field:

```json
{"data":[{"fn":"x^2-1"}]}
```

Then base64 encode it (omit the trailing `=`):

```txt
eyJkYXRhIjpbeyJmbiI6InheMi0xIn1dfQ
```

Insert it in hash:

```txt
https://plot.linho.cc/#code=eyJkYXRhIjpbeyJmbiI6InheMi0xIn1dfQ
```

> Deprecated: Pass it as the `code` parameter in the URL:
>
> ```txt
> https://plot.linho.cc/?code=eyJkYXRhIjpbeyJmbiI6InheMi0xIn1dfQ
> ```

This will open the web editor with the configuration preloaded, allowing you to modify the settings and preview the graph.
