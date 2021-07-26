function parse(program){
    program = program.split("\n");
    program = program.map(line => {
        const idx = line.indexOf("--");
        if (idx != -1){
            line = line.slice(0, idx);
        }
        line = line.trim();
        return line;
    });
    return program;
}

class Interpreter{
    constructor(program){
        this.program = parse(program);
        this.ip = 0;
        this.line = "";
        this.stack = [];
        this.vars = [
            {}, // global
            {}, // act
            {}, // scene
            {}, // clip
        ];
        this.triggers = {};
        this.scope = 0;
        this.labels = {};
        this.isRunning = true;
        this.hasError = false;
        this.currentLevel = "prelude";
        this.run();
    }
    // public
    setTrigger(name, f){
        this.triggers[name] = f;
    }
    resume(){
        this.isRunning = true;
        this.run();
    }
    //setStage(blockType, name)
    // dom manipulation
    clearDom(){
        let shouldClear = false;
        let containers = document.getElementsByClassName("container");
        for(let cont of containers){
            if (cont.id === this.currentLevel){
                shouldClear = true;
            }
            if (shouldClear){
                cont.innerHTML = "";
            }
        }
    }
    addElement(tag){
        let parent = document.getElementById(this.currentLevel);
        if(!parent){parent = document.getElementById("clip");}
        const elem = document.createElement(tag);
        parent.appendChild(elem);
        return elem;
    }
    addText(text, tag = "p"){
        const elem = this.addElement(tag);
        elem.innerHTML = text;
        return elem;
    }
    addButton(text, func){
        const elem = this.addText(text, "button");
        elem.addEventListener("click", func);
        return elem;
    }
    // utils
    error(message){
        // figure out line number
        this.hasError = true;
        console.error(message);
    }
    clearVars(){
        this.vars = this.vars.slice(0, this.scope + 1);
        while(this.vars.length < this.scope + 1){this.vars.push({});}
    }
    startsWith(start){
        return this.line.indexOf(start) === 0;
    }
    push(val, type){
        this.stack.push({val, type});
    }
    runFrom(idx){
        this.ip = idx;
        this.isRunning = true;
        this.run();
    }
    internalJump(label){
        // this is a bad solution, replace
        if(!this.labels[label]){
            this.labels[label] = this.program.findIndex(line => line.includes(label) && !line.includes("jump"));
        }
        this.ip = this.labels[label];
    }
    tail(offset = -1){
        return this.stack[this.stack.length + offset];
    }
    // operations
    block(){
        const blockTypes = ["act", "scene", "clip", "label", "block", "endblock"];
        const type = blockTypes.find(type => this.startsWith(type));
        if(!type) return false;
        const idx = blockTypes.indexOf(type) + 1;
        if(idx < 4){this.scope = idx;}
        else if(type === "block"){this.scope++;}
        else if(type === "endblock"){this.scope--;}
        this.currentLevel = type;
        this.clearDom();
        this.clearVars();
        return true;
    }
    string(){
        if(!this.startsWith("string")){return false;}
        let line = this.line;
        line = line.slice(6).trim().replace('"', '').replace('"', '');
        this.push(line, "string");
        return true;
    }
    number(){
        if(!this.startsWith("number")){return false;}
        let line = this.line;
        line = line.slice(6).trim();
        this.push(Number(line), "number");
        return true;
    }
    write(){
        const lineTypes = ["h1", "h2", "h3", "h4", "h5", "p"];
        const tag = lineTypes.find(start => this.startsWith(start));
        if(!tag)return false;
        this.addText(this.stack.pop().val, tag);
        return true;
    }
    option(){
        if(!this.startsWith("option")) return false;
        const idx = this.ip;
        this.addButton(this.stack.pop().val, ()=>this.runFrom(idx));
        do{
            this.line = this.program[this.ip];
            this.ip++;
        }
        while(!this.startsWith("endop"));
        this.addElement("br");
        return true;
    }
    stop(){
        if(!this.startsWith("stop")) return false;
        this.isRunning = false;
        return true;
    }
    jump(){
        const type = ["jump", "tjump", "fjump"].find(type => this.startsWith(type));
        if(!type)return false;
        let label = this.line.split(" ")[1];
        let val;
        if(type === "tjump"){
            val = this.stack.pop().val;
            if(!val)return true;
        }
        else if(type === "fjump"){
            val = this.stack.pop().val;
            if(!!val)return true;
        }
        this.internalJump(label);
        return true;
    }
    variable(){
        const type = ["def", "set", "get"].find(type => this.startsWith(type));
        if(!type)return false;
        const args = this.line.split(" ");
        const varName = args[1];
        if(type === "def"){
            let varType = args[2];
            let val = "";
            if(varType === "number") val = 0;
            this.vars[this.scope][varName] = {val, type: varType}
        }
        else{
            // find the variable by name
            let scope;
            for (let i = this.vars.length - 1; i > -1; i--) {
                const temp = this.vars[i];
                if (temp[varName]){
                    scope = temp;
                    break;
                }
            }
            if(!scope){
                this.error("cannot locate variable " + varName);
                return true;
            }
            if(type === "set"){
                const val = this.stack.pop();
                scope[varName] = val;
            }
            else{
                const {val, type} = scope[varName];
                this.push(val, type);
            }
        }
        return true;
    }
    unary(){
        const unTypes = ["del", "not", "dupe", "neg", "inc", "dec"];
        const type = unTypes.find(type => this.startsWith(type));
        if(!type)return false;
        let idx = unTypes.indexOf(type);
        if (idx > 2 && this.tail().type !== "number"){
            this.error(type + " operates on numbers not " + this.stack[-1].type);
            return true;
        }
        switch(type){
            case "neg":
                this.tail().val = -this.tail().val;
                break;
            case "not":
                this.tail().val = !this.tail().val;
                this.tail().type = "bool";
                break;
            case "inc":
                this.tail().val++;
                break;
            case "dec":
                this.tail().val--;
                break;
            case "dupe":
                const {val, type} = this.tail();
                this.push(val, type);
                break;
            case "del":
                this.stack.pop();
                break;
            default:
                break;
        }
        return true;
    }
    binary(){
        const binTypes = ["concat", "add", "sub", "mul", "div", "mod", "eq", "lesseq", "greateq", "less", "great"];
        const type = binTypes.find(type => this.startsWith(type));
        //console.log(type);
        if(!type)return false;
        let idx = binTypes.indexOf(type);
        let var2 = this.stack.pop();
        let var1 = this.stack.pop();
        if(type === "concat"){
            this.push("" + var1.val + var2.val, "string");
        }
        else if(type === "eq"){
            this.push(var1.val === var2.val, "bool");
        }
        else{
            if(var1.type !== "number" || var2.type !== "number"){
                this.error("both operands to " + type + " must be numbers");
                return true;
            }
            let val = 0;
            switch(type){
                case "add":
                    val = var1.val + var2.val;
                    break;
                case "sub":
                    val = var1.val - var2.val;
                    break;
                case "mul":
                    val = var1.val * var2.val;
                    break;
                case "div":
                    val = var1.val / var2.val;
                    break;
                case "mod":
                    val = var1.val % var2.val;
                    break;
                case "less":
                    val = var1.val < var2.val;
                    break;
                case "great":
                    val = var1.val > var2.val;
                    break;
                case "lesseq":
                    val = var1.val <= var2.val;
                    break;
                case "greateq":
                    val = var1.val >= var2.val;
                    break;
                default:
                    break;
            }
            let varType = "number";
            if(idx > 6){varType = "bool"}
            this.push(val, varType);
        }
        return true;
    }
    list(){
        const isList = (offset) => {
            if (this.tail(offset).type !== "list"){
                this.error("list method invoked on non list type " + this.tail().type);
                return false;
            }
            return true;
        }
        if(!this.startsWith("list")) return false;
        const s = this.line.split(" ");
        const op = s[1];
        switch(op){
            case "new":{
                this.push([], "list");
                break;}
            case "push":{
                if (!isList(-2)){return true;}
                let val = this.stack.pop();
                this.tail().val.push(val);
                break;}
            case "pop":{
                if (!isList(-1)){return true;}
                if (this.tail().val.length === 0){
                    this.error("cannot pop from empty list");
                    return true;
                }
                const {val, type} = this.tail().val.pop();
                this.push(val, type);
                break;}
            case "get":{
                if (!isList(-2)){return true;}
                if (this.tail().type !== "number"){
                    this.error("cannot get from non number index");
                    return true;
                }
                const list = this.tail(-2).val;
                let idx = Math.floor(this.stack.pop().val);
                if (idx < 0){
                    idx = list.length + idx;
                }
                if (idx >= list.length){
                    this.error("list index out of range. tried to access index " + idx + " of length " + list.length + " list.");
                    return true;
                }
                const {val, type} = list[idx];
                this.push(val, type);
                break;}
            case "set":{
                if (!isList(-3)){return true;}
                if (this.tail(-2).type !== "number"){
                    this.error("cannot set at non number index");
                    return true;
                }
                const list = this.tail(-3).val;
                let idx = Math.floor(this.tail(-2).val);
                if (idx < 0){
                    idx = list.length + idx;
                }
                if (idx >= list.length){
                    this.error("list index out of range. tried to access index " + idx + " of length " + list.length + " list.");
                    return true;
                }
                const obj = this.stack.pop();
                this.stack.pop();
                list[idx] = obj;
                break;}
            case "insert":{
                if (!isList(-3)){return true;}
                if (this.tail(-2).type !== "number"){
                    this.error("cannot insert at non number index");
                    return true;
                }
                const list = this.tail(-3).val;
                let idx = Math.floor(this.tail(-2).val);
                if (idx < 0){
                    idx = list.length + idx;
                }
                if (idx >= list.length){
                    this.error("list index out of range. tried to access index " + idx + " of length " + list.length + " list.");
                    return true;
                }
                const obj = this.stack.pop();
                this.stack.pop();
                list.splice(idx, 0, obj);
                break;}
            case "remove":{
                if (!isList(-2)){return true;}
                if (this.tail().type !== "number"){
                    this.error("cannot remove from non number index");
                    return true;
                }
                const list = this.tail(-2).val;
                let idx = Math.floor(this.stack.pop().val);
                if (idx < 0){
                    idx = list.length + idx;
                }
                if (idx >= list.length){
                    this.error("list index out of range. tried to access index " + idx + " of length " + list.length + " list.");
                    return true;
                }
                list.splice(idx, 1);
                break;}
            case "find":{
                if(!isList(-2)) return true;
                const list = this.tail(-2).val;
                const lookFor = this.stack.pop();
                let idx = list.findIndex(obj => obj.val === lookFor.val);
                this.push(idx, "number");
                break;}
            case "length":{
                if (!isList(-1)){return true;}
                this.push(this.tail().val.length, "number");
                break;}
            default:
                this.error("list has no method '" + op + "'");
                break;
        }
        return true;
    }
    trigger(){
        if(!this.startsWith("trigger")) return false;
        const s = this.line.split(" ");
        const name = s[1];
        if(this.triggers[name]){
            this.triggers[name]();
        }
        else{
            this.error("no trigger of name " + name + " exists");
        }
        return true;
    }
    run(){
        while(this.isRunning){
            if(this.ip >= this.program.length || this.hasError){this.isRunning = false; break;}
            this.line = this.program[this.ip];
            this.ip++;
            if(this.line === ""){} // noop
            else if(this.block()){}
            else if(this.string()){}
            else if(this.number()){}
            else if(this.write()){}
            else if(this.option()){}
            else if(this.stop()){}
            else if(this.jump()){}
            else if(this.unary()){}
            else if(this.binary()){}
            else if(this.variable()){}
            else if(this.list()){}
            else if(this.trigger()){}
            else{
                this.error("command not recognized: " + this.line);
            }
        }
        console.log(this.stack);
        //console.log(this.vars);
    }
}

const program = `
    act zero
    string "Prologue" -- pushes the string "Prologue" to the stack
    h1 -- the line commands (h1 - h5 and p) pop a value from the stack and print it as if a character is saying it. can be provided with an optional character argument
    -- empty lines are treated as noops but are used to make the ir a little more readable
    scene zero_only
    -- instructions could go here
    clip zero_only_first
    string "On your walk home from Ethical Corp™ you are filled with a dawning horror as you realize... You left your thermos behind! And it's after hours!"
    h3 
    string "Flustered you try to remember your first name:"
    p
    string "Winefred"
    option
        jump zero_only_middle
    endop
    string "Tyra"
    option
        jump zero_only_middle
    endop
    string "Marla"
    option
        jump zero_only_middle
    endop
    stop
    clip zero_only_middle
    string "Good job! After some more consideration you remember your middle name:"
    h3
    list new
    number 10
    list push
    string "yo"
    list push
    number 0
    list get
    del
    number 1
    string "sup"
    list insert
    string "sup"
    list find
    p
    trigger trig
    `;

const interp = new Interpreter(program);
interp.setTrigger("trig", ()=>console.log("howdy"));