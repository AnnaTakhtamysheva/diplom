import React, {useRef, useState} from 'react';
import {Scene} from './3d/Scene';
import {GraphVisual} from '../../../types/3d';

interface Props {
    graph: GraphVisual;
    colorVertex: string;
    colorEdge: string;
    colorBackground?: string;
}

export const Scene3d: React.FC<Props> = ({graph, colorBackground = '#222', colorEdge, colorVertex}: Props) => {
    const ref = useRef<HTMLDivElement>(null);
    const [scene, setScene] = useState(new Scene({ graph, colorVertex, colorEdge }));

    React.useEffect(() => {
        if (ref.current) {
            ref.current!.innerHTML = `<a-scene background="color: ${colorBackground};"></a-scene>`;
            scene.render();
        }
    }, []);

    React.useEffect(() => {
        const sceneEl = ref.current?.querySelector('a-scene');
        sceneEl?.setAttribute('background', `color: ${colorBackground};`);
    }, [colorBackground]);

    // TODO: effect on graph change

    React.useEffect(() => scene.setEdgeColor(colorEdge), [colorEdge]);
    React.useEffect(() => scene.setVertexColor(colorVertex), [colorVertex]);

    // @ts-ignore
    return (
        <div ref={ref}/>
    );
};
