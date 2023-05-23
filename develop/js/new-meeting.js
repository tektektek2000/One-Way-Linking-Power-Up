import * as api from "./api.js"

var Promise = TrelloPowerUp.Promise;
const key = "2905a45608f989a24bf26e3d92edcf80"

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

$(document).ready(function(){
    $('#meetingForm').submit(function(event){
        event.preventDefault();   
        var listName =  $("#meetingstart")[0].value  + "-" + $("#meetingend")[0].value ;
        console.log(listName);
        const regex = /(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d)-(\d\d):(\d\d)/i;
        const match = listName.match(regex);
        var starthour = parseInt(match[4]);
        var endhour = parseInt(match[6]);
        listName = $("#meetingName")[0].value + " " + `${match[1]}/${match[2]}/${match[3]}`;
        var t = window.TrelloPowerUp.iframe({
            appKey: '2905a45608f989a24bf26e3d92edcf80',
            appName: 'Test'
        });
        var context = t.getContext();
        t.getRestApi()
        .getToken()
        .then(token => {
            if (!token) {
                console.log("No token")
            }
            else{
                api.addList(listName, context.board, key, token)
                .then(response => {
                    return response.text();
                })
                .then(text => {
                    const id = text.match(/"id":"([\da-z]*)"/i)[1]
                    api.addCard("Summary","This is an automatically generated card.",id,key,token)
                    .then(response => {
                        return response.text();
                    })
                    .then(text => {
                        var cardJson = text;
                        sleep(200) //The Api is slow and i need to wait otherwise i get no card with this id error.
                        .then(() => {
                            const id = cardJson.match(/"id":"([\da-z]*)"/i)[1];
                            t.set(id, 'shared', 'meetingCard', {
                                role: "Summary",
                                startHour: starthour,
                                startMinutes: parseInt(match[5]),
                                endHour: endhour,
                                endMinutes: parseInt(match[7])
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