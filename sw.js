'use strict';
let staticName = `static-cache-1`;
let dynamicName = 'dynamic-cache-1';
let listOfStaticFiles = [];
let isOnline = true;
let baseURL = null;

//listen for SW events
self.addEventListener('install', onInstall); // installing the service worker
self.addEventListener('activate', onActivate); // activating the service worker after install
self.addEventListener('message', onMessage); //isOnline, isLoggedIn
self.addEventListener('fetch', onFetch); //request from webpage

function onInstall(ev) {
  ev.waitUntil(
    caches.open(staticName).then((cache) => {
      console.log('saving all the static files');
      cache.addAll(listOfStaticFiles);
    })
  );
}
function onActive(ev) {
  ev.waitUntil(
    caches.keys().then((keys) => {
      //console.log(keys);
      return Promise.all(
        keys
          .filter((key) => key !== staticName && key !== dynamicName)
          .map((key) => caches.delete(key))
      );
    })
}

function onMessage({ data }) {
  //received a message from the webpage
  if ('baseURL' in data) {
    baseURL = data.baseURL;
  }
  if ('isOnline' in data) {
    isOnline = data.isOnline;
  }
}

function onFetch(ev) {
  //handle all http requests coming from the webpage
  console.log(`Webpage asked for ${ev.request.url}`);
}
