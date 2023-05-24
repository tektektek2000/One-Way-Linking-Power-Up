import * as api from "./api.js"

var Promise = TrelloPowerUp.Promise;
var _lists;
var _members;
var _labels;
var _links = [];
var selectedIndex = 0;

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
            _links[selectedIndex].name = $("#linkName")[0].value;
            _links[selectedIndex].type = type;
            _links[selectedIndex].linkTarget = _linkTarget;
            _links[selectedIndex].condtype = _condtype;
            _links[selectedIndex].condTarget = _condTarget;
            _links[selectedIndex].targetID = JSON.parse($("#targetListSelectorDropdown")[0].value).id;
            t.set('board', 'shared', 'link', _links)
            .catch(err => {
                console.error(err)
            });
        }
    });
}

function linkSelected(t){
    var context = t.getContext();
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
                var link = _links[selectedIndex];
                $("#linkName")[0].value = link.name;
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
                            if (targetlists[it].id === link.targetID){
                                $('#targetListSelectorDropdown')[0].selectedIndex = it;
                            }
                        }
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
                                    }
                                    $('#mainDiv').show();
                                    $('#loadingDiv').hide();
                                })
                            })
                        })
                    })
                })
            })
        }  
    })
}

function PopulateLinks(t){
    t.get('board', 'shared', 'link')
    .then(links =>{
        if(links){
            _links = links;
        }
        else if(!links || links.length === 0){
            t.closeModal();
            return;
        }
        $('#linkSelectDiv')[0].innerHTML = "";
        for (var it in _links){
            $('#linkSelectDiv')[0].innerHTML += 
            `<div class="row border justify-content-center align-self-center p-1 m-1">
                <div class="col-md-8 align-self-center">
                    <span>${_links[it].name}</span>
                </div>
                <div class="col-md-4 text-right align-self-center">
                    <button type="button" class="btn btn-primary" link-index="${it}"><i class="fa fa-edit"></i></button>
                    <button type="button" class="btn btn-danger" link-index="${it}"><i class="fa fa-trash"></i></button>
                </div>
            </div>`
        }
        for (var it in _links){
            $(`button.btn-danger[link-index="${it}"]`).on("click", () => {
                console.log(`Delete at index: ${it}`)
                _links.splice(it,1);
                t.set('board', 'shared', 'link', _links)
                .then(idk =>{
                    PopulateLinks(t);
                })
            })
            $(`button.btn-primary[link-index="${it}"]`).on("click", () => {
                console.log(`Select at index: ${it}`)
                selectedIndex = it;
                linkSelected(t);
                $('#linkSelectDiv').hide();
                $('#loadingDiv').show();
            })
        }
        $('#linkSelectDiv').show();
        $('#loadingDiv').hide();
    })
}

$(document).ready(function(){
    var t = window.TrelloPowerUp.iframe({
        appKey: api.key,
        appName: 'Test'
    });
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
    $('#linkName')[0].addEventListener("input", e => {
        saveCurrent(t)
    });
    $(`#backButton`).on("click", () => {
        $('#mainDiv').hide();
        PopulateLinks(t);
    })
    PopulateLinks(t);
});