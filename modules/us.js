
const PARENT = "parent";
const CHILDREN = "children";
const RATIO = "ratio";

function UnitSystem(baseunit) {
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
                return val * (targetRatio / sourceRatio);
            }
        },

        getNodeGraph: () => {
            return nodeGraph;
        }
    };

    return controller;
}

export function UnitSystemBuilder(baseUnit, conversionMap) {
    let us = UnitSystem(baseUnit);

    conversionMap.map((e) => {
        us.addMeasure(e.target, e.source, e.ratio);
    });
    let x = us.getNodeGraph();
    return us;
}

