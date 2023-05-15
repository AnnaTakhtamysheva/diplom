import React from 'react';
import { createRoot } from 'react-dom/client';
import App, { Mode } from '../App';

enum DataSourceKind {
    /** url до файла, содержащего graphml разметку графа */
    graphmlUrl = 'graphml-url',
    /** строка, содержащая graphml разметку графа */
    graphmlString = 'graphml-string'
}

type GraphmlUrl = {
    type: DataSourceKind.graphmlUrl;
    url: string;
}

type GraphmlString = {
    type: DataSourceKind.graphmlString;
    str: string;
}

type DataSource = GraphmlUrl | GraphmlString;

const isGraphmlUrl = (data: DataSource): data is GraphmlUrl => data.type === DataSourceKind.graphmlUrl;
const isGraphmlString = (data: DataSource): data is GraphmlString => data.type === DataSourceKind.graphmlString;


type Params = {
    /** Элемент, в который необходимо встроить просмотрщик метаграфа */
    containerEl?: Element;
    /** Селектор элемент, в который необходимо встроить просмотрщик метаграфа */
    containerSelector?: string;
    /**
     * Встроить просмотрщик сразу при создании
     * @default true
     */
    initialRender?: boolean;
    /** Данные о вершинах и ребрах метаграфа в одном из форматов */
    data: DataSource;
    /** Режим работы приложения (библиотека/демо-режим) */
    mode?: Mode;
};

/** Основной класс для работы с библиотекой metagraph-viewer */
export class MetagraphViewer {
    readonly _params: Params;
    readonly id = Date.now() * Math.random();

    constructor(params: Params) {
        this._params = params;

        if (params.initialRender !== false) {
            this.render();
        }
    }

    /** Данные о вершинах и ребрах метаграфа */
    get graphData(): Promise<string> {
        const { data } = this._params;

        if (isGraphmlString(data)) {
            return Promise.resolve(data.str);
        }

        if (isGraphmlUrl(data)) {
            return fetch(data.url).then(data => data.text())
        }

        return Promise.reject(`Metagraph Viewer: unknown type of data: ${data}`);
    }

    /** Отрисовать просмотрщик метаграфа в переданном контейнере */
    async render(): Promise<void> {
        const { containerEl, containerSelector, mode = Mode.library } = this._params;
        const element = containerEl || (containerSelector && document.querySelector(containerSelector));

        if (!element) {
            console.warn(
                `Metagraph Viewer: containerEl or containerSelector must be provided!,
                but given ${containerEl}, ${containerSelector} for graph with id=${this.id}`
            );
            return;
        }

        const graphData = await this.graphData;

        const reactRoot = createRoot(element);
        reactRoot.render(<App mode={mode} graphString={graphData} />);
    }

    static DataSourceKind = DataSourceKind;
    static Mode = Mode;
}