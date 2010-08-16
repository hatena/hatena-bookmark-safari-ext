var Abstract = {};

Abstract.tabs = {
    // タブを新規作成
    create: function (createProperties, callback) {
        var bw  = safari.application.activeBrowserWindow;
        var tab = isNewTab ? bw.openTab() : bw.activeTab;
        tab.url = createProperties.url;

        if (typeof callback === "function")
            callback(tab);

        return tab;
    },

    // タブ ID を指定してタブを取得
    get: function (tabid, callback) {

    },

    // 選択中のタブを取得する
    getSelected: function () {
    },

    onUpdated: function () {
    },

    onSelectionChanged: function () {
    }
};

Abstract.windows = {
    get: function (windowId, callback) {
    },

    // ウィンドウの位置を変更する
    update: function (windowId, position) {
    },

    getLastFocused: function (callback) {
    }
};

Abstract.self = {
    // injected スクリプトなどから接続要求があった場合, 呼び出される.
    // Abstract.self.onConnect.addListener(...)
    onConnect: {
        addListener: function (port, name) {
        }
    }
};

Abstract.extension = {
    // var _port = Abstract.extension.connect();
    // port を返す
    connect: function () {
    }
};

