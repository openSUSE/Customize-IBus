// vim:fdm=syntax
// by tuberry@github
'use strict';

const Main = imports.ui.main;
const Panel = imports.ui.panel;
const PanelMenu = imports.ui.panelMenu;
const { Shell, Clutter, Gio, GLib, Meta, IBus, Pango, St, GObject } = imports.gi;

const Keyboard = imports.ui.status.keyboard;
const InputSourceManager = Keyboard.getInputSourceManager();
const IBusManager = imports.misc.ibusManager.getIBusManager();
const CandidatePopup = IBusManager._candidatePopup;
const CandidateArea = CandidatePopup._candidateArea;

const ExtensionUtils = imports.misc.extensionUtils;
const gsettings = ExtensionUtils.getSettings();
const Me = ExtensionUtils.getCurrentExtension();
const Fields = Me.imports.prefs.Fields;
const UNKNOWN = { 'ON': 0, 'OFF': 1, 'DEFAULT': 2 };
const STYLE = { 'LIGHT': 0, 'DARK': 1 };
const ASCIIMODES = ['en', 'A', '英'];
const INPUTMODE = 'InputMode';

const LightProxy = Main.panel.statusArea.aggregateMenu._nightLight._proxy;

const IBusAutoSwitch = GObject.registerClass({
    Properties: {
        'unknown':  GObject.param_spec_uint('unknown', '', '', 0, 2, 2, GObject.ParamFlags.READWRITE),
        'shortcut': GObject.param_spec_boolean('shortcut', '', '', false, GObject.ParamFlags.WRITABLE),
    },
}, class IBusAutoSwitch extends GObject.Object {
    _init() {
        super._init();
    }

    get _state() {
        const labels = Main.panel.statusArea.keyboard._indicatorLabels;
        return ASCIIMODES.includes(labels[InputSourceManager.currentSource.index].get_text());
    }

    get _toggle() {
        let win = InputSourceManager._getCurrentWindow();
        if(!win) return false;

        let state = this._state;
        let store = this._states.get(this._tmpWindow);
        if(state != store)
            this._states.set(this._tmpWindow, state);

        this._tmpWindow = win.wm_class ? win.wm_class.toLowerCase() : '';
        if(!this._states.has(this._tmpWindow)) {
            let unknown = this.unknown == UNKNOWN.DEFAULT ? state : this.unknown == UNKNOWN.ON;
            this._states.set(this._tmpWindow, unknown);
        }

        return state^this._states.get(this._tmpWindow);
    }

    set shortcut(shortcut) {
        if(shortcut) {
            Main.wm.addKeybinding(Fields.SHORTCUT, gsettings, Meta.KeyBindingFlags.NONE, Shell.ActionMode.ALL, () => {
                if(!this._state) IBusManager.activateProperty(INPUTMODE, IBus.PropState.CHECKED);
                Main.openRunDialog();
            });
        } else {
            Main.wm.removeKeybinding(Fields.SHORTCUT);
        }
    }

    _onWindowChanged() {
        if(this._toggle && IBusManager._panelService) {
            IBusManager.activateProperty(INPUTMODE, IBus.PropState.CHECKED);
        } else {
            //
        }
    }

    _bindSettings() {
        gsettings.bind(Fields.UNKNOWNSTATE, this, 'unknown', Gio.SettingsBindFlags.GET);
        gsettings.bind(Fields.ENABLEHOTKEY, this, 'shortcut', Gio.SettingsBindFlags.GET);
        this._states = new Map(Object.entries(gsettings.get_value(Fields.INPUTLIST).deep_unpack()));
    }

    enable() {
        this._bindSettings();
        this._overviewHiddenID = Main.overview.connect('hidden', this._onWindowChanged.bind(this));
        this._overviewShowingID = Main.overview.connect('showing', this._onWindowChanged.bind(this));
        this._onWindowChangedID = global.display.connect('notify::focus-window', this._onWindowChanged.bind(this));
    }

    disable() {
        this.shortcut = false;
        gsettings.set_value(Fields.INPUTLIST, new GLib.Variant('a{sb}', Object.fromEntries(this._states)));
        if(this._onWindowChangedID)
            global.display.disconnect(this._onWindowChangedID), this._onWindowChangedID = 0;
        if(this._overviewShowingID)
            Main.overview.disconnect(this._overviewShowingID), this._overviewShowingID = 0;
        if(this._overviewHiddenID)
            Main.overview.disconnect(this._overviewHiddenID), this._overviewHiddenID = 0;
    }
});

const IBusFontSetting = GObject.registerClass({
    Properties: {
        'fontname':  GObject.param_spec_string('fontname', '', '', 'Sans 16', GObject.ParamFlags.WRITABLE),
    },
}, class IBusFontSetting extends GObject.Object {
    _init() {
        super._init();
    }

    set fontname(fontname) {
        let offset = 3; // the fonts-size difference between index and candidate
        let desc = Pango.FontDescription.from_string(fontname);
        let get_weight = () => { try { return desc.get_weight(); } catch(e) { return parseInt(e.message); } }; // hack for Pango.Weight enumeration exception (eg: 290) in some fonts
        CandidatePopup.set_style('font-weight: %d; font-family: "%s"; font-size: %dpt; font-style: %s;'.format(
            get_weight(),
            desc.get_family(),
            (desc.get_size() / Pango.SCALE) - offset,
            Object.keys(Pango.Style)[desc.get_style()].toLowerCase()
        ));
        CandidateArea._candidateBoxes.forEach(x => {
            x._candidateLabel.set_style('font-size: %dpt;'.format(desc.get_size() / Pango.SCALE));
            x._indexLabel.set_style('padding: %dpx 4px 0 0;'.format(offset * 2));
        })
    }

    enable() {
        gsettings.bind(Fields.CUSTOMFONT, this, 'fontname', Gio.SettingsBindFlags.GET);
    }

    disable() {
        CandidatePopup.set_style('');
        CandidateArea._candidateBoxes.forEach(x => {
            x._candidateLabel.set_style('');
            x._indexLabel.set_style('');
        });
    }
});

const IBusOrientation = GObject.registerClass({
    Properties: {
        'orientation': GObject.param_spec_uint('orientation', '', '', 0, 1, 1, GObject.ParamFlags.READWRITE),
    },
}, class IBusOrientation extends GObject.Object {
    _init() {
        super._init();
    }

    set orientation(orientation) {
        this._originalSetOrientation(gsettings.get_uint(Fields.ORIENTATION) ? IBus.Orientation.HORIZONTAL : IBus.Orientation.VERTICAL);
    }

    enable() {
        this._originalSetOrientation = CandidateArea.setOrientation.bind(CandidateArea);
        CandidateArea.setOrientation = () => {};
        gsettings.bind(Fields.ORIENTATION, this, 'orientation', Gio.SettingsBindFlags.GET);
    }

    disable() {
        CandidateArea.setOrientation = this._originalSetOrientation;
    }
});

const IBusThemeManager = GObject.registerClass({
    Properties: {
        'night': GObject.param_spec_boolean('night', '', '', false, GObject.ParamFlags.WRITABLE),
        'style': GObject.param_spec_uint('style', '', '', 0, 1, 0, GObject.ParamFlags.READWRITE),
        'color': GObject.param_spec_uint('color', '', '', 0, 7, 3, GObject.ParamFlags.READWRITE),
    },
}, class IBusThemeManager extends GObject.Object {
    _init() {
        super._init();
    }

    _replaceStyle() {
        this._popup = {
            style_class: 'candidate-popup-boxpointer',
            _candidateArea: {
                _candidateBoxes: Array(16).fill({
                    style_class: 'candidate-box',
                    _indexLabel: { style_class: 'candidate-index' },
                    _candidateLabel: { style_class: 'candidate-label' }
                }),
                _buttonBox: { style_class: 'candidate-page-button-box' },
                _previousButton: {
                    style_class: 'candidate-page-button candidate-page-button-previous button',
                    child: { style_class: 'candidate-page-button-icon' }
                },
                _nextButton: {
                    style_class: 'candidate-page-button candidate-page-button-next button',
                    child: { style_class: 'candidate-page-button-icon' }
                }
            },
            bin: {
                child: { style_class: 'candidate-popup-content' }
            },
            _preeditText: { style_class: 'candidate-popup-text' },
            _auxText: { style_class: 'candidate-popup-text' }
        }
        this._palatte = ['red', 'green', 'orange', 'blue', 'purple', 'turquoise', 'grey'];
        this._addStyleClass(this._popup, CandidatePopup,  x => x.replace(/candidate/g, 'ibus-tweaker-candidate'));
        this._night = null;
        this._style = null;
        this._color = null;
    }

    _addStyleClass(src, aim, func) {
        for(let p in src) {
            if(typeof(src[p]) === 'object') {
                if(src[p] instanceof Array) {
                    src[p].forEach((x,i) => this._addStyleClass(x, aim[p][i], func));
                } else {
                    this._addStyleClass(src[p], aim[p], func);
                }
            } else {
                aim.remove_style_class_name(aim[p]);
                aim.add_style_class_name(func(src[p]));
            }
        }
    }

    _restoreStyle() {
        if(this._style == STYLE.DARK) {
            CandidatePopup.remove_style_class_name('night');
            CandidatePopup.remove_style_class_name('night-%s'.format(this._color));
        } else {
            CandidatePopup.remove_style_class_name(this._color);
        }
        this._addStyleClass(this._popup, CandidatePopup, x => x);
        this._popup = null;
        this._palatte = null;
    }

    _onProxyChanged() {
        if(this._night === null || !this._night) return;
        gsettings.set_uint(Fields.MSTHEMESTYLE, this._night && LightProxy.NightLightActive ? STYLE.DARK : STYLE.LIGHT);
    }

    set night(night) {
        this._night = night;
        gsettings.set_uint(Fields.MSTHEMESTYLE, night && LightProxy.NightLightActive ? STYLE.DARK : STYLE.LIGHT);
    }

    set color(color) {
        this._color = this._palatte[color];
        if(this._style === null || this._style == STYLE.LIGHT) {
            if(this._prvColor)
                CandidatePopup.remove_style_class_name(this._prvColor);
            CandidatePopup.add_style_class_name(this._color);
        } else {
            if(this._prvColor)
                CandidatePopup.remove_style_class_name('night-%s'.format(this._prvColor));
            CandidatePopup.add_style_class_name('night-%s'.format(this._color));
        }
        this._prvColor = this._color;
    }

    set style(style) {
        this._style = style;
        if(this._color === null) {
            if(style == STYLE.DARK) {
                CandidatePopup.add_style_class_name('night');
            } else {
                CandidatePopup.remove_style_class_name('night');
            }
        } else {
            if(style == STYLE.DARK) {
                CandidatePopup.remove_style_class_name(this._color);
                CandidatePopup.add_style_class_name('night');
                CandidatePopup.add_style_class_name('night-%s'.format(this._color));
            } else {
                CandidatePopup.remove_style_class_name('night');
                CandidatePopup.remove_style_class_name('night-%s'.format(this._color));
                CandidatePopup.add_style_class_name(this._color);
            }
        }
    }

    _bindSettings() { // order matters
        gsettings.bind(Fields.MSTHEMENIGHT, this, 'night', Gio.SettingsBindFlags.GET);
        gsettings.bind(Fields.MSTHEMESTYLE, this, 'style', Gio.SettingsBindFlags.GET);
        gsettings.bind(Fields.MSTHEMECOLOR, this, 'color', Gio.SettingsBindFlags.GET);
    }

    enable() {
        this._replaceStyle();
        this._bindSettings();
        this._proxyChangedId = LightProxy.connect('g-properties-changed', this._onProxyChanged.bind(this));
    }

    disable() {
        this._restoreStyle();
        if(this._proxyChangedId) LightProxy.disconnect(this._proxyChangedId), this._proxyChangedId = 0;
    }
});

const ActivitiesHide = GObject.registerClass(
class ActivitiesHide extends GObject.Object{
    _init() {
        super._init();
    }

    enable() {
        Main.panel.statusArea['activities'].hide();
    }

    disable() {
        Main.panel.statusArea['activities'].show();
    }
});

const UpdatesIndicator = GObject.registerClass({
    Properties: {
        'updatescmd': GObject.param_spec_string('updatescmd', '', '', 'checkupdates', GObject.ParamFlags.READWRITE),
        'updatesdir': GObject.param_spec_string('updatesdir', '', '', '/var/lib/pacman/local', GObject.ParamFlags.READWRITE),
    },
}, class UpdatesIndicator extends GObject.Object{
    _init() {
        super._init();
    }

    _bindSettings() {
        gsettings.bind(Fields.UPDATESDIR,   this, 'updatesdir', Gio.SettingsBindFlags.GET);
        gsettings.bind(Fields.CHECKUPDATES, this, 'updatescmd', Gio.SettingsBindFlags.GET);
    }

    _execute(cmd) {
        return new Promise((resolve, reject) => {
            try {
                let command = ['/bin/bash', '-c', this.updatescmd];
                let proc = new Gio.Subprocess({
                    argv: command,
                    flags: Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE,
                });
                proc.init(null);
                proc.communicate_utf8_async(null, null, (proc, res) => {
                    let [, stdout, stderr] = proc.communicate_utf8_finish(res);
                    proc.get_exit_status() ? reject(stderr.trim()) : resolve(stdout.trim());
                });
            } catch(e) {
                reject(e.message);
            }
        });
    }

    _checkUpdates() {
        this._execute(gsettings.get_string(Fields.CHECKUPDATES)).then(scc => {
            this._showUpdates(scc);
        }).catch(err => {
            Main.notifyError(Me.metadata.name, err);
        });
    }

    _showUpdates(count) {
        if(count == '0') {
            this._button.hide();
            this._checkUpdated();
        } else {
            let dir = Gio.file_new_for_path(this.updatesdir);
            this._fileMonitor = dir.monitor_directory(Gio.FileMonitorFlags.NONE, null);
            this._fileChangedId = this._fileMonitor.connect('changed', () => {
                GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 10, () => {
                    this._checkUpdates();
                    return GLib.SOURCE_REMOVE;
                });
            });
            this._button.label.set_text(count);
            this._button.show();
        }
    }

    _addIndicator() {
        if(Main.panel.statusArea[Me.metadata.uuid]) return;
        this._button = new PanelMenu.Button(0, 'Updates Indicator', true);
        let box = new St.BoxLayout({
            vertical: false,
            style_class: 'panel-status-menu-box'
        });
        let icon = new St.Icon({
            y_expand: false,
            style_class: 'system-status-icon',
            icon_name: 'software-update-available-symbolic',
        });
        this._button.label = new St.Label({
            text: '0',
            y_expand: false,
            y_align: Clutter.ActorAlign.CENTER
        });
        box.add_child(icon);
        box.add_child(this._button.label);
        this._button.add_actor(box);
        Main.panel.addToStatusArea(Me.metadata.name, this._button, 5, 'center');
        this._button.hide();
    }

    _checkUpdated() {
        if(this._fileChangedId) this._fileMonitor.disconnect(this._fileChangedId), this._fileChangedId = 0;
        this._fileMonitor = null;
    }

    enable() {
        this._bindSettings();
        this._addIndicator();
        this._checkUpdates();
        this._checkUpdatesId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 60 * 60, this._checkUpdates.bind(this));
    }

    disable() {
        if(this._checkUpdatesId) GLib.source_remove(this._checkUpdatesId), this._checkUpdatesId = 0;
        this._checkUpdated();
        this._button.destroy();
        this._button = null;
    }
});

const Extensions = GObject.registerClass(
class Extensions extends GObject.Object{
    _init() {
        super._init();
    }

    enable() {
        let fields = [
            Fields.AUTOSWITCH,
            Fields.USECUSTOMFONT,
            Fields.ENABLEORIEN,
            Fields.ENABLEMSTHEME,
            Fields.ACTIVITIES,
            Fields.ENABLEUPDATES
        ];
        this._exts = [
            new IBusAutoSwitch(),
            new IBusFontSetting(),
            new IBusOrientation(),
            new IBusThemeManager(),
            new ActivitiesHide(),
            new UpdatesIndicator()
        ]
        this._exts.forEach((x,i) => {
            x._enable = gsettings.get_boolean(fields[i]);
            if(x._enable) x.enable();
            x._enableId = gsettings.connect('changed::' + fields[i], () => {
                x._enable = gsettings.get_boolean(fields[i]);
                x._enable ? x.enable() : x.disable();
            });
        });
    }

    disable() {
        this._exts.forEach(x => {
            if(x._enable) x.disable();
            if(x._enableId) gsettings.disconnect(x._enableId), x._enableId = 0;
        });
        this._exts = null;
    }
});

function init() {
    return new Extensions();
}

