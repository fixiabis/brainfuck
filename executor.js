var cells = new Uint8Array(2048);

var cellContainer = document.querySelector("#cells");
var scriptContent = document.querySelector("#script");
var outputContent = document.querySelector("#output");
var startButton = document.querySelector("#start");
var executed = true;
var executing = false;
var duration = 100;
var delay = ms => new Promise(r => setTimeout(r, ms));

with (EventTarget) prototype.on = prototype.addEventListener;
location.hash = "#cell-0";

[...cells].map((v, i) =>
    Object.assign(document.createElement("div"), {
        id: `cell-${i}`,
        title: `cell: ${i}`,
        className: "cell",
        innerText: "0"
    })
).forEach(el => cellContainer.appendChild(el));

async function execute() {
    if (!executed) return;
    executed = false;

    var { value: script } = scriptContent;

    scriptContent.readOnly = true;
    executing = true;
    outputContent.value = "";
    startButton.innerText = "stop"

    cells.forEach((v, i) => {
        cells[i] = 0;
        cellContainer.childNodes[i].innerText = "0";
        cellContainer.childNodes[i].className = "cell";
    });

    // cellContainer.childNodes[0].className = "cell active";
    location.hash = "#cell-0";

    var dataPointer = 0;

    for (var commandPointer = 0; commandPointer < script.length; commandPointer++) {
        await delay(duration);

        scriptContent.focus();
        scriptContent.selectionStart = commandPointer;
        scriptContent.selectionEnd = commandPointer + 1;

        switch (script[commandPointer]) {
            case "+":
                cells[dataPointer]++;
                cellContainer.childNodes[dataPointer].innerText = cells[dataPointer];
                break;
            case "-":
                cells[dataPointer]--;
                cellContainer.childNodes[dataPointer].innerText = cells[dataPointer];
                break;
            case ">":
                cellContainer.childNodes[dataPointer].className = "cell";
                dataPointer++;
                // cellContainer.childNodes[dataPointer].className = "cell active";
                location.hash = `#cell-${dataPointer}`;
                break;
            case "<":
                cellContainer.childNodes[dataPointer].className = "cell";
                dataPointer--;
                // cellContainer.childNodes[dataPointer].className = "cell active";
                location.hash = `#cell-${dataPointer}`;
                break;
            case ",":
                var char = prompt("input one char, cancel can input code");

                if (char === null) char = prompt("input code: (0-255)") * 1;
                else char = char.charCodeAt();

                cells[dataPointer] = char;
                cellContainer.childNodes[dataPointer].innerText = cells[dataPointer];
                break;
            case ".":
                outputContent.value += String.fromCharCode(cells[dataPointer]);
                break;
            case "[":
                if (!cells[dataPointer]) {
                    var level = 1;

                    for (var i = commandPointer + 1; i < script.length; i++) {
                        if (script[i] == "[") level++;
                        else if (script[i] == "]") level--;

                        if (level == 0) {
                            commandPointer = i - 1;
                            break;
                        }
                    }
                }
                break;
            case "]":
                if (cells[dataPointer]) {
                    var level = 1;

                    for (var i = commandPointer - 1; i > -1; i--) {
                        if (script[i] == "]") level++;
                        else if (script[i] == "[") level--;

                        if (level == 0) {
                            commandPointer = i - 1;
                            break;
                        }
                    }
                }
                break;
        }

        if (!executing) break;
    }

    executing = false;
    executed = true;
    scriptContent.readOnly = false;
    startButton.innerText = "start"
}

window.on("keydown", e => {
    var { ctrlKey, keyCode } = e;

    if (ctrlKey && [83, 90, 93].indexOf(keyCode) > -1) {
        e.preventDefault();
        if (startButton.innerText == "start") execute();
        else executing = false;
    }
});

startButton.on("click", e => {
    if (startButton.innerText == "stop") executing = false;
    else execute();
});
