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

### 注意：如果后期无重大 BUG 的话，v9 将是支持 GNOME 3.38 的最后一个版本

在 GNOME Shell 中更改 IBus 的候选框方向、shell 主题、背景图片、字体和输入法默认语言。

![demo](img/demo.png)

## 安装

从 GNOME 扩展商店中获取：

[<img src="https://raw.githubusercontent.com/andyholmes/gnome-shell-extensions-badge/master/get-it-on-ego.svg?sanitize=true" alt="Get it on GNOME Extensions" height="100" align="middle">][ego]

或者手动自行安装：

```bash
git clone https://github.com/HollowMan6/Customize-IBus.git
cd Customize-IBus && make install
```

## 功能

![image](img/preference.png)

## 使用用户主题来更改 IBus 皮肤的实现

当用户从主题列表中选中一个主题，本扩展会首先读取该主题的定义 CSS 文件，从中提取出定义 IBus 皮肤的类样式(`.candidate-*`)，然后将其写入本扩展的`stylesheet.css`文件。最后重启 GNOME-shell。

### _提示：_

1. 推荐使用 X11。如果你在 Wayland 中更改 IBus 主题，你的当前所有工作都将会丢失，因为 Wayland 下只支持通过重新登陆来重启 GNOME-shell。
2. 在 Fedora 33 和 Ubuntu 20.04, GNOME-shell 3.38 中(v3,v5,v9)通过了测试。
3. 对于那些不使用 GNOME 而是使用如 KDE 等桌面环境的用户，更改 IBus 主题最简单的方法请参见[这里](https://github.com/qvshuo/Ibus-custom-theme)，从而为 IBus 指定一个不同的 GTK 主题。

## 更改 IBus 背景图片的实现

在[修复 Unity8-Wood 主题对 IBus 背景支持](https://github.com/openSUSE/mentoring/issues/158#issuecomment-813837436)时发现为`.candidate-popup-content`增加如下样式：

```css
background: url("assets/bg.png");
background-repeat: no-repeat;
background-size: cover;
```

即可实现对背景的修改。

进一步结合[ibus-font-setting](https://extensions.gnome.org/extension/1121/ibus-font-setting/)和[background-logo](https://pagure.io/background-logo-extension)，参考 GNOME-Shell 源代码中`candidate-popup-content`样式[对应组件](https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/master/js/ui/ibusCandidatePopup.js#L154)，并对其修改样式实现不重启 GNOME-Shell 进行 IBus 背景图片的修改。

## 备忘

- [x] 从[ibus-tweaker](https://github.com/tuberry/ibus-tweaker)中导入，去除与 IBus 无关功能。
- [x] 从用户主题中读取 IBus 相关样式
- [x] 将相关功能合并在一起。
- [x] V9: 增加更改 IBus 背景图片功能。

## 致谢

1. [ibus-font-setting](https://extensions.gnome.org/extension/1121/ibus-font-setting/)
2. [ibus-tweaker](https://github.com/tuberry/ibus-tweaker)
3. [user-theme](https://gitlab.gnome.org/GNOME/gnome-shell-extensions/-/tree/master/extensions/user-theme)
4. [shell-restarter](https://github.com/koolskateguy89/gnome-shell-extension-shell-restarter)
5. [background-logo](https://pagure.io/background-logo-extension)

_该项目是谷歌编程之夏 (GSoC) 2021 于[OpenSUSE](https://github.com/openSUSE/mentoring/issues/158)社区成果的一部分。_

# Customize IBus

### Note: If no severe bug was found later, v9 will be the last version that support GNOME 3.38.

Customize IBus for orientation, shell theme, background picture, font and ascii mode auto-switch.

![demo](img/demo-en.png)

## Installation

[<img src="https://raw.githubusercontent.com/andyholmes/gnome-shell-extensions-badge/master/get-it-on-ego.svg?sanitize=true" alt="Get it on GNOME Extensions" height="100" align="middle">][ego]

Or manually:

```bash
git clone https://github.com/HollowMan6/Customize-IBus.git
cd Customize-IBus && make install
```

## Features

![image](img/preference-en.png)

## Realization of Customizing IBus with User Theme

When user chooses a theme from the list, this extension will first read the theme CSS file, extract the IBus related style classes (`.candidate-*`), then write it to extension's `stylesheet.css`. Finally restart the GNOME-shell.

### _NOTE:_

1. Recommend to use X11. If you change IME theme under Wayland, all your current work may be lost (Since Wayland only support relogin to restart the GNOME-shell).
2. Tested on Fedora 33 and Ubuntu 20.04, GNOME-shell 3.38(v3, v5, v9).
3. For users who don't use GNOME but other desktop environments like KDE, the easiest way to change the IBus theme is to act as described in [here](https://github.com/qvshuo/Ibus-custom-theme) to use a different GTK theme for IBus.

## To-do

- [x] Import from [ibus-tweaker](https://github.com/tuberry/ibus-tweaker) and remove features unrelated to IBus.
- [x] Read from user themes and apply only for ibus.
- [x] Merge functions related together.
- [x] v9: Add functionality to modify IBus Background picture.

## Acknowledgements

1. [ibus-font-setting](https://extensions.gnome.org/extension/1121/ibus-font-setting/)
2. [ibus-tweaker](https://github.com/tuberry/ibus-tweaker)
3. [user-theme](https://gitlab.gnome.org/GNOME/gnome-shell-extensions/-/tree/master/extensions/user-theme)
4. [shell-restarter](https://github.com/koolskateguy89/gnome-shell-extension-shell-restarter)
5. [background-logo](https://pagure.io/background-logo-extension)

_This project is part of the achievement of the Google Summer of Code 2021 at [OpenSUSE](https://github.com/openSUSE/mentoring/issues/158)._

[ego]: https://extensions.gnome.org/extension/4112/customize-ibus/
