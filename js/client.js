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

function refreshCards(t,links,token){
    var context = t.getContext();
    return api.getCardsFromBoard(context.board, api.key, token)
    .then(allCards => {
        var promises = [];
        for(let _card of allCards){
            var promise;
            if(_card.idChecklists){
                var checklistPromises = [];
                for(let checklist of _card.idChecklists){
                    checklistPromises.push(api.getChecklist(checklist,api.key,token))
                }
                promise = Promise.all(checklistPromises).then(values => {
                    _card.checklists = values;
                    Promise.resolve(_card);
                })
            }
            else{
                promise = Promise.resolve(_card);
            }
            promises.push(promise.then(_card => {
                console.log(_card);
                return t.get(_card.id, 'shared', 'link')
                .then(cardLink => {
                    if(cardLink){
                        return api.getCard(cardLink.sourceID,api.key,token)
                        .then(_originalCard => {
                            var promise;
                            if(_originalCard.idChecklists){
                                var checklistPromises = [];
                                for(let checklist of _originalCard.idChecklists){
                                    checklistPromises.push(api.getChecklist(checklist,api.key,token))
                                }
                                promise = Promise.all(checklistPromises).then(values => {
                                    _originalCard.checklists = values;
                                    Promise.resolve(_originalCard);
                                })
                            }
                            else{
                                promise = Promise.resolve(_originalCard);
                            }
                            return promise.then(_originalCard => {
                                return {
                                    card: _card,
                                    link: cardLink,
                                    originalCard: _originalCard
                                }
                            })
                        })
                    }
                    return {
                        card: _card,
                        link: cardLink
                    }
                })
            }))
        }
        return Promise.all(promises).then(values => {
            var linkedCards = []
            for(let it of values){
                if(it.link){
                    if(it.originalCard){
                        linkedCards.push(it);
                    }
                    else{
                        api.deleteCard(it.link.sourceID,api.key,token);
                    }
                }
            }
            console.log(linkedCards);
        })
    })
}

function copyNewCards(t,links,token){
    var context = t.getContext();
    return api.getCardsFromBoard(context.board, api.key, token)
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
        return Promise.all(promises).then(values => {
            var linkedCards = []
            for(let it of values){
                if(it.link){
                    linkedCards.push(it);
                }
            }
            var linkPromises = []
            for(let link of links){
                if(link.type === "list"){
                    linkPromises.push(api.getCardsFromList(link.linkTarget.id,api.key,token).then(cards => {
                        return {
                            link: link,
                            cards: cards
                        }
                    }))
                }
            }
            for(let link of links){
                if(link.type === "board"){
                    linkPromises.push(api.getCardsFromBoard(link.linkTarget,api.key,token).then(cards => {
                        return {
                            link: link,
                            cards: cards
                        }
                    }))
                }
            }
            return Promise.all(linkPromises).then(values => {
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
                        for(let alreadyAdded of cardsToAdd){
                            if(alreadyAdded.card.id === card.id){
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
                    var cardAddPromises = []
                    for(let it of cardsToAdd){
                        cardAddPromises.push(api.copyCard(it.link.targetID,it.card.id,api.key,token).then( card => {
                            sleep(300)
                            .then(() => {
                                if(card.idChecklists){
                                    var checklistPromises = [];
                                    for(let checklist of card.idChecklists){
                                        checklistPromises.push(api.getChecklist(checklist,api.key,token))
                                    }
                                    return Promise.all(checklistPromises).then(values => {
                                        it.card.checklists = values;
                                        return t.set(card.id, 'shared', 'link', {
                                            sourceID: it.card.id,
                                            listCoupled: it.link.type === 'list',
                                            lastAcceptedValue: it.card
                                        })
                                    });
                                }
                                else{
                                    return t.set(card.id, 'shared', 'link', {
                                        sourceID: it.card.id,
                                        listCoupled: it.link.type === 'list',
                                        lastAcceptedValue: it.card
                                    });
                                }
                            })
                        }));
                    }
                    return Promise.all(cardAddPromises)
                }
                return undefined;
            })
        });
    })
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
                            copyNewCards(t,links,token)
                            .then(() => {
                                refreshCards(t,links,token);
                            });
                        }
                    })
                })}, 60000);
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