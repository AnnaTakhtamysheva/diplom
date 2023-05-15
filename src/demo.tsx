import './index.css';
import { Mode } from './App';
import MetagraphViewer from './library';

new MetagraphViewer({
    containerSelector: '#root',
    data: {
        type: MetagraphViewer.DataSourceKind.graphmlUrl,
        url: 'example.graphml'
    },
    mode: Mode.demo
});
