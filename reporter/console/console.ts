import { ExperimentsObserver } from '../../src/feature/feature.typings';
import { XGroup } from '../../src/typing';

export type ConsoleReporterInit = {
	log?: Console['log'];
	badgeStyle?: string;
	pathStyle?: string;
};

export function createConsoleReporter(init: ConsoleReporterInit = {}): ExperimentsObserver {
	const {
		log = console.log,
		badgeStyle = getDefaultDadgeStyle(),
		pathStyle = 'color: #005ff9',
	} = init;

	return (feature, xevt) => {
		let descr = xevt.target.$descr(xevt.data);
		let xgropup = xevt.target.$group()

		while (xgropup) {
			descr = `${xgropup.$descr()} → ${descr}`;
			xgropup = xgropup.$group();
		}

		log(
			'%c%s%c%s: [ %c%s%c ] %o',
			badgeStyle,
			feature.id + (feature.split ? `:${feature.split}` : ``),
			'',
			descr,
			pathStyle,
			xevt.target.$path().join(' → '),
			'',
			xevt.data,
		);
	};
}

function getDefaultDadgeStyle() {
	return `
		background-color: #f60;
		color: #fff;
		padding: 1px 2px 1px;
		border-radius: 2px;
		margin-right: 5px;
	`;
}
