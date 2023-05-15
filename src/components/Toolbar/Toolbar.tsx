import React, {ChangeEvent, useState} from 'react';
import styles from './Toolbar.module.css';
import {observer} from 'mobx-react';
import {useThemeStore} from '../../modules/store/ThemeStore';

export const Toolbar: React.FC = observer(() => {
    const { colorBackground, colorVertex, colorEdge, setColorBackground, setColorEdge, setColorVertex } = useThemeStore();

    const [colorBackgroundLocal, setColorBackgroundLocal] = useState(colorBackground);
    const [colorVertexLocal, setColorVertexLocal] = useState(colorVertex);
    const [colorEdgeLocal, setColorEdgeLocal] = useState(colorEdge);

    const onColorBackgroundChange = (e: ChangeEvent<HTMLInputElement>) => setColorBackgroundLocal(e?.target.value);
    const onColorVertexChange = (e: ChangeEvent<HTMLInputElement>) => setColorVertexLocal(e?.target.value);
    const onColorEdgeChange = (e: ChangeEvent<HTMLInputElement>) => setColorEdgeLocal(e?.target.value);

    const onColorBackgroundBlur = () => setColorBackground(colorBackgroundLocal);
    const onColorVertexBlur = () => setColorVertex(colorVertexLocal);
    const onColorEdgeBlur = () => setColorEdge(colorEdgeLocal);

    return (
        <div className={styles.root}>
			<span className={styles.pair}>
				<label htmlFor="edge-color">Цвет ребер</label>
				<input type="color"
                       id="edge-color"
                       value={colorEdgeLocal}
                       onChange={onColorEdgeChange}
                       onBlur={onColorEdgeBlur}
                />
			</span>

            <span className={styles.pair}>
				<label htmlFor="vertex-color">Цвет вершин</label>
				<input type="color"
                       id="vertex-color"
                       value={colorVertexLocal}
                       onChange={onColorVertexChange}
                       onBlur={onColorVertexBlur}
                />
			</span>

            <span className={styles.pair}>
				<label htmlFor="background-color">Цвет фона</label>
				<input type="color"
                       id="background-color"
                       value={colorBackgroundLocal}
                       onChange={onColorBackgroundChange}
                       onBlur={onColorBackgroundBlur}
                />
			</span>
        </div>
    );
});
