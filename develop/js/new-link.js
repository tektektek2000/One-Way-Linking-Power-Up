import * as api from "./api.js"

var Promise = TrelloPowerUp.Promise;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

$(document).ready(function(){
    var t = window.TrelloPowerUp.iframe({
        appKey: api.key,
        appName: 'Test'
    });
    var context = t.getContext();
    $('#boardSelectorDropdown').change(function(){
        var boardID =  $("#boardSelectorDropdown")[0].value;
        t.getRestApi()
        .getToken()
        .then(token => {
            api.getListsFromBoard(boardID, api.key, token)
            .then(lists => {
                var element = $('#listSelectorDropdown')[0];
                element.innerHTML = '';
                for (var it in lists){
                    const list = lists[it];
                    var option = document.createElement("option");
                    option.setAttribute('value',list);     
                    var text = document.createTextNode(list.name);
                    option.appendChild(text);
                    element.appendChild(option);
                }
            })
        })
    })
    t.getRestApi()
    .getToken()
    .then(token => {
        if (!token) {
            console.log("No token")
        }
        else{
            api.getBoardsFromMember(context.member, api.key, token)
            .then(boards => {
                var element = $('#boardSelectorDropdown')[0];
                for (var it in boards){
                    const board = boards[it];
                    var option = document.createElement("option");
                    option.setAttribute('value',board.id);     
                    var text = document.createTextNode(board.name);
                    option.appendChild(text);
                    element.appendChild(option);
                }
                var boardID =  $("#boardSelectorDropdown")[0].value;
                api.getListsFromBoard(boardID, api.key, token)
                .then(lists => {
                    var element = $('#listSelectorDropdown')[0];
                    element.innerHTML = '';
                    for (var it in lists){
                        const list = lists[it];
                        var option = document.createElement("option");
                        option.setAttribute('value',list);     
                        var text = document.createTextNode(list.name);
                        option.appendChild(text);
                        element.appendChild(option);
                    }
                })
            })
        }  
    })
    $('#meetingForm').submit(function(event){
        event.preventDefault();   
        var linkname = $("#linkName")[0].value;
        t.getRestApi()
        .getToken()
        .then(token => {
            if (!token) {
                console.log("No token")
            }
            else{
                api.addList(linkname, context.board, api.key, token)
                .then(response => {
                    return response.text();
                })
                .then(text => {
                    const id = text.match(/"id":"([\da-z]*)"/i)[1]
                    api.addCard(linkname,"This is an automatically generated card.",id,api.key,token)
                    .then(response => {
                        return response.text();
                    })
                    .then(text => {
                        var cardJson = text;
                        sleep(200) //The Api is slow and i need to wait otherwise i get no card with this id error.
                        .then(() => {
                            const id = cardJson.match(/"id":"([\da-z]*)"/i)[1];
                            t.set(id, 'shared', 'onewaylink', {
                                linktype: "list"
                            })
                            .then(idk => {
                                t.closeModal();
                            })
                            .catch(err => {
                                console.error(err)
                                t.closeModal();
                            });
                        });
                    })
                    .catch(err => {
                        console.error(err)
                        t.closeModal();
                    });
                })
                .catch(err => console.error(err));
            }
        });
    })
});