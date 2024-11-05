
const Units = Object.freeze({
    CM: "cm",
    IN: "in",
    KM: "km",
    MT: "mt",
    YD: "yd"
});

const units = [Units.CM, Units.IN, Units.KM, Units.MT, Units.YD];

const unitsOfLength = [
    { "source": Units.CM, "target": Units.MT, "ratio": 100 },
    { "source": Units.MT, "target": Units.KM, "ratio": 1000 },
    { "source": Units.CM, "target": Units.IN, "ratio": 0.393700787 },
    { "source": Units.KM, "target": Units.YD, "ratio": 1.333333 }
];

const PARENT = "parent";
const CHILDREN = "children";
const RATIO = "ratio";

function configureUnitSystem(baseunit) {
    const childMap = new Map();
    childMap.set(baseunit, 1);
    const nodeGraph = { BASEUNIT: baseunit, RATIO: 1, CHILDREN: childMap };

    const controller = {

        changeBasis: (unitIdentifier) => {
            const unitIdentifierInChildList = nodeGraph.CHILDREN.get(unitIdentifier);
            if (unitIdentifierInChildList !== undefined) {
                nodeGraph.BASEUNIT = unitIdentifier;
                nodeGraph.RATIO = 1 / unitIdentifierInChildList;
            }

        },

        addMeasure: (unit, parent, ratio) => {
            if (parent === nodeGraph.BASEUNIT) {
                nodeGraph.CHILDREN.set(unit, ratio);
                return;
            }

            const parentNodeInChildList = nodeGraph.CHILDREN.get(parent);
            if ((parentNodeInChildList !== undefined)) {
                nodeGraph.CHILDREN.set(unit, ratio * parentNodeInChildList);
            }
        },

        convert: (source, target, val) => {
            const sourceRatioInChildList = nodeGraph.CHILDREN.get(source);

            if ((sourceRatioInChildList !== undefined)) {
                const sourceRatio = sourceRatioInChildList * nodeGraph.RATIO;
                const targetRatioInChildList = nodeGraph.CHILDREN.get(target);
                const targetRatio = targetRatioInChildList * nodeGraph.RATIO;
                return val * (sourceRatio / targetRatio);
            }
        },

        getNodeGraph: () => {
            return nodeGraph;
        }
    };

    return controller;
}

function CreateConversionTree() {
    let us = configureUnitSystem(Units.CM);

    unitsOfLength.map((e) => {
        us.addMeasure(e.target, e.source, e.ratio);
    });
    return us;
}

const conversionTree = CreateConversionTree();

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
        units.forEach((d) => {
            const opt = document.createElement("option");
            opt.value = d;
            opt.innerHTML = d;
            e.appendChild(opt);
        });
    });
}
