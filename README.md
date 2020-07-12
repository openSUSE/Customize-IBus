# ibus-tweaker
Tweaker of ibus for orientation, theme, font and ascii mode auto-switch.
> 狙公赋芧曰：“朝三而暮四”。众狙皆怒。曰：“然则朝四而暮三”。众狙皆悦。 —— *《庄子·齐物论》*<br>
[![license]](/LICENSE)

</br>

## Installation
[<img src="https://raw.githubusercontent.com/andyholmes/gnome-shell-extensions-badge/master/get-it-on-ego.svg?sanitize=true" alt="Get it on GNOME Extensions" height="100" align="middle">][EGO]

Or manually:
```shell
git clone https://github.com/tuberry/ibus-tweaker.git
cp -r './ibus-tweaker/ibus-tweaker@tuberry.github.com' ~/.local/share/gnome-shell/extensions/
```

## Features

![ibus-tweaker](https://user-images.githubusercontent.com/17917040/86506643-e1299700-be03-11ea-88e8-5f3818fdf23b.png)

### ASCII mode auto switch

Fill the blanks with `wmclass` in `looking glass` for initializing status

![ascii](https://user-images.githubusercontent.com/17917040/80308786-70626f00-8803-11ea-8bbc-13d49efe4b4a.png)

### Candidates font
Support font style and non-standard font weight

![font](https://user-images.githubusercontent.com/17917040/86506736-e76c4300-be04-11ea-866a-216b558bca93.png)

### Candidates orientation
Some IMEs do not respect the orientation setting of IBus.

![lua](https://user-images.githubusercontent.com/17917040/86506816-9a3ca100-be05-11ea-8db7-f9b0f02b29d8.png)

### MS style theme
The theme, imitating Microsoft default IME, contains 7*2 (night mode) variants in different colors of my Vim colorscheme.

![purple](https://user-images.githubusercontent.com/17917040/86507017-5e0a4000-be07-11ea-92e2-ad5dc0c285f0.png)

### Others
Here are some functions from other extensions for personal use:
#### Hide Activities
From [hide-activities-button](https://extensions.gnome.org/extension/1128/hide-activities-button/).

#### Hide Minimized in AltTab
From [hide minimized](https://extensions.gnome.org/extension/2639/hide-minimized/).

## Acknowledgements

1. [hide-activities-button](https://extensions.gnome.org/extension/1128/hide-activities-button/)
2. [ibus-font-setting](https://extensions.gnome.org/extension/1121/ibus-font-setting/)
3. [hide-minimized](https://extensions.gnome.org/extension/2639/hide-minimized/)

## Note
1. If you love this extension, please thumb up or comment on the upstream [issue](https://github.com/ibus/ibus/issues/1679) for native support, thanks in advance.

[EGO]:https://extensions.gnome.org/extension/2820/ibus-tweaker/
[license]:https://img.shields.io/badge/license-GPLv3-green.svg
