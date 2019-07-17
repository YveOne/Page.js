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

})("Page.hashPlugin", ["Page"], (Page) => {

    function locationHashChanged(hash) {

        let openId = hash.open;
        let closeId = hash.close;
        delete hash["open"];
        delete hash["close"];

        if (openId) {
            Page.open(openId, hash);
        } else if (closeId !== undefined) {
            Page.close(closeId !== "" ? closeId : undefined, hash);
        }
    }

    Page.onHashChanged = locationHashChanged;
    window.onhashchange = () => {

        let hash = location.hash.substr(1)
            .split("&")
            .map(v => v.split("="))
            .reduce( (pre, [key, value]) => ({ ...pre, [key]: value || "" }), {} );

        Page.onHashChanged(hash);
        location.hash = "";
    };

    return {};
});
