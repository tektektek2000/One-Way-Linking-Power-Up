import * as api from "./api.js"

var Promise = TrelloPowerUp.Promise;
var _lists;
var _members;
var _labels;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function boardSelected(t){
    var boardID =  $("#boardSelectorDropdown")[0].value;
    t.getRestApi()
    .getToken()
    .then(token => {
        api.getListsFromBoard(boardID, api.key, token)
        .then(lists => {
            _lists = lists;
            var element = $('#listSelectorDropdown')[0];
            element.innerHTML = '';
            for (var it in lists){
                const list = lists[it];
                var option = document.createElement("option");
                option.setAttribute('value', it);     
                var text = document.createTextNode(list.name);
                option.appendChild(text);
                element.appendChild(option);
            }
            api.getMembersFromBoard(boardID, api.key, token)
            .then(members => {
                _members = members;
                var element = $('#memberConditionSelectorDropdown')[0];
                element.innerHTML = '';
                for (var it in members){
                    const member = members[it];
                    var option = document.createElement("option");
                    option.setAttribute('value', it);     
                    var text = document.createTextNode(member.username);
                    option.appendChild(text);
                    element.appendChild(option);
                }
                api.getLabelsFromBoard(boardID, api.key, token)
                .then(labels => {
                    _labels = labels
                    var element = $('#labelConditionSelectorDropdown')[0];
                    element.innerHTML = '';
                    for (var it in labels){
                        const label = labels[it];
                        var option = document.createElement("option");
                        option.setAttribute('value', it);     
                        var text = document.createTextNode(label.name);
                        option.appendChild(text);
                        element.appendChild(option);
                    }
                })
            })
        })
    })
}

function saveCurrent(t){
    t.getRestApi()
    .getToken()
    .then(token => {
        if (!token) {
            console.log("No token")
        }
        else{
            var id = JSON.parse($("#targetListSelectorDropdown")[0].value).id          
            var type = "list";
            var _linkTarget = _lists[$('#listSelectorDropdown')[0].value];
            if($('#targetSelectorDropdown')[0].value === "Board"){
                type = "board";
                _linkTarget = $('#boardSelectorDropdown')[0].value;
            }
            var _condtype = "none";
            var _condTarget = "";
            if($('#conditionSelectorDropdown')[0].value === "Member"){
                _condtype = "member";
                _condTarget = _members[$('#memberConditionSelectorDropdown')[0].value];
            }
            else if($('#conditionSelectorDropdown')[0].value === "Label"){
                _condtype = "label";
                _condTarget = _labels[$('#labelConditionSelectorDropdown')[0].value];
            }
            t.set('card', 'shared', 'link', {
                type: type,
                linkTarget: _linkTarget,
                condtype: _condtype,
                condTarget: _condTarget,
                targetID: id
            })
            .catch(err => {
                console.error(err)
                t.closeModal();
            });
        }
    });
}

$(document).ready(function(){
    var t = window.TrelloPowerUp.iframe({
        appKey: api.key,
        appName: 'Test'
    });
    var context = t.getContext();
    $('#targetSelectorDropdown').change(function(){
        if($('#targetSelectorDropdown')[0].value === "Board"){
            $('#listSelectDiv').hide();
        }
        else if($('#targetSelectorDropdown')[0].value === "List"){
            $('#listSelectDiv').show();
        }
        saveCurrent(t);
    })
    $('#conditionSelectorDropdown').change(function(){
        if($('#conditionSelectorDropdown')[0].value === "None"){
            $('#memberConditionSelectDiv').hide();
            $('#labelConditionSelectDiv').hide();
        }
        else if($('#conditionSelectorDropdown')[0].value === "Member"){
            $('#memberConditionSelectDiv').show();
            $('#labelConditionSelectDiv').hide();
        }
        else if($('#conditionSelectorDropdown')[0].value === "Label"){
            $('#labelConditionSelectDiv').show();
            $('#memberConditionSelectDiv').hide();
        }
        saveCurrent(t);
    })
    $('#boardSelectorDropdown').change(function(){
        boardSelected(t);
    })
    $('#listSelectorDropdown').change(function(){
        saveCurrent(t);
    })
    $('#targetListSelectorDropdown').change(function(){
        saveCurrent(t);
    })
    $('#memberConditionSelectorDropdown').change(function(){
        saveCurrent(t);
    })
    $('#labelConditionSelectorDropdown').change(function(){
        saveCurrent(t);
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
                t.get('card', 'shared', 'link')
                .then(link => {
                    console.log(link);
                    var promise;
                    if(link.type === "list"){
                        promise = new Promise((resolve, reject) => {
                            resolve(link.linkTarget.idBoard);
                        });
                    }
                    else if(link.type === "board"){
                        promise = new Promise((resolve, reject) => {
                            resolve(link.linkTarget);
                        });
                    }
                    promise.then(boardID => {
                        for (var it in boards){
                            if (boards[it].id === boardID){
                                $('#boardSelectorDropdown')[0].selectedIndex = it;
                            }
                        }
                        console.log($('#boardSelectorDropdown')[0].value);
                        api.getListsFromBoard(context.board, api.key, token)
                        .then(targetlists => {
                            var element = $('#targetListSelectorDropdown')[0];
                            element.innerHTML = '';
                            for (var it in targetlists){
                                const list = targetlists[it];
                                var option = document.createElement("option");
                                option.setAttribute('value', `{"name": "${list.name}","id": "${list.id}"}`);     
                                var text = document.createTextNode(list.name);
                                option.appendChild(text);
                                element.appendChild(option);
                            }
                            for (var it in targetlists){
                                console.log(targetlists[it].id);
                                console.log(link.linkTarget.targetID);
                                if (targetlists[it].id === link.linkTarget.targetID){
                                    $('#targetListSelectorDropdown')[0].selectedIndex = it;
                                }
                            }
                            console.log($('#targetListSelectorDropdown')[0].value);
                            api.getListsFromBoard(boardID, api.key, token)
                            .then(lists => {
                                _lists = lists;
                                var element = $('#listSelectorDropdown')[0];
                                element.innerHTML = '';
                                for (var it in lists){
                                    const list = lists[it];
                                    var option = document.createElement("option");
                                    option.setAttribute('value', it);     
                                    var text = document.createTextNode(list.name);
                                    option.appendChild(text);
                                    element.appendChild(option);
                                }
                                if(link.type === "list"){
                                    for (var it in lists){
                                        if (lists[it].id === link.linkTarget.id){
                                            $('#listSelectorDropdown')[0].selectedIndex = it;
                                        }
                                    }
                                    console.log($('#listSelectorDropdown')[0].value);
                                    $('#listSelectDiv').show();
                                    $('#targetSelectorDropdown')[0].selectedIndex = 1;

                                }
                                api.getMembersFromBoard(boardID, api.key, token)
                                .then(members => {
                                    _members = members;
                                    var element = $('#memberConditionSelectorDropdown')[0];
                                    element.innerHTML = '';
                                    for (var it in members){
                                        const member = members[it];
                                        var option = document.createElement("option");
                                        option.setAttribute('value', it);     
                                        var text = document.createTextNode(member.username);
                                        option.appendChild(text);
                                        element.appendChild(option);
                                    }
                                    if(link.condtype === "member"){
                                        for (var it in members){
                                            if (members[it].id === link.condTarget.id){
                                                $('#memberConditionSelectorDropdown')[0].selectedIndex = it;
                                            }
                                        }
                                        $('#conditionSelectorDropdown')[0].selectedIndex = 1;
                                        $('#memberConditionSelectDiv').show();
                                        console.log($('#memberConditionSelectorDropdown')[0].value);
                                    }
                                    api.getLabelsFromBoard(boardID, api.key, token)
                                    .then(labels => {
                                        _labels = labels;
                                        var element = $('#labelConditionSelectorDropdown')[0];
                                        element.innerHTML = '';
                                        for (var it in labels){
                                            const label = labels[it];
                                            var option = document.createElement("option");
                                            option.setAttribute('value', it);     
                                            var text = document.createTextNode(label.name);
                                            option.appendChild(text);
                                            element.appendChild(option);
                                        }
                                        if(link.condtype === "label"){
                                            for (var it in members){
                                                if (labels[it].id === link.condTarget.id){
                                                    $('#labelConditionSelectorDropdown')[0].selectedIndex = it;
                                                }
                                            }
                                            $('#conditionSelectorDropdown')[0].selectedIndex = 2;
                                            $('#labelConditionSelectDiv').show();
                                            console.log($('#labelConditionSelectorDropdown')[0].value);
                                        }
                                        $('#mainDiv').show();
                                        $('#loadingDiv').hide();
                                    })
                                })
                            })
                        })
                    })
                })
            })
        }  
    })
});