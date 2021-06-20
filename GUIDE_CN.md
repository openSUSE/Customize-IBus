# 自定义 IBus 操作指南

CSDN 链接：https://blog.csdn.net/qq_18572023/article/details/116331601

## GNOME 桌面

首先请确保安装了用于自定义 IBus 的 GNOME Shell 扩展：[https://extensions.gnome.org/extension/4112/customize-ibus/](https://extensions.gnome.org/extension/4112/customize-ibus/)

### 安装

可以参考这里：[https://linux.cn/article-9447-1.html](https://linux.cn/article-9447-1.html) 来从 Web 浏览器安装 GNOME Shell 扩展。

或者

```bash
git clone https://github.com/HollowMan6/Customize-IBus.git
cd Customize-IBus && make install
```

如果你想将该插件作为系统插件为所有用户安装：

- Arch 系：

```bash
yay -S gnome-shell-extension-customize-ibus
```

[![](https://img-blog.csdnimg.cn/20210502152203849.png)](https://aur.archlinux.org/packages/gnome-shell-extension-customize-ibus/)

- Fedora:

```bash
wget https://github.com/HollowMan6/Customize-IBus/raw/package-repo/customize-ibus-rpm.repo
sudo mv customize-ibus-rpm.repo /etc/yum.repos.d/
sudo dnf update
sudo dnf install gnome-shell-extension-customize-ibus
```

- OpenSUSE:

```bash
wget https://github.com/HollowMan6/Customize-IBus/raw/package-repo/customize-ibus-rpm.repo
sudo mv customize-ibus-rpm.repo /etc/zypp/repos.d/
sudo zypper refresh
sudo zypper install gnome-shell-extension-customize-ibus
```

或者直接通过[ymp 文件](https://software.opensuse.org/ymp/home:hollowman/openSUSE_Factory/gnome-shell-extension-customize-ibus.ymp)安装。

- Debian 系(Ubuntu):

```bash
echo "deb https://hollowman.ml/Customize-IBus/deb/ /" | sudo tee -a /etc/apt/sources.list.d/customize-ibus-deb.list > /dev/null
wget -q -O - https://hollowman.ml/Customize-IBus/hollowman.pgp | sudo apt-key add -
sudo apt update
sudo apt install gnome-shell-extension-customize-ibus
```

所有版本的 Linux 都可以通过 [OpenSUSE OBS](https://software.opensuse.org//download.html?project=home%3Ahollowman&package=gnome-shell-extension-customize-ibus) 下载相关安装包后安装。

安装之后，你会发现 IBus 输入源指示面板中多了一个菜单选项`自定义IBus`，点击后即可打开自定义 IBus 配置选项。如果没有该菜单项，你可以`Alt+F2`然后按`r`重启 shell，或者注销之后重新登陆。如果还是不行，请确保你安装了最新版的插件并且已经开启了该插件。

![](https://img-blog.csdnimg.cn/20210501182259180.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

你也可以在[https://extensions.gnome.org/local/](https://extensions.gnome.org/local/)中点击 Customize IBus 插件的配置图标来打开该选项。

![](https://img-blog.csdnimg.cn/20210524003749157.png)

### 常规

![](https://img-blog.csdnimg.cn/20210620212624833.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

点击`候选框方向`左侧的复选框来进行选中，即可支持配置 IBus 输入法候选框方向。点击右侧进行选择，支持设定为竖直或者水平。

点击`候选框动画`左侧的复选框来进行选中，即可支持配置 IBus 输入法候选框动画。点击右侧进行选择，支持设定为无动画、滑动、渐退、两种都有。

示例开启滑动动画：
![](https://img-blog.csdnimg.cn/20210508195804482.gif)

点击`候选框右击`左侧的复选框来进行选中，即可支持在使用 IBus 输入法时右键点击候选框进行相关操作。点击右侧进行选择，支持设定为打开菜单或者切换输入源。

点击`候选框滚动`左侧的复选框来进行选中，即可支持在使用 IBus 输入法时在候选框上滚动鼠标进行相关的操作。点击右侧进行选择，支持设定为切换当前候选词或者页面。

点击`固定候选框`左侧的复选框来进行选中，即可支持固定候选框。点击右侧进行选择。支持设定 9 种方位，推荐同时启用`拖拽移动候选框`从而可以随时移动候选框位置。当选择`记住最后位置`时，可以永远记住你上次拖拽的位置，并且在下次登陆时恢复。

点击`自定义字体`左侧的复选框来进行选中，即可支持配置 IBus 输入法候选框中文字的字体和字号。点击右侧，打开字体选择器，弹出的对话框中上部可以选择你想要的字体，下部可以选择字号，点击选择确认修改。
![](https://img-blog.csdnimg.cn/20210606205306464.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

点击`自动切换源`左侧的复选框来进行选中，即可支持配置窗口切换时输入法默认切换语言。点击最右侧进行选择，支持设定为中文或者英文，如果选择保持则保持切换窗口时输入法状态不变。在右侧你还可以选择是否记住输入状态。当记住输入状态被启用时，那么你在一个应用中手动切换了输入源，则该应用的输入源模式将会被自动记住。另外，新打开的应用将会遵循你的输入源配置，应用的输入状态将会永远被记住。

点击`固定输入法列表`右侧的开关即可开启或关闭此功能。

如果你系统中使用多种输入法，在使用键盘切换输入法时（通常是`Win + Space`），屏幕上默认显示的输入法排序会依次为最近使用的输入法。开启此功能可以修改为输入法的设置配置先后顺序。

关闭时：
![](https://img-blog.csdnimg.cn/20210610220655414.gif)

开启时：
![](https://img-blog.csdnimg.cn/20210610220720652.gif)

点击`拖拽移动候选框`右侧的开关即可开启或关闭此功能。

示例开启`拖拽移动候选框`：
![](https://img-blog.csdnimg.cn/20210510123119831.gif)

点击`候选框调页按钮`右侧的开关即可显示或隐藏候选框调页按钮。

### 托盘

![](https://img-blog.csdnimg.cn/20210606205406511.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

这里你可以选择显示 IBus 托盘图标，启用直接点击切换输入源，为位于系统托盘处的 IBus 输入源指示菜单增加额外的菜单项，来复原 IBus 在非 GNOME 桌面的体验。各菜单功能如文字描述，点击右侧切换按钮即可启用。

所有菜单都启用：
![](https://img-blog.csdnimg.cn/2021050711043135.png)

你还可以通过点击最上方的按钮来启动或者重启 IBus：
![](https://img-blog.csdnimg.cn/20210505113524964.png)

### 指示

![](https://img-blog.csdnimg.cn/20210620212932190.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

这里你可以选择开启`输入源指示器`，默认是当你打字、移动文字光标或者切换输入源时显示指示器。你可以设定`仅当切换输入源时显示指示器`，点击右侧切换按钮即可启用。你还可以设定`仅当使用英文输入时指示`，`启用右击关闭指示器`，`启用滚动切换输入源`，`指示器显示动画`，显示动画支持`无动画`、`滑动`、`渐退`和`两种动画都同时显示`。还支持设定指示器字体。另外支持设定`启用指示器鼠标左击`操作行为，可以设为拖拽移动和切换输入源。你还可以`启用指示器自动隐藏时延`，支持始终显示和 1 秒到 5 秒范围内设定隐藏时延，设定步进为 0.1。

示例动画：
![](https://img-blog.csdnimg.cn/20210507111902567.gif)

### 主题

![](https://img-blog.csdnimg.cn/20210610005656296.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

同常规部分，单击左侧复选框选中来进行功能的启用，单击右侧进行 IBus 主题样式表选择。

如果你已经选择了某个样式表，点击最右边的图标还可以直接打开查看该样式表。

支持导入由 [IBus 主题工具](https://github.com/HollowMan6/IBus-Theme)生成的或者由[IBus 主题集合](https://github.com/HollowMan6/IBus-Theme-Hub)提供的样式表。

当浅色主题和深色主题同时开启时，IBus 主题将会自动跟随 GNOME 夜灯模式，关闭时使用浅色主题，开启时使用深色主题。当浅色主题和深色主题只有一个被开启时，扩展将会始终使用那个开启的主题。

如非调试需要，请勿在 IBus 主题样式表中加入非 <i>.candidate-\*</i> 开头的类，以免干扰系统主题。

如你的 IBus 样式表在应用后作出了更改，请关闭并重新开启对应`自定义主题`来使其生效。

你可以到该网站下载更多 GNOME Shell 主题：[https://www.pling.com/s/Gnome/browse/cat/134/order/latest/](https://www.pling.com/s/Gnome/browse/cat/134/order/latest/) ，下载完成之后将其放在`$HOME/.themes/`目录下即可完成安装。

[IBus 主题工具](https://github.com/HollowMan6/IBus-Theme)样式表生成借助于电脑上已经安装了的 GNOME Shell 主题进行 IBus 样式的提取，其提取步骤如下：

1. 参见下文中`非GNOME桌面` -> `自定义IBus主题` 步骤 1-3 来运行程序。

2. 输入你想要导出的 IBus 相关 GNOME Shell 主题样式，并按下回车。
   ![](https://img-blog.csdnimg.cn/2021050119011780.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

3. 输入你想要存放导出的 IBus 相关 GNOME Shell 主题样式文件地址，并按下回车。空选择则默认为当前目录下的 `exportedIBusTheme.css` 文件。如无错误提示则成功导出到指定位置。
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
  box-shadow: inset 0 0 0 2px rgba(53, 132, 228, 0.6);
}

.candidate-page-button:hover {
  color: #2e3436;
  background-color: white;
  border-color: #d6d1cd;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.1);
  text-shadow: 0 1px rgba(255, 255, 255, 0.3);
  icon-shadow: 0 1px rgba(255, 255, 255, 0.3);
}

.candidate-page-button:insensitive {
  color: #929595;
  border-color: #e1ddda;
  background-color: #faf9f8;
  box-shadow: none;
  text-shadow: none;
  icon-shadow: none;
}

.candidate-page-button:active {
  color: #2e3436;
  background-color: #efedec;
  border-color: #cdc7c2;
  text-shadow: none;
  icon-shadow: none;
  box-shadow: none;
}

.candidate-index {
  padding: 0 0.5em 0 0;
  color: #17191a;
}

.candidate-box:selected,
.candidate-box:hover {
  background-color: #3584e4;
  color: #fff;
}

.candidate-page-button-box {
  height: 2em;
}

.vertical .candidate-page-button-box {
  padding-top: 0.5em;
}

.horizontal .candidate-page-button-box {
  padding-left: 0.5em;
}

.candidate-page-button-previous {
  border-radius: 5px 0px 0px 5px;
  border-right-width: 0;
}

.candidate-page-button-next {
  border-radius: 0px 5px 5px 0px;
}

.candidate-page-button-icon {
  icon-size: 1em;
}

.candidate-box {
  padding: 0.3em 0.5em 0.3em 0.5em;
  border-radius: 5px; /* 修复候选词颜色 */
  color: #2e3436;
}

.candidate-popup-content {
  padding: 0.5em;
  spacing: 0.3em; /* 修复系统主题IBus背景部分被替换的主题继承 */
  background: transparent;
  /* 修复系统主题IBus边框部分被替换的主题继承 */
  border: transparent;
  /* 修复系统主题IBus边框阴影部分被替换的主题继承 */
  box-shadow: none;
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
  -arrow-box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5); /* 修复当系统主题为黑色时指示框黑边 */
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
  icon-shadow: 0 1px rgba(255, 255, 255, 0.3); /* IBUS样式的调页按钮 */
  padding: 4px;
}

/* 文件结束 */
```

你也可以直接到[IBus 主题集合](https://github.com/HollowMan6/IBus-Theme-Hub)，下载单独制作的 IBus 主题定义样式表文件。这里给出微软输入法风格的 IBus 主题样式表文件：[https://github.com/HollowMan6/IBus-Theme-Hub/tree/main/%E4%BB%BF%E5%BE%AE%E8%BD%AFMicrosoft](https://github.com/HollowMan6/IBus-Theme-Hub/tree/main/%E4%BB%BF%E5%BE%AE%E8%BD%AFMicrosoft)

### 背景

![](https://img-blog.csdnimg.cn/20210610005859997.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

支持使用图片来自定义 IBus 候选框背景，其具有比主题背景更高的优先级。

如果你已经选择了某个图片，点击最右边的图标还可以直接打开查看该图片。

当浅色背景和深色背景同时开启时，IBus 背景将会自动跟随 GNOME 夜灯模式，关闭时使用浅色背景，开启时使用深色背景。当浅色背景和深色背景只有一个被开启时，扩展将会始终使用那个开启的背景。

请确保背景图片始终可以访问，如你的图片存放在可移动设备，系统默认不挂载，每次手动挂载后请关闭并重新开启对应`自定义背景`来使其生效。

同常规部分，单击左侧复选框选中来进行功能的启用，单击最右侧进行 IBus 输入候选框背景图片的选择。

你还可以设定背景图片显示模式，可以设定背景图片是否重复显示，以及显示方式为居中，铺满或者裁剪。

示例各种图片显示模式（使用 128x128 的压缩后图片：[https://github.com/HollowMan6/Customize-IBus/blob/main/customize-ibus%40hollowman.ml/img/logo.png](https://github.com/HollowMan6/Customize-IBus/blob/main/customize-ibus%40hollowman.ml/img/logo.png) ）：

![](https://img-blog.csdnimg.cn/20210505155614345.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

- **居中 + 不重复**：
  ![](https://img-blog.csdnimg.cn/20210503124715765.png)

- **居中 + 重复**：
  ![](https://img-blog.csdnimg.cn/2021050312502110.png)

- **铺满 + 不重复**：
  ![](https://img-blog.csdnimg.cn/20210503124814264.png)

- **铺满 + 重复**：
  ![](https://img-blog.csdnimg.cn/20210503125129957.png)

- **裁剪 + 不重复/重复(等效)**：
  ![](https://img-blog.csdnimg.cn/20210503124907786.png)

### 关于
在任何时候，你都可以点击左上角的图标打开此指南：
![](https://img-blog.csdnimg.cn/20210620213153945.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

点击`恢复默认设置`，确认之后可以将此插件进行初始化操作：
![](https://img-blog.csdnimg.cn/20210620213248291.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

点击`导出当前设置`，你可以选择将当前设置导出为`*.ini`文件。默认文件名为`Customize_IBus_Settings_[当前时间].ini`：
![](https://img-blog.csdnimg.cn/2021061001011966.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

示例设置导出文件内容：
```ini
[/]
candidate-box-position={'x': uint32 583, 'y': 338}
candidate-orientation=uint32 1
candidate-scroll-mode=uint32 0
custom-bg='/home/hollowman/图片/light.jpg'
custom-bg-dark='/home/hollowman/图片/dark.jpg'
custom-bg-mode=uint32 2
custom-bg-repeat-mode=uint32 1
custom-theme='/home/hollowman/stylesheet-light.css'
custom-theme-dark='/home/hollowman/stylesheet-dark.css'
enable-custom-theme=true
enable-custom-theme-dark=true
enable-orientation=true
fix-ime-list=true
ibus-restart-time='1624175579630'
indicator-custom-font='文泉驿点阵正黑 Medium 16'
indicator-left-click-func=uint32 0
input-indicator-hide-time=uint32 1
input-indicator-right-close=true
input-indicator-use-scroll=true
input-mode-list={'undefined': false, '': false, 'qv2ray': false, 'gjs': false, 'org.gnome.nautilus': false, 'google-chrome-beta': false, 'gedit': false, 'gnome-terminal': true, 'code': false}
input-mode-remember=uint32 0
menu-ibus-emoji=true
menu-ibus-exit=true
menu-ibus-preference=true
menu-ibus-restart=true
menu-ibus-version=true
use-candidate-box-right-click=true
use-candidate-buttons=false
use-candidate-reposition=true
use-candidate-scroll=true
use-candidate-still=false
use-custom-bg=true
use-custom-bg-dark=true
use-custom-font=true
use-indicator-auto-hide=true
use-indicator-custom-font=true
use-indicator-left-click=true
use-indicator-reposition=true
use-input-indicator=true
use-popup-animation=true
use-tray-click-source-switch=true
```

点击`文件导入设置`，你可以选择将从刚刚保存的设置文件进行导入操作：
![](https://img-blog.csdnimg.cn/20210610010202175.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

你还可以选择打开其他官方自定义设置进行进一步的自定义操作。

## 非 GNOME 桌面

### 自定义 IBus 主题

非 GNOME 桌面环境下，IBus 的显示效果是由 GTK 主题确定的。

你可以到该网站下载更多 GTK3/4 主题：[https://www.gnome-look.org/browse/cat/135/](https://www.gnome-look.org/browse/cat/135/) ，下载完成之后将其放在`$HOME/.themes/`目录下即可完成安装。

下列步骤可以更改 IBus 的 GTK 主题：

1. 下载[IBus Theme Tools](https://github.com/HollowMan6/IBus-Theme)源代码仓库到本地。

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

4. 输入 1，选择更改 IBus 的 GTK 主题，并回车。
   ![](https://img-blog.csdnimg.cn/20210501171451308.png)

5. 输入你想要设定的 IBus GTK 主题，并按下回车。（注意，主题名后标`:dark`的为该款主题的暗色风格模式）
   ![](https://img-blog.csdnimg.cn/20210501171651552.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

6. 若无任何错误提示，则设定成功。现在使用 IBus 输入法你可以看到主题已经换成了你设定的 GTK 主题，并且重启之后也不会失效，因为自动切换主题命令已经加入了你的自启动目录`$HOME/.config/autostart/`中。

### 自定义 IBus 字体字号

`$HOME/.config/gtk-3.0/settings.ini`文件定义了当前的 GTK3 主题及字体字号。

该文件的部分内容示例如下：

```ini
[Settings]
gtk-theme-name=Materia-light
gtk-font-name=更纱黑体 SC 12
```

上述表述中，`gtk-theme-name`指定了当前 GTK 主题为`Materia-light`，`gtk-font-name`指定了当前的字体为`更纱黑体 SC`，字号为`12`。

可通过修改上述文件实现改变 GTK 主题字体和字号的目的。

当然你可以直接更改 IBus 首选项中的字体和字号设置。
