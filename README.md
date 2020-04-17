# ibus-tweaker
Tweaker of ibus for font and ascii mode auto-switch (remember input source status for windows with a top-down method).

## 安装
[<img src="https://raw.githubusercontent.com/andyholmes/gnome-shell-extensions-badge/master/get-it-on-ego.svg?sanitize=true" alt="Get it on GNOME Extensions" height="100" align="middle">][EGO]

或者手动：
```shell
git clone https://github.com/tuberry/ibus-tweaker.git
cp -r './ibus-tweaker/ibus-tweaker@tuberry.github.com' ~/.local/share/gnome-shell/extensions/
```

## 设置
![截图](https://s1.ax1x.com/2020/04/02/Gtk7ef.png)
### 1. 中英文切换

简单来说，切换到新窗口输入前恢复上次离开时的中/英文状态。第一/二行英/中文，用于程序启动时切换常用的状态，并非固定。
窗口名字用`#`间隔，按 `Alt+F2` 输入 `lg` 打开 looking glass 看对应窗口的 `wmclass` 来填:

![截图](https://ae01.alicdn.com/kf/U5ff0e6a172e444b79040184ccf35377d1.jpg)

Run dialog 是 Alt+F2 调的命令框不是窗口，再设了一个快捷键（英文）。

### 2. 字体设置

源自[ibus-font-setting](https://extensions.gnome.org/extension/1121/ibus-font-setting/)。 不过3.36上用不了我修了下顺便改了改设置界面。就一个按钮干脆集成（少一个扩展），请在 ibus-setup 中先启用 use-custom-font 否则无效。
### 3. 隐藏活动按钮

源自[hide-activities-button](https://extensions.gnome.org/extension/1128/hide-activities-button/)。代码量不大就集成了（又少一个扩展）。默认关闭不需要无视即可。

## 说明
1. 基于窗口切换，不是总有用；
2. 凑合着用等什么时候上游支持吧。
 
[EGO]:https://extensions.gnome.org/extension/2820/ibus-tweaker/
