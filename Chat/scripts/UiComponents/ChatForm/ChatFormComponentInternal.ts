import { ChatFormWindowComponent } from '@1c/ecs-ext-chat/src/scripts/UiComponents/ChatFormWindow/ChatFormWindowComponent';
import {
    EcsFormComponentInternal,
    IEcsFormComponentPropertySet
} from '@1c/g5-client-base/Ecs/UiComponents/EcsForm/EcsFormComponentInternal';
import { FormOpenMode } from '@1c/g5-client-base/UiComponents/FormWindow/FormOpenMode';
import { createComponent } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponent';

/** Форма ECS */
export class ChatFormComponentInternal<
    T extends IEcsFormComponentPropertySet = IEcsFormComponentPropertySet
> extends EcsFormComponentInternal<T> {
    /** @override */
    public createFormWindow(openMode: FormOpenMode): ChatFormWindowComponent {
        return createComponent(ChatFormWindowComponent, this, this.getProperty('openMode'));
    }
}
