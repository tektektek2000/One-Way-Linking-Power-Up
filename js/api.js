var numberOfCalls = 0;
var resetCalls;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function waitForApiCapacity(){
    if(!resetCalls){
        resetCalls = setInterval(function(){
                numberOfCalls = 0;
            }, 10000);
    }
    if(numberOfCalls < 95){
        numberOfCalls++;
        return Promise.resolve(numberOfCalls);
    }
    else{
        return sleep(500).then(() => {return waitForApiCapacity()})
    }
}

function fetchButApiSafe(link, headers){
    return waitForApiCapacity()
    .then(() => {
        return fetch(link, headers)
        .then(response => {
            if(response.status == 429){
                return sleep(500).then(() => {return fetchButApiSafe(link, headers)});
            }
            return response;
        })
    })
}

function addList(listName, boardID, apiKey, token){
    return fetchButApiSafe(`https://api.trello.com/1/lists?name=${listName}&idBoard=${boardID}&key=${apiKey}&token=${token}`, {
        method: 'POST'
    })
}

function deleteCard(cardID, apiKey, token){
    return fetchButApiSafe(`https://api.trello.com/1/cards/${cardID}?key=${apiKey}&token=${token}`, {
        method: 'DELETE'
    })
}

function addCard(cardName, cardDesc, listID, apiKey, token){
    return fetchButApiSafe(`https://api.trello.com/1/cards?idList=${listID}&name=${cardName}&desc=${cardDesc}&key=${apiKey}&token=${token}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        return response.text();
    })
    .then(text => {
        var card = JSON.parse(text);
        return card;
    });
}

function commaSeparatedList(strings){
    var ret = "";
    for(let i in strings){
        ret += strings[i];
        if(i < strings.length -1){
            ret += ',';
        }
    }
    return ret
}

function updateCard(cardID, cardName, cardDesc, listID, closed, idMembers, idAttachmentCover, due, start, dueComplete, address, locationName, coordinates, cover, apiKey, token){
    return fetchButApiSafe(`https://api.trello.com/1/cards/${cardID}?idList=${listID}&name=${cardName}&desc=${cardDesc}&closed=${closed}&idMembers=${commaSeparatedList(idMembers)}${idAttachmentCover ? `&idAttachmentCover=${idAttachmentCover}` : ""}&due=${due}&start=${start}&dueComplete=${dueComplete}${address ? `&address=${address}` : ""}${locationName ? `&locationName=${locationName}` : ""}${coordinates ? `&coordinates=${coordinates}` : ""}&key=${apiKey}&token=${token}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({cover:cover})
    })
    .then(response => {
        return response.text();
    })
    .then(text => {
        var card = JSON.parse(text);
        return card;
    });
}

function copyCard(listID, copyFromId, apiKey, token){
    return fetchButApiSafe(`https://api.trello.com/1/cards?idList=${listID}&idCardSource=${copyFromId}&key=${apiKey}&token=${token}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        return response.text();
    })
    .then(text => {
        var card = JSON.parse(text);
        return card;
    });
}

function getBoardsFromMember(memberID, apiKey, token){
    return fetchButApiSafe(`https://api.trello.com/1/members/${memberID}/boards?key=${apiKey}&token=${token}`, {
        method: 'GET',
        headers: {
        'Accept': 'application/json'
        }
    })
    .then(response => {
        if(response.status == 404){return undefined;}
        return response.text();
    })
    .then(text => {
        if(!text){return text}
        var boards = JSON.parse(text);
        return boards;
    });
}

function getCardsFromBoard(boardID, apiKey, token, fetchChecklist = false, fetchLabels = false){
    return fetchButApiSafe(`https://api.trello.com/1/boards/${boardID}/cards?key=${apiKey}&token=${token}`, {
        method: 'GET',
        headers: {
        'Accept': 'application/json'
        }
    })
    .then(response => {
        if(response.status == 404){return undefined;}
        return response.text();
    })
    .then(text => {
        if(!text){return text}
        var cards = JSON.parse(text);
        return cards;
    })
    .then(cards => {
        if(fetchChecklist){
            var promises = []
            for(let card of cards){
                if(card.idChecklists){
                    promises.push(getChecklistsOnCard(card.id,apiKey,token).then(values => {
                        card.checklists = values;
                        return card;
                    }));
                }
            }
            Promise.all(promises).then(values => {
                return values;
            })
        }
        return cards;
    })
    .then(cards => {
        if(fetchLabels){
            return getLabelsFromBoard(boardID,apiKey,token)
            .then(labels => {
                for(var card of cards){
                    if(card.idLabels){
                        var cardLabels = [];
                        for(let it of labels){
                            if(card.idLabels.includes(it.id)){
                                cardLabels.push(it);
                            }
                        }
                        card.labels = cardLabels;
                    }
                }
                return cards;
            })     
        }
        return cards;
    });
}

function getListsFromBoard(boardID, apiKey, token){
    return fetchButApiSafe(`https://api.trello.com/1/boards/${boardID}/lists?key=${apiKey}&token=${token}`, {
        method: 'GET',
        headers: {
        'Accept': 'application/json'
        }
    })
    .then(response => {
        if(response.status == 404){return undefined;}
        return response.text();
    })
    .then(text => {
        if(!text){return text}
        var boards = JSON.parse(text);
        return boards;
    });
}

function getMembersFromBoard(boardID, apiKey, token){
    return fetchButApiSafe(`https://api.trello.com/1/boards/${boardID}/members?key=${apiKey}&token=${token}`, {
        method: 'GET',
        headers: {
        'Accept': 'application/json'
        }
    })
    .then(response => {
        if(response.status == 404){return undefined;}
        return response.text();
    })
    .then(text => {
        if(!text){return text}
        var boards = JSON.parse(text);
        return boards;
    });
}

function getLabelsFromBoard(boardID, apiKey, token){
    return fetchButApiSafe(`https://api.trello.com/1/boards/${boardID}/labels?key=${apiKey}&token=${token}`, {
        method: 'GET',
        headers: {
        'Accept': 'application/json'
        }
    })
    .then(response => {
        if(response.status == 404){return undefined;}
        return response.text();
    })
    .then(text => {
        if(!text){return text}
        var boards = JSON.parse(text);
        return boards;
    });
}

function getList(listID, apiKey, token){
    return fetchButApiSafe(`https://api.trello.com/1/lists/${listID}?key=${apiKey}&token=${token}`, {
        method: 'GET',
        headers: {
        'Accept': 'application/json'
        }
    })
    .then(response => {
        if(response.status == 404){return undefined;}
        return response.text();
    })
    .then(text => {
        if(!text){return text}
        var list = JSON.parse(text);
        return list;
    });
}

function getCard(cardID, apiKey, token, fetchChecklist = false, fetchLabels = false){
    return fetchButApiSafe(`https://api.trello.com/1/cards/${cardID}?key=${apiKey}&token=${token}`, {
        method: 'GET',
        headers: {
        'Accept': 'application/json'
        }
    })
    .then(response => {
        if(response.status == 404){return undefined;}
        return response.text();
    })
    .then(text => {
        if(!text){return text}
        var card = JSON.parse(text);
        return card;
    })
    .then(card => {
        if(card.idChecklists && fetchChecklist){
            return getChecklistsOnCard(cardID, apiKey, token).then(values => {
                card.checklists = values;
                return card;
            });
        }
        return card;
    })
    .then(card => {
        if(card.idLabels && fetchLabels){
            return getLabelsFromBoard(card.idBoard,apiKey,token)
            .then(labels => {
                var cardLabels = [];
                for(let it of labels){
                    if(card.idLabels.includes(it.id)){
                        cardLabels.push(it);
                    }
                }
                card.labels = cardLabels;
                return card;
            });
        }
        return card;
    });
}

function getLabel(labelID, apiKey, token){
    return fetchButApiSafe(`https://api.trello.com/1/labels/${labelID}?key=${apiKey}&token=${token}`, {
        method: 'GET',
        headers: {
        'Accept': 'application/json'
        }
    })
    .then(response => {
        if(response.status == 404){return undefined;}
        return response.text();
    })
    .then(text => {
        if(!text){return text}
        var label = JSON.parse(text);
        return label;
    });
}

function getBoard(boardID, apiKey, token){
    return fetchButApiSafe(`https://api.trello.com/1/boards/${boardID}?key=${apiKey}&token=${token}`, {
        method: 'GET',
        headers: {
        'Accept': 'application/json'
        }
    })
    .then(response => {
        if(response.status == 404){return undefined;}
        return response.text();
    })
    .then(text => {
        if(!text){return text}
        var board = JSON.parse(text);
        return board;
    });
}


function getCardsFromList(listID, apiKey, token){
    return fetchButApiSafe(`https://api.trello.com/1/lists/${listID}/cards?key=${apiKey}&token=${token}`, {
        method: 'GET',
        headers: {
        'Accept': 'application/json'
        }
    })
    .then(response => {
        if(response.status == 404){return undefined;}
        return response.text();
    })
    .then(text => {
        if(!text){return text}
        var cards = JSON.parse(text);
        return cards;
    });
}

function getChecklist(checkListId, apiKey, token){
    return fetchButApiSafe(`https://api.trello.com/1/checklists/${checkListId}?key=${apiKey}&token=${token}`, {
        method: 'GET',
        headers: {
        'Accept': 'application/json'
        }
    })
    .then(response => {
        if(response.status == 404){return undefined;}
        return response.text();
    })
    .then(text => {
        if(!text){return text}
        var checklist = JSON.parse(text);
        return checklist;
    });
}

function getChecklistsOnCard(cardID, apiKey, token){
    return fetchButApiSafe(`https://api.trello.com/1/cards/${cardID}/checklists?key=${apiKey}&token=${token}`, {
        method: 'GET',
        headers: {
        'Accept': 'application/json'
        }
    })
    .then(response => {
        if(response.status == 404){return undefined;}
        return response.text();
    })
    .then(text => {
        if(!text){return text}
        var checklist = JSON.parse(text);
        return checklist;
    });
}

function addCheckListToCard(cardID, name, pos, apiKey, token){
    return fetchButApiSafe(`https://api.trello.com/1/cards/${cardID}/checklists?name=${name}&pos=${pos}&key=${apiKey}&token=${token}`, {
        method: 'POST',
        headers: {
        'Accept': 'application/json'
        }
    })
    .then(response => {
        if(response.status == 404){return undefined;}
        return response.text();
    })
    .then(text => {
        if(!text){return text}
        var cards = JSON.parse(text);
        return cards;
    });
}

function updateCheckList(checklistID, name, pos, apiKey, token){
    return fetchButApiSafe(`https://api.trello.com/1/checklists/${checklistID}?name=${name}&pos=${pos}&key=${apiKey}&token=${token}`, {
        method: 'PUT',
        headers: {
        'Accept': 'application/json'
        }
    })
    .then(response => {
        if(response.status == 404){return undefined;}
        return response.text();
    })
    .then(text => {
        if(!text){return text}
        var cards = JSON.parse(text);
        return cards;
    });
}

function deleteCheckListFromCard(cardID, checklistID, apiKey, token){
    return fetchButApiSafe(`https://api.trello.com/1/cards/${cardID}/checklists/${checklistID}?key=${apiKey}&token=${token}`, {
        method: 'DELETE',
        headers: {
        'Accept': 'application/json'
        }
    })
}

function addCheckItem(checklistID, name, checked, apiKey, token){
    return fetchButApiSafe(`https://api.trello.com/1/checklists/${checklistID}/checkItems?name=${name}&checked=${checked}&key=${apiKey}&token=${token}`, {
        method: 'POST',
        headers: {
        'Accept': 'application/json'
        }
    })
    .then(response => {
        if(response.status == 404){return undefined;}
        return response.text();
    })
    .then(text => {
        if(!text){return text}
        var cards = JSON.parse(text);
        return cards;
    });
}

function updateCheckItem(cardID, checklistID, checkitemID, name, pos, state, apiKey, token){
    return fetchButApiSafe(`https://api.trello.com/1/cards/${cardID}/checklist/${checklistID}/checkItem/${checkitemID}?name=${name}&pos=${pos}&state=${state}&key=${apiKey}&token=${token}`, {
        method: 'PUT',
        headers: {
        'Accept': 'application/json'
        }
    })
    .then(response => {
        if(response.status == 404){return undefined;}
        return response.text();
    })
    .then(text => {
        if(!text){return text}
        var cards = JSON.parse(text);
        return cards;
    });
}

function deleteCheckItem(checklistID, checkitemID, apiKey, token){
    return fetchButApiSafe(`https://api.trello.com/1/checklists/${checklistID}/checkItems/${checkitemID}?key=${apiKey}&token=${token}`, {
        method: 'DELETE',
        headers: {
        'Accept': 'application/json'
        }
    })
}

const key = "6f2af19073479657e48933387208eecd"

export {key,sleep,addList,updateCard,addCard,deleteCard,copyCard,getBoardsFromMember,getCardsFromBoard,getListsFromBoard
    ,getMembersFromBoard,getLabelsFromBoard,getList,getCard,getLabel,getBoard,getCardsFromList,getChecklist,getChecklistsOnCard
    ,addCheckListToCard,updateCheckList,deleteCheckListFromCard,addCheckItem,updateCheckItem,deleteCheckItem}