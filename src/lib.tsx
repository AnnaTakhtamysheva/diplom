import MetagraphViewer from './library';

declare global {
    interface Window {
        MetagraphViewer: typeof MetagraphViewer;
        MV: typeof MetagraphViewer;
    }
}

// TODO: сделать сборку для esm, umd
window.MetagraphViewer = MetagraphViewer;
window.MV = MetagraphViewer;


