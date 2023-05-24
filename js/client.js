import * as api from "./api.js"

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


function updateCycle(t,links,token){
    var context = t.getContext();
    api.getCardsFromBoard(context.board, api.key, token)
    .then(allCards => {
        var promises = [];
        for(let _card of allCards){
            promises.push(t.get(_card.id, 'shared', 'link')
            .then(cardLink => {
                return {
                    card: _card,
                    link: cardLink
                };
            }));
        }
        Promise.all(promises).then(values => {
            var linkedCards = []
            for(let it of values){
                if(it.link){
                    linkedCards.push(it);
                }
            }
            console.log(linkedCards);
            var linkPromises = []
            for(let link of links){
                //TODO implement board as well
                if(link.type === "list"){
                    linkPromises.push(api.getCardsFromList(link.linkTarget.id,api.key,token).then(cards => {
                        return {
                            link: link,
                            cards: cards
                        }
                    }))
                }
            }
            Promise.all(linkPromises).then(values => {
                var cardsToAdd = [];
                for(let it of values){
                    for(let card of it.cards){
                        let shouldAdd = false;
                        if(it.link.condtype === "none"){
                            shouldAdd = true;
                        }
                        else if(it.link.condtype === "member"){
                            for(let member of card.idMembers){
                                if(member === it.link.condTarget.id){
                                    shouldAdd = true;
                                }
                            }
                        }
                        else if(it.link.condtype === "label"){
                            for(let label of card.labels){
                                if(label.id === it.link.condTarget.id){
                                    shouldAdd = true;
                                }
                            }
                        }
                        for(let linkedCard of linkedCards){
                            if(linkedCard.link.sourceID === card.id){
                                shouldAdd = false;
                            }
                        }
                        if(shouldAdd){
                            cardsToAdd.push({
                                card: card,
                                link: it.link
                            });
                        }
                    }
                }
                if(cardsToAdd.length > 0){
                    for(let it of cardsToAdd){
                        api.copyCard(it.link.targetID,it.card.id,api.key,token).then( card => {
                            sleep(200)
                            .then(() => {
                                t.set(card.id, 'shared', 'link', {
                                    sourceID: it.card.id
                                })
                            })
                        });
                    }
                }
            })
        });
    })
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
                            updateCycle(t,links,token);
                        }
                    })
                })}, 30000);
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
    appKey: '6f2af19073479657e48933387208eecd',
    appName: 'Test'
});