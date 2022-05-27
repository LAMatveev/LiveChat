import * as classNames from 'classnames';
import * as iconEcsCloseBold from 'images/SvgIcons/iconEcsCloseBold.svg';
import * as iconEcsEmpty from 'images/SvgIcons/iconEcsEmpty.svg';
import * as iconEcsLoading from 'images/SvgIcons/iconEcsLoading.svg';
import * as iconEcsPencilLine from 'images/SvgIcons/iconEcsPencilLine.svg';
import * as React from 'react';
import { ChatMessagesListItemComponentInternal } from 'scripts/UiComponents/ChatMessagesList/ChatMessagesListItemComponentInternal';

import { Ico } from '@1c/g5-client-base/Ecs/UiComponents/Ico/View/Ico';
import { Size } from '@1c/g5-client-base/Ecs/UiComponents/PropertySets/IHasSizePropertySet';
import i18n from '@1c/g5-client-base/Ecs/i18n/i18n';
import { IPropsOverwrite } from '@1c/g5-client-base/UiComponents/UiComponent/IUiComponent';
import { UiComponentView } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentView';
import { viewForComponent } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentViewService';
import { SvgIcon } from '@1c/g5-client-base/View/Icon/SvgIcon';

/** View элемента списка сообщений ECS */
@viewForComponent(ChatMessagesListItemComponentInternal)
export class ChatMessagesListItemComponentView extends UiComponentView<ChatMessagesListItemComponentInternal> {
    /** @override */
    public componentDidUpdate() {
        if (this.viewRef.current && this.getComponent().getProperty('isBlinkingMessage')) {
            this.scrollIntoView();
        }
        super.componentDidUpdate();
    }

    /** @override */
    protected renderVisibleState(overwriteProps: IPropsOverwrite = {}) {
        const component = this.getComponent();
        const actionsViews = component.actionsComponent.map((actionComponent) => actionComponent.createView(this));
        const attachmentsView = component.attachmentsComponent.createView(this);
        const authorView = component.authorComponent?.createView(this);
        const avatarView = component.avatarComponent?.createView(this);
        const recipientsView = component.recipientsComponent.createView(this);
        const isMyMessage = component.getProperty('isMyMessage');
        const isJoinedMessage = component.getProperty('isJoinedMessage');
        const isServiceMessage = component.getProperty('isServiceMessage');
        const isInfoMessage = component.isInfoMessage();
        const isBlinkingMessage = component.getProperty('isBlinkingMessage');
        const authorAdditionalImageUrl = component.getProperty('authorAdditionalImageUrl');
        const messagePresentation = component.getProperty('messagePresentation');
        const isDeletedMessage = component.getProperty('isDeletedMessage');
        const dateSeparator = component.getProperty('dateSeparator');
        const hasNotLoadedAttachment = component.getProperty('hasNotLoadedAttachment');
        const deliveryErrorText = component.getProperty('deliveryErrorText');
        const icoView = this.getIcoView();
        const messageInfo = this.getMessageInfo();

        return (isServiceMessage || isInfoMessage) && !dateSeparator ? null : (
            <React.Fragment>
                {dateSeparator && (
                    <div className={classNames('ecsChatDate', 'flex', 'flex-ai-center')}>
                        <div>{dateSeparator}</div>
                    </div>
                )}
                {isServiceMessage || isInfoMessage ? null : (
                    <div
                        className={classNames(
                            'ecsChatItem',
                            { ecsOwner: isMyMessage },
                            { ecsChatItemJoined: isJoinedMessage },
                            { ecsChatItemService: isServiceMessage },
                            { ecsMessageBlink: isBlinkingMessage }
                        )}
                        {...this.baseViewProps()}>
                        {!isJoinedMessage && avatarView}
                        <div className={classNames('ecsChatBox', 'flex')}>
                            <div
                                className={classNames('ecsChatText', 'flex-1-1-100')}
                                data-title={component.authorComponent?.getPresentation()}>
                                {!isJoinedMessage && (
                                    <div className={classNames('ecsChatWhoShow', 'flex')}>
                                        <div className={classNames('ecsChatWho', 'flex', 'flex-1-1-100', 'dots')}>
                                            {authorAdditionalImageUrl && (
                                                <React.Fragment>
                                                    <div
                                                        className={classNames('flex-0-0-auto', 'i16')}
                                                        style={{
                                                            backgroundImage: `url(${authorAdditionalImageUrl})`
                                                        }}
                                                    />
                                                    <div className={classNames('m-2')} />
                                                </React.Fragment>
                                            )}
                                            <div className={classNames('flex-1-1-100', 'fs-8', 'dots')}>
                                                {authorView}
                                                {recipientsView}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {messagePresentation}
                                {!isDeletedMessage && (
                                    <React.Fragment>
                                        {attachmentsView}
                                        {actionsViews}
                                    </React.Fragment>
                                )}
                            </div>
                            <div
                                className={classNames('ecsChatInfo', 'flex', {
                                    escHasNotLoadedAttachment: hasNotLoadedAttachment
                                })}>
                                {icoView}
                                {!deliveryErrorText && (
                                    <span className={classNames('fs-8', 'nowrap')}>{messageInfo}</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </React.Fragment>
        );
    }

    private getIcoView(): React.ReactNode {
        const component = this.getComponent();
        const deliveryErrorText = component.getProperty('deliveryErrorText');
        const hasNotLoadedAttachment = component.getProperty('hasNotLoadedAttachment');
        const isCreatedMessage = component.getProperty('isCreatedMessage');
        const isDeletedMessage = component.getProperty('isDeletedMessage');
        const isEditedMessage = component.getProperty('isEditedMessage');
        const messageUpDate = component.getProperty('messageUpDate');

        if (deliveryErrorText) {
            return (
                <div title={deliveryErrorText} className={classNames('color-red')}>
                    {i18n.t('IDS_ERR_SEND_FAILED')}
                </div>
            );
        } else if (hasNotLoadedAttachment || !isCreatedMessage) {
            return <Ico style={this.getStyle()} svgIcon={iconEcsLoading as SvgIcon} size={Size._16} />;
        } else if (isDeletedMessage) {
            return (
                <Ico
                    style={this.getStyle()}
                    svgIcon={iconEcsCloseBold as SvgIcon}
                    size={Size._16}
                    className={classNames('disabled')}
                />
            );
        } else if (isEditedMessage) {
            return (
                <Ico
                    style={this.getStyle()}
                    svgIcon={iconEcsPencilLine as SvgIcon}
                    size={Size._16}
                    className={classNames('disabled')}
                    tooltip={messageUpDate}
                />
            );
        } else {
            return <Ico style={this.getStyle()} svgIcon={iconEcsEmpty as SvgIcon} size={Size._16} />;
        }
    }

    private getMessageInfo(): string {
        const component = this.getComponent();
        const hasNotLoadedAttachment = component.getProperty('hasNotLoadedAttachment');
        const isCreatedMessage = component.getProperty('isCreatedMessage');
        const messageTime = component.getProperty('messageTime');
        const uploadProgress = component.getProperty('uploadProgress');

        if (!hasNotLoadedAttachment && isCreatedMessage) {
            return messageTime;
        } else if (uploadProgress && uploadProgress !== 100) {
            return `${uploadProgress}%`;
        } else {
            return '';
        }
    }
}
