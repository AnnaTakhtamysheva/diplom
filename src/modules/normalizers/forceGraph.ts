import {Edge, GraphVisual, Vertex} from '../../types/3d';
import {GraphData, LinkObject, NodeObject} from 'react-force-graph-3d';

// TODO: как отображать контент?
const graphVisualToForceGraphNode = (vertex: Vertex, color: string): NodeObject & { color: string; content?: string; } => ({
    id: vertex.id,
    content: vertex.content,
    color,
    // x: vertex.x,
    // y: vertex.y,
    // z: vertex.z,
});

// TODO: как отображать контент?
const graphVisualToForceGraphLink = (edge: Edge, color: string): LinkObject & { color: string } => ({
    source: edge.v1.id,
    target: edge.v2.id,
    color,
});

export const graphVisualToForceGraph = (visual: GraphVisual, colorVertex: string, colorEdge: string): GraphData  => {
    const nodes = visual.vertices.map((vertex) => graphVisualToForceGraphNode(vertex, colorVertex));
    const links = visual.edges.map((edge) => graphVisualToForceGraphLink(edge, colorEdge));
    return { nodes, links };
};
