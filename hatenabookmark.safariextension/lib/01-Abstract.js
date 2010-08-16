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
