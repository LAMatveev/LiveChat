import * as classNames from 'classnames';
import * as logo1C from 'images/_logo1C.svg';
import * as React from 'react';
import { ChatConversationContainerComponentInternal } from 'scripts/UiComponents/ChatConversationContainer/ChatConversationContainerComponentInternal';

import { Ico } from '@1c/g5-client-base/Ecs/UiComponents/Ico/View/Ico';
import { Size } from '@1c/g5-client-base/Ecs/UiComponents/PropertySets/IHasSizePropertySet';
import i18n from '@1c/g5-client-base/Ecs/i18n/i18n';
import { IPropsOverwrite } from '@1c/g5-client-base/UiComponents/UiComponent/IUiComponent';
import { UiComponentView } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentView';
import { viewForComponent } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentViewService';
import { SvgIcon } from '@1c/g5-client-base/View/Icon/SvgIcon';

/** View контейнера обсуждений ECS */
@viewForComponent(ChatConversationContainerComponentInternal)
// tslint:disable-next-line:max-line-length
export class ChatConversationContainerComponentView extends UiComponentView<
    ChatConversationContainerComponentInternal
> {
    /** @override */
    protected renderVisibleState(overwriteProps: IPropsOverwrite = {}) {
        const component = this.getComponent();
        const hasCurrentConversation = !!component.getProperty('currentConversationId');
        const isOpen = component.getProperty('isOpen');
        const headerView = component.header.createView(this);
        const messagesListView = component.messagesList.createView(this);
        const messageTextEditView = component.messageTextEdit.createView(this);

        return (
            <div
                style={overwriteProps.style}
                className={classNames(overwriteProps.className, 'ecs-base', 'frameContent', 'flex', 'flex-1-1-100')}>
                {headerView}
                {isOpen && (
                    <div
                        className={classNames(
                            'ecsContent',
                            'flex-column',
                            'flex-1-1-100',
                            'flex-jc-end',
                            'flex-ai-center'
                        )}>
                        {hasCurrentConversation && messagesListView}
                        {hasCurrentConversation && <div className={classNames('borderDashedH')} />}
                        {hasCurrentConversation && (
                            <div className={classNames('ecsAnswer', 'flex', 'flex-column', 'flex-0-0-auto')}>
                                {messageTextEditView}
                            </div>
                        )}
                    </div>
                )}
                {isOpen && (
                    <div className={classNames('embedded')}>
                        <div className={classNames('embeddedText')}>{i18n.t('IDS_POWERED_BY')}</div>
                        <div className={classNames('embeddedIco')}>
                            <Ico style={this.getStyle()} size={Size._32} svgIcon={logo1C as SvgIcon} />
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
