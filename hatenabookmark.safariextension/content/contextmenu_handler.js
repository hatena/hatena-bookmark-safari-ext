(function () {
    document.addEventListener("contextmenu", handleContextMenu, false);

    function handleContextMenu(event) {
        safari.self.tab.setContextMenuEventUserInfo(event, {
            nodeName: event.target.nodeName,
            url: decodeURI(event.target.href) // XXX: aタグのhrefがencodeされているが．内部的にさらにencodeしているので，ここで1回decodeしてる
        });
    }
})();
