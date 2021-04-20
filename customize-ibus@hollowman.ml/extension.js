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

const ByteArray = imports.byteArray;

const Keyboard = imports.ui.status.keyboard;
const InputSourceManager = Keyboard.getInputSourceManager();
const IBusManager = imports.misc.ibusManager.getIBusManager();
const CandidatePopup = IBusManager._candidatePopup;
const CandidateArea = CandidatePopup._candidateArea;

const ExtensionUtils = imports.misc.extensionUtils;
const gsettings = ExtensionUtils.getSettings();
const Me = ExtensionUtils.getCurrentExtension();
const _ = imports.gettext.domain(Me.metadata["gettext-domain"]).gettext;
const Fields = Me.imports.prefs.Fields;
const UNKNOWN = { ON: 0, OFF: 1, DEFAULT: 2 };
const ASCIIMODES = ["en", "A", "英"];
const INPUTMODE = "InputMode";
const uuid = "customize-ibus@hollowman.ml";

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
      const labels = Main.panel.statusArea.keyboard._indicatorLabels;
      return ASCIIMODES.includes(
        labels[InputSourceManager.currentSource.index].get_text()
      );
    }

    get _toggle() {
      let win = InputSourceManager._getCurrentWindow();
      if (!win) return false;

      let state = this._state;
      let store = this._states.get(this._tmpWindow);
      if (state != store) this._states.set(this._tmpWindow, state);

      this._tmpWindow = win.wm_class ? win.wm_class.toLowerCase() : "";
      if (!this._states.has(this._tmpWindow)) {
        let unknown =
          this.unknown == UNKNOWN.DEFAULT ? state : this.unknown == UNKNOWN.ON;
        this._states.set(this._tmpWindow, unknown);
      }

      return state ^ this._states.get(this._tmpWindow);
    }

    _onWindowChanged() {
      if (this._toggle && IBusManager._panelService) {
        IBusManager.activateProperty(INPUTMODE, IBus.PropState.CHECKED);
      }
    }

    _bindSettings() {
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
    },
  },
  class IBusBGSetting extends GObject.Object {
    _init() {
      super._init();
      gsettings.bind(Fields.CUSTOMBG, this, "bg", Gio.SettingsBindFlags.GET);
    }

    set bg(bg) {
      global.log(_("loading background for IBus:") + bg);
      let candidateBox = CandidatePopup.bin.get_children();
      if (candidateBox) {
        candidateBox[0].set_style(
          'background: url("%s"); background-repeat:no-repeat; background-size:cover;'.format(
            bg
          )
        );
        candidateBox[0].add_style_class_name("candidate-box");
      }
    }

    destroy() {
      let candidateBox = CandidatePopup.bin.get_children();
      if (candidateBox) {
        candidateBox[0].set_style("");
        candidateBox[0].remove_style_class_name("candidate-box");
      }
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

const IBusThemeManager = GObject.registerClass(
  {
    Properties: {},
  },
  class IBusThemeManager extends GObject.Object {
    _init() {
      super._init();
      this._prevCssStylesheet = null;
      this.enable();
    }

    enable() {
      this._changedId = gsettings.connect(
        `changed::${Fields.CUSTOMTHEME}`,
        this._changeTheme.bind(this)
      );
      this._changeTheme();
    }

    disable() {
      if (this._changedId) {
        gsettings.disconnect(this._changedId);
        this._changedId = 0;
      }
      this._changeTheme();
    }

    // Load stylesheet
    _changeTheme() {
      let stylesheet = gsettings.get_string(Fields.CUSTOMTHEME);
      let enabled = gsettings.get_boolean(Fields.ENABLECUSTOMTHEME);

      let themeContext = St.ThemeContext.get_for_stage(global.stage);
      let theme = themeContext.get_theme();
      if (this._prevCssStylesheet)
        theme.unload_stylesheet(Gio.File.new_for_path(this._prevCssStylesheet));
      if (stylesheet && enabled) {
        global.log(_("loading user theme for IBus:") + stylesheet);
        theme.load_stylesheet(Gio.File.new_for_path(stylesheet));
        this._prevCssStylesheet = stylesheet;
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
      )
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
      if (bg) {
        if (this._bg) return;
        this._bg = new IBusBGSetting();
      } else {
        if (!this._bg) return;
        this._bg.destroy();
        delete this._bg;
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
      if (theme) {
        if (this._theme) return;
        this._theme = new IBusThemeManager();
      } else {
        if (!this._theme) return;
        this._theme.disable();
        delete this._theme;
      }
    }

    destroy() {
      this.bg = false;
      this.font = false;
      this.input = false;
      this.orien = false;
      this.theme = false;
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
