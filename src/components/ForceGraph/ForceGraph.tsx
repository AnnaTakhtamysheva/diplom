import { observer } from 'mobx-react-lite';
import React, { useRef, useEffect, useCallback } from 'react';
import ForceGraph3D, {
  GraphData,
  ForceGraphMethods,
  NodeObject,
  LinkObject,
} from 'react-force-graph-3d';
import { useThemeStore } from '../../modules/store/ThemeStore';
import ThreeForceGraph from 'three-forcegraph';
import * as THREE from 'three';
import * as d3 from 'd3';
import { useGraphStore } from '../../modules/store/GraphStore';
import { useModalStore } from '../../modules/store/ModalStore';
import { NodeObjectWithInfo } from '../../modules/store/GraphStore/GraphStore';

/**
 * Цвета вложенных вершин
 */
const NESTED_COLORS: string[] = [
  'green',
  'green',
  'red',
  'purple',
  'yellow',
  'lightblue',
];

const getNestedVertexColor = (level: number): string =>
  NESTED_COLORS[level % NESTED_COLORS.length];

const getNestedLevel = (node: NodeObject | string): number =>
  String(typeof node === 'string' ? node : node.id).split('::').length;

/** Сила, которая направляет все вершины-дети к их раскрытым родителям */
function forceNestedToParents() {
  let nodes: NodeObjectWithInfo[];

  function force(alpha: number) {
    nodes?.forEach((vertex: NodeObjectWithInfo) => {
      const parentId = vertex.parentId as number;
      const parent = nodes.find((v) => v.id === parentId);

      if (parent) {
        const k = alpha * 0.7;

        vertex.x! += (parent.x! - vertex.x!) * k;
        vertex.y! += (parent.y! - vertex.y!) * k;
        vertex.z! += (parent.z! - vertex.z!) * k;
      }
    });
  }

  function initialize() {}

  force.initialize = function (_nodes: NodeObjectWithInfo[]) {
    nodes = _nodes;
    initialize();
  };

  return force;
}

const ForceGraph: React.FC = () => {
  const graphRef = useRef<ForceGraphMethods | undefined>();
  const { colorBackground, colorVertex, colorEdge } = useThemeStore();
  const { expandNode, getNested, graphDataNormalized, maxExpandedNestedLevel } =
    useGraphStore();
  const { openModal } = useModalStore();
  const showModal = useCallback(
    (node: NodeObject) => {
      console.log({ node });
      if ((node as NodeObjectWithInfo).metagraph) {
        openModal({
          title: 'Метаграф',
          onSubmit: () => expandNode(node as NodeObjectWithInfo),
          content: 'Хотите просмотреть метаграф?'
        });
      }
    },
    [expandNode, openModal]
  );

  useEffect(() => {
    const fg = graphRef.current as ForceGraphMethods;

    if (!fg) return;

    fg.controls();
    const cameraLookAtPoint = graphDataNormalized.nodes?.[0];

    fg.cameraPosition(
      { x: -20, y: 200, z: 20 },
      {
        x: cameraLookAtPoint.x!,
        y: cameraLookAtPoint.y!,
        z: cameraLookAtPoint.z!,
      }
    );

    // @ts-ignore
    fg.d3Force(
      'charge',
      d3.forceManyBody().strength((vertex: d3.SimulationNodeDatum) => {
        // @ts-ignore
        const match = vertex.attributes?.metagraph;

        return match ? -1500 : -1500;
      })
    );

    // @ts-ignore
    fg.d3Force('center', forceNestedToParents());

    // @ts-ignore
    fg.d3Force('link').distance((link: LinkObject) => {
      const { source, target } = link;

      const sourceNested = getNested(source as NodeObjectWithInfo);
      const sourceHasNested = Boolean(sourceNested.nodes.length);

      const targetNested = getNested(target as NodeObjectWithInfo);
      const targetHasNested = Boolean(targetNested.nodes.length);

      const sourceNestedLevel = getNestedLevel(source as NodeObject);
      const targetNestedLevel = getNestedLevel(source as NodeObject);

      const radiusKoef =
        maxExpandedNestedLevel - Math.max(sourceNestedLevel, targetNestedLevel);

      const distance =
        sourceHasNested || targetHasNested ? 300 * radiusKoef : 10;
      return distance;
    });
  }, [graphRef.current, graphDataNormalized]);

  const getNodeThreeObject = useCallback(
    (vertex: NodeObject) => {
      const nested = getNested(vertex as NodeObjectWithInfo);
      const hasNested = Boolean(nested.nodes.length);

      const nestedLevel = getNestedLevel(vertex);

      const radiusKoef = maxExpandedNestedLevel - nestedLevel;
      const sphereRadius = hasNested ? 200 * radiusKoef : 15;
      const sphereOpacity = hasNested ? 0.13 : 1;

      // const isNested = nestedLevel > 1;
      const isNested = !!(vertex as NodeObjectWithInfo).parentId;

      const color = isNested ? 'purple' : colorVertex;

      // @ts-ignore
      // const geometry = new THREE.SphereGeometry(sphereRadius, 32, 16);
      const geometry = new THREE.SphereGeometry(sphereRadius, 32, 16);
      const material = new THREE.MeshBasicMaterial({
        color,
        opacity: sphereOpacity,
        transparent: hasNested,
        // wireframe: hasNested,
      });
      const sphere = new THREE.Mesh(geometry, material);
      return sphere;
    },
    [colorVertex, getNested, maxExpandedNestedLevel]
  );

  return (
    <ForceGraph3D
      ref={graphRef}
      numDimensions={3}
      nodeLabel="id"
      linkLabel="edge"
      graphData={graphDataNormalized}
      linkOpacity={1}
      linkColor={(link: LinkObject): string => {
        const { source, target } = link;

        const sourceNestedLevel = getNestedLevel(source as NodeObject);
        const sourceIsNested = sourceNestedLevel > 1;

        const targetNestedLevel = getNestedLevel(target as NodeObject);
        const targetIsNested = targetNestedLevel > 1;

        const maxLevel = Math.max(sourceNestedLevel, targetNestedLevel) - 1;

        const color =
          sourceIsNested || targetIsNested
            ? getNestedVertexColor(maxLevel)
            : colorEdge;

        return color;
      }}
      backgroundColor={colorBackground}
      linkWidth={1}
      linkDirectionalParticleWidth={6}
      onNodeClick={showModal}
      showNavInfo={true}
      nodeThreeObject={getNodeThreeObject}
    />
  );
};

export default observer(ForceGraph);
