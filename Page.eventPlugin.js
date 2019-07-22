/*
 *  Page.hashPlugin.js v1.0
 *  Author: Yvonne P. (yveone.com)
 *  License: MIT
**/
"use strict";

((name, deps, factory) => {

    // AMD
    if (typeof define !== "undefined" && define.amd){
        define(deps, factory);

    // Node.js
    } else if (typeof module !== "undefined" && module.exports) {
        module.exports = factory.apply(deps.map(require));

    // Browser
    } else {
        let d, i = 0, global = this, old = global[name], mod;
        while(d = deps[i]){
            deps[i++] = this[d];
        }
        global[name] = mod = factory.apply(null, deps);
        mod.noConflict = () => {
            global[name] = old;
            return mod;
        };
    }

})("Page.eventPlugin", ["Page"], (Page) => {

    let plugin = {};

    plugin.onOpen = (id, data) => {
        Page.open(id, data);
    };

    plugin.onClose = (id, data) => {
        Page.close(id, data);
    };

    document.addEventListener("click", (event) => {
        let openEl = event.target.closest("[data-open]");
        let closeEl = event.target.closest("[data-close]");
        if (openEl) {
            plugin.onOpen(openEl.getAttribute("data-open") || undefined);
        } else if (closeEl) {
            plugin.onClose(closeEl.getAttribute("data-close") || undefined);
        }
    });

    Page.eventPlugin = plugin;
    return plugin;
});
