# 自定义 IBus

[![last-commit](https://img.shields.io/github/last-commit/HollowMan6/Customize-IBus)](https://github.com/HollowMan6/Customize-IBus/graphs/commit-activity)
[![release-date](https://img.shields.io/github/release-date/HollowMan6/Customize-IBus)](../../releases)

[![Followers](https://img.shields.io/github/followers/HollowMan6?style=social)](https://github.com/HollowMan6?tab=followers)
[![watchers](https://img.shields.io/github/watchers/HollowMan6/Customize-IBus?style=social)](https://github.com/HollowMan6/Customize-IBus/watchers)
[![stars](https://img.shields.io/github/stars/HollowMan6/Customize-IBus?style=social)](https://github.com/HollowMan6/Customize-IBus/stargazers)
[![forks](https://img.shields.io/github/forks/HollowMan6/Customize-IBus?style=social)](https://github.com/HollowMan6/Customize-IBus/network/members)

[![Open Source Love](https://img.shields.io/badge/-%E2%9D%A4%20Open%20Source-Green?style=flat-square&logo=Github&logoColor=white&link=https://hollowman6.github.io/fund.html)](https://hollowman6.github.io/fund.html)
[![GPL Licence](https://img.shields.io/badge/license-GPL-blue)](https://opensource.org/licenses/GPL-3.0/)
[![Repo-Size](https://img.shields.io/github/repo-size/HollowMan6/Customize-IBus.svg)](https://github.com/HollowMan6/Customize-IBus/archive/main.zip)

[![Total alerts](https://img.shields.io/lgtm/alerts/g/HollowMan6/Customize-IBus.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/HollowMan6/Customize-IBus/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/HollowMan6/Customize-IBus.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/HollowMan6/Customize-IBus/context:javascript)

(English version is down below)

### 注意：v55 及之后 GNOME 3.38 并入了主分支

深度定制 IBus 的外观、行为、系统托盘以及输入指示。

[自定义 IBus 操作指南](../main/GUIDE_CN.md)

![demo](img/demo.png)

## 安装

从 GNOME 扩展商店中获取：

[<img src="https://raw.githubusercontent.com/andyholmes/gnome-shell-extensions-badge/master/get-it-on-ego.svg?sanitize=true" alt="Get it on GNOME Extensions" height="100" align="middle">][ego]

或者手动自行安装：

```bash
git clone https://github.com/HollowMan6/Customize-IBus.git
cd Customize-IBus && make install
```

如果你使用 Arch Linux，也可使用 AUR 安装为系统插件:

```bash
yay -S gnome-shell-extension-customize-ibus
```

[![AUR](https://aur.archlinux.org/css/archnavbar/aurlogo.png)](https://aur.archlinux.org/packages/gnome-shell-extension-customize-ibus/)

[Fedora](../../tree/package-repo#fedora)也可使用 RPM Repository 安装为系统插件:

```bash
wget https://github.com/HollowMan6/Customize-IBus/raw/package-repo/customize-ibus-rpm.repo
sudo mv customize-ibus-rpm.repo /etc/yum.repos.d/
sudo dnf update
sudo dnf install gnome-shell-extension-customize-ibus
```

[OpenSUSE](../../tree/package-repo#opensuse)也可使用 RPM Repository 安装为系统插件:

```bash
wget https://github.com/HollowMan6/Customize-IBus/raw/package-repo/customize-ibus-rpm.repo
sudo mv customize-ibus-rpm.repo /etc/zypp/repos.d/
sudo zypper refresh
sudo zypper install gnome-shell-extension-customize-ibus
```

或者直接通过[ymp 文件](gnome-shell-extension-customize-ibus.ymp)安装。

[Debian 系(Ubuntu)](../../tree/package-repo#debianubuntu) 也可使用 Debian Repository 安装为系统插件:

```bash
echo "deb https://hollowman.ml/Customize-IBus/deb/ /" | sudo tee -a /etc/apt/sources.list.d/customize-ibus-deb.list > /dev/null
wget -q -O - https://hollowman.ml/Customize-IBus/hollowman.pgp | sudo apt-key add -
sudo apt update
sudo apt install gnome-shell-extension-customize-ibus
```

所有版本的 Linux 都可以通过 [OpenSUSE OBS](https://software.opensuse.org//download.html?project=home%3Ahollowman&package=gnome-shell-extension-customize-ibus) 下载相关安装包后安装。

## 输入源指示器

![](img/indicator.gif)

## 动画

开启滑动:

![](img/animation.gif)

## 拖拽移动

![](img/reposition.gif)

## 使用用户主题来更改 IBus 皮肤的实现

该功能已经被拆分，生成 IBus 皮肤样式表功能迁移到了[IBus-Theme](https://github.com/HollowMan6/IBus-Theme)。

目前该扩展支持导入该工具生成的样式表。另外还支持[IBus-Theme-Hub](https://github.com/HollowMan6/IBus-Theme-Hub)中提供的 IBus 主题样式表文件。

当浅色主题和深色主题同时开启时，扩展将会自动跟随 GNOME 夜灯模式，关闭时使用浅色主题，开启时使用深色主题。

当浅色主题和深色主题只有一个被开启时，扩展将会始终使用那个开启的主题。

**注：** 如你的 IBus 样式表在应用后作出了更改，请关闭并重新开启对应`自定义主题`来使其生效。

### IBus Tweaker 中的主题

IBus Tweaker 中提供的主题已经被我制作成为 IBus 主题样式表合集[仿微软 Microsoft](https://github.com/HollowMan6/IBus-Theme-Hub/tree/main/%E4%BB%BF%E5%BE%AE%E8%BD%AFMicrosoft)，欢迎下载使用!

### _提示：_

1. 在 Fedora 33、Ubuntu 21.04 和 Manjaro 21.0.2，GNOME-shell 3.38 中(v3，v5，v9，v11，v14，v15，v17，v19，v21，v23，v25，v27，v29，v31，v35，v37，v39，v41，v43，v45，v47，v49，v51，v53 及[之后](../../))通过了测试。
2. 对于那些不使用 GNOME 而是使用如 KDE，XFCE 等桌面环境的用户，更改 IBus GTK 主题也请使用我的另外一个项目[IBus-Theme](https://github.com/HollowMan6/IBus-Theme)。
3. 如非调试需要，请勿在 IBus 主题样式表中加入非`.candidate-*`开头的类，以免干扰系统主题。

## 更改 IBus 背景图片的实现

在[修复 Unity8-Wood 主题对 IBus 背景支持](https://github.com/openSUSE/mentoring/issues/158#issuecomment-813837436)时发现为`.candidate-popup-content`增加如下样式：

```css
background: url("assets/bg.png");
background-repeat: no-repeat;
background-size: cover;
```

即可实现对背景的修改。

进一步结合[ibus-font-setting](https://extensions.gnome.org/extension/1121/ibus-font-setting/)和[background-logo](https://pagure.io/background-logo-extension)，参考 GNOME-Shell 源代码中`candidate-popup-content`样式[对应组件](https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/master/js/ui/ibusCandidatePopup.js#L154)，并对其修改样式实现不重启 GNOME-Shell 进行 IBus 背景图片的修改。

支持设定图片显示模式为：居中，铺满，裁剪，以及重复模式。

当浅色背景和深色背景同时开启时，扩展将会自动跟随 GNOME 夜灯模式，关闭时使用浅色背景，开启时使用深色背景。

当浅色背景和深色背景只有一个被开启时，扩展将会始终使用那个开启的背景。

**注：** 请确保背景图片始终可以访问，如你的图片存放在可移动设备，系统默认不挂载，每次手动挂载后请关闭并重新开启对应`自定义背景`来使其生效。

## 备忘

- [x] 从[ibus-tweaker](https://github.com/tuberry/ibus-tweaker)中导入，去除与 IBus 无关功能。
- [x] 从用户主题中读取 IBus 相关样式
- [x] 将相关功能合并在一起。
- [x] V9: 增加更改 IBus 背景图片功能。
- [x] V14: 将从 GNOME-Shell 主题提取 IBus 样式功能剥离，使用 Python 下 CSS 解析器而并非正则表达式实现功能，生成额外 IBus 样式表供用户修改测试使用。
- [x] V14: 本扩展改为接受用户提供的 IBus 样式表进行样式的应用。
- [x] V15: 修改主题加载逻辑，免去每次更换主题都要重启 GNOME-Shell。
- [x] V17: 增加浅色和深色背景与主题，跟随 GNOME 夜灯模式自动切换。
- [x] V17: 重构代码。
- [x] V19: 更改 UI；增加帮助页面。
- [x] V21: 重新设计 UI.
- [x] V23: 增加背景图片显示模式配置。
- [x] V25: 增加背景图片显示重复模式配置。
- [x] V27: 增加打开扩展配置选项到 IBus 输入源指示面板中。
- [x] V29: 增加记住输入状态选项。
- [x] V31: 更改扩展 logo 以及 UI 界面。
- [x] V35: 增加托盘菜单项修改和启动/重启 IBus 按钮。
- [x] V37: 增加 IBus 版本显示，输入源指示器。
- [x] V39: 修复输入源指示器定时关闭缺陷，增加更多配置。增加 IBus 输入框弹出动画配置功能。
- [x] V41: 增加拖拽移动功能。
- [x] V43: 重构拖拽移动功能使其更健壮。
- [x] V45: 修复一些 BUGs，增加右键关闭指示器功能。
- [x] V47: 增加候选框右击切换输入源；支持显示或隐藏托盘图标，直接点击托盘切换输入源。
- [x] V49: 增加候选框右击打开菜单，点击输入指示器切换菜单功能。
- [x] V51: 增加固定候选框功能。
- [x] V53: 修复对于 ibus-rime 的候选框右击和指示器的支持。

## 致谢

1. [ibus-font-setting](https://extensions.gnome.org/extension/1121/ibus-font-setting/)
2. [ibus-tweaker](https://github.com/tuberry/ibus-tweaker)
3. [background-logo](https://pagure.io/background-logo-extension)

_该项目是谷歌编程之夏 (GSoC) 2021 于[OpenSUSE](https://github.com/openSUSE/mentoring/issues/158)社区成果的一部分。_

# Customize IBus

### Note: GNOME 3.38 support has been merged into main in v55 and later.

Full customization of appearance, behavior, system tray and input source indicator for IBus.

[Customize IBus User Guide (in Chinese)](GUIDE_CN.md)

![demo](img/demo-en.png)

## Installation

[<img src="https://raw.githubusercontent.com/andyholmes/gnome-shell-extensions-badge/master/get-it-on-ego.svg?sanitize=true" alt="Get it on GNOME Extensions" height="100" align="middle">][ego]

Or manually:

```bash
git clone https://github.com/HollowMan6/Customize-IBus.git
cd Customize-IBus && make install
```

If you use Arch Linux, you can also use AUR to install as a system extension:

```bash
yay -S gnome-shell-extension-customize-ibus
```

[![AUR](https://aur.archlinux.org/css/archnavbar/aurlogo.png)](https://aur.archlinux.org/packages/gnome-shell-extension-customize-ibus/)

You can also use RPM Repository to install as a system extension under [Fedora](../../tree/package-repo#fedora):

```bash
wget https://github.com/HollowMan6/Customize-IBus/raw/package-repo/customize-ibus-rpm.repo
sudo mv customize-ibus-rpm.repo /etc/yum.repos.d/
sudo dnf update
sudo dnf install gnome-shell-extension-customize-ibus
```

You can also use RPM Repository to install as a system extension under [OpenSUSE](../../tree/package-repo#opensuse):

```bash
wget https://github.com/HollowMan6/Customize-IBus/raw/package-repo/customize-ibus-rpm.repo
sudo mv customize-ibus-rpm.repo /etc/zypp/repos.d/
sudo zypper refresh
sudo zypper install gnome-shell-extension-customize-ibus
```

Or directly use [ymp file](gnome-shell-extension-customize-ibus.ymp) to install.

You can also use Debian Repository to install as a system extension under [Debian (Ubuntu)](../../tree/package-repo#debianubuntu):

```bash
echo "deb https://hollowman.ml/Customize-IBus/deb/ /" | sudo tee -a /etc/apt/sources.list.d/customize-ibus-deb.list > /dev/null
wget -q -O - https://hollowman.ml/Customize-IBus/hollowman.pgp | sudo apt-key add -
sudo apt update
sudo apt install gnome-shell-extension-customize-ibus
```

All versions of Linux can download related packages through [OpenSUSE OBS](https://software.opensuse.org//download.html?project=home%3Ahollowman&package=gnome-shell-extension-customize-ibus) and then make installation.

## Input Source Indicator

![](img/indicator.gif)

## Animation

With Slide enabled:

![](img/animation.gif)

## Drag to Reposition

![](img/reposition.gif)

## Realization of Customizing IBus with User Theme

This function has been separated, generating IBus theme stylesheet has been moved to [IBus-Theme](https://github.com/HollowMan6/IBus-Theme).

Now this extension supports importing stylesheet generated by this tool. In addition it also supports the IBus theme stylesheets provided by [IBus-Theme-Hub](https://github.com/HollowMan6/IBus-Theme-Hub).

When light theme and dark theme are turned on at the same time, the extension will automatically follow GNOME Night Light mode, use light theme when off, and use dark theme when on.

When only one of the light theme and dark theme is turned on, the extension will always use the theme that is turned on.

**Note:** If your IBus style sheet has changed after application, please close and reopen the corresponding `custom IME theme` to make it effective.

### Themes in IBus Tweaker

Themes in IBus Tweaker have been converted by me as IBus theme stylesheets collection [仿微软 Microsoft](https://github.com/HollowMan6/IBus-Theme-Hub/tree/main/%E4%BB%BF%E5%BE%AE%E8%BD%AFMicrosoft), you are welcomed to use it!

### _NOTE:_

1. Tested on Fedora 33, Ubuntu 21.04 and Manjaro 21.0.2, GNOME-shell 3.38(v3, v5, v9, v11, v14, v15, v17, v19, v21, v23, v25, v27, v29, v31, v35, v37, v39, v41, v43, v45, v47, v49, v51, v53 and [later](../../)).
2. For users who don't use GNOME but other desktop environments like KDE, XFCE, etc., please also use another project of mine [IBus-Theme](https://github.com/HollowMan6/IBus-Theme) to use a different GTK theme for IBus.
3. If not for debugging, please DO NOT add any classes that's not started with `.candidate-*` into IBus stylesheet to prevent from disturbing system themes.

## Realization of Modifying IBus Background Picture

During [fixing Unity8-Wood theme and add support for IBus Backgound](https://github.com/openSUSE/mentoring/issues/158#issuecomment-813837436), I found that if I add the following style for class `.candidate-popup-content`：

```css
background: url("assets/bg.png");
background-repeat: no-repeat;
background-size: cover;
```

I can modify the background picture.

Further combining [ibus-font-setting](https://extensions.gnome.org/extension/1121/ibus-font-setting/) and [background-logo](https://pagure.io/background-logo-extension), referring to GNOME-Shell's source code, I found the [corresponding widget](https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/master/js/ui/ibusCandidatePopup.js#L154) for class `candidate-popup-content`, and modified the style to realize modifying IBus background picture without restarting GNOME-Shell.

Support setting background picture displaying mode as Centered, Repeated and Zoom, and also repeat mode.

When light background and dark background are turned on at the same time, the extension will automatically follow GNOME Night Light mode, use light background when off, and use dark background when on.

When only one of the light background and dark background is turned on, the extension will always use the background that is turned on.

**Note:** Please make sure your background picture can always be visited. If your pictures are stored in the removable device and the system doesn't mount it by default, please close and reopen the corresponding `Use custom background` to make it effective after manually mounting.

## To-do

- [x] Import from [ibus-tweaker](https://github.com/tuberry/ibus-tweaker) and remove features unrelated to IBus.
- [x] Read from user themes and apply only for ibus.
- [x] Merge functions related together.
- [x] v9: Add functionality to modify IBus Background picture.
- [x] V14: Strip the current function of extracting IBus style from Gnome shell theme, implement using CSS parser libraries in Python instead of regular expression. Additional IBus style sheets are generated for users to modify and test.
- [x] V14: Modify this extension to accept IBus style sheets provided by users for style application.
- [x] V15: Modify theme load logic so that now we don't need to reload GNOME-Shell to change IBus themes.
- [x] V17: Add theme and background picture follow GNOME Night Light Mode.
- [x] V17: Refactor code.
- [x] V19: Change UI；Add Help page.
- [x] V21: Re-design UI.
- [x] V23: Add background picture displaying mode configure.
- [x] V25: Add background picture displaying repeat mode configure.
- [x] V27: Add extension prefs menu entry into IBus Input Source Indicate Panel.
- [x] V29: Add Remember Input State options.
- [x] V31: Change extension logo and UI.
- [x] V35: Add tray menu entries modifications and start/restart IBus button.
- [x] V37: Add IBus version displaying and input source indicator.
- [x] V39: Fix input source indicator BUGS, add more configs. Add IBus Input Popup Box animation customization feature.
- [x] V41: Add drag to move function.
- [x] V43: Refactor dragging to move feature to make it more robust.
- [x] V45: Fix several BUGs. Add right click to close source indicator.
- [x] V47: Add right click candidate box to switch input source. Support show or hide tray icon, directly click tray icon to switch input source.
- [x] V49: Add open menu for candidate right click, and click Input Source Indicator to switch source.
- [x] V51: Add feature for fixing candidate box.
- [x] V53: Fix support for ibus-rime of candidate box right click and indicator.

## Acknowledgements

1. [ibus-font-setting](https://extensions.gnome.org/extension/1121/ibus-font-setting/)
2. [ibus-tweaker](https://github.com/tuberry/ibus-tweaker)
3. [background-logo](https://pagure.io/background-logo-extension)

_This project is part of the achievement of the Google Summer of Code 2021 at [OpenSUSE](https://github.com/openSUSE/mentoring/issues/158)._

[ego]: https://extensions.gnome.org/extension/4112/customize-ibus/
