#!/usr/bin/env bash

# Maintainer: Hollow Man <hollowman at hollowman dot ml>
# Contributor: Hollow Man <hollowman at hollowman dot ml>

cd deb
KEYNAME='Hollow Man (Domain Address) <hollowman@hollowman.ml>'
dpkg-sig -k "$KEYNAME" --sign repo gnome-shell-extension-customize-ibus_*.deb
rm -fr Packages.gz; dpkg-scanpackages . | gzip -c9  > Packages.gz
rm -fr Release; apt-ftparchive release . > Release
rm -fr Release.gpg; gpg --default-key "$KEYNAME" -abs -o Release.gpg Release
rm -fr InRelease; gpg --default-key "$KEYNAME" --clearsign -o InRelease Release
