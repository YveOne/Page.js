/*
 *  Page.js v1.0
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

})("Page", [], () => {

    let list = {};
    let running = false;
    let current = false;
    let closing = false;
    let history = [];

    let preHooks = {
        "open": [],
        "close": []
    };

    let postHooks = {
        "open": [],
        "close": []
    };

    function callHooks(hooks, args) {
        return new Promise((resolve, reject) => {
            Promise.all(hooks.map((hook) => {
                return hook.apply(null, args);
            })).then(resolve).catch(reject);
        });
    }

    function addHook(hooks, func, type) {
        if (type !== undefined) {
            hooks[type].push(func);
        } else {
            hooks["open"].push(func);
            hooks["close"].push(func);
        }
    }

    function addPreHook(func, type) {
        addHook(preHooks, func, type);
    }

    function addPostHook(func, type) {
        addHook(postHooks, func, type);
    }

    function pageExist(id) {
        return list[id] !== undefined;
    }

    function closePage(id, data) {
        return new Promise((resolve, reject) => {

            if (closing) {
                return resolve(false);
            }

            if (id === undefined || id === null) {
                if (history.length >= 1) {
                    id = history.pop();
                } else {
                    return resolve(false);
                }
            }

            closing = true;

            openPage(id, data)
            .then((opened) => {
                if (!opened) {
                    history.push(id);
                }
                resolve(opened);
            })
            .catch(reject)
            .finally(() => {
                closing = false;
            });
        });
    }

    function openPage(id, data) {
        return new Promise((resolve, reject) => {

            if (running) {
                return resolve(false);
            }

            if (!pageExist(id)) {
                return reject(new Error(`Page ${id} doesn't exist.`));
            }

            if (current && current.id === id) {
                return reject(new Error(`Page ${id} already opened.`));
            }

            let nextData = false;

            let next;
            let nextNode;
            let nextOpts;

            let last = false;;
            let lastNode = false;
            let lastOpts = false;

            let beforeUnload;
            let beforeLoad;
            let afterUnload;
            let afterLoad;

            let type = closing ? "close" : "open";
            let direction = current ? (closing ? "backward" : "forward") : "first";
            let spawn = document.querySelector(Page.spawnSelector);

            let hookArgs;

            if (!spawn) {
                return reject(new Error(`Incorrect pages spawn selector: ${Page.spawnSelector}`));
            }

            Page.openCondition(id, current ? current.id : undefined)
            .then((doOpen) => {
                if (!doOpen) {
                    return false;
                }
                return new Promise((resolve, reject) => {

                    running = true;
                    try{
                        nextData = list[id](id, data);
                    }catch(e){
                        running = false;
                        return reject(new Error(`Error in Page ${id} constructor`));
                    }

                    next = {
                        "id": nextData.id,
                        "opts": {
                            "addToHistory": nextData.addToHistory,
                            "clearHistory": nextData.clearHistory,
                            "beforeLoad": nextData.beforeLoad,
                            "afterLoad": nextData.afterLoad,
                            "beforeUnload": nextData.beforeUnload,
                            "afterUnload": nextData.afterUnload,
                        },
                        "node": document.createElement("div")
                    };
                    nextNode = next.node;
                    nextOpts = next.opts;

                    if (current) {
                        last = current;
                        lastNode = last.node;
                        lastOpts = last.opts;
                    }

                    hookArgs = [
                        type,
                        direction,
                        next.id,
                        last ? last.id : undefined
                    ];

                    nextNode.innerHTML = nextData.html;
                    nextNode.setAttribute("id", next.id);

                    if (nextOpts.clearHistory) {
                        history = [];
                    }

                    if (nextOpts.addToHistory) {
                        history.push(next.id);
                    }

                    if (lastNode) {
                        lastNode.classList.add("closing", direction);
                        lastNode.classList.remove("opened");
                    }

                    beforeUnload =  last ?  lastOpts.beforeUnload : () => { return Promise.resolve(true) };
                    beforeLoad =            nextOpts.beforeLoad;
                    afterUnload =   last ?  lastOpts.afterUnload : () => { return Promise.resolve(true) };
                    afterLoad =             nextOpts.afterLoad;

                    nextNode.classList.add("page", "opening", direction);
                    spawn.appendChild(nextNode);
                    resolve();
                });
            })
            .then(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(resolve, Page.spawnDelay);
                });
            })
            .then(() => {
                return beforeUnload();
            })
            .then(() => {
                return beforeLoad();
            })
            .then(() => {
                return callHooks(preHooks[type], hookArgs);
            })
            .then(() => {
                return new Promise((resolve, reject) => {
                    if (lastNode) {
                        lastNode.classList.add("closed");
                        lastNode.classList.remove("closing");
                    }
                    nextNode.classList.add("opened");
                    nextNode.classList.remove("opening");
                    setTimeout(resolve, Page.spawnTime);
                });
            })
            .then(() => {
                return callHooks(postHooks[type], hookArgs);
            })
            .then(() => {
                return afterUnload();
            })
            .then(() => {
                return afterLoad();
            })
            .then(() => {
                nextNode.classList.remove(direction);
                if (lastNode) spawn.removeChild(lastNode);
                current = next;
            })
            .then(resolve)
            .catch(reject)
            .finally(() => {
                running = false;
            });
        });
    }

    function Page(ids, constructor) {
        let p = this;
        (Array.isArray(ids) ? ids : [ids]).forEach((id) => {
            list[id] = constructor.bind(p);
        });
    }

    function createPage(...args) {
        new (Function.prototype.bind.apply(Page, args));
    }

    Page.spawnSelector = "#pages";
    Page.spawnTime = 500;
    Page.spawnDelay = 30;
    Page.openCondition = (openId, curId) => {
        return new Promise((resolve, reject) => {
            resolve();
        });
    };

    Page.exists = pageExist;
    Page.create = createPage;
    Page.close = closePage;
    Page.open = openPage;
    Page.preHook = addPreHook;
    Page.postHook = addPostHook;

    return Page;
});
