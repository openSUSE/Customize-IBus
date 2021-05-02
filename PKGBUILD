# Maintainer: Hollow Man <hollowman at hollowman dot ml>
# Contributor: Hollow Man <hollowman at hollowman dot ml>

pkgname=gnome-shell-extension-customize-ibus
_pkgname=Customize-IBus
_commit=55b8fe00c79c0834161083e43ce4bb4aa3ab2d7c
pkgver=30
pkgrel=1
epoch=0
pkgdesc="Customize IBus for orientation, font, ascii mode auto-switch; theme and background picture follow GNOME Night Light Mode."
arch=('any')
url="https://extensions.gnome.org/extension/4112/customize-ibus/"
license=('GPLv3')
depends=('gnome-shell>=40', 'gnome-tweaks')
source=("https://github.com/HollowMan6/Customize-IBus/archive/${_commit}/${_pkgname}-${_commit}.tar.gz")
sha512sums=('SKIP')
package() {
  _uuid='customize-ibus@hollowman.ml'
  _install_dir="${pkgdir}/usr/share/gnome-shell/extensions"
  cd ${_pkgname}-${_commit}
  make _build VERSION=${pkgver}
  mkdir -p $_install_dir
  mv _build ${_install_dir}/${_uuid}
}
