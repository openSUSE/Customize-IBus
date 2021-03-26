// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-
// Load ibus extension shell theme from ~/.local/share/themes/name/gnome-shell
/* exported init */

const { Gio, GLib, Meta } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const ByteArray = imports.byteArray;

const Me = ExtensionUtils.getCurrentExtension();
const Util = Me.imports.util;

const uuid = 'customize-ibus@hollowman.ml';
const SETTINGS_KEY = 'name';
const PERMISSIONS_MODE = 0o744;

class IBusThemeManager {
    constructor() {
        this._settings = ExtensionUtils.getSettings();
        this._prevCssStylesheet = null;
    }

    enable() {
        this._changedId = this._settings.connect(`changed::${SETTINGS_KEY}`, this._changeTheme.bind(this));
        this._changeTheme();
    }

    disable() {
        if (this._changedId) {
            this._settings.disconnect(this._changedId);
            this._changedId = 0;
        }
        this._changeTheme();
    }

    _changeTheme() {
        let stylesheet = null;
        let themeName = this._settings.get_string(SETTINGS_KEY);

        if (themeName) {
            const stylesheetPaths = Util.getThemeDirs()
                .map(dir => `${dir}/${themeName}/gnome-shell/gnome-shell.css`);

            stylesheetPaths.push(...Util.getModeThemeDirs()
                .map(dir => `${dir}/${themeName}.css`));

            stylesheet = stylesheetPaths.find(path => {
                let file = Gio.file_new_for_path(path);
                return file.query_exists(null);
            });
        }
        let newFileContent = "";
        let notFirstStart = false;
        if (this._prevCssStylesheet)
            notFirstStart = true;
        if (stylesheet) {
            global.log(`loading user theme for IBus: ${stylesheet}`);
            let file = Gio.File.new_for_path(stylesheet);
            let [success, contents] = file.load_contents(null);
            var regStr = /.candidate-[\s\S]*?}/gi;
            let matchedContent = ByteArray.toString(contents).match(regStr);
            for (var index in matchedContent) {
                newFileContent += matchedContent[index].replace(/assets\//g, stylesheet + "/../assets/") + "\n";
            }
            this._prevCssStylesheet = stylesheet;
        } else {
            global.log('loading default theme (Adwaita) for IBus');
            this._prevCssStylesheet = "Adwaita";
        }
        let file = Gio.File.new_for_path(GLib.build_filenamev([global.userdatadir, 'extensions', uuid, 'stylesheet.css']));
        if (GLib.mkdir_with_parents(file.get_parent().get_path(), PERMISSIONS_MODE) === 0) {
            file.replace_contents(newFileContent, null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);
        }
        if (notFirstStart)
            Meta.restart("Restarting...");
    }
}

function init() {
    return new IBusThemeManager();
}
