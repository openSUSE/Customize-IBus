/* exported getThemeDirs getModeThemeDirs */
const { GLib } = imports.gi;

const fn = (...args) => GLib.build_filenamev(args);

function getThemeDirs() {
    return [
        fn(GLib.get_home_dir(), '.themes'),
        fn(GLib.get_user_data_dir(), 'themes'),
        ...GLib.get_system_data_dirs().map(dir => fn(dir, 'themes')),
    ];
}

function getModeThemeDirs() {
    return GLib.get_system_data_dirs()
        .map(dir => fn(dir, 'gnome-shell', 'theme'));
}
