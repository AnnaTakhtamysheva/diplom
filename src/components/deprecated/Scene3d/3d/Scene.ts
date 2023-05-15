import createVertex from './createVertex';
import createEdge from './createEdge';
import {GraphVisual} from '../../../../types/3d';

interface Params {
    graph: GraphVisual;
    colorVertex?: string;
    colorEdge?: string;
}

export class Scene {
    graph: GraphVisual;
    colorVertex?: string;
    colorEdge?: string;

    vertexEntities: HTMLElement[] = [];
    edgeEntities: HTMLElement[] = [];

    constructor({graph, colorEdge, colorVertex}: Params) {
        this.graph = graph;
        this.colorEdge = colorEdge;
        this.colorVertex = colorVertex;
    }

    setVertexColor(color: string) {
        this.vertexEntities.forEach((el) => {
            el.setAttribute('material', `color: ${color}`);
        })
    }

    setEdgeColor(color: string) {
        this.edgeEntities.forEach((el) => {
            //@ts-ignore
            window.AFRAME.utils.entity.setComponentProperty(el, 'meshline.color', color);
        })
    }

    render() {
        const { colorVertex, colorEdge, graph: { vertices, edges } } = this;
        const sceneEl = document.querySelector('.a-scene');

        if (!sceneEl) {
            return;
        }

        sceneEl.innerHTML = '';

        vertices.forEach((vertex, i) => {
            const vertexEl = createVertex(vertex, colorVertex);
            sceneEl?.appendChild(vertexEl);
            this.vertexEntities.push(vertexEl);
        });

        edges.forEach((edge, i) => {
            const { v1, v2 } = edge;
            const edgeEl = createEdge(v1, v2, colorEdge);
            sceneEl?.appendChild(edgeEl);
            this.edgeEntities.push(edgeEl);
        });
    }
}


// export const initScene = (graph: GraphVisual) => {
//     const sceneEl = document.querySelector('a-scene');
//
//     const vertices: Vertex[] = [];
//
//     // graph.nodes.
//
// 	for (let i = -10; i < 11; i++) {
// 		vertices.push({
// 			x: 0.3 * i,
// 			y: 0.05 * i**3,
// 			z: 0.2 * i**2
// 		  });
// 	}
//
//     vertices.forEach((vertex, i) => {
//         const vertexEl = createVertex(vertex);
//
//         const nextVertexIndex = i + 1;
//
//         sceneEl?.appendChild(vertexEl);
//
//         if (nextVertexIndex < vertices.length) {
//             const nextVertex = vertices[nextVertexIndex];
//             const edgeEl = createEdge(vertex, nextVertex);
//             sceneEl?.appendChild(edgeEl);
//         }
//     });
// };
