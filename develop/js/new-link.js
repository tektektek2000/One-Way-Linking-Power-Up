import * as api from "../../TrelloPowerUpNewMeeting/js/api.js"

var Promise = TrelloPowerUp.Promise;
const key = "6f2af19073479657e48933387208eecd"

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

$(document).ready(function(){
    var context = t.getContext();
    var _boards;
    t.getRestApi()
    .getToken()
    .then(token => {
        if (!token) {
            console.log("No token")
        }
        else{
            getBoardsFromMember(context.member, key, token)
            .then(boards => {
                _boards = boards;
                var element = $('#boardSelectorDropdown');
                for (const board in boards){
                    var opt = board.name;  
                    var li = document.createElement("li");
                    var link = document.createElement("a");             
                    var text = document.createTextNode(opt);
                    link.appendChild(text);
                    link.href = "#";
                    li.appendChild(link);
                    element.appendChild(li);
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