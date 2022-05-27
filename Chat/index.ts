/* tslint:disable:imports-format no-import-side-effect no-empty */
import { configure, runInAction } from 'mobx';
import 'styles/ecschat.css';
import '@1c/g5-client-base/Base/Env/browser';
import '@1c/g5-client-base/env';
import '@1c/g5-client-base/globals';

import { createEcsAppContainer } from 'scripts/UiComponents/ChatApp/ChatAppContainerComponentView';
import 'styles/EcsStyles';
import '@1c/g5-client-base/Site/styles/fonts.css';

configure({ enforceActions: 'observed' });

const ecsAppContainer = createEcsAppContainer();
ecsAppContainer.render(document.getElementById('root') as HTMLDivElement);

window.addEventListener('unload', () => {
    runInAction(() => {
        ecsAppContainer.dispose();
    });
});
