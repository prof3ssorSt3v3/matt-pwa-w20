// code that is used on multiple pages goes here

const app = {
  baseURL: 'the base url of your website',
  isOnline: 'onLine' in navigator && navigator.onLine,
  SW: null,
  KEY: 'come up with a unique key for localStorage',
  deferredPrompt: null,
  init: function () {
    //starts everything
    //registers service worker
    //calls the functions in the other scripts
    if (typeof search != 'undefined') {
      search.init(); //run search specific set up code
    }
    if (typeof favs != 'undefined') {
      favs.init(); //run favs specific set up code
    }
    if (typeof results != 'undefined') {
      results.init(); //run results specific set up code
    }
    //check for online / offline
    window.addEventListener('online', function online() {
      app.isOnline = true;
      document.body.classList.remove('offline');
      app.sendMessage({ isOnline: app.isOnline }); //tell the service worker about the change
    });
    window.addEventListener('offline', function offline() {
      app.isOnline = false;
      document.body.classList.add('offline');
      app.sendMessage({ isOnline: app.isOnline }); //tell the service worker about the change
    });
    //deferred install
    window.addEventListener('beforeinstallprompt', (ev) => {
      // Prevent the mini-infobar from appearing on mobile
      ev.preventDefault();
      // Stash the event so it can be triggered later.
      app.deferredPrompt = ev;
      // Update UI notify the user they can install the PWA
      // if you want here...
    });
    window.addEventListener('appinstalled', (evt) => {
      console.log('app was installed');
    });
    //register the service worker
    if ('serviceWorker' in navigator) {
      app.setUpServiceWorker().catch(console.error);
    }
  },
  setUpServiceWorker: async function () {
    let swRegistration = await navigator.serviceWorker.register('/sw.js', {
      updateViaCache: 'none',
      scope: '/',
    });
    app.SW =
      swRegistration.installing ||
      swRegistration.waiting ||
      swRegistration.active;

    app.sendMessage({
      baseURL: app.baseURL,
      isOnline: app.isOnline,
    });
    //listen for messages from the service worker
    navigator.serviceWorker.addEventListener('message', app.onMessage, false);
  },
  onMessage: function () {},
  installPrompt: function () {
    //this will only happen once per page load
    app.deferredPrompt.prompt();
    app.deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    });
  },
};

document.addEventListener('DOMContentLoaded', app.init);
