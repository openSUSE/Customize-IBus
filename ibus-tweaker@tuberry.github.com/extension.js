// vim:fdm=syntax
// by tuberry@github

const Main = imports.ui.main;
const BoxPointer = imports.ui.boxpointer;
const { Shell, Meta, IBus, Clutter, Pango, St, GObject, Atspi, Gdk } = imports.gi;

const IBusManager = imports.misc.ibusManager.getIBusManager();
const CandidatePopup = IBusManager._candidatePopup;
const CandidateArea = CandidatePopup._candidateArea;

const ExtensionUtils = imports.misc.extensionUtils;
const gsettings = ExtensionUtils.getSettings();
const Me = ExtensionUtils.getCurrentExtension();
const Fields = Me.imports.prefs.Fields;

const IBusAutoSwitch = GObject.registerClass(
class IBusAutoSwitch extends GObject.Object {
    _init() {
        super._init();
        this._states = {};
        this._tmpFocusWindow = '';
        this._focusedInput = true;
        this._asciiMode = ['en', 'EN', 'A', '英'];
    }

    _getInputState() {
        let inputList = Main.panel.statusArea['keyboard'].get_child_at_index(0).get_child_at_index(0);
        if(inputList.length === 1) IBusManager._spawn(['-rd']);
        let current = inputList.get_children().toString().split(',').findIndex(x => x.includes('last-child'));

        return inputList.get_child_at_index(current).toString().split('"')[1];
    }

    _onWindowChanged() {
        if(this._cursorInId) {
            IBusManager.disconnect(this._cursorInId);
            this._focusedInput = false;
            this._cursorInId = null;
        } else {
            this._focusedInput = true;
        }

        if(this._checkStatus())
            this._cursorInId = IBusManager.connect('set-cursor-location', this._onInputStatus.bind(this));
    }

    _checkStatus() {
        let fw = global.display.get_focus_window();
        if(!fw || !this._enableSwitch)
            return false;

        let tmpInputSourceState = this._asciiMode.includes(this._getInputState());
        let lastFocusWindow = this._tmpFocusWindow;
        if(this._focusedInput)
            this._states[lastFocusWindow] = tmpInputSourceState;
        this._tmpFocusWindow = fw.wm_class;

        if(this._states[fw.wm_class] === undefined)
            this._states[fw.wm_class] = tmpInputSourceState;

        this._focusedInput = false;
        return tmpInputSourceState^this._states[fw.wm_class];
    }

    _onInputStatus() {
        Atspi.generate_keyboard_event(
            Gdk.keyval_from_name('Shift_L'),
            null,
            Atspi.KeySynthType.PRESSRELEASE | Atspi.KeySynthType.SYM
        );
        if(this._cursorInId)
            IBusManager.disconnect(this._cursorInId);
        this._cursorInId = null;
    }

    _toggleKeybindings(tog) {
        if(tog) {
            let ModeType = Shell.hasOwnProperty('ActionMode') ? Shell.ActionMode : Shell.KeyBindingMode;
            Main.wm.addKeybinding(Fields.SHORTCUT, gsettings, Meta.KeyBindingFlags.NONE, ModeType.ALL, () => {
                Main.openRunDialog();
                if(!this._asciiMode.includes(this._getInputState()))
                    Atspi.generate_keyboard_event(
                        Gdk.keyval_from_name('Shift_L'),
                        null,
                        Atspi.KeySynthType.PRESSRELEASE | Atspi.KeySynthType.SYM
                    );
            });
        } else {
            Main.wm.removeKeybinding(Fields.SHORTCUT);
        }
    }

    _fetchSettings() {
        this._asciiOnList = gsettings.get_string(Fields.ASCIIONLIST);
        this._asciiOffList = gsettings.get_string(Fields.ASCIIOFFLIST);
        this._enableSwitch = gsettings.get_boolean(Fields.AUTOSWITCH);
        this._shortcut = gsettings.get_boolean(Fields.ENABLEHOTKEY);
        this._asciiOnList.split('#').forEach(x => this._states[x] = true);
        this._asciiOffList.split('#').forEach(x => this._states[x] = false);
        if(this._shortcut) this._toggleKeybindings(true);
    }

    enable() {
        this._fetchSettings();
        this._keybindingId = gsettings.connect(`changed::${Fields.ENABLEHOTKEY}`, () => this._toggleKeybindings(gsettings.get_boolean(Fields.ENABLEHOTKEY)));
        this._keybindingChangedId = gsettings.connect(`changed::${Fields.SHORTCUT}`, () => this._toggleKeybindings(true));
        this._asciiOnListId = gsettings.connect(`changed::${Fields.ASCIIONLIST}`, () => {
            this._asciiOnList = gsettings.get_string(Fields.ASCIIONLIST);
            this._asciiOnList.split('#').forEach(x => this._states[x] = true);
        });
        this._asciiOffListId = gsettings.connect(`changed::${Fields.ASCIIOFFLIST}`, () => {
            this._asciiOffList = gsettings.get_string(Fields.ASCIIOFFLIST);
            this._asciiOffList.split('#').forEach(x => this._states[x] = true);
        });
        this._onWindowChangedId = global.display.connect('notify::focus-window', this._onWindowChanged.bind(this));
    }

    disable() {
        if(this._shortcut)
            Main.wm.removeKeybinding(Fields.SHORTCUT);
        if(this._onWindowChangedId)
            global.display.disconnect(this._onWindowChangedId), this._onWindowChangedId = null;
        if(this._cursorInId)
            IBusManager.disconnect(this._cursorInId), this._cursorInId = null;
        if(this._keybindingId)
            gsettings.disconnect(this._keybindingId), this._keybindingId = null;
        if(this._keybindingChangedId)
            gsettings.disconnect(this._keybindingChangedId), this._keybindingChangedId = null;
        if(this._asciiOnListId)
            gsettings.disconnect(this._asciiOnListId), this._asciiOnListId = null;
        if(this._asciiOffListId)
            gsettings.disconnect(this._asciiOffListId), this._asciiOffListId = null;
    }
});

const IBusFontSetting = GObject.registerClass(
class IBusFontSetting extends GObject.Object {
    _init() {
        super._init();
    }

    _onFontChanged() {
        let temp = 'font-weight: %d; font-family: "%s"; font-size: %d%s; font-style: %s;';
        let desc = Pango.FontDescription.from_string(gsettings.get_string(Fields.CUSTOMFONT));
        let get_weight = () => { try { return desc.get_weight(); } catch(e) { return parseInt(e.message); } }; //fix Pango.Weight enumeration exception (eg: 290) in some fonts
        CandidatePopup.set_style(temp.format(
            get_weight(),
            desc.get_family(),
            desc.get_size() / Pango.SCALE,
            desc.get_size_is_absolute() ? 'px' : 'pt',
            Object.keys(Pango.Style)[desc.get_style()].toLowerCase()
        ));
    }

    enable() {
        this._onFontChanged();
        this._customFontId = gsettings.connect(`changed::${Fields.CUSTOMFONT}`, this._onFontChanged.bind(this));
    }

    disable() {
        if (this._customFontId)
            gsettings.disconnect(this._customFontId), this._customFontId = 0;
        CandidatePopup.set_style('');
    }
});

const IBusOrientation = GObject.registerClass(
class IBusOrientation extends GObject.Object {
    _init() {
        super._init();
        // some Chinese IME (ibus-rime or ibus-sunpinyin) do not obey the orientation setting of IBus
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
        let color = this._palatte[gsettings.get_uint(Fields.MSTHEMECOLOUR)];
        let func = x => x.split('candidate').join('ibus-tweaker-' + color + '-candidate');
        this._addStyleClass(this._popup, CandidatePopup, func);
    }

    enable() {
        this._onThemeChanged();
        this._themeChangedId = gsettings.connect(`changed::${Fields.MSTHEMECOLOUR}`, this._onThemeChanged.bind(this));
    }

    disable() {
        if(this._themeChangedId)
            gsettings.disconnect(this._themeChangedId), this._themeChangedId = 0;
        this._addStyleClass(this._popup, CandidatePopup, x => x);
    }
});

const ActivitiesHide = GObject.registerClass(
class ActivitiesHide extends GObject.Object{
    _init() {
        super._init();
        this._activities = Main.panel.statusArea['activities'];
    }

    enable() {
        this._activities.container.hide();
    }

    disable() {
        this._activities.container.show();
    }
});

const Extensions = GObject.registerClass(
class Extensions extends GObject.Object{
    _init() {
        super._init();
        this._feilds = [Fields.AUTOSWITCH, Fields.USECUSTOMFONT, Fields.ENABLEORIEN, Fields.ENABLEMSTHEME, Fields.ACTIVITIES];
    }

    enable() {
        this._extensions = [new IBusAutoSwitch(), new IBusFontSetting(), new IBusOrientation(), new IBusThemeManager(), new ActivitiesHide()];
        this._extensions.forEach((x,i) => {
            x._active = gsettings.get_boolean(this._feilds[i]);
            if(x._active) x.enable();
            x._activeId = gsettings.connect(`changed::${this._feilds[i]}`, () => {
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

