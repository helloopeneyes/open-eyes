import Main from './main.js';
import React from 'react';
import ReactDOM from 'react-dom';

ReactDOM.hydrate(<Main items={initialState.items}/>, document.getElementById('root'));
