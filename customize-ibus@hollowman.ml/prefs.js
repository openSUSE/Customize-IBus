// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-
// vim:fdm=syntax
// by:hollowman6@github tuberry@github

"use strict";

const { Gio, Gtk, GObject, GLib } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const _ = imports.gettext.domain(Me.metadata["gettext-domain"]).gettext;

const gsettings = ExtensionUtils.getSettings();
const ibusGsettings = new Gio.Settings({
  schema_id: "org.freedesktop.ibus.panel",
});

var Fields = {
  ASCIIMODE: "ascii-mode",
  CUSTOMFONT: "custom-font",
  CUSTOMBG: "custom-bg",
  UPDATESDIR: "updates-dir",
  CHECKUPDATES: "check-updates",
  INPUTONLIST: "input-on-list",
  ENABLEUPDATES: "enable-updates",
  INPUTOFFLIST: "input-off-list",
  CUSTOMTHEME: "custom-theme",
  ENABLECUSTOMTHEME: "enable-custom-theme",
  INPUTLIST: "input-mode-list",
  USECUSTOMFONT: "use-custom-font",
  USECUSTOMBG: "use-custom-bg",
  AUTOSWITCH: "enable-auto-switch",
  ENABLEORIEN: "enable-orientation",
  UNKNOWNSTATE: "unkown-ascii-state",
  ORIENTATION: "candidate-orientation",
};

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
      this._field_enable_custom_theme = this._checkMaker(_("Custom IME theme"));
      this._field_use_custom_font = this._checkMaker(_("Use custom font"));
      this._field_use_custom_bg = this._checkMaker(_("Use custom background"));
      this._field_enable_ascii = this._checkMaker(_("Auto switch ASCII mode"));
      this._field_enable_orien = this._checkMaker(_("Candidates orientation"));

      this._field_orientation = this._comboMaker([
        _("Vertical"),
        _("Horizontal"),
      ]);
      this._field_unkown_state = this._comboMaker([
        _("On"),
        _("Off"),
        _("Default"),
      ]);
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
      this._fileChooser.connect("response", (dlg, response) => {
        if (response !== Gtk.ResponseType.ACCEPT) return;
        gsettings.set_string("custom-bg", dlg.get_file().get_path());
      });

      this._logoPicker = new Gtk.Button({
        label: _("(None)"),
      });
      this._logoPicker.connect("clicked", () => {
        this._fileChooser.transient_for = this.get_toplevel();
        this._fileChooser.show();
      });
      gsettings.connect(
        "changed::custom-bg",
        this._updateLogoPicker.bind(this)
      );
      this._updateLogoPicker();

      const cssFilter = new Gtk.FileFilter();
      cssFilter.add_pattern("*.css");
      this._cssFileChooser = new Gtk.FileChooserNative({
        title: _("Select an IBus Stylesheet"),
        filter: cssFilter,
        modal: true,
      });
      this._cssFileChooser.connect("response", (dlg, response) => {
        if (response !== Gtk.ResponseType.ACCEPT) return;
        gsettings.set_string("custom-theme", dlg.get_file().get_path());
      });

      this._cssPicker = new Gtk.Button({
        label: _("(None)"),
      });
      this._cssPicker.connect("clicked", () => {
        this._cssFileChooser.transient_for = this.get_root();
        this._cssFileChooser.show();
      });
      gsettings.connect(
        "changed::custom-theme",
        this._updateCssPicker.bind(this)
      );
      this._updateCssPicker();
    }

    _updateLogoPicker() {
      const filename = gsettings.get_string("custom-bg");
      this._logoPicker.label = GLib.basename(filename);
    }

    _updateCssPicker() {
      const filename = gsettings.get_string("custom-theme");
      this._cssPicker.label = GLib.basename(filename);
    }

    _bulidUI() {
      this._box = new Gtk.Box({
        margin: 30,
        orientation: Gtk.Orientation.VERTICAL,
      });
      this.add(this._box);

      this._ibus = this._listFrameMaker(_("Customize IBus"));
      this._ibus._add(this._field_enable_orien, this._field_orientation);
      this._ibus._add(this._field_use_custom_font, this._field_custom_font);
      this._ibus._add(this._field_enable_ascii, this._field_unkown_state);
      this._ibus._add(this._field_use_custom_bg, this._logoPicker);
      this._ibus._add(this._field_enable_custom_theme, this._cssPicker);
    }

    _syncStatus() {
      this._field_enable_ascii.connect("notify::active", (widget) => {
        this._field_unkown_state.set_sensitive(widget.active);
      });
      this._field_enable_orien.connect("notify::active", (widget) => {
        this._field_orientation.set_sensitive(widget.active);
      });
      this._field_use_custom_font.connect("notify::active", (widget) => {
        this._field_custom_font.set_sensitive(widget.active);
        ibusGsettings.set_boolean("use-custom-font", widget.active);
      });
      this._field_use_custom_bg.connect("notify::active", (widget) => {
        this._logoPicker.set_sensitive(widget.active);
        ibusGsettings.set_boolean("use-custom-bg", widget.active);
      });
      this._field_enable_custom_theme.connect("notify::active", (widget) => {
        this._cssPicker.set_sensitive(widget.active);
        ibusGsettings.set_boolean("enable-custom-theme", widget.active);
      });
      this._field_custom_font.connect("font-set", (widget) => {
        ibusGsettings.set_string("custom-font", widget.font_name);
        gsettings.set_string(Fields.CUSTOMFONT, widget.font_name);
      });

      this._field_unkown_state.set_sensitive(this._field_enable_ascii.active);
      this._field_orientation.set_sensitive(this._field_enable_orien.active);
      this._field_custom_font.set_sensitive(this._field_use_custom_font.active);
      this._logoPicker.set_sensitive(this._field_use_custom_bg.active);
      this._cssPicker.set_sensitive(this._field_enable_custom_theme.active);
    }

    _bindValues() {
      gsettings.bind(
        Fields.AUTOSWITCH,
        this._field_enable_ascii,
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
        Fields.UNKNOWNSTATE,
        this._field_unkown_state,
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
        Fields.USECUSTOMFONT,
        this._field_use_custom_font,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
    }

    _listFrameMaker(lbl, margin_top) {
      let frame = new Gtk.Frame({
        label_yalign: 1,
      });
      frame.set_label_widget(
        new Gtk.Label({
          use_markup: true,
          margin_top: margin_top ? margin_top : 0,
          label: "<b><big>" + lbl + "</big></b>",
        })
      );
      this._box.add(frame);

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
      frame._add = (x, y) => {
        const hbox = new Gtk.Box();
        hbox.pack_start(x, true, true, 4);
        if (y) hbox.pack_start(y, false, false, 4);
        frame.grid.attach(hbox, 0, frame.grid._row++, 1, 1);
      };
      return frame;
    }

    _labelMaker(x) {
      return new Gtk.Label({
        label: x,
        hexpand: true,
        halign: Gtk.Align.START,
      });
    }

    _checkMaker(x) {
      return new Gtk.CheckButton({
        label: x,
        hexpand: true,
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
      if (this._cssFileChooser) this._cssFileChooser.destroy();
      this._cssFileChooser = null;
    }
  }
);
