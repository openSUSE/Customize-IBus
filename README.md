# Customize IBus

[![last-commit](https://img.shields.io/github/last-commit/openSUSE/Customize-IBus)](https://github.com/openSUSE/Customize-IBus/graphs/commit-activity)
[![release-date](https://img.shields.io/github/release-date/openSUSE/Customize-IBus)](../../releases)

[![GPL Licence](https://img.shields.io/badge/license-GPL-blue)](https://opensource.org/licenses/GPL-3.0/)
[![Repo-Size](https://img.shields.io/github/repo-size/openSUSE/Customize-IBus.svg)](https://github.com/openSUSE/Customize-IBus/archive/main.zip)

### Welcome to contribute your translation on Weblate!

[![Translation Status](https://hosted.weblate.org/widgets/ibus-customize/-/287x66-grey.png)](https://hosted.weblate.org/engage/ibus-customize/)

[中文 Chinese](README_CN.md)

Full customization of appearance, behavior, system tray and input source indicator for IBus.

[Customize IBus User Guide](GUIDE.md)

![demo](img/demo-en.png)

## Installation

**_Since GNOME 45 has lost support for any older versions of GNOME Shell, getting it from GNOME Extensions Store is now the recommended installation method_**

[<img src="https://raw.githubusercontent.com/andyholmes/gnome-shell-extensions-badge/master/get-it-on-ego.svg?sanitize=true" alt="Get it on GNOME Extensions" height="100" align="middle">][ego]

### Linux

Manually:

```bash
git clone https://github.com/openSUSE/Customize-IBus.git
cd Customize-IBus && make install
```

If you use Arch Linux, you can also use AUR to install as a system extension:

```bash
yay -S gnome-shell-extension-customize-ibus
```

[![AUR](https://aur.archlinux.org/static/css/archnavbar/aurlogo.png)](https://aur.archlinux.org/packages/gnome-shell-extension-customize-ibus/)

You can also use RPM Repository to install as a system extension under [Fedora](../../tree/package-repo#fedora):

```bash
wget https://github.com/openSUSE/Customize-IBus/raw/package-repo/customize-ibus-rpm.repo
sudo mv customize-ibus-rpm.repo /etc/yum.repos.d/
sudo dnf update
sudo dnf install gnome-shell-extension-customize-ibus
```

You can also use RPM Repository to install as a system extension under [OpenSUSE](../../tree/package-repo#opensuse):

```bash
wget https://github.com/openSUSE/Customize-IBus/raw/package-repo/customize-ibus-rpm.repo
sudo mv customize-ibus-rpm.repo /etc/zypp/repos.d/
sudo zypper refresh
sudo zypper install gnome-shell-extension-customize-ibus
```

Or directly use [ymp file](gnome-shell-extension-customize-ibus.ymp) to install.

You can also use Debian Repository to install as a system extension under [Debian (Ubuntu)](../../tree/package-repo#debianubuntu):

```bash
echo "deb http://opensuse.github.io/Customize-IBus/deb/ /" | sudo tee -a /etc/apt/sources.list.d/customize-ibus-deb.list > /dev/null
wget -q -O - http://opensuse.github.io/Customize-IBus/hollowman.pgp | sudo apt-key add -
sudo apt update
sudo apt install gnome-shell-extension-customize-ibus
```

[Ubuntu PPA](https://launchpad.net/~hollowman86/+archive/ubuntu/customize-ibus)

```bash
sudo add-apt-repository ppa:hollowman86/customize-ibus
sudo apt-get update
```

You can download the majority of your Linux distributions related packages through [OpenSUSE OBS](https://software.opensuse.org//download.html?project=home%3Ahollowman&package=gnome-shell-extension-customize-ibus) and then install.

For Gentoo, to install as a system extension:

```bash
git clone https://github.com/openSUSE/Customize-IBus.git
cd Customize-IBus && make emerge
```

For NixOS:

```bash
sudo nix-env -i gnomeExtensions.customize-ibus
```

For Guix:

```bash
guix install gnome-shell-extension-customize-ibus
```

### FreeBSD

Manually:

```sh
git clone https://github.com/openSUSE/Customize-IBus.git
cd Customize-IBus && gmake install
```

You can also use Pkg Repository to install as a system extension under [FreeBSD](../../tree/package-repo#freebsd):

```sh
wget https://github.com/openSUSE/Customize-IBus/raw/package-repo/customize_ibus.conf
sudo mkdir -p /usr/local/etc/pkg/repos/
sudo mv customize_ibus.conf /usr/local/etc/pkg/repos/
sudo pkg update
sudo pkg install gnome-shell-extension-customize-ibus
```

## Features

Support Customization of:

- Candidate Box Orientation
- Candidate Box Animation
- Right-click Candidate Box to Switch the Input Mode or Open the Tray Menu
- Scroll on Candidate Box to Switch among Pages or Candidates
- Fix Candidate Box to Not Follow the Caret and Set Fixed Position
- Candidate Box Font
- Input Mode Remember and Auto-switch by APP
- Change Candidate Box Opacity
- Fix IME List Order
- Drag Candidate Box to Reposition
- Show or Hide Candidate Box Page Buttons
- System Tray Menus and Interaction Settings
    - Show or Hide Tray Icon
    - Directly Click Tray Icon to Switch Input Mode
    - Add Additional Menu
- Input Source Indicator Appearance and Interaction Settings
    - Enable Indicator
    - Only Indicate when Switching Input Mode
    - Only Indicate when Using ASCII Input Mode
    - Not Indicate when Using Single Mode IME
    - Right-click Indicator to Hide
    - Scroll on Indicator to Switch Input Mode
    - Indicator Animation
    - Customize Font
    - Left-click Indicator to Drag to Move Indicator or Switch Input Mode
    - Change Opacity
    - Enable Indicator Show Delay and Configure Showing Timeout
    - Enable Auto-hide Indicator and Configure Auto-hide Timeout
- Theme (Stylesheet Provided or Extracted from GNOME Shell Themes, Refer to Help Instructions in Extension for More)
- Candidate Box Background and its Displaying Style
- Theme and Background Picture Follow GNOME Night Light Mode

### Input Source Indicator

![](img/indicator.gif)

### Animation

With Slide enabled:

![](img/animation.gif)

### Drag to Reposition

![](img/reposition.gif)

### Fix IME List Order

When switching input methods, the order of indicator displaying is fixed instead of cycling from the middle.

Before:
![](img/fix-IME-list-before.gif)

After:
![](img/fix-IME-list-after.gif)

Imported from [Fixed IME List](https://extensions.gnome.org/extension/3663/fixed-ime-list/), more reasons for this feature can be found here: https://github.com/AlynxZhou/gnome-shell-extension-fixed-ime-list#why

### Realization of Customizing IBus with User Theme

This function has been separated, generating IBus theme stylesheet has been moved to [IBus-Theme-Tools](https://github.com/openSUSE/IBus-Theme-Tools).

Now this extension supports importing stylesheet generated by this tool. In addition it also supports the IBus theme stylesheets provided by [IBus-Theme-Hub](https://github.com/openSUSE/IBus-Theme-Hub).

When light theme and dark theme are turned on at the same time, the extension will automatically follow GNOME Night Light mode, use light theme when off, and use dark theme when on.

When only the light theme or dark theme is turned on, the extension will always use the theme that is turned on.

**Note:** ~~If your IBus style sheet has changed after application, please close and reopen the corresponding `custom IME theme` to make it effective.~~ Starting from v69, now this extension support stylesheets hot reload, CSS changes will reflect in real-time.

#### Themes in IBus Tweaker

Themes in IBus Tweaker have been converted by me as IBus theme stylesheets collection [仿微软 Microsoft](https://github.com/openSUSE/IBus-Theme-Hub/tree/main/%E4%BB%BF%E5%BE%AE%E8%BD%AFMicrosoft), you are welcomed to use it!

#### _NOTE:_

1. For users who don't use GNOME but other desktop environments like KDE, XFCE, etc., please use another project [IBus-Theme-Tools](https://github.com/openSUSE/IBus-Theme-Tools) to use a different GTK theme for IBus.
2. If not for debugging, please DO NOT add any classes that's not started with `.candidate-*` into IBus stylesheet to prevent from disturbing system themes.

### Realization of Modifying IBus Background Picture

During [fixing Unity8-Wood theme and add support for IBus Background](https://github.com/openSUSE/mentoring/issues/158#issuecomment-813837436), if adding the following style for class `.candidate-popup-content`：

```css
background: url('assets/bg.png');
background-repeat: no-repeat;
background-size: cover;
```

you can modify the background picture.

Further combining [ibus-font-setting](https://extensions.gnome.org/extension/1121/ibus-font-setting/) and [background-logo](https://pagure.io/background-logo-extension), referring to GNOME-Shell's source code, there exists the [corresponding widget](https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/master/js/ui/ibusCandidatePopup.js#L154) for class `candidate-popup-content`, and modified the style to realize modifying IBus background picture without restarting GNOME-Shell.

Support setting background picture displaying mode as Centered, Repeated and Zoom, and also repeat mode.

When light background and dark background are turned on at the same time, the extension will automatically follow GNOME Night Light mode, use light background when off, and use dark background when on.

When only the light background or dark background is turned on, the extension will always use the background that is turned on.

**Note:** Please make sure your background picture can always be visited. If your pictures are stored in the removable device and the system doesn't mount it by default, please close and reopen the corresponding `Use custom background` to make it effective after manually mounting.

## Changelog

- [x] Import from [ibus-tweaker](https://github.com/tuberry/ibus-tweaker) and remove features unrelated to IBus.
- [x] Read from user themes and apply only for IBus.
- [x] Merge functions related together.
- [x] V4: Update from GTK3 to GTK4 to adapt for GNOME40.
- [x] V8: Add functionality to modify IBus Background picture.
- [x] V13: Strip the current function of extracting IBus style from Gnome shell theme, implement using CSS parser libraries in Python instead of regular expression. Additional IBus style sheets are generated for users to modify and test.
- [x] V13: Modify this extension to accept IBus style sheets provided by users for style application.
- [x] V16: Modify theme load logic so that now we don't need to reload GNOME-Shell to change IBus themes.
- [x] V18: Add theme and background picture follow GNOME Night Light Mode.
- [x] V18: Refactor code.
- [x] V20: Change UI；Add Help page.
- [x] V22: Re-design UI.
- [x] V24: Add background picture displaying mode configure.
- [x] V26: Add background picture displaying repeat mode configure.
- [x] V28: Add extension prefs menu entry into IBus Input Source Indicate Panel.
- [x] V30: Add Remember Input State options.
- [x] V32: Change extension logo and UI.
- [x] V36: Add tray menu entries modifications and start/restart IBus button.
- [x] V38: Add IBus version displaying and input source indicator.
- [x] V40: Fix input source indicator BUGS, add more configs. Add IBus Input Popup Box animation customization feature.
- [x] V42: Add drag to move function.
- [x] V44: Refactor dragging to move feature to make it more robust.
- [x] V46: Fix several BUGs. Add right click to close source indicator.
- [x] V48: Add right click candidate box to switch input source. Support show or hide tray icon, directly click tray icon to switch input source.
- [x] V50: Add open menu for candidate right click, and click Input Source Indicator to switch source.
- [x] V52: Add feature for fixing candidate box.
- [x] V54: Fix support for ibus-rime of candidate box right click and indicator.
- [x] V55: Merge 3.38 into 40, make some changes for UI.
- [x] V56: UI changes. Add restoring default settings option. Clean codebase.
- [x] V57: Add feature for exporting and restoring settings from file.
- [x] V58: Add icons for opening files directly from Prefs. Change _.dconf into _.ini for configurations files.
- [x] V59: Add fix IME list order function and buttons to start official customization settings.
- [x] V60: Add customize font for indicator. Add show or hide candidate box page buttons. Improve on showing background.
- [x] V61: Add scroll on candidates box to switch among pages or candidates, scroll on indicator to switch input source.
- [x] V62: Fix settings sync problem with ibus-setup (preference).
- [x] V63: Fix to avoid tainting the GNOME Shell environment.
- [x] V64: Fix typos and indicator scroll settings control.
- [x] V65: Move project under openSUSE.
- [x] V66: Add support for openSUSE Leap 15.3.
- [x] V67: Further fix support for openSUSE Leap 15.3.
- [x] V68: Add functionality to modify opacity.
- [x] V69: Add support for theme style sheets hot reload.
- [x] V70: Fix and optimise for GSoC 2021 final submission.
- [x] V72: Add support for GNOME 41. Enable to reset to follow system themes and backgrounds.
- [x] V75: Fix support for wayland and reposition bug; Rearrange UI.
- [x] V76: Support hide input source indicator when using single mode IME. Add a show delay for input source indicator.
- [x] V77: Support instantly show indicator when switch window or IME even showing delay is enabled.
- [x] V78: Clean up and fix several Bugs.
- [x] V80: Relief from libnotify dependency. Fix IBus theme also get changed when using User Themes to change system themes.
- [x] V82: Initial support for GNOME 42.
- [x] V83: Support for GNOME 43.
- [x] V84: Fix to make lock screen theme get unaffected.
- [x] V85: Fix loading theme after unlocking the screen.
- [x] V86: Add support for GNOME 44.
- [x] V88: Have support for GNOME 45 (No support for any previous GNOME version now).
- [x] V89: Have support for GNOME 46 (No support for GNOME version 45 now).
- [x] V90: Have support for GNOME 47.
- [x] V91: Have support for GNOME 48.
- [x] V92: Have support for GNOME 49.

Tested on Fedora, OpenSUSE, Manjaro, Ubuntu and FreeBSD, GNOME-shell [3.38](../../tree/3.38)(v3, v5, v9, v11, v14, v15, v17, v19, v21, v23, v25, v27, v29, v31, v35, v37, v39, v41, v43, v45, v47, v49, v51, v53(merged into main in later version)), 40.0(v4, v8, v10, v12, v13, v16, v18, v20, v22, v24, v26, v28, v30, v32, v36, v38, v40, v42, v44, v46, v48, v50, v52, v54), 3.38 and 40(v55, v56, v57, v58, v59, v60, v61, v62, v63, v64, v65, v66), 3.34, 3.36, 3.38 and 40(v67, v68, v69, v70), 41(v72, v75, v76, v77, v78, v80), 42(v82), 43(v83, v84, v85), 44(v86), 45(v88), 46(v89), 47(v90), 48(v91, v92), 49(v92).

## Acknowledgements

1. [ibus-font-setting](https://extensions.gnome.org/extension/1121/ibus-font-setting/)
2. [ibus-tweaker](https://github.com/tuberry/ibus-tweaker)
3. [fixed-ime-list](https://github.com/AlynxZhou/gnome-shell-extension-fixed-ime-list)

_This project was part of the achievement of [@HollowMan6](https://github.com/HollowMan6) partipating the [Google Summer of Code 2021](https://summerofcode.withgoogle.com/archive/2021/projects/6295506795364352/) at [OpenSUSE](https://github.com/openSUSE/mentoring/issues/158)._

[ego]: https://extensions.gnome.org/extension/4112/customize-ibus/
