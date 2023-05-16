import * as api from "./api.js"

var Promise = TrelloPowerUp.Promise;
const key = "2905a45608f989a24bf26e3d92edcf80"

function inputChanged(e) {
    t.set('card', 'shared', 'meetingCard', {
        role: "Topic",
        hours: parseInt($('#topichours')[0].value),
        minutes: parseInt($('#topicminutes')[0].value),
    })
}

var t = window.TrelloPowerUp.iframe({
    appKey: '2905a45608f989a24bf26e3d92edcf80',
    appName: 'Test'
});

$(document).ready(function(){
    t.get('card', 'shared', 'meetingCard')
    .then(cardRole => {
        if (cardRole && cardRole.role === "Topic") {
            $('#topichours')[0].value=`${cardRole.hours}`;
            $('#topicminutes')[0].value=`${cardRole.minutes}`;
            $('#topichours')[0].addEventListener("input", inputChanged);
            $('#topicminutes')[0].addEventListener("input", inputChanged);
        }
    })
});