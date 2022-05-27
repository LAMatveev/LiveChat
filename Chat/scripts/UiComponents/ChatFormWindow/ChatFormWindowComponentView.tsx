import * as classNames from 'classnames';
import * as React from 'react';
import { ChatFormWindowComponentInternal } from '@1c/ecs-ext-chat/src/scripts/UiComponents/ChatFormWindow/ChatFormWindowComponentInternal';
import { FormOpenMode } from '@1c/g5-client-base/UiComponents/FormWindow/FormOpenMode';
import { IPropsOverwrite } from '@1c/g5-client-base/UiComponents/UiComponent/IUiComponent';
import { UiComponentView } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentView';
import { viewForComponent } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentViewService';

/** View окна формы ECS */
@viewForComponent(ChatFormWindowComponentInternal)
export class ChatFormWindowComponentView extends UiComponentView<ChatFormWindowComponentInternal> {
    /** @override */
    protected renderVisibleState(overwriteProps: IPropsOverwrite = {}) {
        const component = this.getComponent();
        const minimized = component.getProperty('minimized');
        const collapsed = component.getProperty('collapsed');
        const hidden = component.getProperty('hidden');
        const className = component.getProperty('className');
        const formView = component.getForm().createView(this);

        return (
            <div
                className={classNames(
                    'ecs-base',
                    'cloud',
                    'flex-column',
                    'fullscreened',
                    className,
                    {
                        modal: component.getOpenMode() === FormOpenMode.MODAL,
                        cloudMinimize: minimized
                    },
                    overwriteProps.className
                )}
                style={{
                    position: 'fixed',
                    left: '0',
                    top: '0',
                    right: '0',
                    bottom: '0',
                    ...(hidden && { visibility: 'hidden' })
                }}
                {...this.baseViewProps()}>
                {!collapsed && formView}
            </div>
        );
    }
}
