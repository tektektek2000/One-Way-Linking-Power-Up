import * as api from "./api.js"

var t = window.TrelloPowerUp.iframe({
    appKey: api.key,
    appName: 'Test'
});
t.render(function() {
document.querySelector('button').addEventListener('click', function() {
    t.getRestApi()
    .authorize({ scope: 'read,write,account' })
    .then(function(t) {
        alert('Success!');
    });
}, false);
});