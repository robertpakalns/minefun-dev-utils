// ==UserScript==
// @name         MineFun.io Development Utility Relay
// @namespace    http://tampermonkey.net/
// @version      0.1.0-alpha.1
// @description  Relay custom WebSocket messages to MineFun.io from a local server
// @author       robertpakalns
// @license      MIT
// @match        https://*.minefun.io/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  let minefunWs = null;

  const _WebSocket = window.WebSocket;

  window.WebSocket = new Proxy(_WebSocket, {
    construct(target, args) {
      const ws = new target(...args);
      const url = String(args[0] || "");

      if (url.includes("minefun.io") && url.includes("Custom_")) {
        minefunWs = ws;

        const _send = ws.send;
        ws.send = function (data) {
          return _send.call(this, data);
        };
      }

      return ws;
    },
  });

  // Connect to local relay server
  const relayWS = new _WebSocket("ws://localhost:3000");
  relayWS.binaryType = "arraybuffer";

  relayWS.addEventListener("open", () => {
    console.log("[Relay WS] Local server connected");
  });

  relayWS.addEventListener("message", (event) => {
    if (!(event.data instanceof ArrayBuffer)) {
      console.error("[Relay WS] Unsupported message type");
      return;
    }

    const data = new Uint8Array(event.data);

    if (minefunWs && minefunWs.readyState === _WebSocket.OPEN) {
      minefunWs.send(data);
    }
  });

  relayWS.addEventListener("close", () => {
    console.log("[Relay WS] Local server disconnected");
  });

  relayWS.addEventListener("error", (err) => {
    console.error("[Relay WS] Error:", err);
  });
})();
