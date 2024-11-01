
const Units = Object.freeze({
    BU: Symbol("bu"), //Base Unit for this system
    CM: Symbol("cm"),
    IN: Symbol("in"),
    KM: Symbol("km"),
    MT: Symbol("mt"),
    YD: Symbol("yd")
});

class tuple {
    #key = undefined;
    #value = undefined;

    constructor(key, value) {
        this.#key = key;
        this.#value = value;
    }

    get source() {
        return `${this.#key.description}`;
    }

    get target() {
        return `${this.#value.description}`;
    }
}

function searchBuilder(uMap) {
    const umap = uMap;
    mapSearch = (key, value) => {
        if (key === value) return 1;
        for (const [k, v] of umap.entries()) {
            if (k.source === key && k.target == value) {
                return v;
            } else if (k.target === key && k.source === value) {
                return 1 / v;
            }
        }
        return undefined;
    }
    return mapSearch;
}

function isNumber(value) {
    return typeof value === 'number';
}

const units = [Units.CM, Units.IN, Units.KM, Units.MT, Units.YD];

const unitRatios = new Map();
unitRatios.set(new tuple(Units.KM, Units.CM), 100000);
unitRatios.set(new tuple(Units.IN, Units.CM), 2.54);
unitRatios.set(new tuple(Units.KM, Units.IN), 39370.1);
unitRatios.set(new tuple(Units.KM, Units.MT), 1000);
unitRatios.set(new tuple(Units.IN, Units.MT), .0254);
unitRatios.set(new tuple(Units.MT, Units.CM), 100);
unitRatios.set(new tuple(Units.YD, Units.KM), 1.333333);



const unitsOfLength = [
    { "source": Units.BU, "target": Units.CM, "ratio": 1 },
    { "source": Units.CM, "target": Units.MT, "ratio": 100 },
    { "source": Units.MT, "target": Units.KM, "ratio": 1000 },
    { "source": Units.CM, "target": Units.IN, "ratio": 0.393700787 },
    { "source": Units.KM, "target": Units.YD, "ratio": 1.333333 }
];

const PARENT = "parent";
const CHILDREN = "children";
const RATIO = "ratio";
const BASIS = "basis";

function configureUnitSystem(baseunit, ratio, basis) {
    const nodeGraph = { BASEUNIT: baseunit, RATIO: ratio, BASIS: basis, CHILDREN: new Map() };

    const helpers = {

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

    return helpers;
}

function CreateConversionTree() {
    let us = configureUnitSystem(Units.BU, 1, Units.CM);

    unitsOfLength.map((e) => {
        us.addMeasure(e.target, e.source, e.ratio);
    });
    let x = us.getNodeGraph();

    const s = Units.YD;
    const t = Units.MT;
    const v = 1;
    
    console.log(`${s.description} to ${t.description} of ${v} is ${us.convert(s, t, v)}`);

    us.changeBasis(Units.YD);
    console.log(`${s.description} to ${t.description} of ${v} is ${us.convert(s, t, v)}`);
}

function FindPath(source, target) {
    unitsOfLength.map((e) => {
        console.log(`e is ${e.source.description} ${e.target.description} ${e.ratio}`);
    });
}

let searchFx = searchBuilder(unitRatios);

document.addEventListener("DOMContentLoaded", () => {
    clearUnits();
    loadUnits();
    document.querySelector("#value").value = "";
    ["#source", "#target", "#value"].map(e => document.querySelector(e)).forEach(input => {
        input.addEventListener("change", convert);
        input.addEventListener("input", convert);
    });
    CreateConversionTree();
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

    const multiplier = searchFx(source.value, target.value);
    if (multiplier === undefined) {
        output.textContent = "Couldn't find conversion ratio";
        return;
    }
    const result = value * multiplier;
    output.textContent = `${value} ${source.value} <=> ${result} ${target.value}`;
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
        [...units].map((d) => {
            const opt = document.createElement("option");
            opt.value = d.description;
            opt.innerHTML = d.description;
            e.appendChild(opt);
        });
    });
}
