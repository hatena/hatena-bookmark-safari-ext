var PageInformationManager = {
    getEntryPageURL:
    function getEntryPageURL(url) {
        return "http://b.hatena.ne.jp/entry/" + url.replace(/^.*:\/\//, "");
    },
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
