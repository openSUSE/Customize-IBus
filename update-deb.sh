#!/usr/bin/env bash

# Maintainer: Hollow Man <hollowman at hollowman dot ml>
# Contributor: Hollow Man <hollowman at hollowman dot ml>

cd deb
rm -fr Packages; dpkg-scanpackages . > Packages
rm -fr Packages.gz; cat Packages | gzip -c9  > Packages.gz
rm -fr Release; apt-ftparchive release . > Release
rm -fr Release.gpg; gpg -abs -o Release.gpg Release
rm -fr InRelease; gpg --clearsign -o InRelease Release
