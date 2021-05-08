#! /bin/bash

gs=/usr/lib/gnome-shell/libgnome-shell.so

mkdir $HOME/gnome-shell-js
cd $HOME/gnome-shell-js

mkdir -p ui/components ui/status misc perf extensionPrefs gdm

for r in `gresource list $gs`; do
  gresource extract $gs $r > ${r/#\/org\/gnome\/shell/.}
done

cd $HOME/gnome-shell-js/ui

wget https://gitlab.gnome.org/HollowMan6/gnome-shell/-/raw/HollowMan6-master-patch-85303/js/ui/ibusCandidatePopup.js

echo 'export GNOME_SHELL_JS=$HOME/gnome-shell-js' >> ~/.profile
