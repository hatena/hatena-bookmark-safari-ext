if (true) {
    function createCounter(entry) {
        var container = document.createElement("div");
        var permalink = entry.entry_url;

        with (container.style) {
            right              = '5px';
            bottom             = '5px';
            position           = 'fixed';
            padding            = '4px';
            backgroundColor    = 'white';
            opacity            = '0.9';
            WebkitBorderRadius = "2px";
            margin             = "auto";
            zIndex             = 2147483647;
        }

        var counter = document.createElement("span");
        counter.textContent = entry.count;

        with (counter.style) {
            fontSize        = '12px';
            fontWeight      = 'bold';
            backgroundColor = 'pink';
            color           = 'red';
            padding         = '3px';
            fontFamily      = 'sans-serif';
            textDecoration  = 'none';
        }

        var counterContainer    = document.createElement("a");
        counterContainer.href   = permalink;
        counterContainer.title  = entry.title;
        counterContainer.target = "_blank";

        with (counterContainer.style) {
            display = 'table-cell';
        }

        counterContainer.appendChild(counter);
        container.appendChild(counterContainer);

        entry.favorites.reverse().forEach(function (fav) {
            var link  = "http://b.hatena.ne.jp/" + fav.name + "/" + fav.timestamp.replace(/\//g, '') + "#bookmark-" + entry.eid;
            var title = fav.name;

            if (fav.body)
                title += ": " + fav.body;

            var iconContainer    = document.createElement("a");
            iconContainer.href   = link;
            iconContainer.title  = title;
            iconContainer.target = "_blank";

            with (iconContainer.style) {
                display = 'table-cell';
            }

            var icon = document.createElement("img");
            icon.src = "http://www.st-hatena.com/users/" + fav.name.substring(0, 2) + "/" + fav.name + "/profile_s.gif";

            iconContainer.appendChild(icon);

            container.appendChild(iconContainer);
        });

        // '<a href="#{permalink}"><img title="#{title}" alt="#{title}" src="#{icon}" /></a>'

        return container;
    }

    Connect()
        .send("HTTPCache.entry.get", location.href).recv(function (ev) {
            var res = ev.message;

            if (res.count > 0) {
                document.body.appendChild(createCounter(res));
            }
        })
        .close();
}
