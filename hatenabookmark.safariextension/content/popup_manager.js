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
                var height = window.innerHeight * 0.9;
                popup.style.setProperty('height', height + 'px', 'important');
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

            if (args.error)
                base += "&error=1";

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
        return !!(document.body && document.body.localName.toLowerCase() !== "frameset" && !includeFlash() && !bodyIsInline());
    }

    function bodyIsInline() {
        return window.getComputedStyle(document.body).display.toLowerCase() == 'inline';
    }

    function includeFlash() {
        return Array.prototype.some.call(document.querySelectorAll('object, embed'), function(flash) {
            console.log(flash);
            console.log(is_in_view(flash));
            return is_in_view(flash);
        });
    }

    function is_in_view(elem) {
        var rect = elem.getBoundingClientRect();
        var ws = [1, rect.width-1];
        var hs = [1, rect.height-1];
        for(var w in ws ) for(var h in hs)
            if (document.elementFromPoint(rect.left + ws[w], rect.top + hs[h]) === elem) return true;
        return false;
    }


    function getEntryPageURL(url) {
        return "http://b.hatena.ne.jp/entry/" + url.replace(/^.*:\/\//, "");
    }

    function openEntryPage() {
        Connect()
            .send("Abstract.tabs.create", { url: getEntryPageURL(location.href), selected: true })
            .recv(function () {})
            .close();
    }


    // TODO: これがここにあるのはやばい
    document.addEventListener("contextmenu", handleContextMenu, false);

    function handleContextMenu(event) {
        safari.self.tab.setContextMenuEventUserInfo(event, {
            nodeName: event.target.nodeName,
            url: event.target.href
        });
    }

})();
