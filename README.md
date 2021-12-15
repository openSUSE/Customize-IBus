# Customize IBus Distribution Repos 自定义 IBus 分发仓库

[![last-commit](https://img.shields.io/github/last-commit/openSUSE/Customize-IBus)](https://github.com/openSUSE/Customize-IBus/graphs/commit-activity)
[![release-date](https://img.shields.io/github/release-date/openSUSE/Customize-IBus)](../../releases)

[![GPL Licence](https://img.shields.io/badge/license-GPL-blue)](https://opensource.org/licenses/GPL-3.0/)
[![Repo-Size](https://img.shields.io/github/repo-size/openSUSE/Customize-IBus.svg)](https://github.com/openSUSE/Customize-IBus/archive/main.zip)

[![Total alerts](https://img.shields.io/lgtm/alerts/g/openSUSE/Customize-IBus.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/openSUSE/Customize-IBus/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/openSUSE/Customize-IBus.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/openSUSE/Customize-IBus/context:javascript)

Full customization of appearance, behavior, system tray and input source indicator for IBus.

深度定制 IBus 的外观、行为、系统托盘以及输入指示。

## [Fedora](rpm)

```bash
wget https://github.com/openSUSE/Customize-IBus/raw/package-repo/customize-ibus-rpm.repo
sudo mv customize-ibus-rpm.repo /etc/yum.repos.d/
sudo dnf update
sudo dnf install gnome-shell-extension-customize-ibus
```

## [openSUSE](rpm)

```bash
wget https://github.com/openSUSE/Customize-IBus/raw/package-repo/customize-ibus-rpm.repo
sudo mv customize-ibus-rpm.repo /etc/zypp/repos.d/
sudo zypper refresh
sudo zypper install gnome-shell-extension-customize-ibus
```

## [Debian/Ubuntu](deb)

```bash
echo "deb https://opensuse.github.io/Customize-IBus/deb/ /" | sudo tee -a /etc/apt/sources.list.d/customize-ibus-deb.list > /dev/null
wget -q -O - https://opensuse.github.io/Customize-IBus/hollowman.key | sudo apt-key add -
sudo apt update
sudo apt install gnome-shell-extension-customize-ibus
```

## [FreeBSD](pkg)

```sh
wget https://github.com/openSUSE/Customize-IBus/raw/package-repo/customize_ibus.conf
sudo mkdir -p /usr/local/etc/pkg/repos/
sudo mv customize_ibus.conf /usr/local/etc/pkg/repos/
sudo pkg update
sudo pkg install gnome-shell-extension-customize-ibus
```
