// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-
// vim:fdm=syntax
// by:hollowman6@github tuberry@github

"use strict";

const { Gio, Gtk, GObject, GLib, IBus, GdkPixbuf } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const _ = imports.gettext.domain(Me.metadata["gettext-domain"]).gettext;

const gsettings = ExtensionUtils.getSettings();
const Fields = Me.imports.fields.Fields;
const ibusGsettings = new Gio.Settings({
  schema_id: "org.freedesktop.ibus.panel",
});

function buildPrefsWidget() {
  return new CustomizeIBus();
}

function init() {
  ExtensionUtils.initTranslations();
}

const CustomizeIBus = GObject.registerClass(
  class CustomizeIBus extends Gtk.ScrolledWindow {
    _init() {
      super._init({
        hscrollbar_policy: Gtk.PolicyType.NEVER,
      });

      this._bulidWidget();
      this._bulidUI();
      this._bindValues();
      this._syncStatus();
      this.show_all();
    }

    _bulidWidget() {
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
      this._field_enable_ASCII = this._checkMaker(_("Auto switch ASCII mode"));
      this._field_enable_orien = this._checkMaker(_("Candidates orientation"));
      this._field_use_candidate_animation = this._checkMaker(
        _("Candidates popup animation")
      );
      this._field_use_candidate_still = this._checkMaker(
        _("Fix Candidate box")
      );

      this._field_use_tray_source_switch_key = this._checkMaker(
        _("Directly switch source with click")
      );

      this._field_use_candidate_right_click = this._checkMaker(
        _("Candidate box right click")
      );

      this._restart_ibus = new Gtk.Button({
        label: _("Start/Restart IBus"),
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
      this._field_candidate_reposition = new Gtk.Switch();
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
      this._field_indicator_right_close = new Gtk.Switch();

      let adjustment = this._createAdjustment(Fields.INPUTINDHID);
      this._field_indicator_enable_left_click = this._checkMaker(
        _("Enable Indicater left click")
      );
      this._field_indicator_enable_autohide = this._checkMaker(
        _("Enable Indicater auto hide timeout (unit: seconds)")
      );
      this._field_indicator_hide_time = new Gtk.Scale({
        adjustment,
        draw_value: true,
        hexpand: true,
      });

      this._field_custom_font = new Gtk.FontButton({
        font_name: gsettings.get_string(Fields.CUSTOMFONT),
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
      this._fileDarkChooser = new Gtk.FileChooserNative({
        title: _("Select an Image"),
        filter,
        modal: true,
      });
      this._logoDarkPicker = new Gtk.Button({
        label: _("(None)"),
      });

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
      this._cssDarkFileChooser = new Gtk.FileChooserNative({
        title: _("Select an IBus Stylesheet"),
        filter: cssFilter,
        modal: true,
      });
      this._cssDarkPicker = new Gtk.Button({
        label: _("(None)"),
      });
    }

    _updateLogoPicker() {
      const filename = gsettings.get_string(Fields.CUSTOMBG);
      if (!GLib.basename(filename)) this._logoPicker.label = _("(None)");
      else this._logoPicker.label = GLib.basename(filename);
    }

    _updateLogoDarkPicker() {
      const filename = gsettings.get_string(Fields.CUSTOMBGDARK);
      if (!GLib.basename(filename)) this._logoDarkPicker.label = _("(None)");
      else this._logoDarkPicker.label = GLib.basename(filename);
    }

    _updateCssPicker() {
      const filename = gsettings.get_string(Fields.CUSTOMTHEME);
      if (!GLib.basename(filename)) this._cssPicker.label = _("(None)");
      else this._cssPicker.label = GLib.basename(filename);
    }

    _updateCssDarkPicker() {
      const filename = gsettings.get_string(Fields.CUSTOMTHEMENIGHT);
      if (!GLib.basename(filename)) this._cssDarkPicker.label = _("(None)");
      else this._cssDarkPicker.label = GLib.basename(filename);
    }

    _updateIBusVersion() {
      let IBusVersion = _("unknown (installed ?)");
      if (IBus.MAJOR_VERSION)
        IBusVersion =
          IBus.MAJOR_VERSION +
          "." +
          IBus.MINOR_VERSION +
          "." +
          IBus.MICRO_VERSION;
      this._ibus_version.label =
        "<b>" + _("IBus Version: ") + "</b>" + IBusVersion;
    }

    _bulidUI() {
      this._notebook = new Gtk.Notebook();
      this.add(this._notebook);

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
      this._ibus_basic._add(
        this._switchLabelMaker(_("Enable drag to re-position candidate")),
        this._field_candidate_reposition
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
        this._switchLabelMaker(_("This extension's preferences")),
        this._field_extension_entry
      );
      this._ibus_tray._add(
        this._switchLabelMaker(_("IBus preferences")),
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
        this._switchLabelMaker(_("Enable right click to close indicator")),
        this._field_indicator_right_close
      );
      this._ibus_indicator._add(
        this._switchLabelMaker(_("Indicater popup animation")),
        this._field_indicator_animation
      );
      this._ibus_indicator._add(
        this._field_indicator_enable_left_click,
        this._field_indicator_left_click
      );
      let hbox = new Gtk.Box();
      hbox.pack_start(this._field_indicator_enable_autohide, true, true, 4);
      hbox.pack_start(this._field_indicator_hide_time, true, true, 4);
      this._ibus_indicator.grid.attach(
        hbox,
        0,
        this._ibus_indicator.grid._row++,
        1,
        1
      );
      this._indicatorHelpPage(this._ibus_indicator);

      this._ibus_theme = this._listFrameMaker(_("Theme"));
      this._ibus_theme._add(this._field_enable_custom_theme, this._cssPicker);
      this._ibus_theme._add(
        this._field_enable_custom_theme_dark,
        this._cssDarkPicker
      );
      this._themeHelpPage(this._ibus_theme);

      this._ibus_bg = this._listFrameMaker(_("Background"));
      this._ibus_bg._add(
        this._field_use_custom_bg,
        this._field_bg_mode,
        this._field_bg_repeat_mode,
        this._logoPicker
      );
      this._ibus_bg._add(
        this._field_use_custom_bg_dark,
        this._field_bg_dark_mode,
        this._field_bg_dark_repeat_mode,
        this._logoDarkPicker
      );
      this._bgHelpPage(this._ibus_bg);

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
        ibusGsettings.set_boolean(Fields.USETRAY, widget.active);
      });
      this._field_ibus_emoji.connect("notify::active", (widget) => {
        ibusGsettings.set_boolean(Fields.MENUIBUSEMOJI, widget.active);
      });
      this._field_candidate_reposition.connect("notify::active", (widget) => {
        ibusGsettings.set_boolean(Fields.USEREPOSITION, widget.active);
      });
      this._field_extension_entry.connect("notify::active", (widget) => {
        ibusGsettings.set_boolean(Fields.MENUEXTPREF, widget.active);
      });
      this._field_ibus_preference.connect("notify::active", (widget) => {
        ibusGsettings.set_boolean(Fields.MENUIBUSPREF, widget.active);
      });
      this._field_ibus_version.connect("notify::active", (widget) => {
        ibusGsettings.set_boolean(Fields.MENUIBUSVER, widget.active);
      });
      this._field_ibus_restart.connect("notify::active", (widget) => {
        ibusGsettings.set_boolean(Fields.MENUIBUSREST, widget.active);
      });
      this._field_ibus_exit.connect("notify::active", (widget) => {
        ibusGsettings.set_boolean(Fields.MENUIBUSEXIT, widget.active);
      });
      this._field_use_indicator.connect("notify::active", (widget) => {
        this._field_indicator_only_toggle.set_sensitive(widget.active);
        this._field_indicator_only_in_ASCII.set_sensitive(widget.active);
        this._field_indicator_right_close.set_sensitive(widget.active);
        this._field_indicator_animation.set_sensitive(widget.active);
        this._field_indicator_left_click.set_sensitive(
          this._field_indicator_enable_left_click.active && widget.active
        );
        this._field_indicator_hide_time.set_sensitive(
          this._field_indicator_enable_autohide.active && widget.active
        );
        this._field_indicator_enable_left_click.set_sensitive(widget.active);
        this._field_indicator_enable_autohide.set_sensitive(widget.active);
        ibusGsettings.set_boolean(Fields.USEINPUTIND, widget.active);
      });
      this._field_indicator_only_toggle.connect("notify::active", (widget) => {
        ibusGsettings.set_boolean(Fields.INPUTINDTOG, widget.active);
      });
      this._field_indicator_only_in_ASCII.connect(
        "notify::active",
        (widget) => {
          ibusGsettings.set_boolean(Fields.INPUTINDASCII, widget.active);
        }
      );
      this._field_indicator_enable_left_click.connect(
        "notify::active",
        (widget) => {
          this._field_indicator_left_click.set_sensitive(widget.active);
          ibusGsettings.set_boolean(Fields.USEINPUTINDLCLK, widget.active);
        }
      );
      this._field_indicator_enable_autohide.connect(
        "notify::active",
        (widget) => {
          this._field_indicator_hide_time.set_sensitive(widget.active);
          ibusGsettings.set_boolean(Fields.USEINDAUTOHID, widget.active);
        }
      );
      this._field_indicator_right_close.connect("notify::active", (widget) => {
        ibusGsettings.set_boolean(Fields.INPUTINDRIGC, widget.active);
      });
      this._field_use_custom_font.connect("notify::active", (widget) => {
        this._field_custom_font.set_sensitive(widget.active);
        ibusGsettings.set_boolean(Fields.USECUSTOMFONT, widget.active);
      });
      this._field_use_custom_bg.connect("notify::active", (widget) => {
        this._logoPicker.set_sensitive(widget.active);
        this._field_bg_mode.set_sensitive(widget.active);
        this._field_bg_repeat_mode.set_sensitive(widget.active);
        ibusGsettings.set_boolean(Fields.USECUSTOMBG, widget.active);
      });
      this._field_use_custom_bg_dark.connect("notify::active", (widget) => {
        this._logoDarkPicker.set_sensitive(widget.active);
        this._field_bg_dark_mode.set_sensitive(widget.active);
        this._field_bg_dark_repeat_mode.set_sensitive(widget.active);
        ibusGsettings.set_boolean(Fields.USECUSTOMBGDARK, widget.active);
      });
      this._field_enable_custom_theme.connect("notify::active", (widget) => {
        this._cssPicker.set_sensitive(widget.active);
        ibusGsettings.set_boolean(Fields.ENABLECUSTOMTHEME, widget.active);
      });
      this._field_enable_custom_theme_dark.connect(
        "notify::active",
        (widget) => {
          this._cssDarkPicker.set_sensitive(widget.active);
          ibusGsettings.set_boolean(
            Fields.ENABLECUSTOMTHEMENIGHT,
            widget.active
          );
        }
      );
      this._fileChooser.connect("response", (dlg, response) => {
        if (response !== Gtk.ResponseType.ACCEPT) return;
        gsettings.set_string(Fields.CUSTOMBG, dlg.get_file().get_path());
      });
      this._logoPicker.connect("clicked", () => {
        this._fileChooser.transient_for = this.get_toplevel();
        this._fileChooser.show();
      });
      this._restart_ibus.connect("clicked", () => {
        gsettings.set_string(
          Fields.IBUSRESTTIME,
          new Date().getTime().toString()
        );
        this._updateIBusVersion();
      });
      this._fileDarkChooser.connect("response", (dlg, response) => {
        if (response !== Gtk.ResponseType.ACCEPT) return;
        gsettings.set_string(Fields.CUSTOMBGDARK, dlg.get_file().get_path());
      });
      this._logoDarkPicker.connect("clicked", () => {
        this._fileDarkChooser.transient_for = this.get_toplevel();
        this._fileDarkChooser.show();
      });
      this._cssFileChooser.connect("response", (dlg, response) => {
        if (response !== Gtk.ResponseType.ACCEPT) return;
        gsettings.set_string(Fields.CUSTOMTHEME, dlg.get_file().get_path());
      });
      this._cssPicker.connect("clicked", () => {
        this._cssFileChooser.transient_for = this.get_toplevel();
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
        this._cssDarkFileChooser.transient_for = this.get_toplevel();
        this._cssDarkFileChooser.show();
      });
      this._field_custom_font.connect("font-set", (widget) => {
        ibusGsettings.set_string(Fields.CUSTOMFONT, widget.font_name);
        gsettings.set_string(Fields.CUSTOMFONT, widget.font_name);
      });

      this._field_remember_input.set_sensitive(this._field_enable_ASCII.active);
      this._field_unkown_state.set_sensitive(this._field_enable_ASCII.active);
      this._field_orientation.set_sensitive(this._field_enable_orien.active);
      this._field_candidate_animation.set_sensitive(
        this._field_use_candidate_animation.active
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
      this._field_indicator_right_close.set_sensitive(
        this._field_use_indicator.active
      );
      this._field_indicator_animation.set_sensitive(
        this._field_use_indicator.active
      );
      this._field_indicator_left_click.set_sensitive(
        this._field_use_indicator.active &&
          this._field_indicator_enable_left_click.active
      );
      this._field_indicator_hide_time.set_sensitive(
        this._field_use_indicator.active &&
          this._field_indicator_enable_autohide.active
      );
      this._field_indicator_enable_left_click.set_sensitive(
        this._field_use_indicator.active
      );
      this._field_indicator_enable_autohide.set_sensitive(
        this._field_use_indicator.active
      );
      this._field_custom_font.set_sensitive(this._field_use_custom_font.active);
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
      this._logoDarkPicker.set_sensitive(this._field_use_custom_bg_dark.active);
      this._cssPicker.set_sensitive(this._field_enable_custom_theme.active);
      this._cssDarkPicker.set_sensitive(
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
        Fields.USECUSTOMFONT,
        this._field_use_custom_font,
        "active",
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
        Fields.INPUTINDANIM,
        this._field_indicator_animation,
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

    _createAdjustment(key) {
      let schemaKey = gsettings.settings_schema.get_key(key);
      let [type, variant] = schemaKey.get_range().deep_unpack();
      if (type !== "range")
        throw new Error('Invalid key type "%s" for adjustment'.format(type));
      let [lower, upper] = variant.deep_unpack();
      let adj = new Gtk.Adjustment({
        lower,
        upper,
      });
      gsettings.bind(key, adj, "value", Gio.SettingsBindFlags.DEFAULT);
      return adj;
    }

    _listFrameMaker(lbl) {
      let box = new Gtk.Box({
        margin_start: 10,
        margin_end: 10,
        margin_top: 10,
        margin_bottom: 10,
        orientation: Gtk.Orientation.VERTICAL,
      });
      let frame = new Gtk.Frame({
        margin_top: 10,
        label_yalign: 1,
      });

      box.add(frame);
      this._notebook.append_page(box, new Gtk.Label({ label: lbl }));

      frame.grid = new Gtk.Grid({
        margin: 10,
        hexpand: true,
        row_spacing: 12,
        column_spacing: 18,
        row_homogeneous: false,
        column_homogeneous: false,
      });

      frame.grid._row = 0;
      frame.add(frame.grid);

      frame._add = (x, y, z, a) => {
        const hbox = new Gtk.Box();
        hbox.pack_start(x, true, true, 4);
        if (y) hbox.pack_start(y, false, false, 4);
        if (z) hbox.pack_start(z, false, false, 4);
        if (a) hbox.pack_start(a, false, false, 4);
        frame.grid.attach(hbox, 0, frame.grid._row++, 1, 1);
      };
      return frame;
    }

    _aboutPage() {
      let box = new Gtk.Box({
        margin_start: 10,
        margin_end: 10,
        margin_top: 10,
        margin_bottom: 10,
        orientation: Gtk.Orientation.VERTICAL,
      });
      let frame = new Gtk.Frame({
        margin_top: 10,
      });

      box.add(frame);
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
      });

      frame.grid._row = 0;
      frame.add(frame.grid);

      var version = _("unknown (self-build ?)");
      if (Me.metadata.version !== undefined) {
        version = Me.metadata.version.toString();
      }
      frame.grid.attach(
        new Gtk.Image({
          pixbuf: GdkPixbuf.Pixbuf.new_from_file_at_size(
            GLib.build_filenamev([Me.dir.get_path(), "img", "logo.png"]),
            80,
            80
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
          label: _(
            '<span size="small">Copyright © 2021 <a href="https://github.com/HollowMan6">Hollow Man</a> &lt;<a href="mailto:hollowman@hollowman.ml">hollowman@hollowman.ml</a>&gt;</span>'
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
            '<span size="small">Source Code: <a href="https://github.com/HollowMan6/Customize-IBus">https://github.com/HollowMan6/Customize-IBus</a></span>'
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
            '<span size="small">Sponsored by <a href="https://summerofcode.withgoogle.com/projects/#5505085183885312">Google Summer of Code 2021</a> <b>@openSUSE</b>.</span>'
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
      });
      expanderFrame.grid._row = 0;
      expanderFrame.add(expanderFrame.grid);

      let expander = new Gtk.Expander({
        use_markup: true,
        child: expanderFrame,
        expanded: true,
        label: "<b>💡" + _("Help") + "</b>",
      });
      frame.grid.attach(expander, 0, frame.grid._row++, 1, 1);

      expanderFrame.grid.attach(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            "Here you can set the IBus input window orientation, animation, right click to open menu or switch source, fix candidate box to not follow caret position, font, ASCII mode auto-switch when windows are switched by users, and also re-position candidate by dragging when input."
          ),
        }),
        0,
        expanderFrame.grid._row++,
        1,
        1
      );
      expanderFrame.grid.attach(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            '<span size="small"><b>Note:</b> If <b>fix candidate box</b> is enabled, you can set the candidate box position with 9 options. Recommend to <b>enable drag to re-position candidate</b> at the same time so that you can rearrange the position at any time, and remember candidate position forever after reposition if you set to <b>remember last position</b>, and restore at next login.</span>'
          ),
        }),
        0,
        expanderFrame.grid._row++,
        1,
        1
      );
      expanderFrame.grid.attach(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            "<span size=\"small\"><b>Note:</b> If <b>auto switch ASCII mode</b> is enabled, and you have set to <b>Remember Input State</b>, every opened APP's input mode will be remembered if you have switched the input source manually in the APP's window, and the newly-opened APP will follow the configuration. APP's Input State will be remembered forever.</span>"
          ),
        }),
        0,
        expanderFrame.grid._row++,
        1,
        1
      );
      expanderFrame.grid.attach(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            '<span size="small"><b>Note:</b> If you <b>enable drag to re-position candidate</b>, and if <b>fix candidate box</b> is enabled, your rearranged position will last until the end of this session. If not the rearranged position will only last for the specific input.</span>'
          ),
        }),
        0,
        expanderFrame.grid._row++,
        1,
        1
      );
    }

    _trayHelpPage(frame) {
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
      });
      expanderFrame.grid._row = 0;
      expanderFrame.add(expanderFrame.grid);

      let expander = new Gtk.Expander({
        use_markup: true,
        child: expanderFrame,
        expanded: true,
        label: "<b>💡" + _("Help") + "</b>",
      });
      frame.grid.attach(expander, 0, frame.grid._row++, 1, 1);

      expanderFrame.grid.attach(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            "Here you can set to show IBus tray icon, enable directly switch source with click, add additional menu entries to IBus input source indicator menu at system tray to restore the feelings on Non-GNOME desktop environment. You can also start or restart IBus by pressing the top button."
          ),
        }),
        0,
        expanderFrame.grid._row++,
        1,
        1
      );

      expanderFrame.grid.attach(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            '<span size="small"><b>Note:</b> If <b>Directly switch source with click</b> is enabled, when the left key is selected, if you click the tray icon with left key, you will have input source switched, and click right key will open the menu as normal, vice versa.</span>'
          ),
        }),
        0,
        expanderFrame.grid._row++,
        1,
        1
      );
    }

    _indicatorHelpPage(frame) {
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
      });
      expanderFrame.grid._row = 0;
      expanderFrame.add(expanderFrame.grid);

      let expander = new Gtk.Expander({
        use_markup: true,
        child: expanderFrame,
        expanded: true,
        label: "<b>💡" + _("Help") + "</b>",
      });
      frame.grid.attach(expander, 0, frame.grid._row++, 1, 1);

      expanderFrame.grid.attach(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            "Here you can set to show input source indicator, default is to show indicator everytime you type, move caret or switch input source. You can set to show indicator only when switching input source. You can also set to only notify in ASCII mode, mouse right click to close indicator, popup animation, mouse left click to switch input source or drag to move indicator, enable autohide and auto hide timeout (in seconds)."
          ),
        }),
        0,
        expanderFrame.grid._row++,
        1,
        1
      );
    }

    _themeHelpPage(frame) {
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
      });
      expanderFrame.grid._row = 0;
      expanderFrame.add(expanderFrame.grid);

      let expander = new Gtk.Expander({
        use_markup: true,
        child: expanderFrame,
        expanded: true,
        label: "<b>💡" + _("Help") + "</b>",
      });
      frame.grid.attach(expander, 0, frame.grid._row++, 1, 1);

      expanderFrame.grid.attach(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            'Support importing stylesheet generated by <a href="https://github.com/HollowMan6/IBus-Theme">IBus Theme Tool</a> or provided by <a href="https://github.com/HollowMan6/IBus-Theme-Hub">IBus Theme Hub</a>.'
          ),
        }),
        0,
        expanderFrame.grid._row++,
        1,
        1
      );
      expanderFrame.grid.attach(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            "When light theme and dark theme are turned on at the same time, the IBus theme will automatically follow GNOME Night Light mode, use light theme when off, and use dark theme when on. When only one of the light theme and dark theme is turned on, the IBus theme will always use the theme that is turned on."
          ),
        }),
        0,
        expanderFrame.grid._row++,
        1,
        1
      );
      expanderFrame.grid.attach(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            '<span size="small"><b><i>Warning:</i> If not for debugging, please DO NOT add any classes that\'s not started with <i>.candidate-*</i> into IBus stylesheet to prevent from disturbing system themes.</b></span>'
          ),
        }),
        0,
        expanderFrame.grid._row++,
        1,
        1
      );
      expanderFrame.grid.attach(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            '<span size="small"><b>Note:</b> If your IBus stylesheet has changed after application, please close and reopen the corresponding <b>custom IME theme</b> to make it effective.</span>'
          ),
        }),
        0,
        expanderFrame.grid._row++,
        1,
        1
      );
    }

    _bgHelpPage(frame) {
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
      });
      expanderFrame.grid._row = 0;
      expanderFrame.add(expanderFrame.grid);

      let expander = new Gtk.Expander({
        use_markup: true,
        child: expanderFrame,
        expanded: true,
        label: "<b>💡" + _("Help") + "</b>",
      });
      frame.grid.attach(expander, 0, frame.grid._row++, 1, 1);

      expanderFrame.grid.attach(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            "Support customizing your IBus Input window background with a picture. It has a higher priority than theme defined background."
          ),
        }),
        0,
        expanderFrame.grid._row++,
        1,
        1
      );
      expanderFrame.grid.attach(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            "When light background and dark background are turned on at the same time, the IBus background will automatically follow GNOME Night Light mode, use light background when off, and use dark background when on. When only one of the light background and dark background is turned on, the IBus background will always use the background that is turned on."
          ),
        }),
        0,
        expanderFrame.grid._row++,
        1,
        1
      );
      expanderFrame.grid.attach(
        new Gtk.Label({
          use_markup: true,
          wrap: true,
          label: _(
            '<span size="small"><b>Note:</b> Please make sure your background picture can always be visited. If your pictures are stored in the removable device and the system doesn\'t mount it by default, please close and reopen the corresponding <b>Use custom background</b> to make it effective after manually mounting.</span>'
          ),
        }),
        0,
        expanderFrame.grid._row++,
        1,
        1
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

    on_destroy() {
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
