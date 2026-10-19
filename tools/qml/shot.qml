// Loads a URL in an offscreen WebEngine window and saves a screenshot.   qml6 shot.qml -- <url> <out.png> [wait-ms]
import QtQuick
import QtQuick.Window
import QtWebEngine
Window {
    id: w; width: 1600; height: 900; visible: true
    readonly property var a: Qt.application.arguments
    readonly property int n: a.length
    readonly property bool hasWait: /^[0-9]+$/.test(a[n - 1])
    readonly property string target: a[hasWait ? n - 3 : n - 2]
    readonly property string out: a[hasWait ? n - 2 : n - 1]
    WebEngineView { anchors.fill: parent; url: w.target; settings.localContentCanAccessFileUrls: true }
    Timer { interval: w.hasWait ? +w.a[w.n - 1] : 3500; running: true; onTriggered: parent.children[0].grabToImage(function(r){ r.saveToFile(w.out); Qt.quit() }) }
}
