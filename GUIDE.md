# Customize IBus User Guide

CSDN link: https://blog.csdn.net/qq_18572023/article/details/118487988

My blog link: https://hollowmansblog.wordpress.com/2021/08/21/customize-ibus-user-guide/

[中文 Chinese](GUIDE_CN.md)

## GNOME Desktop

First, make sure you have installed the GNOME Shell Extension: Customize IBus [https://extensions.gnome.org/extension/4112/customize-ibus/](https://extensions.gnome.org/extension/4112/customize-ibus/)

### Installation

You can refer to here: [https://itsfoss.com/gnome-shell-extensions/](https://itsfoss.com/gnome-shell-extensions/) to install the GNOME Shell Extension from a web browser.

or

- Linux:

```bash
git clone https://github.com/openSUSE/Customize-IBus.git
cd Customize-IBus && make install
```

- FreeBSD:

```sh
git clone https://github.com/openSUSE/Customize-IBus.git
cd Customize-IBus && gmake install
```

If you want to install Customize IBus as a system extension for all users:

- For Arch based:

```bash
yay -S gnome-shell-extension-customize-ibus
```

[![](https://img-blog.csdnimg.cn/20210502152203849.png)](https://aur.archlinux.org/packages/gnome-shell-extension-customize-ibus/)

- For Fedora:

```bash
wget https://github.com/openSUSE/Customize-IBus/raw/package-repo/customize-ibus-rpm.repo
sudo mv customize-ibus-rpm.repo /etc/yum.repos.d/
sudo dnf update
sudo dnf install gnome-shell-extension-customize-ibus
```

- For OpenSUSE:

```bash
wget https://github.com/openSUSE/Customize-IBus/raw/package-repo/customize-ibus-rpm.repo
sudo mv customize-ibus-rpm.repo /etc/zypp/repos.d/
sudo zypper refresh
sudo zypper install gnome-shell-extension-customize-ibus
```

Or install directly through the [ymp file](https://software.opensuse.org/ymp/home:hollowman/openSUSE_Factory/gnome-shell-extension-customize-ibus.ymp).

- For Debian based (Ubuntu):

```bash
echo "deb http://opensuse.github.io/Customize-IBus/deb/ /" | sudo tee -a /etc/apt/sources.list.d/customize-ibus-deb.list > /dev/null
wget -q -O - http://opensuse.github.io/Customize-IBus/hollowman.pgp | sudo apt-key add -
sudo apt update
sudo apt install gnome-shell-extension-customize-ibus
```

PPA:

```bash
sudo add-apt-repository ppa:hollowman86/customize-ibus
sudo apt-get update
```

You can download the majority of your Linux distributions related packages through [OpenSUSE OBS](https://software.opensuse.org//download.html?project=home%3Ahollowman&package=gnome-shell-extension-customize-ibus) and then install.

- Gentoo:

```bash
git clone https://github.com/openSUSE/Customize-IBus.git
cd Customize-IBus && make emerge
```

- NixOS:

```bash
sudo nix-env -i gnomeExtensions.customize-ibus
```

- Guix:

```bash
guix install gnome-shell-extension-customize-ibus
```

- FreeBSD:

```sh
wget https://github.com/openSUSE/Customize-IBus/raw/package-repo/customize_ibus.conf
sudo mkdir -p /usr/local/etc/pkg/repos/
sudo mv customize_ibus.conf /usr/local/etc/pkg/repos/
sudo pkg update
sudo pkg install gnome-shell-extension-customize-ibus
```

After installation, you will find that there is an additional entry `Customize IBus` in the IBus input source indicator menu. Click it, and you will open the Customize IBus preferences. If there is no such menu entry, you can press `Alt+F2` to restart the GNOME shell, or log out and log in again. If that still doesn't work, please make sure you have installed the latest version of the extension and have enabled the extension.

![](https://img-blog.csdnimg.cn/20210705131742167.png)

You can also click the configuration icon of the Customize IBus extension in [https://extensions.gnome.org/local/](https://extensions.gnome.org/local/) to open the preferences.

![](https://img-blog.csdnimg.cn/20210524003749157.png)

### General

![](https://img-blog.csdnimg.cn/35c6323486254e0a89128ee5d75469a1.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASG9sbG93TWFuNg==,size_20,color_FFFFFF,t_70,g_se,x_16)

At item `Candidates orientation`, select the check box on the left to enable the configuration of the IBus candidate box direction. Click on the right side to select, it can be set to vertical or horizontal.

At item `Candidates popup animation`, select the check box on the left to enable the configuration of the IBus animation. Click on the right side to select, support setting to no animation, slide, fade, and both.

Example to turn on the sliding animation:
![](https://img-blog.csdnimg.cn/20210508195804482.gif)

At item `Candidate box right click`, select the check box on the left to enable the configuration of right-click the candidate box to perform related operations when using the IBus. Click on the right to make a selection, and you can set to open the tray menu or switch the input source.

At item `Candidates scroll`, select the check box on the left to enable the configuration of actions performed when scrolling using the IBus. Click on the right to select, and you can set to switch the current candidate word or page.

At item `Fix candidate box`, select the check box on the left to enable a fixed candidate box. Click on the right to select. You can set the candidate box position with 9 options. Recommend to enable `Drag to reposition candidate box` at the same time so that you can rearrange the position at any time. Will remember candidate position forever after reposition if you set to `Remember last position`, and restore at next login.

At item `Use custom font`, select the check box on the left to enable configuration of the font and size of the text in the IBus candidate box. Click on the right to open the font selector. In the pop-up dialog box, you can select the font you want in the upper part and the font size in the lower part. Click `Select` to confirm the modification.
![](https://img-blog.csdnimg.cn/20210705141502460.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

At item `Auto switch ASCII mode`, select the check box on the left to enable configuration of switching ASCII mode when switching windows, Click on the far right to select. It supports setting to make ASCII mode on and off, or just keep to remain current mode. You can also set to remember input state or not on the near right. If you have set to `Remember Input State`, every opened APP's input mode will be remembered if you have switched the input source manually in the APP's window, and the newly-opened APP will follow the configuration. APP's Input State will be remembered forever.

At item `Candidate box opacity`, select the check box on the left to enable configuration of the opacity in the IBus candidate box. Slide the right button to configure opacity ranging from 0 to 255 step 1.

At item `Fix IME list order`, click the switch on the right to turn this feature on or off.

If you use multiple input methods in your system, when you use the keyboard shortcut to switch input methods (usually `Win + Space`), the input method displayed by default on the screen will be sorted by the most recently used input method. Turn on this feature to modify the order of input methods as fixed.

When off:
![](https://img-blog.csdnimg.cn/20210610220655414.gif)

When on:
![](https://img-blog.csdnimg.cn/20210610220720652.gif)

At item `Enable drag to reposition candidate box`, click the switch on the right to turn this feature on or off.

Example of turning on `drag to reposition candidate box`:
![](https://img-blog.csdnimg.cn/20210510123119831.gif)

At item `Candidate box page buttons`, click the switch on the right to show or hide the candidate page buttons.

### Tray

![](https://img-blog.csdnimg.cn/b8d790b8c96f4471a0fc94bd4f2fb994.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASG9sbG93TWFuNg==,size_20,color_FFFFFF,t_70,g_se,x_16)

Here you can set to show IBus tray icon, enable directly switch source with click, add additional menu entries to IBus input source indicator menu at system tray to restore the feelings on Non-GNOME desktop environment.

All menus are enabled:
![](https://img-blog.csdnimg.cn/20210705141710155.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

You can also start or restart IBus by pressing the top button:
![](https://img-blog.csdnimg.cn/20210705141810854.png)

### Indicator

![](https://img-blog.csdnimg.cn/503206da1e374603a9d76f4a9037f0b1.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASG9sbG93TWFuNg==,size_19,color_FFFFFF,t_70,g_se,x_16)

Here you can set to `Use input source indicator`, default is to show indicator every time you type, move caret or switch input source. You can set to `Indicate only when switching input source` by clicking the switch on the right. You can also set to `Indicate only when using ASCII mode` (for multi-mode IME), `Don't indicate when using single mode IME`, `Right click to close indicator`, `Scroll to switch input source`, `Indicator popup animation` supporting `None`, `Slide`, `Fade`, `All`. Also support to `Use custom font`, `Enable indicator left click` to switch input source or drag to move indicator, set `Indicator opacity` supporting range of 0 to 255, and the setting step is 1. `Enable indicator show delay (unit: seconds)`, `Enable indicator auto-hide timeout (unit: seconds)` and auto-hide timeout (in seconds) supporting to set the hidden delay in the range of 1 second to 5 seconds, and the setting step is 1.

**Note:** If you choose to enable the show delay, there won't be a show delay when you switch input source or window.

Example animation:
![](https://img-blog.csdnimg.cn/20210507111902567.gif)

### Theme

![](https://img-blog.csdnimg.cn/f4b289dad5e14106b7658fc3c89c21a6.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASG9sbG93TWFuNg==,size_20,color_FFFFFF,t_70,g_se,x_16)

Same as the general part, select the check box on the left to enable the configuration, and click on the right to select the IBus theme style sheet.

If you have selected a style sheet, click the icon on the far right to directly open it to view the style sheet. You can also click the clear icon to make it follow system theme.

Supports importing style sheets generated by the [IBus Theme Tools](https://github.com/openSUSE/IBus-Theme-Tools) or provided by the [IBus Theme Hub](https://github.com/openSUSE/IBus-Theme-Hub).

When light theme and dark theme are turned on at the same time, the IBus theme will automatically follow GNOME Night Light mode, use light theme when off, and use dark theme when on. When only the light theme or dark theme is turned on, the IBus theme will always use the theme that is turned on.

If not for debugging, please DO NOT add any classes that's not started with <i>.candidate-\*</i> into IBus stylesheet to prevent from corrupting system themes.

~~If your IBus style sheet has changed after application, please close and reopen the corresponding `custom IME theme` to make it effective.~~ Starting from v69, now this extension support stylesheets hot reload, CSS changes will reflect in real-time.

You can download more GNOME Shell themes from this website: [https://www.pling.com/s/Gnome/browse/cat/134/order/latest/](https://www.pling.com/s/Gnome/browse/cat/134/order/latest/), then put it under the `$HOME/.themes/` directory to complete the installation.

The [IBus theme tool](https://github.com/openSUSE/IBus-Theme-Tools) style sheet generation uses the GNOME Shell theme that has been installed on the computer to extract the IBus style. The extraction steps are as follows:

1. Refer to the following part: `Non-GNOME Desktop` -> `Customize IBus Theme` steps 1-2 to run the program.

2. Enter the number of the IBus-related GNOME Shell theme style you want to export, and press `Enter`.
   ![](https://img-blog.csdnimg.cn/20210705151334983.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

3. Enter the location of the GNOME Shell theme style sheet exported related to IBus that you want to store, and press `Enter`. Empty selection will be the default, that is in the current directory `exportedIBusTheme.css` file. If there is no error message, it will be successfully exported to the specified location.
   ![](https://img-blog.csdnimg.cn/b0373619260f41b8a19b425c997469e4.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

Example export file:

```css
/*
 Generated by IBus Theme Tools
 Tool Author: Hollow Man <hollowman@hollowman.ml>
 Tool Source Code: https://github.com/openSUSE/IBus-Theme-Tools
 Tool Licence: GPLv3
 CSS Source File: /usr/share/gnome-shell/theme/gnome-classic-high-contrast.css

 Recommend to use Customize IBus GNOME Shell Extension:
 https://extensions.gnome.org/extension/4112/customize-ibus/
 to change IBus theme by selecting this file.

 If you make any changes to this content after applying this file in above extension,
 for Customize IBus Extension before v68, please disable and then enable 'custom IME theme'
 again to make the changes take effect.

 Starting from v69, support stylesheets hot reload, CSS changes reflecting in real-time.
*/

/*
 Imported from CSS Source File: /usr/share/gnome-shell/theme/gnome-classic.css
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
  border-radius: 5px; /* Fix candidate color */
  color: #2e3436;
}

.candidate-popup-content {
  padding: 0.5em;
  spacing: 0.3em; /* Fix system IBus theme background inherited in replaced theme */
  background: transparent;
  /* Fix system IBus theme candidate window border inherited in replaced theme */
  border: transparent;
  /* Fix system IBus theme candidate box shadow inherited in replaced theme */
  box-shadow: none;
  /* Fix candidate color */
  color: #2e3436;
}

.candidate-popup-boxpointer {
  -arrow-border-radius: 9px;
  -arrow-background-color: #f6f5f4;
  -arrow-border-width: 1px;
  -arrow-border-color: #cdc7c2;
  -arrow-base: 24px;
  -arrow-rise: 12px;
  -arrow-box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5); /* Fix black border at pointer when system theme is black */
  border-image: none;
}

/* Unify system page button and IBus style page button */
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
  icon-shadow: 0 1px rgba(255, 255, 255, 0.3); /* IBus style page button */
  padding: 4px;
}

/* EOF */
```

You can also go directly to the [IBus Theme Hub](https://github.com/openSUSE/IBus-Theme-Hub) and download specialized made IBus theme style sheet file. Here are the IBus theme style sheet files with Microsoft IME style: [https://github.com/openSUSE/IBus-Theme-Hub/tree/main/%E4%BB%BF%E5%BE%AE%E8%BD%AFMicrosoft](https://github.com/openSUSE/IBus-Theme-Hub/tree/main/%E4%BB%BF%E5%BE%AE%E8%BD%AFMicrosoft)

### Background

![](https://img-blog.csdnimg.cn/b7ebdead51284f56ba19b0dda72aeaf8.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASG9sbG93TWFuNg==,size_20,color_FFFFFF,t_70,g_se,x_16)

Support customizing your IBus Input window background with a picture. It has a higher priority than the theme-defined background.

If you have selected a picture, click the icon on the far right to directly open and view the picture. You can also click the clear icon to make it follow theme background.

When light background and dark background are turned on at the same time, the IBus background will automatically follow GNOME Night Light mode, use light background when off, and use dark background when on. When only the light background or dark background is turned on, the IBus background will always use the background that is turned on.

Please make sure your background picture can always be visited. If your pictures are stored in the removable device and the system doesn't mount it by default, please disable and then enable the corresponding `Use custom background` again to make it effective after manually mounting.

Same as the general part, select the check box on the left to enable the configuration, and click on the right to select the background image of the IBus input candidate box.

You can also set the background picture display mode, you can set whether the background picture is displayed repeatedly, or the display mode Centered, Full or Zoom.

Examples of various picture display modes (using 128x128 compressed pictures: [https://github.com/openSUSE/Customize-IBus/blob/main/customize-ibus%40hollowman.ml/img/logo.png](https://github.com/openSUSE/Customize-IBus/blob/main/customize-ibus%40hollowman.ml/img/logo.png) ):

![](https://img-blog.csdnimg.cn/20210505155614345.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

- **Centered + No repeat**:
  ![](https://img-blog.csdnimg.cn/20210503124715765.png)

- **Centered + Repeat**:
  ![](https://img-blog.csdnimg.cn/2021050312502110.png)

- **Full + No repeat**:
  ![](https://img-blog.csdnimg.cn/20210503124814264.png)

- **Full + Repeat**:
  ![](https://img-blog.csdnimg.cn/20210503125129957.png)

- **Zoom + No Repeat/Repeat (equivalent)**:
  ![](https://img-blog.csdnimg.cn/20210503124907786.png)

### Settings

![](https://img-blog.csdnimg.cn/f4297a6431e1489b8dc842c14d218ca0.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASG9sbG93TWFuNg==,size_20,color_FFFFFF,t_70,g_se,x_16)

Here you can reset the settings of this extension to default. You can also export current settings to an `ini` file for backup, and then import it when you need restore. For your information, you may also open the official IBus customization settings for customizations you can't find in this extension.

Click `Restore Default Settings`, after confirming, you can re-initialize the extension.

![](https://img-blog.csdnimg.cn/e77855aca78542929c27681d072f2263.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBASG9sbG93TWFuNg==,size_20,color_FFFFFF,t_70,g_se,x_16)

Click `Export Current Settings`, you can choose to export the current settings as a `*.inifile`. The default file name is `Customize_IBus_Settings_[Current Time].ini`:
![](https://img-blog.csdnimg.cn/20210705150208339.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

Example settings export file content:

```ini
[/]
candidate-box-position={'x': uint32 0, 'y': 0}
candidate-opacity=uint32 210
candidate-orientation=uint32 0
candidate-scroll-mode=uint32 0
custom-bg='/home/hollowman/图片/light.jpg'
custom-bg-dark='/home/hollowman/图片/dark.jpg'
custom-bg-mode=uint32 2
custom-bg-repeat-mode=uint32 1
custom-font='Sans 16'
custom-theme='/home/hollowman/stylesheet.css'
custom-theme-dark='/home/hollowman/stylesheet-dark.css'
enable-custom-theme=true
enable-custom-theme-dark=true
enable-orientation=true
fix-ime-list=true
ibus-restart-time='1625063857427'
indicator-custom-font='Sans Bold 16'
indicator-left-click-func=uint32 0
indicator-opacity=uint32 210
input-indicator-hide-time=uint32 2
input-indicator-not-on-single-ime=true
input-indicator-right-close=true
input-indicator-show-time=uint32 1
input-indicator-use-scroll=true
input-mode-list={'undefined': true, '': false, 'gjs': false, 'org.gnome.nautilus': false, 'google-chrome-beta': false, 'gedit': false, 'gnome-terminal': true, 'code': false, 'org.gnome.shell.extensions': true}
input-mode-remember=uint32 0
menu-ibus-emoji=true
menu-ibus-exit=true
menu-ibus-preference=true
menu-ibus-restart=true
menu-ibus-version=true
use-candidate-box-right-click=true
use-candidate-buttons=false
use-candidate-opacity=true
use-candidate-reposition=true
use-candidate-scroll=true
use-candidate-still=false
use-custom-bg=true
use-custom-bg-dark=true
use-custom-font=true
use-indicator-auto-hide=true
use-indicator-custom-font=true
use-indicator-left-click=true
use-indicator-opacity=true
use-indicator-reposition=true
use-indicator-show-delay=true
use-input-indicator=true
use-popup-animation=true
use-tray=true
use-tray-click-source-switch=true
```

Click `Import Settings from File`, you can choose to import the settings file you just saved:
![](https://img-blog.csdnimg.cn/20210705150359863.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

### About

At any time, you can click on the icon in the upper left corner to open this guide:
![](https://img-blog.csdnimg.cn/152e3337a00a4ece987d6bded29ce940.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBASG9sbG93TWFuNg==,size_20,color_FFFFFF,t_70,g_se,x_16)

## Non-GNOME desktop

### Customize IBus theme

In non-GNOME Shell desktop environment, the display effect of IBus is determined by the current GTK theme.

You can download more GTK3/4 themes from this website: [https://www.gnome-look.org/browse/cat/135/](https://www.gnome-look.org/browse/cat/135/), then put them in the `$HOME/.themes/` directory to complete the installation.

The following steps can change the GTK theme of IBus:

1. First, Install [ibus-theme-tools](https://github.com/openSUSE/IBus-Theme-Tools):

Recommend to use pip to install:

```bash
pip install ibus-theme-tools
```

You can also install manually:

```bash
git clone https://github.com/openSUSE/IBus-Theme-Tools.git
cd IBus-Theme-Tools && python3 setup.py install
```

For install using package manager:

- Arch Linux

You can use AUR to install:

```bash
yay -S ibus-theme-tools
```

[![](https://img-blog.csdnimg.cn/20210502152203849.png)](https://aur.archlinux.org/packages/ibus-theme-tools/)

- Ubuntu:

You can use PPA to install:

```bash
sudo add-apt-repository ppa:hollowman86/ibus-theme-tools
sudo apt-get update
```

- openSUSE

You can install directly through the [ymp file](https://software.opensuse.org/ymp/home:hollowman/openSUSE_Factory/ibus-theme-tools.ymp).

You can download the majority of your Linux distributions related packages through [OpenSUSE OBS](https://software.opensuse.org//download.html?project=home%3Ahollowman&package=ibus-theme-tools) and then install.

- Gentoo:

```bash
git clone https://github.com/openSUSE/IBus-Theme-Tools.git
cd IBus-Theme-Tools && make emerge
```

- NixOS:

```bash
sudo nix-env -i ibus-theme-tools
```

- Guix:

```bash
guix install ibus-theme-tools
```

2. Then run `ibus-theme-tools` in the terminal.

3. Enter `1`, choose to extract an IBus-related GTK theme, and press `Enter`.
   ![](https://img-blog.csdnimg.cn/4c85f813461249eda1bb8069ea5f1229.png)

4. Enter the IBus GTK theme you want to extract, and then press `Enter`. (Note that the theme name ends with `:dark` is the dark mode of the theme)
   ![](https://img-blog.csdnimg.cn/ce601d1c31564d429894d106a683452b.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

5. Enter the system GTK you want to mix, and then press `Enter`.
   ![](https://img-blog.csdnimg.cn/94756a8e9afa404a92c32a9be9c1f01a.png)

6. Select whether to add a customized background image for IBus panel, if you need press `2` and then press `Enter`.
   ![](https://img-blog.csdnimg.cn/6e65c62d3ed744df886ecdeee3571eae.png)

7. Enter the picture address：
   ![](https://img-blog.csdnimg.cn/1d167b6884da443f9260406d03ecb4a3.png)

8. Then choose repeat and sizing modes, and set background border radius (unit: `px`).
   ![](https://img-blog.csdnimg.cn/bdc295792c63427093b4a7d6ac913a3d.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzE4NTcyMDIz,size_16,color_FFFFFF,t_70)

9. If there is no error message, the setting action should be successful. Then you can choose the GTK theme that just generated in the system theme settings to apply the previous choices.
   ![](https://img-blog.csdnimg.cn/2b99d19a5171402e9ba466917b72525b.png)

### Customize IBus font size

Recommend to directly change the font and font size settings in the IBus preferences (`ibus-setup`).

Or:

`$HOME/.config/gtk-3.0/settings.ini` defines the current GTK3 theme and font size.

Example of the content of the file is as follows:

```ini
[Settings]
gtk-theme-name=Materia-light
gtk-font-name=更纱黑体 SC 12
```

In the above content, `gtk-theme-name` specifies that the current GTK theme is `material-light`, `gtk-font-name` specifies that the current font is `更纱黑体 SC` and the font size is `12`.

The IBus font and font size can be changed by modifying the above documents.

### Customize IBus colors (Create a GTK theme)

Create a GTK3 theme called `ibus-custom-theme` by running:

```bash
mkdir -p $HOME/.themes/ibus-custom-theme/gtk-3.0
$EDITOR $HOME/.themes/ibus-custom-theme/gtk-3.0/gtk.css
```

then edit the file content. An example can be:

```css
* {
  color: #0b141a; /* Font Color */
  background-color: #ffffff; /* Background Color */
  -gtk-secondary-caret-color: #d4d4d4; /* Highlight Background Color */
}
```

After that, referring to the actions of the `Customize IBus theme` part, please select the theme `ibus-custom-theme` which you just created.
