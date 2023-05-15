import React from 'react';
import GraphStore from './GraphStore';

export const GraphStoreContext = React.createContext<GraphStore | undefined>(
    undefined
);

export const useGraphStore = (): GraphStore => {
    const context = React.useContext(GraphStoreContext);
    if (context === undefined) {
        console.warn(
            'Metagraph Viewer: GraphStore instance was not provided into context'
        );

        // @ts-ignore
        return {};
    }

    return context
};