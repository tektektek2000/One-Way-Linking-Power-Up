import * as api from "./api.js"

var Promise = TrelloPowerUp.Promise;
var _lists;
var _members;
var _labels;
var _links = [];

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
    })
    $('#newListCheck').change(function(){
        if($('#newListCheck')[0].checked){
            $('#targetListSelectDiv').hide();
        }
        else {
            $('#targetListSelectDiv').show();
        }
    })
    $('#boardSelectorDropdown').change(function(){
        boardSelected(t);
    })
    t.get('board', 'shared', 'link')
    .then(links =>{
        if(links){
            _links = links;
        }
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
                        boardSelected(t);
                    })
                })
            }  
        })
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
                promise.then(listTargetId => {            
                    api.addCard(linkname,"This is an automatically generated card.",listTargetId,api.key,token)
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
                        _links.push({
                            type: type,
                            linkTarget: _linkTarget,
                            condtype: _condtype,
                            condTarget: _condTarget,
                            targetID: listTargetId
                        })
                        t.set('board', 'shared', 'link', _links)
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
    })
});