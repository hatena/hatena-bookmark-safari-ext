/**
 * Response.js - Wraps Safari's dispatchMessage and addEventListener.
 *
 * == Usage ==
 *
 * -- Client side --
 *
 * Connect()
 *     .send("message1", "value1").recv(function (ev) {
 *         console.log(ev);
 *     })
 *     .send("message2", "value2").recv(function (ev) {
 *         console.log(ev);
 *     })
 *     .error(function (x) {
 *         alert("exception catched " + x);
 *     })
 * .close();
 *
 * -- Server side --
 *
 * Response(function (get) {
 *     get("/login", function (ev) {
 *         return "Response 1";
 *     });
 *
 *     get("users/(.+)", function (ev, matched) {
 *         return "user : " + matched[1];
 *     });
 * });
 *
 */

function Response(block) {
    var handlers = [];

    block(function get(name, callback) {
        handlers.push([name, callback]);
    });

    safari.application.addEventListener("message",
        function handleMessage(ev) {
            for (var i = 0; i < handlers.length; ++i) {
                var handler  = handlers[i];
                var pattern  = handler[0];
                var callback = handler[1];

                var matched = ev.name.match(pattern);

                if (matched) {
                    ev.target.dispatchMessage(ev.name, callback(ev, matched));
                    break;
                }
            }
    }, false);
}
