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

function showNewLinkMenu(t) {
    return t.modal({
        title: 'New Link',
        url: t.signUrl('views/new-link.html'),
        fullscreen: false
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
                if (isAuthorized) {
                    return [{
                        text: 'New Link',
                        condition: "edit",
                        callback: showNewLinkMenu
                    }];
                } else {
                    return [{
                        text: 'Authorize',
                        condition: "edit",
                        callback: showAuth
                    }];
                }
            })
    },
    'card-back-section': function (t, options) {
        return t
            .card("all")
            .then(function (card) {
                return t.get(card.id, 'shared', 'link')
                    .then(cardRole => {
                        return {
                            title: 'Link',
                            icon: t.signUrl(TrelloPowerUp.util.relativeUrl("./icons/summary.png")),
                            content: {
                                type: 'iframe',
                                url: t.signUrl(TrelloPowerUp.util.relativeUrl('./views/edit-link.html')),
                                height: 200,
                            },
                            action: {
                                text: 'Remove Link',
                                callback: (t) => {t.remove('card', 'shared', 'link');},
                            }
                        }
                    })
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
    appKey: '6f2af19073479657e48933387208eecd',
    appName: 'Test'
});