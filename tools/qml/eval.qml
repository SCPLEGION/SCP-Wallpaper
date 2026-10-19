// Loads a URL, waits, evaluates a JS expression and prints "RESULT <value>".   qml6 eval.qml -- <url> <js>
import QtQuick
import QtQuick.Window
import QtWebEngine
Window {
    id: w; width: 1600; height: 900; visible: true
    readonly property var a: Qt.application.arguments
    readonly property string target: a[a.length - 2]
    readonly property string js: a[a.length - 1]
    WebEngineView { id: v; anchors.fill: parent; url: w.target; settings.localContentCanAccessFileUrls: true
        onLoadingChanged: function(r) { if (r.status === WebEngineView.LoadSucceededStatus) t.start() } }
    Timer { id: t; interval: 1800; onTriggered: v.runJavaScript(w.js, function(res) { console.error("RESULT " + res); Qt.quit() }) }
}
