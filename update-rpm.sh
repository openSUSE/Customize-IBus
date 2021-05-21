#!/usr/bin/env bash

# Maintainer: Hollow Man <hollowman at hollowman dot ml>
# Contributor: Hollow Man <hollowman at hollowman dot ml>

cd rpm
rm -rf drpms repodata
rpm --addsign gnome-shell-extension-customize-ibus-*.noarch.rpm
createrepo_c --deltas --retain-old-md 1 ./

# Change this to your GPG key name
KEY_NAME='Hollow Man (Domain Address) <hollowman@hollowman.ml>'

gpg -a --export "$KEY_NAME" > repomd.xml.key

if [ -d repodata ] ; then
cd repodata
if [ -f repomd.xml ] ; then
echo "Signing repository $i"
rm -f repomd.xml.asc
gpg --batch -a --detach-sign --default-key "$KEY_NAME" repomd.xml
cp -f ../repomd.xml.key .
fi
cd ..
fi

rm -f repomd.xml.key