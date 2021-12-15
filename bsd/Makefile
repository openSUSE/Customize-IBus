# Created by: Hollow Man <hollowman@opensuse.org>

PORTNAME=		gnome-shell-extension-customize-ibus
PORTVERSION=	${_VER}
DISTVERSIONPREFIX=	v
CATEGORIES=	deskutils gnome
DIST_SUBDIR=	gnome

MAINTAINER=	hollowman@opensuse.org
COMMENT=		Customize IBus

LICENSE=		GPLv3+
LICENSE_FILE=	${WRKSRC}/LICENSE

BUILD_DEPENDS=	gnome-shell>=3.34:x11/gnome-shell \
				gsettings-desktop-schemas>=3.12.0:devel/gsettings-desktop-schemas \
				ibus>=0:textproc/ibus \
				gettext>=0:devel/gettext
RUN_DEPENDS=	gnome-shell>=3.34:x11/gnome-shell \
				gsettings-desktop-schemas>=3.12.0:devel/gsettings-desktop-schemas \
				ibus>=0:textproc/ibus \
				gettext>=0:devel/gettext

USES=			gettext gmake gnome localbase pkgconfig
USE_GNOME=	glib20
USE_GITHUB=	yes
GLIB_SCHEMAS=	${_SCHEMA}

GH_ACCOUNT=	openSUSE
GH_TAGNAME=	363d687
GH_PROJECT=	Customize-IBus

PKGMESSAGE=	/usr/ports/deskutils/gnome-shell-extra-extensions/pkg-message.slaves

_VER=			80
_UUID=			customize-ibus@hollowman.ml
_SCHEMA=		org.gnome.shell.extensions.customize-ibus.gschema.xml

pre-build:
		@(cd ${WRKSRC} && ${GMAKE} clean)

do-build:
		@(cd ${WRKSRC} && ${GMAKE} _build VERSION=${_VER})

do-install:
		@${MKDIR} ${STAGEDIR}${PREFIX}/share/glib-2.0/schemas/
		@(cd ${WRKSRC} && ${MV} _build/schemas/${_SCHEMA} \
			${STAGEDIR}${PREFIX}/share/glib-2.0/schemas/)
		@${MKDIR} ${STAGEDIR}${PREFIX}/share/gnome-shell/extensions/
		@(cd ${WRKSRC} && ${MV} _build ${STAGEDIR}${PREFIX}/share/gnome-shell/extensions/${_UUID})

.include <bsd.port.mk>
