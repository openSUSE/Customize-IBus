// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-
// vim:fdm=syntax
// by:hollowman6@github tuberry@github

"use strict";

const { Gio, Gtk, GObject, GLib, IBus, GdkPixbuf } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const gsettings = ExtensionUtils.getSettings();
const Fields = Me.imports.fields.Fields;
const Config = imports.misc.config;
const _ = imports.gettext.domain(Me.metadata["gettext-domain"]).gettext;

const ShellVersion = parseFloat(Config.PACKAGE_VERSION);
const SessionType =
  GLib.getenv("XDG_SESSION_TYPE") == "wayland" ? "Wayland" : "Xorg";
const SCHEMA_PATH = "/org/gnome/shell/extensions/customize-ibus/";

const BoxSettings = {
  margin_start: 10,
  margin_end: 10,
  margin_top: 10,
  margin_bottom: 10,
};

function buildPrefsWidget() {
  return new CustomizeIBus();
}

function init() {
  ExtensionUtils.initTranslations();
}

function mergeObjects(main, bck) {
  for (var prop in bck) {
    if (!main.hasOwnProperty(prop) && bck.hasOwnProperty(prop)) {
      main[prop] = bck[prop];
    }
  }

  return main;
}

const CustomizeIBus = GObject.registerClass(
  class CustomizeIBus extends Gtk.ScrolledWindow {
    _init() {
      super._init({
        height_request: 600,
        hscrollbar_policy: Gtk.PolicyType.NEVER,
      });

      this._bulidWidget();
      this._bulidUI();
      this._bindValues();
      this._syncStatus();
      this._buildHeaderBar();
      if (ShellVersion < 40) this.show_all();
    }

    _bulidWidget() {
      this.ibus_settings = new Gio.Settings({
        schema_id: "org.freedesktop.ibus.panel",
      });

      this._field_enable_custom_theme = this._checkMaker(
        _("Custom IME light theme")
      );
      this._field_enable_custom_theme_dark = this._checkMaker(
        _("Custom IME dark theme")
      );
      this._field_use_custom_font = this._checkMaker(_("Use custom font"));
      this._field_use_custom_bg = this._checkMaker(
        _("Use custom light background")
      );
      this._field_use_custom_bg_dark = this._checkMaker(
        _("Use custom dark background")
      );
      this._field_use_candidate_scroll = this._checkMaker(
        _("Candidates scroll")
      );
      this._field_enable_ASCII = this._checkMaker(_("Auto switch ASCII mode"));
      this._field_enable_orien = this._checkMaker(_("Candidates orientation"));
      this._field_use_candidate_animation = this._checkMaker(
        _("Candidates popup animation")
      );
      this._field_use_candidate_still = this._checkMaker(
        _("Fix candidate box")
      );

      this._field_use_tray_source_switch_key = this._checkMaker(
        _("Directly switch source with click")
      );

      this._field_use_candidate_right_click = this._checkMaker(
        _("Candidate box right click")
      );

      this._field_indicator_use_custom_font = this._checkMaker(
        _("Use custom font")
      );

      let adjustment = this._createAdjustment(Fields.CANDOPACITY, 1);
      this._field_use_candidate_opacity = this._checkMaker(
        _("Candidate box opacity")
      );
      this._field_candidate_opacity = new Gtk.Scale({
        adjustment,
        digits: 0,
        draw_value: true,
        hexpand: true,
      });

      this._restart_ibus = new Gtk.Button({
        label: _("Start / Restart IBus"),
        hexpand: true,
        halign: Gtk.Align.CENTER,
      });

      this._reset_extension = new Gtk.Button({
        label: _("Restore Default Settings"),
        hexpand: true,
        halign: Gtk.Align.CENTER,
      });

      this._export_settings = new Gtk.Button({
        label: _("Export Current Settings"),
        hexpand: true,
        halign: Gtk.Align.CENTER,
      });

      this._import_settings = new Gtk.Button({
        label: _("Import Settings from File"),
        hexpand: true,
        halign: Gtk.Align.CENTER,
      });

      this._field_orientation = this._comboMaker([
        _("Vertical"),
        _("Horizontal"),
      ]);

      this._field_candidate_remember_position = this._comboMaker([
        _("Don't Remember Position"),
        _("Remember Last Position"),
      ]);

      this._field_remember_input = this._comboMaker([
        _("Don't Remember State"),
        _("Remember Input State"),
      ]);

      this._field_candidate_scroll_mode = this._comboMaker([
        _("Change Page"),
        _("Change Candidate"),
      ]);

      this._field_unkown_state = this._comboMaker([
        _("On"),
        _("Off"),
        _("Keep"),
      ]);

      this._field_tray_source_switch_key = this._comboMaker([
        _("Left"),
        _("Right"),
      ]);

      this._field_indicator_left_click = this._comboMaker([
        _("Drag to Move"),
        _("Switch Source"),
      ]);

      this._field_candidate_right_click = this._comboMaker([
        _("Open Menu"),
        _("Switch Source"),
      ]);

      this._field_candidate_still_position = this._comboMaker([
        _("Center"),
        _("Center-Left"),
        _("Top-Left"),
        _("Top-Center"),
        _("Top-Right"),
        _("Center-Right"),
        _("Bottom-Right"),
        _("Bottom-Center"),
        _("Bottom-Left"),
      ]);

      this._field_bg_mode = this._comboMaker([
        _("Centered"),
        _("Full"),
        _("Zoom"),
      ]);

      this._field_bg_dark_mode = this._comboMaker([
        _("Centered"),
        _("Full"),
        _("Zoom"),
      ]);

      this._field_bg_repeat_mode = this._comboMaker([
        _("No repeat"),
        _("Repeat"),
      ]);

      this._field_bg_dark_repeat_mode = this._comboMaker([
        _("No repeat"),
        _("Repeat"),
      ]);

      this._field_indicator_animation = this._comboMaker([
        _("None"),
        _("Slide"),
        _("Fade"),
        _("All"),
      ]);

      this._field_candidate_animation = this._comboMaker([
        _("None"),
        _("Slide"),
        _("Fade"),
        _("All"),
      ]);

      this._ibus_version = new Gtk.Label({
        use_markup: true,
        hexpand: true,
        halign: Gtk.Align.CENTER,
        label:
          "<b>" + _("IBus Version: ") + "</b>" + _("unknown (installed ?)"),
      });
      this._field_candidate_buttons = new Gtk.Switch();
      this._field_candidate_reposition = new Gtk.Switch();
      this._field_fix_ime_list = new Gtk.Switch();
      this._field_use_tray = new Gtk.Switch();
      this._field_ibus_emoji = new Gtk.Switch();
      this._field_extension_entry = new Gtk.Switch();
      this._field_ibus_preference = new Gtk.Switch();
      this._field_ibus_version = new Gtk.Switch();
      this._field_ibus_restart = new Gtk.Switch();
      this._field_ibus_exit = new Gtk.Switch();
      this._field_use_indicator = new Gtk.Switch();
      this._field_indicator_only_toggle = new Gtk.Switch();
      this._field_indicator_only_in_ASCII = new Gtk.Switch();
      this._field_indicator_not_single_IME = new Gtk.Switch();
      this._field_indicator_right_close = new Gtk.Switch();
      this._field_indicator_scroll = new Gtk.Switch();

      this._field_indicator_enable_left_click = this._checkMaker(
        _("Enable indicator left click")
      );
      adjustment = this._createAdjustment(Fields.INDOPACITY, 1);
      this._field_indicator_use_opacity = this._checkMaker(
        _("Indicator opacity")
      );
      this._field_indicator_opacity = new Gtk.Scale({
        adjustment,
        digits: 0,
        draw_value: true,
        hexpand: true,
      });
      adjustment = this._createAdjustment(Fields.INPUTINDSHOW, 1);
      this._field_indicator_enable_show_delay = this._checkMaker(
        _("Enable indicator show delay (unit: seconds)")
      );
      this._field_indicator_show_time = new Gtk.Scale({
        adjustment,
        digits: 0,
        draw_value: true,
        hexpand: true,
      });
      adjustment = this._createAdjustment(Fields.INPUTINDHID, 1);
      this._field_indicator_enable_autohide = this._checkMaker(
        _("Enable indicator auto-hide timeout (unit: seconds)")
      );
      this._field_indicator_hide_time = new Gtk.Scale({
        adjustment,
        digits: 0,
        draw_value: true,
        hexpand: true,
      });

      this._field_open_system_settings = new Gtk.Button({
        label: _("GNOME Settings"),
        hexpand: true,
        halign: Gtk.Align.CENTER,
      });

      this._field_open_ibus_pref = new Gtk.Button({
        label: _("IBus Preferences"),
        hexpand: true,
        halign: Gtk.Align.CENTER,
      });

      if (ShellVersion < 40)
        this._field_custom_font = new Gtk.FontButton({
          font_name: gsettings.get_string(Fields.CUSTOMFONT),
        });
      else
        this._field_custom_font = new Gtk.FontButton({
          font: gsettings.get_string(Fields.CUSTOMFONT),
        });

      if (ShellVersion < 40)
        this._field_indicator_custom_font = new Gtk.FontButton({
          font_name: gsettings.get_string(Fields.INPUTINDCUSTOMFONT),
        });
      else
        this._field_indicator_custom_font = new Gtk.FontButton({
          font: gsettings.get_string(Fields.INPUTINDCUSTOMFONT),
        });

      const filter = new Gtk.FileFilter();
      filter.add_pixbuf_formats();

      this._fileChooser = new Gtk.FileChooserNative({
        title: _("Select an Image"),
        filter,
        modal: true,
      });
      this._logoPicker = new Gtk.Button({
        label: _("(None)"),
      });
      this._reset_logo_button = this._iconButtonMaker("", "edit-clear");
      this._reset_logo_button.visible = false;
      this._open_logo_button = this._iconLinkButtonMaker("", "document-open");
      this._open_logo_button.visible = false;

      this._fileDarkChooser = new Gtk.FileChooserNative({
        title: _("Select an Image"),
        filter,
        modal: true,
      });
      this._logoDarkPicker = new Gtk.Button({
        label: _("(None)"),
      });
      this._reset_logoDark_button = this._iconButtonMaker("", "edit-clear");
      this._reset_logoDark_button.visible = false;
      this._open_logoDark_button = this._iconLinkButtonMaker(
        "",
        "document-open"
      );
      this._open_logoDark_button.visible = false;

      const cssFilter = new Gtk.FileFilter();
      cssFilter.add_pattern("*.css");

      this._cssFileChooser = new Gtk.FileChooserNative({
        title: _("Select an IBus Stylesheet"),
        filter: cssFilter,
        modal: true,
      });
      this._cssPicker = new Gtk.Button({
        label: _("(None)"),
      });
      this._reset_css_button = this._iconButtonMaker("", "edit-clear");
      this._reset_css_button.visible = false;
      this._open_css_button = this._iconLinkButtonMaker("", "document-open");
      this._open_css_button.visible = false;

      this._cssDarkFileChooser = new Gtk.FileChooserNative({
        title: _("Select an IBus Stylesheet"),
        filter: cssFilter,
        modal: true,
      });
      this._cssDarkPicker = new Gtk.Button({
        label: _("(None)"),
      });
      this._reset_cssDark_button = this._iconButtonMaker("", "edit-clear");
      this._reset_cssDark_button.visible = false;
      this._open_cssDark_button = this._iconLinkButtonMaker(
        "",
        "document-open"
      );
      this._open_cssDark_button.visible = false;
    }

    _updateLogoPicker() {
      const filename = gsettings.get_string(Fields.CUSTOMBG);
      if (!GLib.basename(filename)) {
        this._logoPicker.label = _("(None)");
        this._open_logo_button.uri = "";
        this._open_logo_button.visible = false;
        this._reset_logo_button.visible = false;
      } else {
        this._logoPicker.label = GLib.basename(filename);
        this._open_logo_button.uri = "file://" + filename;
        this._open_logo_button.visible = true;
        this._reset_logo_button.visible = true;
      }
    }

    _updateLogoDarkPicker() {
      const filename = gsettings.get_string(Fields.CUSTOMBGDARK);
      if (!GLib.basename(filename)) {
        this._logoDarkPicker.label = _("(None)");
        this._open_logoDark_button.uri = "";
        this._open_logoDark_button.visible = false;
        this._reset_logoDark_button.visible = false;
      } else {
        this._logoDarkPicker.label = GLib.basename(filename);
        this._open_logoDark_button.uri = "file://" + filename;
        this._open_logoDark_button.visible = true;
        this._reset_logoDark_button.visible = true;
      }
    }

    _updateCssPicker() {
      const filename = gsettings.get_string(Fields.CUSTOMTHEME);
      if (!GLib.basename(filename)) {
        this._cssPicker.label = _("(None)");
        this._open_css_button.uri = "";
        this._open_css_button.visible = false;
        this._reset_css_button.visible = false;
      } else {
        this._cssPicker.label = GLib.basename(filename);
        this._open_css_button.uri = "file://" + filename;
        this._open_css_button.visible = true;
        this._reset_css_button.visible = true;
      }
    }

    _updateCssDarkPicker() {
      const filename = gsettings.get_string(Fields.CUSTOMTHEMENIGHT);
      if (!GLib.basename(filename)) {
        this._cssDarkPicker.label = _("(None)");
        this._open_cssDark_button.uri = "";
        this._open_cssDark_button.visible = false;
        this._reset_cssDark_button.visible = false;
      } else {
        this._cssDarkPicker.label = GLib.basename(filename);
        this._open_cssDark_button.uri = "file://" + filename;
        this._open_cssDark_button.visible = true;
        this._reset_cssDark_button.visible = true;
      }
    }

    _updateIBusVersion() {
      let IBusVersion = _("unknown (installed ?)");
      if (IBus.MAJOR_VERSION)
        IBusVersion =
          "v" +
          IBus.MAJOR_VERSION +
          "." +
          IBus.MINOR_VERSION +
          "." +
          IBus.MICRO_VERSION;
      this._ibus_version.label =
        "<b>" + _("IBus Version: ") + "</b>" + IBusVersion;
    }

    _bulidUI() {
      this._notebook = new Gtk.Notebook({
        enable_popup: true,
      });
      if (ShellVersion < 40) this.add(this._notebook);
      else this.set_child(this._notebook);

      this._ibus_basic = this._listFrameMaker(_("General"));
      this._ibus_basic._add(this._field_enable_orien, this._field_orientation);
      this._ibus_basic._add(
        this._field_use_candidate_animation,
        this._field_candidate_animation
      );
      this._ibus_basic._add(
        this._field_use_candidate_right_click,
        this._field_candidate_right_click
      );
      this._ibus_basic._add(
        this._field_use_candidate_scroll,
        this._field_candidate_scroll_mode
      );
      this._ibus_basic._add(
        this._field_use_candidate_still,
        this._field_candidate_remember_position,
        this._field_candidate_still_position
      );
      this._ibus_basic._add(
        this._field_use_custom_font,
        this._field_custom_font
      );
      this._ibus_basic._add(
        this._field_enable_ASCII,
        this._field_remember_input,
        this._field_unkown_state
      );
      if (ShellVersion < 40) {
        let hbox = new Gtk.Box(BoxSettings);
        hbox.pack_start(this._field_use_candidate_opacity, true, true, 4);
        hbox.pack_start(this._field_candidate_opacity, true, true, 4);
        this._ibus_basic.grid.attach(
          hbox,
          0,
          this._ibus_basic.grid._row++,
          1,
          1
        );
      } else {
        this._ibus_basic._add(
          this._field_use_candidate_opacity,
          this._field_candidate_opacity
        );
      }
      this._ibus_basic._add(
        this._switchLabelMaker(_("Fix IME list order")),
        this._field_fix_ime_list
      );
      this._ibus_basic._add(
        this._switchLabelMaker(_("Enable drag to reposition candidate box")),
        this._field_candidate_reposition
      );
      this._ibus_basic._add(
        this._switchLabelMaker(_("Candidate box page buttons")),
        this._field_candidate_buttons
      );
      this._basicHelpPage(this._ibus_basic);

      this._ibus_tray = this._listFrameMaker(_("Tray"));
      this._ibus_tray._add(this._ibus_version);
      this._ibus_tray._add(this._restart_ibus);
      this._ibus_tray._add(
        this._switchLabelMaker(_("Show IBus tray icon")),
        this._field_use_tray
      );
      this._ibus_tray._add(
        this._field_use_tray_source_switch_key,
        this._field_tray_source_switch_key
      );
      this._ibus_tray._add(
        new Gtk.Label({
          use_markup: true,
          hexpand: true,
          halign: Gtk.Align.CENTER,
          label: "<b>" + _("Add Additional Menu Entries") + "</b>",
        })
      );
      this._ibus_tray._add(
        this._switchLabelMaker(_("Copying Emoji")),
        this._field_ibus_emoji
      );
      this._ibus_tray._add(
        this._switchLabelMaker(_("This Extension's Preferences")),
        this._field_extension_entry
      );
      this._ibus_tray._add(
        this._switchLabelMaker(_("IBus Preferences")),
        this._field_ibus_preference
      );
      this._ibus_tray._add(
        this._switchLabelMaker(_("IBus Version")),
        this._field_ibus_version
      );
      this._ibus_tray._add(
        this._switchLabelMaker(_("Restarting IBus")),
        this._field_ibus_restart
      );
      this._ibus_tray._add(
        this._switchLabelMaker(_("Exiting IBus")),
        this._field_ibus_exit
      );
      this._trayHelpPage(this._ibus_tray);

      this._ibus_indicator = this._listFrameMaker(_("Indicator"));
      this._ibus_indicator._add(
        this._switchLabelMaker(_("Use input source indicator")),
        this._field_use_indicator
      );
      this._ibus_indicator._add(
        this._switchLabelMaker(_("Indicate only when switching input source")),
        this._field_indicator_only_toggle
      );
      this._ibus_indicator._add(
        this._switchLabelMaker(_("Indicate only when using ASCII mode")),
        this._field_indicator_only_in_ASCII
      );
      this._ibus_indicator._add(
        this._switchLabelMaker(_("Don't indicate when using single mode IME")),
        this._field_indicator_not_single_IME
      );
      this._ibus_indicator._add(
        this._switchLabelMaker(_("Enable right click to close indicator")),
        this._field_indicator_right_close
      );
      this._ibus_indicator._add(
        this._switchLabelMaker(_("Enable scroll to switch input source")),
        this._field_indicator_scroll
      );
      this._ibus_indicator._add(
        this._switchLabelMaker(_("Indicator popup animation")),
        this._field_indicator_animation
      );
      this._ibus_indicator._add(
        this._field_indicator_use_custom_font,
        this._field_indicator_custom_font
      );
      this._ibus_indicator._add(
        this._field_indicator_enable_left_click,
        this._field_indicator_left_click
      );
      if (ShellVersion < 40) {
        let hbox = new Gtk.Box(BoxSettings);
        hbox.pack_start(this._field_indicator_use_opacity, true, true, 4);
        hbox.pack_start(this._field_indicator_opacity, true, true, 4);
        this._ibus_indicator.grid.attach(
          hbox,
          0,
          this._ibus_indicator.grid._row++,
          1,
          1
        );
      } else
        this._ibus_indicator._add(
          this._field_indicator_use_opacity,
          this._field_indicator_opacity
        );
      if (ShellVersion < 40) {
        let hbox = new Gtk.Box(BoxSettings);
        hbox.pack_start(this._field_indicator_enable_show_delay, true, true, 4);
        hbox.pack_start(this._field_indicator_show_time, true, true, 4);
        this._ibus_indicator.grid.attach(
          hbox,
          0,
          this._ibus_indicator.grid._row++,
          1,
          1
        );
      } else
        this._ibus_indicator._add(
          this._field_indicator_enable_show_delay,
          this._field_indicator_show_time
        );
      if (ShellVersion < 40) {
        let hbox = new Gtk.Box(BoxSettings);
        hbox.pack_start(this._field_indicator_enable_autohide, true, true, 4);
        hbox.pack_start(this._field_indicator_hide_time, true, true, 4);
        this._ibus_indicator.grid.attach(
          hbox,
          0,
          this._ibus_indicator.grid._row++,
          1,
          1
        );
      } else
        this._ibus_indicator._add(
          this._field_indicator_enable_autohide,
          this._field_indicator_hide_time
        );
      this._indicatorHelpPage(this._ibus_indicator);

      this._ibus_theme = this._listFrameMaker(_("Theme"));
      this._ibus_theme._add(
        this._field_enable_custom_theme,
        this._cssPicker,
        this._reset_css_button,
        this._open_css_button
      );
      this._ibus_theme._add(
        this._field_enable_custom_theme_dark,
        this._cssDarkPicker,
        this._reset_cssDark_button,
        this._open_cssDark_button
      );
      this._themeHelpPage(this._ibus_theme);

      this._ibus_bg = this._listFrameMaker(_("Background"));
      this._ibus_bg._add(
        this._field_use_custom_bg,
        this._field_bg_mode,
        this._field_bg_repeat_mode,
        this._logoPicker,
        this._reset_logo_button,
        this._open_logo_button
      );
      this._ibus_bg._add(
        this._field_use_custom_bg_dark,
        this._field_bg_dark_mode,
        this._field_bg_dark_repeat_mode,
        this._logoDarkPicker,
        this._reset_logoDark_button,
        this._open_logoDark_button
      );
      this._bgHelpPage(this._ibus_bg);
      this._ibus_settings = this._listFrameMaker(_("Settings"));
      this._ibus_settings._add(
        new Gtk.Label({
          use_markup: true,
          hexpand: true,
          halign: Gtk.Align.CENTER,
          label: "<b>" + _("Settings for extension") + "</b>",
        })
      );
      this._ibus_settings._add(
        this._reset_extension,
        this._export_settings,
        this._import_settings
      );
      this._ibus_settings._add(
        new Gtk.Label({
          use_markup: true,
          hexpand: true,
          halign: Gtk.Align.CENTER,
          label:
            "<b>" + _("Other official IBus customization settings") + "</b>",
        })
      );
      this._ibus_settings._add(
        this._field_open_system_settings,
        this._field_open_ibus_pref
      );
      this._settingsHelpPage(this._ibus_settings);
      this._aboutPage();
    }

    _syncStatus() {
      this._field_enable_ASCII.connect("notify::active", (widget) => {
        this._field_remember_input.set_sensitive(widget.active);
        this._field_unkown_state.set_sensitive(widget.active);
      });
      this._field_enable_orien.connect("notify::active", (widget) => {
        this._field_orientation.set_sensitive(widget.active);
      });
      this._field_use_candidate_animation.connect(
        "notify::active",
        (widget) => {
          this._field_candidate_animation.set_sensitive(widget.active);
        }
      );
      this._field_use_candidate_scroll.connect("notify::active", (widget) => {
        this._field_candidate_scroll_mode.set_sensitive(widget.active);
      });
      this._field_use_candidate_right_click.connect(
        "notify::active",
        (widget) => {
          this._field_candidate_right_click.set_sensitive(widget.active);
        }
      );
      this._field_use_candidate_still.connect("notify::active", (widget) => {
        this._field_candidate_remember_position.set_sensitive(widget.active);
        this._field_candidate_still_position.set_sensitive(widget.active);
      });
      this._field_use_tray_source_switch_key.connect(
        "notify::active",
        (widget) => {
          this._field_tray_source_switch_key.set_sensitive(widget.active);
        }
      );
      this._field_use_tray.connect("notify::active", (widget) => {
        this._field_tray_source_switch_key.set_sensitive(
          this._field_use_tray_source_switch_key && widget.active
        );
        this._field_use_tray_source_switch_key.set_sensitive(widget.active);
        this._field_ibus_emoji.set_sensitive(widget.active);
        this._field_extension_entry.set_sensitive(widget.active);
        this._field_ibus_preference.set_sensitive(widget.active);
        this._field_ibus_version.set_sensitive(widget.active);
        this._field_ibus_restart.set_sensitive(widget.active);
        this._field_ibus_exit.set_sensitive(widget.active);
        this.ibus_settings.set_boolean("show-icon-on-systray", widget.active);
      });
      this._field_use_indicator.connect("notify::active", (widget) => {
        this._field_indicator_only_toggle.set_sensitive(widget.active);
        this._field_indicator_only_in_ASCII.set_sensitive(widget.active);
        this._field_indicator_not_single_IME.set_sensitive(widget.active);
        this._field_indicator_right_close.set_sensitive(widget.active);
        this._field_indicator_scroll.set_sensitive(widget.active);
        this._field_indicator_animation.set_sensitive(widget.active);
        this._field_indicator_left_click.set_sensitive(
          this._field_indicator_enable_left_click.active && widget.active
        );
        this._field_indicator_opacity.set_sensitive(
          this._field_indicator_use_opacity.active && widget.active
        );
        this._field_indicator_show_time.set_sensitive(
          this._field_indicator_enable_show_delay.active && widget.active
        );
        this._field_indicator_hide_time.set_sensitive(
          this._field_indicator_enable_autohide.active && widget.active
        );
        this._field_indicator_custom_font.set_sensitive(
          this._field_indicator_use_custom_font.active && widget.active
        );
        this._field_indicator_use_custom_font.set_sensitive(widget.active);
        this._field_indicator_enable_left_click.set_sensitive(widget.active);
        this._field_indicator_use_opacity.set_sensitive(widget.active);
        this._field_indicator_enable_show_delay.set_sensitive(widget.active);
        this._field_indicator_enable_autohide.set_sensitive(widget.active);
      });
      this._field_indicator_enable_left_click.connect(
        "notify::active",
        (widget) => {
          this._field_indicator_left_click.set_sensitive(widget.active);
        }
      );
      this._field_indicator_use_opacity.connect("notify::active", (widget) => {
        this._field_indicator_opacity.set_sensitive(widget.active);
      });
      this._field_indicator_enable_show_delay.connect(
        "notify::active",
        (widget) => {
          this._field_indicator_show_time.set_sensitive(widget.active);
        }
      );
      this._field_indicator_enable_autohide.connect(
        "notify::active",
        (widget) => {
          this._field_indicator_hide_time.set_sensitive(widget.active);
        }
      );
      this._field_indicator_use_custom_font.connect(
        "notify::active",
        (widget) => {
          this._field_indicator_custom_font.set_sensitive(widget.active);
        }
      );
      this._field_use_custom_font.connect("notify::active", (widget) => {
        this._field_custom_font.set_sensitive(widget.active);
        this.ibus_settings.set_boolean(Fields.USECUSTOMFONT, widget.active);
        this.ibus_settings.set_string(
          Fields.CUSTOMFONT,
          gsettings.get_string(Fields.CUSTOMFONT)
        );
      });
      this._field_use_candidate_opacity.connect("notify::active", (widget) => {
        this._field_candidate_opacity.set_sensitive(widget.active);
      });
      this._field_use_custom_bg.connect("notify::active", (widget) => {
        this._logoPicker.set_sensitive(widget.active);
        this._field_bg_mode.set_sensitive(widget.active);
        this._field_bg_repeat_mode.set_sensitive(widget.active);
        this._reset_logo_button.set_sensitive(widget.active);
        this._open_logo_button.set_sensitive(widget.active);
      });
      this._field_use_custom_bg_dark.connect("notify::active", (widget) => {
        this._logoDarkPicker.set_sensitive(widget.active);
        this._field_bg_dark_mode.set_sensitive(widget.active);
        this._field_bg_dark_repeat_mode.set_sensitive(widget.active);
        this._reset_logoDark_button.set_sensitive(widget.active);
        this._open_logoDark_button.set_sensitive(widget.active);
      });
      this._field_enable_custom_theme.connect("notify::active", (widget) => {
        this._cssPicker.set_sensitive(widget.active);
        this._reset_css_button.set_sensitive(widget.active);
        this._open_css_button.set_sensitive(widget.active);
      });
      this._field_enable_custom_theme_dark.connect(
        "notify::active",
        (widget) => {
          this._cssDarkPicker.set_sensitive(widget.active);
          this._reset_cssDark_button.set_sensitive(widget.active);
          this._open_cssDark_button.set_sensitive(widget.active);
        }
      );
      this._fileChooser.connect("response", (dlg, response) => {
        if (response !== Gtk.ResponseType.ACCEPT) return;
        gsettings.set_string(Fields.CUSTOMBG, dlg.get_file().get_path());
      });
      this._logoPicker.connect("clicked", () => {
        if (ShellVersion < 40)
          this._fileChooser.transient_for = this.get_toplevel();
        else this._fileChooser.transient_for = this.get_root();
        this._fileChooser.set_current_folder(
          Gio.File.new_for_path(
            gsettings.get_string(Fields.CUSTOMBG)).get_parent());
        this._fileChooser.show();
      });
      this._restart_ibus.connect("clicked", () => {
        gsettings.set_string(
          Fields.IBUSRESTTIME,
          new Date().getTime().toString()
        );
        this._updateIBusVersion();
      });
      this._reset_extension.connect("clicked", () => {
        this._resetExtension();
      });
      const dconfFilter = new Gtk.FileFilter();
      dconfFilter.add_pattern("*.ini");
      /* Settings */
      // Export Current Settings
      this._export_settings.connect("clicked", () => {
        this._showFileChooser(
          _("Export Current Settings"),
          {
            action: Gtk.FileChooserAction.SAVE,
            filter: dconfFilter,
          },
          _("Save"),
          (filename) => {
            if (!filename.endsWith(".ini")) filename += ".ini";
            let file = Gio.file_new_for_path(filename);
            let raw = file.replace(null, false, Gio.FileCreateFlags.NONE, null);
            let out = Gio.BufferedOutputStream.new_sized(raw, 4096);

            out.write_all(
              GLib.spawn_command_line_sync("dconf dump " + SCHEMA_PATH)[1],
              null
            );
            out.close(null);
          },
          true
        );
      });
      // Import Settings from file
      this._import_settings.connect("clicked", () => {
        this._showFileChooser(
          _("Import Settings from File"),
          {
            action: Gtk.FileChooserAction.OPEN,
            filter: dconfFilter,
          },
          _("Open"),
          (filename) => {
            if (filename && GLib.file_test(filename, GLib.FileTest.EXISTS)) {
              let settingsFile = Gio.File.new_for_path(filename);
              let [, , stdin, stdout, stderr] = GLib.spawn_async_with_pipes(
                null,
                ["dconf", "load", SCHEMA_PATH],
                null,
                GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD,
                null
              );

              stdin = new Gio.UnixOutputStream({ fd: stdin, close_fd: true });
              GLib.close(stdout);
              GLib.close(stderr);

              // // Disable and then re-enable extension
              // let [ , , , retCode] = GLib.spawn_command_line_sync('gnome-extensions disable ' + Me.uuid);
              // if (retCode == 0) {
              //     GLib.child_watch_add(GLib.PRIORITY_DEFAULT, pid, () => GLib.spawn_command_line_sync('gnome-extensions disable ' + Me.uuid));
              // }

              stdin.splice(
                settingsFile.read(null),
                Gio.OutputStreamSpliceFlags.CLOSE_SOURCE |
                  Gio.OutputStreamSpliceFlags.CLOSE_TARGET,
                null
              );
            }
          }
        );
      });
      // GNOME Settings
      this._field_open_system_settings.connect("clicked", () => {
        if (ShellVersion < 40)
          GLib.spawn_command_line_async("gnome-control-center region");
        else GLib.spawn_command_line_async("gnome-control-center keyboard");
      });
      // IBus Preferences
      this._field_open_ibus_pref.connect("clicked", () => {
        GLib.spawn_command_line_async("ibus-setup");
      });
      this._fileDarkChooser.connect("response", (dlg, response) => {
        if (response !== Gtk.ResponseType.ACCEPT) return;
        gsettings.set_string(Fields.CUSTOMBGDARK, dlg.get_file().get_path());
      });
      this._logoDarkPicker.connect("clicked", () => {
        if (ShellVersion < 40)
          this._fileDarkChooser.transient_for = this.get_toplevel();
        else this._fileDarkChooser.transient_for = this.get_root();
        this._fileDarkChooser.set_current_folder(
          Gio.File.new_for_path(
            gsettings.get_string(Fields.CUSTOMBGDARK)).get_parent());
        this._fileDarkChooser.show();
      });
      this._cssFileChooser.connect("response", (dlg, response) => {
        if (response !== Gtk.ResponseType.ACCEPT) return;
        gsettings.set_string(Fields.CUSTOMTHEME, dlg.get_file().get_path());
      });
      this._cssPicker.connect("clicked", () => {
        if (ShellVersion < 40)
          this._cssFileChooser.transient_for = this.get_toplevel();
        else this._cssFileChooser.transient_for = this.get_root();
        this._cssFileChooser.set_current_folder(
          Gio.File.new_for_path(
            gsettings.get_string(Fields.CUSTOMTHEME)).get_parent());
        this._cssFileChooser.show();
      });
      this._cssDarkFileChooser.connect("response", (dlg, response) => {
        if (response !== Gtk.ResponseType.ACCEPT) return;
        gsettings.set_string(
          Fields.CUSTOMTHEMENIGHT,
          dlg.get_file().get_path()
        );
      });
      this._cssDarkPicker.connect("clicked", () => {
        if (ShellVersion < 40)
          this._cssDarkFileChooser.transient_for = this.get_toplevel();
        else this._cssDarkFileChooser.transient_for = this.get_root();
        this._cssDarkFileChooser.set_current_folder(
          Gio.File.new_for_path(
            gsettings.get_string(Fields.CUSTOMTHEMENIGHT)).get_parent());
        this._cssDarkFileChooser.show();
      });
      this._reset_logo_button.connect("clicked", () => {
        gsettings.set_string(Fields.CUSTOMBG, "");
      });
      this._reset_logoDark_button.connect("clicked", () => {
        gsettings.set_string(Fields.CUSTOMBGDARK, "");
      });
      this._reset_css_button.connect("clicked", () => {
        gsettings.set_string(Fields.CUSTOMTHEME, "");
      });
      this._reset_cssDark_button.connect("clicked", () => {
        gsettings.set_string(Fields.CUSTOMTHEMENIGHT, "");
      });

      this._field_remember_input.set_sensitive(this._field_enable_ASCII.active);
      this._field_unkown_state.set_sensitive(this._field_enable_ASCII.active);
      this._field_orientation.set_sensitive(this._field_enable_orien.active);
      this._field_candidate_animation.set_sensitive(
        this._field_use_candidate_animation.active
      );
      this._field_candidate_scroll_mode.set_sensitive(
        this._field_use_candidate_scroll.active
      );
      this._field_candidate_right_click.set_sensitive(
        this._field_use_candidate_right_click.active
      );
      this._field_candidate_remember_position.set_sensitive(
        this._field_use_candidate_still.active
      );
      this._field_candidate_still_position.set_sensitive(
        this._field_use_candidate_still.active
      );
      this._field_use_tray_source_switch_key.set_sensitive(
        this._field_use_tray.active
      );
      this._field_tray_source_switch_key.set_sensitive(
        this._field_use_tray.active &&
          this._field_use_tray_source_switch_key.active
      );
      this._field_ibus_emoji.set_sensitive(this._field_use_tray.active);
      this._field_extension_entry.set_sensitive(this._field_use_tray.active);
      this._field_ibus_preference.set_sensitive(this._field_use_tray.active);
      this._field_ibus_version.set_sensitive(this._field_use_tray.active);
      this._field_ibus_restart.set_sensitive(this._field_use_tray.active);
      this._field_ibus_exit.set_sensitive(this._field_use_tray.active);
      this._field_indicator_only_toggle.set_sensitive(
        this._field_use_indicator.active
      );
      this._field_indicator_only_in_ASCII.set_sensitive(
        this._field_use_indicator.active
      );
      this._field_indicator_not_single_IME.set_sensitive(
        this._field_use_indicator.active
      );
      this._field_indicator_right_close.set_sensitive(
        this._field_use_indicator.active
      );
      this._field_indicator_scroll.set_sensitive(
        this._field_use_indicator.active
      );
      this._field_indicator_animation.set_sensitive(
        this._field_use_indicator.active
      );
      this._field_indicator_left_click.set_sensitive(
        this._field_use_indicator.active &&
          this._field_indicator_enable_left_click.active
      );
      this._field_indicator_opacity.set_sensitive(
        this._field_use_indicator.active &&
          this._field_indicator_use_opacity.active
      );
      this._field_indicator_show_time.set_sensitive(
        this._field_use_indicator.active &&
          this._field_indicator_enable_show_delay.active
      );
      this._field_indicator_hide_time.set_sensitive(
        this._field_use_indicator.active &&
          this._field_indicator_enable_autohide.active
      );
      this._field_indicator_enable_left_click.set_sensitive(
        this._field_use_indicator.active
      );
      this._field_indicator_use_opacity.set_sensitive(
        this._field_use_indicator.active
      );
      this._field_indicator_enable_show_delay.set_sensitive(
        this._field_use_indicator.active
      );
      this._field_indicator_enable_autohide.set_sensitive(
        this._field_use_indicator.active
      );
      this._field_indicator_custom_font.set_sensitive(
        this._field_use_indicator.active &&
          this._field_indicator_use_custom_font.active
      );
      this._field_indicator_use_custom_font.set_sensitive(
        this._field_use_indicator.active
      );
      this._field_custom_font.set_sensitive(this._field_use_custom_font.active);
      this._field_candidate_opacity.set_sensitive(
        this._field_use_candidate_opacity.active
      );
      this._field_bg_mode.set_sensitive(this._field_use_custom_bg.active);
      this._field_bg_dark_mode.set_sensitive(
        this._field_use_custom_bg_dark.active
      );
      this._field_bg_repeat_mode.set_sensitive(
        this._field_use_custom_bg.active
      );
      this._field_bg_dark_repeat_mode.set_sensitive(
        this._field_use_custom_bg_dark.active
      );
      this._logoPicker.set_sensitive(this._field_use_custom_bg.active);
      this._reset_logo_button.set_sensitive(this._field_use_custom_bg.active);
      this._open_logo_button.set_sensitive(this._field_use_custom_bg.active);
      this._logoDarkPicker.set_sensitive(this._field_use_custom_bg_dark.active);
      this._reset_logoDark_button.set_sensitive(
        this._field_use_custom_bg_dark.active
      );
      this._open_logoDark_button.set_sensitive(
        this._field_use_custom_bg_dark.active
      );
      this._cssPicker.set_sensitive(this._field_enable_custom_theme.active);
      this._reset_css_button.set_sensitive(
        this._field_enable_custom_theme.active
      );
      this._open_css_button.set_sensitive(
        this._field_enable_custom_theme.active
      );
      this._cssDarkPicker.set_sensitive(
        this._field_enable_custom_theme_dark.active
      );
      this._reset_cssDark_button.set_sensitive(
        this._field_enable_custom_theme_dark.active
      );
      this._open_cssDark_button.set_sensitive(
        this._field_enable_custom_theme_dark.active
      );
    }

    _bindValues() {
      gsettings.bind(
        Fields.AUTOSWITCH,
        this._field_enable_ASCII,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.ENABLECUSTOMTHEME,
        this._field_enable_custom_theme,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.ENABLECUSTOMTHEMENIGHT,
        this._field_enable_custom_theme_dark,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.ENABLEORIEN,
        this._field_enable_orien,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.ORIENTATION,
        this._field_orientation,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.USECANDANIM,
        this._field_use_candidate_animation,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.CANDANIMATION,
        this._field_candidate_animation,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.USESCROLL,
        this._field_use_candidate_scroll,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.SCROLLMODE,
        this._field_candidate_scroll_mode,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.USECANDRIGHTSWITCH,
        this._field_use_candidate_right_click,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.CANDRIGHTFUNC,
        this._field_candidate_right_click,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.USECANDSTILL,
        this._field_use_candidate_still,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.CANDSTILLPOS,
        this._field_candidate_still_position,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.USETRAYSSWITCH,
        this._field_use_tray_source_switch_key,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.TRAYSSWITCHKEY,
        this._field_tray_source_switch_key,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.REMCANDPOS,
        this._field_candidate_remember_position,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.REMEMBERINPUT,
        this._field_remember_input,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.UNKNOWNSTATE,
        this._field_unkown_state,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.USECANDOPACITY,
        this._field_use_candidate_opacity,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.CANDOPACITY,
        this._field_candidate_opacity,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.USECUSTOMFONT,
        this._field_use_custom_font,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      if (ShellVersion < 40)
        gsettings.bind(
          Fields.CUSTOMFONT,
          this._field_custom_font,
          "font_name",
          Gio.SettingsBindFlags.DEFAULT
        );
      else {
        gsettings.bind(
          Fields.CUSTOMFONT,
          this._field_custom_font,
          "font",
          Gio.SettingsBindFlags.DEFAULT
        );
      }
      gsettings.bind(
        Fields.INPUTINDUSEF,
        this._field_indicator_use_custom_font,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      if (ShellVersion < 40)
        gsettings.bind(
          Fields.INPUTINDCUSTOMFONT,
          this._field_indicator_custom_font,
          "font_name",
          Gio.SettingsBindFlags.DEFAULT
        );
      else
        gsettings.bind(
          Fields.INPUTINDCUSTOMFONT,
          this._field_indicator_custom_font,
          "font",
          Gio.SettingsBindFlags.DEFAULT
        );
      gsettings.bind(
        Fields.USECUSTOMBG,
        this._field_use_custom_bg,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.USECUSTOMBGDARK,
        this._field_use_custom_bg_dark,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.BGMODE,
        this._field_bg_mode,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.BGDARKMODE,
        this._field_bg_dark_mode,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.BGREPEATMODE,
        this._field_bg_repeat_mode,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.BGDARKREPEATMODE,
        this._field_bg_dark_repeat_mode,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.MENUIBUSEMOJI,
        this._field_ibus_emoji,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.USEREPOSITION,
        this._field_candidate_reposition,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.USEBUTTONS,
        this._field_candidate_buttons,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.FIXIMELIST,
        this._field_fix_ime_list,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.USETRAY,
        this._field_use_tray,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.MENUEXTPREF,
        this._field_extension_entry,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.MENUIBUSPREF,
        this._field_ibus_preference,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.MENUIBUSVER,
        this._field_ibus_version,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.MENUIBUSREST,
        this._field_ibus_restart,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.MENUIBUSEXIT,
        this._field_ibus_exit,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.USEINPUTIND,
        this._field_use_indicator,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.INPUTINDTOG,
        this._field_indicator_only_toggle,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.INPUTINDASCII,
        this._field_indicator_only_in_ASCII,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.INPUTINDSINGLE,
        this._field_indicator_not_single_IME,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.USEINPUTINDLCLK,
        this._field_indicator_enable_left_click,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.INPUTINDLCLICK,
        this._field_indicator_left_click,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.INPUTINDRIGC,
        this._field_indicator_right_close,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.INPUTINDSCROLL,
        this._field_indicator_scroll,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.INPUTINDANIM,
        this._field_indicator_animation,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.USEINDOPACITY,
        this._field_indicator_use_opacity,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.INDOPACITY,
        this._field_indicator_opacity,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.USEINDSHOWD,
        this._field_indicator_enable_show_delay,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.INPUTINDSHOW,
        this._field_indicator_show_time,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.USEINDAUTOHID,
        this._field_indicator_enable_autohide,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.INPUTINDHID,
        this._field_indicator_hide_time,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.connect(
        `changed::${Fields.CUSTOMBG}`,
        this._updateLogoPicker.bind(this)
      );
      this._updateLogoPicker();
      gsettings.connect(
        `changed::${Fields.CUSTOMBGDARK}`,
        this._updateLogoDarkPicker.bind(this)
      );
      this._updateLogoDarkPicker();
      gsettings.connect(
        `changed::${Fields.CUSTOMTHEME}`,
        this._updateCssPicker.bind(this)
      );
      this._updateCssPicker();
      gsettings.connect(
        `changed::${Fields.CUSTOMTHEMENIGHT}`,
        this._updateCssDarkPicker.bind(this)
      );
      this._updateCssDarkPicker();
      this._updateIBusVersion();
    }

    _createAdjustment(key, step_increment) {
      let schemaKey = gsettings.settings_schema.get_key(key);
      let [type, variant] = schemaKey.get_range().deep_unpack();
      if (type !== "range")
        throw new Error('Invalid key type "%s" for adjustment'.format(type));
      let [lower, upper] = variant.deep_unpack();
      let adj = new Gtk.Adjustment({
        lower,
        upper,
        step_increment,
      });
      gsettings.bind(key, adj, "value", Gio.SettingsBindFlags.DEFAULT);
      return adj;
    }

    _listFrameMaker(lbl) {
      let box = new Gtk.Box(BoxSettings);
      let frame = new Gtk.Frame({
        margin_top: 10,
      });

      if (ShellVersion < 40) box.add(frame);
      else box.append(frame);
      this._notebook.append_page(box, new Gtk.Label({ label: lbl }));

      frame.grid = new Gtk.Grid({
        hexpand: true,
        row_homogeneous: false,
        column_homogeneous: false,
      });

      frame.grid._row = 0;
      if (ShellVersion < 40) frame.add(frame.grid);
      else frame.set_child(frame.grid);

      frame._add = (x, y, z, a, b, c) => {
        const boxrow = new Gtk.ListBoxRow({
          activatable: true,
          selectable: false,
        });
        const hbox = new Gtk.Box(BoxSettings);
        if (ShellVersion < 40) boxrow.add(hbox);
        else boxrow.set_child(hbox);
        let spacing = 4;
        if (ShellVersion < 40) {
          hbox.pack_start(x, true, true, spacing);
          if (y) hbox.pack_start(y, false, false, spacing);
          if (z) hbox.pack_start(z, false, false, spacing);
          if (a) hbox.pack_start(a, false, false, spacing);
          if (b) hbox.pack_start(b, false, false, spacing);
          if (c) hbox.pack_start(c, false, false, spacing);
        } else {
          hbox.set_spacing(spacing);
          hbox.append(x);
          if (y) hbox.append(y);
          if (z) hbox.append(z);
          if (a) hbox.append(a);
          if (b) hbox.append(b);
          if (c) hbox.append(c);
        }
        frame.grid.attach(boxrow, 0, frame.grid._row++, 1, 1);
      };
      return frame;
    }

    _expanderFrame(frame) {
      let expanderFrame = new Gtk.Frame({
        margin_top: 10,
      });
      expanderFrame.grid = new Gtk.Grid({
        margin_start: 10,
        margin_end: 10,
        margin_top: 10,
        margin_bottom: 10,
        hexpand: true,
        row_spacing: 12,
        column_spacing: 18,
        row_homogeneous: false,
        column_homogeneous: false,
        halign: Gtk.Align.CENTER,
      });
      expanderFrame.grid._row = 0;
      if (ShellVersion < 40) expanderFrame.add(expanderFrame.grid);
      else expanderFrame.set_child(expanderFrame.grid);

      let expander = new Gtk.Expander({
        use_markup: true,
        child: expanderFrame,
        expanded: true,
        label: "<b>💡" + _("Help") + "</b>",
      });
      frame.grid.attach(expander, 0, frame.grid._row++, 1, 1);

      expanderFrame._add = (x) => {
        expanderFrame.grid.attach(x, 0, frame.grid._row++, 1, 1);
      };
      return expanderFrame;
    }

    _aboutPage() {
      let box = new Gtk.Box(BoxSettings);
      let frame = new Gtk.Frame({
        margin_top: 10,
      });

      if (ShellVersion < 40) box.add(frame);
      else box.append(frame);
      this._notebook.append_page(box, new Gtk.Label({ label: _("About") }));

      frame.grid = new Gtk.Grid({
        margin_start: 10,
        margin_end: 10,
        margin_top: 10,
        margin_bottom: 10,
        hexpand: true,
        row_spacing: 12,
        column_spacing: 18,
        row_homogeneous: false,
        column_homogeneous: false,
        halign: Gtk.Align.CENTER,
      });

      frame.grid._row = 0;
      if (ShellVersion < 40) frame.add(frame.grid);
      else frame.set_child(frame.grid);

      var version = _("unknown (self-build ?)");
      if (Me.metadata.version !== undefined) {
        version = Me.metadata.version.toString();
      }
      let iconFile = GLib.build_filenamev([
        Me.dir.get_path(),
        "img",
        "logo.png",
      ]);
      if (ShellVersion < 40) {
        frame.grid.attach(
          new Gtk.Image({
            pixbuf: GdkPixbuf.Pixbuf.new_from_file_at_size(iconFile, 80, 80),
          }),
          0,
          frame.grid._row++,
          1,
          1
        );
      } else {
        let logo = Gtk.Image.new_from_pixbuf(
          GdkPixbuf.Pixbuf.new_from_file(iconFile)
        );
        logo.set_pixel_size(80);
        frame.grid.attach(logo, 0, frame.grid._row++, 1, 1);
      }
      frame.grid.attach(
        new Gtk.Label({
          use_markup: true,
          label: "<b>" + _("Customize IBus") + "</b>",
        }),
        0,
        frame.grid._row++,
        1,
        1
      );
      frame.grid.attach(
        new Gtk.Label({ label: _("Version: ") + version }),
        0,
        frame.grid._row++,
        1,
        1
      );
      frame.grid.attach(
        new Gtk.Label({
          label:
            "😎 " +
            _(
              "Full customization of appearance, behavior, system tray and input source indicator for IBus."
            ),
        }),
        0,
        frame.grid._row++,
        1,
        1
      );
      frame.grid.attach(
        new Gtk.Label({
          use_markup: true,
          label: " ",
        }),
        0,
        frame.grid._row++,
        1,
        1
      );
      frame.grid.attach(
        new Gtk.Label({
          use_markup: true,
          label: _(
            '<span size="small">Copyright © 2021 <a href="https://github.com/HollowMan6">Hollow Man</a> &lt;<a href="mailto:hollowman@opensuse.org">hollowman@opensuse.org</a>&gt;</span>'
          ),
        }),
        0,
        frame.grid._row++,
        1,
        1
      );
      frame.grid.attach(
        new Gtk.Label({
          use_markup: true,
          label: _(
            '<span size="small">Source Code: <a href="https://github.com/openSUSE/Customize-IBus">https://github.com/openSUSE/Customize-IBus</a></span>'
          ),
        }),
        0,
        frame.grid._row++,
        1,
        1
      );
      frame.grid.attach(
        new Gtk.Label({
          use_markup: true,
          label: _(
            '<span size="small">Sponsored by <a href="https://summerofcode.withgoogle.com/archive/2021/projects/6295506795364352/">Google Summer of Code 2021</a> <b><a href="https://github.com/openSUSE">@openSUSE</a></b>.</span>'
          ),
        }),
        0,
        frame.grid._row++,
        1,
        1
      );
      frame.grid.attach(
        new Gtk.Label({
          use_markup: true,
          label: " ",
        }),
        0,
        frame.grid._row++,
        1,
        1
      );
      frame.grid.attach(
        new Gtk.Label({
          label:
            _("Current Session") +
            ": GNOME " +
            Config.PACKAGE_VERSION +
            " (" +
            SessionType +
            ")",
        }),
        0,
        frame.grid._row++,
        1,
        1
      );
      frame.grid.attach(
        new Gtk.Label({
          use_markup: true,
          label: " ",
        }),
        0,
        frame.grid._row++,
        1,
        1
      );
      frame.grid.attach(
        new Gtk.Label({
          use_markup: true,
          label: _(
            '<span size="small">This program comes with ABSOLUTELY NO WARRANTY.</span>'
          ),
        }),
        0,
        frame.grid._row++,
        1,
        1
      );
      frame.grid.attach(
        new Gtk.Label({
          use_markup: true,
          label: _(
            '<span size="small">See the <a href="https://www.gnu.org/licenses/gpl">GNU General Public License, version 3 or later</a> for details.</span>'
          ),
        }),
        0,
        frame.grid._row++,
        1,
        1
      );
    }

    _basicHelpPage(frame) {
      let expanderFrame = this._expanderFrame(frame);

      expanderFrame._add(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            "Here you can set the IBus input window orientation, animation, right click to open menu or switch source, scroll to switch among pages or candidates, fix candidate box to not follow caret position, font, ASCII mode auto-switch when windows are switched by users, candidate box opacity, fix IME list order when switching, reposition candidate box by dragging when input, and also show or hide candidate box page buttons."
          ),
        })
      );
      expanderFrame._add(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            '<span size="small"><b>Note:</b> If <b>fix candidate box</b> is enabled, you can set the candidate box position with 9 options. Recommend to <b>enable drag to reposition candidate box</b> at the same time so that you can rearrange the position at any time. Will remember candidate position forever after reposition if you set to <b>remember last position</b>, and restore at next login.</span>'
          ),
        })
      );
      expanderFrame._add(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            "<span size=\"small\"><b>Note:</b> If <b>auto switch ASCII mode</b> is enabled, and you have set to <b>Remember Input State</b>, every opened APP's input mode will be remembered if you have switched the input source manually in the APP's window, and the newly-opened APP will follow the configuration. APP's Input State will be remembered forever.</span>"
          ),
        })
      );
      expanderFrame._add(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            '<span size="small"><b>Note:</b> If you <b>enable drag to reposition candidate box</b>, and if <b>fix candidate box</b> is enabled, your rearranged position will last until the end of this session. If not the rearranged position will only last for the specific input.</span>'
          ),
        })
      );
    }

    _trayHelpPage(frame) {
      let expanderFrame = this._expanderFrame(frame);

      expanderFrame._add(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            "Here you can set to show IBus tray icon, enable directly switch source with click, add additional menu entries to IBus input source indicator menu at system tray to restore the feelings on Non-GNOME desktop environment. You can also start or restart IBus by pressing the top button."
          ),
        })
      );

      expanderFrame._add(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            '<span size="small"><b>Note:</b> If <b>Directly switch source with click</b> is enabled, when the left key is selected, if you click the tray icon with left key, you will have input source switched, and click right key will open the menu as normal, vice versa.</span>'
          ),
        })
      );
    }

    _indicatorHelpPage(frame) {
      let expanderFrame = this._expanderFrame(frame);

      expanderFrame._add(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            "Here you can set to show input source indicator, default is to show indicator every time you type, move caret or switch input source. You can set to show indicator only when switching input source. You can also set to only notify in ASCII mode (for multi-mode IME), not notify when using single mode IME, mouse right click to close indicator, scroll to switch input source, popup animation, font, mouse left click to switch input source or drag to move indicator, indicator opacity, enable show delay and show timeout (in seconds), enable auto-hide and auto-hide timeout (in seconds)."
          ),
        })
      );
      expanderFrame._add(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            '<span size="small"><b>Note:</b> If you choose to enable the show delay, there won\'t be a show delay when you switch input source or window.</span>'
          ),
        })
      );
    }

    _themeHelpPage(frame) {
      let expanderFrame = this._expanderFrame(frame);

      expanderFrame._add(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            'Support importing stylesheet generated by <a href="https://github.com/openSUSE/IBus-Theme-Tools">IBus Theme Tools</a> or provided by <a href="https://github.com/openSUSE/IBus-Theme-Hub">IBus Theme Hub</a>.'
          ),
        })
      );
      expanderFrame._add(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            "When light theme and dark theme are turned on at the same time, the IBus theme will automatically follow GNOME Night Light mode, use light theme when off, and use dark theme when on. When only the light theme or dark theme is turned on, the IBus theme will always use the theme that is turned on."
          ),
        })
      );
      expanderFrame._add(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            '<span size="small"><b><i>Warning:</i> If not for debugging, please DO NOT add any classes that\'s not started with <i>.candidate-*</i> into IBus stylesheet to prevent from corrupting system themes.</b></span>'
          ),
        })
      );
      expanderFrame._add(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            '<span size="small"><b>Note:</b> Support stylesheets hot reload, CSS changes reflecting in real-time.</span>'
          ),
        })
      );
    }

    _bgHelpPage(frame) {
      let expanderFrame = this._expanderFrame(frame);

      expanderFrame._add(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            "Support customizing your IBus Input window background with a picture. It has a higher priority than the theme-defined background."
          ),
        })
      );
      expanderFrame._add(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            "When light background and dark background are turned on at the same time, the IBus background will automatically follow GNOME Night Light mode, use light background when off, and use dark background when on. When only the light background or dark background is turned on, the IBus background will always use the background that is turned on."
          ),
        })
      );
      expanderFrame._add(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            '<span size="small"><b>Note:</b> Please make sure your background picture can always be visited. If your pictures are stored in the removable device and the system doesn\'t mount it by default, please disable and then enable the corresponding <b>Use custom background</b> again to make it effective after manually mounting.</span>'
          ),
        })
      );
    }

    _settingsHelpPage(frame) {
      let expanderFrame = this._expanderFrame(frame);

      expanderFrame._add(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            "Here you can reset the settings of this extension to default. You can also export current settings to an ini file for backup, and then import it when you need restore. For your information, you may also open the official IBus customization settings for customizations you can't find in this extension."
          ),
        })
      );
    }

    _checkMaker(x) {
      return new Gtk.CheckButton({
        label: x,
        hexpand: true,
        halign: Gtk.Align.START,
      });
    }

    _switchLabelMaker(x) {
      return new Gtk.Label({
        label: x,
        hexpand: true,
        use_markup: true,
        halign: Gtk.Align.START,
      });
    }

    _comboMaker(ops) {
      let l = new Gtk.ListStore();
      l.set_column_types([GObject.TYPE_STRING]);
      ops.forEach((op) => l.set(l.append(), [0], [op]));
      let c = new Gtk.ComboBox({ model: l });
      let r = new Gtk.CellRendererText();
      c.pack_start(r, false);
      c.add_attribute(r, "text", 0);
      return c;
    }

    _iconButtonMaker(uri, icon_name) {
      if (ShellVersion < 40)
        return new Gtk.Button({
          image: new Gtk.Image({
            gicon: new Gio.ThemedIcon({
              name: icon_name,
            }),
            icon_size: Gtk.IconSize.BUTTON,
            visible: true,
          }),
          visible: true,
        });
      else
        return new Gtk.Button({
          icon_name: icon_name,
          visible: true,
        });
    }

    _iconLinkButtonMaker(uri, icon_name) {
      if (ShellVersion < 40)
        return new Gtk.LinkButton({
          uri,
          image: new Gtk.Image({
            gicon: new Gio.ThemedIcon({
              name: icon_name,
            }),
            icon_size: Gtk.IconSize.BUTTON,
            visible: true,
          }),
          visible: true,
        });
      else
        return new Gtk.LinkButton({
          uri,
          icon_name: icon_name,
          visible: true,
        });
    }

    _buildHeaderBar() {
      this.connect("realize", () => {
        if (ShellVersion < 40) this.toplevel = this.get_toplevel();
        else this.toplevel = this.get_root();
        this.headerBar = this.toplevel.get_titlebar();
        let uri = _(
          "https://hollowmansblog.wordpress.com/2021/08/21/customize-ibus-user-guide/"
        );
        let helpButton = this._iconLinkButtonMaker(
          uri,
          "dialog-information-symbolic"
        );
        this.headerBar.pack_start(helpButton);
        this.toplevel.set_title(_("Customize IBus"));
        return GLib.SOURCE_REMOVE;
      });
    }

    _showFileChooser(title, params, acceptBtn, acceptHandler, setDefaultName) {
      var transient_for;
      if (ShellVersion < 40)
        transient_for = this.get_toplevel ? this.get_toplevel() : this;
      else transient_for = this.get_root ? this.get_root() : this;
      let dialog = new Gtk.FileChooserDialog(
        mergeObjects({ title: title, transient_for: transient_for }, params)
      );
      if (setDefaultName)
        dialog.set_current_name(
          "Customize_IBus_Settings_" + new Date().getTime().toString() + ".ini"
        );
      dialog.add_button(_("Cancel"), Gtk.ResponseType.CANCEL);
      dialog.add_button(acceptBtn, Gtk.ResponseType.ACCEPT);

      dialog.show();

      dialog.connect("response", (dialog, id) => {
        if (id != Gtk.ResponseType.ACCEPT) {
          dialog.destroy();
          return;
        }
        acceptHandler.call(this, dialog.get_file().get_path());
        dialog.destroy();
      });
    }

    /* Settings */
    // Restore Default Settings
    _resetExtension() {
      var transient_for;
      if (ShellVersion < 40)
        transient_for = this.get_toplevel ? this.get_toplevel() : this;
      else transient_for = this.get_root ? this.get_root() : this;
      let dialog = new Gtk.MessageDialog({
        transient_for,
        modal: true,
        message_type: Gtk.MessageType.WARNING,
      });
      dialog.set_default_response(Gtk.ResponseType.OK);
      dialog.add_button(_("Cancel"), Gtk.ResponseType.CANCEL);
      dialog.add_button(_("OK"), Gtk.ResponseType.OK);
      dialog.set_markup(
        "<big><b>" + _("Reset All Settings to Default?") + "</b></big>"
      );
      let message = new Gtk.Label({
        wrap: true,
        justify: 3,
        use_markup: true,
        label: _("This will discard all the current configurations!"),
      });
      if (ShellVersion < 40)
        dialog.get_message_area().pack_start(message, true, true, 0);
      else dialog.get_message_area().append(message);
      dialog.connect("response", (dialog, id) => {
        if (id != Gtk.ResponseType.OK) {
          dialog.destroy();
          return;
        }
        for (var field in Fields)
          if (field != "IBUSRESTTIME") gsettings.reset(Fields[field]);
        dialog.destroy();
      });
      if (ShellVersion < 40) dialog.show_all();
      else dialog.show();
    }

    destroy() {
      if (this._fileChooser) this._fileChooser.destroy();
      this._fileChooser = null;
      if (this._fileDarkChooser) this._fileDarkChooser.destroy();
      this._fileDarkChooser = null;
      if (this._cssFileChooser) this._cssFileChooser.destroy();
      this._cssFileChooser = null;
      if (this._cssDarkFileChooser) this._cssDarkFileChooser.destroy();
      this._cssDarkFileChooser = null;
    }
  }
);
