// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-
// vim:fdm=syntax
// by:hollowman6@github tuberry@github

"use strict";

const { Gio, Gtk, GObject, GLib } = imports.gi;

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
        font: gsettings.get_string(Fields.CUSTOMFONT),
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

    _bulidUI() {
      this._box = new Gtk.Box({
        margin_start: 30,
        margin_end: 30,
        margin_top: 30,
        margin_bottom: 30,
        orientation: Gtk.Orientation.VERTICAL,
      });
      this.set_child(this._box);

      this._ibus_basic = this._listFrameMaker(_("Basic"));
      this._ibus_basic._add(this._field_enable_orien, this._field_orientation);
      this._ibus_basic._add(
        this._field_use_custom_font,
        this._field_custom_font
      );
      this._ibus_basic._add(this._field_enable_ascii, this._field_unkown_state);

      this._ibus_bg = this._listFrameMaker(_("Background"));
      this._ibus_bg._add(this._field_use_custom_bg, this._logoPicker);
      this._ibus_bg._add(this._field_use_custom_bg_dark, this._logoDarkPicker);

      this._ibus_theme = this._listFrameMaker(_("Theme"));
      this._ibus_theme._add(this._field_enable_custom_theme, this._cssPicker);
      this._ibus_theme._add(
        this._field_enable_custom_theme_dark,
        this._cssDarkPicker
      );
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
        ibusGsettings.set_boolean(Fields.USECUSTOMFONT, widget.active);
      });
      this._field_use_custom_bg.connect("notify::active", (widget) => {
        this._logoPicker.set_sensitive(widget.active);
        ibusGsettings.set_boolean(Fields.USECUSTOMBG, widget.active);
      });
      this._field_use_custom_bg_dark.connect("notify::active", (widget) => {
        this._logoDarkPicker.set_sensitive(widget.active);
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
        this._fileChooser.transient_for = this.get_root();
        this._fileChooser.show();
      });
      this._fileDarkChooser.connect("response", (dlg, response) => {
        if (response !== Gtk.ResponseType.ACCEPT) return;
        gsettings.set_string(Fields.CUSTOMBGDARK, dlg.get_file().get_path());
      });
      this._logoDarkPicker.connect("clicked", () => {
        this._fileDarkChooser.transient_for = this.get_root();
        this._fileDarkChooser.show();
      });
      this._cssFileChooser.connect("response", (dlg, response) => {
        if (response !== Gtk.ResponseType.ACCEPT) return;
        gsettings.set_string(Fields.CUSTOMTHEME, dlg.get_file().get_path());
      });
      this._cssPicker.connect("clicked", () => {
        this._cssFileChooser.transient_for = this.get_root();
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
        this._cssDarkFileChooser.transient_for = this.get_root();
        this._cssDarkFileChooser.show();
      });

      this._field_unkown_state.set_sensitive(this._field_enable_ascii.active);
      this._field_orientation.set_sensitive(this._field_enable_orien.active);
      this._field_custom_font.set_sensitive(this._field_use_custom_font.active);
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
        Fields.CUSTOMFONT,
        this._field_custom_font,
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
    }

    _listFrameMaker(lbl, margin_top) {
      let frame = new Gtk.Frame({
        margin_top: 30,
      });
      frame.set_label_widget(
        new Gtk.Label({
          use_markup: true,
          margin_top: margin_top ? margin_top : 0,
          label: "<b><big>" + lbl + "</big></b>",
        })
      );
      this._box.append(frame);

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
      frame.set_child(frame.grid);
      frame._add = (x, y) => {
        const hbox = new Gtk.Box();
        hbox.set_spacing(4);
        hbox.append(x);
        if (y) hbox.append(y);
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
      if (this._fileDarkChooser) this._fileDarkChooser.destroy();
      this._fileDarkChooser = null;
      if (this._cssFileChooser) this._cssFileChooser.destroy();
      this._cssFileChooser = null;
      if (this._cssDarkFileChooser) this._cssDarkFileChooser.destroy();
      this._cssDarkFileChooser = null;
    }
  }
);
