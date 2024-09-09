/**
 * Prefs Dialog
 *
 * @author     Javad Rahmatzadeh <j.rahmatzadeh@gmail.com>
 * @copyright  2020-2024
 * @license    GPL-3.0-only
 */

import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import * as Config from 'resource:///org/gnome/Shell/Extensions/js/misc/config.js';

import {Prefs} from './lib/Prefs/Prefs.js';
import {PrefsKeys} from './lib/Prefs/PrefsKeys.js';

/**
 * Preferences window entry point
 */
export default class customizeIBusPrefs extends ExtensionPreferences
{
    /**
     * fill preferences window
     *
     * @returns {void}
     */
    fillPreferencesWindow(window) {
        const shellVersion = parseFloat(Config.PACKAGE_VERSION);
        const gettextDomain = this.metadata['gettext-domain'];
    
        let UIFolderPath = this.dir.get_child('ui').get_path();
        let prefsKeys = new PrefsKeys(shellVersion);
    
        let prefs = new Prefs(
            {
                Builder: new Gtk.Builder(),
                Settings: this.getSettings(),
                Gdk,
            },
            prefsKeys,
            shellVersion
        );
    
        prefs.fillPrefsWindow(window, UIFolderPath, gettextDomain);
    }
}