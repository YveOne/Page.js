/*
 *  Page.loaderPlugin.js v1.1
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

})("Page.loaderPlugin", ["Page"], (Page) => {

    let plugin = {};

    function loadFile(target, tagName, attr) {
        return new Promise((resolve, reject) => {
            let el = document.createElement(tagName);
            Object.keys(attr).forEach((k) => {
                el.setAttribute(k, attr[k]);
            });
            el.onload = () => {
                resolve(el);
            };
            el.onerror = () => {
                target.removeChild(el);
                reject();
            };
            target.appendChild(el);
        });
    }

    function loadPagesJS(path, ids) {
        path = path.replace(/\/+$/g, '');
        return new Promise((resolve, reject) => {
            Promise.all(ids.map((id) => {
                return new Promise((resolve, reject) => {
                    loadFile(document.head, "script", {
                        "type": "text/javascript",
                        "src": `${path}/${id}.js`
                    }).then(resolve).catch(reject);
                });
            })).then(resolve).catch(reject);
        });
    }

    function loadPagesCSS(path, ids) {
        path = path.replace(/\/+$/g, '');
        return new Promise((resolve, reject) => {
            Promise.all(ids.map((id) => {
                return new Promise((resolve, reject) => {
                    loadFile(document.head, "link", {
                        "rel": "stylesheet",
                        "type": "text/css",
                        "href": `${path}/${id}.js`
                    }).then(resolve).catch(reject);
                });
            })).then(resolve).catch(reject);
        });
    }

    plugin.loadJS = loadPagesJS;
    plugin.loadCSS = loadPagesCSS;

    Page.loaderPlugin = plugin;
    return plugin;
});
