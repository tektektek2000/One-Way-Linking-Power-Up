import * as api from "./api.js"

var Promise = TrelloPowerUp.Promise;

function saveChangesToCard(changed, newState, token){
    api.updateCard(changed.id, newState.name, newState.desc, changed.idList, newState.closed, newState.idMembers, newState.idAttachmentCover, newState.due
        ,newState.start, newState.dueComplete, newState.address, newState.locationName, newState.coordinates, newState.cover, api.key, token)
        .then(card => {
            //Checklists syncing
            var promises = [];
            while(changed.checklists.length + promises.length < newState.checklists.length){
                promises.push(api.addCheckListToCard(card.id,newState.checklists[changed.checklists.length + promises.length].name
                    ,newState.checklists[changed.checklists.length + promises.length].pos,api.key, token))
            }
            while(changed.checklists.length - promises.length > newState.checklists.length){
                promises.push(api.deleteCheckListFromCard(card.id,changed.checklists[changed.checklists.length - promises.length - 1].id
                    ,api.key, token))
            }
            for(var i in changed.checklists){
                if(i < newState.checklists.length){
                    promises.push(api.updateCheckList(changed.checklists[i].id, newState.checklists[i].name, newState.checklists[i].pos, api.key, token));
                }
            }
            Promise.all(promises).then(() => {
                api.sleep(500).then(() => {
                    api.getChecklistsOnCard(card.id, api.key, token)
                    .then(checklists => {
                        for(var i in checklists){
                            var promises = []
                            while(checklists[i].checkItems.length + promises.length < newState.checklists[i].checkItems.length){
                                promises.push(api.addCheckItem(checklists[i].id,newState.checklists[i].checkItems[checklists[i].checkItems.length + promises.length].name
                                    ,newState.checklists[i].checkItems[checklists[i].checkItems.length + promises.length].state === "complete",api.key, token))
                            }
                            while(checklists[i].checkItems.length - promises.length > newState.checklists[i].checkItems.length){
                                promises.push(api.deleteCheckItem(checklists[i].id,checklists[i].checkItems[checklists[i].checkItems.length - promises.length -1].id
                                    ,api.key, token))
                            }
                            for(var j in checklists[i].checkItems){
                                if(j < newState.checklists[i].checkItems.length){
                                    promises.push(api.updateCheckItem(card.id,checklists[i].id,checklists[i].checkItems[j].id
                                        , newState.checklists[i].checkItems[j].name, newState.checklists[i].checkItems[j].pos
                                        , newState.checklists[i].checkItems[j].state, api.key, token));
                                }
                            }
                        }
                    })
                })
            })
        })
    //TODO Implement checklist, labels syncing
}

function modifyWithNewActions(modified, modifyWith, lastAcceptedValue){
    var stateChanged = false;
    var checklistStateChanged = false;
    var newAcceptedValue = JSON.parse(JSON.stringify(modified));
    if(lastAcceptedValue.name !== modifyWith.name){newAcceptedValue.name = modifyWith.name; stateChanged = true;}
    if(lastAcceptedValue.desc !== modifyWith.desc){newAcceptedValue.desc = modifyWith.desc; stateChanged = true;}
    if(lastAcceptedValue.closed !== modifyWith.closed){newAcceptedValue.closed = modifyWith.closed; stateChanged = true;}
    if(modifyWith.checklists){
        //Checking if member was added
        for(let member of modifyWith.idMembers){
            if(!lastAcceptedValue.idMembers.includes(member)){
                stateChanged = true;
            }
            if(!lastAcceptedValue.idMembers.includes(member) && !newAcceptedValue.idMembers.includes(member)){
                newAcceptedValue.idMembers.push(member);
            }
        }
        //Checking if member was removed
        for(let member of lastAcceptedValue.idMembers){
            if(!modifyWith.idMembers.includes(member)){
                stateChanged = true;
            }
            if(!modifyWith.idMembers.includes(member) && newAcceptedValue.idMembers.includes(member)){
                newAcceptedValue.idMembers.splice(newAcceptedValue.idMembers.indexOf(member),1);
            }
        }
        //Checking if checklist was added
        while(lastAcceptedValue.checklists.length < modifyWith.checklists.length && newAcceptedValue.checklists.length < modifyWith.checklists.length){
            newAcceptedValue.checklists.push(JSON.parse(JSON.stringify(modifyWith.checklists[modifyWith.checklists.length-1])));
            checklistStateChanged = true;
        }
        //Checking if checklist was removed
        while(lastAcceptedValue.checklists.length > modifyWith.checklists.length && newAcceptedValue.checklists.length > modifyWith.checklists.length){
            newAcceptedValue.checklists.splice(newAcceptedValue.checklists.length-1,1);
            checklistStateChanged = true;
        }
        if(newAcceptedValue.checklists.length === modifyWith.checklists.length){
            for(var i in newAcceptedValue.checklists){
                var examine = newAcceptedValue;
                if(i < lastAcceptedValue.checklists.length){examine = lastAcceptedValue;}
                if(examine.checklists[i].name !== modifyWith.checklists[i].name){newAcceptedValue.checklists[i].name = modifyWith.checklists[i].name; checklistStateChanged = true;}
                if(examine.checklists[i].pos !== modifyWith.checklists[i].pos){newAcceptedValue.checklists[i].pos = modifyWith.checklists[i].pos; checklistStateChanged = true;}
                //Checking if checklist was added
                while(examine.checklists[i].checkItems.length < modifyWith.checklists[i].checkItems.length && newAcceptedValue.checklists[i].checkItems.length < modifyWith.checklists[i].checkItems.length){
                    newAcceptedValue.checklists[i].checkItems.push(JSON.parse(JSON.stringify(modifyWith.checklists[i].checkItems[modifyWith.checklists[i].checkItems.length-1])));
                    checklistStateChanged = true;
                }
                //Checking if checklist was removed
                while(examine.checklists[i].checkItems.length > modifyWith.checklists[i].checkItems.length && newAcceptedValue.checklists[i].checkItems.length > modifyWith.checklists[i].checkItems.length){
                    newAcceptedValue.checklists[i].checkItems.splice(newAcceptedValue.checklists[i].checkItems.length-1,1);
                    checklistStateChanged = true;
                }
                if(modifyWith.checklists[i].checkItems && newAcceptedValue.checklists[i].checkItems.length === modifyWith.checklists[i].checkItems.length){
                    for(var j in newAcceptedValue.checklists[i].checkItems){
                        var examine = newAcceptedValue;
                        if(lastAcceptedValue.checklists[i] && lastAcceptedValue.checklists[i].checkItems && j < lastAcceptedValue.checklists[i].checkItems.length){examine = lastAcceptedValue;}
                        if(examine.checklists[i].checkItems[j].name !== modifyWith.checklists[i].checkItems[j].name){
                            newAcceptedValue.checklists[i].checkItems[j].name = modifyWith.checklists[i].checkItems[j].name; checklistStateChanged = true;
                        }
                        if(examine.checklists[i].checkItems[j].state !== modifyWith.checklists[i].checkItems[j].state){
                            newAcceptedValue.checklists[i].checkItems[j].state = modifyWith.checklists[i].checkItems[j].state; checklistStateChanged = true;
                        }
                        if(examine.checklists[i].checkItems[j].pos !== modifyWith.checklists[i].checkItems[j].pos){
                            newAcceptedValue.checklists[i].checkItems[j].pos = modifyWith.checklists[i].checkItems[j].pos; checklistStateChanged = true;
                        }
                    }
                }
            }
        }
    }
    if(lastAcceptedValue.idAttachmentCover !== modifyWith.idAttachmentCover){newAcceptedValue.idAttachmentCover = modifyWith.idAttachmentCover; stateChanged = true;}
    if(lastAcceptedValue.due !== modifyWith.due){newAcceptedValue.due = modifyWith.due; stateChanged = true;}
    if(lastAcceptedValue.start !== modifyWith.start){newAcceptedValue.start = modifyWith.start; stateChanged = true;}
    if(lastAcceptedValue.dueComplete !== modifyWith.dueComplete){newAcceptedValue.dueComplete = modifyWith.dueComplete; stateChanged = true;}
    if(lastAcceptedValue.address !== modifyWith.address){newAcceptedValue.address = modifyWith.address; stateChanged = true;}
    if(lastAcceptedValue.locationName !== modifyWith.locationName){newAcceptedValue.locationName = modifyWith.locationName; stateChanged = true;}
    if(lastAcceptedValue.coordinates !== modifyWith.coordinates){newAcceptedValue.coordinates = modifyWith.coordinates; stateChanged = true;}
    if(lastAcceptedValue.cover.color !== modifyWith.cover.color){newAcceptedValue.cover.color = modifyWith.cover.color; stateChanged = true;}
    if(lastAcceptedValue.cover.brightness !== modifyWith.cover.brightness){newAcceptedValue.cover.brightness = modifyWith.cover.brightness; stateChanged = true;}
    if(lastAcceptedValue.cover.url !== modifyWith.cover.url){newAcceptedValue.cover.url = modifyWith.cover.url; stateChanged = true;}
    if(lastAcceptedValue.cover.idAttachment !== modifyWith.cover.idAttachment){newAcceptedValue.cover.idAttachment = modifyWith.cover.idAttachment; stateChanged = true;}
    if(lastAcceptedValue.cover.size !== modifyWith.cover.size){newAcceptedValue.cover.size = modifyWith.cover.size; stateChanged = true;}
    if(lastAcceptedValue.cover.edgeColor !== modifyWith.cover.edgeColor){newAcceptedValue.cover.edgeColor = modifyWith.cover.edgeColor; stateChanged = true;}
    if(lastAcceptedValue.cover.idUploadedBackground !== modifyWith.cover.idUploadedBackground){newAcceptedValue.cover.idUploadedBackground = modifyWith.cover.idUploadedBackground; stateChanged = true;}
    if(lastAcceptedValue.cover.sharedSourceUrl !== modifyWith.cover.sharedSourceUrl){newAcceptedValue.cover.sharedSourceUrl = modifyWith.cover.sharedSourceUrl; stateChanged = true;}
    return {
        state: newAcceptedValue,
        changed: stateChanged || checklistStateChanged,
    }
}

function syncChanges(t,links,token,linkedCard){
    var first;
    var second;
    var listchanged = false;

    //Checking if the card was moved to another list, and if that list is linked
    if(linkedCard.originalCard.idList !== linkedCard.link.lastAcceptedValue.originalCardListId){
        for(var it of links){
            if(it.type === "list" && it.linkTarget.id === linkedCard.originalCard.idList){
                linkedCard.card.idList = it.targetID;
                listchanged = true;
                break;
            }
        }
    }
    else if(linkedCard.card.idList !== linkedCard.link.lastAcceptedValue.cardListId){
        for(var it of links){
            if(it.type === "list" && it.targetID === linkedCard.card.idList){
                linkedCard.originalCard.idList = it.linkTarget.id;
                listchanged = true;
                break;
            }
        }
    }

    if(Date.parse(linkedCard.card.dateLastActivity) > Date.parse(linkedCard.originalCard.dateLastActivity)){
        first = linkedCard.originalCard;
        second = linkedCard.card;
    }
    else{
        first = linkedCard.card;
        second = linkedCard.originalCard;
    }
    var newAcceptedState = modifyWithNewActions(linkedCard.link.lastAcceptedValue,first,linkedCard.link.lastAcceptedValue);
    var firstHasChanges = newAcceptedState.changed;
    newAcceptedState = modifyWithNewActions(newAcceptedState.state,second,linkedCard.link.lastAcceptedValue);
    newAcceptedState.state.originalCardListId = linkedCard.originalCard.idList;
    newAcceptedState.state.cardListId = linkedCard.card.idList;
    console.log({firstHasChanges: firstHasChanges, secondHasChanges: newAcceptedState.changed, listChanged: listchanged, newState: newAcceptedState.state});
    if(firstHasChanges || listchanged){
        saveChangesToCard(second, newAcceptedState.state, token)
    }
    if(newAcceptedState.changed || listchanged){
        saveChangesToCard(first, newAcceptedState.state, token)
    }
    linkedCard.link.lastAcceptedValue = newAcceptedState.state;
    t.set(linkedCard.card.id, 'shared', 'link', linkedCard.link);
}

function refreshCards(t,links,token){
    var context = t.getContext();
    return api.getCardsFromBoard(context.board, api.key, token, true, true)
    .then(allCards => {
        var promises = [];
        for(let _card of allCards){
            promises.push(t.get(_card.id, 'shared', 'link')
            .then(cardLink => {
                if(cardLink){
                    return api.getCard(cardLink.sourceID,api.key,token,true,true)
                    .then(_originalCard => {
                        return {
                            card: _card,
                            link: cardLink,
                            originalCard: _originalCard
                        }
                    })
                }
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
                    if(it.originalCard){
                        linkedCards.push(it);
                    }
                    else{
                        api.deleteCard(it.card.id,api.key,token);
                    }
                }
            }
            for(var it of linkedCards){
                syncChanges(t,links,token,it);
            }
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
                            api.sleep(300)
                            .then(() => {
                                return api.getLabelsFromBoard(it.card.idBoard,api.key,token)
                                .then(labels => {
                                    if(it.card.idLabels){
                                        var cardLabels = [];
                                        for(let l of labels){
                                            if(it.card.idLabels.includes(l.id)){
                                                cardLabels.push(l);
                                            }
                                        }
                                        it.card.labels = cardLabels;
                                    }
                                    it.card.originalCardListId = it.card.idList;
                                    it.card.cardListId = card.idList;
                                    if(it.card.idChecklists){
                                        return api.getChecklistsOnCard(it.card.id, api.key, token).then(values => {
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

export {copyNewCards,refreshCards}