			function ResetDetails(){
				document.getElementById("txtFname").value="";
				document.getElementById("txtLname").value="";
				document.getElementById("selBranch").value="-Select Branch-";
				document.getElementById("txtEmail").value="";
				document.getElementById("txtPassword").value="";
				document.getElementById("rdMale").checked=false;
				document.getElementById("rdFemale").checked=false;


				removeAlert(document.getElementById("txtFname"),"onblur","reset");
				removeAlert(document.getElementById("txtLname"),"onblur","reset");
				removeAlert(document.getElementById("txtEmail"),"onblur","reset");
				removeAlert(document.getElementById("txtPassword"),"onblur","reset");
				removeAlert(document.getElementById("selBranch"),"onchange","reset");
				removeAlert(document.getElementById("rdFemale"),"onclick","reset");
			}
			function SubmitDetails(){
				if(ValidateDetails()){
					document.getElementById("btnSubmit").disabled=false;
					FillData();
			    }
			}

			function CreateLabelElement(genEle,alerttext){
				var eleArr;
				if(genEle.id=="rdFemale"){
					eleArr = genEle.parentNode.parentNode.querySelectorAll("label");
				}else{
					eleArr = genEle.parentNode.querySelectorAll("label");
				}
				var lbldisplay = true;
				for(var i=0;i<eleArr.length;i++){
					if(eleArr[i].style.color=="red"){
						lbldisplay = false;
					}
				}

				if(lbldisplay){
					var genalert = document.createElement("label");
					var genalerttext = document.createTextNode(alerttext);
					genalerttext.style = "color:red";
					genalert.appendChild(genalerttext);
					genalert.style = "display:block;color:red;";
					var parentEle;
					if(genEle.id=="rdFemale"){
					 	parentEle= genEle.parentNode.parentNode;
					}else{
						parentEle= genEle.parentNode;
					}
					parentEle.appendChild(genalert);
				}
			}
			function ValidateDetails(){
				//Empty Check Validations
				if(document.getElementById("txtFname").value==""){
					CreateLabelElement(document.getElementById("txtFname"),"* Enter First Name");
					return false;
				}
				if(document.getElementById("txtLname").value==""){
					CreateLabelElement(document.getElementById("txtLname"),"* Enter Last Name");
					return false;
				}
				if(document.getElementById("selBranch").value=="-Select Branch-"){
					CreateLabelElement(document.getElementById("selBranch"),"* Select Branch");
					return false;
				}
				if(document.getElementById("txtEmail").value==""){
					CreateLabelElement(document.getElementById("txtEmail"),"* Enter Email");
					return false;
				}
				if(document.getElementById("txtPassword").value==""){
					CreateLabelElement(document.getElementById("txtPassword"),"* Enter Password");
					return false;
				}
				if(!document.getElementById("rdMale").checked){
					if(!document.getElementById("rdFemale").checked){
						CreateLabelElement(document.getElementById("rdFemale"),"* Select Gender");
						return false;
					}
				}

				//Length Validations
				if(document.getElementById("txtFname").value.Length>6){
					CreateLabelElement(document.getElementById("txtFname"),"* First Name Max Length Exceeded!");
					return false;
				}
				if(document.getElementById("txtLname").value.Length>6){
					CreateLabelElement(document.getElementById("txtLname"),"* Last Name Max Length Exceeded!");
					return false;
				}

				//PassWord Check
				re = /[0-9]/;
				if(!re.test(document.getElementById("txtPassword").value)) {
					CreateLabelElement(document.getElementById("txtPassword"),"* Password must contain at least one number (0-9)!");
					return false;
				}
				re = /[a-z]/;
				if(!re.test(document.getElementById("txtPassword").value)) {
					CreateLabelElement(document.getElementById("txtPassword"),"* Password must contain at least one lowercase letter (a-z)!");
					return false;
				}
				re = /[A-Z]/;
				if(!re.test(document.getElementById("txtPassword").value)) {
					CreateLabelElement(document.getElementById("txtPassword"),"* password must contain at least one uppercase letter (A-Z)!");
					return false;
				}

				//Email Check
				re = /\w+@\w+\.\w+/;
				if(!re.test(document.getElementById("txtEmail").value)) {
					CreateLabelElement(document.getElementById("txtEmail"),"* Email must contain @ and . In proper position!");
					return false;
				}
				document.getElementById("btnSubmit").disabled=false;

				return true;
			}
			
			function FillData(){
				var gendertext;
				if(document.getElementById("rdMale").checked){
					gendertext = document.getElementById("rdMale").value;
				}else if(document.getElementById("rdFemale").checked){
					gendertext = document.getElementById("rdFemale").value;
				}
				var frameDataObj = {
					firstName :  document.getElementById("txtFname").value,
					lastName : document.getElementById("txtLname").value,
					branch : document.getElementById("selBranch").value,
					email : document.getElementById("txtEmail").value,
					password : document.getElementById("txtPassword").value,
					gender : gendertext
				};
				localStorage.frameDataObj = frameDataObj;
				localStorage.setItem(frameDataObj.firstName, JSON.stringify(frameDataObj));
			
				if(localStorage.getItem(frameDataObj.firstName)!=undefined){
					document.getElementById("btnSubmit").disabled=true;
					ResetDetails();
				}
				// var test2 = localStorage.getItem(frameDataObj.firstName);
				// test = JSON.parse(test2);
				// console.log(test); 
			}
			function checkReplica(){
				if(localStorage.getItem(document.getElementById("txtFname").value)!=undefined){
					alert("We Have Data With This Name Aleady...");
					document.getElementById("txtFname").value="";
					document.getElementById("txtFname").focus();
				}
			}
			function removeAlert(genEle,eventtext,from){
				if(from!="reset"){
					if(eventtext=="onblur"){
						if(genEle.value!=""){
							var parentEle = genEle.parentNode;
							var eleArr = parentEle.querySelectorAll("label");
							if(eleArr.length>0 && eleArr.length==2){
								parentEle.removeChild(eleArr[1]);
							}
					   }
				   }
				   else if(eventtext=="onchange"){
				   		if(genEle.value!="-Select Branch-"){
							var parentEle = genEle.parentNode;
							var eleArr = parentEle.querySelectorAll("label");
							if(eleArr.length>0 && eleArr.length==2){
								parentEle.removeChild(eleArr[1]);
							}
					   }
				   }
				   else if(eventtext=="onclick"){

				   	 if(document.getElementById("rdMale").checked || document.getElementById("rdFemale").checked){
						var parentEle = document.getElementById("rdFemale").parentNode.parentNode;
						var eleArr = parentEle.querySelectorAll("label");
						if(eleArr.length>0 && eleArr.length==3){
							parentEle.removeChild(eleArr[2]);
						}
					 }
				   }
				}else{
					if(eventtext=="onblur"){
						if(genEle.value==""){
							var parentEle = genEle.parentNode;
							var eleArr = parentEle.querySelectorAll("label");
							if(eleArr.length>0 && eleArr.length==2){
								parentEle.removeChild(eleArr[1]);
							}
					   }
				   }
				   else if(eventtext=="onchange"){
				   		if(genEle.value=="-Select Branch-"){
							var parentEle = genEle.parentNode;
							var eleArr = parentEle.querySelectorAll("label");
							if(eleArr.length>0 && eleArr.length==2){
								parentEle.removeChild(eleArr[1]);
							}
					   }
				   }
				   else if(eventtext=="onclick"){
				   	 //if(document.getElementById("rdMale").checked || document.getElementById("rdFemale").checked){
						var parentEle = document.getElementById("rdFemale").parentNode.parentNode;
						var eleArr = parentEle.querySelectorAll("label");
						if(eleArr.length>0 && eleArr.length==3){
							parentEle.removeChild(eleArr[2]);
						}
					 //}
				   }
				}
			}

			function clearLocalStorage(){
				localStorage.clear();

			}
			
