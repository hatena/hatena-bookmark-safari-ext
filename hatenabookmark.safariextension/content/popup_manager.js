(function() {
    if (window.top !== window) return;

    safari.self.addEventListener("message", extensionMessageHandler, false);

    window.addEventListener("click", function() {
        PopupManager.hide();
    }, false);

    var PopupManager = {
        popup: null,
        lastView: null,
        show: function(args) {
            var self = this;
            var _width;
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
                popup.style.setProperty('width', _width + 'px', 'important');
            }

            Connect()
                .send("Config.get", { key: "popup.window.width" })
                .recv(function(event) {
                    _width = event.message;

                    if (args.view)
                        Connect()
                        .send("Config.set", { key: "popup.lastView", value : args.view })
                        .recv(showPopup)
                        .close();
                    else
                        showPopup();
                })
                .close();
        },
        hide: function() {
            if (!this.popup) return;
            this.popup.style.setProperty('display', 'none', 'important');
            this.popup.src = safari.extension.baseURI + "background/blank.html";
        },
        getSrc: function(args) {
            args = args || {};

            var base = safari.extension.baseURI + "background/popup.html"
                + '?url=' + encodeURIComponent(args.url || location.href);

            if (!args.url) {
                base += '&title=' + encodeURIComponent(document.title)
                    + '&faviconUrl='
                    + encodeURIComponent((document.querySelector('link[rel~="icon"]') || { href: '' }).href);
            }

            return base;
        }
    };

    var PageInformationManager = {
        getInfo: function() {
            var res = {};

            res.url   = encodeURI(location.href);
            res.title = document.title;

            var cannonical = this.getCannonical();
            if (cannonical)
                res.cannonical = cannonical;

            var images = this.getImages();
            if (images && images.length)
                res.images = images;

            return res;
        },
        getCannonical: function () {
            var link = document.evaluate(
                '/h:html/h:head/h:link[translate(@rel, "CANONICAL", "canonical") = "canonical"]',
                document,
                function () { return document.documentElement.namespaceURI || ""; },
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            ).singleNodeValue;
            if (!link || !link.href) return null;
            var url = link.href;
            if (location.href == url) return null;
            return url;
        },
        getImages: function () {
            var images = Array.prototype.filter.call(
                document.getElementsByTagName("img"),
                function (img) { return (img instanceof HTMLImageElement); }
            );

            var maxCount = 20;
            if (images.length > maxCount) {
                images = images.map(function (image, index) {
                    var size = Math.min(image.naturalWidth,
                                        image.naturalHeight);
                    return { image: image, size: size, index: index };
                }).sort(function (a, b) { return b.size - a.size; })
                    .slice(0, maxCount)
                    .sort(function(a, b) { return a.index - b.index; })
                    .map(function (item) { return item.image; });
            }
            return images.filter(function(image) { return image && image.src; }).map(function(image) { return image.src; });
        }
    };

    // おいとく
    window.addEventListener("message", function (ev) {
        var myOrigin = extractOrigin(safari.extension.baseURI).toLowerCase();
        if (ev.origin !== myOrigin)
            return;

        switch (ev.data) {
        case "getInfo":
            ev.source.postMessage(PageInformationManager.getInfo(ev), ev.origin);
            break;
        case "closeIframe":
            PopupManager.hide(ev);
        }
    }, false);

    function extensionMessageHandler(event) {
        switch (event.name) {
        case "showPopup":
            if (popupEmbeddable())
                PopupManager.show(event.message);
            else
                openEntryPage();
            break;
        }
    }

    function extractOrigin(str) {
        var matched = str.match(/([a-z-]+:\/\/[^\/]+)/);
        return matched[1];
    }

    function popupEmbeddable() {
        return !!document.body;
    }

    function getEntryPageURL(url) {
        return "http://b.hatena.ne.jp/entry/" + url.replace(/^.*:\/\//, "");
    }

    function openEntryPage() {
        alert(getEntryPageURL(location.href));

        Connect()
            .send("Abstract.tabs.create", { url: getEntryPageURL(location.href), selected: true })
            .recv(function () {})
            .close();
    }
})();
