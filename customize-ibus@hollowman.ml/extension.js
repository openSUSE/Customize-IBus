// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-
// vim:fdm=syntax
// by hollowman6@github tuberry@github

"use strict";

const Main = imports.ui.main;
const Panel = imports.ui.panel;
const PanelMenu = imports.ui.panelMenu;
const {
  Shell,
  Clutter,
  Gio,
  GLib,
  Meta,
  IBus,
  Pango,
  St,
  GObject,
} = imports.gi;

const BoxPointer = imports.ui.boxpointer;
const Keyboard = imports.ui.status.keyboard;
const InputSourceManager = Keyboard.getInputSourceManager();
const InputSourceIndicator = Main.panel.statusArea.keyboard;
const IBusManager = imports.misc.ibusManager.getIBusManager();
const CandidatePopup = IBusManager._candidatePopup;
const CandidateArea = CandidatePopup._candidateArea;

const ExtensionUtils = imports.misc.extensionUtils;
const Util = imports.misc.util;
const gsettings = ExtensionUtils.getSettings();
const Me = ExtensionUtils.getCurrentExtension();
const _ = imports.gettext.domain(Me.metadata["gettext-domain"]).gettext;
const Fields = Me.imports.fields.Fields;
const UNKNOWN = { ON: 0, OFF: 1, DEFAULT: 2 };
const ASCIIMODES = ["en", "A", "英"];
const INDICATORANI = ["NONE", "SLIDE", "FADE", "FULL"];
const INPUTMODE = "InputMode";
const BGMODES = ["Centered", "Repeated", "Zoom"];
const BGREPEATMODES = ["no-repeat", "repeat"];
const BGMODESACTIONS = {
  Centered: "auto",
  Repeated: "contain",
  Zoom: "cover",
};

const System = {
  LIGHT: "night-light-enabled",
  PROPERTY: "g-properties-changed",
  BUS_NAME: "org.gnome.SettingsDaemon.Color",
  OBJECT_PATH: "/org/gnome/SettingsDaemon/Color",
};
const { loadInterfaceXML } = imports.misc.fileUtils;
const ColorInterface = loadInterfaceXML(System.BUS_NAME);
const ColorProxy = Gio.DBusProxy.makeProxyWrapper(ColorInterface);
const ngsettings = new Gio.Settings({
  schema: "org.gnome.settings-daemon.plugins.color",
});

const IBusInputSourceIndicater = GObject.registerClass(
  {
    Properties: {
      inputindtog: GObject.param_spec_boolean(
        "inputindtog",
        "inputindtog",
        "inputindtog",
        false,
        GObject.ParamFlags.WRITABLE
      ),
      inputindascii: GObject.param_spec_boolean(
        "inputindascii",
        "inputindascii",
        "inputindascii",
        false,
        GObject.ParamFlags.WRITABLE
      ),
      inputindanim: GObject.param_spec_uint(
        "inputindanim",
        "inputindanim",
        "inputindanim",
        0,
        3,
        3,
        GObject.ParamFlags.READWRITE
      ),
      useindautohid: GObject.param_spec_boolean(
        "useindautohid",
        "useindautohid",
        "useindautohid",
        false,
        GObject.ParamFlags.WRITABLE
      ),
      inputindhid: GObject.param_spec_uint(
        "inputindhid",
        "inputindhid",
        "inputindhid",
        1,
        5,
        2,
        GObject.ParamFlags.WRITABLE
      ),
    },
  },
  class IBusInputSourceIndicater extends BoxPointer.BoxPointer {
    _init() {
      super._init(St.Side.TOP);
      this._bindSettings();
      this.visible = false;
      this.style_class = "candidate-popup-boxpointer";
      this._dummyCursor = new St.Widget({ opacity: 0 });
      Main.layoutManager.uiGroup.add_actor(this._dummyCursor);
      Main.layoutManager.addChrome(this);
      let box = new St.BoxLayout({
        style_class: "candidate-popup-content",
        vertical: true,
      });
      this.bin.set_child(box);
      this._inputIndicatorLabel = new St.Label({
        style_class: "candidate-popup-text",
        visible: true,
      });
      box.add(this._inputIndicatorLabel);

      this._panelService = null;
      this._overviewHiddenID = Main.overview.connect(
        "hidden",
        this._onWindowChanged.bind(this)
      );
      this._overviewShowingID = Main.overview.connect(
        "showing",
        this._onWindowChanged.bind(this)
      );
      this._onWindowChangedID = global.display.connect(
        "notify::focus-window",
        this._onWindowChanged.bind(this)
      );
    }

    _bindSettings() {
      gsettings.bind(
        Fields.INPUTINDTOG,
        this,
        "inputindtog",
        Gio.SettingsBindFlags.GET
      );
      gsettings.bind(
        Fields.INPUTINDASCII,
        this,
        "inputindascii",
        Gio.SettingsBindFlags.GET
      );
      gsettings.bind(
        Fields.INPUTINDANIM,
        this,
        "inputindanim",
        Gio.SettingsBindFlags.GET
      );
      gsettings.bind(
        Fields.USEINDAUTOHID,
        this,
        "useindautohid",
        Gio.SettingsBindFlags.GET
      );
      gsettings.bind(
        Fields.INPUTINDHID,
        this,
        "inputindhid",
        Gio.SettingsBindFlags.GET
      );
    }

    set inputindtog(inputindtog) {
      this.onlyOnToggle = inputindtog;
    }

    set inputindascii(inputindascii) {
      this.onlyASCII = inputindascii;
    }

    set inputindanim(inputindanim) {
      this.animation = INDICATORANI[inputindanim];
    }

    set useindautohid(useindautohid) {
      this.enableAutoHide = useindautohid;
    }

    set inputindhid(inputindhid) {
      this.hideTime = inputindhid;
    }

    _connectPanelService(panelService) {
      this._panelService = panelService;
      if (!panelService) return;

      this._setCursorLocationID = panelService.connect(
        "set-cursor-location",
        (ps, x, y, w, h) => {
          this._setDummyCursorGeometry(x, y, w, h);
        }
      );
      try {
        this._setCursorLocationRelativeID = panelService.connect(
          "set-cursor-location-relative",
          (ps, x, y, w, h) => {
            if (!global.display.focus_window) return;
            let window = global.display.focus_window.get_compositor_private();
            this._setDummyCursorGeometry(window.x + x, window.y + y, w, h);
          }
        );
      } catch (e) {
        // Only recent IBus versions have support for this signal
        // which is used for wayland clients. In order to work
        // with older IBus versions we can silently ignore the
        // signal's absence.
      }
      this._focusOutID = panelService.connect("focus-out", () => {
        this.close(BoxPointer.PopupAnimation[this.animation]);
      });
      this._updatePropertyID = panelService.connect(
        "update-property",
        (engineName, prop) => {
          if (prop.get_key() == INPUTMODE) {
            this._inputIndicatorLabel.text = this._getInputLabel();
            this._updateVisibility(true);
          }
        }
      );
    }

    _setDummyCursorGeometry(x, y, w, h) {
      this._dummyCursor.set_position(Math.round(x), Math.round(y));
      this._dummyCursor.set_size(Math.round(w), Math.round(h));
      this.setPosition(this._dummyCursor, 0);
      this._updateVisibility();
    }

    _updateVisibility(sourceToggle = false) {
      this.visible = !CandidatePopup.visible;
      if (this.onlyOnToggle) this.visible = this.onlyOnToggle && sourceToggle;
      if (this.onlyASCII)
        if (!ASCIIMODES.includes(this._inputIndicatorLabel.text))
          this.visible = false;
      if (this._lastTimeOut) {
        GLib.source_remove(this._lastTimeOut);
        this._lastTimeOut = null;
      }
      if (this.visible) {
        this.setPosition(this._dummyCursor, 0);
        this.open(BoxPointer.PopupAnimation[this.animation]);
        this.get_parent().set_child_above_sibling(this, null);
        if (this.enableAutoHide)
          this._lastTimeOut = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            this.hideTime,
            () => {
              this.close(BoxPointer.PopupAnimation[this.animation]);
              this._lastTimeOut = null;
              return GLib.SOURCE_REMOVE;
            }
          );
      } else {
        this.close(BoxPointer.PopupAnimation[this.animation]);
      }
    }

    _onWindowChanged() {
      if (IBusManager._panelService !== this._panelService) {
        this._connectPanelService(IBusManager._panelService);
        global.log(_("IBus panel service connected!"));
        this._inputIndicatorLabel.text = this._getInputLabel();
      }
    }

    _getInputLabel() {
      const labels = InputSourceIndicator._indicatorLabels;
      return labels[InputSourceManager.currentSource.index].get_text();
    }

    _destroy_indicator() {
      if (this._setCursorLocationID)
        this._panelService.disconnect(this._setCursorLocationID),
          (this._setCursorLocationID = 0);
      if (this._setCursorLocationRelativeID)
        this._panelService.disconnect(this._setCursorLocationRelativeID),
          (this._setCursorLocationRelativeID = 0);
      if (this._focusOutID)
        this._panelService.disconnect(this._focusOutID), (this._focusOutID = 0);
      if (this._updatePropertyID)
        this._panelService.disconnect(this._updatePropertyID),
          (this._updatePropertyID = 0);
    }

    destroy() {
      if (this._onWindowChangedID)
        global.display.disconnect(this._onWindowChangedID),
          (this._onWindowChangedID = 0);
      if (this._overviewShowingID)
        Main.overview.disconnect(this._overviewShowingID),
          (this._overviewShowingID = 0);
      if (this._overviewHiddenID)
        Main.overview.disconnect(this._overviewHiddenID),
          (this._overviewHiddenID = 0);
      this._destroy_indicator();
    }
  }
);

const IBusAutoSwitch = GObject.registerClass(
  {
    Properties: {
      unknown: GObject.param_spec_uint(
        "unknown",
        "unknown",
        "unknown",
        0,
        2,
        2,
        GObject.ParamFlags.READWRITE
      ),
      remember: GObject.param_spec_uint(
        "remember",
        "remember",
        "remember",
        0,
        1,
        1,
        GObject.ParamFlags.WRITABLE
      ),
    },
  },
  class IBusAutoSwitch extends GObject.Object {
    _init() {
      super._init();
      this._bindSettings();
      this._overviewHiddenID = Main.overview.connect(
        "hidden",
        this._onWindowChanged.bind(this)
      );
      this._overviewShowingID = Main.overview.connect(
        "showing",
        this._onWindowChanged.bind(this)
      );
      this._onWindowChangedID = global.display.connect(
        "notify::focus-window",
        this._onWindowChanged.bind(this)
      );
    }

    get _state() {
      const labels = InputSourceIndicator._indicatorLabels;
      return ASCIIMODES.includes(
        labels[InputSourceManager.currentSource.index].get_text()
      );
    }

    get _toggle() {
      let win = InputSourceManager._getCurrentWindow();
      if (!win) return false;

      let state = this._state;
      let stateConf = false;
      if (this._remember) {
        let store = this._states.get(this._tmpWindow);
        if (state != store) this._states.set(this._tmpWindow, state);

        this._tmpWindow = win.wm_class ? win.wm_class.toLowerCase() : "";
        if (!this._states.has(this._tmpWindow)) {
          let unknown =
            this.unknown == UNKNOWN.DEFAULT
              ? state
              : this.unknown == UNKNOWN.ON;
          this._states.set(this._tmpWindow, unknown);
        }
        stateConf = this._states.get(this._tmpWindow);
      } else {
        stateConf =
          this.unknown == UNKNOWN.DEFAULT ? state : this.unknown == UNKNOWN.ON;
      }

      return state ^ stateConf;
    }

    set remember(remember) {
      this._remember = remember;
    }

    _onWindowChanged() {
      if (this._toggle && IBusManager._panelService) {
        IBusManager.activateProperty(INPUTMODE, IBus.PropState.CHECKED);
      }
    }

    _bindSettings() {
      gsettings.bind(
        Fields.REMEMBERINPUT,
        this,
        "remember",
        Gio.SettingsBindFlags.GET
      );
      gsettings.bind(
        Fields.UNKNOWNSTATE,
        this,
        "unknown",
        Gio.SettingsBindFlags.GET
      );
      this._states = new Map(
        Object.entries(gsettings.get_value(Fields.INPUTLIST).deep_unpack())
      );
    }

    destroy() {
      gsettings.set_value(
        Fields.INPUTLIST,
        new GLib.Variant("a{sb}", Object.fromEntries(this._states))
      );
      if (this._onWindowChangedID)
        global.display.disconnect(this._onWindowChangedID),
          (this._onWindowChangedID = 0);
      if (this._overviewShowingID)
        Main.overview.disconnect(this._overviewShowingID),
          (this._overviewShowingID = 0);
      if (this._overviewHiddenID)
        Main.overview.disconnect(this._overviewHiddenID),
          (this._overviewHiddenID = 0);
    }
  }
);

const IBusFontSetting = GObject.registerClass(
  {
    Properties: {
      fontname: GObject.param_spec_string(
        "fontname",
        "fontname",
        "font name",
        "Sans 16",
        GObject.ParamFlags.WRITABLE
      ),
    },
  },
  class IBusFontSetting extends GObject.Object {
    _init() {
      super._init();
      gsettings.bind(
        Fields.CUSTOMFONT,
        this,
        "fontname",
        Gio.SettingsBindFlags.GET
      );
    }

    set fontname(fontname) {
      let offset = 3; // the fonts-size difference between index and candidate
      let desc = Pango.FontDescription.from_string(fontname);
      let get_weight = () => {
        try {
          return desc.get_weight();
        } catch (e) {
          return parseInt(e.message);
        }
      }; // hack for Pango.Weight enumeration exception (eg: 290) in some fonts
      CandidatePopup.set_style(
        'font-weight: %d; font-family: "%s"; font-size: %dpt; font-style: %s;'.format(
          get_weight(),
          desc.get_family(),
          desc.get_size() / Pango.SCALE - offset,
          Object.keys(Pango.Style)[desc.get_style()].toLowerCase()
        )
      );
      CandidateArea._candidateBoxes.forEach((x) => {
        x._candidateLabel.set_style(
          "font-size: %dpt;".format(desc.get_size() / Pango.SCALE)
        );
        x._indexLabel.set_style("padding: %dpx 4px 0 0;".format(offset * 2));
      });
    }

    destroy() {
      CandidatePopup.set_style("");
      CandidateArea._candidateBoxes.forEach((x) => {
        x._candidateLabel.set_style("");
        x._indexLabel.set_style("");
      });
    }
  }
);

const IBusBGSetting = GObject.registerClass(
  {
    Properties: {
      background: GObject.param_spec_string(
        "bg",
        "bg",
        "background",
        "",
        GObject.ParamFlags.WRITABLE
      ),
      backgroundDark: GObject.param_spec_string(
        "bgdark",
        "bgdark",
        "backgroundDark",
        "",
        GObject.ParamFlags.WRITABLE
      ),
      night: GObject.ParamSpec.boolean(
        "night",
        "night",
        "night",
        GObject.ParamFlags.READWRITE,
        false
      ),
      backgroundMode: GObject.param_spec_uint(
        "bgmode",
        "bgmode",
        "backgroundMode",
        0,
        2,
        2,
        GObject.ParamFlags.WRITABLE
      ),
      backgroundDarkMode: GObject.param_spec_uint(
        "bgdarkmode",
        "bgdarkmode",
        "backgroundDarkMode",
        0,
        2,
        2,
        GObject.ParamFlags.WRITABLE
      ),
      backgroundRepeatMode: GObject.param_spec_uint(
        "bgrepeatmode",
        "bgrepeatmode",
        "backgroundRepeatMode",
        0,
        3,
        3,
        GObject.ParamFlags.WRITABLE
      ),
      backgroundDarkRepeatMode: GObject.param_spec_uint(
        "bgdarkrepeatmode",
        "bgdarkrepeatmode",
        "backgroundDarkRepeatMode",
        0,
        3,
        3,
        GObject.ParamFlags.WRITABLE
      ),
    },
  },
  class IBusBGSetting extends GObject.Object {
    _init() {
      super._init();
      ngsettings.bind(System.LIGHT, this, "night", Gio.SettingsBindFlags.GET);
      gsettings.bind(Fields.CUSTOMBG, this, "bg", Gio.SettingsBindFlags.GET);
      gsettings.bind(
        Fields.CUSTOMBGDARK,
        this,
        "bgdark",
        Gio.SettingsBindFlags.GET
      );
      gsettings.bind(Fields.BGMODE, this, "bgmode", Gio.SettingsBindFlags.GET);
      gsettings.bind(
        Fields.BGDARKMODE,
        this,
        "bgdarkmode",
        Gio.SettingsBindFlags.GET
      );
      gsettings.bind(
        Fields.BGREPEATMODE,
        this,
        "bgrepeatmode",
        Gio.SettingsBindFlags.GET
      );
      gsettings.bind(
        Fields.BGDARKREPEATMODE,
        this,
        "bgdarkrepeatmode",
        Gio.SettingsBindFlags.GET
      );
      this._candidateBox = CandidatePopup.bin.get_children();
      if (this._candidateBox) this._candidateBox = this._candidateBox[0];
      this._buildWidgets();
    }

    _buildWidgets() {
      this._proxy = new ColorProxy(
        Gio.DBus.session,
        System.BUS_NAME,
        System.OBJECT_PATH,
        (proxy, error) => {
          if (!error) {
            this._onProxyChanged();
            this._proxy.connect(
              System.PROPERTY,
              this._onProxyChanged.bind(this)
            );
          }
        }
      );
    }

    _onProxyChanged() {
      this._light = this._proxy.NightLightActive;
      this._changeBG();
    }

    set night(night) {
      this._night = night;
      this._changeBG();
    }

    set bg(bg) {
      this._background = bg;
      this._changeBG();
    }

    set bgdark(bgdark) {
      this._backgroundDark = bgdark;
      this._changeBG();
    }

    set bgmode(bgmode) {
      this._backgroundMode = BGMODESACTIONS[BGMODES[bgmode]];
      this._changeBG();
    }

    set bgdarkmode(bgdarkmode) {
      this._backgroundDarkMode = BGMODESACTIONS[BGMODES[bgdarkmode]];
      this._changeBG();
    }

    set bgrepeatmode(bgrepeatmode) {
      this._backgroundRepeatMode = BGREPEATMODES[bgrepeatmode];
      this._changeBG();
    }

    set bgdarkrepeatmode(bgdarkrepeatmode) {
      this._backgroundDarkRepeatMode = BGREPEATMODES[bgdarkrepeatmode];
      this._changeBG();
    }

    // Load background
    _changeBG(toEnable = true) {
      this._atNight = this._night && this._light;
      let enabled = gsettings.get_boolean(Fields.USECUSTOMBG);
      let enabledNight = gsettings.get_boolean(Fields.USECUSTOMBGDARK);

      if (
        this._background &&
        enabled &&
        toEnable &&
        (!this._atNight || !enabledNight)
      ) {
        if (Gio.File.new_for_path(this._background).query_exists(null)) {
          this._bgPic = this._background;
          this._bgMode = this._backgroundMode;
          this._bgRepeatMode = this._backgroundRepeatMode;
        } else this._bgPic = "";
      } else if (
        this._backgroundDark &&
        enabledNight &&
        toEnable &&
        (this._atNight || !enabled)
      ) {
        if (Gio.File.new_for_path(this._backgroundDark).query_exists(null)) {
          this._bgPic = this._backgroundDark;
          this._bgMode = this._backgroundDarkMode;
          this._bgRepeatMode = this._backgroundDarkRepeatMode;
        } else this._bgPic = "";
      } else {
        this._bgPic = "";
      }
      if (this._candidateBox) {
        if (this._bgPic) {
          global.log(_("loading background for IBus:") + this._bgPic);
          this._candidateBox.set_style(
            'background: url("%s"); background-repeat: %s; background-size: %s;'.format(
              this._bgPic,
              this._bgRepeatMode,
              this._bgMode
            )
          );
          this._candidateBox.add_style_class_name("candidate-box");
        } else {
          global.log(_("remove custom background for IBus"));
          this._candidateBox.set_style("");
          this._candidateBox.remove_style_class_name("candidate-box");
        }
      }
    }

    destroy() {
      this._changeBG(false);
      if (this._candidateBox) delete this._candidateBox;
      delete this._proxy;
    }
  }
);

const IBusOrientation = GObject.registerClass(
  {
    Properties: {
      orientation: GObject.param_spec_uint(
        "orientation",
        "orientation",
        "orientation",
        0,
        1,
        1,
        GObject.ParamFlags.WRITABLE
      ),
    },
  },
  class IBusOrientation extends GObject.Object {
    _init() {
      super._init();
      this._originalSetOrientation = CandidateArea.setOrientation.bind(
        CandidateArea
      );
      CandidateArea.setOrientation = () => {};
      gsettings.bind(
        Fields.ORIENTATION,
        this,
        "orientation",
        Gio.SettingsBindFlags.GET
      );
    }

    set orientation(orientation) {
      this._originalSetOrientation(
        orientation ? IBus.Orientation.HORIZONTAL : IBus.Orientation.VERTICAL
      );
    }

    destroy() {
      CandidateArea.setOrientation = this._originalSetOrientation;
    }
  }
);

const IBusAnimation = GObject.registerClass(
  {
    Properties: {
      animation: GObject.param_spec_uint(
        "animation",
        "animation",
        "animation",
        0,
        3,
        3,
        GObject.ParamFlags.WRITABLE
      ),
    },
  },
  class IBusAnimation extends GObject.Object {
    _init() {
      super._init();
      this._openOrig = IBusManager._candidatePopup.open;
      gsettings.bind(
        Fields.CANDANIMATION,
        this,
        "animation",
        Gio.SettingsBindFlags.GET
      );
    }

    set animation(animation) {
      const openOrig = this._openOrig;
      if (INDICATORANI[animation] === "NONE") this.destroy();
      else if (INDICATORANI[animation] === "FADE")
        IBusManager._candidatePopup.open = () => {
          openOrig.call(
            IBusManager._candidatePopup,
            BoxPointer.PopupAnimation.FADE
          );
        };
      else if (INDICATORANI[animation] === "SLIDE")
        IBusManager._candidatePopup.open = () => {
          openOrig.call(
            IBusManager._candidatePopup,
            BoxPointer.PopupAnimation.SLIDE
          );
        };
      else if (INDICATORANI[animation] === "FULL")
        IBusManager._candidatePopup.open = () => {
          openOrig.call(
            IBusManager._candidatePopup,
            BoxPointer.PopupAnimation.FULL
          );
        };
    }

    destroy() {
      const openOrig = this._openOrig;
      IBusManager._candidatePopup.open = () => {
        openOrig.call(
          IBusManager._candidatePopup,
          BoxPointer.PopupAnimation.NONE
        );
      };
    }
  }
);

const IBusThemeManager = GObject.registerClass(
  {
    Properties: {
      theme: GObject.param_spec_string(
        "theme",
        "theme",
        "theme",
        "",
        GObject.ParamFlags.WRITABLE
      ),
      themeDark: GObject.param_spec_string(
        "themedark",
        "themedark",
        "themeDark",
        "",
        GObject.ParamFlags.WRITABLE
      ),
      night: GObject.ParamSpec.boolean(
        "night",
        "night",
        "night",
        GObject.ParamFlags.READWRITE,
        false
      ),
    },
  },
  class IBusThemeManager extends GObject.Object {
    _init() {
      super._init();
      this._prevCssStylesheet = null;
      this._atNight = false;
      ngsettings.bind(System.LIGHT, this, "night", Gio.SettingsBindFlags.GET);
      gsettings.bind(
        Fields.CUSTOMTHEME,
        this,
        "theme",
        Gio.SettingsBindFlags.GET
      );
      gsettings.bind(
        Fields.CUSTOMTHEMENIGHT,
        this,
        "themedark",
        Gio.SettingsBindFlags.GET
      );
      this._buildWidgets();
    }

    _buildWidgets() {
      this._proxy = new ColorProxy(
        Gio.DBus.session,
        System.BUS_NAME,
        System.OBJECT_PATH,
        (proxy, error) => {
          if (!error) {
            this._onProxyChanged();
            this._proxy.connect(
              System.PROPERTY,
              this._onProxyChanged.bind(this)
            );
          }
        }
      );
    }

    _onProxyChanged() {
      this._light = this._proxy.NightLightActive;
      this._changeTheme();
    }

    set night(night) {
      this._night = night;
      this._changeTheme();
    }

    set theme(theme) {
      this._stylesheet = theme;
      this._changeTheme();
    }

    set themedark(themedark) {
      this._stylesheetNight = themedark;
      this._changeTheme();
    }

    destroy() {
      this._changeTheme(false);
      delete this._proxy;
    }

    _changeThemeDark(toEnable = true) {
      this._changeTheme(toEnable);
    }

    // Load stylesheet
    _changeTheme(toEnable = true) {
      this._atNight = this._night && this._light;
      let enabled = gsettings.get_boolean(Fields.ENABLECUSTOMTHEME);
      let enabledNight = gsettings.get_boolean(Fields.ENABLECUSTOMTHEMENIGHT);

      let themeContext = St.ThemeContext.get_for_stage(global.stage);
      let theme = themeContext.get_theme();
      if (this._prevCssStylesheet)
        theme.unload_stylesheet(Gio.File.new_for_path(this._prevCssStylesheet));
      if (
        this._stylesheet &&
        enabled &&
        toEnable &&
        (!this._atNight || !enabledNight)
      ) {
        global.log(_("loading light user theme for IBus:") + this._stylesheet);
        theme.load_stylesheet(Gio.File.new_for_path(this._stylesheet));
        this._prevCssStylesheet = this._stylesheet;
      } else if (
        this._stylesheetNight &&
        enabledNight &&
        toEnable &&
        (this._atNight || !enabled)
      ) {
        global.log(
          _("loading dark user theme for IBus:") + this._stylesheetNight
        );
        theme.load_stylesheet(Gio.File.new_for_path(this._stylesheetNight));
        this._prevCssStylesheet = this._stylesheetNight;
      } else {
        global.log(_("loading default theme for IBus"));
        this._prevCssStylesheet = "";
      }
    }
  }
);

const Extensions = GObject.registerClass(
  {
    Properties: {
      font: GObject.param_spec_boolean(
        "font",
        "font",
        "font",
        false,
        GObject.ParamFlags.WRITABLE
      ),
      bg: GObject.param_spec_boolean(
        "bg",
        "bg",
        "bg",
        false,
        GObject.ParamFlags.WRITABLE
      ),
      bgdark: GObject.param_spec_boolean(
        "bgdark",
        "bgdark",
        "bgdark",
        false,
        GObject.ParamFlags.WRITABLE
      ),
      input: GObject.param_spec_boolean(
        "input",
        "input",
        "input",
        false,
        GObject.ParamFlags.WRITABLE
      ),
      orien: GObject.param_spec_boolean(
        "orien",
        "orien",
        "orien",
        false,
        GObject.ParamFlags.WRITABLE
      ),
      theme: GObject.param_spec_boolean(
        "theme",
        "theme",
        "theme",
        false,
        GObject.ParamFlags.WRITABLE
      ),
      themenight: GObject.param_spec_boolean(
        "themenight",
        "themenight",
        "themenight",
        false,
        GObject.ParamFlags.WRITABLE
      ),
      menuibusemoji: GObject.param_spec_boolean(
        "menuibusemoji",
        "menuibusemoji",
        "menuibusemoji",
        false,
        GObject.ParamFlags.WRITABLE
      ),
      menuextpref: GObject.param_spec_boolean(
        "menuextpref",
        "menuextpref",
        "menuextpref",
        false,
        GObject.ParamFlags.WRITABLE
      ),
      menuibuspref: GObject.param_spec_boolean(
        "menuibuspref",
        "menuibuspref",
        "menuibuspref",
        false,
        GObject.ParamFlags.WRITABLE
      ),
      menuibusver: GObject.param_spec_boolean(
        "menuibusver",
        "menuibusver",
        "menuibusver",
        false,
        GObject.ParamFlags.WRITABLE
      ),
      menuibusrest: GObject.param_spec_boolean(
        "menuibusrest",
        "menuibusrest",
        "menuibusrest",
        false,
        GObject.ParamFlags.WRITABLE
      ),
      menuibusexit: GObject.param_spec_boolean(
        "menuibusexit",
        "menuibusexit",
        "menuibusexit",
        false,
        GObject.ParamFlags.WRITABLE
      ),
      ibusresttime: GObject.param_spec_string(
        "ibusresttime",
        "ibusresttime",
        "ibusresttime",
        "",
        GObject.ParamFlags.WRITABLE
      ),
      useinputind: GObject.param_spec_boolean(
        "useinputind",
        "useinputind",
        "useinputind",
        false,
        GObject.ParamFlags.WRITABLE
      ),
      useanimation: GObject.param_spec_boolean(
        "animation",
        "animation",
        "animation",
        false,
        GObject.ParamFlags.WRITABLE
      ),
    },
  },
  class Extensions extends GObject.Object {
    _init() {
      super._init();
      this._bindSettings();
    }

    _bindSettings() {
      gsettings.bind(
        Fields.AUTOSWITCH,
        this,
        "input",
        Gio.SettingsBindFlags.GET
      );
      gsettings.bind(
        Fields.USECUSTOMFONT,
        this,
        "font",
        Gio.SettingsBindFlags.GET
      );
      gsettings.bind(Fields.USECUSTOMBG, this, "bg", Gio.SettingsBindFlags.GET);
      gsettings.bind(
        Fields.USECUSTOMBGDARK,
        this,
        "bgdark",
        Gio.SettingsBindFlags.GET
      );
      gsettings.bind(
        Fields.ENABLEORIEN,
        this,
        "orien",
        Gio.SettingsBindFlags.GET
      );
      gsettings.bind(
        Fields.ENABLECUSTOMTHEME,
        this,
        "theme",
        Gio.SettingsBindFlags.GET
      );
      gsettings.bind(
        Fields.ENABLECUSTOMTHEMENIGHT,
        this,
        "themenight",
        Gio.SettingsBindFlags.GET
      );
      gsettings.bind(
        Fields.MENUIBUSEMOJI,
        this,
        "menuibusemoji",
        Gio.SettingsBindFlags.GET
      );
      gsettings.bind(
        Fields.MENUEXTPREF,
        this,
        "menuextpref",
        Gio.SettingsBindFlags.GET
      );
      gsettings.bind(
        Fields.MENUIBUSPREF,
        this,
        "menuibuspref",
        Gio.SettingsBindFlags.GET
      );
      gsettings.bind(
        Fields.MENUIBUSVER,
        this,
        "menuibusver",
        Gio.SettingsBindFlags.GET
      );
      gsettings.bind(
        Fields.MENUIBUSREST,
        this,
        "menuibusrest",
        Gio.SettingsBindFlags.GET
      );
      gsettings.bind(
        Fields.MENUIBUSEXIT,
        this,
        "menuibusexit",
        Gio.SettingsBindFlags.GET
      );
      gsettings.bind(
        Fields.IBUSRESTTIME,
        this,
        "ibusresttime",
        Gio.SettingsBindFlags.GET
      );
      gsettings.bind(
        Fields.USEINPUTIND,
        this,
        "useinputind",
        Gio.SettingsBindFlags.GET
      );
      gsettings.bind(
        Fields.USECANDANIM,
        this,
        "animation",
        Gio.SettingsBindFlags.GET
      );
    }

    set input(input) {
      if (input) {
        if (this._input) return;
        this._input = new IBusAutoSwitch();
      } else {
        if (!this._input) return;
        this._input.destroy();
        delete this._input;
      }
    }

    set font(font) {
      if (font) {
        if (this._font) return;
        this._font = new IBusFontSetting();
      } else {
        if (!this._font) return;
        this._font.destroy();
        delete this._font;
      }
    }

    set bg(bg) {
      this._bgLight = bg;
      if (bg) {
        if (this._bg) this._bg._changeBG();
        else this._bg = new IBusBGSetting();
      } else {
        if (!this._bg) return;
        if (!this._bgDark && !this._bgLight) {
          this._bg.destroy();
          delete this._bg;
        } else {
          this._bg._changeBG();
        }
      }
    }

    set bgdark(bg) {
      this._bgDark = bg;
      if (bg) {
        if (this._bg) this._bg._changeBG();
        else this._bg = new IBusBGSetting();
      } else {
        if (!this._bg) return;
        if (!this._bgDark && !this._bgLight) {
          this._bg.destroy();
          delete this._bg;
        } else {
          this._bg._changeBG();
        }
      }
    }

    set orien(orien) {
      if (orien) {
        if (this._orien) return;
        this._orien = new IBusOrientation();
      } else {
        if (!this._orien) return;
        this._orien.destroy();
        delete this._orien;
      }
    }

    set theme(theme) {
      this._themeLight = theme;
      if (theme) {
        if (this._theme) this._theme._changeTheme();
        else this._theme = new IBusThemeManager();
      } else {
        if (!this._theme) return;
        if (!this._themeDark && !this._themeLight) {
          this._theme.destroy();
          delete this._theme;
        } else {
          this._theme._changeTheme();
        }
      }
    }

    set themenight(theme) {
      this._themeDark = theme;
      if (theme) {
        if (this._theme) this._theme._changeTheme();
        else this._theme = new IBusThemeManager();
      } else {
        if (!this._theme) return;
        if (!this._themeDark && !this._themeLight) {
          this._theme.destroy();
          delete this._theme;
        } else {
          this._theme._changeTheme();
        }
      }
    }

    set useinputind(useinputind) {
      if (useinputind) {
        if (this._useinputind) return;
        this._useinputind = new IBusInputSourceIndicater();
      } else {
        if (!this._useinputind) return;
        this._useinputind.destroy();
        delete this._useinputind;
      }
    }

    set animation(animation) {
      if (animation) {
        if (this._animation) return;
        this._animation = new IBusAnimation();
      } else {
        if (!this._animation) return;
        this._animation.destroy();
        delete this._animation;
      }
    }

    set menuibusemoji(menuibusemoji) {
      if (menuibusemoji) {
        if (this._menuibusemoji) return;
        this._menuibusemoji = InputSourceIndicator.menu.addAction(
          _("Copy Emoji"),
          this._MenuIBusEmoji.bind(InputSourceIndicator)
        );
        this._menuibusemoji.visible = true;
      } else {
        if (!this._menuibusemoji) return;
        this._menuibusemoji.visible = false;
        delete this._menuibusemoji;
      }
    }

    set menuextpref(menuextpref) {
      if (menuextpref) {
        if (this._menuextpref) return;
        this._menuextpref = InputSourceIndicator.menu.addAction(
          _("Customize IBus"),
          this._MenuExtPref.bind(InputSourceIndicator)
        );
        this._menuextpref.visible = true;
      } else {
        if (!this._menuextpref) return;
        this._menuextpref.visible = false;
        delete this._menuextpref;
      }
    }

    set menuibuspref(menuibuspref) {
      if (menuibuspref) {
        if (this._menuibuspref) return;
        this._menuibuspref = InputSourceIndicator.menu.addAction(
          _("IBus Preferences"),
          this._menuIBusPref.bind(InputSourceIndicator)
        );
        this._menuibuspref.visible = true;
      } else {
        if (!this._menuibuspref) return;
        this._menuibuspref.visible = false;
        delete this._menuibuspref;
      }
    }

    set menuibusver(menuibusver) {
      if (menuibusver) {
        if (this._menuibusver) return;
        this._menuibusver = InputSourceIndicator.menu.addAction(
          _("IBus Version"),
          this._MenuIBusVer.bind(InputSourceIndicator)
        );
        this._menuibusver.visible = true;
      } else {
        if (!this._menuibusver) return;
        this._menuibusver.visible = false;
        delete this._menuibusver;
      }
    }

    set menuibusrest(menuibusrest) {
      if (menuibusrest) {
        if (this._menuibusrest) return;
        this._menuibusrest = InputSourceIndicator.menu.addAction(
          _("Restart"),
          this._MenuIBusRest.bind(InputSourceIndicator)
        );
        this._menuibusrest.visible = true;
      } else {
        if (!this._menuibusrest) return;
        this._menuibusrest.visible = false;
        delete this._menuibusrest;
      }
    }

    set menuibusexit(menuibusexit) {
      if (menuibusexit) {
        if (this._menuibusexit) return;
        this._menuibusexit = InputSourceIndicator.menu.addAction(
          _("Quit"),
          this._MenuIBusExit.bind(InputSourceIndicator)
        );
        this._menuibusexit.visible = true;
      } else {
        if (!this._menuibusexit) return;
        this._menuibusexit.visible = false;
        delete this._menuibusexit;
      }
    }

    set ibusresttime(ibusresttime) {
      if (this._not_extension_first_start) {
        Util.spawnCommandLine("pkill ibus-daemon");
        Util.spawnCommandLine("ibus-daemon -dx");
        Util.spawn([
          "notify-send",
          _("Successfully triggered a restart for IBus"),
          new Date(parseInt(ibusresttime)).toString(),
        ]);
      }
      this._not_extension_first_start = true;
    }

    _MenuIBusEmoji() {
      Main.overview.hide();
      Util.spawn(["ibus", "emoji"]);
    }

    _MenuExtPref() {
      Main.overview.hide();
      ExtensionUtils.openPrefs(Me.metadata.uuid.toString());
    }

    _menuIBusPref() {
      Main.overview.hide();
      Util.spawn(["ibus-setup"]);
    }

    _MenuIBusVer() {
      Main.overview.hide();
      Util.spawn([
        "notify-send",
        _("IBus Version"),
        IBus.MAJOR_VERSION +
          "." +
          IBus.MINOR_VERSION +
          "." +
          IBus.MICRO_VERSION,
      ]);
    }

    _MenuIBusRest() {
      Main.overview.hide();
      Util.spawn(["ibus", "restart"]);
    }

    _MenuIBusExit() {
      Main.overview.hide();
      Util.spawn(["ibus", "exit"]);
    }
    destroy() {
      this.bg = false;
      this.bgdark = false;
      this.font = false;
      this.input = false;
      this.orien = false;
      this.theme = false;
      this.themenight = false;
      this.useinputind = false;
      this.animation = false;
      this.menuibusemoji = false;
      this.menuextpref = false;
      this.menuibuspref = false;
      this.menuibusver = false;
      this.menuibusrest = false;
      this.menuibusexit = false;
      this._not_extension_first_start = false;
    }
  }
);

const Extension = class Extension {
  constructor() {
    ExtensionUtils.initTranslations();
  }

  enable() {
    this._ext = new Extensions();
  }

  disable() {
    this._ext.destroy();
    delete this._ext;
  }
};

function init() {
  return new Extension();
}
