
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
unitRatios.set(new tuple(Units.KM, Units.INCH), 2540);
unitRatios.set(new tuple(Units.MT, Units.KM), 1000);
unitRatios.set(new tuple(Units.INCH, Units.MT), .0254);
unitRatios.set(new tuple(Units.MT, Units.CM), 100);

let searchFx = searchBuilder(unitRatios);

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

    const num = Number(input.value);
    if (Number.isNaN(num)) {
        output.textContent = "Oops. It's not a number!!!";
        return;
    }

    const value = Number(num);
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
