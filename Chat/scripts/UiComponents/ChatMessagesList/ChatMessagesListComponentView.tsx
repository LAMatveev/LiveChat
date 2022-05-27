import { ChatMessagesListComponentInternal } from 'scripts/UiComponents/ChatMessagesList/ChatMessagesListComponentInternal';
import { IPropsOverwrite } from '@1c/g5-client-base/UiComponents/UiComponent/IUiComponent';
import { UiComponentView } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentView';
import { viewForComponent } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentViewService';

/** View списка сообщений ECS */
@viewForComponent(ChatMessagesListComponentInternal)
export class ChatMessagesListComponentView extends UiComponentView<ChatMessagesListComponentInternal> {
    /** @override */
    protected renderVisibleState(overwriteProps: IPropsOverwrite = {}) {
        return this.createChildView(this.getComponent().getProperty('rootComponent'), this.viewRef, overwriteProps);
    }
}
