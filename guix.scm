(use-modules (guix build-system gnu)
             (guix git-download)
             ((guix licenses) #:prefix license:)
             (guix packages)
             (gnu packages gettext)
             (gnu packages glib))

(package
  (name "gnome-shell-extension-customize-ibus")
  (version "78")
  (source
   (origin
     (method git-fetch)
     (uri (git-reference
           (url "https://github.com/openSUSE/Customize-IBus.git")
           (commit (string-append "v" version))))
     (file-name (git-file-name name version))
     (sha256
      (base32 "1hnnsjriq7xaakk8biwz55mn077lnm9nsmi4wz5zk7clgxmasvq9"))))
  (build-system gnu-build-system)
  (arguments
   `(#:make-flags
     (list (string-append "VERSION=" ,version)
           (string-append "INSTALLBASE=" (assoc-ref %outputs "out")
                          "/share/gnome-shell/extensions"))
     #:tests? #f ; No test target
     #:phases
     (modify-phases %standard-phases
       (delete 'bootstrap)
       (delete 'configure))))
  (native-inputs
   `(("gettext" ,gettext-minimal)
     ("glib:bin" ,glib "bin")))
  (home-page "https://github.com/openSUSE/Customize-IBus")
  (synopsis "GNOME Shell Extension for IBus Customization")
  (description "Customize IBus provides full customization of appearance,
behavior, system tray and input source indicator for IBus.")
  (license license:gpl3+))
