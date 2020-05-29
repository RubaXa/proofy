import { xevent } from 'proofy';
import { TodoModel } from 'app/models';

const timeEvent = (name: string) => xevent(
	({time}) => `${name} at ${time.value}ms`,
	{time: { name: 'Time', type: Number }},
);

const clickableElements = xevent.enum('Element', {
	'complete-all': 'Complete all',
	'clear': 'Clear completed',
	'filter': 'Filter todos',
});

const todoItemCompleteState = xevent.enum('Complete', {
	'yes': 'True',
	'no': 'False',
});

const todoItemEditAction = xevent.enum('Edit action', {
	'add': 'Added',
	'start': 'Start editing',
	'end': 'Completion of editing',
});

const filterType = xevent.enum('Filter', {
	[TodoModel.Filter.SHOW_ACTIVE]: 'Active',
	[TodoModel.Filter.SHOW_ALL]: 'All',
	[TodoModel.Filter.SHOW_COMPLETED]: 'Completed',
});

export const todosAppXEvents = xevent.group('App Events', {
	render: timeEvent('render'),
	ready: timeEvent('ready'),

	clickBy: xevent(({el}) => `Click by "${el.name}"`, {el: clickableElements}),
	filterBy: xevent(({type}) => `Filter by "${type.name}"`, {type: filterType}),

	todoItem: xevent.group('TodoItem', {
		edit: xevent(({act}) => act.name, {act: todoItemEditAction}),
		complete: xevent(({state}) => `Complete changed to "${state.name}"`, {state: todoItemCompleteState}),
		delete: xevent(`Delete`, {}),
	}),
});
