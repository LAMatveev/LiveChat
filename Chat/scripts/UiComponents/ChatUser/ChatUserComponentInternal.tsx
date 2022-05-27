import { action } from 'mobx';

import { UserComponentInternal } from '@1c/g5-client-base/Ecs/UiComponents/User/UserComponentInternal';
import { assert } from '@1c/g5-client-base/debug';

/** Отображает пользователя ECS */
export class ChatUserComponentInternal extends UserComponentInternal {
    /** @override */
    @action
    public handleOnUserClickEvent(x: number, y: number): void {
        assert(false);
    }
}
