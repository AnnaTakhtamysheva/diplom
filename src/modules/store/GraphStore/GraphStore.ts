import * as browser from 'graphology-graphml/browser';
import Graph, { UndirectedGraph } from 'graphology';
import { action, computed, makeObservable, observable } from 'mobx';
import { ILocalStore } from '../../../utils/useLocalStore';
import { EdgeEntry, NodeEntry } from 'graphology-types';
import { GraphData, NodeObject } from 'react-force-graph-3d';
import graphDataTest from '../../../data/test.json';

type PrivateFields = '_expandedNodes' | '_graphModel';

// =======================================
export interface Metagraph {
  meta_vertecies: MetaVertecy[];
  meta_edges: MetaEdge[];
}

export interface MetaEdge {
  id: number;
  payload: MetaEdgePayload[];
  vertex_start: number;
  vertex_end: number;
  metagraph: null;
  oriented: boolean;
}

export interface MetaEdgePayload {
  name: PurpleName;
  type: PurpleType;
  value: boolean | number | string;
}

export enum PurpleName {
  Directed = 'directed',
  Name = 'name',
  P = 'p',
  Text = 'text',
}

export enum PurpleType {
  Bool = 'bool',
  Float = 'float',
  String = 'string',
}

export interface MetaVertecy {
  id: number;
  payload: MetaVertecyPayload[];
  metagraph: MetagraphClass | null;
}

export interface MetagraphClass {
  meta_vertecies: number[];
  meta_edges: any[];
}

export interface MetaVertecyPayload {
  name: string;
  type: FluffyType;
  value: number | string;
}

export enum FluffyType {
  Int = 'int',
  String = 'string',
}

export type NodeObjectWithInfo = NodeObject & {
  payload: MetaVertecyPayload[];
  metagraph: MetagraphClass | null;
  parentId?: number;
};

export type NodeEntryWithInfo = NodeEntry<
  Pick<NodeObjectWithInfo, 'payload' | 'metagraph' | 'parentId'>
>;

export type EdgeEntryWithInfo = EdgeEntry<
  Pick<MetaEdge, 'payload' | 'metagraph'>
>;
// =======================================

/** Получить id вершины для начала/конца ребра. Нужно, тк там может быть как id, так и object */
const getEdgesVertexID = (node: string | NodeObject): string =>
  typeof node === 'string' ? node : String(node.id);

class GraphStore implements ILocalStore {
  private _graphModel: UndirectedGraph | null = null;
  private _expandedNodes = new Set<string>();

  constructor(graphData?: string) {
    makeObservable<GraphStore, PrivateFields>(this, {
      _expandedNodes: observable,
      _graphModel: observable.ref,
      expandNode: action.bound,
      setGraphData: action.bound,
      vertices: computed,
      edges: computed,
      graphDataNormalized: computed,
    });

    // if (graphData) {
    //   this.setGraphData(graphData);
    // }
    this.initGraph(graphDataTest[0] as Metagraph);
  }

  setGraphData = (data: string) => {
    this._graphModel = browser.parse(UndirectedGraph, data);
  };

  initGraph = (data: Metagraph) => {
    const graph = new Graph({ multi: true });
    const addedVertices = new Set<number>();
    data.meta_vertecies.forEach((vert) => {
      if (addedVertices.has(vert.id)) {
        graph.setNodeAttribute(vert.id, 'metagraph', vert.metagraph);
        graph.setNodeAttribute(vert.id, 'payload', vert.payload);
      } else {
        addedVertices.add(vert.id);
        graph.addNode(vert.id, {
          metagraph: vert.metagraph,
          payload: vert.payload,
        });
      }
      if (vert.metagraph) {
        vert.metagraph?.meta_vertecies?.forEach((v) => {
          if (addedVertices.has(v)) {
            graph.setNodeAttribute(v, 'parentId', vert.id);
          } else {
            addedVertices.add(v);

            graph.addNode(v, {
              parentId: vert.id,
            });
          }
        });
      }
    });
    data.meta_edges.map((edge) => {
      if (edge.payload.find((el) => el.name === PurpleName.Directed)?.value) {
        graph.addDirectedEdge(edge.vertex_start, edge.vertex_end, {
          metagraph: edge.metagraph,
          payload: edge.payload,
        });
      } else {
        graph.addEdge(edge.vertex_start, edge.vertex_end, {
          metagraph: edge.metagraph,
          payload: edge.payload,
        });
      }
    });

    this._graphModel = graph;
  };

  /** Раскрыть метавершину, чтобы увидеть ее содержимое */
  expandNode = (vertex: NodeObject): void => {
    this._expandedNodes.add(String(vertex.id));
  };

  isExpanded = (vertexId: string): boolean => this._expandedNodes.has(vertexId);

  /** Получить содержимое метавершины */
  getNested = (vertex: NodeObjectWithInfo): GraphData => {
    const nodes: NodeObjectWithInfo[] = (
      this.allVertices.filter((v) => {
        return (
          Boolean(vertex.id === v.attributes.parentId) &&
          this.isExpanded(`${vertex.id}`)
        );
      }) ?? []
    ).map((node) => ({ id: node.node, ...node.attributes }));

    const links =
      this.allEdges.filter(
        (edge: EdgeEntry) =>
          nodes.find(
            (v: NodeObject) => v.id === getEdgesVertexID(edge?.source)
          ) &&
          nodes.find((v: NodeObject) => v.id === getEdgesVertexID(edge?.target))
      ) ?? [];

    return {
      links,
      nodes,
    };
  };

  /** Все вершины метаграфа, вне зависимости от состояния родителей */
  get allVertices(): NodeEntryWithInfo[] {
    return [
      ...((this._graphModel?.nodeEntries() ?? []) as NodeEntryWithInfo[]),
    ];
  }

  /** Только видимые вершины (без скрытых внутри неразвернутых метавершин) */
  get vertices(): NodeEntryWithInfo[] {
    const excludeCollapsed = this.allVertices.filter(
      (vertex: NodeEntryWithInfo) => {
        const isNested = !!vertex.attributes.parentId;

        if (!isNested) {
          return true;
        }

        return false;
      }
    );

    return excludeCollapsed;
  }

  /** Все ребра метаграфа, вне зависимости от состояние вершин, которые они соединяют */
  get allEdges(): EdgeEntryWithInfo[] {
    return [...(this._graphModel?.edgeEntries() ?? ([])) as EdgeEntryWithInfo[]];
  }

  /**
   * Только видимые ребра метаграфа
   * (без ребер, начало и/или конец которых скрыты внутри неразвернутых метавершин)
   */
  get edges(): EdgeEntryWithInfo[] {
    const existing = this.allEdges.filter((edge: EdgeEntryWithInfo) => {
      const hasSource = this.vertices.some(
        (vertex: NodeEntryWithInfo) => vertex.node === getEdgesVertexID(edge.source)
      );
      const hasTarget = this.vertices.some(
        (vertex: NodeEntryWithInfo) => vertex.node === getEdgesVertexID(edge.target)
      );

      return hasTarget && hasSource;
    });

    const result = existing.filter((edge: EdgeEntry) => {
      // return true;
      const source = getEdgesVertexID(edge?.source);
      const target = getEdgesVertexID(edge?.target);

      const isComplex1 = !!this._graphModel?.getNodeAttribute(source, 'metagraph');
      const isComplex2 = !!this._graphModel?.getNodeAttribute(target, 'metagraph');

      if (!isComplex1 && !isComplex2) return true;

      const parent1 = this._graphModel?.getNodeAttribute(source, 'parentId');
      const parent2 = this._graphModel?.getNodeAttribute(target, 'parentId');

      return (
        (this._expandedNodes.has(parent1) || !parent1) &&
        (this._expandedNodes.has(parent2) || !parent2)
      );
    });
    return result;
  }

  /** Максимальный уровень вложенности из раскрытых вершин */
  get maxExpandedNestedLevel(): number {
    return (
      Math.max(
        ...[...this._expandedNodes].map((node) => node.split('::').length)
      ) + 1
    );
  }

  /** Данные о вершинах и ребрах метаграфа, нормализованные для react-force-graph-3d */
  get graphDataNormalized(): GraphData {
    return {
      nodes: this.vertices.map(({ node: id, attributes }) => ({
        ...attributes,
        id,
      })),
      links: this.edges,
    };
  }

  destroy(): void {}
}

export default GraphStore;
