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
    .then(response => {
        return response.text();
    })
    .then(text => {
        var card = JSON.parse(text);
        return card;
    });
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
        var boards = JSON.parse(text);
        return boards;
    });
}

function getCardsFromBoard(boardID, apiKey, token){
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
        var boards = JSON.parse(text);
        return boards;
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
        var list = JSON.parse(text);
        return list;
    });
}

function getCard(cardID, apiKey, token){
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
        var card = JSON.parse(text);
        return card;
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
        var checklist = JSON.parse(text);
        return checklist;
    });
}

const key = "6f2af19073479657e48933387208eecd"

export {key,addList,addCard,copyCard,getBoardsFromMember,getCardsFromBoard,getListsFromBoard,getMembersFromBoard,getLabelsFromBoard,getList,getCard,getBoard,getCardsFromList,getChecklist}