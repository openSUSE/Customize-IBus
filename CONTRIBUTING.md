Feel free to add new functionalities or fix BUGs, or adapt to newest GNOME version. PRs are welcome.

Run `make test` to exercise IBus restart request handling with real GObject and
GSettings bindings. It requires GJS and `glib-compile-schemas` (on Debian/Ubuntu,
`sudo apt-get install gjs libglib2.0-bin`). The tests run headlessly with an
in-memory settings backend and temporary compiled schemas; they do not change
your desktop settings, restart IBus, or display notifications.
