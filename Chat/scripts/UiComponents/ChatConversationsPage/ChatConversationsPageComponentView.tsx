import * as classNames from 'classnames';
import * as React from 'react';
import { ChatConversationsPageComponentInternal } from 'scripts/UiComponents/ChatConversationsPage/ChatConversationsPageComponentInternal';
import { IPropsOverwrite } from '@1c/g5-client-base/UiComponents/UiComponent/IUiComponent';
import { UiComponentView } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentView';
import { viewForComponent } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentViewService';

/** View страницы обсуждений ECS */
@viewForComponent(ChatConversationsPageComponentInternal)
export class ChatConversationsPageComponentView extends UiComponentView<ChatConversationsPageComponentInternal> {
    /** @override */
    protected renderVisibleState(overwriteProps: IPropsOverwrite = {}) {
        const component = this.getComponent();
        const conversationContainerView = component.conversationContainer.createView(this);

        return (
            <div className={classNames('main', 'flex-column', 'ecs-base')} {...this.baseViewProps()}>
                <div className={classNames('frame', 'flex')}>{conversationContainerView}</div>
            </div>
        );
    }
}
