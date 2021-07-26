function addElement(level, tag){
    const parent = document.getElementById(level);
    const elem = document.createElement(tag);
    parent.appendChild(elem);
    return elem;
}

function addText(level, text, tag = "p"){
    const elem = addElement(tag, level);
    elem.innerHTML = text;
    return elem;
}

function addButton(level, text, func){
    const elem = addText(level, text, "button");
    elem.addEventListener("click", func);
    return elem;
}

function clear(level){
    let shouldClear = false;
    let containers = document.getElementsByClassName("container");
    for(cont of containers){
        if (cont.className === level){
            shouldClear = true;
        }
        if (shouldClear){
            cont.innerHTML = "";
        }
    }
}

function interpret(program){
    console.log(program);
}