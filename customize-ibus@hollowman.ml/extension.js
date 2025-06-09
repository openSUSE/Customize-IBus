// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-
// vim:fdm=syntax
// by hollowman6@github tuberry@github

'use strict';

/* Imports */
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import IBus from 'gi://IBus';
import Pango from 'gi://Pango';
import St from 'gi://St';

import {
    Extension,
    gettext as _,
} from 'resource:///org/gnome/shell/extensions/extension.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as Util from 'resource:///org/gnome/shell/misc/util.js';
import {loadInterfaceXML} from 'resource:///org/gnome/shell/misc/fileUtils.js';
const System = {
    LIGHT: 'night-light-enabled',
    PROPERTY: 'g-properties-changed',
    BUS_NAME: 'org.gnome.SettingsDaemon.Color',
    OBJECT_PATH: '/org/gnome/SettingsDaemon/Color',
};
const ColorInterface = loadInterfaceXML(System.BUS_NAME);
const ColorProxy = Gio.DBusProxy.makeProxyWrapper(ColorInterface);

import * as BoxPointer from 'resource:///org/gnome/shell/ui/boxpointer.js';
import * as keyboard from 'resource:///org/gnome/shell/ui/status/keyboard.js';
import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js';
const InputSourcePopup = keyboard.InputSourcePopup;
const InputSourceIndicator = Main.panel.statusArea.keyboard;
import * as IBusManagerImported from 'resource:///org/gnome/shell/misc/ibusManager.js';

let Me = null;
let InputSourceManager = null;
let IBusManager = null;
let CandidatePopup = null;
let CandidateArea = null;
let CandidateDummyCursor = null;
let gsettings = null;

import {Fields} from './fields.js';
const IBUS_SYSTEMD_SERVICE = 'org.freedesktop.IBus.session.GNOME.service';
const UNKNOWN = {ON: 0, OFF: 1, DEFAULT: 2};
const ASCIIMODES = ['en', 'A', '英'];
const INDICATORANI = ['NONE', 'SLIDE', 'FADE', 'FULL'];
const INPUTMODE = 'InputMode';
const BGMODES = ['Centered', 'Repeated', 'Zoom'];
const BGREPEATMODES = ['no-repeat', 'repeat'];
const BGMODESACTIONS = {
    Centered: 'auto',
    Repeated: 'contain',
    Zoom: 'cover',
};

let IgnoreModes = [];
let IBusSettings = null;
let ngsettings = null;
let opacityStyle = '';
let fontStyle = '';

/* General */
// Candidates orientation
const IBusOrientation = GObject.registerClass(
    {
        Properties: {
            orientation: GObject.param_spec_uint(
                'orientation',
                'orientation',
                'orientation',
                0,
                1,
                1,
                GObject.ParamFlags.WRITABLE
            ),
        },
    },
    class IBusOrientation extends GObject.Object {
        constructor() {
            super();
            this._originalSetOrientation =
                CandidateArea.setOrientation.bind(CandidateArea);
            CandidateArea.setOrientation = () => {};
            gsettings.bind(
                Fields.ORIENTATION,
                this,
                'orientation',
                Gio.SettingsBindFlags.GET
            );
            this._orienChangeID = IBusSettings.connect(
                `changed::lookup-table-orientation`,
                () => {
                    let value = IBusSettings.get_int(
                        'lookup-table-orientation'
                    );
                    gsettings.set_uint(Fields.ORIENTATION, 1 - value);
                }
            );
        }

        set orientation(orientation) {
            this._originalSetOrientation(
                orientation
                    ? IBus.Orientation.HORIZONTAL
                    : IBus.Orientation.VERTICAL
            );
            IBusSettings.set_int('lookup-table-orientation', 1 - orientation);
        }

        destroy() {
            CandidateArea.setOrientation = this._originalSetOrientation;
            if (this._orienChangeID)
                IBusSettings.disconnect(this._orienChangeID),
                    (this._orienChangeID = 0);
        }
    }
);

// Candidates popup animation
const IBusAnimation = GObject.registerClass(
    {
        Properties: {
            animation: GObject.param_spec_uint(
                'animation',
                'animation',
                'animation',
                0,
                3,
                3,
                GObject.ParamFlags.WRITABLE
            ),
        },
    },
    class IBusAnimation extends GObject.Object {
        constructor() {
            super();
            this._openOrig = CandidatePopup.open;
            gsettings.bind(
                Fields.CANDANIMATION,
                this,
                'animation',
                Gio.SettingsBindFlags.GET
            );
        }

        set animation(animation) {
            const openOrig = this._openOrig;
            if (INDICATORANI[animation] === 'NONE') this.destroy();
            else if (INDICATORANI[animation] === 'FADE')
                CandidatePopup.open = () => {
                    openOrig.call(
                        CandidatePopup,
                        BoxPointer.PopupAnimation.FADE
                    );
                };
            else if (INDICATORANI[animation] === 'SLIDE')
                CandidatePopup.open = () => {
                    openOrig.call(
                        CandidatePopup,
                        BoxPointer.PopupAnimation.SLIDE
                    );
                };
            else if (INDICATORANI[animation] === 'FULL')
                CandidatePopup.open = () => {
                    openOrig.call(
                        CandidatePopup,
                        BoxPointer.PopupAnimation.FULL
                    );
                };
        }

        destroy() {
            if (this._openOrig) CandidatePopup.open = this._openOrig;
        }
    }
);

// Candidate box right click
const IBusClickSwitch = GObject.registerClass(
    {
        Properties: {
            switchfunction: GObject.param_spec_uint(
                'switchfunction',
                'switchfunction',
                'switchfunction',
                0,
                1,
                0,
                GObject.ParamFlags.READWRITE
            ),
        },
    },
    class IBusClickSwitch extends GObject.Object {
        constructor() {
            super();
            gsettings.bind(
                Fields.CANDRIGHTFUNC,
                this,
                'switchfunction',
                Gio.SettingsBindFlags.GET
            );
            CandidatePopup.reactive = true;
            let seat = global.stage.context.get_backend().get_default_seat();
            this._virtualDevice = seat.create_virtual_device(
                Clutter.InputDeviceType.KEYBOARD_DEVICE
            );

            this._mouseCandidateEnterID = CandidateArea.connect(
                'enter-event',
                () => {
                    this._mouseInCandidate = true;
                }
            );
            this._mouseCandidateLeaveID = CandidateArea.connect(
                'leave-event',
                () => {
                    this._mouseInCandidate = false;
                }
            );
            this._buttonPressID = CandidatePopup.connect(
                'button-press-event',
                (actor, event) => {
                    let rightButton = 'BUTTON3_MASK';
                    if (Meta.is_wayland_compositor())
                        rightButton = 'BUTTON2_MASK';
                    if (event.get_state() & Clutter.ModifierType[rightButton]) {
                        let shouldPressReturn =
                            !this._mouseInCandidate || !this._clickSwitch;
                        if (shouldPressReturn) {
                            this._virtualDevice.notify_keyval(
                                Clutter.get_current_event_time() * 1000,
                                Clutter.KEY_Return,
                                Clutter.KeyState.PRESSED
                            );
                            this._virtualDevice.notify_keyval(
                                Clutter.get_current_event_time() * 1000,
                                Clutter.KEY_Return,
                                Clutter.KeyState.RELEASED
                            );
                        }
                        this._delayAfterPress = GLib.timeout_add(
                            GLib.PRIORITY_DEFAULT,
                            10,
                            () => {
                                if (shouldPressReturn)
                                    CandidatePopup.close(
                                        BoxPointer.PopupAnimation.NONE
                                    );
                                if (this._clickSwitch) {
                                    IBusManager.activateProperty(
                                        INPUTMODE,
                                        IBus.PropState.CHECKED
                                    );
                                } else {
                                    InputSourceIndicator.menu.open(
                                        InputSourceIndicator.menu.activeMenu
                                            ? BoxPointer.PopupAnimation.FADE
                                            : BoxPointer.PopupAnimation.FULL
                                    );
                                    Main.panel.menuManager.ignoreRelease();
                                }
                                this._delayAfterPress = null;
                                return GLib.SOURCE_REMOVE;
                            }
                        );
                    }
                }
            );
        }

        set switchfunction(switchfunction) {
            this._clickSwitch = switchfunction === 0 ? false : true;
        }

        destroy() {
            if (this._buttonPressID)
                CandidatePopup.disconnect(this._buttonPressID),
                    (this._buttonPressID = 0);
            if (this._mouseCandidateEnterID)
                CandidateArea.disconnect(this._mouseCandidateEnterID),
                    (this._mouseCandidateEnterID = 0);
            if (this._mouseCandidateLeaveID)
                CandidateArea.disconnect(this._mouseCandidateLeaveID),
                    (this._mouseCandidateLeaveID = 0);
            if (this._delayAfterPress) {
                GLib.source_remove(this._delayAfterPress);
                this._delayAfterPress = null;
            }
            if (this._virtualDevice) {
                // Make sure any buttons pressed by the virtual device are released
                // immediately instead of waiting for the next GC cycle
                this._virtualDevice.run_dispose();
            }
            delete this.candidateBoxesID;
        }
    }
);

// Candidates scroll
const IBusScroll = GObject.registerClass(
    {
        Properties: {
            scrollmode: GObject.param_spec_uint(
                'scrollmode',
                'scrollmode',
                'scroll mode',
                0,
                1,
                1,
                GObject.ParamFlags.WRITABLE
            ),
        },
    },
    class IBusScroll extends GObject.Object {
        constructor() {
            super();

            gsettings.bind(
                Fields.SCROLLMODE,
                this,
                'scrollmode',
                Gio.SettingsBindFlags.GET
            );
        }

        set scrollmode(scrollmode) {
            if (scrollmode) this.destroy();
            else this.scroll_page();
        }

        scroll_page() {
            this._scrollID = CandidateArea.connect(
                'scroll-event',
                (actor, scrollEvent) => {
                    switch (scrollEvent.get_scroll_direction()) {
                        case Clutter.ScrollDirection.UP:
                            CandidateArea.emit('previous-page');
                            CandidateArea.emit('cursor-down');
                            break;
                        case Clutter.ScrollDirection.DOWN:
                            CandidateArea.emit('next-page');
                            CandidateArea.emit('cursor-up');
                            break;
                    }
                }
            );
        }

        destroy() {
            if (this._scrollID)
                CandidateArea.disconnect(this._scrollID), (this._scrollID = 0);
        }
    }
);

// Fix Candidate box
const IBusNotFollowCaret = GObject.registerClass(
    {
        Properties: {
            position: GObject.param_spec_uint(
                'position',
                'position',
                'position',
                0,
                8,
                0,
                GObject.ParamFlags.READWRITE
            ),
            remember: GObject.param_spec_uint(
                'remember',
                'remember',
                'remember',
                0,
                1,
                1,
                GObject.ParamFlags.READWRITE
            ),
        },
    },
    class IBusNotFollowCaret extends GObject.Object {
        constructor() {
            super();
            this._setDummyCursorGeometryOrig =
                IBusManager._candidatePopup._setDummyCursorGeometry;
            IBusManager._candidatePopup._setDummyCursorGeometry = (
                x,
                y,
                w,
                h
            ) => {
                CandidateDummyCursor.set_size(Math.round(w), Math.round(h));
                if (CandidatePopup.visible)
                    CandidatePopup.setPosition(CandidateDummyCursor, 0);
            };
            gsettings.bind(
                Fields.CANDSTILLPOS,
                this,
                'position',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.REMCANDPOS,
                this,
                'remember',
                Gio.SettingsBindFlags.GET
            );
        }

        set position(position) {
            this._position = position;
            this.update_pos();
        }

        set remember(remember) {
            this._remember = remember;
            this.update_pos();
        }

        update_pos() {
            let x = 0,
                y = 0,
                successGetRem = false;
            if (this._remember && !this._hasSetRember) {
                let state = new Map(
                    Object.entries(
                        gsettings.get_value(Fields.CANDBOXPOS).deep_unpack()
                    )
                );
                if (state.has('x') && state.has('y')) {
                    x = state.get('x');
                    y = state.get('y');
                    successGetRem = true;
                }
            }
            if (!successGetRem) {
                switch (this._position) {
                    case 1:
                        x = global.screen_width / 30;
                        y = global.screen_height / 3;
                        break;
                    case 2:
                        x = global.screen_width / 30;
                        y = global.screen_height / 30;
                        break;
                    case 3:
                        x = global.screen_width / 3;
                        y = global.screen_height / 30;
                        break;
                    case 4:
                        x = (global.screen_width / 3) * 2;
                        y = global.screen_height / 30;
                        break;
                    case 5:
                        x = (global.screen_width / 3) * 2;
                        y = global.screen_height / 3;
                        break;
                    case 6:
                        x = (global.screen_width / 3) * 2;
                        y = (global.screen_height / 3) * 2;
                        break;
                    case 7:
                        x = global.screen_width / 3;
                        y = (global.screen_height / 3) * 2;
                        break;
                    case 8:
                        x = global.screen_width / 30;
                        y = (global.screen_height / 3) * 2;
                        break;
                    case 0:
                    default:
                        x = global.screen_width / 3;
                        y = global.screen_height / 3;
                }
            }
            CandidateDummyCursor.set_position(Math.round(x), Math.round(y));
            if (CandidatePopup.visible)
                CandidatePopup.setPosition(CandidateDummyCursor, 0);
            if (this._remember) this._hasSetRember = true;
        }

        destroy() {
            if (this._setDummyCursorGeometryOrig)
                IBusManager._candidatePopup._setDummyCursorGeometry =
                    this._setDummyCursorGeometryOrig;
        }
    }
);

// Use custom font
const IBusFontSetting = GObject.registerClass(
    {
        Properties: {
            fontname: GObject.param_spec_string(
                'fontname',
                'fontname',
                'font name',
                'Sans 16',
                GObject.ParamFlags.WRITABLE
            ),
        },
    },
    class IBusFontSetting extends GObject.Object {
        constructor() {
            super();
            gsettings.bind(
                Fields.CUSTOMFONT,
                this,
                'fontname',
                Gio.SettingsBindFlags.GET
            );
            this._fontChangeID = IBusSettings.connect(
                `changed::${Fields.CUSTOMFONT}`,
                () => {
                    let value = IBusSettings.get_string(Fields.CUSTOMFONT);
                    gsettings.set_string(Fields.CUSTOMFONT, value);
                }
            );
        }

        set fontname(fontname) {
            IBusSettings.set_string(Fields.CUSTOMFONT, fontname);
            let scale = 15 / 16; // the fonts-size difference between index and candidate
            let desc = Pango.FontDescription.from_string(fontname);
            let get_weight = () => {
                try {
                    return desc.get_weight();
                } catch (e) {
                    return parseInt(e.message);
                }
            }; // hack for Pango.Weight enumeration exception (eg: 290) in some fonts
            fontStyle =
                'font-weight: %d; font-family: "%s"; font-size: %dpt; font-style: %s;'.format(
                    get_weight(),
                    desc.get_family(),
                    (desc.get_size() / Pango.SCALE) * scale,
                    Object.keys(Pango.Style)[desc.get_style()].toLowerCase()
                );
            CandidatePopup.set_style(fontStyle + opacityStyle);
            CandidateArea._candidateBoxes.forEach(x => {
                x._candidateLabel.set_style(
                    'font-size: %dpt;'.format(desc.get_size() / Pango.SCALE)
                );
                x._indexLabel.set_style(
                    'padding: %dpx 4px 0 0;'.format((1 - scale) * 2)
                );
            });
        }

        destroy() {
            fontStyle = '';
            CandidatePopup.set_style(fontStyle + opacityStyle);
            CandidateArea._candidateBoxes.forEach(x => {
                x._candidateLabel.set_style('');
                x._indexLabel.set_style('');
            });
            if (this._fontChangeID)
                IBusSettings.disconnect(this._fontChangeID),
                    (this._fontChangeID = 0);
        }
    }
);

// Auto switch ASCII mode
const IBusAutoSwitch = GObject.registerClass(
    {
        Properties: {
            unknown: GObject.param_spec_uint(
                'unknown',
                'unknown',
                'unknown',
                0,
                2,
                0,
                GObject.ParamFlags.READWRITE
            ),
            remember: GObject.param_spec_uint(
                'remember',
                'remember',
                'remember',
                0,
                1,
                1,
                GObject.ParamFlags.WRITABLE
            ),
        },
    },
    class IBusAutoSwitch extends GObject.Object {
        constructor() {
            super();
            this._bindSettings();
            this._tmpWindow = null;
            this.last_null = false;
            this._overviewHiddenID = Main.overview.connect(
                'hidden',
                this._onWindowChanged.bind(this)
            );
            this._overviewShowingID = Main.overview.connect(
                'showing',
                this._onWindowChanged.bind(this)
            );
            this._onWindowChangedID = global.display.connect(
                'notify::focus-window',
                this._onWindowChanged.bind(this)
            );
        }

        get _state() {
            const text =
                InputSourceIndicator._indicatorLabels[
                    InputSourceManager.currentSource.index
                ].get_text();
            return ASCIIMODES.includes(text);
        }

        get _toggle() {
            let win = InputSourceManager._getCurrentWindow();
            if (!win) {
                this.last_null = true;
                return false;
            }
            if (this.last_null) {
                this.last_null = false;
                return false;
            }
            let state = this._state;
            let stateConf = false;
            if (this._remember) {
                let store = this._states.get(this._tmpWindow);
                if (state !== store) this._states.set(this._tmpWindow, state);
                this._tmpWindow = win.wm_class
                    ? win.wm_class.toLowerCase()
                    : 'undefined';
                if (this._tmpWindow === 'undefined') return false;
                if (!this._states.has(this._tmpWindow)) {
                    let unknown =
                        this.unknown === UNKNOWN.DEFAULT
                            ? state
                            : this.unknown === UNKNOWN.ON;
                    this._states.set(this._tmpWindow, unknown);
                }
                stateConf = this._states.get(this._tmpWindow);
            } else {
                stateConf =
                    this.unknown === UNKNOWN.DEFAULT
                        ? state
                        : this.unknown === UNKNOWN.ON;
            }

            return state ^ stateConf;
        }

        set remember(remember) {
            this._remember = remember;
        }

        _onWindowChanged() {
            if (this._toggle && IBusManager._panelService) {
                IBusManager.activateProperty(INPUTMODE, IBus.PropState.CHECKED);
            }
        }

        _bindSettings() {
            gsettings.bind(
                Fields.REMEMBERINPUT,
                this,
                'remember',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.UNKNOWNSTATE,
                this,
                'unknown',
                Gio.SettingsBindFlags.GET
            );
            this._states = new Map(
                Object.entries(
                    gsettings.get_value(Fields.INPUTLIST).deep_unpack()
                )
            );
        }

        destroy() {
            gsettings.set_value(
                Fields.INPUTLIST,
                new GLib.Variant('a{sb}', Object.fromEntries(this._states))
            );
            if (this._onWindowChangedID)
                global.display.disconnect(this._onWindowChangedID),
                    (this._onWindowChangedID = 0);
            if (this._overviewShowingID)
                Main.overview.disconnect(this._overviewShowingID),
                    (this._overviewShowingID = 0);
            if (this._overviewHiddenID)
                Main.overview.disconnect(this._overviewHiddenID),
                    (this._overviewHiddenID = 0);
        }
    }
);

// Candidate box opacity
const IBusOpacity = GObject.registerClass(
    {
        Properties: {
            opacity: GObject.param_spec_uint(
                'opacity',
                'opacity',
                'opacity',
                0,
                255,
                255,
                GObject.ParamFlags.WRITABLE
            ),
        },
    },
    class IBusOpacity extends GObject.Object {
        constructor() {
            super();

            this._area_opacity = CandidateArea.get_opacity();
            this._child_opacity = [];
            let candidate_child = CandidatePopup.bin.get_children();
            for (let i in candidate_child) {
                this._child_opacity.push(candidate_child[i].get_opacity());
            }
            gsettings.bind(
                Fields.CANDOPACITY,
                this,
                'opacity',
                Gio.SettingsBindFlags.GET
            );
        }

        set opacity(opacity) {
            this._opacity = opacity;
            this._update_opacity();
        }

        _update_opacity() {
            if (this._themeContextChangedID)
                this._themeContext.disconnect(this._themeContextChangedID),
                    (this._themeContextChangedID = 0);

            CandidateArea.set_opacity(this._opacity);
            let candidate_child = CandidatePopup.bin.get_children();
            for (let i in candidate_child)
                candidate_child[i].set_opacity(this._opacity);

            // To get the theme color and modify its opacity
            opacityStyle = '';
            CandidatePopup.set_style(fontStyle + opacityStyle);
            let themeNode = CandidatePopup.get_theme_node();
            let backgroundColor = themeNode.get_color(
                '-arrow-background-color'
            );
            if (backgroundColor.alpha !== 0) {
                opacityStyle =
                    '-arrow-background-color: rgba(%d, %d, %d, %f);'.format(
                        backgroundColor.red,
                        backgroundColor.green,
                        backgroundColor.blue,
                        this._opacity / 255
                    );
            }
            CandidatePopup.set_style(fontStyle + opacityStyle);
            this._themeContext = St.ThemeContext.get_for_stage(global.stage);
            this._themeContextChangedID = this._themeContext.connect(
                'changed',
                this._update_opacity.bind(this)
            );
        }

        destroy() {
            if (this._area_opacity)
                CandidateArea.set_opacity(this._area_opacity);
            if (this._child_opacity) {
                let candidate_child = CandidatePopup.bin.get_children();
                for (let i in candidate_child)
                    candidate_child[i].set_opacity(this._child_opacity[i]);
            }

            if (this._themeContextChangedID)
                this._themeContext.disconnect(this._themeContextChangedID),
                    (this._themeContextChangedID = 0);
            opacityStyle = '';
            CandidatePopup.set_style(fontStyle + opacityStyle);
        }
    }
);

// Fix IME List order
const IBusFixIMEList = GObject.registerClass(
    class IBusFixIMEList extends GObject.Object {
        constructor() {
            super();
            // Solution Provided by
            // https://github.com/AlynxZhou/gnome-shell-extension-fixed-ime-list/blob/master/extension.js

            // A dirty hack to stop updating the annoying MRU IME list.
            InputSourceManager._currentInputSourceChangedOrig =
                InputSourceManager._currentInputSourceChanged;
            InputSourceManager._currentInputSourceChanged = function (
                newSource
            ) {
                let oldSource;
                [oldSource, this._currentSource] = [
                    this._currentSource,
                    newSource,
                ];

                this.emit('current-source-changed', oldSource);
                this._changePerWindowSource();
            };

            // I don't know why they use hard coded 0 or last
            // when they have `_selectedIndex` here!
            // Maybe they never consider to use it as a initial parameter.
            // Anyway this is another dirty hack to let InputSourcePopup init
            // with `selectedIndex`.
            // Actually this is inherited from SwitcherPopup,
            // but I don't want to change other parts' behavior.
            InputSourcePopup.prototype._initialSelectionOrig =
                InputSourcePopup.prototype._initialSelection;
            InputSourcePopup.prototype._initialSelection = function (
                backward,
                _binding
            ) {
                if (backward) {
                    this._select(this._previous());
                } else if (this._items.length === 1) {
                    this._select(0);
                } else {
                    this._select(this._next());
                }
            };

            // A dirty hack to let InputSourcePopup starts from current source
            // instead of 0.
            InputSourceManager._switchInputSourceOrig =
                InputSourceManager._switchInputSource;
            InputSourceManager._switchInputSource = function (
                display,
                window,
                event,
                binding
            ) {
                if (this._mruSources.length < 2) {
                    return;
                }

                // HACK: Fall back on simple input source switching since we
                // can't show a popup switcher while a GrabHelper grab is in
                // effect without considerable work to consolidate the usage
                // of pushModal/popModal and grabHelper. See
                // https://bugzilla.gnome.org/show_bug.cgi?id=695143 .
                if (Main.actionMode === Shell.ActionMode.POPUP) {
                    // _modifiersSwitcher() always starts from current source,
                    // so we don't hook it.
                    this._modifiersSwitcher();
                    return;
                }

                this._switcherPopup = new InputSourcePopup(
                    this._mruSources,
                    this._keybindingAction,
                    this._keybindingActionBackward
                );
                this._switcherPopup.connect('destroy', () => {
                    this._switcherPopup = null;
                });
                // By default InputSourcePopup starts at 0, this is ok for MRU.
                // But we need to set popup current index to current source.
                // I think it's OK to start from 0 if we don't have current source.
                if (this._currentSource !== null) {
                    this._switcherPopup._selectedIndex =
                        this._mruSources.indexOf(this._currentSource);
                }

                if (
                    !this._switcherPopup.show(
                        binding.is_reversed(),
                        binding.get_name(),
                        binding.get_mask()
                    )
                )
                    this._switcherPopup.fadeAndDestroy();
            };

            // A dirty hack because iBus will set content type with a password entry,
            // which will call reload before unlock and after extension enable
            // so the active source changed before extension enable.
            // We need to restore what we have before locking.
            // TODO: Still some problem, there should be a better way.
            InputSourceManager.reloadOrig = InputSourceManager.reload;
            InputSourceManager.reload = function () {
                this._reloading = true;
                this._keyboardManager.setKeyboardOptions(
                    this._settings.keyboardOptions
                );
                this._inputSourcesChanged();
                // _inputSourcesChanged() will active the first one so we must
                // restore after it.
                if (
                    this.activeSource !== null &&
                    this._currentSource !== this.activeSource
                ) {
                    this.activeSource.activate(true);
                    // We only restore once.
                    this.activeSource = null;
                }
                this._reloading = false;
            };

            // A dirty hack to stop loading MRU IME list from settings.
            // This is needed for restoring the user's sequence in settings when enabling.
            InputSourceManager._updateMruSourcesOrig =
                InputSourceManager._updateMruSources;
            InputSourceManager._updateMruSources = function () {
                let sourcesList = [];
                for (let i in this._inputSources) {
                    sourcesList.push(this._inputSources[i]);
                }

                this._keyboardManager.setUserLayouts(
                    sourcesList.map(x => {
                        return x.xkbId;
                    })
                );

                if (!this._disableIBus && this._mruSourcesBackup) {
                    this._mruSources = this._mruSourcesBackup;
                    this._mruSourcesBackup = null;
                }

                let mruSources = [];
                this._mruSources = mruSources.concat(sourcesList);
            };

            // A dirty hack to stop updating MRU settings.
            // Because we stop updating MRU sources, and I don't want to touch settings.
            InputSourceManager._updateMruSettingsOrig =
                InputSourceManager._updateMruSettings;
            InputSourceManager._updateMruSettings = function () {
                // If IBus is not ready we don't have a full picture of all
                // the available sources, so don't update the setting
                if (!this._ibusReady) {
                    return;
                }

                // If IBus is temporarily disabled, don't update the setting
                if (this._disableIBus) {
                    return;
                }
            };

            // Reloading keybindings is needed because we changed the bound callback.
            Main.wm.removeKeybinding('switch-input-source');
            InputSourceManager._keybindingAction = Main.wm.addKeybinding(
                'switch-input-source',
                new Gio.Settings({
                    schema_id: 'org.gnome.desktop.wm.keybindings',
                }),
                Meta.KeyBindingFlags.NONE,
                Shell.ActionMode.ALL,
                InputSourceManager._switchInputSource.bind(InputSourceManager)
            );
            Main.wm.removeKeybinding('switch-input-source-backward');
            InputSourceManager._keybindingActionBackward =
                Main.wm.addKeybinding(
                    'switch-input-source-backward',
                    new Gio.Settings({
                        schema_id: 'org.gnome.desktop.wm.keybindings',
                    }),
                    Meta.KeyBindingFlags.IS_REVERSED,
                    Shell.ActionMode.ALL,
                    InputSourceManager._switchInputSource.bind(
                        InputSourceManager
                    )
                );

            // The input source list may already be messed.
            // So we restore it.
            InputSourceManager._mruSources = [];
            InputSourceManager._mruSourcesBackup = null;
            InputSourceManager._updateMruSources();
        }

        destroy() {
            if (
                InputSourceManager._currentInputSourceChangedOrig instanceof
                Function
            ) {
                InputSourceManager._currentInputSourceChanged =
                    InputSourceManager._currentInputSourceChangedOrig;
                InputSourceManager._currentInputSourceChangedOrig = undefined;
            }

            if (
                InputSourcePopup.prototype._initialSelectionOrig instanceof
                Function
            ) {
                InputSourcePopup.prototype._initialSelection =
                    InputSourcePopup.prototype._initialSelectionOrig;
                InputSourcePopup.prototype._initialSelectionOrig = undefined;
            }

            if (InputSourceManager._switchInputSourceOrig instanceof Function) {
                InputSourceManager._switchInputSourceSources =
                    InputSourceManager._switchInputSourceOrig;
                InputSourceManager._switchInputSourceOrig = undefined;
            }

            if (InputSourceManager.reloadOrig instanceof Function) {
                InputSourceManager.reload = InputSourceManager.reloadOrig;
                InputSourceManager.reloadOrig = undefined;
            }

            if (InputSourceManager._updateMruSourcesOrig instanceof Function) {
                InputSourceManager._updateMruSources =
                    InputSourceManager._updateMruSourcesOrig;
                InputSourceManager._updateMruSourcesOrig = undefined;
            }

            if (InputSourceManager._updateMruSettingsOrig instanceof Function) {
                InputSourceManager._updateMruSettings =
                    InputSourceManager._updateMruSettingsOrig;
                InputSourceManager._updateMruSettingsOrig = undefined;
            }

            // Bind to the original function.
            Main.wm.removeKeybinding('switch-input-source');
            InputSourceManager._keybindingAction = Main.wm.addKeybinding(
                'switch-input-source',
                new Gio.Settings({
                    schema_id: 'org.gnome.desktop.wm.keybindings',
                }),
                Meta.KeyBindingFlags.NONE,
                Shell.ActionMode.ALL,
                InputSourceManager._switchInputSource.bind(InputSourceManager)
            );
            Main.wm.removeKeybinding('switch-input-source-backward');
            InputSourceManager._keybindingActionBackward =
                Main.wm.addKeybinding(
                    'switch-input-source-backward',
                    new Gio.Settings({
                        schema_id: 'org.gnome.desktop.wm.keybindings',
                    }),
                    Meta.KeyBindingFlags.IS_REVERSED,
                    Shell.ActionMode.ALL,
                    InputSourceManager._switchInputSource.bind(
                        InputSourceManager
                    )
                );

            // Load the MRU list from settings.
            InputSourceManager._mruSources = [];
            InputSourceManager._mruSourcesBackup = null;
            InputSourceManager._updateMruSources();
            // Save active source before lock screen.
            this.activeSource = InputSourceManager._currentSource;
            // InputSourcePopup assume the first one is selected,
            // so we re-activate current source to make it the first.
            if (
                InputSourceManager._currentSource !== null &&
                InputSourceManager._mruSources[0] !==
                    InputSourceManager._currentSource
            ) {
                InputSourceManager._currentSource.activate(true);
            }
        }
    }
);

// Enable drag to reposition candidate box
const IBusReposition = GObject.registerClass(
    class IBusReposition extends GObject.Object {
        constructor() {
            super();
            CandidatePopup.reactive = true;
            this._buttonPressID = CandidatePopup.connect(
                'button-press-event',
                (actor, event) => {
                    if (
                        event.get_state() & Clutter.ModifierType.BUTTON1_MASK &&
                        !this._mouseInCandidate
                    ) {
                        let [boxX, boxY] = CandidateDummyCursor.get_position();
                        let [mouseX, mouseY] = event.get_coords();
                        CandidatePopup._relativePosX = mouseX - boxX;
                        CandidatePopup._relativePosY = mouseY - boxY;
                        global.display.set_cursor(
                            Meta.Cursor.MOVE_OR_RESIZE_WINDOW
                        );
                        this._location_handler = GLib.timeout_add(
                            GLib.PRIORITY_DEFAULT,
                            10,
                            this._updatePos.bind(this)
                        );
                    }
                }
            );

            this._mouseCandidateEnterID = CandidateArea.connect(
                'enter-event',
                () => {
                    this._mouseInCandidate = true;
                }
            );
            this._mouseCandidateLeaveID = CandidateArea.connect(
                'leave-event',
                () => {
                    this._mouseInCandidate = false;
                }
            );
            this._sideChangeID = CandidatePopup.connect(
                'arrow-side-changed',
                () => {
                    let themeNode = CandidatePopup.get_theme_node();
                    let gap = themeNode.get_length('-boxpointer-gap');
                    let padding = themeNode.get_length('-arrow-rise');
                    let [, , , natHeight] = CandidatePopup.get_preferred_size();
                    let sourceTopLeft = 0;
                    let sourceBottomRight = 0;
                    if (CandidatePopup._sourceExtents) {
                        sourceTopLeft =
                            CandidatePopup._sourceExtents.get_top_left();
                        sourceBottomRight =
                            CandidatePopup._sourceExtents.get_bottom_right();
                    }
                    if (CandidatePopup._relativePosY) {
                        switch (CandidatePopup._arrowSide) {
                            case St.Side.TOP:
                                CandidatePopup._relativePosY +=
                                    natHeight +
                                    2 * gap -
                                    sourceTopLeft.y +
                                    sourceBottomRight.y +
                                    padding;
                                break;
                            case St.Side.BOTTOM:
                                CandidatePopup._relativePosY -=
                                    natHeight +
                                    2 * gap -
                                    sourceTopLeft.y +
                                    sourceBottomRight.y +
                                    padding;
                                break;
                        }
                        this._updatePos();
                        CandidatePopup._border.queue_repaint();
                    }
                }
            );
        }

        _move(x, y) {
            CandidateDummyCursor.set_position(
                Math.round(x - CandidatePopup._relativePosX),
                Math.round(y - CandidatePopup._relativePosY)
            );
            CandidatePopup.setPosition(CandidateDummyCursor, 0);
        }

        _updatePos() {
            let [mouse_x, mouse_y, mask] = global.get_pointer();
            this._move(mouse_x, mouse_y);
            mask &= Clutter.ModifierType.BUTTON1_MASK;
            if (mask) return GLib.SOURCE_CONTINUE;
            this._location_handler = null;
            global.display.set_cursor(Meta.Cursor.DEFAULT);
            let state = new Map(
                Object.entries(
                    gsettings.get_value(Fields.CANDBOXPOS).deep_unpack()
                )
            );
            let [boxX, boxY] = CandidateDummyCursor.get_position();
            state.set('x', boxX);
            state.set('y', boxY);
            gsettings.set_value(
                Fields.CANDBOXPOS,
                new GLib.Variant('a{su}', Object.fromEntries(state))
            );
            return GLib.SOURCE_REMOVE;
        }

        destroy() {
            if (this._buttonPressID)
                CandidatePopup.disconnect(this._buttonPressID),
                    (this._buttonPressID = 0);
            if (this._sideChangeID)
                CandidatePopup.disconnect(this._sideChangeID),
                    (this._sideChangeID = 0);
            if (this._location_handler) {
                global.display.set_cursor(Meta.Cursor.DEFAULT);
                GLib.source_remove(this._location_handler),
                    (this._location_handler = 0);
            }
            if (this._mouseCandidateEnterID)
                CandidateArea.disconnect(this._mouseCandidateEnterID),
                    (this._mouseCandidateEnterID = 0);
            if (this._mouseCandidateLeaveID)
                CandidateArea.disconnect(this._mouseCandidateLeaveID),
                    (this._mouseCandidateLeaveID = 0);
            CandidatePopup._relativePosX = null;
            CandidatePopup._relativePosY = null;
        }
    }
);

/* Tray */
// Directly switch source with click
const IBusTrayClickSwitch = GObject.registerClass(
    {
        Properties: {
            traysswitchkey: GObject.param_spec_uint(
                'traysswitchkey',
                'traysswitchkey',
                'traysswitchkey',
                0,
                1,
                0,
                GObject.ParamFlags.WRITABLE
            ),
        },
    },
    class IBusTrayClickSwitch extends GObject.Object {
        constructor() {
            super();
            gsettings.bind(
                Fields.TRAYSSWITCHKEY,
                this,
                'traysswitchkey',
                Gio.SettingsBindFlags.GET
            );
        }

        set traysswitchkey(traysswitchkey) {
            if (this._buttonPressID)
                InputSourceIndicator.disconnect(this._buttonPressID),
                    (this._buttonPressID = 0);
            let keyNum = traysswitchkey === 0 ? '1' : '3';
            if (Meta.is_wayland_compositor())
                keyNum = traysswitchkey === 0 ? '1' : '2';
            this._buttonPressID = InputSourceIndicator.connect(
                'button-press-event',
                function (actor, event) {
                    if (
                        event.get_state() &
                        Clutter.ModifierType['BUTTON' + keyNum + '_MASK']
                    ) {
                        IBusManager.activateProperty(
                            INPUTMODE,
                            IBus.PropState.CHECKED
                        );
                        InputSourceIndicator.menu.close();
                    }
                }
            );
        }

        destroy() {
            if (this._buttonPressID)
                InputSourceIndicator.disconnect(this._buttonPressID),
                    (this._buttonPressID = 0);
        }
    }
);

/* Indicator */
const IBusInputSourceIndicator = GObject.registerClass(
    {
        Properties: {
            inputindtog: GObject.param_spec_boolean(
                'inputindtog',
                'inputindtog',
                'inputindtog',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            inputindASCII: GObject.param_spec_boolean(
                'inputindASCII',
                'inputindASCII',
                'inputindASCII',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            inputindsingle: GObject.param_spec_boolean(
                'inputindsingle',
                'inputindsingle',
                'inputindsingle',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            inputindrigc: GObject.param_spec_boolean(
                'inputindrigc',
                'inputindrigc',
                'inputindrigc',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            inputindscroll: GObject.param_spec_boolean(
                'inputindscroll',
                'inputindscroll',
                'inputindscroll',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            inputindanim: GObject.param_spec_uint(
                'inputindanim',
                'inputindanim',
                'inputindanim',
                0,
                3,
                1,
                GObject.ParamFlags.READWRITE
            ),
            inputindusef: GObject.param_spec_boolean(
                'inputindusef',
                'inputindusef',
                'inputindusef',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            fontname: GObject.param_spec_string(
                'fontname',
                'fontname',
                'font name',
                'Sans 16',
                GObject.ParamFlags.WRITABLE
            ),
            useinputindlclk: GObject.param_spec_boolean(
                'useinputindlclk',
                'useinputindlclk',
                'useinputindlclk',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            inputindlclick: GObject.param_spec_uint(
                'inputindlclick',
                'inputindlclick',
                'inputindlclick',
                0,
                1,
                0,
                GObject.ParamFlags.WRITABLE
            ),
            useindopacity: GObject.param_spec_boolean(
                'useindopacity',
                'useindopacity',
                'useindopacity',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            indopacity: GObject.param_spec_uint(
                'indopacity',
                'indopacity',
                'indopacity',
                0,
                255,
                255,
                GObject.ParamFlags.WRITABLE
            ),
            useindshowd: GObject.param_spec_boolean(
                'useindshowd',
                'useindshowd',
                'useindshowd',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            inputindshow: GObject.param_spec_uint(
                'inputindshow',
                'inputindshow',
                'inputindshow',
                1,
                5,
                1,
                GObject.ParamFlags.WRITABLE
            ),
            useindautohid: GObject.param_spec_boolean(
                'useindautohid',
                'useindautohid',
                'useindautohid',
                true,
                GObject.ParamFlags.WRITABLE
            ),
            inputindhid: GObject.param_spec_uint(
                'inputindhid',
                'inputindhid',
                'inputindhid',
                1,
                5,
                1,
                GObject.ParamFlags.WRITABLE
            ),
        },
    },
    class IBusInputSourceIndicator extends BoxPointer.BoxPointer {
        /* Main */
        constructor() {
            super(St.Side.TOP);
            this.font_style = '';
            this.opacity_style = '';
            this.visible = false;
            this._justSwitchedWindow = false;
            this.style_class = 'candidate-popup-boxpointer';
            this._dummyCursor = new Clutter.Actor({opacity: 0});
            Main.layoutManager.uiGroup.add_child(this._dummyCursor);
            Main.layoutManager.addTopChrome(this);
            let box = new St.BoxLayout({
                style_class: 'candidate-popup-content',
                vertical: true,
            });
            this.bin.set_child(box);
            this._inputIndicatorLabel = new St.Label({
                style_class: 'candidate-popup-text',
                visible: true,
            });
            box.add_child(this._inputIndicatorLabel);

            this._child_opacity = [];
            let candidate_child = this.bin.get_children();
            for (let i in candidate_child) {
                this._child_opacity.push(candidate_child[i].get_opacity());
            }

            this._bindSettings();

            this._panelService = null;
            this._overviewHiddenID = Main.overview.connect(
                'hidden',
                this._onWindowChanged.bind(this)
            );
            this._overviewShowingID = Main.overview.connect(
                'showing',
                this._onWindowChanged.bind(this)
            );
            this._onWindowChangedID = global.display.connect(
                'notify::focus-window',
                this._onWindowChanged.bind(this)
            );
        }

        _connectPanelService(panelService) {
            this._panelService = panelService;
            if (!panelService) return;

            this._setCursorLocationID = panelService.connect(
                'set-cursor-location',
                (ps, x, y, w, h) => {
                    this._setDummyCursorGeometry(x, y, w, h);
                }
            );
            try {
                this._setCursorLocationRelativeID = panelService.connect(
                    'set-cursor-location-relative',
                    (ps, x, y, w, h) => {
                        if (!global.display.focus_window) return;
                        let window =
                            global.display.focus_window.get_compositor_private();
                        this._setDummyCursorGeometry(
                            window.x + x,
                            window.y + y,
                            w,
                            h
                        );
                    }
                );
            } catch (e) {
                // Only recent IBus versions have support for this signal
                // which is used for wayland clients. In order to work
                // with older IBus versions we can silently ignore the
                // signal's absence.
                console.log(e);
            }
            this._focusOutID = panelService.connect('focus-out', () => {
                this.close(BoxPointer.PopupAnimation[this.animation]);
            });
            this._updatePropertyID = panelService.connect(
                'update-property',
                (engineName, prop) => {
                    if (prop.get_key() === INPUTMODE) {
                        this._inputIndicatorLabel.text = this._getInputLabel();
                        this._updateVisibility(true);
                    }
                }
            );
            this._currentSourceChangedID = InputSourceManager.connect(
                'current-source-changed',
                () => {
                    this._inputIndicatorLabel.text = this._getInputLabel();
                    this._justSwitchedWindow = true;
                    this._updateVisibility(true);
                }
            );
            this._registerPropertyID = panelService.connect(
                'register-properties',
                () => {
                    this._inputIndicatorLabel.text = this._getInputLabel();
                }
            );
        }

        _setDummyCursorGeometry(x, y, w, h) {
            this._dummyCursor.set_position(Math.round(x), Math.round(y));
            this._dummyCursor.set_size(Math.round(w), Math.round(h));
            this.setPosition(this._dummyCursor, 0);
            this._updateVisibility();
        }

        _showIndicator() {
            this.open(BoxPointer.PopupAnimation[this.animation]);
            // We shouldn't be above some components like the screenshot UI,
            // so don't raise to the top.
            // The on-screen keyboard is expected to be above any entries,
            // so just above the keyboard gets us to the right layer.
            const {keyboardBox} = Main.layoutManager;
            this.get_parent().set_child_above_sibling(this, keyboardBox);
            if (this.enableAutoHide)
                this._lastTimeOut = GLib.timeout_add_seconds(
                    GLib.PRIORITY_DEFAULT,
                    this.hideTime,
                    () => {
                        this.close(BoxPointer.PopupAnimation[this.animation]);
                        this._lastTimeOut = null;
                        return GLib.SOURCE_REMOVE;
                    }
                );
        }

        _updateVisibility(sourceToggle = false) {
            this.visible = !CandidatePopup.visible;
            if (this.onlyOnToggle) this.visible = sourceToggle;
            if (this.onlyASCII)
                if (!ASCIIMODES.includes(this._inputIndicatorLabel.text))
                    this.visible = false;
            if (this.ignoreSingleModeIME)
                if (IgnoreModes.includes(this._inputIndicatorLabel.text))
                    this.visible = false;
            if (this.visible && !sourceToggle) {
                let position = this._dummyCursor.get_position();
                if (
                    Math.round(position[0]) === 0 &&
                    Math.round(position[1]) === 0
                )
                    this.visible = false;
            }
            if (this._lastTimeOut) {
                GLib.source_remove(this._lastTimeOut);
                this._lastTimeOut = null;
            }
            if (this._lastTimeIn) {
                GLib.source_remove(this._lastTimeIn);
                this._lastTimeIn = null;
            }
            if (this.visible) {
                this.setPosition(this._dummyCursor, 0);
                if (
                    this.enableShowDelay &&
                    !sourceToggle &&
                    !this._justSwitchedWindow
                ) {
                    this.close(BoxPointer.PopupAnimation.NONE);
                    this._lastTimeIn = GLib.timeout_add_seconds(
                        GLib.PRIORITY_DEFAULT,
                        this.showTime,
                        () => {
                            this._lastTimeIn = null;
                            this._showIndicator();
                            return GLib.SOURCE_REMOVE;
                        }
                    );
                } else {
                    if (this.enableShowDelay && !sourceToggle)
                        this._justSwitchedWindow = false;
                    this._showIndicator();
                }
            } else {
                this.close(BoxPointer.PopupAnimation[this.animation]);
            }
        }

        _onWindowChanged() {
            if (IBusManager._panelService !== this._panelService) {
                this._connectPanelService(IBusManager._panelService);
                console.log(_('IBus panel service connected!'));
                this._inputIndicatorLabel.text = this._getInputLabel();
            }
            if (
                InputSourceManager._getCurrentWindow() &&
                IBusManager._panelService
            ) {
                this._inputIndicatorLabel.text = this._getInputLabel();
                this._justSwitchedWindow = true;
                this._updateVisibility(true);
            }
        }

        _getInputLabel() {
            const labels = InputSourceIndicator._indicatorLabels;
            return labels[InputSourceManager.currentSource.index].get_text();
        }

        /* Settings */
        // Indicate only when switching input source
        set inputindtog(inputindtog) {
            this.onlyOnToggle = inputindtog;
        }

        // Indicate only when using ASCII mode
        set inputindASCII(inputindASCII) {
            this.onlyASCII = inputindASCII;
        }

        // Don't indicate when using single mode IME
        set inputindsingle(inputindsingle) {
            this.ignoreSingleModeIME = inputindsingle;
        }

        // Enable right click to close indicator
        set inputindrigc(inputindrigc) {
            if (inputindrigc) {
                this.reactive = true;
                this._buttonRightPressID = this.connect(
                    'button-press-event',
                    (actor, event) => {
                        let rightButton = 'BUTTON3_MASK';
                        if (Meta.is_wayland_compositor())
                            rightButton = 'BUTTON2_MASK';
                        if (
                            event.get_state() &
                            Clutter.ModifierType[rightButton]
                        ) {
                            this.close(
                                BoxPointer.PopupAnimation[this.animation]
                            );
                        }
                    }
                );
            } else {
                if (this._buttonRightPressID)
                    this.disconnect(this._buttonRightPressID),
                        (this._buttonRightPressID = 0);
            }
        }

        // Enable scroll to switch input source
        set inputindscroll(inputindscroll) {
            this.use_scroll = inputindscroll;
        }

        vfunc_scroll_event(event) {
            if (this.use_scroll)
                switch (event.get_scroll_direction()) {
                    case Clutter.ScrollDirection.UP:
                    case Clutter.ScrollDirection.DOWN:
                        IBusManager.activateProperty(
                            INPUTMODE,
                            IBus.PropState.CHECKED
                        );
                        break;
                }
            return Clutter.EVENT_PROPAGATE;
        }

        // Indicator popup animation
        set inputindanim(inputindanim) {
            this.animation = INDICATORANI[inputindanim];
        }

        // Use custom font
        set inputindusef(inputindusef) {
            this.useCustomFont = inputindusef;
            this._update_font();
        }

        set fontname(fontname) {
            this.fontName = fontname;
            this._update_font();
        }

        _update_font() {
            if (this.useCustomFont && this.fontName) {
                let scale = 15 / 16; // the fonts-size difference between index and candidate
                let desc = Pango.FontDescription.from_string(this.fontName);
                let get_weight = () => {
                    try {
                        return desc.get_weight();
                    } catch (e) {
                        return parseInt(e.message);
                    }
                }; // hack for Pango.Weight enumeration exception (eg: 290) in some fonts
                this.font_style =
                    'font-weight: %d; font-family: "%s"; font-size: %dpt; font-style: %s;'.format(
                        get_weight(),
                        desc.get_family(),
                        (desc.get_size() / Pango.SCALE) * scale,
                        Object.keys(Pango.Style)[desc.get_style()].toLowerCase()
                    );
                this.set_style(this.opacity_style + this.font_style);
            } else {
                this.font_style = '';
                this.set_style(this.opacity_style + this.font_style);
            }
        }

        // Enable indicator left click
        set useinputindlclk(useinputindlclk) {
            this.enableLeftClick = useinputindlclk;
            this._update_lclick();
        }

        set inputindlclick(inputindlclick) {
            this.leftClickFunction = inputindlclick;
            this._update_lclick();
        }

        _update_lclick() {
            this._destroy_lclick();
            if (this.enableLeftClick)
                if (this.leftClickFunction) {
                    this._use_switch();
                } else {
                    this._use_move();
                }
        }

        _use_switch() {
            this.reactive = true;
            this._buttonPressID = this.connect(
                'button-press-event',
                (actor, event) => {
                    if (event.get_state() & Clutter.ModifierType.BUTTON1_MASK) {
                        IBusManager.activateProperty(
                            INPUTMODE,
                            IBus.PropState.CHECKED
                        );
                    }
                }
            );
        }

        _use_move() {
            this.reactive = true;
            this._buttonPressID = this.connect(
                'button-press-event',
                (actor, event) => {
                    if (event.get_state() & Clutter.ModifierType.BUTTON1_MASK) {
                        let [boxX, boxY] = this._dummyCursor.get_position();
                        let [mouseX, mouseY] = event.get_coords();
                        this._relativePosX = mouseX - boxX;
                        this._relativePosY = mouseY - boxY;
                        global.display.set_cursor(
                            Meta.Cursor.MOVE_OR_RESIZE_WINDOW
                        );
                        this._location_handler = GLib.timeout_add(
                            GLib.PRIORITY_DEFAULT,
                            10,
                            this._updatePos.bind(this)
                        );
                    }
                }
            );
            this._sideChangeID = this.connect('arrow-side-changed', () => {
                let themeNode = this.get_theme_node();
                let gap = themeNode.get_length('-boxpointer-gap');
                let padding = themeNode.get_length('-arrow-rise');
                let [, , , natHeight] = this.get_preferred_size();
                let sourceTopLeft = 0;
                let sourceBottomRight = 0;
                if (this._sourceExtents) {
                    sourceTopLeft = this._sourceExtents.get_top_left();
                    sourceBottomRight = this._sourceExtents.get_bottom_right();
                }
                switch (this._arrowSide) {
                    case St.Side.TOP:
                        this._relativePosY +=
                            natHeight +
                            2 * gap -
                            sourceTopLeft.y +
                            sourceBottomRight.y +
                            padding;
                        break;
                    case St.Side.BOTTOM:
                        this._relativePosY -=
                            natHeight +
                            2 * gap -
                            sourceTopLeft.y +
                            sourceBottomRight.y +
                            padding;
                        break;
                }
                this._updatePos();
                this._border.queue_repaint();
            });
        }

        _move(x, y) {
            this._dummyCursor.set_position(
                Math.round(x - this._relativePosX),
                Math.round(y - this._relativePosY)
            );
            this.setPosition(this._dummyCursor, 0);
        }

        _updatePos() {
            let [mouse_x, mouse_y, mask] = global.get_pointer();
            this._move(mouse_x, mouse_y);
            mask &= Clutter.ModifierType.BUTTON1_MASK;
            if (mask) return GLib.SOURCE_CONTINUE;
            this._location_handler = null;
            global.display.set_cursor(Meta.Cursor.DEFAULT);
            return GLib.SOURCE_REMOVE;
        }

        _destroy_lclick() {
            if (this._buttonPressID)
                this.disconnect(this._buttonPressID), (this._buttonPressID = 0);
            if (this._sideChangeID)
                this.disconnect(this._sideChangeID), (this._sideChangeID = 0);
            if (this._location_handler) {
                global.display.set_cursor(Meta.Cursor.DEFAULT);
                GLib.source_remove(this._location_handler),
                    (this._location_handler = 0);
            }
            this._relativePosX = null;
            this._relativePosY = null;
        }

        // Indicator Opacity
        set useindopacity(useindopacity) {
            this._use_opacity = useindopacity;
            this._update_opacity();
        }

        set indopacity(indopacity) {
            this._opacity = indopacity;
            this._update_opacity();
        }

        _update_opacity() {
            if (this._themeContextChangedID)
                this._themeContext.disconnect(this._themeContextChangedID),
                    (this._themeContextChangedID = 0);

            if (this._use_opacity && this._opacity) {
                let candidate_child = this.bin.get_children();
                for (let i in candidate_child)
                    candidate_child[i].set_opacity(this._opacity);

                // To get the theme color and modify its opacity
                this.opacity_style = '';
                this.set_style(this.opacity_style + this.font_style);
                let themeNode = this.get_theme_node();
                let backgroundColor = themeNode.get_color(
                    '-arrow-background-color'
                );
                if (backgroundColor.alpha !== 0) {
                    this.opacity_style =
                        '-arrow-background-color: rgba(%d, %d, %d, %f);'.format(
                            backgroundColor.red,
                            backgroundColor.green,
                            backgroundColor.blue,
                            this._opacity / 255
                        );
                }
                this.set_style(this.opacity_style + this.font_style);
                this._themeContext = St.ThemeContext.get_for_stage(
                    global.stage
                );
                this._themeContextChangedID = this._themeContext.connect(
                    'changed',
                    this._update_opacity.bind(this)
                );
            } else {
                if (this._child_opacity) {
                    let candidate_child = this.bin.get_children();
                    for (let i in candidate_child)
                        candidate_child[i].set_opacity(this._child_opacity[i]);
                }

                this.opacity_style = '';
                this.set_style(this.opacity_style + this.font_style);
            }
        }

        // Enable indicator show delay
        set useindshowd(useindshowd) {
            this.enableShowDelay = useindshowd;
        }

        set inputindshow(inputindshow) {
            this.showTime = inputindshow;
        }

        // Enable indicator auto-hide timeout
        set useindautohid(useindautohid) {
            this.enableAutoHide = useindautohid;
        }

        set inputindhid(inputindhid) {
            this.hideTime = inputindhid;
        }

        _bindSettings() {
            gsettings.bind(
                Fields.INPUTINDTOG,
                this,
                'inputindtog',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.INPUTINDASCII,
                this,
                'inputindASCII',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.INPUTINDSINGLE,
                this,
                'inputindsingle',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.INPUTINDRIGC,
                this,
                'inputindrigc',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.INPUTINDSCROLL,
                this,
                'inputindscroll',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.INPUTINDANIM,
                this,
                'inputindanim',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.INPUTINDUSEF,
                this,
                'inputindusef',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.INPUTINDCUSTOMFONT,
                this,
                'fontname',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.USEINPUTINDLCLK,
                this,
                'useinputindlclk',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.INPUTINDLCLICK,
                this,
                'inputindlclick',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.USEINDOPACITY,
                this,
                'useindopacity',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.INDOPACITY,
                this,
                'indopacity',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.USEINDSHOWD,
                this,
                'useindshowd',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.INPUTINDSHOW,
                this,
                'inputindshow',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.USEINDAUTOHID,
                this,
                'useindautohid',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.INPUTINDHID,
                this,
                'inputindhid',
                Gio.SettingsBindFlags.GET
            );
        }

        _destroy_indicator() {
            this.close(BoxPointer.PopupAnimation[this.animation]);
            this._destroy_lclick();
            if (this._buttonRightPressID)
                this.disconnect(this._buttonRightPressID),
                    (this._buttonRightPressID = 0);
            if (this._setCursorLocationID)
                this._panelService.disconnect(this._setCursorLocationID),
                    (this._setCursorLocationID = 0);
            if (this._setCursorLocationRelativeID)
                this._panelService.disconnect(
                    this._setCursorLocationRelativeID
                ),
                    (this._setCursorLocationRelativeID = 0);
            if (this._focusOutID)
                this._panelService.disconnect(this._focusOutID),
                    (this._focusOutID = 0);
            if (this._updatePropertyID)
                this._panelService.disconnect(this._updatePropertyID),
                    (this._updatePropertyID = 0);
            if (this._registerPropertyID)
                this._panelService.disconnect(this._registerPropertyID),
                    (this._registerPropertyID = 0);
            if (this._currentSourceChangedID)
                InputSourceManager.disconnect(this._currentSourceChangedID),
                    (this._currentSourceChangedID = 0);
            if (this._lastTimeOut) {
                GLib.source_remove(this._lastTimeOut);
                this._lastTimeOut = null;
            }
            if (this._lastTimeIn) {
                GLib.source_remove(this._lastTimeIn);
                this._lastTimeIn = null;
            }
        }

        destroy() {
            if (this._onWindowChangedID)
                global.display.disconnect(this._onWindowChangedID),
                    (this._onWindowChangedID = 0);
            if (this._overviewShowingID)
                Main.overview.disconnect(this._overviewShowingID),
                    (this._overviewShowingID = 0);
            if (this._overviewHiddenID)
                Main.overview.disconnect(this._overviewHiddenID),
                    (this._overviewHiddenID = 0);
            this._destroy_indicator();
        }
    }
);

/* Theme */
const IBusThemeManager = GObject.registerClass(
    {
        Properties: {
            theme: GObject.param_spec_string(
                'theme',
                'theme',
                'theme',
                '',
                GObject.ParamFlags.WRITABLE
            ),
            themeDark: GObject.param_spec_string(
                'themedark',
                'themedark',
                'themeDark',
                '',
                GObject.ParamFlags.WRITABLE
            ),
            night: GObject.ParamSpec.boolean(
                'night',
                'night',
                'night',
                GObject.ParamFlags.READWRITE,
                false
            ),
        },
    },
    class IBusThemeManager extends GObject.Object {
        constructor() {
            super();
            this._prevCssStylesheet = null;
            this._atNight = false;
            ngsettings.bind(
                System.LIGHT,
                this,
                'night',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.CUSTOMTHEME,
                this,
                'theme',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.CUSTOMTHEMENIGHT,
                this,
                'themedark',
                Gio.SettingsBindFlags.GET
            );
            this._buildWidgets();
        }

        _buildWidgets() {
            this._proxy = new ColorProxy(
                Gio.DBus.session,
                System.BUS_NAME,
                System.OBJECT_PATH,
                (proxy, error) => {
                    if (!error) {
                        this._onProxyChanged();
                        this._proxy.connect(
                            System.PROPERTY,
                            this._onProxyChanged.bind(this)
                        );
                    }
                }
            );
        }

        _onProxyChanged() {
            this._light = this._proxy.NightLightActive;
            this._changeTheme();
        }

        set night(night) {
            this._night = night;
            this._changeTheme();
        }

        set theme(theme) {
            this._stylesheet = theme;
            this._changeTheme();
        }

        set themedark(themedark) {
            this._stylesheetNight = themedark;
            this._changeTheme();
        }

        destroy() {
            this._changeTheme(false);
            if (this._themeContextChangedID)
                St.ThemeContext.get_for_stage(global.stage).disconnect(
                    this._themeContextChangedID
                ),
                    (this._themeContextChangedID = 0);
            delete this._proxy;
        }

        loadTheme(newStylesheet) {
            let themeContext = St.ThemeContext.get_for_stage(global.stage);
            let theme = themeContext.get_theme();

            if (this._prevCssStylesheet)
                theme.unload_stylesheet(
                    Gio.File.new_for_path(this._prevCssStylesheet)
                );

            if (newStylesheet) {
                let file = Gio.File.new_for_path(newStylesheet);
                this._styleSheetMonitor = file.monitor_file(
                    Gio.FileMonitorFlags.NONE,
                    null
                );
                this._styleSheetMonitorID = this._styleSheetMonitor.connect(
                    'changed',
                    this._changeTheme.bind(this)
                );
                if (file.query_exists(null)) theme.load_stylesheet(file);
            }

            themeContext.set_theme(theme);
        }

        // Load stylesheet
        _changeTheme(toEnable = true) {
            this._atNight = this._night && this._light;
            let enabled = gsettings.get_boolean(Fields.ENABLECUSTOMTHEME);
            let enabledNight = gsettings.get_boolean(
                Fields.ENABLECUSTOMTHEMENIGHT
            );

            if (this._styleSheetMonitorID) {
                this._styleSheetMonitor.disconnect(this._styleSheetMonitorID),
                    (this._styleSheetMonitorID = 0);
                this._styleSheetMonitor.cancel();
            }

            if (
                this._stylesheet &&
                enabled &&
                toEnable &&
                (!this._atNight || !enabledNight)
            ) {
                console.log(
                    _('loading light user theme for IBus:') + this._stylesheet
                );
                this.loadTheme(this._stylesheet);
                this._prevCssStylesheet = this._stylesheet;
            } else if (
                this._stylesheetNight &&
                enabledNight &&
                toEnable &&
                (this._atNight || !enabled)
            ) {
                console.log(
                    _('loading dark user theme for IBus:') +
                        this._stylesheetNight
                );
                this.loadTheme(this._stylesheetNight);
                this._prevCssStylesheet = this._stylesheetNight;
            } else {
                console.log(_('loading default theme for IBus'));
                this.loadTheme();
                this._prevCssStylesheet = '';
            }
        }
    }
);

/* Background */
const IBusBGSetting = GObject.registerClass(
    {
        Properties: {
            background: GObject.param_spec_string(
                'bg',
                'bg',
                'background',
                '',
                GObject.ParamFlags.WRITABLE
            ),
            backgroundDark: GObject.param_spec_string(
                'bgdark',
                'bgdark',
                'backgroundDark',
                '',
                GObject.ParamFlags.WRITABLE
            ),
            night: GObject.ParamSpec.boolean(
                'night',
                'night',
                'night',
                GObject.ParamFlags.READWRITE,
                false
            ),
            backgroundMode: GObject.param_spec_uint(
                'bgmode',
                'bgmode',
                'backgroundMode',
                0,
                2,
                2,
                GObject.ParamFlags.WRITABLE
            ),
            backgroundDarkMode: GObject.param_spec_uint(
                'bgdarkmode',
                'bgdarkmode',
                'backgroundDarkMode',
                0,
                2,
                2,
                GObject.ParamFlags.WRITABLE
            ),
            backgroundRepeatMode: GObject.param_spec_uint(
                'bgrepeatmode',
                'bgrepeatmode',
                'backgroundRepeatMode',
                0,
                3,
                3,
                GObject.ParamFlags.WRITABLE
            ),
            backgroundDarkRepeatMode: GObject.param_spec_uint(
                'bgdarkrepeatmode',
                'bgdarkrepeatmode',
                'backgroundDarkRepeatMode',
                0,
                3,
                3,
                GObject.ParamFlags.WRITABLE
            ),
        },
    },
    class IBusBGSetting extends GObject.Object {
        constructor() {
            super();
            ngsettings.bind(
                System.LIGHT,
                this,
                'night',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.CUSTOMBG,
                this,
                'bg',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.CUSTOMBGDARK,
                this,
                'bgdark',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.BGMODE,
                this,
                'bgmode',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.BGDARKMODE,
                this,
                'bgdarkmode',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.BGREPEATMODE,
                this,
                'bgrepeatmode',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.BGDARKREPEATMODE,
                this,
                'bgdarkrepeatmode',
                Gio.SettingsBindFlags.GET
            );
            this._candidateBox = CandidatePopup.bin.get_children();
            if (this._candidateBox) this._candidateBox = this._candidateBox[0];
            this._buildWidgets();
        }

        _buildWidgets() {
            this._proxy = new ColorProxy(
                Gio.DBus.session,
                System.BUS_NAME,
                System.OBJECT_PATH,
                (proxy, error) => {
                    if (!error) {
                        this._onProxyChanged();
                        this._proxy.connect(
                            System.PROPERTY,
                            this._onProxyChanged.bind(this)
                        );
                    }
                }
            );
        }

        _onProxyChanged() {
            this._light = this._proxy.NightLightActive;
            this._changeBG();
        }

        set night(night) {
            this._night = night;
            this._changeBG();
        }

        set bg(bg) {
            this._background = bg;
            this._changeBG();
        }

        set bgdark(bgdark) {
            this._backgroundDark = bgdark;
            this._changeBG();
        }

        set bgmode(bgmode) {
            this._backgroundMode = BGMODESACTIONS[BGMODES[bgmode]];
            this._changeBG();
        }

        set bgdarkmode(bgdarkmode) {
            this._backgroundDarkMode = BGMODESACTIONS[BGMODES[bgdarkmode]];
            this._changeBG();
        }

        set bgrepeatmode(bgrepeatmode) {
            this._backgroundRepeatMode = BGREPEATMODES[bgrepeatmode];
            this._changeBG();
        }

        set bgdarkrepeatmode(bgdarkrepeatmode) {
            this._backgroundDarkRepeatMode = BGREPEATMODES[bgdarkrepeatmode];
            this._changeBG();
        }

        // Load background
        _changeBG(toEnable = true) {
            this._atNight = this._night && this._light;
            let enabled = gsettings.get_boolean(Fields.USECUSTOMBG);
            let enabledNight = gsettings.get_boolean(Fields.USECUSTOMBGDARK);

            if (
                this._background &&
                enabled &&
                toEnable &&
                (!this._atNight || !enabledNight)
            ) {
                if (
                    Gio.File.new_for_path(this._background).query_exists(null)
                ) {
                    this._bgPic = this._background;
                    this._bgMode = this._backgroundMode;
                    this._bgRepeatMode = this._backgroundRepeatMode;
                } else this._bgPic = '';
            } else if (
                this._backgroundDark &&
                enabledNight &&
                toEnable &&
                (this._atNight || !enabled)
            ) {
                if (
                    Gio.File.new_for_path(this._backgroundDark).query_exists(
                        null
                    )
                ) {
                    this._bgPic = this._backgroundDark;
                    this._bgMode = this._backgroundDarkMode;
                    this._bgRepeatMode = this._backgroundDarkRepeatMode;
                } else this._bgPic = '';
            } else {
                this._bgPic = '';
            }
            if (this._candidateBox) {
                if (this._bgPic) {
                    console.log(
                        _('loading background for IBus:') + this._bgPic
                    );
                    this._candidateBox.set_style(
                        'background: url("%s"); background-repeat: %s; background-size: %s; box-shadow: none;'.format(
                            this._bgPic,
                            this._bgRepeatMode,
                            this._bgMode
                        )
                    );
                    this._candidateBox.add_style_class_name(
                        'candidate-popup-content'
                    );
                } else {
                    console.log(_('remove custom background for IBus'));
                    this._candidateBox.set_style('');
                }
            }
        }

        destroy() {
            this._changeBG(false);
            if (this._candidateBox) delete this._candidateBox;
            delete this._proxy;
        }
    }
);

const Extensions = GObject.registerClass(
    {
        Properties: {
            font: GObject.param_spec_boolean(
                'font',
                'font',
                'font',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            opacity: GObject.param_spec_boolean(
                'opacity',
                'opacity',
                'opacity',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            bg: GObject.param_spec_boolean(
                'bg',
                'bg',
                'bg',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            bgdark: GObject.param_spec_boolean(
                'bgdark',
                'bgdark',
                'bgdark',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            input: GObject.param_spec_boolean(
                'input',
                'input',
                'input',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            orien: GObject.param_spec_boolean(
                'orien',
                'orien',
                'orien',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            theme: GObject.param_spec_boolean(
                'theme',
                'theme',
                'theme',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            themenight: GObject.param_spec_boolean(
                'themenight',
                'themenight',
                'themenight',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            menuibusemoji: GObject.param_spec_boolean(
                'menuibusemoji',
                'menuibusemoji',
                'menuibusemoji',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            menuextpref: GObject.param_spec_boolean(
                'menuextpref',
                'menuextpref',
                'menuextpref',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            menuibuspref: GObject.param_spec_boolean(
                'menuibuspref',
                'menuibuspref',
                'menuibuspref',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            menuibusver: GObject.param_spec_boolean(
                'menuibusver',
                'menuibusver',
                'menuibusver',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            menuibusrest: GObject.param_spec_boolean(
                'menuibusrest',
                'menuibusrest',
                'menuibusrest',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            menuibusexit: GObject.param_spec_boolean(
                'menuibusexit',
                'menuibusexit',
                'menuibusexit',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            ibusresttime: GObject.param_spec_string(
                'ibusresttime',
                'ibusresttime',
                'ibusresttime',
                '',
                GObject.ParamFlags.WRITABLE
            ),
            useinputind: GObject.param_spec_boolean(
                'useinputind',
                'useinputind',
                'useinputind',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            animation: GObject.param_spec_boolean(
                'animation',
                'animation',
                'animation',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            reposition: GObject.param_spec_boolean(
                'reposition',
                'reposition',
                'reposition',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            fiximelist: GObject.param_spec_boolean(
                'fiximelist',
                'fiximelist',
                'fiximelist',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            usetray: GObject.param_spec_boolean(
                'usetray',
                'usetray',
                'usetray',
                true,
                GObject.ParamFlags.WRITABLE
            ),
            usetraysswitch: GObject.param_spec_boolean(
                'usetraysswitch',
                'usetraysswitch',
                'usetraysswitch',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            usecandrightswitch: GObject.param_spec_boolean(
                'usecandrightswitch',
                'usecandrightswitch',
                'usecandrightswitch',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            usecandstill: GObject.param_spec_boolean(
                'usecandstill',
                'usecandstill',
                'usecandstill',
                false,
                GObject.ParamFlags.WRITABLE
            ),
            usebuttons: GObject.param_spec_boolean(
                'usebuttons',
                'usebuttons',
                'usebuttons',
                true,
                GObject.ParamFlags.WRITABLE
            ),
            usescroll: GObject.param_spec_boolean(
                'usescroll',
                'usescroll',
                'usescroll',
                false,
                GObject.ParamFlags.WRITABLE
            ),
        },
    },
    class Extensions extends GObject.Object {
        constructor() {
            super();
            this._bindSettings();
        }

        _bindSettings() {
            gsettings.bind(
                Fields.AUTOSWITCH,
                this,
                'input',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.USECUSTOMFONT,
                this,
                'font',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.USECANDOPACITY,
                this,
                'opacity',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.USECUSTOMBG,
                this,
                'bg',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.USECUSTOMBGDARK,
                this,
                'bgdark',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.ENABLEORIEN,
                this,
                'orien',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.ENABLECUSTOMTHEME,
                this,
                'theme',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.ENABLECUSTOMTHEMENIGHT,
                this,
                'themenight',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.MENUIBUSEMOJI,
                this,
                'menuibusemoji',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.MENUEXTPREF,
                this,
                'menuextpref',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.MENUIBUSPREF,
                this,
                'menuibuspref',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.MENUIBUSVER,
                this,
                'menuibusver',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.MENUIBUSREST,
                this,
                'menuibusrest',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.MENUIBUSEXIT,
                this,
                'menuibusexit',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.IBUSRESTTIME,
                this,
                'ibusresttime',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.USEINPUTIND,
                this,
                'useinputind',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.USECANDANIM,
                this,
                'animation',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.USEREPOSITION,
                this,
                'reposition',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.FIXIMELIST,
                this,
                'fiximelist',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.USETRAY,
                this,
                'usetray',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.USETRAYSSWITCH,
                this,
                'usetraysswitch',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.USECANDRIGHTSWITCH,
                this,
                'usecandrightswitch',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.USECANDSTILL,
                this,
                'usecandstill',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.USEBUTTONS,
                this,
                'usebuttons',
                Gio.SettingsBindFlags.GET
            );
            gsettings.bind(
                Fields.USESCROLL,
                this,
                'usescroll',
                Gio.SettingsBindFlags.GET
            );
            this._useFontChangeID = IBusSettings.connect(
                `changed::${Fields.USECUSTOMFONT}`,
                () => {
                    let value = IBusSettings.get_boolean(Fields.USECUSTOMFONT);
                    gsettings.set_boolean(Fields.USECUSTOMFONT, value);
                }
            );
            this._useTrayChangeID = IBusSettings.connect(
                `changed::show-icon-on-systray`,
                () => {
                    let value = IBusSettings.get_boolean(
                        'show-icon-on-systray'
                    );
                    gsettings.set_boolean(Fields.USETRAY, value);
                }
            );
        }

        set input(input) {
            if (input) {
                if (this._input) return;
                this._input = new IBusAutoSwitch();
            } else {
                if (!this._input) return;
                this._input.destroy();
                delete this._input;
            }
        }

        set font(font) {
            if (font) {
                if (this._font) return;
                this._font = new IBusFontSetting();
            } else {
                if (!this._font) return;
                this._font.destroy();
                delete this._font;
            }
        }

        set opacity(opacity) {
            if (opacity) {
                if (this._opacity) return;
                this._opacity = new IBusOpacity();
            } else {
                if (!this._opacity) return;
                this._opacity.destroy();
                delete this._opacity;
            }
        }

        set bg(bg) {
            this._bgLight = bg;
            if (bg) {
                if (this._bg) this._bg._changeBG();
                else this._bg = new IBusBGSetting();
            } else {
                if (!this._bg) return;
                if (!this._bgDark && !this._bgLight) {
                    this._bg.destroy();
                    delete this._bg;
                } else {
                    this._bg._changeBG();
                }
            }
        }

        set bgdark(bg) {
            this._bgDark = bg;
            if (bg) {
                if (this._bg) this._bg._changeBG();
                else this._bg = new IBusBGSetting();
            } else {
                if (!this._bg) return;
                if (!this._bgDark && !this._bgLight) {
                    this._bg.destroy();
                    delete this._bg;
                } else {
                    this._bg._changeBG();
                }
            }
        }

        set orien(orien) {
            if (orien) {
                if (this._orien) return;
                this._orien = new IBusOrientation();
            } else {
                if (!this._orien) return;
                this._orien.destroy();
                delete this._orien;
            }
        }

        set theme(theme) {
            this._themeLight = theme;
            if (theme) {
                if (this._theme) this._theme._changeTheme();
                else this._theme = new IBusThemeManager();
            } else {
                if (!this._theme) return;
                if (!this._themeDark && !this._themeLight) {
                    this._theme.destroy();
                    delete this._theme;
                } else {
                    this._theme._changeTheme();
                }
            }
        }

        set themenight(theme) {
            this._themeDark = theme;
            if (theme) {
                if (this._theme) this._theme._changeTheme();
                else this._theme = new IBusThemeManager();
            } else {
                if (!this._theme) return;
                if (!this._themeDark && !this._themeLight) {
                    this._theme.destroy();
                    delete this._theme;
                } else {
                    this._theme._changeTheme();
                }
            }
        }

        set useinputind(useinputind) {
            if (useinputind) {
                if (this._useinputind) return;
                this._useinputind = new IBusInputSourceIndicator();
            } else {
                if (!this._useinputind) return;
                this._useinputind.destroy();
                delete this._useinputind;
            }
        }

        set animation(animation) {
            if (animation) {
                if (this._animation) return;
                this._animation = new IBusAnimation();
            } else {
                if (!this._animation) return;
                this._animation.destroy();
                delete this._animation;
            }
        }

        set usescroll(usescroll) {
            if (usescroll) {
                if (this._usescroll) return;
                this._usescroll = new IBusScroll();
            } else {
                if (!this._usescroll) return;
                this._usescroll.destroy();
                delete this._usescroll;
            }
        }

        set reposition(reposition) {
            if (reposition) {
                if (this._reposition) return;
                this._reposition = new IBusReposition();
            } else {
                if (!this._reposition) return;
                this._reposition.destroy();
                delete this._reposition;
            }
        }

        set fiximelist(fiximelist) {
            if (fiximelist) {
                if (this._fiximelist) return;
                this._fiximelist = new IBusFixIMEList();
            } else {
                if (!this._fiximelist) return;
                this._fiximelist.destroy();
                delete this._fiximelist;
            }
        }

        set usetraysswitch(usetraysswitch) {
            if (usetraysswitch) {
                if (this._usetraysswitch) return;
                this._usetraysswitch = new IBusTrayClickSwitch();
            } else {
                if (!this._usetraysswitch) return;
                this._usetraysswitch.destroy();
                delete this._usetraysswitch;
            }
        }

        set usecandrightswitch(usecandrightswitch) {
            if (usecandrightswitch) {
                if (this._usecandrightswitch) return;
                this._usecandrightswitch = new IBusClickSwitch();
            } else {
                if (!this._usecandrightswitch) return;
                this._usecandrightswitch.destroy();
                delete this._usecandrightswitch;
            }
        }

        set usecandstill(usecandstill) {
            if (usecandstill) {
                if (this._usecandstill) return;
                this._usecandstill = new IBusNotFollowCaret();
            } else {
                if (!this._usecandstill) return;
                this._usecandstill.destroy();
                delete this._usecandstill;
            }
        }

        /* General */
        // Candidate box page buttons
        set usebuttons(usebuttons) {
            CandidateArea._buttonBox.set_height(usebuttons ? -1 : 0);
        }

        /* Tray */
        // Start/Restart IBus
        set ibusresttime(ibusresttime) {
            if (this._not_extension_first_start) {
                IBusManager.restartDaemon();
                if (IBusManager._ibusSystemdServiceExists)
                    IBusManager._ibusSystemdServiceExists().then(result => {
                        if (result)
                            Shell.util_stop_systemd_unit(
                                IBUS_SYSTEMD_SERVICE,
                                'fail',
                                null
                            ).then(() => {
                                Shell.util_start_systemd_unit(
                                    IBUS_SYSTEMD_SERVICE,
                                    'replace',
                                    null
                                );
                            });
                    });
                let title = _('Starting / Restarting IBus...');
                let source = new MessageTray.Source({
                    title,
                    iconName: 'dialog-information',
                });
                Main.messageTray.add(source);
                let notification = new MessageTray.Notification({
                    source,
                    title,
                    datetime: GLib.DateTime.new_from_unix_local(
                        parseInt(ibusresttime)
                    ),
                });
                source.addNotification(notification);
            }
            this._not_extension_first_start = true;
        }

        // Show IBus tray icon
        set usetray(usetray) {
            InputSourceIndicator.container.visible = usetray;
        }

        // Add Additional Menu Entries
        // Copying Emoji
        set menuibusemoji(menuibusemoji) {
            if (menuibusemoji) {
                if (this._menuibusemoji) return;
                this._menuibusemoji = InputSourceIndicator.menu.addAction(
                    _('Copy Emoji'),
                    this._MenuIBusEmoji.bind(InputSourceIndicator)
                );
                this._menuibusemoji.visible = true;
            } else {
                if (!this._menuibusemoji) return;
                this._menuibusemoji.visible = false;
                delete this._menuibusemoji;
            }
        }

        _MenuIBusEmoji() {
            Main.overview.hide();
            Util.spawn(['ibus', 'emoji']);
        }

        // This Extension's Preferences
        set menuextpref(menuextpref) {
            if (menuextpref) {
                if (this._menuextpref) return;
                this._menuextpref = InputSourceIndicator.menu.addAction(
                    _('Customize IBus'),
                    this._MenuExtPref.bind(InputSourceIndicator)
                );
                this._menuextpref.visible = true;
            } else {
                if (!this._menuextpref) return;
                this._menuextpref.visible = false;
                delete this._menuextpref;
            }
        }

        _MenuExtPref() {
            Main.overview.hide();
            Me.openPreferences();
        }

        // IBus Preferences
        set menuibuspref(menuibuspref) {
            if (menuibuspref) {
                if (this._menuibuspref) return;
                this._menuibuspref = InputSourceIndicator.menu.addAction(
                    _('IBus Preferences'),
                    this._menuIBusPref.bind(InputSourceIndicator)
                );
                this._menuibuspref.visible = true;
            } else {
                if (!this._menuibuspref) return;
                this._menuibuspref.visible = false;
                delete this._menuibuspref;
            }
        }

        _menuIBusPref() {
            Main.overview.hide();
            Util.spawn(['ibus-setup']);
        }

        // IBus Version
        set menuibusver(menuibusver) {
            if (menuibusver) {
                if (this._menuibusver) return;
                this._menuibusver = InputSourceIndicator.menu.addAction(
                    _('IBus Version'),
                    this._MenuIBusVer.bind(InputSourceIndicator)
                );
                this._menuibusver.visible = true;
            } else {
                if (!this._menuibusver) return;
                this._menuibusver.visible = false;
                delete this._menuibusver;
            }
        }

        _MenuIBusVer() {
            Main.overview.hide();
            let title = _('IBus Version');
            let source = new MessageTray.Source({
                title,
                iconName: 'dialog-information',
            });
            Main.messageTray.add(source);
            let notification = new MessageTray.Notification({
                source,
                title,
                body:
                    'v' +
                    IBus.MAJOR_VERSION +
                    '.' +
                    IBus.MINOR_VERSION +
                    '.' +
                    IBus.MICRO_VERSION,
                datetime: GLib.DateTime.new_now_local(),
            });
            source.addNotification(notification);
        }

        // Restarting IBus
        set menuibusrest(menuibusrest) {
            if (menuibusrest) {
                if (this._menuibusrest) return;
                this._menuibusrest = InputSourceIndicator.menu.addAction(
                    _('Restart'),
                    this._MenuIBusRest.bind(InputSourceIndicator)
                );
                this._menuibusrest.visible = true;
            } else {
                if (!this._menuibusrest) return;
                this._menuibusrest.visible = false;
                delete this._menuibusrest;
            }
        }

        _MenuIBusRest() {
            Main.overview.hide();
            IBusManager.restartDaemon();
            if (IBusManager._ibusSystemdServiceExists)
                IBusManager._ibusSystemdServiceExists().then(result => {
                    if (result)
                        Shell.util_stop_systemd_unit(
                            IBUS_SYSTEMD_SERVICE,
                            'fail',
                            null
                        ).then(() => {
                            Shell.util_start_systemd_unit(
                                IBUS_SYSTEMD_SERVICE,
                                'replace',
                                null
                            );
                        });
                });
            let title = _('Restarting IBus...');
            let source = new MessageTray.Source({
                title,
                iconName: 'dialog-information',
            });
            Main.messageTray.add(source);
            let notification = new MessageTray.Notification({
                source,
                title,
                datetime: GLib.DateTime.new_now_local(),
            });
            source.addNotification(notification);
        }

        // Exiting IBus
        set menuibusexit(menuibusexit) {
            if (menuibusexit) {
                if (this._menuibusexit) return;
                this._menuibusexit = InputSourceIndicator.menu.addAction(
                    _('Quit'),
                    this._MenuIBusExit.bind(InputSourceIndicator)
                );
                this._menuibusexit.visible = true;
            } else {
                if (!this._menuibusexit) return;
                this._menuibusexit.visible = false;
                delete this._menuibusexit;
            }
        }

        _MenuIBusExit() {
            Main.overview.hide();
            Util.spawn(['ibus', 'exit']);
            let title = _('Exiting IBus...');
            let source = new MessageTray.Source({
                title,
                iconName: 'dialog-information',
            });
            Main.messageTray.add(source);
            let notification = new MessageTray.Notification({
                source,
                title,
                datetime: GLib.DateTime.new_now_local(),
            });
            source.addNotification(notification);
        }

        destroy() {
            this.bg = false;
            this.bgdark = false;
            this.font = false;
            this.opacity = false;
            this.input = false;
            this.orien = false;
            this.theme = false;
            this.themenight = false;
            this.useinputind = false;
            this.animation = false;
            this.usescroll = false;
            this.reposition = false;
            this.fiximelist = false;
            this.usetray = true;
            this.usebuttons = true;
            this.usetraysswitch = false;
            this.usecandrightswitch = false;
            this.usecandstill = false;
            this.menuibusemoji = false;
            this.menuextpref = false;
            this.menuibuspref = false;
            this.menuibusver = false;
            this.menuibusrest = false;
            this.menuibusexit = false;
            this._not_extension_first_start = false;
            if (this._useFontChangeID)
                IBusSettings.disconnect(this._useFontChangeID),
                    (this._useFontChangeID = 0);
            if (this._useTrayChangeID)
                IBusSettings.disconnect(this._useTrayChangeID),
                    (this._useTrayChangeID = 0);
        }
    }
);

export default class CustomizeIBusExtension extends Extension {
    /**
     * This class is constructed once when your extension is loaded, not
     * enabled. This is a good time to setup translations or anything else you
     * only do once.
     *
     * You MUST NOT make any changes to GNOME Shell, connect any signals or add
     * any event sources here.
     *
     * @param {ExtensionMeta} metadata - An extension meta object
     */
    constructor(metadata) {
        super(metadata);
    }

    updateIgnoreModes() {
        IgnoreModes = [];
        for (let i in InputSourceManager.inputSources) {
            IgnoreModes.push(InputSourceManager.inputSources[i].shortName);
        }
    }

    /**
     * This function is called when your extension is enabled, which could be
     * done in GNOME Extensions, when you log in or when the screen is unlocked.
     *
     * This is when you should setup any UI for your extension, change existing
     * widgets, connect signals or modify GNOME Shell's behavior.
     */

    enable() {
        IBusSettings = new Gio.Settings({
            schema_id: 'org.freedesktop.ibus.panel',
        });
        ngsettings = new Gio.Settings({
            schema: 'org.gnome.settings-daemon.plugins.color',
        });
        gsettings = this.getSettings();
        InputSourceManager = keyboard.getInputSourceManager();
        IBusManager = IBusManagerImported.getIBusManager();
        CandidatePopup = IBusManager._candidatePopup;
        CandidateArea = IBusManager._candidatePopup._candidateArea;
        CandidateDummyCursor = IBusManager._candidatePopup._dummyCursor;
        Me = this;
        this.updateIgnoreModes();
        this._updateIgnoreModesID = InputSourceManager.connect(
            'sources-changed',
            this.updateIgnoreModes.bind(this)
        );
        this._ext = new Extensions();
    }

    /**
     * This function is called when your extension is uninstalled, disabled in
     * GNOME Extensions or when the screen locks.
     *
     * Anything you created, modified or setup in enable() MUST be undone here.
     * Not doing so is the most common reason extensions are rejected in review!
     */
    disable() {
        if (this._ext) {
            this._ext.destroy();
            delete this._ext;
        }
        if (this._updateIgnoreModesID)
            InputSourceManager.disconnect(this._updateIgnoreModesID),
                (this._updateIgnoreModesID = 0);
        IBusSettings = null;
        gsettings = null;
        ngsettings = null;
        opacityStyle = '';
        fontStyle = '';
        InputSourceManager = null;
        IBusManager = null;
        CandidatePopup = null;
        CandidateArea = null;
        CandidateDummyCursor = null;
        Me = null;
    }
}
