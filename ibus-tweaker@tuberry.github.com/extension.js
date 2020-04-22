// vim:fdm=syntax
// by tuberry@github
const { Shell, Meta, Gio, IBus, Clutter, Pango, St, GObject, Atspi, Gdk } = imports.gi;
const Main = imports.ui.main;
const IBusManager = imports.misc.ibusManager.getIBusManager();
const ExtensionUtils = imports.misc.extensionUtils;
const gsettings = ExtensionUtils.getSettings();
const Me = ExtensionUtils.getCurrentExtension();
const Prefs = Me.imports.prefs;

const IBusAutoSwitch = GObject.registerClass(
class IBusAutoSwitch extends GObject.Object {
    _init() {
        super._init();
        this._states = {};
        this._tmpFocusWindow = 'None';
        this._focusedInput = true;
        this._asciiMode = ['en', 'A', '英'];
    }

    _getInputState() {
        //tmd gnome shell
        let inputList = Main.panel.statusArea['keyboard'].get_child_at_index(0).get_child_at_index(0);
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

    _onOverviewIn() {
        if(this._cursorInId)
            IBusManager.disconnect(this._cursorInId);
        this._cursorInId = null;

        let a = this._asciiOnList.includes('overview');
        let c = this._asciiMode.includes(this._getInputState());
        if(a&!c)
            this._cursorInId = IBusManager.connect('set-cursor-location', this._onInputStatus.bind(this));
    }

    _toggleKeyBindings(enable) {
        if(enable) {
            let ModeType = Shell.hasOwnProperty('ActionMode') ? Shell.ActionMode : Shell.KeyBindingMode;
            Main.wm.addKeybinding(Prefs.Fields.SHORTCUT, gsettings, Meta.KeyBindingFlags.NONE, ModeType.ALL, () => {
                Main.openRunDialog();
                let c = this._asciiMode.includes(this._getInputState());

                if(!c) Atspi.generate_keyboard_event(
                    Gdk.keyval_from_name('Shift_L'),
                    null,
                    Atspi.KeySynthType.PRESSRELEASE | Atspi.KeySynthType.SYM
                );
            });
        } else {
            Main.wm.removeKeybinding(Prefs.Fields.SHORTCUT);
        }
    }

    _fetchSettings() {
        this._asciiOnList = gsettings.get_string(Prefs.Fields.ASCIIONLIST);
        this._asciiOffList = gsettings.get_string(Prefs.Fields.ASCIIOFFLIST);
        this._enableSwitch = gsettings.get_boolean(Prefs.Fields.AUTOSWITCH);
        this._shortcut = gsettings.get_boolean(Prefs.Fields.ENABLEHOTKEY);
        this._asciiOnList.split('#').forEach(x => this._states[x] = true);
        this._asciiOffList.split('#').forEach(x => this._states[x] = false);
    }

    enable() {
        this._fetchSettings();
        if(this._shortcut)
            this._toggleKeyBindings(true);
        this._onSettingChangedId = gsettings.connect('changed',() => {
            let tmpshortcut = gsettings.get_boolean(Prefs.Fields.ENABLEHOTKEY);
            if(tmpshortcut != this._shortcut)
                this._toggleKeyBindings(tmpshortcut);
            this._fetchSettings();
        });
        this._onWindowChangedId = global.display.connect('notify::focus-window', this._onWindowChanged.bind(this));
        this._overviewInId = Main.overview.connect('showing', this._onOverviewIn.bind(this));
    }

    disable() {
        if(this._onWindowChangedId)
            global.display.disconnect(this._onWindowChangedId), this._onWindowChangedId = null;
        if(this._cursorInId)
            IBusManager.disconnect(this._cursorInId), this._cursorInId = null;
        if(this._onSettingChangedId)
            gsettings.disconnect(this._onSettingChangedId), this._onSettingChangedId = null;
        if(this._overviewInId)
            Main.overview.disconnect(this._overviewInId), this._overviewInId = null;
        if(this._shortcut)
            Main.wm.removeKeybinding(Prefs.Fields.SHORTCUT);
    }
});

const IBusFontSetting = GObject.registerClass(
class IBusFontSetting extends GObject.Object {
    _init() {
        super._init();
        this._settings = new Gio.Settings({ schema_id: 'org.freedesktop.ibus.panel' });
        this._candidate = IBusManager._candidatePopup;
    }

    _onFontChanged() {
        if (!this._settings.get_boolean('use-custom-font'))
            return;
        let font;
        let fontDesc = Pango.FontDescription.from_string(this._settings.get_string('custom-font'));
        let fontTran = (a, b, c, d) => 'font-family: %s; font-size: %s; font-weight: %d; font-style: %s;'.format(a, b, c, d);

        if (fontDesc.get_size_is_absolute()) {
            font = fontTran(fontDesc.get_family(), fontDesc.get_size()/1024.+'px', fontDesc.get_weight(), fontDesc.get_style());
        } else {
            font = fontTran(fontDesc.get_family(), fontDesc.get_size()/1024.+'pt', fontDesc.get_weight(), fontDesc.get_style());
        }
        this._candidate.set_style(font);
    }

    enable() {
        this._useCustomFontId = this._settings.connect('changed::use-custom-font', this._onFontChanged.bind(this));
        this._customFontId = this._settings.connect('changed::custom-font', this._onFontChanged.bind(this));
        this._onFontChanged();
    }

    disable() {
        if (this._useCustomFontId)
            this._settings.disconnect(this._useCustomFontId);
        if (this._customFontId)
            this._settings.disconnect(this._customFontId);
        this._candidate.set_style('');
    }

});

const ActivitiesHide = GObject.registerClass(
class ActivitiesHide extends GObject.Object{
    _init() {
        super._init();
        this._activities= Main.panel.statusArea['activities'];
    }

    enable() {
        this._toggle();
        this._enableActivitiesId = gsettings.connect('changed::'+Prefs.Fields.ACTIVITIES, this._toggle.bind(this));
    }

    _toggle() {
        if(gsettings.get_boolean(Prefs.Fields.ACTIVITIES)) {
            this._activities.container.hide();
        } else {
            this._activities.container.show();
        }
    }

    disable() {
        if(this._enableActivitiesId)
            gsettings.disconnect(this._enableActivitiesId), this._enableActivitiesId = null;
    }
});

const Extensions = GObject.registerClass(
class Extensions extends GObject.Object{
    _init() {
        super._init();
        this._exts = [new ActivitiesHide(), new IBusAutoSwitch(), new IBusFontSetting()];
    }

    enable() {
        this._exts.forEach(x => x.enable());
    }

    disable() {
        this._exts.forEach(x => x.disable());
    }
});

function init() {
    return new Extensions();
}

