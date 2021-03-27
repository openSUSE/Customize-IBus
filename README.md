# Customize IBus

[![last-commit](https://img.shields.io/github/last-commit/HollowMan6/Customize-IBus)](https://github.com/HollowMan6/Customize-IBus/graphs/commit-activity)

[![Followers](https://img.shields.io/github/followers/HollowMan6?style=social)](https://github.com/HollowMan6?tab=followers)
[![watchers](https://img.shields.io/github/watchers/HollowMan6/Customize-IBus?style=social)](https://github.com/HollowMan6/Customize-IBus/watchers)
[![stars](https://img.shields.io/github/stars/HollowMan6/Customize-IBus?style=social)](https://github.com/HollowMan6/Customize-IBus/stargazers)
[![forks](https://img.shields.io/github/forks/HollowMan6/Customize-IBus?style=social)](https://github.com/HollowMan6/Customize-IBus/network/members)

[![Open Source Love](https://img.shields.io/badge/-%E2%9D%A4%20Open%20Source-Green?style=flat-square&logo=Github&logoColor=white&link=https://hollowman6.github.io/fund.html)](https://hollowman6.github.io/fund.html)
[![GPL Licence](https://img.shields.io/badge/license-GPL-blue)](https://opensource.org/licenses/GPL-3.0/)
[![Repo-Size](https://img.shields.io/github/repo-size/HollowMan6/Customize-IBus.svg)](https://github.com/HollowMan6/Customize-IBus/archive/main.zip)

[![Total alerts](https://img.shields.io/lgtm/alerts/g/HollowMan6/Customize-IBus.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/HollowMan6/Customize-IBus/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/HollowMan6/Customize-IBus.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/HollowMan6/Customize-IBus/context:javascript)

Customize IBus in gnome-shell for orientation, theme, font and input mode auto-switch.

![demo](img/demo.png)

## Installation
[<img src="https://raw.githubusercontent.com/andyholmes/gnome-shell-extensions-badge/master/get-it-on-ego.svg?sanitize=true" alt="Get it on GNOME Extensions" height="100" align="middle">][EGO]

Or manually:
```shell
git clone https://github.com/HollowMan6/Customize-IBus.git
cd ibus-tweaker && make install
```

## Features

![image](img/preference.png)

## Realization

When user chooses a theme from the list, this extension will first read the theme CSS file, extract the IBus related style classes (`.candidate-*`), then write it to extension's `stylesheet.css`. Finally restart the GNOME-shell.

### *NOTE:* 
1. Recommend to use X11. If you change theme under Wayland, all your current work may be lost.
2. Tested on Fedora 33, GNOME-shell 3.38.

## To-do

- [X] Import from [ibus-tweaker](https://github.com/tuberry/ibus-tweaker) and remove features unrelated to IBus.
- [X] Read from user themes and apply only for ibus.
- [X] Merge the two functions.

## Acknowledgements

1. [ibus-font-setting](https://extensions.gnome.org/extension/1121/ibus-font-setting/)
2. [ibus-tweaker](https://github.com/tuberry/ibus-tweaker)
3. [user-theme](https://gitlab.gnome.org/GNOME/gnome-shell-extensions/-/tree/master/extensions/user-theme)
4. [shell-restarter](https://github.com/koolskateguy89/gnome-shell-extension-shell-restarter)

*This project is part of the Google Summer of Code 2021 at [OpenSUSE](https://github.com/openSUSE/mentoring/issues/158).*

[EGO]:https://extensions.gnome.org/extension/4112/customize-ibus/
