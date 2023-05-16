import * as api from "./api.js"

var Promise = TrelloPowerUp.Promise;

function ToTwoDigit(num) {
    return num < 10 ? `0${num}` : num;
}

function showAuth(t) {
    return t.popup({
        title: 'Authorize to continue',
        url: 'views/authorize.html'
    });
}

function showNewMeetingMenu(t) {
    return t.modal({
        title: 'New Meeting',
        url: t.signUrl('views/new-meeting.html'),
        fullscreen: false
    });
}

function makeTopicCard(t){
    return t.modal({
        title: 'Topic',
        url: t.signUrl('views/topic-button.html'),
        fullscreen: false
    });
}

function getListTopicCardsDuration(t, listID){
    return t.getRestApi()
        .getToken()
        .then(token => {
            return api.getCardsFromList(listID,'2905a45608f989a24bf26e3d92edcf80',token)
            .then(cards => {          
                var promises = []
                for(const card of cards){
                    promises.push(t.get(card.id, 'shared', 'meetingCard')
                    .then(cardRole => {
                        if (cardRole && cardRole.role === "Topic") {
                            return cardRole.hours * 60 + cardRole.minutes;
                        }
                        return 0;
                    }));
                }
                return Promise.all(promises).then(values => {
                    var sum = 0;
                    for(const val of values){
                        sum += val;
                    }
                    return sum;
                });
            })
        });
}

TrelloPowerUp.initialize({
    "card-badges": function (t, opts) {
        return t
            .card("all")
            .then(function (card) {
                return t.get(card.id, 'shared', 'meetingCard')
                    .then(cardRole => {
                        if (cardRole){
                            if(cardRole.role === "Summary"){
                                var durationHours = cardRole.startHour < cardRole.endHour ? cardRole.endHour - cardRole.startHour : 24 - cardRole.startHour + cardRole.endHour;
                                var durationMinutes = cardRole.endMinutes - cardRole.startMinutes;
                                if (durationMinutes < 0) {
                                    durationHours--;
                                    durationMinutes += 60;
                                }
                                return [
                                    {
                                        text: `🕒 ${ToTwoDigit(cardRole.startHour)}:${ToTwoDigit(cardRole.startMinutes)}-${ToTwoDigit(cardRole.endHour)}:${ToTwoDigit(cardRole.endMinutes)}`,
                                        color: "blue"
                                    },
                                    {
                                        text: `Length: ${durationHours} h ${durationMinutes} m`,
                                        color: "light-gray"
                                    },
                                    {
                                        dynamic: () =>{
                                            return getListTopicCardsDuration(t,card.idList)
                                            .then(topicDuration => {
                                                if(topicDuration === 0)
                                                {
                                                    return {
                                                        text: `No Scheduled`,
                                                        color: 'light-gray',
                                                        refresh: 10
                                                    }
                                                }
                                                return {
                                                    text: `Scheduled: ${Math.floor(topicDuration/60)} h ${topicDuration%60} m`,
                                                    color: (durationHours * 60 + durationMinutes) - topicDuration < 0 ? 'red' : 'green',
                                                    refresh: 10
                                                }
                                            })
                                        }
                                    }
                                    ];
                            }
                            else if(cardRole.role === "Topic"){
                                return [
                                    {
                                        text: `${ToTwoDigit(cardRole.hours)} h ${ToTwoDigit(cardRole.minutes)} m`,
                                        color: "light-gray"
                                    }
                                ];
                            }
                        }
                        return [];
                    });
            });
    },
    'board-buttons': function (t, opts) {
        return t.getRestApi()
            .isAuthorized()
            .then(function (isAuthorized) {
                if (isAuthorized) {
                    return [{
                        text: 'New Meeting',
                        condition: "edit",
                        callback: showNewMeetingMenu
                    }];
                } else {
                    return [{
                        text: 'New Meeting',
                        condition: "edit",
                        callback: showAuth
                    }];
                }
            })
    },
    'card-back-section': function (t, options) {
        return t
            .card("all")
            .then(function (card) {
                return t.get(card.id, 'shared', 'meetingCard')
                    .then(cardRole => {
                        if (cardRole && cardRole.role === "Summary") {
                            return {
                                title: 'Summary Card',
                                icon: t.signUrl(TrelloPowerUp.util.relativeUrl("./icons/summary.png")),
                                content: {
                                    type: 'iframe',
                                    url: t.signUrl(TrelloPowerUp.util.relativeUrl('./views/summary-section.html')),
                                    height: 80,
                                },
                                action: {
                                    text: 'Remove Summary',
                                    callback: (t) => {t.remove('card', 'shared', 'meetingCard');},
                                }
                            }
                        }
                        else if (cardRole && cardRole.role === "Topic") {
                            return {
                                title: 'Topic Card',
                                icon: t.signUrl(TrelloPowerUp.util.relativeUrl("./icons/summary.png")),
                                content: {
                                    type: 'iframe',
                                    url: t.signUrl(TrelloPowerUp.util.relativeUrl('./views/topic-section.html')),
                                    height: 80,
                                },
                                action: {
                                    text: 'Remove Topic',
                                    callback: (t) => {t.remove('card', 'shared', 'meetingCard');},
                                }
                            }
                        }
                    })
            })
    },
    'card-buttons': function (t, opts) {
        return t
            .card("all")
            .then(function (card) {
                return t.get(card.id, 'shared', 'meetingCard')
                    .then(cardRole => {
                        if (!cardRole) {
                            return [{
                                icon: t.signUrl(TrelloPowerUp.util.relativeUrl("./icons/summary.png")),
                                text: 'Topic Card',
                                callback: makeTopicCard,
                                condition: 'edit'
                            }];
                        }
                        else{
                            return [];
                        }
                    })
            })
      }
}, {
    appKey: '2905a45608f989a24bf26e3d92edcf80',
    appName: 'Test'
});