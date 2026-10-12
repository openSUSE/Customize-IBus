// Exercise production methods with real GObject/GSettings bindings. Only
// GNOME Shell UI and daemon side effects are replaced; no session is required.
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';

const [, bytes] = GLib.file_get_contents(`${ARGV[0]}/extension.js`);
const source = new TextDecoder().decode(bytes);
const classStart = source.indexOf('class _Extensions extends GObject.Object');
if (classStart < 0) throw new Error('Extensions class not found');
const classSource = source.slice(classStart);

function method(signature) {
    const escaped = signature.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = classSource.match(new RegExp(`^([ \\t]*)${escaped}`, 'm'));
    if (!match) throw new Error(`Method not found: ${signature}`);
    const indent = match[1];
    const start = match.index + indent.length;
    const end = classSource.indexOf(`\n${indent}}`, start);
    if (end < 0) throw new Error(`Method end not found: ${signature}`);
    return classSource.slice(start, end + indent.length + 2);
}

const Fields = {IBUSRESTTIME: 'ibus-restart-time'};
const gsettings = new Gio.Settings({
    schema_id: 'org.gnome.shell.extensions.customize-ibus',
});
let restarts = 0;
let notifications = [];
let onRestart = null;
const IBusManager = {
    restartDaemon() {
        restarts++;
        if (onRestart) onRestart();
    },
};
const MessageTray = {
    Source: class {
        addNotification(notification) {
            notifications.push(notification);
        }
    },
    Notification: class {
        constructor(options) {
            Object.assign(this, options);
        }
    },
};
const Main = {messageTray: {add() {}}};

// Load the actual constructor, setter and cleanup rather than maintaining a
// second implementation of request handling. Other feature bindings are omitted.
const Harness = new Function(
    'Gio',
    'GLib',
    'GObject',
    'Fields',
    'gsettings',
    'IBusManager',
    'MessageTray',
    'Main',
    '_',
    `return GObject.registerClass({
        Properties: {
            ibusresttime: GObject.ParamSpec.string(
                'ibusresttime', '', '', GObject.ParamFlags.WRITABLE, ''),
        },
    }, class RestartHarness extends GObject.Object {
        ${method('constructor()')}
        _bindSettings() {
            gsettings.bind(Fields.IBUSRESTTIME, this, 'ibusresttime', Gio.SettingsBindFlags.GET);
        }
        ${method('set ibusresttime(')}
        ${method('destroy()')}
    })`
)(
    Gio,
    GLib,
    GObject,
    Fields,
    gsettings,
    IBusManager,
    MessageTray,
    Main,
    text => text
);

function equal(actual, expected, context) {
    if (actual !== expected)
        throw new Error(`${context}: expected ${expected}, got ${actual}`);
}

function quiet(context) {
    equal(restarts, 0, `${context}: restarts`);
    equal(notifications.length, 0, `${context}: notifications`);
}

let current = null;
function enable(initial = '') {
    if (current) current.destroy();
    onRestart = null;
    gsettings.set_string(Fields.IBUSRESTTIME, initial);
    restarts = 0;
    notifications = [];
    current = new Harness();
    return current;
}

const tests = {
    empty_initial_binding() {
        enable();
        quiet('initial empty binding');
    },
    persisted_request_is_not_replayed() {
        enable('1791824400000');
        gsettings.set_string(Fields.IBUSRESTTIME, '1791824400000');
        quiet('persisted request and repeated sync');
    },
    empty_sync_and_reset_are_not_requests() {
        enable();
        gsettings.set_string(Fields.IBUSRESTTIME, '');
        gsettings.reset(Fields.IBUSRESTTIME);
        quiet('duplicate empty value and reset');
    },
    invalid_requests_are_ignored() {
        enable();
        for (const value of [
            '',
            ' ',
            'NaN',
            '0',
            '-1',
            '1.5',
            '1e12',
            '123invalid',
            '9007199254740992',
        ])
            gsettings.set_string(Fields.IBUSRESTTIME, value);
        quiet('invalid requests');
    },
    manual_requests_are_processed_once() {
        enable();
        for (const value of [
            '1791824400000',
            '1791824400000',
            '',
            '1791824400000',
            '1791824400001',
        ])
            gsettings.set_string(Fields.IBUSRESTTIME, value);
        equal(restarts, 2, 'two distinct manual requests');
        equal(notifications.length, 2, 'one notification per request');
    },
    notification_time_is_now_not_the_request_timestamp() {
        enable();
        gsettings.set_string(Fields.IBUSRESTTIME, '1791824400000');
        equal(notifications.length, 1, 'manual notification');
        const age = Math.abs(
            notifications[0].datetime.to_unix() -
                GLib.DateTime.new_now_local().to_unix()
        );
        if (age > 2)
            throw new Error(`Notification has incorrect time: age=${age}`);
    },
    reentrant_sync_does_not_repeat_a_request() {
        enable();
        onRestart = () =>
            gsettings.set_string(Fields.IBUSRESTTIME, '1791824400000');
        gsettings.set_string(Fields.IBUSRESTTIME, '1791824400000');
        equal(restarts, 1, 'reentrant settings sync');
        equal(notifications.length, 1, 'reentrant notification');
    },
    disable_unbinds_the_request_property() {
        const target = enable();
        target.destroy();
        // Replace the setter with a trap: even an inert callback is a leak.
        const descriptor = Object.getOwnPropertyDescriptor(
            Harness.prototype,
            'ibusresttime'
        );
        let deliveries = 0;
        Object.defineProperty(Harness.prototype, 'ibusresttime', {
            ...descriptor,
            set(value) {
                deliveries++;
                descriptor.set.call(this, value);
            },
        });
        try {
            gsettings.set_string(Fields.IBUSRESTTIME, '1791824400000');
            equal(deliveries, 0, 'settings delivery after disable');
            descriptor.set.call(target, '1791824400001');
            quiet('disabled object');
        } finally {
            Object.defineProperty(
                Harness.prototype,
                'ibusresttime',
                descriptor
            );
        }
    },
    reenable_does_not_replay_old_requests() {
        enable();
        gsettings.set_string(Fields.IBUSRESTTIME, '1791824400000');
        enable('1791824400000');
        quiet('reenable');
        gsettings.set_string(Fields.IBUSRESTTIME, '1791824400001');
        equal(restarts, 1, 'new request after reenable');
        equal(notifications.length, 1, 'new notification after reenable');
    },
};

for (const [name, test] of Object.entries(tests)) {
    test();
    print(`PASS ${name}`);
}
current.destroy();
print(`${Object.keys(tests).length} restart request cases passed`);
