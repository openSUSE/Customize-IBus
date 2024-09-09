/**
 * Prefs Library
 *
 * @author Hollowman <hollowman@opensuse.org>
 * @copyright 2020-2024
 */

const { Gio, GLib } = imports.gi;
import Gtk from 'gi://Gtk?version=4.0';
import GObject from "gi://GObject";
import { PrefsKeys } from "./PrefsKeys.js";
import { Fields } from "../../fields.js";
const { _ } = imports.gettext;



export class Prefs {
    #shellVersion = null;
    #prefsKeys = null;
    #builder = null;
    #settings = null;
    #gdk = null;
    #dependencies = null;
    #profiles = [
        'default',
        'minimal',
        'superminimal',
    ];

    constructor(dependencies, prefsKeys, shellVersion) {
        this.#settings = dependencies['Settings'] || null;
        this.#builder = dependencies['Builder'] || null;
        this.#gdk = dependencies['Gdk'] || null;
        this.#prefsKeys = prefsKeys;
        this.#shellVersion = shellVersion;
        this.#dependencies = dependencies;
    }

    fillPrefsWindow(window, UIFolderPath, gettextDomain) {
        let uiFilenames = [
            'general',
            'tray',
            'indicator',
            'theme',
            'background',
            'settings',
            'about'
        ];

        this.#builder.set_translation_domain(gettextDomain);
        for (let uiFilename of uiFilenames) {
            try {
                console.debug(`Loading UI file: ${UIFolderPath}/adw/${uiFilename}.ui`);
                this.#builder.add_from_file(`${UIFolderPath}/adw/${uiFilename}.ui`);
            } catch (error) {
                console.error(`Failed to load UI file: ${UIFolderPath}/adw/${uiFilename}.ui`, error);
            }
        }

        for (let uiFilename of uiFilenames) {
            try {
                let page = this.#builder.get_object(uiFilename);
                if (page) {
                    window.add(page);
                } else {
                    console.error(`UI object for ${uiFilename} not found in the loaded builder.`);
                }
            } catch (error) {
                console.error(`Failed to get UI object for: ${uiFilename}`, error);
            }
        }

        this.#setValues();
        this.#guessProfile();
        // this.#onlyShowSupportedRows();
        this.#registerAllSignals(window);

        this.#setWindowSize(window);
        this.#updateIBusVersion();

        window.search_enabled = true;
    }

    #setWindowSize(window) {
        let [pmWidth, pmHeight, pmScale] = this.#getPrimaryMonitorInfo();
        let sizeTolerance = 50;
        let width = 800;
        let height = 800;

        if ((pmWidth / pmScale) - sizeTolerance >= width &&
            (pmHeight / pmScale) - sizeTolerance >= height) {
            window.set_default_size(width, height);
        }
    }

    #getPrimaryMonitorInfo() {
        let display = this.#gdk.Display.get_default();
        let pm = display.get_monitors().get_item(0);

        if (!pm) {
            return [700, 500, 1];
        }

        let geo = pm.get_geometry();
        let scale = pm.get_scale_factor();

        return [geo.width, geo.height, scale];
    }

    #registerAllSignals(window) {
        this.#registerKeySignals();
        this.#registerProfileSignals();
    }

    #registerKeySignals() {
        for (let [_, key] of Object.entries(this.#prefsKeys.keys)) {
            let widgetId = key.widgetId;
            let widget = this.#builder.get_object(widgetId);

            if (!widget) {
                console.error(`Widget with ID ${widgetId} not found for widgetType ${key.widgetType}.`);
                continue;
            }

            switch (key.widgetType) {
                case 'AdwComboRow':
                    widget.connect('notify::selected', (w) => {
                        let val = w.get_selected();
                        this.#settings.set_int(key.name, val);
                        this.#guessProfile();
                    });
                    break;
                case 'AdwSwitchRow':
                    widget.connect('notify::active', (w) => {
                        try {
                            this.#settings.set_boolean(key.name, w.get_active());
                        } catch (error) {
                            console.error(`Error setting boolean for ${key.name}:`, error);
                        }
                        this.#handleSwitchRow(widget, key.widgetId);
                    });
                    break;
                case 'AdwSlider':
                    widget.connect('notify::value', (w) => {
                        this.#settings.set_int(key.name, w.get_value());
                        this.#guessProfile();
                    });
                    break;
                case 'GtkAdjustment':
                    widget.connect('value-changed', (w) => {
                        this.#settings.set_int(key.name, w.get_value());
                        this.#guessProfile();
                    });
                    break;
                case 'GtkFileChooserButton':
                    widget.connect('file-set', (w) => {
                        this.#settings.set_string(key.name, w.get_filename());
                        this.#guessProfile();
                    });
                    break;
                case 'AdwPreferencesRow':
                    let fontButton = this.#builder.get_object('custom_font_button');
                    if (fontButton) {
                        fontButton.connect('font-set', (w) => {
                            this.#settings.set_string(key.name, w.get_font());
                        });
                    } else {
                        console.error('Font button with ID custom_font_button not found.');
                    }
                    break;
                case 'AdwActionRow':
                    let scale = this.#builder.get_object('candidate_box_opacity_scale');
                    if (scale) {
                        scale.connect('value-changed', (w) => {
                            this.#settings.set_int(key.name, w.get_value());
                        });
                    } else {
                        console.error('Scale with ID candidate_box_opacity_scale not found.');
                    }
                    break;
                case 'GtkButton':
                    widget.connect('clicked', (w) => {
                        this.#handleButtonClicked(widget, key.widgetId);
                    });
                    break;
                case 'GtkCheckButton':
                    widget.connect('toggled', (w) => {
                        let target = this.#builder.get_object('candidate_box_opacity_label');
                        target.set_sensitive(false);
                    });
                    break;
                default:
                    console.error(`Unhandled widgetType ${key.widgetType} for widgetId ${widgetId}.`);
                    break;
            }
        }
    }

    #registerProfileSignals() {
        for (let profile of this.#profiles) {
            let widget = this.#builder.get_object(`profile_${profile}`);
            if (!widget) {
                break;
            }
            widget.connect('clicked', (w) => {
                this.#setValues(profile);
            });
        }
    }

    #guessProfile() {
        let totalCount = 0;
        let matchCount = {};

        for (let profile of this.#profiles) {
            matchCount[profile] = 0;
        }

        for (let [_, key] of Object.entries(this.#prefsKeys.keys)) {
            if (!key.supported) {
                continue;
            }

            let value;

            try {
                switch (key.widgetType) {
                    case 'AdwSwitchRow':
                        value = this.#builder.get_object(key.widgetId)?.get_active();
                        break;
                    case 'AdwComboRow':
                        value = this.#builder.get_object(key.widgetId)?.get_selected();
                        break;
                    case 'GtkButton':
                        value = this.#builder.get_object(key.widgetId)?.get_label();
                        break;
                    case 'AdwSlider':
                        value = this.#builder.get_object(key.widgetId)?.get_value();
                        break;
                    case 'GtkCheckButton':
                        value = this.#builder.get_object(key.widgetId)?.get_active();
                        break;
                    case 'GtkScale':
                        value = this.#builder.get_object(key.widgetId)?.get_value();
                        break;
                    case 'GtkAdjustment':
                        value = this.#builder.get_object(key.widgetId)?.get_value();
                        break;
                    case 'AdwPreferencesRow':
                        value = this.#builder.get_object(key.widgetId)?.get_font();
                        break;
                    case 'GtkFontButton':
                        value = this.#builder.get_object(key.widgetId)?.get_font();
                        break;
                    case 'GtkFileChooserButton':
                        value = this.#builder.get_object(key.widgetId)?.get_filename();
                        break;
                    default:
                        value = '';
                        continue;
                }
            } catch (error) {
                console.error(`Error getting object for widget ID ${key.widgetId}:`, error);
                value = '';
            }

            for (let profile of this.#profiles) {
                if (key.profiles[profile] === value) {
                    matchCount[profile]++;
                }
            }

            totalCount++;
        }

        // Additional logging to verify matchCount
        console.debug(`Match count:`, matchCount);

        let currentProfile = 'custom';
        for (let profile of this.#profiles) {
            if (matchCount[profile] === totalCount) {
                currentProfile = profile;
                break;
            }
        }

        let widget = this.#builder.get_object(`profile_${currentProfile}`);
        if (widget) {
            widget.set_active(true);
        } else {
            console.error(`Profile widget for ${currentProfile} not found.`);
        }
    }

    #setValues(profile) {
        for (let [, key] of Object.entries(this.#prefsKeys.keys)) {
            let widget = this.#builder.get_object(key.widgetId);
            if (!widget) {
                console.error(`Widget with ID ${key.widgetId} not found`);
                continue;
            }

            switch (key.widgetType) {
                case 'AdwSwitchRow':
                    try {
                        this.#settings.bind(
                            key.name,
                            widget,
                            'active',
                            Gio.SettingsBindFlags.DEFAULT
                        );
                    } catch (error) {
                        console.error(`Error binding boolean for ${key.name}:`, error);
                    }
                    break;

                case 'AdwComboRow':
                    this.#settings.bind(
                        key.name,
                        widget,
                        'selected',
                        Gio.SettingsBindFlags.DEFAULT
                    );
                    break;

                // case 'AdwPreferencesRow':
                //     this.#settings.bind(
                //         key.name,
                //         widget,
                //         '',
                //         Gio.SettingsBindFlags.DEFAULT,
                //     );
                // break;

                case 'GtkFontButton':
                    this.#settings.bind(
                        key.name,
                        widget,
                        'font',
                        Gio.SettingsBindFlags.DEFAULT,
                    );
                    break;

                case 'GtkAdjustment':
                    this.#settings.bind(
                        key.name,
                        widget,
                        'value',
                        Gio.SettingsBindFlags.DEFAULT,
                    );
                    break;

                case 'GtkCheckButton':
                    try{
                        let checkValue = (profile) ? key.profiles[profile] : this.#settings.get_boolean(key.name);
                        widget.set_active(checkValue);
                    } catch (error) {
                        console.error(`Error getting boolean for ${key.name}:`, error);
                    }
                    let targetWidget = this.#builder.get_object(key.widgetId).get_parent();
                    if (targetWidget) {
                        targetWidget.set_visible(widget.get_active());
                        targetWidget.set_sensitive(widget.get_active());
                    }
                    break;

                case 'GtkComboBoxText':
                    let comboValue = (profile) ? key.profiles[profile] : this.#settings.get_string(key.name);
                    widget.set_active_id(comboValue);
                    break;

                case 'GtkButton':
                    break;
            }
        }
    }

    #onlyShowActiveRows() {

    }

    #handleSwitchRow(widget, Id) {
        switch (Id.toString()) {
            case 'candidate_box_opacity_switch_row':
                let target = this.#builder.get_object('candidate_box_opacity_row');
                target.set_visible(widget.get_active());
                break;
            default:
                break;
        }
    }

    #handleButtonClicked(widget, Id) {
        switch (Id) {
            case 'custom_theme_dark_button':
                this.#selectFile(widget);
                break;
            case 'gnome_settings_button':
                this.#applySettings(widget);
                break;
            case 'ibus_preferences_button':
                this.#openIBusPreferences();
                break
            case 'start_restart_button':
                this.#restartIbus();
                break;
            case 'import_settings_from_file_button':
                this.#importSettings(widget);
                break;
            case 'export_current_settings_button':
                this.#exportSettings(widget);
                break;
            case 'restore_default_settings_button':
                this.#resetSettings();
            default:
                widget.set_label('Not Implemented');
                break;
        }
    }

    #showFileChooser(title, action, acceptBtn, acceptHandler, setDefaultName, widget) {
        let iniFilter = new Gtk.FileFilter();
        iniFilter.set_name("INI files");
        iniFilter.add_mime_type("application/x-ini");
        iniFilter.add_pattern("*.ini");

        let dialog = new Gtk.FileChooserNative({
            title: title,
            action: action,
            transient_for: this.#builder.get_object('window'),
            accept_label: acceptBtn,
            cancel_label: "Cancel"
        });

        if (setDefaultName)
            dialog.set_current_name(
                "Customize_IBus_Settings_" + new Date().getTime().toString() + ".ini",
            );

        dialog.add_filter(iniFilter);

        dialog.connect("response", (d, id) => {
            if (id !== Gtk.ResponseType.ACCEPT) {
                d.destroy();
                return;
            }
            acceptHandler.call(this, d.get_file().get_path());
            d.destroy();
        });

        dialog.show();


    }

    #exportSettings(widget) {
        this.#showFileChooser(
            "Export Current Settings",
            Gtk.FileChooserAction.SAVE,
            "Save",
            (filename) => {
                if (!filename.endsWith(".ini")) filename += ".ini";
                let file = Gio.file_new_for_path(filename);
                let raw = file.replace(null, false, Gio.FileCreateFlags.NONE, null);
                let out = Gio.BufferedOutputStream.new_sized(raw, 4096);

                out.write_all(
                    GLib.spawn_command_line_sync("dconf dump " + SCHEMA_PATH)[1],
                    null,
                );
                out.close(null);
            },
            true,
            widget,
        );
    }

    #importSettings(widget) {

        this.#showFileChooser(
            "Import Settings from File",
            Gtk.FileChooserAction.OPEN,
            "Open",
            (filename) => {
                if (filename && GLib.file_test(filename, GLib.FileTest.EXISTS)) {
                    let settingsFile = Gio.File.new_for_path(filename);
                    let [, , stdin, stdout, stderr] = GLib.spawn_async_with_pipes(
                        null,
                        ["dconf", "load", SCHEMA_PATH],
                        null,
                        GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD,
                        null,
                    );

                    stdin = new Gio.UnixOutputStream({ fd: stdin, close_fd: true });
                    GLib.close(stdout);
                    GLib.close(stderr);

                    stdin.splice(
                        settingsFile.read(null),
                        Gio.OutputStreamSpliceFlags.CLOSE_SOURCE |
                        Gio.OutputStreamSpliceFlags.CLOSE_TARGET,
                        null,
                    );
                }
            },
            false,
            widget,
        );
    }

    #applySettings(widget) {
        GLib.spawn_command_line_async("gnome-control-center keyboard");
    }

    #resetSettings() {
        this.#setValues();
        this.#resetExtension();
    }

    #resetExtension() {
        let dialog = new Gtk.MessageDialog({
            title: "Reset to Default",
            text: "Reset all settings to default?",
            buttons: Gtk.ButtonsType.OK_CANCEL,
            transient_for: this.#builder.get_object('window'),
        });

        dialog.connect("response", (d, id) => {
            if (id === Gtk.ResponseType.OK) {
                this.#setValues();
            }
            d.destroy();
        }
        );
        dialog.show();
    }

    #restartIbus() {
        this.gsettings.set_string(
            PrefsKeys.keys["ibus-restart-time"].name,
            new Date().getTime().toString(),
        );
        this.#updateIBusVersion();
    }

    #updateIBusVersion() {
        let widget = this.#builder.get_object("tray_group");
        let result = GLib.spawn_command_line_sync("ibus version");
        let version = result[1].toString().trim();
        widget.set_title(`IBus version: ${version}`);
    }


    #selectFile(widget) {
        widget.set_label('File selected23');

        let dialog;
        try {
            dialog = new Gtk.FileChooserDialog({
                title: 'Select a file',
                action: Gtk.FileChooserAction.OPEN,
                transient_for: widget.get_toplevel(),
                modal: true,
                buttons: [
                    { label: 'Cancel', action: Gtk.ResponseType.CANCEL },
                    { label: 'Open', action: Gtk.ResponseType.OK },
                ],
            });
            widget.set_label('File selected20');
        } catch (e) {
            widget.set_label('File selected1');
            console.error('Error creating dialog:', e);
            return;
        }


        widget.set_label('File selected29');

        dialog.set_transient_for(widget.get_toplevel());

        console.log('Step 3: Running dialog');
        dialog.run();
    }

    #openIBusPreferences() {
        GLib.spawn_command_line_async("ibus-setup");
    }

}