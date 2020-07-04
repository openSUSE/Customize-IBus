#! /usr/bin/python
# -*- encoding: UTF-8 -*-
# By tuberry@github.com

def basicTheme():
    css = ["""
.candidate-popup-content {
    border-radius: 0;
    border-width: 1px;
    padding: 0 !important;
}""",
    """
.candidate-popup-text {
    border-width: 0;
    border-bottom-width: 1px;
    padding: 0;
}""",
    """
.candidate-box {
    transition-duration: 100ms;
    border-radius: 0;
    padding: 8px;
}""",
    """
.candidate-label {
    padding: 0 4px;
}""",
    """
/* hide page buttons */
.candidate-page-button,
.candidate-page-button-box,
.candidate-page-button-previous,
.candidate-page-button-next,
.candidate-page-button-icon {
    width: 0 !important;
    height: 0 !important;
    border-width: 0 !important;
    color: transparent !important;
    background-color: transparent !important;
}

.candidate-popup-boxpointer {
    -arrow-border-radius: 0;
    -arrow-rise: 5px;
}"""]
    csss = '\n'.join(css);
    # print(csss)
    return csss.replace('.candidate', '.ibus-tweaker-candidate')

def commonTheme():
    text = '#000000'
    text1 = '#FFFFFF'
    htr = lambda x,y : 'rgba({})'.format(', '.join([str(int(x[i:i+2], 16)) for i in (1, 3, 5)] + [str(y)]))
    css = ["""
.candidate-box {{
    color: {};
}}""".format(htr(text, 1)),
    """
.candidate-box:selected .candidate-index {{
    color: {};
}}""".format(htr(text1, 0.6)),
    """
.candidate-box .candidate-index {{
    color: {};
}}""".format(htr(text, 0.6))
]
    cssd = ["""
.night .candidate-box {{
    color: {};
}}""".format(htr(text1, 1)),
    """
.night .candidate-box:selected .candidate-index {{
    color: {};
}}""".format(htr(text, 0.6)),
    """
.night .candidate-box .candidate-index {{
    color: {};
}}""".format(htr(text1, 0.6))
]
    csss = '\n'.join(css) + '\n'.join(cssd);
    return csss.replace('.candidate', '.ibus-tweaker-candidate')

def colorTheme(name, fgcolor, bgcolor, fgcolor1):
    text = '#000000'
    text1 = '#FFFFFF'
    htr = lambda x,y : 'rgba({})'.format(', '.join([str(int(x[i:i+2], 16)) for i in (1, 3, 5)] + [str(y)]))
    css = ["""
/*
 *  {}
 */
.{} .candidate-popup-content {{
    background-color: {};
    border-color: {};
}}""".format(fgcolor, name, htr('#FFFFFF', 1), htr(fgcolor, 0.9)),
    """
.{} .candidate-popup-text {{
    color: {};
    border-color: {};
}}""".format(name, htr(text, 1), htr(fgcolor, 0.9)),
    """
.{} .candidate-box:hover {{
    background-color: {};
}}""".format(name, htr(fgcolor, 0.6)),
    """
.{} .candidate-box:selected {{
    color: {};
    background-color: {};
}}""".format(name, htr('#FFFFFF', 1), htr(fgcolor, 0.9)),
]
    cssd = ["""
/*
 *  {}
 */
.night-{} .candidate-popup-content {{
    background-color: {};
    border-color: {};
}}""".format(fgcolor1, name, htr(bgcolor, 1), htr(fgcolor1, 0.8)),
    """
.night-{} .candidate-popup-text {{
    color: {};
    border-color: {};
}}""".format(name, htr(text1, 1), htr(fgcolor1, 0.8)),
    """
.night-{} .candidate-box:hover {{
    background-color: {};
}}""".format(name, htr(fgcolor1, 0.6)),
    """
.night-{} .candidate-box:selected {{
    color: {};
    background-color: {};
}}""".format(name, htr(bgcolor, 1), htr(fgcolor1, 0.8)),
]
    csss = '\n'.join(css) + '\n'.join(cssd)
    # print(csss)
    return csss.replace('.candidate', '.ibus-tweaker-candidate')

def gaps(word):
    gap = '''

/*
 *   {}
 */

    '''.format(word)
    return gap
if __name__ == "__main__":
    dark = '#25272c'
    dark_palette_name = ['red', 'green', 'orange', 'blue', 'purple', 'turquoise', 'grey']
    dark_palette = ['#DE3163', '#20B51A', '#E18A3B', '#1793D0', '#A951B4', '#128F93', '#53586F']
    light_palette = ["#FC8EAC", "#A4ED85", "#FAC053", "#8ABCDF", "#EAB2F2", "#5EC2C7", "#DCD9F0"]
    dark_theme = ''
    for i in range(0, 7):
        dark_theme += colorTheme(dark_palette_name[i], dark_palette[i], dark, light_palette[i]) + '\n\n'
    with open('stylesheet.css', 'a') as f:
        f.write(gaps('Common'))
        f.write(basicTheme())
        f.write(gaps('Text'))
        f.write(commonTheme())
        f.write(gaps('Colors'))
        f.write(dark_theme)
