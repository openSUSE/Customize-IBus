%global commit 472657a654ab9e6c0684ac61e3037865f092dbd8
%global extension_version 16
%global date 20210420
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

%description
Customize IBus for orientation, shell theme, background picture, font and ascii mode auto-switch.
在 GNOME Shell 中更改 IBus 的候选框方向、shell 主题、背景图片、字体和输入法默认语言。

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

%post
chmod -R 777 %{_datadir}/gnome-shell/extensions/%{uuid}/

%changelog
* Tue Apr 20 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-16.20210418git472657a
- Modify theme load logic so that now we don't need to reload GNOME-Shell to change IBus themes.

* Sun Apr 18 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-13.20210418git6c2a9b3
- Fix bugs, make it suitable for RPM installization 

* Thu Apr 15 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-12.20210415gitab4f6cf
- Fix bugs, make it suitable for RPM installization 

* Sat Apr 10 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-12.20210410gitd31ef3e
- Initial Fedora package

