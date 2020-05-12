// vim:fdm=syntax
// by:tuberry@github
//
const { Gio, Gtk, GObject } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const _ = imports.gettext.domain(Me.metadata['gettext-domain']).gettext;

const gsettings = ExtensionUtils.getSettings();
const ibusGsettings = new Gio.Settings({ schema_id: 'org.freedesktop.ibus.panel' });

var Fields = {
    ACTIVITIES:    'activities',
    ASCIIMODE:     'ascii-mode',
    SHORTCUT:      'run-dialog',
    CUSTOMFONT:    'custom-font',
    ASCIIONLIST:   'ascii-on-list',
    ENABLEHOTKEY:  'enable-hotkey',
    ASCIIOFFLIST:  'ascii-off-list',
    MINIMIZED:     'hide-minimized',
    MSTHEMECOLOUR: 'ms-theme-color',
    ENABLEMSTHEME: 'enable-ms-theme',
    USECUSTOMFONT: 'use-custom-font',
    AUTOSWITCH:    'enable-auto-switch',
    ENABLEORIEN:   'enable-orientation',
    ORIENTATION:   'candidate-orientation',
};

function buildPrefsWidget() {
    return new IBusTweaker();
}

function init() {
    ExtensionUtils.initTranslations();
}

const IBusTweaker = GObject.registerClass(
class IBusTweaker extends Gtk.ScrolledWindow {
    _init() {
        super._init({
            hscrollbar_policy: Gtk.PolicyType.NEVER,
        });

        this._palatte = [_('Red'), _('Green'), _('Orange'), _('Blue'), _('Purple'), _('Turquoise'), _('Grey')];
        this._bulidWidget();
        this._bulidUI();
        this._bindValues();
        this._syncStatus();
        this.show_all();
    }

    _bulidWidget() {
        this._field_activities      = new Gtk.CheckButton({ active: gsettings.get_boolean(Fields.ACTIVITIES) });
        this._field_enable_ascii    = new Gtk.CheckButton({ active: gsettings.get_boolean(Fields.AUTOSWITCH) });
        this._field_minimized       = new Gtk.CheckButton({ active: gsettings.get_boolean(Fields.ACTIVITIES) });
        this._field_custom_font     = new Gtk.FontButton({ font_name: gsettings.get_string(Fields.CUSTOMFONT) });
        this._field_enable_orien    = new Gtk.CheckButton({ active: gsettings.get_boolean(Fields.ENABLEORIEN) });
        this._field_enable_hotkey   = new Gtk.CheckButton({ active: gsettings.get_boolean(Fields.ENABLEHOTKEY) });
        this._field_enable_ms_theme = new Gtk.CheckButton({ active: gsettings.get_boolean(Fields.ENABLEMSTHEME) });
        this._field_use_custom_font = new Gtk.CheckButton({ active: gsettings.get_boolean(Fields.USECUSTOMFONT) });

        this._field_theme_color = this._comboMaker(this._palatte);
        this._field_run_dialog  = this._shortCutMaker(Fields.SHORTCUT);
        this._field_orientation = this._comboMaker([_('Vertical'), _('Horizontal')])
        this._field_ascii_off   = this._entryMaker('Gedit', _('ascii mode off when initializing'));
        this._field_ascii_on    = this._entryMaker('Gnome-shell', _('ascii mode on when initializing'));
    }

    _bulidUI() {
        this._box = new Gtk.Box({
            margin_left: 30,
            margin_right: 30,
            orientation: Gtk.Orientation.VERTICAL,
        });
        this.add(this._box);
        this._ibus = this._listFrameMaker(_('IBus'));
        this._ibus._add(this._field_enable_hotkey,   _('Run dialog'),               this._field_run_dialog);
        this._ibus._add(this._field_enable_ms_theme, _('MS IME theme'),             this._field_theme_color);
        this._ibus._add(this._field_enable_orien,    _('Candidates orientation'),   this._field_orientation);
        this._ibus._add(this._field_use_custom_font, _('Use custom font'),          this._field_custom_font);
        this._ibus._add(this._field_enable_ascii,    _('Auto switch ASCII mode'));
        this._ibus._add(this._field_ascii_on);
        this._ibus._add(this._field_ascii_off);

        this._others = this._listFrameMaker(_('Others'));
        this._others._add(this._field_activities,      _('Hide Activities'));
        this._others._add(this._field_minimized,       _('Hide minimized in AltTab'));
    }

    _syncStatus() {
        this._field_enable_hotkey.connect('notify::active', widget => {
            this._field_run_dialog.set_sensitive(widget.active);
        });
        this._field_enable_ascii.connect('notify::active', widget => {
            this._field_ascii_on.set_sensitive(widget.active);
            this._field_ascii_off.set_sensitive(widget.active);
        });
        this._field_enable_orien.connect('notify::active', widget => {
            this._field_orientation.set_sensitive(widget.active);
        });
        this._field_use_custom_font.connect('notify::active', widget => {
            this._field_custom_font.set_sensitive(widget.active);
            ibusGsettings.set_boolean('use-custom-font', widget.active);
        });
        this._field_enable_ms_theme.connect('notify::active', widget => {
            this._field_theme_color.set_sensitive(widget.active);
        });
        this._field_custom_font.connect('font-set', widget => {
            ibusGsettings.set_string('custom-font', widget.font_name);
            gsettings.set_string(Fields.CUSTOMFONT, widget.font_name);
        });

        this._field_ascii_on.set_sensitive(this._field_enable_ascii.active);
        this._field_ascii_off.set_sensitive(this._field_enable_ascii.active);
        this._field_orientation.set_sensitive(this._field_enable_orien.active);
        this._field_run_dialog.set_sensitive(this._field_enable_hotkey.active);
        this._field_custom_font.set_sensitive(this._field_use_custom_font.active);
        this._field_theme_color.set_sensitive(this._field_enable_ms_theme.active);
    }

    _bindValues() {
        gsettings.bind(Fields.ACTIVITIES,    this._field_activities,      'active', Gio.SettingsBindFlags.DEFAULT);
        gsettings.bind(Fields.MINIMIZED,     this._field_minimized,       'active', Gio.SettingsBindFlags.DEFAULT);
        gsettings.bind(Fields.ASCIIOFFLIST,  this._field_ascii_off,       'text',   Gio.SettingsBindFlags.DEFAULT);
        gsettings.bind(Fields.ASCIIONLIST,   this._field_ascii_on,        'text',   Gio.SettingsBindFlags.DEFAULT);
        gsettings.bind(Fields.AUTOSWITCH,    this._field_enable_ascii,    'active', Gio.SettingsBindFlags.DEFAULT);
        gsettings.bind(Fields.ENABLEHOTKEY,  this._field_enable_hotkey,   'active', Gio.SettingsBindFlags.DEFAULT);
        gsettings.bind(Fields.ENABLEORIEN,   this._field_enable_orien,    'active', Gio.SettingsBindFlags.DEFAULT);
        gsettings.bind(Fields.ORIENTATION,   this._field_orientation,     'active', Gio.SettingsBindFlags.DEFAULT);
        gsettings.bind(Fields.USECUSTOMFONT, this._field_use_custom_font, 'active', Gio.SettingsBindFlags.DEFAULT);
        gsettings.bind(Fields.ENABLEMSTHEME, this._field_enable_ms_theme, 'active', Gio.SettingsBindFlags.DEFAULT);
        gsettings.bind(Fields.MSTHEMECOLOUR, this._field_theme_color,     'active', Gio.SettingsBindFlags.DEFAULT);
    }

    _listFrameMaker(lbl) {
        let frame = new Gtk.Frame({
            label_yalign: 1,
        });
        frame.set_label_widget(new Gtk.Label({
            use_markup: true,
            margin_top: 30,
            label: "<b><big>" + lbl + "</big></b>",
        }));
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
        frame._add = (x, y, z) => {
            const hbox = new Gtk.Box();
            if(z) {
                hbox.pack_start(x, false, false, 4);
                hbox.pack_start(this._labelMaker(y), true, true, 0);
                hbox.pack_start(z, false, false, 4);
            } else if(y) {
                hbox.pack_start(x, false, false, 4);
                hbox.pack_start(this._labelMaker(y), true, true, 4);
            } else {
                hbox.pack_start(x, true, true, 4);
            }
            frame.grid.attach(hbox, 0, frame.grid._row++, 1, 1);
        }
        return frame;
    }

    _entryMaker(x, y) {
        return new Gtk.Entry({
            hexpand: true,
            placeholder_text: x,
            secondary_icon_sensitive: true,
            secondary_icon_tooltip_text: y,
            secondary_icon_activatable: true,
            secondary_icon_name: "dialog-information-symbolic",
        });
    }

    _labelMaker(x) {
        return new Gtk.Label({
            label: x,
            hexpand: true,
            halign: Gtk.Align.START,
        });
    }

    _comboMaker(ops) {
        let l = new Gtk.ListStore();
        l.set_column_types([GObject.TYPE_STRING]);
        ops.map(name => ({name})).forEach((p,i) => l.set(l.append(),[0],[p.name]));
        let c = new Gtk.ComboBox({model: l});
        let r = new Gtk.CellRendererText();
        c.pack_start(r, false);
        c.add_attribute(r, "text", 0);
        return c;
    }

    _shortCutMaker(hotkey) {
        let model = new Gtk.ListStore();
        model.set_column_types([GObject.TYPE_INT, GObject.TYPE_INT]);

        const row = model.insert(0);
        let [key, mods] = Gtk.accelerator_parse(gsettings.get_strv(hotkey)[0]);
        model.set(row, [0, 1], [mods, key]);

        let treeView = new Gtk.TreeView({model: model});
        treeView.set_headers_visible(false)
        let accelerator = new Gtk.CellRendererAccel({
            'editable': true,
            'accel-mode': Gtk.CellRendererAccelMode.GTK
        });

        accelerator.connect('accel-edited', (r, iter, key, mods) => {
            let value = Gtk.accelerator_name(key, mods);
            let [succ, iterator] = model.get_iter_from_string(iter);
            model.set(iterator, [0, 1], [mods, key]);
            if (key != 0) {
                gsettings.set_strv(hotkey, [value]);
            }
        });

        let column = new Gtk.TreeViewColumn({});
        column.pack_start(accelerator, false);
        column.add_attribute(accelerator, 'accel-mods', 0);
        column.add_attribute(accelerator, 'accel-key', 1);
        treeView.append_column(column);

        return treeView;
    }
});

