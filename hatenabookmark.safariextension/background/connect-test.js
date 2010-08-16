safari.application.addEventListener("message", handleMessage, false);

function handleMessage(event) {
    var tab  = safari.application.activeBrowserWindow.activeTab;
    var page = tab.page;

    alert("handle message => " + event.name);

    switch (event.name) {
    case "message1":
        page.dispatchMessage(event.name, event.message);
        break;
    case "message2":
        page.dispatchMessage(event.name, event.message);
    default:
    }
}
