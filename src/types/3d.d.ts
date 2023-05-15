export interface Cord {
    x: number;
    y: number;
    z: number;
}

export interface Vertex extends Cord {
    id: string;
    content?: string;
}

export interface Edge {
    v1: Vertex;
    v2: Vertex;
    directed?: boolean;

    content?: string;
}

export interface GraphVisual {
    vertices: Vertex[];
    edges: Edge[];
}
