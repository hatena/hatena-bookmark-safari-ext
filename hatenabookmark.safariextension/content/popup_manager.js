(function() {
    if (window.top !== window) return;

    safari.self.addEventListener("message", extensionMessageHandler, false);

    window.addEventListener("click", function() {
        PopupManager.hide();
    }, false);

    var PopupManager = {
        popup: null,
        lastView: null,
        hiddenFlashPairs: null,

        // ============================================================ //
        // Show / Hide
        // ============================================================ //

        hide: function() {
            this.recoverHiddenFlashesVisibility();

            if (!this.popup) return;
            this.popup.style.setProperty('display', 'none', 'important');
            this.popup.src = safari.extension.baseURI + "background/blank.html";
        },

        show: function(args) {
            var self = this;

            function showPopup() {
                if (self.popup && self.popup.style.display != 'none' && args && args.view == self.lastView) {
                    self.lastView = args && args.view;
                    self.hide();
                    return;
                }
                self.lastView = args && args.view;

                if (!self.popup) {
                    self.popup = document.createElement('iframe');
                    self.popup.id = 'hatena-bookmark-safari-popup-window';
                    document.body.appendChild(self.popup);
                    self.popup.addEventListener('mousewheel', function(event) {
                        event.stopPropagation();
                        event.preventDefault();
                    }, false);
                }

                var popup = self.popup;
                popup.src = self.getSrc(args);
                popup.style.setProperty('display', 'block', 'important');
                self.setHeight(popup);

                // Flash の overlap などを確認する
                self.ensurePopupVisibility();
            }

            if (args.view)
                Connect()
                .send("Config.set", { key: "popup.lastView", value : args.view })
                .recv(showPopup)
                .close();
            else
                showPopup();
        },

        showInNewTab:
        function showInNewTab(args) {
            Connect()
                .send("Abstract.tabs.create", {
                    url      : PageInformationManager.getEntryPageURL(args.url || location.href),
                    selected : true
                })
                .recv(function () {})
                .close();
        },

        // ============================================================ //
        // Visibility
        // ============================================================ //

        // ポップアップが正しく表示できるかを確認する
        ensurePopupVisibility: function () {
            var overlappedFlashes = this.getOverlappedFlashes();
            var hiddenFlashPairs  = [];

            console.dir(overlappedFlashes);

            overlappedFlashes.forEach(function (flash) {
                var pair = [flash, flash.style.visibility];
                flash.style.setProperty("visibility", "hidden", "important");

                hiddenFlashPairs.push(pair);
            });

            this.hiddenFlashPairs = hiddenFlashPairs;
        },

        recoverHiddenFlashesVisibility: function () {
            if (!this.hiddenFlashPairs)
                return;

            this.hiddenFlashPairs.forEach(function (pair) {
                var flash           = pair[0];
                var savedVisibility = pair[1];

                flash.style.visibility = savedVisibility;
            });

            this.hiddenFlashPairs = null;
        },

        // Flash と重ならないかをチェックし, 重なっている Flash を返す
        getOverlappedFlashes: function () {
            var self = this;
            var popupRect = this.popup.getBoundingClientRect();

            var overlappedFlashes = [];

            return Array.prototype.slice.call(document.querySelectorAll('object, embed'))
                // .filter(RectUtils.isInView)
                .filter(function (flash) {
                    return RectUtils.rectOverlapsRect(flash.getBoundingClientRect(), popupRect);
                });
        },

        // ============================================================ //
        // Resize
        // ============================================================ //

        refreshResizeQueue: function () {
            if (this.resizeTimer) {
                window.clearTimeout(this.resizeTimer);
                this.resizeTimer = null;
            }

            this.resizeTimer = window.setTimeout(PopupManager.resize, 500);
        },

        resize: function () {
            var self = PopupManager;

            var height = window.innerHeight * 0.9;
            self.popup.style.setProperty('height', height + 'px', 'important');
            self.popup.contentWindow.postMessage({ method: 'resize', data: {height : height}},
                                                 safari.extension.baseURI + "background/popup.html");
        },

        setHeight: function() {
            if (!this.popup) return;
            this.refreshResizeQueue();
        },

        // ============================================================ //
        // Handle information
        // ============================================================ //

        getSrc: function(args) {
            args = args || {};

            var base = safari.extension.baseURI + "background/popup.html"
                + '?url=' + encodeURIComponent(args.url || location.href)
                + '&parent_url=' + encodeURIComponent(location.href);

            if (!args.url) {
                base += '&title=' + encodeURIComponent(document.title)
                    + '&faviconUrl='
                    + encodeURIComponent((document.querySelector('link[rel~="icon"]') || { href: '' }).href);
            }

            if (args.error)
                base += "&error=1";

            return base;
        }
    };

    function extractOrigin(str) {
        var matched = str.match(/([a-z-]+:\/\/[^\/]+)/);
        return matched[1];
    }

    // おいとく
    window.addEventListener("message", function (ev) {
        var myOrigin = extractOrigin(safari.extension.baseURI).toLowerCase();
        if (ev.origin !== myOrigin)
            return;

        switch (ev.data) {
        case "getInfo":
            ev.source.postMessage({ method: 'getInfo', data: PageInformationManager.getInfo(ev)}, ev.origin);
            break;
        case "closeIframe":
            PopupManager.hide(ev);
        }
    }, false);

    window.addEventListener("resize", function (ev) {
        PopupManager.setHeight();
    });

    // ====================================================================== //

    function extensionMessageHandler(event) {
        switch (event.name) {
        case "showPopup":
            if (popupEmbeddable())
                PopupManager.show(event.message);
            else
                PopupManager.showInNewTab(event.message);
            break;
        }
    }

    function popupEmbeddable() {
        return !!(document.body && document.body.localName.toLowerCase() !== "frameset" && !bodyIsInline());
    }

    function bodyIsInline() {
        return window.getComputedStyle(document.body).display.toLowerCase() == 'inline';
    }

    // TODO: これがここにあるのはやばい
    document.addEventListener("contextmenu", handleContextMenu, false);

    function handleContextMenu(event) {
        safari.self.tab.setContextMenuEventUserInfo(event, {
            nodeName: event.target.nodeName,
            url: decodeURI(event.target.href) // XXX: aタグのhrefがencodeされているが．内部的にさらにencodeしているので，ここで1回decodeしてる
        });
    }
})();
