import { UnitSystemBuilder } from "./modules/us.js"

const Units = Object.freeze({
    CM: "cm",
    IN: "in",
    KM: "km",
    MT: "mt",
    YD: "yd"
});

const unitsOfLength = [
    { "source": Units.CM, "target": Units.MT, "ratio": .01 },
    { "source": Units.MT, "target": Units.KM, "ratio": .001 },
    { "source": Units.KM, "target": Units.IN, "ratio":  39370.1},
    { "source": Units.KM, "target": Units.YD, "ratio": 1093.61 }
];

const conversionTree = UnitSystemBuilder(Units.CM, unitsOfLength);

document.addEventListener("DOMContentLoaded", () => {
    clearUnits();
    loadUnits();
    document.querySelector("#value").value = "";
    ["#source", "#target", "#value"].map(e => document.querySelector(e)).forEach(input => {
        input.addEventListener("change", convert);
        input.addEventListener("input", convert);
    });
});


function convert() {
    const [source, target, input, output] = ["#source", "#target", "#value", "#output"].map(e => document.querySelector(e));
    if (!input.value) {
        output.textContent = input.placeholder;
        return;
    }
    const value = Number(input.value);
    if (Number.isNaN(value)) {
        output.textContent = "Oops. It's not a number!!!";
        return;
    }

    const result = conversionTree.convert(source.value, target.value, value);
    output.textContent = (result === undefined || Number.isNaN(result))
        ? "Couldn't find conversion ratio"
        : `${value} ${source.value} <=> ${result} ${target.value}`;
}

function clearUnits() {
    const sources = [document.querySelector("#source"), document.querySelector("#target")];
    sources.map((e) => {
        while (e.options.length > 0) {
            e.remove(0);
        }
    });
}

function loadUnits() {
    const targets = [document.querySelector("#source"), document.querySelector("#target")];
    targets.map((e) => {
        conversionTree.getNodeGraph().CHILDREN.forEach((v, k) => {
            const opt = document.createElement("option");
            opt.value = k;
            opt.innerHTML = k;
            e.appendChild(opt);
        });
    });
}
