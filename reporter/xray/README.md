proofy/reporter/xray
--------------------

```ts
import {
	xraySplitAutoConfiguration,
	createXRayReporter,
} from 'proofy/reporter/xray';
import { addExperimentsObserver } from 'proofy';

// Конфигруриуем `xray`, он будет автоматически добавлять сплиты
xraySplitAutoConfiguration(xrayLike);

// Создаём репортер
const xrayReporter = createXRayReporter({ send: xrayLike.send });

// Добавляем репортек как обсервер
addExperimentsObserver(xrayReporter);
```
