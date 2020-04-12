proofy
------
A set of tools for creating and conducting experiments.

```sh
npm i --save proofy
```

---

### 1. Describe xevents

```ts
import { xevent } from 'proofy';

export const appXEvents = xevent.group('App events', {
	// Некий набор DOM событий
	dom: xevent.group('DOM', {
		ready: xevent('Ready', {}), // "Ready" — описание события
		unload: xevent('Page unload', {}),
	}),

	// События авторизации
	auth: xevent.group('Авторизация', {
		try: xevent(
			({step, type, method}) => `Попытка авторизации с шага "${step.name}" по "${type.name}" через "${method.name}"`,
			{
				step: xevent.enum('Шаг', {
					'login': 'Ввод Логина',
					'passwd': 'Ввод пароля',
					'f-restore': 'Быстрый Вход',
				}),
				type: xevent.enum('Тип', {
					'password': 'Пароль',
					'qr': 'QR',
					'webauthn': 'WebAuthn',
				}),
				method: xevent.enum('Метод отправки формы', {
					'submit': 'Отправка Формы',
					'redirect': 'JS Редирект',
				}),
			},
		),

		// Клик по кнопке, ссылки и т.п.
		сlickBy: xevent(
			({elem}) => `Клик по "${elem.name}"`,
			{
				elem: xevent.enum('Элемент', {
					'signup': 'Регистрация',
					'login': 'Вход'
					'qrlink': 'QR',
				}),
			},
		),
	}),
});

// Дальше, где-то в коде используем их.
document.addEventListener('DOMContentLoaded', () => {
	appXEvents.dom.ready(); // ['dom', 'ready']
});

// Или упрощенная запись
appXEvents.dom.ready.$bind(document, 'DOMContentLoaded');
appXEvents.dom.unload.$bind(window, 'unload');
```

---

### Соединяем с React или с чем угодно

```tsx
export type AuthFormProps = {
	xevents?: WithXEvents<typeof appXEvents.auth>;
};

export function AuthForm(props: AuthFormProps) {
	const xevents = appXEvents.auth.$use(props.xevents);

	// Где-то в коде трегирим событие
	xevents.clickBy({elem: 'login'});
};

<AppForm
	xevents={{
		clickBy(data) {
			console.log(data); // {elem: "login"}
			console.log(appXEvents.auth.clickBy.$descr(data)); // Клик по "Вход"
		},
	}}
/>
```

---


### Development

 - `npm i`
 - `npm test`, [code coverage](./coverage/lcov-report/index.html)
