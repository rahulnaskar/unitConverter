
const Units = Object.freeze({
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
        for (const [k, v] of umap.entries()) {
            if (k.source === key && k.target == value) {
                return v;
            } else if (k.target === key && k.source === value) {
                return 1 / v;
            } else if (key === value) {
                return 1;
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

let searchFx = searchBuilder(unitRatios);

document.addEventListener("DOMContentLoaded", () => {
    clearUnits();
    loadUnits();
    document.querySelector("#invoke").addEventListener("click", convert);
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
        output = !Number.isNaN(Number(value.value)) ? value.value * multiplier : "Oops. It's not a number!!!";
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
