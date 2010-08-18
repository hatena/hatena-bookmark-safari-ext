var Extension = {
    get id () {
        if (!this._id) {
            var uri = safari.extension.baseURI;
            var id  = uri.match("safari-extension://\(jp.ne.hatena.b-[a-zA-Z0-9]+\)/")[1];
            this._id = id;
        }

        return this._id;
    },

    getIdentifier: function (name) {
        return this.id + " " + name;
    }
};
