import * as api from "./api.js"
import * as cardSyncing from "./card-syncing.js"

var Promise = TrelloPowerUp.Promise;
var interval;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

function showEditLinkMenu(t) {
    return t.modal({
        title: 'Edit Links',
        url: t.signUrl('views/edit-link.html'),
        fullscreen: false
    });
}

TrelloPowerUp.initialize({
    "card-badges": function (t, opts) {
        return t
            .card("all")
            .then(function (card) {
                return t.get('card', 'shared', 'link')
                .then(link =>{
                    if(link){
                        return t
                        .getRestApi()
                        .getToken()
                        .then(token => {
                            return api
                            .getCard(link.sourceID,api.key,token)
                            .then(card => {
                                return api
                                .getBoard(card.idBoard,api.key,token)
                                .then(board => {
                                    return [
                                        {
                                            text: `Link from: ${board.name}`,
                                            color: "light-gray"
                                        }
                                    ];
                                })
                            })
                        })
                    }
                    else{
                        return {};
                    }
                });
            });
    },
    'board-buttons': function (t, opts) {
        if(!interval){
            interval = setInterval(function(){
                t.getRestApi()
                .getToken()
                .then(token => {
                    if (!token) {
                        console.log("No token")
                    }
                    t.get('board', 'shared', 'link')
                    .then(links =>{
                        if(links && links.length > 0){
                            cardSyncing.copyNewCards(t,links,token)
                            .then(() => {
                                cardSyncing.refreshCards(t,links,token);
                            });
                        }
                    })
                })}, 30000);
            t.getRestApi()
            .getToken()
            .then(token => {
                if (!token) {
                    console.log("No token")
                }
                t.get('board', 'shared', 'link')
                .then(links =>{
                    if(links && links.length > 0){
                        cardSyncing.copyNewCards(t,links,token)
                        .then(() => {
                            cardSyncing.refreshCards(t,links,token);
                        });
                    }
                })
            })
        }
        return t.getRestApi()
            .isAuthorized()
            .then(function (isAuthorized) {
                if (isAuthorized) {
                    var ret = [{
                        text: 'New Link',
                        condition: "edit",
                        callback: showNewLinkMenu
                    }]
                    return t.get('board', 'shared', 'link')
                    .then(links =>{
                        if(links && links.length > 0){
                            ret.push({
                                text: 'Edit Links',
                                condition: "edit",
                                callback: showEditLinkMenu
                            })
                        }
                        return ret;
                    });
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
    appKey: 'e3ca454861c7c91659b30789e0f2c3d8',
    appName: 'Test'
});