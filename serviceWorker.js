!function(e){var t={};function n(s){if(t[s])return t[s].exports;var a=t[s]={i:s,l:!1,exports:{}};return e[s].call(a.exports,a,a.exports,n),a.l=!0,a.exports}n.m=e,n.c=t,n.d=function(e,t,s){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:s})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var s=Object.create(null);if(n.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var a in e)n.d(s,a,function(t){return e[t]}.bind(null,a));return s},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";n.r(t);new Set(["newMessage","newScheduledMessage","deleteMessages","deleteScheduledMessages","deleteHistory"]),"undefined"!=typeof window&&window.innerHeight;const s=new Map;async function a(e){const{url:t}=e.request,n=e.request.headers.get("range"),a=/^bytes=(\d+)-(\d+)?$/g.exec(n||""),r=Number(a[1]),i=Number(a[2]);let o=i;if((!o||o-r+1>524288)&&(o=r+524288-1),0===r&&1===o){const t=e.request.url.match(/fileSize=(\d+)&mimeType=([\w/]+)/),n=t&&Number(t[1]),s=t&&t[2];if(n&&s)return new Response(new Uint8Array(2).buffer,{status:206,statusText:"Partial Content",headers:[["Content-Range","bytes 0-1/"+n],["Accept-Ranges","bytes"],["Content-Length","2"],["Content-Type",s]]})}const c=`${t}?start=${r}&end=${o}`,[u,d]=await async function(e){const t=await self.caches.open("tt-media-progressive");return Promise.all([t.match(e+"&type=arrayBuffer").then(e=>e?e.arrayBuffer():void 0),t.match(e+"&type=headers").then(e=>e?e.json():void 0)])}(c);if(u)return new Response(u,{status:206,statusText:"Partial Content",headers:d});let l;try{l=await async function(e,t){if(!e.clientId)return;const n=await self.clients.get(e.clientId);if(!n)return;const a=(e=>{let t;do{t=String(Math.random()).replace("0.","id")}while(e.hasOwnProperty(t));return t})(s),r={},i=Promise.race([(o=3e4,new Promise(e=>{setTimeout(()=>e(),o)})).then(()=>Promise.reject(new Error("ERROR_PART_TIMEOUT"))),new Promise((e,t)=>{Object.assign(r,{resolve:e,reject:t})})]);var o;return s.set(a,r),i.catch(()=>{}).finally(()=>{s.delete(a)}),n.postMessage({type:"requestPart",messageId:a,params:t}),i}(e,{url:t,start:r,end:o})}catch(e){0}if(!l)return new Response("",{status:500,statusText:"Failed to fetch progressive part"});const{arrayBuffer:f,fullSize:p,mimeType:g}=l,m=Math.min(o-r+1,f.byteLength);o=r+m-1;const y=f.slice(0,m),h=[["Content-Range",`bytes ${r}-${o}/${p}`],["Accept-Ranges","bytes"],["Content-Length",String(m)],["Content-Type",g]];return m<=524288&&o<2097151&&async function(e,t,n){const s=await self.caches.open("tt-media-progressive");Promise.all([s.put(new Request(e+"&type=arrayBuffer"),new Response(t)),s.put(new Request(e+"&type=headers"),new Response(JSON.stringify(n)))])}(c,y,h),new Response(y,{status:206,statusText:"Partial Content",headers:h})}var r;self.addEventListener("message",e=>{const{type:t,messageId:n,result:a}=e.data;if("partResponse"===t){const e=s.get(n);e&&e.resolve(a)}}),function(e){e.True="1",e.False="0"}(r||(r={}));const i={},o=new Set;function c(e){return e.custom.from_id?parseInt(e.custom.from_id,10):e.custom.chat_id?-1*parseInt(e.custom.chat_id,10):e.custom.channel_id?-1*parseInt(e.custom.channel_id,10):void 0}function u(e){if(e.custom.msg_id)return parseInt(e.custom.msg_id,10)}function d({chatId:e,messageId:t,body:n,title:s}){return self.registration.showNotification(s,{body:n,data:{chatId:e,messageId:t},icon:"icon-192x192.png",badge:"icon-192x192.png",vibrate:[200,100,200]})}const l=/[0-9a-f]{20}.*\.(js|css|woff2?|svg|png|jpg|json|wasm)$/;self.addEventListener("install",e=>{e.waitUntil(self.skipWaiting())}),self.addEventListener("activate",e=>{e.waitUntil(self.caches.delete("tt-assets")),e.waitUntil(self.clients.claim())}),self.addEventListener("fetch",e=>{e.respondWith((()=>{const{url:t}=e.request;return t.includes("/progressive/")?a(e):t.startsWith("http")&&t.match(l)?async function(e){const t=await self.caches.open("tt-assets"),n=await t.match(e.request);if(n)return n;const s=await fetch(e.request);return t.put(e.request,s.clone()),s}(e):fetch(e.request)})())}),self.addEventListener("push",(function(e){const t=function(e){try{return e.data.json()}catch(e){return void 0}}(e);if(!t||t.mute===r.True)return;const n=function(e){return{chatId:c(e),messageId:u(e),title:e.title||"Telegram WebZ alpha 6bee402",body:e.description}}(t);o.has(n.messageId)?o.delete(n.messageId):e.waitUntil(d(n))})),self.addEventListener("notificationclick",(function(e){e.notification.close();const{data:t}=e.notification;e.waitUntil((async()=>{const e=(await self.clients.matchAll({type:"window"})).filter(e=>e.url===self.registration.scope);if(await Promise.all(e.map(async e=>{await e.focus(),i[e.id]=t})),!self.clients.openWindow||e.length>0)return;const n=await self.clients.openWindow("https://webz.telegram.org/");n&&(i[n.id]=t)})())})),self.addEventListener("message",(function(e){if(!e.data)return;const t=e.source;if("clientReady"===e.data.type&&i[t.id]&&(!function(e,t){const{chatId:n,messageId:s}=t;n&&e.postMessage({type:"focusMessage",payload:{chatId:n,messageId:s}})}(t,i[t.id]),delete i[t.id]),"newMessageNotification"===e.data.type){const t=e.data.payload;e.waitUntil(d(t)),o.add(t.messageId)}}))}]);
//# sourceMappingURL=serviceWorker.js.map