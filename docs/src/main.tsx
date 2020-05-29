import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createBrowserHistory } from 'history';
import { configureStore } from 'app/store';
import { Router } from 'react-router';
import { App } from './app';
import { todosAppFeature, ProofyContext } from './xfeature';
import { verboseExperiments } from 'proofy';

// prepare store
const history = createBrowserHistory();
const store = configureStore();

// prepare xevents
verboseExperiments(true);
todosAppFeature.events.render({time: performance.now()})

ReactDOM.render(
  <ProofyContext.Provider value={todosAppFeature}>
    <Provider store={store}>
      <Router history={history}>
        <App />
      </Router>
    </Provider>
  </ProofyContext.Provider>,
  document.getElementById('root')
);
