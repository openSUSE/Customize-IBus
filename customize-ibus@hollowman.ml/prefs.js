// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-
// vim:fdm=syntax
// by:hollowman6@github tuberry@github

// we use async/here to not block the mainloop, not to parallelize

"use strict";

const { Gio, Gtk, GObject, GLib } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const _ = imports.gettext.domain(Me.metadata["gettext-domain"]).gettext;

const Util = Me.imports.util;

Gio._promisify(
  Gio._LocalFilePrototype,
  "enumerate_children_async",
  "enumerate_children_finish"
);
Gio._promisify(
  Gio._LocalFilePrototype,
  "query_info_async",
  "query_info_finish"
);
Gio._promisify(
  Gio.FileEnumerator.prototype,
  "next_files_async",
  "next_files_finish"
);

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
  CUSTOMTHEME: "name",
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
        font: gsettings.get_string(Fields.CUSTOMFONT),
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
        this._fileChooser.transient_for = this.get_root();
        this._fileChooser.show();
      });
      gsettings.connect(
        "changed::custom-bg",
        this._updateLogoPicker.bind(this)
      );
      this._updateLogoPicker();
    }

    _updateLogoPicker() {
      const filename = gsettings.get_string("custom-bg");
      this._logoPicker.label = GLib.basename(filename);
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
      this._field_theme_color = new Gtk.ListBox({
        selection_mode: Gtk.SelectionMode.NONE,
      });
      this._field_theme_color.get_style_context().add_class("frame");

      this._actionGroup = new Gio.SimpleActionGroup();
      this._field_theme_color.insert_action_group("theme", this._actionGroup);

      this._settings = ExtensionUtils.getSettings();
      this._actionGroup.add_action(this._settings.create_action("name"));

      this.connect("destroy", () => this._settings.run_dispose());

      this._rows = new Map();
      this._addTheme("");

      this._collectThemes();
      this._ibus = this._listFrameMaker(_("Customize IBus"));
      this._ibus._add(this._field_enable_orien, this._field_orientation);
      this._ibus._add(this._field_use_custom_font, this._field_custom_font);
      this._ibus._add(this._field_enable_ascii, this._field_unkown_state);
      this._ibus._add(this._field_use_custom_bg, this._logoPicker);
      this._ibus._add(this._field_enable_custom_theme);
      this._box.append(this._field_theme_color);
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
        this._field_theme_color.set_sensitive(widget.active);
      });

      this._field_unkown_state.set_sensitive(this._field_enable_ascii.active);
      this._field_orientation.set_sensitive(this._field_enable_orien.active);
      this._field_custom_font.set_sensitive(this._field_use_custom_font.active);
      this._logoPicker.set_sensitive(this._field_use_custom_bg.active);
      this._field_theme_color.set_sensitive(
        this._field_enable_custom_theme.active
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
        Fields.ENABLEORIEN,
        this._field_enable_orien,
        "active",
        Gio.SettingsBindFlags.DEFAULT
      );
      gsettings.bind(
        Fields.CUSTOMTHEME,
        this._field_theme_color,
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
    }

    _listFrameMaker(lbl, margin_top) {
      let frame = new Gtk.Frame();
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

    async _collectThemes() {
      for (const dirName of Util.getThemeDirs()) {
        const dir = Gio.File.new_for_path(dirName);
        for (const name of await this._enumerateDir(dir)) {
          if (this._rows.has(name)) continue;

          const file = dir.resolve_relative_path(
            `${name}/gnome-shell/gnome-shell.css`
          );
          try {
            await file.query_info_async(
              Gio.FILE_ATTRIBUTE_STANDARD_NAME,
              Gio.FileQueryInfoFlags.NONE,
              GLib.PRIORITY_DEFAULT,
              null
            );
            this._addTheme(name);
          } catch (e) {
            if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND))
              logError(e);
          }
        }
      }

      for (const dirName of Util.getModeThemeDirs()) {
        const dir = Gio.File.new_for_path(dirName);
        for (const filename of await this._enumerateDir(dir)) {
          if (!filename.endsWith(".css")) continue;

          const name = filename.slice(0, -4);
          if (!this._rows.has(name)) this._addTheme(name);
        }
      }
    }

    _addTheme(name) {
      const row = new iBusThemeRow(name, this._settings);
      this._rows.set(name, row);

      this._field_theme_color.append(row);
    }

    async _enumerateDir(dir) {
      const fileInfos = [];
      let fileEnum;

      try {
        fileEnum = await dir.enumerate_children_async(
          Gio.FILE_ATTRIBUTE_STANDARD_NAME,
          Gio.FileQueryInfoFlags.NONE,
          GLib.PRIORITY_DEFAULT,
          null
        );
      } catch (e) {
        if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND)) logError(e);
        return [];
      }

      let infos;
      do {
        infos = await fileEnum.next_files_async(
          100,
          GLib.PRIORITY_DEFAULT,
          null
        );
        fileInfos.push(...infos);
      } while (infos.length > 0);

      return fileInfos.map((info) => info.get_name());
    }

    on_destroy() {
      if (this._fileChooser) this._fileChooser.destroy();
      this._fileChooser = null;
    }
  }
);

const iBusThemeRow = GObject.registerClass(
  class iBusThemeRow extends Gtk.ListBoxRow {
    _init(name, settings) {
      this._name = name;
      this._settings = settings;

      const box = new Gtk.Box({
        spacing: 12,
        margin_start: 12,
        margin_end: 12,
        margin_top: 12,
        margin_bottom: 12,
      });
      super._init({
        action_name: "theme.name",
        action_target: new GLib.Variant("s", name),
        child: box,
      });

      box.append(
        new Gtk.Label({
          label: name || _("Follow User Theme"),
          hexpand: true,
          xalign: 0,
          max_width_chars: 25,
          width_chars: 25,
        })
      );

      this._checkmark = new Gtk.Image({
        icon_name: "emblem-ok-symbolic",
        pixel_size: 16,
      });
      box.append(this._checkmark);

      const id = this._settings.connect(
        "changed::name",
        this._syncCheckmark.bind(this)
      );
      this._syncCheckmark();

      this.connect("destroy", () => {
        this._settings.disconnect(id);
        this._settings = null;
      });
    }

    _syncCheckmark() {
      const visible = this._name === this._settings.get_string("name");
      this._checkmark.opacity = visible ? 1 : 0;
    }
  }
);