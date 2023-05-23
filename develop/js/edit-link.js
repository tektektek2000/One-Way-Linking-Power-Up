import * as api from "./api.js"

var Promise = TrelloPowerUp.Promise;
var _lists;

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
                var element = $('#memberConditionSelectorDropdown')[0];
                element.innerHTML = '';
                for (var it in members){
                    const member = members[it];
                    var option = document.createElement("option");
                    option.setAttribute('value', member.id);     
                    var text = document.createTextNode(member.username);
                    option.appendChild(text);
                    element.appendChild(option);
                }
                api.getLabelsFromBoard(boardID, api.key, token)
                .then(labels => {
                    var element = $('#labelConditionSelectorDropdown')[0];
                    element.innerHTML = '';
                    for (var it in labels){
                        const label = labels[it];
                        var option = document.createElement("option");
                        option.setAttribute('value', label.id);     
                        var text = document.createTextNode(label.name);
                        option.appendChild(text);
                        element.appendChild(option);
                    }
                    saveCurrent(t);
                })
            })
        })
    })
}

function saveCurrent(t){
    var linkname = $("#linkName")[0].value;
    t.getRestApi()
    .getToken()
    .then(token => {
        if (!token) {
            console.log("No token")
        }
        else{
            var promise;
            if($('#newListCheck')[0].checked){
                promise = api.addList(linkname, context.board, api.key, token)
                    .then(response => {
                        return response.text();
                    })
                    .then(text => {
                        const id = text.match(/"id":"([\da-z]*)"/i)[1];
                        return id;
                    })
            }
            else{
                promise = new Promise((resolve, reject) => {
                    resolve(JSON.parse($("#targetListSelectorDropdown")[0].value).id);
                });
            }
            promise.then(id => {            
                api.addCard(linkname,"This is an automatically generated card.",id,api.key,token)
                .then(response => {
                    return response.text();
                })
                .then(text => {
                    return sleep(200) //The Api is slow and i need to wait otherwise i get no card with this id error.
                    .then(() => {
                        const id = text.match(/"id":"([\da-z]*)"/i)[1];
                        return id;
                    })
                })
                .then(id => { 
                    var type = "list";
                    var _linkTargetID = _lists[$('#listSelectorDropdown')[0].value];
                    if($('#targetSelectorDropdown')[0].value === "Board"){
                        type = "board";
                        _linkTargetID = $('#boardSelectorDropdown')[0].value;
                    }
                    var _condtype = "none";
                    var _condTarget = "";
                    if($('#conditionSelectorDropdown')[0].value === "Member"){
                        _condtype = "member";
                        _condTarget = $('#memberConditionSelectorDropdown')[0].value;
                    }
                    else if($('#conditionSelectorDropdown')[0].value === "Label"){
                        _condtype = "label";
                        _condTarget = $('#labelConditionSelectorDropdown')[0].value;
                    }
                    t.set(id, 'shared', 'link', {
                        linktype: type,
                        linkTargetID: _linkTargetID,
                        condtype: _condtype,
                        condTarget: _condTarget,
                        targetID: id
                    })
                    .then(idk => {
                        t.closeModal();
                    })
                    .catch(err => {
                        console.error(err)
                        t.closeModal();
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
    $('#memberConditionSelectDiv').change(function(){
        saveCurrent(t);
    })
    $('#labelConditionSelectDiv').change(function(){
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
                        promise = api.getList(link.linkTargetID, api.key, token)
                                    .then(list => {
                                        return list.idBoard;
                                    })
                    }
                    else if(link.type === "board"){
                        promise = new Promise((resolve, reject) => {
                            resolve(link.linkTargetID);
                        });
                    }
                    promise.then(boardID => {
                        for (var it in boards){
                            if (boards[it].id === boardID){
                                $('#boardSelectorDropdown')[0].selectedIndex = it;
                            }
                        }
                        api.getListsFromBoard(context.board, api.key, token)
                        .then(lists => {
                            var element = $('#targetListSelectorDropdown')[0];
                            element.innerHTML = '';
                            for (var it in lists){
                                const list = lists[it];
                                var option = document.createElement("option");
                                option.setAttribute('value', `{"name": "${list.name}","id": "${list.id}"}`);     
                                var text = document.createTextNode(list.name);
                                option.appendChild(text);
                                element.appendChild(option);
                            }
                            api.getListsFromBoard(boardID, api.key, token)
                            .then(targetlists => {
                                var element = $('#listSelectorDropdown')[0];
                                element.innerHTML = '';
                                for (var it in targetlists){
                                    const list = targetlists[it];
                                    var option = document.createElement("option");
                                    option.setAttribute('value', it);     
                                    var text = document.createTextNode(list.name);
                                    option.appendChild(text);
                                    element.appendChild(option);
                                }
                                if(link.type === "board"){
                                    for (var it in targetlists){
                                        if (targetlists[it].id === link.linkTargetID){
                                            $('#listSelectorDropdown')[0].selectedIndex = it;
                                        }
                                    }
                                }
                                api.getMembersFromBoard(boardID, api.key, token)
                                .then(members => {
                                    var element = $('#memberConditionSelectorDropdown')[0];
                                    element.innerHTML = '';
                                    for (var it in members){
                                        const member = members[it];
                                        var option = document.createElement("option");
                                        option.setAttribute('value', member.id);     
                                        var text = document.createTextNode(member.username);
                                        option.appendChild(text);
                                        element.appendChild(option);
                                    }
                                    api.getLabelsFromBoard(boardID, api.key, token)
                                    .then(labels => {
                                        var element = $('#labelConditionSelectorDropdown')[0];
                                        element.innerHTML = '';
                                        for (var it in labels){
                                            const label = labels[it];
                                            var option = document.createElement("option");
                                            option.setAttribute('value', label.id);     
                                            var text = document.createTextNode(label.name);
                                            option.appendChild(text);
                                            element.appendChild(option);
                                        }
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