(function() {
    var entryURL = URI.parse(location.href).param('url');

    Connect()
        .send("HTTPCache.entry.get", entryURL).recv(function (event) {
            var res = event.message;

            if (res.count > 0) {
                show(res);
            } else {
                hideWindow();
            }
        })
        .close();


    function hideWindow() {
        window.parent.postMessage('resizeCounter?width=0px&height=0px', entryURL);
    }

    function show(entry) {
        $(function() {
            if (!Config.get("content.fans.enabled") || !Array.isArray(entry.favorites)) {
                hideWindow();
                return;
            }

            entry.favorites.reverse().forEach(function (fav) {
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
                    src: "http://cdn1.www.st-hatena.com/users/" + fav.name.substring(0, 2) + "/" + fav.name + "/profile_s.gif"
                });

                iconContainer.append(icon);
                $("#favs").append(iconContainer);
            });

            var padding = 8;
            window.parent.postMessage('resizeCounter?width=' +
                                      (padding + $("#container").width()) + 'px&height=' +
                                      (padding + $("#container").height()) + "px", entryURL);
        });
    }
})();
