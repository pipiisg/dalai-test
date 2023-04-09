//1) Alice types '[query]' into google. The following is a list of 3 questions that she might want answered.
//2) See which one user wants/write own prompt
//3) Ask about length, format (bullet points, paragraph) tone, style, level of info (8 year old, ms, hs, college, grad...)
//4) A possible format of a ____ is the following:
//5) Give prompt as list

const paragraph = document.getElementById("paragraph");
const input = document.getElementById("inputBox");
var socket = io();

class Search
{
    constructor()
    {
        this.prompt = prompt;
        this.stage = 0; //0: No question. 1: received question, waiting for dalai answer. 2: Waiting for user selections 3: Dalai is typing -> 0
        this.receivedText = "";
        this.waitParagraph = document.createElement("p")
        this.waitParagraph.innerText = "Please be patient as the LLM thinks."
    }
    reset()
    {
        this.prompt = prompt;
        this.stage = 0;
        this.receivedText = "";
    }
    stage1(question)
    {
        this.stage = 1;
        const query = {
            models: ["alpaca.7B"],
            prompt: "Alice types 'climate change' into Google. The following is a list of 3 questions that she might want answered:\n1. What is climate change?\n2. What are the causes of climate change?\n3. What can I do to prevent climate change?\n"
                +"Alice types 'internet' into Google. The following is a list of 3 questions that she might want answered:\n1. What is the internet?\n2. What are some statistics regarding internet usage?\n3. What is the history of the internet?" 
                +"\nAlice types '"+question+"' into Google. The following is a list of 3 questions that she might want answered:\n",
            n_predict: 128
        }
        this.promptLength = query.prompt.length
        socket.emit("query", query);

        this.div = document.createElement("div")
        this.div.className = "question"
        document.body.appendChild(this.div);
        
        let header = document.createElement("h1")
        header.innerText = question.charAt(0).toUpperCase()+question.slice(1);
        this.div.appendChild(header);

        this.lengthDiv = document.createElement("div");
        this.lengthDiv.className = "row";
        let labelLength = document.createElement("label");
        labelLength.innerText = "How long should the answer be?"
        this.selectLength = document.createElement("select");
        this.selectLength.name = "lengthSelector"
        const lengths = ["100", "300", "500"];
        for (const a of lengths){
            let option = document.createElement("option");
            option.value = a;
            option.innerText = a + " words"
            this.selectLength.appendChild(option);
        }

        this.lengthDiv.appendChild(labelLength);
        this.lengthDiv.appendChild(this.selectLength);
        this.div.appendChild(this.lengthDiv);
        this.div.appendChild(this.waitParagraph);
    }
    stage2()
    {
        this.stage = 2;

        this.div.removeChild(this.waitParagraph);
        let responses = this.receivedText.slice(this.promptLength-1).split("\n").splice(1);
        this.questionOptions = responses.map((s)=> s.slice(3));
        this.receivedText = "";
        this.questionDiv = document.createElement("div");
        this.questionDiv.className = "row";
        let labelQ = document.createElement("label");
        labelQ.innerText = "Which question do you wanted answered?"
        this.selectQ = document.createElement("select");
        this.selectQ.name = "qSelector"
        for (const a of this.questionOptions){
            let option = document.createElement("option");
            option.value = a;
            option.innerText = a;
            this.selectQ.appendChild(option);
        }
        this.questionDiv.appendChild(labelQ)
        this.questionDiv.appendChild(this.selectQ);
        this.div.appendChild(this.questionDiv);
        input.value = "Press submit to generate prompt"
        
    }
    stage3()
    {
        this.stage = 3;
        let questionToAnswer = this.selectQ.value;
        let length = this.selectLength.value;

        this.div.removeChild(this.questionDiv);
        this.div.removeChild(this.lengthDiv);

        this.div.appendChild(this.waitParagraph);
        let returnPrompt = `Topic: ${questionToAnswer}\nLength: ${length} words\nStyle: Writen for an 8 year old.`
        let returnParagraph = document.createElement("p")
        returnParagraph.innerText = returnPrompt;
        this.div.appendChild(returnParagraph);
        this.stage = 0;

    }
    inputSubmission(val)
    {
        switch (this.stage) {
            case 0:
                this.stage1(val);
                break;
            case 1:
                
                break;
            case 2:
                this.stage3()
                break;
        
            case 3:
                
                break;
        }
    }
    receiveAnswer(str)
    {
        switch (this.stage) {
            case 0:
                break;
            case 1:
                if (str == "\n\n<end>")
                {
                    this.stage2();
                }
                else
                    this.receivedText += str;
                break;
            case 2:
                
                break;
        
            case 3:
                
                break;
        }
    }
    

}

const activeSearch = new Search();
function submission(){
    activeSearch.inputSubmission(input.value)
    input.value = "";
}
socket.on("answer", (str)=>{
    activeSearch.receiveAnswer(str)
    if (str != "\n\n<end>")
        console.log(str)
})