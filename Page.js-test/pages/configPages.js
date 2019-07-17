"use strict";

new Page(["configPage123", "configPage456", "configPage789"], (id) => {

    let html = `
        <div class="header"><span class="left">Page: ${id}</span> <a href="#close" class="right"><span>X</span></a></div>
        <div class="content">

        </div>
        <div class="footer">FOOTER</div>
    `;

    return {

        "id": id,
        "html": html,

        "addToHistory": false,
        "clearHistory": false,

        "beforeLoad": () => {
            return Promise.resolve(true);
        },
        "afterLoad": () => {
            return Promise.resolve(true);
        },
        "beforeUnload": () => {
            return Promise.resolve(true);
        },
        "afterUnload": () => {
            return Promise.resolve(true);
        }
    };
});
