# ibus-tweaker
Tweaker of ibus for font and ascii mode auto-switch (remember input source status for windows with a top-down method, xdotool is required).

## 安装
### 依赖
```
sudo pacman -S xdotool
```
从 [E.G.O](https://extensions.gnome.org/extension/2820/ibus-tweaker/) 安装，或者手动：
```shell
git clone https://github.com/tuberry/ibus-tweaker.git
cd ./ibus-tweaker
cp -r 'ibus-tweaker@tuberry.github.com' ~/.local/share/gnome-shell/extensions/
```
重启 gnome-shell 后在 gnome-tweaks 中开启.

## 设置
![截图](https://s1.ax1x.com/2020/04/02/Gtk7ef.png)
### 1. 中英文切换

第一/二行英/中文，用于新建窗口时切换你偏好的输入状态，不是固定某一输入状态。简单来说就是记住离开窗口时的状态切换回来时帮你输入前按 Shift (用 xdotool)。
窗口名字用`#`间隔，不要想当然的填，`Alt+F2` 输入 `lg` 打开 looking glass 看对应窗口的 `wmclass`:
![截图](https://ae01.alicdn.com/kf/U5ff0e6a172e444b79040184ccf35377d1.jpg)
Run dialog 是 Alt+F2 调的命令框不是窗口，只好再设一个设快捷键（默认英文）。

### 2. 字体设置

源自[ibus-font-setting](https://extensions.gnome.org/extension/1121/ibus-font-setting/)。 不过3.36上用不了我修了下，顺便改了改设置界面。就一个按钮干脆集成（少一个扩展），注意先在 ibus-setup 中启用 use-custom-font 否则无效。
### 3. 隐藏活动按钮

源自[hide-activities-button](https://extensions.gnome.org/extension/1128/hide-activities-button/)。代码量不大就集成了（又少一个扩展）。默认关闭不需要无视即可。

## 卸载
```
gio trash ~/.local/share/gnome-shell/extensions/ibus-tweaker@tuberry.github.com
sudo pacman -Rs xdotool
```
## 说明
1. 基于窗口切换，不是在所有输入的地方都有用；
2. 依赖 xdotool 按键，更原生态的方法懒得找了；
3. 凑合着用等什么时候上游支持吧。
