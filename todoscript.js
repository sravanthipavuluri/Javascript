
var addtext = document.getElementById("txtItemName");
var addbtn = document.getElementById("btnAdd");
var incompletelist = document.getElementById("incomplete-list");
var completelist = document.getElementById("complete-list");

 

function createTaskListItem(){
	var  listItem = document.createElement("li");
	var  checkItem = document.createElement("input");
	var  lblItem = document.createElement("label");
	var  lbltext = document.createTextNode(addtext.value);
	var  taskItem = document.createElement("input");
	var  editItem = document.createElement("input");
	var  deleteItem = document.createElement("input");
	// var  hrItem = document.createElement("hr");


	checkItem.setAttribute("type","checkbox");
	lblItem.appendChild(lbltext);
	lblItem.setAttribute("class","clsedit");
	taskItem.setAttribute("type","text");
	taskItem.setAttribute("value",addtext.value);
	taskItem.setAttribute("class","clseditToggle");


	editItem.setAttribute("type","button");
	editItem.setAttribute("value","Edit");
	editItem.setAttribute("class","btnedit");
	deleteItem.setAttribute("type","button");
	deleteItem.setAttribute("value","Delete");
	deleteItem.setAttribute("class","btndelete");
	// hrItem.setAttribute("class","hrthinline");

	listItem.appendChild(checkItem);
	listItem.appendChild(lblItem);
	listItem.appendChild(taskItem);
	listItem.appendChild(editItem);
	listItem.appendChild(deleteItem);
	// listItem.appendChild(hrItem);

	return listItem;
}

function AddTask(){
	var listItem = createTaskListItem();
	incompletelist.appendChild(listItem);
	BindTasks(listItem,taskCheckCompleteList);
}

function taskCheckInCompleteList(){
	var listItem = this.parentNode;
	completelist.appendChild(listItem);
	BindTasks(listItem,taskCheckCompleteList);
}
function taskCheckCompleteList(){
	var listItem = this.parentNode;
	incompletelist.appendChild(listItem);
	BindTasks(listItem,taskCheckInCompleteList);
}


function BindTasks(listItem,tasklistName){
	var checkItem = listItem.querySelector("input[type=checkbox]");
	var EditItem = listItem.getElementsByClassName("btnedit")[0];
	var DeleteItem = listItem.getElementsByClassName("btndelete")[0];

	checkItem.onchange = tasklistName;
	EditItem.addEventListener("click",EditTask);
	DeleteItem.addEventListener("click",DeleteTask);
}


function EditTask(){
	var listItem = this.parentNode;
	var taskItem = listItem.querySelector("input[type=text]");
	var lblItem = listItem.getElementsByTagName("label")[0];

	if(taskItem.getAttribute("class")=="clseditToggle"){
		taskItem.setAttribute("class","clsedit");
		lblItem.setAttribute("class","clseditToggle");
	}else{
		taskItem.setAttribute("class","clseditToggle");
		lblItem.setAttribute("class","clsedit");
		lblItem.innerHTML=taskItem.value;
	}
}


function DeleteTask(){
	var listItem = this.parentNode;
	var listItemParent = listItem.parentNode;
	listItemParent.removeChild(listItem);
}


addbtn.addEventListener("click",AddTask);

for (var i = 0;i<incompletelist.children.length;i++) {
	BindTasks(incompletelist.children[i], taskCheckCompleteList )
}
for (var i = 0;i<completelist.children.length;i++) {
	BindTasks(completelist.children[i], taskCheckInCompleteList )
}