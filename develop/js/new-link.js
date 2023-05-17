import * as api from "./api.js"

var Promise = TrelloPowerUp.Promise;
const key = "6f2af19073479657e48933387208eecd"

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

$(document).ready(function(){
    var t = window.TrelloPowerUp.iframe({
        appKey: key,
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
            api.getBoardsFromMember(context.member, key, token)
            .then(boards => {
                _boards = boards;
                var element = $('#boardSelectorDropdown');
                for (const board in boards){
                    var opt = board.name;  
                    var a = document.createElement("a"); 
                    api.classname = "dropdown-item";           
                    var text = document.createTextNode(opt);
                    a.appendChild(text);
                    element.appendChild(a);
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
                api.addList(linkname, context.board, key, token)
                .then(response => {
                    return response.text();
                })
                .then(text => {
                    const id = text.match(/"id":"([\da-z]*)"/i)[1]
                    api.addCard(linkname,"This is an automatically generated card.",id,key,token)
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