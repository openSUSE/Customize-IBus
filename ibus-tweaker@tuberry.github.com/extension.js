// vim:fdm=syntax
// by tuberry@github
'use strict';

const Main = imports.ui.main;
const Panel = imports.ui.panel;
const PanelMenu = imports.ui.panelMenu;
const AltTab = imports.ui.altTab;
const { Shell, Clutter, Gio, GLib, Meta, IBus, Pango, St, GObject } = imports.gi;

const Keyboard = Main.panel.statusArea.keyboard;
const InputSourceManager = Keyboard._inputSourceManager;
const IBusManager = InputSourceManager._ibusManager;
const CandidatePopup = IBusManager._candidatePopup;
const CandidateArea = CandidatePopup._candidateArea;

const ExtensionUtils = imports.misc.extensionUtils;
const gsettings = ExtensionUtils.getSettings();
const Me = ExtensionUtils.getCurrentExtension();
const Fields = Me.imports.prefs.Fields;
const UNKNOWN = { 'ON': 0, 'OFF': 1, 'DEFAULT': 2 };
const STYLE = { 'LIGHT': 0, 'DARK': 1 };
const asciiModes = ['en', 'A', '英'];
const INPUTMODE = 'InputMode';

const LightProxy = Main.panel.statusArea.aggregateMenu._nightLight._proxy;

const IBusAutoSwitch = GObject.registerClass(
class IBusAutoSwitch extends GObject.Object {
    _init() {
        super._init();
        this._states = null;
        this._tmpWindow = '';
    }

    get _state() {
        return asciiModes.includes(Keyboard._indicatorLabels[InputSourceManager._currentSource.index].get_text());
    }

    get _toggle() {
        let state = this._state;
        this._states.set(this._tmpWindow, state);

        let win = InputSourceManager._getCurrentWindow();
        if(!win) return false;
        this._tmpWindow = win.wm_class ? win.wm_class.toLowerCase() : '';
        if(!this._states.has(this._tmpWindow)) {
            return this._unknown == UNKNOWN.DEFAULT ? false : state^(this._unknown == UNKNOWN.ON)
        } else {
            return state^this._states.get(this._tmpWindow);
        }
    }

    _toggleKeybindings(tog) {
        if(tog) {
            Main.wm.addKeybinding(Fields.SHORTCUT, gsettings, Meta.KeyBindingFlags.NONE, Shell.ActionMode.ALL, () => {
                if(!this._state) IBusManager.activateProperty(INPUTMODE, IBus.PropState.CHECKED);
                Main.openRunDialog();
            });
        } else {
            Main.wm.removeKeybinding(Fields.SHORTCUT);
        }
    }

    _onWindowChanged() {
        if(this._toggle && IBusManager._panelService)
            IBusManager.activateProperty(INPUTMODE, IBus.PropState.CHECKED);
    }

    enable() {
        this._states = new Map();
        this._unknown = gsettings.get_uint(Fields.UNKNOWNSTATE);
        gsettings.get_string(Fields.ASCIIONLIST).split('#').forEach(x => this._states.set(x.toLowerCase(), true));
        gsettings.get_string(Fields.ASCIIOFFLIST).split('#').forEach(x => this._states.set(x.toLowerCase(), false));
        if(gsettings.get_boolean(Fields.ENABLEHOTKEY)) this._toggleKeybindings(true);

        this._overviewHiddenId = Main.overview.connect('hidden', this._onWindowChanged.bind(this));
        this._overviewShowingId = Main.overview.connect('showing', this._onWindowChanged.bind(this));
        this._onWindowChangedId = global.display.connect('notify::focus-window',  this._onWindowChanged.bind(this));
        this._shortcutId = gsettings.connect(`changed::${Fields.ENABLEHOTKEY}`, () => {
            this._toggleKeybindings(gsettings.get_boolean(Fields.ENABLEHOTKEY));
        });
        this._asciiOnListId = gsettings.connect(`changed::${Fields.ASCIIONLIST}`, () => {
            gsettings.get_string(Fields.ASCIIONLIST).split('#').forEach(x => this._states.set(x.toLowerCase(), true));
        });
        this._asciiOffListId = gsettings.connect(`changed::${Fields.ASCIIOFFLIST}`, () => {
            gsettings.get_string(Fields.ASCIIOFFLIST).split('#').forEach(x => this._states.set(x.toLowerCase(), false));
        });
        this._unknownId = gsettings.connect(`changed::${Fields.UNKNOWNSTATE}`, () => {
            this._unknown = gsettings.get_uint(Fields.UNKNOWNSTATE);
        });
    }

    disable() {
        this._states = null;
        if(gsettings.get_boolean(Fields.ENABLEHOTKEY))
            Main.wm.removeKeybinding(Fields.SHORTCUT);
        if(this._unknownId)
            gsettings.disconnect(this._unknownId), this._unknownId = 0;
        if(this._shortcutId)
            gsettings.disconnect(this._shortcutId), this._shortcutId = 0;
        if(this._asciiOnListId)
            gsettings.disconnect(this._asciiOnListId), this._asciiOnListId = 0;
        if(this._asciiOffListId)
            gsettings.disconnect(this._asciiOffListId), this._asciiOffListId = 0;
        if(this._onWindowChangedId)
            global.display.disconnect(this._onWindowChangedId), this._onWindowChangedId = 0;
        if(this._overviewShowingId)
            Main.overview.disconnect(this._overviewShowingId), this._overviewShowingId = 0;
        if(this._overviewHiddenId)
            Main.overview.disconnect(this._overviewHiddenId), this._overviewHiddenId = 0;
    }
});

const IBusFontSetting = GObject.registerClass(
class IBusFontSetting extends GObject.Object {
    _init() {
        super._init();
    }

    _onFontChanged() {
        let offset = 3; // the fonts-size difference between index and candidate
        let desc = Pango.FontDescription.from_string(gsettings.get_string(Fields.CUSTOMFONT));
        let get_weight = () => { try { return desc.get_weight(); } catch(e) { return parseInt(e.message); } }; //fix Pango.Weight enumeration exception (eg: 290) in some fonts
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
        this._onFontChanged();
        this._customFontId = gsettings.connect(`changed::${Fields.CUSTOMFONT}`, this._onFontChanged.bind(this));
    }

    disable() {
        if (this._customFontId)
            gsettings.disconnect(this._customFontId), this._customFontId = 0;
        CandidatePopup.set_style('');
        CandidateArea._candidateBoxes.forEach(x => {
            x._candidateLabel.set_style('');
            x._indexLabel.set_style('');
        })
    }
});

const IBusOrientation = GObject.registerClass(
class IBusOrientation extends GObject.Object {
    _init() {
        super._init();
    }

    _originalSetOrientation(orientation) {
        if (CandidateArea._orientation == orientation)
            return;
        CandidateArea._orientation = orientation;

        if (CandidateArea._orientation == IBus.Orientation.HORIZONTAL) {
            CandidateArea.vertical = false;
            CandidateArea.remove_style_class_name('vertical');
            CandidateArea.add_style_class_name('horizontal');
            CandidateArea._previousButton.child.icon_name = 'go-previous-symbolic';
            CandidateArea._nextButton.child.icon_name = 'go-next-symbolic';
        } else {                // VERTICAL || SYSTEM
            CandidateArea.vertical = true;
            CandidateArea.add_style_class_name('vertical');
            CandidateArea.remove_style_class_name('horizontal');
            CandidateArea._previousButton.child.icon_name = 'go-up-symbolic';
            CandidateArea._nextButton.child.icon_name = 'go-down-symbolic';
        }
    }

    _onOrientationChanged() {
        let orientation = gsettings.get_uint(Fields.ORIENTATION) ? IBus.Orientation.HORIZONTAL : IBus.Orientation.VERTICAL
        this._originalSetOrientation(orientation);
    }

    enable() {
        CandidateArea.setOrientation = () => {};
        this._onOrientationChanged();
        this._orientationId = gsettings.connect(`changed::${Fields.ORIENTATION}`, this._onOrientationChanged.bind(this));
    }

    disable() {
        if (this._orientationId)
            gsettings.disconnect(this._orientationId), this._orientationId = 0;
        CandidateArea.setOrientation = x => this._originalSetOrientation(x);
    }
});

const IBusThemeManager = GObject.registerClass(
class IBusThemeManager extends GObject.Object {
    _init() {
        super._init();
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

    _onThemeChanged() {
        if(this._night && LightProxy.NightLightActive) {
            CandidatePopup.remove_style_class_name(`night-%s`.format(this._color));
            this._color = this._palatte[gsettings.get_uint(Fields.MSTHEMECOLOUR)];
            CandidatePopup.add_style_class_name(`night-%s`.format(this._color));
        } else {
            CandidatePopup.remove_style_class_name(this._color);
            this._color = this._palatte[gsettings.get_uint(Fields.MSTHEMECOLOUR)];
            CandidatePopup.add_style_class_name(this._color);
        }
    }

    _onNightChanged() {
        this._night = !this._night;
        if(this._night && LightProxy.NightLightActive) {
            gsettings.set_uint(Fields.MSTHEMESTYLE, STYLE.DARK);
        } else {
            gsettings.set_uint(Fields.MSTHEMESTYLE, STYLE.LIGHT);
        }
    }

    _onStyleChanged() {
        this._style = gsettings.get_uint(Fields.MSTHEMESTYLE);
        if(this._style == STYLE.DARK) {
            CandidatePopup.remove_style_class_name(this._color);
            CandidatePopup.add_style_class_name('night');
            CandidatePopup.add_style_class_name(`night-%s`.format(this._color));
        } else {
            CandidatePopup.remove_style_class_name('night');
            CandidatePopup.remove_style_class_name(`night-%s`.format(this._color));
            CandidatePopup.add_style_class_name(this._color);
        }
    }

    _onProxyChanged() {
        if(!this._night) return;
        if(LightProxy.NightLightActive) {
            gsettings.set_uint(Fields.MSTHEMESTYLE, STYLE.DARK);
        } else {
            gsettings.set_uint(Fields.MSTHEMESTYLE, STYLE.LIGHT);
        }
    }

    enable() {
        this._addStyleClass(this._popup, CandidatePopup,  x => x.replace(/candidate/g, `ibus-tweaker-candidate`));
        this._style = gsettings.get_uint(Fields.MSTHEMESTYLE);
        this._night = gsettings.get_boolean(Fields.MSTHEMENIGHT);
        this._color = this._palatte[gsettings.get_uint(Fields.MSTHEMECOLOUR)];
        this._nightChanhedId = gsettings.connect(`changed::${Fields.MSTHEMENIGHT}`, this._onNightChanged.bind(this));
        this._themeChangedId = gsettings.connect(`changed::${Fields.MSTHEMECOLOUR}`, this._onThemeChanged.bind(this));
        this._styleChangedId = gsettings.connect(`changed::${Fields.MSTHEMESTYLE}`, this._onStyleChanged.bind(this));
        this._proxyChangedId = LightProxy.connect('g-properties-changed', this._onProxyChanged.bind(this));
        if((this._night && LightProxy.NightLightActive) ||
           (!this._night && this._style == STYLE.DARK)) {
            CandidatePopup.add_style_class_name('night');
            CandidatePopup.add_style_class_name(`night-%s`.format(this._color));
        } else {
            CandidatePopup.add_style_class_name(this._color);
        }
    }

    disable() {
        if(this._nightChanhedId)
            gsettings.disconnect(this._nightChanhedId), this._nightChanhedId = 0;
        if(this._themeChangedId)
            gsettings.disconnect(this._themeChangedId), this._themeChangedId = 0;
        if(this._styleChangedId)
            gsettings.disconnect(this._styleChangedId), this._styleChangedId = 0;
        if(this._proxyChangedId)
            LightProxy.disconnect(this._proxyChangedId), this._proxyChangedId = 0;
        if((this._night && LightProxy.NightLightActive) ||
           (!this._night && this._style == Style.DARK)) {
            CandidatePopup.remove_style_class_name('night');
            CandidatePopup.remove_style_class_name(`night-%s`.format(this._color));
        } else {
            CandidatePopup.remove_style_class_name(this._color);
        }
        this._addStyleClass(this._popup, CandidatePopup, x => x);
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

const MinimizedHide = GObject.registerClass(
class MinimizedHide extends GObject.Object{
    _init() {
        super._init();
    }

    enable() {
        this._getWindows = AltTab.getWindows;
        AltTab.getWindows = x => this._getWindows(x).filter((w, i, a) => !w.minimized);
    }

    disable() {
        AltTab.getWindows = this._getWindows;
        delete this._getWindows;
    }
});

const UpdatesIndicator = GObject.registerClass(
class UpdatesIndicator extends GObject.Object{
    _init() {
        super._init();
    }

    _checkUpdates() {
        let proc = new Gio.Subprocess({
            argv: ['/bin/bash', '-c', gsettings.get_string(Fields.CHECKUPDATES)],
            flags: Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE,
        });
        proc.init(null);
        proc.communicate_utf8_async(null, null, (proc, res) => {
            try {
                let [, stdout, stderr] = proc.communicate_utf8_finish(res);
                if(proc.get_exit_status() == 0)
                    this._showUpdates(stdout.trim());
            } catch(e) {
                Main.notifyError(Me.metadata.name, e.message);
            }
        });
    }

    _showUpdates(count) {
        if(!this._button) return;
        if(count == '0') {
            this._button.hide();
            this._checkUpdated();
        } else {
            let dir = Gio.file_new_for_path(gsettings.get_string(Fields.UPDATESDIR));
            this._fileMonitor = dir.monitor_directory(Gio.FileMonitorFlags.NONE, null);
            this._fileChangedId = this._fileMonitor.connect('changed', () => {
                GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 10, () => {
                    this._checkUpdates();
                    return GLib.SOURCE_REMOVE;
                });
            });
            this._button.label.set_text(count.toString());
            this._button.show();
        }
    }

    _addButton() {
        this._button = new PanelMenu.Button(0, 'Updates Indicator', true);
        let box = new St.BoxLayout({
            vertical: false,
            style_class: 'panel-status-menu-box'
        });
        let icon = new St.Icon({
            style_class: 'system-status-icon',
            icon_name: 'software-update-available-symbolic',
        });
        this._button.label = new St.Label({
            y_expand: false,
            text: '0',
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
        this._addButton();
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
        let feilds = [
            Fields.AUTOSWITCH,
            Fields.USECUSTOMFONT,
            Fields.ENABLEORIEN,
            Fields.ENABLEMSTHEME,
            Fields.ACTIVITIES,
            Fields.MINIMIZED,
            Fields.ENABLEUPDATES
        ];
        this._extensions = [
            new IBusAutoSwitch(),
            new IBusFontSetting(),
            new IBusOrientation(),
            new IBusThemeManager(),
            new ActivitiesHide(),
            new MinimizedHide(),
            new UpdatesIndicator()
        ];
        this._extensions.forEach((x,i) => {
            x._active = gsettings.get_boolean(feilds[i]);
            if(x._active) x.enable();
            x._activeId = gsettings.connect(`changed::${feilds[i]}`, () => {
                x._active ? x.disable() : x.enable();
                x._active = !x._active;
            });
        });
    }

    disable() {
        this._extensions.forEach(x => {
            if(x._active) x.disable();
            if(x._activeId) gsettings.disconnect(x._activeId), x._activeId = 0;
        });
        this._extensions = null;
    }
});

function init() {
    return new Extensions();
}

