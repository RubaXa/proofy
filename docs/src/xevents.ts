import { xevent } from 'proofy';
import { TodoModel } from 'app/models';

const timeEvent = (name: string) => xevent(
	({time}) => `${name} at ${new Date(time.value).toString()}`,
	{time: { name: 'Time', type: Number }},
);

const clickableElements = xevent.enum('Element', {
	'clear': 'Clear completed',
	'filter': 'Filter todos',
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
});
