var cells = new Uint8Array(2048);

var cellContainer = document.querySelector("#cells");
var scriptContent = document.querySelector("#script");
var outputContent = document.querySelector("#output");
var startButton = document.querySelector("#start");
var insertButton = document.querySelector("#insert");
var inputChars = [];
var executed = true;
var executing = false;
var duration = 500;
var delay = ms => new Promise(r => setTimeout(r, ms));

script.value = "++++++++++[>+++++++>++++++++++>+++>+<<<<-]>++.>+.+++++++..+++.>++.<<+++++++++++++++.>.+++.------.--------.>+.>.";

if (location.search) {
    duration = location.search.replace(/\D+/, "") * 1 || duration;
}

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
        duration && await delay(duration);

        duration && scriptContent.focus();
        duration && scriptContent.selectionStart = commandPointer;
        duration && scriptContent.selectionEnd = commandPointer + 1;

        switch (script[commandPointer]) {
            case "+":
                cells[dataPointer]++;
                duration && cellContainer.childNodes[dataPointer].innerText = cells[dataPointer];
                break;
            case "-":
                cells[dataPointer]--;
                duration && cellContainer.childNodes[dataPointer].innerText = cells[dataPointer];
                break;
            case ">":
                duration && cellContainer.childNodes[dataPointer].className = "cell";
                dataPointer++;
                // cellContainer.childNodes[dataPointer].className = "cell active";
                duration && location.hash = `#cell-${dataPointer}`;
                break;
            case "<":
                duration && cellContainer.childNodes[dataPointer].className = "cell";
                dataPointer--;
                // cellContainer.childNodes[dataPointer].className = "cell active";
                duration && location.hash = `#cell-${dataPointer}`;
                break;
            case ",":
                var char = inputChars.pop() || prompt("input one char, cancel can input code");

                if (char === null) {
                    char = prompt("input code: (0-255)");
                    if (char === null) char = 255;
                    else char *= 1;
                } else char = char.charCodeAt();

                cells[dataPointer] = char;
                duration && cellContainer.childNodes[dataPointer].innerText = cells[dataPointer];
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
            default:
                for (var i = commandPointer + 1; i < script.length; i++) {
                    if (["+", "-", ">", "<", ",", ".", "[", "]"].indexOf(script[i]) > -1) {
                        commandPointer = i - 1;
                        break;
                    }
                }
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

    if (ctrlKey) {
        switch (keyCode) {
            case 83:
                e.preventDefault();
                if (startButton.innerText == "start") execute();
                else executing = false;
                break;
            case 45:
                inputChars = prompt("default input chars");
                if (inputChars) inputChars = inputChars.split("").reverse();
                else inputChars = [];
                break;
        }
    }
});

startButton.on("click", e => {
    if (startButton.innerText == "stop") executing = false;
    else execute();
});

insertButton.on("click", e => {
    inputChars = prompt("default input chars");
    if (inputChars) inputChars = inputChars.split("").reverse();
    else inputChars = [];
});
