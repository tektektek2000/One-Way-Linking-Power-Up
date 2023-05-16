import * as api from "./api.js"

var Promise = TrelloPowerUp.Promise;

function ToTwoDigit(num) {
    return num < 10 ? `0${num}` : num;
}

function showAuth(t) {
    return t.popup({
        title: 'Authorize to continue',
        url: 'views/authorize.html'
    });
}

TrelloPowerUp.initialize({
    "card-badges": function (t, opts) {
        return t
            .card("all")
            .then(function (card) {
                return {};
            });
    },
    'board-buttons': function (t, opts) {
        return t.getRestApi()
            .isAuthorized()
            .then(function (isAuthorized) {
                return {}
            })
    },
    'card-back-section': function (t, options) {
        return t
            .card("all")
            .then(function (card) {
                return {}
            })
    },
    'card-buttons': function (t, opts) {
        return t
            .card("all")
            .then(function (card) {
                return {}
            })
      }
}, {
    appKey: '2905a45608f989a24bf26e3d92edcf80',
    appName: 'Test'
});