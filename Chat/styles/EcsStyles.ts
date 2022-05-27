import { isInterfaceMobile } from '@1c/g5-client-base/Base/Env/interfaceKind';

/**
 * ВАЖНО!
 * Преттиер и линтер здесь отключены из-за того, что мы используем css-стили из V8, и нам важен
 * порядок импортов!
 */
// tslint:disable
// prettier-ignore

/** Стили ECS */
import 'styles/base.css';
import 'styles/common.css';
import 'styles/train.css';
import 'styles/press.css';
import 'styles/topline.css';
import 'styles/submenu.css';
import 'styles/cloud.css';
import 'styles/ecs.css';
import 'styles/resize.css';
import 'styles/base_end.css';
import 'styles/outside.css';
import 'styles/check.css';
import 'styles/ecsbase.css';
import 'styles/ecsscroll.css';

if (!ENV_TEST) {
    if (isInterfaceMobile) {
        require.ensure(['styles/mobile.css'], () => {});
    } else {
        require.ensure(['styles/desktop.css'], () => {});
    }
}

/** Конец стилей ECS */
