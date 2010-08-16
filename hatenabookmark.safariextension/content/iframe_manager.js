(function() {
    if (window.top !== window) return;

    safari.self.addEventListener("message", performMessage, false);

    document.body.addEventListener("click", performClick, false);

    var iframe;

    function performMessage(event) {
        switch (event.name) {
        case "insertIframe":
            if (!iframe)
                performInsertIframe(event);
            else
                showIframe(event);
            break;
        default:
            alert("sorry!!!!");
        }
    }

    function performInsertIframe(event) {
        console.log('performInsertIframe');
        iframe = document.createElement('iframe');
        iframe.src = safari.extension.baseURI + event.message;

        with (iframe.style) {
            position = 'fixed';
            right = '0px';
            top = '0px';
            background = 'red';
        }

        document.body.appendChild(iframe);
    }

    function showIframe(event) {
        with(iframe.style) {
            display = 'block';
        }
        iframe.src = safari.extension.baseURI + event.message;
    }

    function performClick(event) {
        if (!iframe) return;
        iframe.style.display = 'none';
    }
})();
