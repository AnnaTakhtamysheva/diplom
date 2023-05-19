import { observer } from 'mobx-react-lite';
import React, { useRef, useEffect, useCallback } from 'react';
import ForceGraph3D, { GraphData, ForceGraphMethods, NodeObject, LinkObject } from 'react-force-graph-3d';
import { useThemeStore } from '../../modules/store/ThemeStore';
import ThreeForceGraph from 'three-forcegraph';
import * as THREE from 'three';
import * as d3 from 'd3';
import { useGraphStore } from '../../modules/store/GraphStore';
import {useModalStore} from '../../modules/store/ModalStore';

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

const getNestedVertexColor = (level: number): string => NESTED_COLORS[level % NESTED_COLORS.length];

const getNestedLevel = (node: NodeObject | string): number => String(typeof node === 'string' ? node : node.id).split('::').length;


/** Сила, которая направляет все вершины-дети к их раскрытым родителям */
function forceNestedToParents() {
    let nodes: NodeObject[];

    function force(alpha: number) {
        nodes?.forEach((vertex: NodeObject) => {
            const [, parentId] = String(vertex.id)?.match(/(.*)::.*/) || [];
            const parent = nodes.find(v => v.id === parentId);

            if (parent) {
                const k = alpha * 0.7;

                vertex.x! += (parent.x! - vertex.x!) * k;
                vertex.y! += (parent.y! - vertex.y!) * k;
                vertex.z! += (parent.z! - vertex.z!) * k;
            }
        })
    }

    function initialize() {}

    force.initialize = function(_nodes: NodeObject[]) {
        nodes = _nodes;
        initialize();
    };

    return force;
}

const ForceGraph: React.FC = () => {
    const graphRef = useRef<ForceGraphMethods | undefined>();
    const { colorBackground, colorVertex, colorEdge } = useThemeStore();
    const { expandNode, getNested, graphDataNormalized, maxExpandedNestedLevel } = useGraphStore();
const {openModal} = useModalStore()
    const showModal = useCallback((node:NodeObject)=>{openModal({title: 'Метаграф', onSubmit: ()=> expandNode(node)})}, [])
    
    
    useEffect(() => {
        const fg = graphRef.current as ForceGraphMethods;

        if (!fg) return;

        // @ts-ignore
        fg.d3Force('charge', d3.forceManyBody().strength((vertex: NodeObject) => {
            // @ts-ignore
            const match = vertex.id.match(/(.*)::.*/);

            return match ? -1500 : -1500;
        }));

        fg.d3Force('center', forceNestedToParents());

        // @ts-ignore
        fg.d3Force('link').distance((link: LinkObject) => {
            const { source, target } = link;

            const sourceNested = getNested(source as NodeObject);
            const sourceHasNested = Boolean(sourceNested.nodes.length);

            const targetNested = getNested(target as NodeObject);
            const targetHasNested = Boolean(targetNested.nodes.length);

            const sourceNestedLevel = getNestedLevel(source as NodeObject);
            const targetNestedLevel = getNestedLevel(source as NodeObject);

            const radiusKoef = maxExpandedNestedLevel - Math.max(sourceNestedLevel, targetNestedLevel);

            const distance = sourceHasNested || targetHasNested ? 300 * radiusKoef : 10;
            return distance;
        });
    }, [graphRef.current]);

    return (
        <ForceGraph3D
            ref={graphRef}
            numDimensions={3}
            nodeLabel='id'
            linkLabel='edge'
            graphData={graphDataNormalized}
            linkOpacity={1}
            linkColor={(link: LinkObject): string => {
                const { source, target } = link;

                const sourceNestedLevel = getNestedLevel(source as NodeObject);
                const sourceIsNested = sourceNestedLevel > 1;

                const targetNestedLevel = getNestedLevel(target as NodeObject);
                const targetIsNested = targetNestedLevel > 1;

                const maxLevel = Math.max(sourceNestedLevel, targetNestedLevel) - 1;

                const color = sourceIsNested || targetIsNested ? getNestedVertexColor(maxLevel) : colorEdge;

                return color;
            }}
            backgroundColor={colorBackground}
            linkWidth={1}
            linkDirectionalParticleWidth={6}
            onNodeClick={showModal}
            showNavInfo={false}
            // linkDirectionalParticles={() => 10}
            nodeThreeObject={
                (vertex: NodeObject) => {
                    const nested = getNested(vertex);
                    const hasNested = Boolean(nested.nodes.length);

                    const nestedLevel = getNestedLevel(vertex);

                    const radiusKoef = maxExpandedNestedLevel - nestedLevel;
                    const sphereRadius = hasNested ? 200 * radiusKoef : 15;
                    const sphereOpacity = hasNested ? 0.13 : 1;

                    const isNested = nestedLevel > 1;

                    const color = isNested ? getNestedVertexColor(nestedLevel - 1) : colorVertex;

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
                }
            }
        />
    )
};

export default observer(ForceGraph)