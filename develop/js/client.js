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

function showNewLinkMenu(t) {
    return t.modal({
        title: 'New Link',
        url: t.signUrl('views/new-link.html'),
        fullscreen: false
    });
}

function showEditLinkMenu(t) {
    return t.modal({
        title: 'Edit Links',
        url: t.signUrl('views/edit-link.html'),
        fullscreen: false
    });
}


var test;

TrelloPowerUp.initialize({
    "card-badges": function (t, opts) {
        return t
            .card("all")
            .then(function (card) {
                return {};
            });
    },
    'board-buttons': function (t, opts) {
        test = setInterval(function(){
            t.getRestApi()
            .getToken()
            .then(token => {
                if (!token) {
                    console.log("No token")
                }
                else{
                    console.log("Test successfull token")
                }
            })}, 60000);
        return t.getRestApi()
            .isAuthorized()
            .then(function (isAuthorized) {
                if (isAuthorized) {
                    var ret = [{
                        text: 'New Link',
                        condition: "edit",
                        callback: showNewLinkMenu
                    }]
                    return t.get('board', 'shared', 'link')
                    .then(links =>{
                        if(links){
                            ret.push({
                                text: 'Edit Links',
                                condition: "edit",
                                callback: showEditLinkMenu
                            })
                        }
                        return ret;
                    });
                } else {
                    return [{
                        text: 'Authorize',
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
                
            })
    },
    'card-buttons': function (t, opts) {
        return t
            .card("all")
            .then(function (card) {
                return {}
            })
      }
}, {
    appKey: '6f2af19073479657e48933387208eecd',
    appName: 'Test'
});