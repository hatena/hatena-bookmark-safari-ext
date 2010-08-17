/**
 * Connect.js - Wraps Safari's dispatchMessage and addEventListener.
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
 * }); * safari.application.addEventListener("message", handleMessage, false);
 *
 */

function Connect(page) {
    if (!(this instanceof Connect))
        return new Connect();

    this.page  = page || safari.self;
    this.queue = [];
}

Connect.prototype = {
    send: function (name, value) {
        this.queue.push({ name : name, value : value });
        return this;
    },

    recv: function (f) {
        this.queue.push(f);
        return this;
    },

    error: function (f) {
        this.queue.push(f);
        return this;
    },

    close: function () {
        this._consume();
    },

    _consume: function () {
        var that  = this;
        var queue = this.queue;

        while (queue.length) {
            var message = queue.shift();

            switch (typeof message) {
            case "object":
                var f = queue.shift();

                if (typeof queue[0] === "function")
                    var error = queue.shift();

                that.page.addEventListener("message", function (ev) {
                    if (ev.name !== message.name)
                        return;

                    that.page.removeEventListener(message.name, arguments.callee, false);

                    try {
                        f(ev);
                    } catch (e) {
                        if (error)
                            return error(e);
                        else
                            throw e;
                    }

                    that._consume();
                }, false);

                that.page.tab.dispatchMessage(message.name, message.value);

                return;
            }
        }
    }
};
