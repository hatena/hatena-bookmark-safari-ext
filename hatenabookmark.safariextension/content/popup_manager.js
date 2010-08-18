(function() {
    if (window.top !== window) return;

    safari.self.addEventListener("message", extensionMessageHandler, false);

    document.body.addEventListener("click", function() {
        PopupManager.hide();
    }, false);

    var PopupManager = {
        popup: null,
        show: function(event) {
            if (!this.popup) {
                this.popup = document.createElement('iframe');
                document.body.appendChild(this.popup);
            }
            var popup = this.popup;
            popup.src = this.getSrc(event);

            with (popup.style) {
                display    = 'block';
                position   = 'fixed';
                right      = '0px';
                top        = '0px';
                height     = '100%';
                width      = '600px';
                background = 'white';
                zIndex     = 2147483647;
            }

        },
        hide: function() {
            if (!this.popup) return;
            this.popup.style.display = 'none';
        },
        getSrc: function(event) {
            return safari.extension.baseURI + event.message
                + '?url=' + encodeURIComponent(location.href)
                + '&title=' + encodeURIComponent(document.title)
                +'&faviconUrl='
                + encodeURIComponent((document.querySelector('link[rel~="icon"]') || { href: '' }).href);
        }
    };

    var PageInformationManager = {
        getInfo: function() {
            var res = {};

            res.url   = location.href;
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
        var res;

        var myOrigin = extractOrigin(safari.extension.baseURI).toLowerCase();
        if (ev.origin !== myOrigin)
            return;

        switch (ev.data) {
        case "getInfo":
            res = PageInformationManager.getInfo(ev);
            break;
        case "closeIframe":
            res = PopupManager.hide(ev);
        }

        ev.source.postMessage(res, ev.origin);
    }, false);


    function extensionMessageHandler(event) {
        switch (event.name) {
        case "showPopup":
            PopupManager.show(event);
            break;
        }
    }

    function extractOrigin(str) {
        var matched = str.match(/([a-z-]+:\/\/[^\/]+)/);
        return matched[1];
    }

})();
