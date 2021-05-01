# 自定义IBus 操作指南

CSDN链接：https://blog.csdn.net/qq_18572023/article/details/116331601

## GNOME桌面

首先请确保安装了用于自定义IBus的GNOME Shell 扩展：https://extensions.gnome.org/extension/4112/customize-ibus/

如果你不会安装，可以参考这里：https://linux.cn/article-9447-1.html 来从 Web 浏览器安装 GNOME Shell 扩展。

安装之后，你会发现 IBus 输入源指示面板中多了一个菜单选项`自定义IBus`，点击后即可打开自定义IBus配置选项。如果没有该菜单项，请确保你安装了最新版的插件并且已经开启了该插件。

![](https://img-blog.csdnimg.cn/20210501182259180.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

你也可以在[https://extensions.gnome.org/local/](https://extensions.gnome.org/local/)中点击Customize IBus插件的配置图标来打开该选项。

![](https://img-blog.csdnimg.cn/20210501182753862.png)

### 基础

![](https://img-blog.csdnimg.cn/20210501183057233.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

点击`候选框方向`左侧的复选框来进行选中，即可支持配置IBus输入法候选框方向。点击右侧进行选择，支持设定为竖直或者水平。

点击`自定义字体`左侧的复选框来进行选中，即可支持配置IBus输入法候选框中文字的字体和字号。点击右侧，打开字体选择器，弹出的对话框中上部可以选择你想要的字体，下部可以选择字号，点击选择确认修改。
![](https://img-blog.csdnimg.cn/20210501183652350.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

点击`默认中英文`左侧的复选框来进行选中，即可支持配置一个新窗口被打开时IBus输入法的输入语言。点击右侧进行选择，支持设定为中文或者英文，如果选择默认则保持打开新窗口前输入法状态不变。当该功能被启用时，一个窗口的输入模式将会被自动记住；当你切换到另一个窗口并切换回来时，即使在另一个窗口中切换了与之前不同的输入模式，原窗口中的输入法模式仍然会恢复为窗口切换前的输入模式。

### 主题

![](https://img-blog.csdnimg.cn/20210501184432857.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

同基础部分，单击左侧复选框选中来进行功能的启用，单击右侧进行IBus主题样式表选择。

支持导入由 [IBus 主题工具](https://github.com/HollowMan6/IBus-Theme)生成的或者由[IBus 主题集合](https://github.com/HollowMan6/IBus-Theme-Hub)提供的样式表。

当浅色主题和深色主题同时开启时，IBus 主题将会自动跟随 GNOME 夜灯模式，关闭时使用浅色主题，开启时使用深色主题。当浅色主题和深色主题只有一个被开启时，扩展将会始终使用那个开启的主题。

如非调试需要，请勿在IBus主题样式表中加入非 <i>.candidate-*</i> 开头的类，以免干扰系统主题。

如你的 IBus 样式表在应用后作出了更改，请关闭并重新开启对应`自定义主题`来使其生效。

你可以到该网站下载更多GNOME Shell主题：https://www.pling.com/s/Gnome/browse/cat/134/order/latest/，下载完成之后将其放在`$HOME/.themes/`目录下即可完成安装。

[IBus 主题工具](https://github.com/HollowMan6/IBus-Theme)样式表生成借助于电脑上已经安装了的GNOME Shell主题进行IBus样式的提取，其提取步骤如下：

1. 参见下文中`非GNOME桌面` -> `自定义IBus主题` 步骤1-3来运行程序。

2. 输入你想要导出的IBus相关GNOME Shell主题样式，并按下回车。
![](https://img-blog.csdnimg.cn/2021050119011780.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

3. 输入你想要存放导出的IBus相关GNOME Shell主题样式文件地址，并按下回车。空选择则默认为当前目录下的 `exportedIBusTheme.css` 文件。如无错误提示则成功导出到指定位置。
![](https://img-blog.csdnimg.cn/20210501190516268.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

示例导出文件：

```css
/*
 由 IBus 主题工具生成
 工具作者： Hollow Man <hollowman@hollowman.ml>
 工具源代码： https://github.com/HollowMan6/IBus-Theme
 工具许可证： GPLv3
 样式表源文件： /usr/share/gnome-shell/theme/gnome-classic-high-contrast.css

 推荐使用 自定义 IBus GNOME Shell 扩展：
 https://extensions.gnome.org/extension/4112/customize-ibus/
 来通过选定此文件改变IBus主题。

 如果你在以上扩展中应用了此文件后对此文件内容作出了改变，
 请关闭并重新开启'自定义主题'来使改变生效。
*/

/*
 引入自样式表文件： /usr/share/gnome-shell/theme/gnome-classic.css
*/

 .candidate-page-button:focus {
    color: #2e3436;
    text-shadow: 0 1px rgba(255, 255, 255, 0.3);
    icon-shadow: 0 1px rgba(255, 255, 255, 0.3);
    box-shadow: inset 0 0 0 2px rgba(53, 132, 228, 0.6); }

 .candidate-page-button:hover {
    color: #2e3436;
    background-color: white;
    border-color: #d6d1cd;
    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.1);
    text-shadow: 0 1px rgba(255, 255, 255, 0.3);
    icon-shadow: 0 1px rgba(255, 255, 255, 0.3); }

 .candidate-page-button:insensitive {
    color: #929595;
    border-color: #e1ddda;
    background-color: #faf9f8;
    box-shadow: none;
    text-shadow: none;
    icon-shadow: none; }

 .candidate-page-button:active {
    color: #2e3436;
    background-color: #efedec;
    border-color: #cdc7c2;
    text-shadow: none;
    icon-shadow: none;
    box-shadow: none; }

.candidate-index {
  padding: 0 0.5em 0 0;
  color: #17191a; }

.candidate-box:selected, .candidate-box:hover {
    background-color: #3584e4;
    color: #fff; }

.candidate-page-button-box {
  height: 2em; }

.vertical .candidate-page-button-box {
    padding-top: 0.5em; }

.horizontal .candidate-page-button-box {
    padding-left: 0.5em; }

.candidate-page-button-previous {
  border-radius: 5px 0px 0px 5px;
  border-right-width: 0; }

.candidate-page-button-next {
  border-radius: 0px 5px 5px 0px; }

.candidate-page-button-icon {
  icon-size: 1em; }

.candidate-box {
  padding: 0.3em 0.5em 0.3em 0.5em;
  border-radius: 5px;   /* 修复候选词颜色 */
  color: #2e3436;
}

.candidate-popup-content {
  padding: 0.5em;
  spacing: 0.3em;   /* 修复系统主题IBus背景部分被替换的主题继承 */
  background: transparent;
  /* 修复系统主题IBus边框部分被替换的主题继承 */
  border: transparent;
  /* 修复候选词颜色 */
  color: #2e3436;
}

.candidate-popup-boxpointer {
  -arrow-border-radius: 9px;
  -arrow-background-color: #f6f5f4;
  -arrow-border-width: 1px;
  -arrow-border-color: #cdc7c2;
  -arrow-base: 24px;
  -arrow-rise: 12px;
  -arrow-box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);   /* 修复当系统主题为黑色时指示框黑边 */
  border-image: none;
}

/* 结合系统调页按钮和IBUS样式的调页按钮 */
.candidate-page-button {
  border-style: solid;
  border-width: 1px;
  min-height: 22px;
  padding: 3px 24px;
  color: #2e3436;
  background-color: #fdfdfc;
  border-color: #cdc7c2;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.1);
  text-shadow: 0 1px rgba(255, 255, 255, 0.3);
  icon-shadow: 0 1px rgba(255, 255, 255, 0.3);   /* IBUS样式的调页按钮 */
  padding: 4px; }

/* 文件结束 */
```

你也可以直接到[IBus 主题集合](https://github.com/HollowMan6/IBus-Theme-Hub)，下载单独制作的IBus主题定义样式表文件。这里给出微软输入法风格的IBus主题样式表文件：[https://github.com/HollowMan6/IBus-Theme-Hub/tree/main/%E4%BB%BF%E5%BE%AE%E8%BD%AFMicrosoft](https://github.com/HollowMan6/IBus-Theme-Hub/tree/main/%E4%BB%BF%E5%BE%AE%E8%BD%AFMicrosoft)

### 背景

![](https://img-blog.csdnimg.cn/20210501191250634.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

支持使用图片来自定义IBus候选框背景，其具有比主题背景更高的优先级。

当浅色背景和深色背景同时开启时，IBus 背景将会自动跟随 GNOME 夜灯模式，关闭时使用浅色背景，开启时使用深色背景。当浅色背景和深色背景只有一个被开启时，扩展将会始终使用那个开启的背景。

请确保背景图片始终可以访问，如你的图片存放在可移动设备，系统默认不挂载，每次手动挂载后请关闭并重新开启对应`自定义背景`来使其生效。

同基础部分，单击左侧复选框选中来进行功能的启用，单击最右侧进行IBus输入候选框背景图片的选择。

你还可以设定背景图片显示模式，可以设定背景图片是否重复显示，以及显示方式为居中，铺满或者裁剪。

示例各种图片显示模式（使用图片为：https://github.com/HollowMan6/Customize-IBus/blob/main/customize-ibus%40hollowman.ml/img/logo.jpeg）：

- **居中 + 不重复**：
![](https://img-blog.csdnimg.cn/20210501192345365.png)

- **居中 + 重复**：
![](https://img-blog.csdnimg.cn/20210501192519569.png)

- **铺满 + 不重复**：
![](https://img-blog.csdnimg.cn/20210501192721345.png)

- **铺满 + 重复**：
![](https://img-blog.csdnimg.cn/20210501192626557.png)

- **裁剪 + 不重复/重复(等效)**：
![](https://img-blog.csdnimg.cn/20210501192854124.png)

### 关于

![](https://img-blog.csdnimg.cn/20210501190939829.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

## 非GNOME桌面
### 自定义IBus主题

非GNOME桌面环境下，IBus的显示效果是由GTK主题确定的。

你可以到该网站下载更多GTK3/4主题：https://www.gnome-look.org/browse/cat/135/，下载完成之后将其放在`$HOME/.themes/`目录下即可完成安装。

下列步骤可以更改IBus的GTK主题：

1. 下载[IBus-Theme](https://github.com/HollowMan6/IBus-Theme)源代码仓库到本地。
```bash
git clone https://github.com/HollowMan6/IBus-Theme.git
cd IBus-Theme
```

2. 赋予[IBus-Theme.py](https://github.com/HollowMan6/IBus-Theme/blob/main/IBus-Theme.py)可执行权限。
```bash
chmod +x IBus-Theme.py
```

3. 运行[IBus-Theme.py](https://github.com/HollowMan6/IBus-Theme/blob/main/IBus-Theme.py)。
```bash
./IBus-Theme.py
```

4. 输入1，选择更改IBus的GTK主题，并回车。
![](https://img-blog.csdnimg.cn/20210501171451308.png)

5. 输入你想要设定的IBus GTK主题，并按下回车。（注意，主题名后标`:dark`的为该款主题的暗色风格模式）
![](https://img-blog.csdnimg.cn/20210501171651552.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

6. 若无任何错误提示，则设定成功。现在使用IBus输入法你可以看到主题已经换成了你设定的GTK主题，并且重启之后也不会失效，因为自动切换主题命令已经加入了你的自启动目录`$HOME/.config/autostart/`中。

## 自定义IBus字体字号

`$HOME/.config/gtk-3.0/settings.ini`文件定义了当前的GTK3主题及字体字号。

该文件的部分内容示例如下：

```ini
[Settings]
gtk-theme-name=Materia-light
gtk-font-name=更纱黑体 SC 12
```

上述表述中，`gtk-theme-name`指定了当前GTK主题为`Materia-light`，`gtk-font-name`指定了当前的字体为`更纱黑体 SC`，字号为`12`。

可通过修改上述文件实现改变IBus字体和字号的目的。