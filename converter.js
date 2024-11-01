
const Units = Object.freeze({
    BU: Symbol("bu"), //Base Unit for this system
    CM: Symbol("cm"),
    INCH: Symbol("in"),
    KM: Symbol("km"),
    MT: Symbol("mt")
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

const units = [Units.CM, Units.INCH, Units.KM, Units.MT];

const unitRatios = new Map();
unitRatios.set(new tuple(Units.KM, Units.CM), 100000);
unitRatios.set(new tuple(Units.INCH, Units.CM), 2.54);
unitRatios.set(new tuple(Units.KM, Units.INCH), 39370.1);
unitRatios.set(new tuple(Units.KM, Units.MT), 1000);
unitRatios.set(new tuple(Units.INCH, Units.MT), .0254);
unitRatios.set(new tuple(Units.MT, Units.CM), 100);



const recurseUnits = [
    {"source": Units.BU, "target": Units.CM, "ratio": 1},
    {"source": Units.CM, "target": Units.MT, "ratio": 100},
    {"source": Units.MT, "target": Units.KM, "ratio": 1000},
    {"source": Units.CM, "target": Units.INCH, "ratio": 0.393700787}
];

const PARENT = "parent";
const CHILDREN = "children";
const RATIO = "ratio";

function CreateConversionTree() {
    let node = {PARENT: Units.BU, RATIO: 1, CHILDREN: []};

    function findNode(n, value) {
        if (Object.keys(n).length === 0) {
            return undefined;
        }
        if (n.PARENT === value) {
            console.log(`Found ${n.PARENT.description}`);
            return n;
        } else {
            n.CHILDREN.map((e) => findNode(e, value));
        }
    };

    recurseUnits.map((e) => {
        const foundNode = findNode(node, e.source);
        if (foundNode !== undefined) {
            node.CHILDREN.push({PARENT: e.target, RATIO: e.ratio, CHILDREN: []});
        }
        console.log(`Tree is ${node}`);
    });
}

function FindPath(source, target) {
    recurseUnits.map((e) => {
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
    const source = document.querySelector("#source");
    const sourceValue = source.value;

    const target = document.querySelector("#target");
    const targetValue = target.value;

    const multiplier = searchFx(sourceValue, targetValue);
    const outputElement = document.querySelector("#output");
    let output = "Couldn't find conversion ratio";

    if (multiplier !== undefined) {
        const value = document.querySelector("#value");
        output = !Number.isNaN(Number(value.value)) 
        ? `${value.value} ${source.value} <=> ${Number(value.value) * multiplier} ${target.value}` 
        : "Oops. It's not a number!!!";
    }
    outputElement.innerHTML = output;
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
