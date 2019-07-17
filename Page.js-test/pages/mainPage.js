"use strict";

new Page(["mainPage"], (id) => {

    let html = `
        <div class="header"><span class="left">Main page</span></div>
        <div class="content">
            <a href="#open=anotherPage"><span>open another page</span></a>
            <a href="#open=configPage123"><span>configPage123</span></a>
            <a href="#open=configPage456"><span>configPage456</span></a>
            <a href="#open=configPage789"><span>configPage789</span></a>
        </div>
        <div class="footer">FOOTER</div>
    `;

    

    return {

        "id": id,
        "html": html,

        "addToHistory": true,
        "clearHistory": true,

        "beforeLoad": () => {
            return Promise.resolve(true);
        },
        "afterLoad": (cb) => {
            return Promise.resolve(true);
        },
        "beforeUnload": (cb) => {
            return Promise.resolve(true);
        },
        "afterUnload": (cb) => {
            return Promise.resolve(true);
        }
    };
});
