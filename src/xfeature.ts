import { createContext, useContext } from 'react';
import { createFeature } from 'proofy';
import { todosAppXEvents } from './xevents';

export const todosAppFeature = createFeature({
	id: 'todos',
	name: 'Todos App',
	events: todosAppXEvents,
});

export const ProofyContext = createContext(todosAppFeature);

export function useXEvents() {
	return useContext(ProofyContext).events;
}
