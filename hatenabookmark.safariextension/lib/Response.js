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
 *     get("/login", function (ev, matched, dispatch) {
 *         return "Response 1";
 *     });
 *
 *     get("users/(.+)", function (ev, matched, dispatch) {
 *         return "user : " + matched[1];
 *     });
 *
 *     get("get/(.+)", function (ev, matched, dispatch) {
 *         $.get(matched[0], function (res) {
 *              dispatch(res);
 *         });
 *     });
 * });
 *
 */

function Response(block) {
    const delimiter = "-";

    var handlers = [];

    function extractTime(str) {
        var matched = str.match(delimiter + "(\\d+)$");
        return matched[matched.length - 1];
    }

    function eraseTime(str) {
        return str.replace(new RegExp(delimiter + "\\d+$"), "");
    }

    block(function get(name, callback) {
        handlers.push([name, callback]);
    });

    safari.application.addEventListener("message",
        function handleMessage(ev) {
            for (var i = 0; i < handlers.length; ++i) {
                var handler  = handlers[i];
                var pattern  = handler[0];
                var callback = handler[1];

                var name = eraseTime(ev.name);

                var matched = pattern instanceof RegExp ? name.match(pattern) : name === pattern;

                function dispatch(value) {
                    ev.target.page.dispatchMessage(ev.name, value);
                }

                if (matched) {
                    var v = callback(ev, matched, dispatch);
                    if (typeof v !== "undefined") {
                        dispatch(v);
                    }
                    break;
                }
            }
    }, false);
}
