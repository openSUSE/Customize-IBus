/**
 * Manager Library
 */

/**
 * Apply settings to the GNOME Shell
 */
export class Manager {
    /**
     * Current shell version
     *
     * @type {number|null}
     */
    #shellVersion = null;

    /**
     * Instance of Gio.Settings
     *
     * @type {Settings|null}
     */
    #settings = null;

    /**
     * Instance of IBusOrientation
     *
     * @type {IBusOrientation|null}
     */
    #ibusOrientation = null;

    /**
     * Class Constructor
     *
     * @param {Object} dependencies
     *   'Settings' instance of Gio::Settings
     * @param {number} shellVersion float in major.minor format
     */
    constructor(dependencies, shellVersion) {
        this.#settings = dependencies['Settings'] || null;
        this.#shellVersion = shellVersion;
        this.#ibusOrientation = new IBusOrientation();
    }

    /**
     * register all signals for settings
     *
     * @returns {void}
     */
    registerSettingsSignals() {
        // this.#settings.connect('changed::candidate-orientation', () => {
        //     this.#applyCandidateOrientation();
        // });
            //     this.#applyAutoSwitch();
            // });
    
            // this.#settings.connect('changed::enable-custom-theme', () => {
            //     this.#applyCustomTheme();
            // });
    
            // this.#settings.connect('changed::enable-custom-theme-dark', () => {
            //     this.#applyCustomThemeDark();
            // });
    
            // this.#settings.connect('changed::use-candidate-opacity', () => {
            //     this.#applyCandidateOpacity();
            // });
    
            // this.#settings.connect('changed::use-indicator-opacity', () => {
            //     this.#applyIndicatorOpacity();
            // });
    
            // this.#settings.connect('changed::use-custom-bg', () => {
            //     this.#applyCustomBg();
            // });
    
            // this.#settings.connect('changed::use-custom-bg-dark', () => {
            //     this.#applyCustomBgDark();
            // });
    
            // this.#settings.connect('changed::enable-orientation', () => {
            //     this.#applyOrientation();
            // });
    
            // this.#settings.connect('changed::custom-font', () => {
            //     this.#applyCustomFont();
            // });
    
            // this.#settings.connect('changed::ascii-mode', () => {
            //     this.#applyAsciiMode();
            // });
    
            // this.#settings.connect('changed::unkown-ascii-state', () => {
            //     this.#applyUnknownAsciiState();
            // });
    
            // this.#settings.connect('changed::input-mode-list', () => {
            //     this.#applyInputModeList();
            // });
    
            // this.#settings.connect('changed::custom-theme', () => {
            //     this.#applyCustomThemePath();
            // });
    
            // this.#settings.connect('changed::custom-theme-dark', () => {
            //     this.#applyCustomThemeDarkPath();
            // });
    
            // this.#settings.connect('changed::custom-bg', () => {
            //     this.#applyCustomBgPath();
            // });
    
            // this.#settings.connect('changed::custom-bg-dark', () => {
            //     this.#applyCustomBgDarkPath();
            // });
    
            // this.#settings.connect('changed::input-mode-remember', () => {
            //     this.#applyInputModeRemember();
            // });
    
            // this.#settings.connect('changed::candidate-scroll-mode', () => {
            //     this.#applyCandidateScrollMode();
            // });
    
            // this.#settings.connect('changed::menu-ibus-emoji', () => {
            //     this.#applyMenuIbusEmoji();
            // });
    
            // this.#settings.connect('changed::menu-extension-preference', () => {
            //     this.#applyMenuExtensionPreference();
            // });
    
            // this.#settings.connect('changed::menu-ibus-preference', () => {
            //     this.#applyMenuIbusPreference();
            // });
    
            // this.#settings.connect('changed::menu-ibus-version', () => {
            //     this.#applyMenuIbusVersion();
            // });
    
            // this.#settings.connect('changed::menu-ibus-restart', () => {
            //     this.#applyMenuIbusRestart();
            // });
    
            // this.#settings.connect('changed::menu-ibus-exit', () => {
            //     this.#applyMenuIbusExit();
            // });
    
            // this.#settings.connect('changed::use-input-indicator', () => {
            //     this.#applyInputIndicator();
            // });
    
            // this.#settings.connect('changed::input-indicator-only-on-toggle', () => {
            //     this.#applyInputIndicatorOnlyOnToggle();
            // });
    
            // this.#settings.connect('changed::input-indicator-only-use-ascii', () => {
            //     this.#applyInputIndicatorOnlyUseAscii();
            // });
    
            // this.#settings.connect('changed::input-indicator-not-on-single-ime', () => {
            //     this.#applyInputIndicatorNotOnSingleIme();
            // });
    
            // this.#settings.connect('changed::input-indicator-use-scroll', () => {
            //     this.#applyInputIndicatorUseScroll();
            // });
    
            // this.#settings.connect('changed::input-indicator-animation', () => {
            //     this.#applyInputIndicatorAnimation();
            // });
    
            // this.#settings.connect('changed::use-indicator-show-delay', () => {
            //     this.#applyIndicatorShowDelay();
            // });
    
            // this.#settings.connect('changed::input-indicator-show-time', () => {
            //     this.#applyInputIndicatorShowTime();
            // });
    
            // this.#settings.connect('changed::use-indicator-auto-hide', () => {
            //     this.#applyIndicatorAutoHide();
            // });
    
            // this.#settings.connect('changed::input-indicator-hide-time', () => {
            //     this.#applyInputIndicatorHideTime();
            // });
    
            // this.#settings.connect('changed::use-popup-animation', () => {
            //     this.#applyPopupAnimation();
            // });
    
            // this.#settings.connect('changed::candidate-popup-animation', () => {
            //     this.#applyCandidatePopupAnimation();
            // });
    
            // this.#settings.connect('changed::use-candidate-reposition', () => {
            //     this.#applyCandidateReposition();
            // });
    
            // this.#settings.connect('changed::fix-ime-list', () => {
            //     this.#applyFixImeList();
            // });
    
            // this.#settings.connect('changed::use-indicator-left-click', () => {
            //     this.#applyIndicatorLeftClick();
            // });
    
            // this.#settings.connect('changed::indicator-left-click-func', () => {
            //     this.#applyIndicatorLeftClickFunc();
            // });
    
            // this.#settings.connect('changed::input-indicator-right-close', () => {
            //     this.#applyIndicatorRightClickClose();
            // });
    
            // this.#settings.connect('changed::use-indicator-custom-font', () => {
            //     this.#applyIndicatorCustomFont();
            // });
    
            // this.#settings.connect('changed::indicator-custom-font', () => {
            //     this.#applyIndicatorCustomFontValue();
            // });
    
            // this.#settings.connect('changed::use-tray', () => {
            //     this.#applyTrayIcon();
            // });
    
            // this.#settings.connect('changed::use-tray-click-source-switch', () => {
            //     this.#applyTrayClickSourceSwitch();
            // });
    
            // this.#settings.connect('changed::tray-source-switch-click-key', () => {
            //     this.#applyTraySourceSwitchClickKey();
            // });
    
            // this.#settings.connect('changed::use-candidate-box-right-click', () => {
            //     this.#applyCandidateBoxRightClick();
            // });
    
            // this.#settings.connect('changed::candidate-box-right-click-func', () => {
            //     this.#applyCandidateBoxRightClickFunc();
            // });
    
            // this.#settings.connect('changed::use-candidate-still', () => {
            //     this.#applyCandidateStill();
            // });
    
            // this.#settings.connect('changed::candidate-still-position', () => {
            //     this.#applyCandidateStillPosition();
            // });
    
            // this.#settings.connect('changed::remember-candidate-position', () => {
            //     this.#applyRememberCandidatePosition();
            // });
    
            // this.#settings.connect('changed::candidate-box-position', () => {
            //     this.#applyCandidateBoxPosition();
            // });
    }

    /**
     * apply everything to the GNOME Shell
     *
     * @returns {void}
     */
    applyAll() {
        // this.#applyCandidateOrientation();
    }
        // this.#applyAutoSwitch(false);
        // this.#applyCustomTheme(false);
        // this.#applyCustomThemeDark(false);
        // this.#applyCandidateOpacity(false);
        // this.#applyIndicatorOpacity(false);
        // this.#applyCustomBg(false);
        // this.#applyCustomBgDark(false);
        // this.#applyOrientation(false);
        // this.#applyCustomFont(false);
        // this.#applyAsciiMode(false);
        // this.#applyUnknownAsciiState(false);
        // this.#applyInputModeList(false);
        // this.#applyCustomThemePath(false);
        // this.#applyCustomThemeDarkPath(false);
        // this.#applyCustomBgPath(false);
        // this.#applyCustomBgDarkPath(false);
        // this.#applyInputModeRemember(false);
        // this.#applyCandidateScrollMode(false);
        // this.#applyMenuIbusEmoji(false);
        // this.#applyMenuExtensionPreference(false);
        // this.#applyMenuIbusPreference(false);
        // this.#applyMenuIbusVersion(false);
        // this.#applyMenuIbusRestart(false);
        // this.#applyMenuIbusExit(false);
        // this.#applyInputIndicator(false);
        // this.#applyInputIndicatorOnlyOnToggle(false);
        // this.#applyInputIndicatorOnlyUseAscii(false);
        // this.#applyInputIndicatorNotOnSingleIme(false);
        // this.#applyInputIndicatorUseScroll(false);
        // this.#applyInputIndicatorAnimation(false);
        // this.#applyIndicatorShowDelay(false);
        // this.#applyInputIndicatorShowTime(false);
        // this.#applyIndicatorAutoHide(false);
        // this.#applyInputIndicatorHideTime(false);
        // this.#applyPopupAnimation(false);
        // this.#applyCandidatePopupAnimation(false);
        // this.#applyCandidateReposition(false);
        // this.#applyFixImeList(false);
        // this.#applyIndicatorLeftClick(false);
        // this.#applyIndicatorLeftClickFunc(false);
        // this.#applyIndicatorRightClickClose(false);
        // this.#applyIndicatorCustomFont(false);
        // this.#applyIndicatorCustomFontValue(false);
        // this.#applyTrayIcon(false);
        // this.#applyTrayClickSourceSwitch(false);
        // this.#applyTraySourceSwitchClickKey(false);
        // this.#applyCandidateBoxRightClick(false);
        // this.#applyCandidateBoxRightClickFunc(false);
        // this.#applyCandidateStill(false);
        // this.#applyCandidateStillPosition(false);
        // this.#applyRememberCandidatePosition(false);
        // this.#applyCandidateBoxPosition(false);
    

    /**
     * revert everything done by this class to the GNOME Shell
     *
     * @returns {void}
     */
    revertAll() {
        // this.#applyCandidateOrientation(true);
    }
    // this.#applyAutoSwitch(true);
        // this.#applyCustomTheme(true);
        // this.#applyCustomThemeDark(true);
        // this.#applyCandidateOpacity(true);
        // this.#applyIndicatorOpacity(true);
        // this.#applyCustomBg(true);
        // this.#applyCustomBgDark(true);
        // this.#applyOrientation(true);
        // this.#applyCustomFont(true);
        // this.#applyAsciiMode(true);
        // this.#applyUnknownAsciiState(true);
        // this.#applyInputModeList(true);
        // this.#applyCustomThemePath(true);
        // this.#applyCustomThemeDarkPath(true);
        // this.#applyCustomBgPath(true);
        // this.#applyCustomBgDarkPath(true);
        // this.#applyInputModeRemember(true);
        // this.#applyCandidateScrollMode(true);
        // this.#applyMenuIbusEmoji(true);
        // this.#applyMenuExtensionPreference(true);
        // this.#applyMenuIbusPreference(true);
        // this.#applyMenuIbusVersion(true);
        // this.#applyMenuIbusRestart(true);
        // this.#applyMenuIbusExit(true);
        // this.#applyInputIndicator(true);
        // this.#applyInputIndicatorOnlyOnToggle(true);
        // this.#applyInputIndicatorOnlyUseAscii(true);
        // this.#applyInputIndicatorNotOnSingleIme(true);
        // this.#applyInputIndicatorUseScroll(true);
        // this.#applyInputIndicatorAnimation(true);
        // this.#applyIndicatorShowDelay(true);
        // this.#applyInputIndicatorShowTime(true);
        // this.#applyIndicatorAutoHide(true);
        // this.#applyInputIndicatorHideTime(true);
        // this.#applyPopupAnimation(true);
        // this.#applyCandidatePopupAnimation(true);
        // this.#applyCandidateReposition(true);
        // this.#applyFixImeList(true);
        // this.#applyIndicatorLeftClick(true);
        // this.#applyIndicatorLeftClickFunc(true);
        // this.#applyIndicatorRightClickClose(true);
        // this.#applyIndicatorCustomFont(true);
        // this.#applyIndicatorCustomFontValue(true);
        // this.#applyTrayIcon(true);
        // this.#applyTrayClickSourceSwitch(true);
        // this.#applyTraySourceSwitchClickKey(true);
        // this.#applyCandidateBoxRightClick(true);
        // this.#applyCandidateBoxRightClickFunc(true);
        // this.#applyCandidateStill(true);
        // this.#applyCandidateStillPosition(true);
        // this.#applyRememberCandidatePosition(true);
        // this.#applyCandidateBoxPosition(true);

//     /**
//      * apply candidate orientation settings
//      *
//      * @param {boolean} forceOriginal force original shell setting
//      *
//      * @returns {void}
//      */
//     #applyCandidateOrientation(forceOriginal = false) {
//         let orientation = this.#settings.get_int('candidate-orientation');
//         if (forceOriginal) {
//             this.#ibusOrientation.orientation = 1 - orientation;
//         } else {
//             this.#ibusOrientation.orientation = orientation;
//         }
//     }
        /**
     * Export current settings to a file
     *
     * @returns {void}
     */
    exportCurrentSettings() {
        const SCHEMA_PATH = "your.schema.path"; // replace with your actual schema path

        const fileChooser = new Gtk.FileChooserDialog({
            title: _("Export Current Settings"),
            action: Gtk.FileChooserAction.SAVE,
        });
        fileChooser.add_button(_("Cancel"), Gtk.ResponseType.CANCEL);
        fileChooser.add_button(_("Save"), Gtk.ResponseType.OK);

        fileChooser.set_current_name("settings.ini");
        fileChooser.set_do_overwrite_confirmation(true);

        const filter = new Gtk.FileFilter();
        filter.add_pattern("*.ini");
        filter.set_name("INI files");
        fileChooser.add_filter(filter);

        fileChooser.connect("response", (dialog, response) => {
            if (response === Gtk.ResponseType.OK) {
                let filename = dialog.get_filename();
                if (!filename.ends_with(".ini")) {
                    filename += ".ini";
                }
                let file = Gio.file_new_for_path(filename);
                let raw = file.replace(null, false, Gio.FileCreateFlags.NONE, null);
                let out = Gio.BufferedOutputStream.new_sized(raw, 4096);

                out.write_all(
                    GLib.spawn_command_line_sync(`dconf dump ${SCHEMA_PATH}`)[1],
                    null
                );
                out.close(null);
            }
            dialog.destroy();
        });

        fileChooser.show();
    }
}

