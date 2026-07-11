import { app } from './app.js';
import { config } from './config.js';
import { migrate } from './migrate.js';

if (config.NODE_ENV !== 'test') migrate().then(() => app.listen(config.PORT, () => console.log(`API listening on ${config.PORT}`)));
