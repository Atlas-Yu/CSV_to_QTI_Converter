// Atlas Yu zihan_yu@brown.edu

// Convert an array parsed from CSV into a QTI test
function parseQTITest(data, name){
	var xmlDoc = document.implementation.createDocument("", "");
	
	var qtiEm = xmlDoc.createElement("questestinterop");
	
	var assessmentEm = xmlDoc.createElement("assessment");	
	assessmentEm.setAttribute("title", name);
	assessmentEm.setAttribute("ident", "A1001");
	qtiEm.appendChild(assessmentEm);
	
	var sectionEm = xmlDoc.createElement("section");
	sectionEm.setAttribute("title", "Main");
	sectionEm.setAttribute("ident", "S1002");
	assessmentEm.appendChild(sectionEm);
	
	var n = 3
	
	for(let i = 0; i < data.length; i++){
		question = toSingleChoice(data[i], n);
		item = question.QTI;
		sectionEm.appendChild(item);
		n += question.increment;
	}
	
	return qtiEm
}

// Convert a single line of CSV to a QTI question Item 
function toSingleChoice(data, n){
  console.log("Creating single choice for n=" + n);
	var questions = data.question.split(/^[a-zA-Z]\)\s*/gm);
	var xmlDoc = document.implementation.createDocument("", "");
	
	var id = 1000 + n;
	var que_id = new Array(questions.length); //  Store question ids
	que_id[0] = "QUE_"+ id + "RL";
	id++;
	
	var itemEm = xmlDoc.createElement("item");
	itemEm.setAttribute("title", "Q" + n);
	itemEm.setAttribute("ident", "QUE_" + id);
	id++;
	
	var presentationEm = xmlDoc.createElement("presentation");
	itemEm.appendChild(presentationEm);
	
	var materialEm = xmlDoc.createElement("material");
	presentationEm.appendChild(materialEm);
	
	var mattextEm = xmlDoc.createElement("mattext");
	mattextEm.setAttribute("texttype", "text/html");
	materialEm.appendChild(mattextEm);
	
	var description = xmlDoc.createCDATASection(questions[0]);
	mattextEm.appendChild(description);
	
	var response_lidEm = xmlDoc.createElement("response_lid");
	response_lidEm.setAttribute("ident", que_id);
	response_lidEm.setAttribute("rcardinality", "Single");
	response_lidEm.setAttribute("rtiming", "No");
	presentationEm.appendChild(response_lidEm);
	
	var render_choiceEM = xmlDoc.createElement("render_choice");
	response_lidEm.appendChild(render_choiceEM);
	
	// Generate choices for the question
	for(let i = 1; i < questions.length; i++){
		
		que_id[i] = "QUE_"+ id + "A" + i;
		id++;
		
		var response_labelEm = xmlDoc.createElement("response_label");
		response_labelEm.setAttribute("ident", que_id[i]);
		render_choiceEM.appendChild(response_labelEm);
		id++;
		
		var materialEm2 = xmlDoc.createElement("material");
		response_labelEm.appendChild(materialEm2);
		
		var mattextEm2 = xmlDoc.createElement("mattext");
		mattextEm.setAttribute("texttype", "text/html");
		materialEm2.appendChild(mattextEm2); 
		
		var choice = xmlDoc.createCDATASection(questions[i]);
		mattextEm2.appendChild(choice);
		
	}
	// Generate responses
	var ans = getAnswers(data.answer)
	
	var resprocessingEm = xmlDoc.createElement("resprocessing");
	itemEm.appendChild(resprocessingEm);
	
	var outcomesEm = xmlDoc.createElement("outcomes");
	resprocessingEm.appendChild(outcomesEm);
	
	var decvarEm = xmlDoc.createElement("decvar");
	decvarEm.setAttribute("vartype", "Decimal");
	decvarEm.setAttribute("defaultval", "0");
	decvarEm.setAttribute("varname", "que_score");
	outcomesEm.appendChild(decvarEm);
	
	for(let i = 1; i < questions.length; i++){
		var respconditionEm = xmlDoc.createElement("respcondition");
		resprocessingEm.appendChild(respconditionEm);
		
		var conditionvarEm = xmlDoc.createElement("conditionvar");
		respconditionEm.appendChild(conditionvarEm);
		
		var varequalEm = xmlDoc.createElement("varequal");
		varequalEm.setAttribute("respident", que_id[0]);
		conditionvarEm.appendChild(varequalEm);
		
		var queIdTx = xmlDoc.createTextNode(que_id[i]);
		varequalEm.appendChild(queIdTx);
		
		var setvarEm = xmlDoc.createElement("setvar");
		setvarEm.setAttribute("varname", "que_score");
		
		// Decide if it's the correct answer
		if(ans.has(i)){
			setvarEm.setAttribute("action", "Set");
			let ansVal = xmlDoc.createTextNode(1.00);
			setvarEm.appendChild(ansVal);
		}else{
			setvarEm.setAttribute("action", "Add");
			let ansVal = xmlDoc.createTextNode(0);
			setvarEm.appendChild(ansVal);
		}
		
		respconditionEm.appendChild(setvarEm);
	}	
	
	return {QTI: itemEm, increment: id - 1000 - n};
}

// Get the set of correct answers from a string
function getAnswers(data){
	data.trim();
	data.toLowerCase();
	ans = data.split(",");
	let res = new Set();
	
	for(let i = 0; i < ans.length; i++){
		let num = ans[i].charCodeAt(0) - "a".charCodeAt(0) + 1;
		res.add(num);
	}	
	
	return res	
}


