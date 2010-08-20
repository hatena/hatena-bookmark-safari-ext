(function() {
    var entryURL = decodeURIComponent(URI.parse('http://example.com/' + location.href).param('url'));

    $(function() {
        function show(entry) {
            if (Config.get("content.bookmarkcounter.enabled")) $("#count a")
                .text(entry.count)
                .attr('href', 'http://b.hatena.ne.jp/entry/' + entryURL)
                .click(function() {
                    Connect().send("PopupManager.show", { url : entryURL, view : "comment" }).recv(function (ev) {}).close();
                    return false;
                });

            if (Config.get("content.fans.enabled")) entry.favorites.reverse().forEach(function (fav) {
                var link  = "http://b.hatena.ne.jp/" + fav.name + "/" + fav.timestamp.replace(/\//g, '') + "#bookmark-" + entry.eid;
                var lines = [fav.name];

                if (fav.body) lines.push(fav.body);
                if (fav.tags.length) lines.push(fav.tags.join(', '));
                lines.push(fav.timestamp);

                var iconContainer = $("<a>");
                iconContainer.attr({
                    href: link,
                    title: lines.join("\n"),
                    target: '_blank'
                });

                var icon = $("<img>");
                icon.attr({
                    width: 16,
                    height: 16,
                    src: "http://www.st-hatena.com/users/" + fav.name.substring(0, 2) + "/" + fav.name + "/profile_s.gif"
                });

                iconContainer.append(icon);
                $("#favs").append(iconContainer);
            });
            window.parent.postMessage('resizeCounter?width=' + ($("#container").width()) + 'px&height=' + ($("#container").height()) + "px", entryURL);
        }

        Connect()
            .send("HTTPCache.entry.get", entryURL).recv(function (event) {
                var res = event.message;

                if (res.count > 0) {
                    show(res);
                }
            })
            .close();
    });
})();