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
    var _boards;
    t.getRestApi()
    .getToken()
    .then(token => {
        if (!token) {
            console.log("No token")
        }
        else{
            api.getBoardsFromMember(context.member, api.key, token)
            .then(boards => {
                console.log(boards);
                _boards = boards;
                var element = document.getElementById('boardSelectorDropdown');
                for (var it in boards){
                    const board = boards[it];
                    console.log(board);
                    var opt = board.name;  
                    var option = document.createElement("option");        
                    var text = document.createTextNode(opt);
                    option.appendChild(text);
                    element.appendChild(option);
                }
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