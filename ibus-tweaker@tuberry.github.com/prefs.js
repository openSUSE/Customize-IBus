// vim:fdm=syntax
// by:tuberry@github
//
const {Gio, Gtk, GObject} = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = ExtensionUtils.getSettings && ExtensionUtils.initTranslations ? ExtensionUtils : Me.imports.convenience;
const _ = imports.gettext.domain(Me.metadata['gettext-domain']).gettext;

const gsettings = Convenience.getSettings();
const ibusGsettings = new Gio.Settings({ schema_id: 'org.freedesktop.ibus.panel' });

const Fields = {
    ENABLEHOTKEY: 'enable-hotkey',
    AUTOSWITCH: 'enable-auto-switch',
    ASCIIONLIST: 'ascii-on-list',
    ASCIIOFFLIST: 'ascii-off-list',
    ASCIIMODE: 'ascii-mode',
    ACTIVITIES: 'activities',
    SHORTCUT: 'run-dialog',
};

function buildPrefsWidget() {
    return new IBusTweaker();
}

function init() {
    Convenience.initTranslations();
}

const IBusTweaker = GObject.registerClass(
class IBusTweaker extends Gtk.Grid {
    _init() {
        super._init({
            margin: 10,
            row_spacing: 12,
            column_spacing: 18,
            column_homogeneous: false,
            row_homogeneous: false,
        });

        this._bulidWidget();
        this._bulidUI();
        this._bindValues();
        this._syncStatus();
        this.show_all();
    }

    _bulidWidget() {
        this._feild_activities = new Gtk.Switch();
        this._feild_enable_shortcut = new Gtk.Switch();
        this._feild_enable_ascii = new Gtk.Switch();

        this._feild_ascii_on = this._entryMaker('Gnome-shell', _('ascii mode on'));
        this._feild_ascii_off = this._entryMaker('Gedit', _('ascii mode off'));

        let fontName = ibusGsettings.get_boolean('use-custom-font') ? ibusGsettings.get_string('custom-font') : "Sans 16";
        this._feild_font_button = new Gtk.FontButton({ font_name: fontName });
        this._feild_font_button.connect('font-set', (widget) => {
            ibusGsettings.set_boolean('use-custom-font', true);
            ibusGsettings.set_string('custom-font', widget.font_name);
        });

        this._feild_run_dialog = this._shortCutMaker(Fields.SHORTCUT);

        this._feild_enable_shortcut.connect('notify::active', widget => {
            this._feild_run_dialog.set_sensitive(widget.active);
        });
        this._feild_enable_ascii.connect('notify::active', widget => {
            this._feild_ascii_on.set_sensitive(widget.active);
            this._feild_ascii_off.set_sensitive(widget.active);
        });
    }

    _bulidUI() {
        this._row = 0;
        const hseparator = () => new Gtk.HSeparator({margin_bottom: 5, margin_top: 5});
        this._addRow(this._feild_enable_ascii, this._labelMaker(_('Auto switch ascii mode')));
        this._addRow(this._feild_ascii_on, null);
        this._addRow(this._feild_ascii_off, null);
        this._addRow(hseparator(), null);
        this._addRow(this._feild_enable_shortcut, this._labelMaker(_('Enable short cut')));
        this._addRow(this._feild_run_dialog, this._labelMaker(_('Run dialog')));
        this._addRow(hseparator(), null);
        this._addRow(this._feild_font_button, this._labelMaker(_('IBus candidate font')));
        this._addRow(this._feild_activities, this._labelMaker(_('Hide Activities')));
    }

    _syncStatus() {
        this._feild_run_dialog.set_sensitive(this._feild_enable_shortcut.get_state());
        this._feild_ascii_on.set_sensitive(this._feild_enable_ascii.get_state());
        this._feild_ascii_off.set_sensitive(this._feild_enable_ascii.get_state());
    }

    _bindValues() {
        gsettings.bind(Fields.ACTIVITIES,   this._feild_activities,      'active', Gio.SettingsBindFlags.DEFAULT);
        gsettings.bind(Fields.ENABLEHOTKEY, this._feild_enable_shortcut, 'active', Gio.SettingsBindFlags.DEFAULT);
        gsettings.bind(Fields.AUTOSWITCH,   this._feild_enable_ascii,    'active', Gio.SettingsBindFlags.DEFAULT);
        gsettings.bind(Fields.ASCIIONLIST,  this._feild_ascii_on,        'text',   Gio.SettingsBindFlags.DEFAULT);
        gsettings.bind(Fields.ASCIIOFFLIST, this._feild_ascii_off,       'text',   Gio.SettingsBindFlags.DEFAULT);
    }

    _entryMaker(x, y) {
        return new Gtk.Entry({
            hexpand: true,
            placeholder_text: x,
            secondary_icon_name: "dialog-information-symbolic",
            secondary_icon_tooltip_text: y,
            secondary_icon_activatable: true,
            secondary_icon_sensitive: true
        });
    }

    _labelMaker(x) {
        return new Gtk.Label({
            label: x,
            hexpand: true,
            halign: Gtk.Align.START
        });
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

        // let column = new Gtk.TreeViewColumn({title: _("Key")});
        let column = new Gtk.TreeViewColumn({});
        column.pack_start(accelerator, false);
        column.add_attribute(accelerator, 'accel-mods', 0);
        column.add_attribute(accelerator, 'accel-key', 1);
        treeView.append_column(column);

        return treeView;
    }

    _addRow(input, label) {
        let widget = input;
        if (input instanceof Gtk.Switch) {
            widget = new Gtk.HBox();
            widget.pack_end(input, false, false, 0);
        }
        if (label) {
            this.attach(label, 0, this._row, 1, 1);
            this.attach(widget, 1, this._row, 1, 1);
        }
        else {
            this.attach(widget, 0, this._row, 2, 1);
        }
        this._row++;
    }
});

