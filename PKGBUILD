# Maintainer: Hollow Man <hollowman@hollowman.ml>
# Contributor: Hollow Man <hollowman@hollowman.ml>

pkgname=gnome-shell-extension-customize-ibus
pkgver=18
pkgrel=1
epoch=0
pkgdesc="Changes your wallpaper daily to the bing.com background image"
arch=('any')
url="https://extensions.gnome.org/extension/4112/customize-ibus/"
license=('GPL')
depends=('gnome-shell>=40', 'gnome-tweaks')
source=("https://github.com/HollowMan6/Customize-IBus/archive/v${pkgver}.tar.gz")
sha512sums=('SKIP')
package() {
  _uuid='customize-ibus@hollowman.ml'
  _install_dir="${pkgdir}/usr/share/gnome-shell/extensions"
  make _build VERSION=${pkgver}
  mkdir -p $_install_dir
  mv _build ${_install_dir}/%{uuid}
}
