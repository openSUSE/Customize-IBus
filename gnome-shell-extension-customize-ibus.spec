#
# spec file for package gnome-shell-extension-customize-ibus
#
# Copyright (c) 2021 Hollow Man
#
# All modifications and additions to the file contributed by third parties
# remain the property of their copyright owners, unless otherwise agreed
# upon. The license for this file, and modifications and additions to the
# file, is the same license as for the pristine package itself (unless the
# license for the pristine package is not an Open Source License, in which
# case the license is the MIT License). An "Open Source License" is a
# license that conforms to the Open Source Definition (Version 1.9)
# published by the Open Source Initiative.

# Please submit bugfixes or comments via https://github.com/HollowMan6/Customize-IBus/issues
#


%global commit de29e48a8dda1fb5d7427a218c8c09513d2f32f1
%global extension_version 64
%global date 20210628
%global uuid customize-ibus@hollowman.ml
%global forgeurl https://github.com/HollowMan6/Customize-IBus
%global shortcommit %(c=%{commit}; echo ${c:0:7})

Name:           gnome-shell-extension-customize-ibus
Version:        %{extension_version}
Release:        %{date}git%{shortcommit}%{?dist}
Summary:        Customize IBus extension for GNOME Shell

License:        GPL-3.0-or-later
URL:            %{forgeurl}
Source0:        %{forgeurl}/archive/%{commit}/Customize-IBus-%{commit}.tar.gz
BuildArch:      noarch

BuildRequires:  gettext
BuildRequires:  glib2-devel
BuildRequires:  make

Requires:       gnome-shell
Requires:       gnome-tweaks

%description
Full customization of appearance, behavior, system tray and input source indicator for IBus.
深度定制 IBus 的外观、行为、系统托盘以及输入指示。

%prep
%%setup -q -n Customize-IBus-%{commit}

%build
make _build VERSION=%{extension_version}

%install
mkdir -p %{buildroot}/%{_datadir}/gnome-shell/extensions
mv _build %{buildroot}%{_datadir}/gnome-shell/extensions/%{uuid}
%find_lang customize-ibus

%files -f customize-ibus.lang
%license LICENSE
%doc README.md
%dir %{_datadir}/gnome-shell
%dir %{_datadir}/gnome-shell/extensions
%{_datadir}/gnome-shell/extensions/%{uuid}/

%changelog
* Sat Jun 26 2021 Hollow Man <hollowman@hollowman.ml> - 20210626git75a6f7b
- Fix settings sync problem with ibus-setup (preference).

* Sun Jun 20 2021 Hollow Man <hollowman@hollowman.ml> - 20210620git29bd3df
- Add scroll on candidates box to switch among pages or candidates.
- Add scroll on indicator to switch input source.

* Fri Jun 18 2021 Hollow Man <hollowman@hollowman.ml> - 20210618gitb6e507b
- Add customize font for indicator.
- Add show or hide candidate box page buttons.
- Improve on showing background.

* Thu Jun 10 2021 Hollow Man <hollowman@hollowman.ml> - 20210610git8900c0c
- Add fix IME list order function and buttons to start official customization settings.

* Wed Jun 09 2021 Hollow Man <hollowman@hollowman.ml> - 20210609git21eb1ac
- Add icons for opening files directly from Prefs.
- Change *.dconf into *.ini for configurations files.

* Tue Jun 08 2021 Hollow Man <hollowman@hollowman.ml> - 20210608git23c4f00
- Add feature for exporting and restoring settings from file.

* Sun Jun 06 2021 Hollow Man <hollowman@hollowman.ml> - 20210606git535959c
- UI changes. Add restoring default settings option. Clean codebase.

* Sat Jun 05 2021 Hollow Man <hollowman@hollowman.ml> - 54.20210605gitd0c74ee
- Merge 3.38 into 40, make some changes for UI.

* Sun May 30 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-54.20210530gitc52cd9f
- Fix support for ibus-rime of candidate box right click and indicator.

* Tue May 25 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-52.20210525git437198b
- Add feature for fixing candidate box.

* Tue May 25 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-50.20210525git75701c8
- Add open menu for candidate right click.
- Add click Input Source Indicator to switch source.

* Sun May 23 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-48.20210523git8ece98a
- Add right click candidate box to switch input source.
- Support show or hide tray icon, directly click tray icon to switch input source.

* Fri May 21 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-46.20210521gita9781aa
- Fix several BUGs.
- Add right click to close source indicator.

* Wed May 12 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-44.20210512gitb846fe4
- Refactor dragging to move feature to make it more robust.

* Mon May 10 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-42.20210510gitcadef52
- Add drag to move function.

* Sat May 08 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-40.20210508git6b080f2
- Fix input source indicator BUGS.
- Add IBus Input Popup Box animation customization feature.

* Fri May 07 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-38.20210507gitf9aa797
- Add IBus version displaying and input source indicator.

* Wed May 05 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-36.20210505gitb7423b7
- Add tray menu entries modifications and start/restart IBus button.

* Mon May 03 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-32.20210503gita5226c2
- Change extension logo and UI.

* Sun May 02 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-30.20210502git55b8fe0
- Add Remember Input State options.

* Sat May 01 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-28.20210501git017ebaa
- Add extension prefs menu entry into IBus Input Source Indicate Panel.

* Tue Apr 27 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-26.20210427git4b31924
- Add background picture displaying repeat mode configure.

* Mon Apr 26 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-24.20210426gitfdc2895
- Add background picture displaying mode configure.

* Sun Apr 25 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-22.20210425git51d8ce5
- Re-design UI.

* Fri Apr 23 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-20.20210423git3d2ad17
- Change UI; Add Help page.

* Wed Apr 21 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-18.20210421git38e5a78
- Add theme and background picture follow GNOME Night Light Mode. Refactor code.

* Tue Apr 20 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-16.20210418git472657a
- Modify theme load logic so that now we don't need to reload GNOME-Shell to change IBus themes.

* Sun Apr 18 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-13.20210418git6c2a9b3
- Fix bugs, make it suitable for RPM installization.

* Thu Apr 15 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-12.20210415gitab4f6cf
- Fix bugs, make it suitable for RPM installization.

* Sat Apr 10 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-12.20210410gitd31ef3e
- Initial Fedora package.
