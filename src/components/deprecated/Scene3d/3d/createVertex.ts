import {Cord} from '../../../../types/3d';

export default function createVertex({x, y, z}: Cord, color: string = '#444'): HTMLElement {
    const entity = document.createElement('a-entity');

    entity.setAttribute('material', `color: ${color}`);
    entity.setAttribute('shadow', String(true));
    entity.setAttribute('geometry', 'primitive: sphere; radius: 0.05');
    entity.setAttribute('position', [x, y, z].join(' '));

    return entity;
}
