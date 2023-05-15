import { Edge, GraphVisual, Vertex } from '../../types/3d';
import { UndirectedGraph } from 'graphology';
import { BOUNDARY_SIZE } from '../../constants';

const randCord = () => Math.random() * BOUNDARY_SIZE;

/** @deprecated */
const meta = (graph: UndirectedGraph, expandedNodes: string[]): GraphVisual => {
    const verticesEntries = [...graph.nodeEntries()];

    const vertices = verticesEntries.map(({ node: id }) => {
        const vertex: Vertex = {
            id,
            x: randCord(),
            y: randCord() - 5,
            z: randCord() - 10,
        };

        return vertex;
    }).filter((vertex: Vertex) => {
        const match = vertex.id.match(/(.*)::.*/);
        const isComplex = Boolean(match);

        if (!isComplex) {
            return true;
        }

        const [, parent] = match || [];
        return expandedNodes.includes(parent);
    });

    const edgesEntries = [...graph.edgeEntries()];

    const edges = edgesEntries
        .map(({source, target}) => {
            const v1 = vertices.find(({ id }) => id === source);
            const v2 = vertices.find(({ id }) => id === target);

            if (!(v1 && v2)) return null;

            const edge: Edge = {
                v1,
                v2,
            };

            return edge;
        })
        .filter(edge => edge !== null)
        .filter(edge => {
            const match1 = edge?.v1.id.match(/(.*)::.*/);
            const match2 = edge?.v2.id.match(/(.*)::.*/);
            const isComplex1 = Boolean(match1);
            const isComplex2 = Boolean(match2);

            if (!isComplex1 && !isComplex2) return true;

            const [, parent1] = match1 || [];
            const [, parent2] = match2 || [];

            return expandedNodes.includes(parent1) && expandedNodes.includes(parent2);
        });

    // @ts-ignore
    window.__graph__ = graph;

    return {
        vertices,
        edges,
    } as GraphVisual;
};

export default meta;
