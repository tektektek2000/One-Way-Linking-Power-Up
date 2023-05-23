import * as api from "./api.js"

var Promise = TrelloPowerUp.Promise;
const key = "2905a45608f989a24bf26e3d92edcf80"

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

$(document).ready(function(){
    $('#topicForm').submit(function(event){
        var t = window.TrelloPowerUp.iframe({
            appKey: '2905a45608f989a24bf26e3d92edcf80',
            appName: 'Test'
        });
        event.preventDefault();   
        t.set('card', 'shared', 'meetingCard', {
            role: "Topic",
            hours: parseInt($('#topichours')[0].value),
            minutes: parseInt($('#topicminutes')[0].value),
        })
        .then(idk => {
            t.closeModal();
        })
    })
});