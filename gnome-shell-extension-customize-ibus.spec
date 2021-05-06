%global commit 84a450e96ff4be08a5c5d89d65f2c4ac8bc41e63
%global extension_version 38
%global date 20210507
%global shell_version 40.0
%global uuid customize-ibus@hollowman.ml
%global forgeurl https://github.com/HollowMan6/Customize-IBus
%global shortcommit %(c=%{commit}; echo ${c:0:7})

Name:           gnome-shell-extension-customize-ibus
Version:        %{shell_version}
Release:        %{extension_version}.%{date}git%{shortcommit}%{?dist}
Summary:        Customize IBus extension for GNOME Shell

License:        GPLv3
URL:            %{forgeurl}
Source0:        %{forgeurl}/archive/%{commit}/Customize-IBus-%{commit}.tar.gz
BuildArch:	noarch

BuildRequires:	gettext
BuildRequires:	%{_bindir}/glib-compile-schemas
BuildRequires:  make

Requires:       gnome-shell >= %{shell_version}
Requires:       gnome-tweaks

%description
Customize IBus for orientation, font, ascii mode auto-switch, system tray menu entries, input source indicator; theme and background picture follow GNOME Night Light Mode.
在 GNOME Shell 中更改 IBus 的候选框方向、字体、输入法默认语言、系统托盘菜单、输入源指示器，主题、背景图片跟随 GNOME 夜灯模式自动切换。

%prep
%%setup -q -n Customize-IBus-%{commit}

%build
make _build VERSION=%{extension_version}

%install
mkdir -p %{buildroot}/%{_datadir}/gnome-shell/extensions
mv _build %{buildroot}%{_datadir}/gnome-shell/extensions/%{uuid}

%files
%license LICENSE
%doc README.md
%{_datadir}/gnome-shell/extensions/%{uuid}/

%changelog
* Fri May 07 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-38.20210507git84a450e
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
- Fix bugs, make it suitable for RPM installization 

* Thu Apr 15 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-12.20210415gitab4f6cf
- Fix bugs, make it suitable for RPM installization 

* Sat Apr 10 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-12.20210410gitd31ef3e
- Initial Fedora package

