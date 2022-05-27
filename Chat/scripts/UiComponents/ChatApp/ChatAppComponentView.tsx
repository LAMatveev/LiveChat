import { ChatAppComponentInternal } from 'scripts/UiComponents/ChatApp/ChatAppComponentInternal';

import { IPropsOverwrite } from '@1c/g5-client-base/UiComponents/UiComponent/IUiComponent';
import { UiComponentView } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentView';
import { viewForComponent } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentViewService';

/** View компонента приложения системы взаимодействия */
@viewForComponent(ChatAppComponentInternal)
export class ChatAppComponentView extends UiComponentView<ChatAppComponentInternal> {
    /** @override */
    protected renderVisibleState(overwriteProps: IPropsOverwrite = {}) {
        return this.createChildView(this.getComponent().getProperty('rootComponent'), undefined, overwriteProps);
    }
}
