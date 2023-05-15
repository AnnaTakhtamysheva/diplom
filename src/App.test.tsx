import React from 'react';
import {render, screen} from '@testing-library/react';
import App, {Mode} from './App';


test('renders learn react link', () => {
  render(<App mode={Mode.demo} graphString={''} />);
  // render(<App mode={undefined} graphString={undefined} />);
  // render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

// const App: React.FC<Props> = ({ mode, graphString }: Props) => {
//   const graphStore = useLocalStore(() => new GraphStore(graphString));


// function tryGetFirstElement<T>(arr?: T[]) {
//   return arr?.[0];