// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-
/* exported init buildPrefsWidget */

// we use async/await here to not block the mainloop, not to parallelize
/* eslint-disable no-await-in-loop */

const { Gio, GLib, GObject, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();
const Util = Me.imports.util;

Gio._promisify(Gio._LocalFilePrototype,
    'enumerate_children_async', 'enumerate_children_finish');
Gio._promisify(Gio._LocalFilePrototype,
    'query_info_async', 'query_info_finish');
Gio._promisify(Gio.FileEnumerator.prototype,
    'next_files_async', 'next_files_finish');

const IBusUserThemePrefsWidget = GObject.registerClass(
class IBusUserThemePrefsWidget extends Gtk.ScrolledWindow {
    _init() {
        super._init({
            hscrollbar_policy: Gtk.PolicyType.NEVER,
        });

        const box = new Gtk.Box();
        this.add(box);

        this._list = new Gtk.ListBox({
            selection_mode: Gtk.SelectionMode.NONE,
            halign: Gtk.Align.CENTER,
            valign: Gtk.Align.START,
            hexpand: true,
            margin: 60,
        });
        this._list.get_style_context().add_class('frame');
        this._list.set_header_func(this._updateHeader.bind(this));
        box.add(this._list);

        this._actionGroup = new Gio.SimpleActionGroup();
        this._list.insert_action_group('theme', this._actionGroup);

        this._settings = ExtensionUtils.getSettings();
        this._actionGroup.add_action(
            this._settings.create_action('name'));

        this.connect('destroy', () => this._settings.run_dispose());

        this._rows = new Map();
        this._addTheme(''); // default

        this._collectThemes();
    }

    async _collectThemes() {
        for (const dirName of Util.getThemeDirs()) {
            const dir = Gio.File.new_for_path(dirName);
            for (const name of await this._enumerateDir(dir)) {
                if (this._rows.has(name))
                    continue;

                const file = dir.resolve_relative_path(
                    `${name}/gnome-shell/gnome-shell.css`);
                try {
                    await file.query_info_async(
                        Gio.FILE_ATTRIBUTE_STANDARD_NAME,
                        Gio.FileQueryInfoFlags.NONE,
                        GLib.PRIORITY_DEFAULT, null);
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
                if (!filename.endsWith('.css'))
                    continue;

                const name = filename.slice(0, -4);
                if (!this._rows.has(name))
                    this._addTheme(name);
            }
        }
    }

    _addTheme(name) {
        const row = new iBusThemeRow(name);
        this._rows.set(name, row);

        this._list.add(row);
        row.show_all();
    }

    async _enumerateDir(dir) {
        const fileInfos = [];
        let fileEnum;

        try {
            fileEnum = await dir.enumerate_children_async(
                Gio.FILE_ATTRIBUTE_STANDARD_NAME,
                Gio.FileQueryInfoFlags.NONE,
                GLib.PRIORITY_DEFAULT, null);
        } catch (e) {
            if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND))
                logError(e);
            return [];
        }

        let infos;
        do {
            infos = await fileEnum.next_files_async(100,
                GLib.PRIORITY_DEFAULT, null);
            fileInfos.push(...infos);
        } while (infos.length > 0);

        return fileInfos.map(info => info.get_name());
    }

    _updateHeader(row, before) {
        if (!before || row.get_header())
            return;
        row.set_header(new Gtk.Separator());
    }
});

const iBusThemeRow = GObject.registerClass(
class iBusThemeRow extends Gtk.ListBoxRow {
    _init(name) {
        this._name = new GLib.Variant('s', name);

        super._init({
            action_name: 'theme.name',
            action_target: this._name,
        });

        const box = new Gtk.Box({
            spacing: 12,
            margin: 12,
        });
        this.add(box);

        box.add(new Gtk.Label({
            label: name || 'Default',
            hexpand: true,
            xalign: 0,
            max_width_chars: 25,
            width_chars: 25,
        }));

        this._checkmark = new Gtk.Image({
            icon_name: 'emblem-ok-symbolic',
            pixel_size: 16,
        });
        box.add(this._checkmark);

        box.show_all();

        const id = this.connect('parent-set', () => {
            this.disconnect(id);

            const actionGroup = this.get_action_group('theme');
            actionGroup.connect('action-state-changed::name',
                this._syncCheckmark.bind(this));
            this._syncCheckmark();
        });
    }

    _syncCheckmark() {
        const actionGroup = this.get_action_group('theme');
        const state = actionGroup.get_action_state('name');
        this._checkmark.opacity = this._name.equal(state);
    }
});

function init() {
}

function buildPrefsWidget() {
    let widget = new IBusUserThemePrefsWidget();
    widget.show_all();

    return widget;
}
