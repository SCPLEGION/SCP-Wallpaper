// Loads a URL, waits, evaluates a JS expression and prints "RESULT <value>".   qml6 eval.qml -- <url> <js> [wait-ms]
import QtQuick
import QtQuick.Window
import QtWebEngine
Window {
    id: w; width: 1600; height: 900; visible: true
    readonly property var a: Qt.application.arguments
    readonly property bool hasWait: /^[0-9]+$/.test(a[a.length - 1])
    readonly property string target: a[a.length - (hasWait ? 3 : 2)]
    readonly property string js: a[a.length - (hasWait ? 2 : 1)]
    WebEngineView { id: v; anchors.fill: parent; url: w.target; settings.localContentCanAccessFileUrls: true
        onLoadingChanged: function(r) { if (r.status === WebEngineView.LoadSucceededStatus) t.start() } }
    Timer { id: t; interval: w.hasWait ? +w.a[w.a.length - 1] : 1800; onTriggered: v.runJavaScript(w.js, function(res) { console.error("RESULT " + res); Qt.quit() }) }
}
