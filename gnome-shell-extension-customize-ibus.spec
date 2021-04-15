%global commit d31ef3e2b047ea0497729f5f8d9eb47bc755f7a4
%global extension_version 12
%global date 20210410
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
chmod -R 744 %{_datadir}/gnome-shell/extensions/%{uuid}/

%changelog
* Sat Apr 10 2021 Hollow Man <hollowman@hollowman.ml> - 40.0-12.20210410gitd31ef3e
- Initial Fedora package

