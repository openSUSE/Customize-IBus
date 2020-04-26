# ibus-tweaker
Tweaker of ibus for font and ascii mode auto-switch (remember input source status for windows with a top-down method).
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

![ibus-tweaker](https://user-images.githubusercontent.com/17917040/80307808-01cee280-87fe-11ea-9f44-267bd7a8805f.png)

### ASCII mode auto switch

Fill the blanks with `wmclass` in `looking glass` for initializing switch

![ascii](https://user-images.githubusercontent.com/17917040/80308786-70626f00-8803-11ea-8bbc-13d49efe4b4a.png)

### Candidates font
Support font style and non-standard font weight

![font](https://user-images.githubusercontent.com/17917040/80307919-ba952180-87fe-11ea-80dd-661ac9e9a9b8.png)

### Candidates orientation
Some Chinese IMEs with IBus support do not support the orientation setting of IBus. Aha funny.

![luna](https://user-images.githubusercontent.com/17917040/80308136-c46b5480-87ff-11ea-8084-90fa04b132c9.png)

### MS style theme
I like the theme of Microsoft default IME. The theme contains 7 variants with different colors of my Vim colorscheme

![purple](https://user-images.githubusercontent.com/17917040/80308280-a6eaba80-8800-11ea-8b9a-c393dfdcdd44.png)

### Hide Activities
It's for my personal use and migrated from [hide-activities-button](https://extensions.gnome.org/extension/1128/hide-activities-button/)

## Acknowledgements

1. [hide-activities-button](https://extensions.gnome.org/extension/1128/hide-activities-button/)
2. [ibus-font-setting](https://extensions.gnome.org/extension/1121/ibus-font-setting/)

## Note
1. If you love this extension, please star me and recommend it to your friends;
2. Please thumb up or comment on the upstream [issue](https://github.com/ibus/ibus/issues/1679) for native support, thanks in advance.

[EGO]:https://extensions.gnome.org/extension/2820/ibus-tweaker/
[license]:https://img.shields.io/badge/license-GPLv3-green.svg
