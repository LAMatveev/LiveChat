import * as classNames from 'classnames';
import * as iconEcsAttach from 'images/SvgIcons/iconEcsAttach.svg';
import * as iconEcsClose from 'images/SvgIcons/iconEcsClose.svg';
import { action } from 'mobx';
import * as React from 'react';
import {
    ChatMessageTextEditComponentInternal,
    IChatMessageTextEditComponentPropertySet
} from 'scripts/UiComponents/ChatMessageTextEdit/ChatMessageTextEditComponentInternal';

import { G5EcsAttachment } from '@1c/g5-client-base/Ecs/Model/G5EcsAttachment';
import { EditComponentView } from '@1c/g5-client-base/Ecs/UiComponents/Edit/EditComponentView';
import { Ico } from '@1c/g5-client-base/Ecs/UiComponents/Ico/View/Ico';
import { Size } from '@1c/g5-client-base/Ecs/UiComponents/PropertySets/IHasSizePropertySet';
import { SVGId } from '@1c/g5-client-base/Ecs/UiComponents/PropertySets/IHasSvgIdPropertySet';
import { sizeToStr } from '@1c/g5-client-base/Ecs/Utils/File';
import i18n from '@1c/g5-client-base/Ecs/i18n';
import { IPropsOverwrite } from '@1c/g5-client-base/UiComponents/UiComponent/IUiComponent';
import { viewForComponent } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentViewService';
import { SvgIcon } from '@1c/g5-client-base/View/Icon/SvgIcon';
import { MouseButton } from '@1c/g5-client-base/View/ReactDOM/MouseButton';

/** View поля ввода сообщения */
@viewForComponent(ChatMessageTextEditComponentInternal)
export class ChatMessageTextEditComponentView extends EditComponentView<
    IChatMessageTextEditComponentPropertySet,
    ChatMessageTextEditComponentInternal
> {
    /** @override */
    public componentDidMount() {
        super.componentDidMount();
        if (this.textElement) {
            this.textElement.scrollTop = this.getComponent().getProperty('scrollTop');
        }
    }

    /** @override */
    protected renderVisibleState(overwriteProps: IPropsOverwrite = {}) {
        const component = this.getComponent();
        const value = component.getCurrentEditText();
        const inputHint = component.getProperty('inputHint');
        const title = component.getProperty('title');
        const attachments = component.getAttachments().filter((attachment) => attachment.getVisible());
        const isStorageEnabled = component.getProperty('isStorageEnabled');
        const height = component.getProperty('height');
        const sendTooltip = component.getProperty('sendByControlEnter')
            ? i18n.t('IDS_SEND_BY_CTRL_ENTER_TIPTEXT')
            : i18n.t('IDS_SEND_BY_ENTER_TIPTEXT');
        this.getComponent().onMessageSend.on(() => {
            this.getComponent().setValue('');
            setTimeout(this.onInput, 0);
        });

        return (
            <div className={classNames('ecsMessage', 'flex-column', 'flex-1-1-auto', 'mt-4')} {...this.baseViewProps()}>
                <textarea
                    autoComplete='off'
                    spellCheck='false'
                    className={classNames('editArea', 'flex-1-1-auto')}
                    placeholder={inputHint}
                    disabled={!this.isEnabled}
                    readOnly={this.isReadOnly}
                    dir='auto'
                    title={title}
                    style={{
                        height: height,
                        minHeight: '1.5em',
                        maxHeight: '8.25em'
                    }}
                    value={value}
                    onClick={this.onInputClick}
                    onChange={(e) => {
                        this.onEditInput(e);
                        this.onInput();
                    }}
                    onInput={this.onInput}
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                    onPaste={this.onPaste}
                    onScroll={this.onScroll}
                    ref={this.refTextElement as (el: HTMLTextAreaElement) => void}
                />
                <div className={classNames('ecsAnswerInfo', 'flex', 'flex-0-0-auto', 'flex-ai-center', 'mt-4')}>
                    {isStorageEnabled && (
                        <Ico
                            style={this.getStyle()}
                            svgIcon={iconEcsAttach as SvgIcon}
                            size={Size._16}
                            className={classNames('pointer')}
                            tooltip={i18n.t('IDS_ATTACH_FILE_TIPTEXT')}
                            onClick={this.onAttachFileIcoClick}
                        />
                    )}
                    <div className={classNames('train', 'flex-1-1-100')}>
                        {attachments.map((attachment, index) => (
                            <div
                                key={index}
                                className={classNames('trainItem')}
                                title={`${attachment.getName()}\u0020\u0028${sizeToStr(attachment.getSize())}\u0029`}
                                onMouseUp={this.onAttachmentMouseUp.bind(this, attachment)}>
                                <div
                                    className={classNames('trainItemBox', 'fs-8MS', 'hover-line')}
                                    onClick={() => {
                                        this.onAttachmentClick(attachment);
                                    }}>
                                    <span className={classNames('trainTitle', 'dots')} dir='auto'>
                                        {`${attachment.getName()}\u0020\u0028${sizeToStr(attachment.getSize())}\u0029`}
                                    </span>
                                </div>
                                <Ico
                                    style={this.getStyle()}
                                    svgIcon={iconEcsClose as SvgIcon}
                                    size={Size._20}
                                    className={classNames('trainClose')}
                                    onClick={this.onAttachmentCloseIcoClick.bind(this, attachment)}
                                />
                            </div>
                        ))}
                    </div>
                    <div className={classNames('flex', 'flex-0-0-auto', 'flex-ai-center')}>
                        {!component.hasEditedMessage && !component.empty && (
                            <Ico
                                style={this.getStyle()}
                                svgId={SVGId.SEND}
                                size={Size._16}
                                className={classNames('rtlScale', 'pointer')}
                                tooltip={sendTooltip}
                                onClick={this.onMessageSendIcoClick}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    }

    @action
    protected onInput = (): void => {
        if (this.textElement) {
            this.textElement.style.height = '1.5em';
            this.textElement.style.height = this.textElement.scrollHeight + 'px';
            this.getComponent().setProperty('height', this.textElement.scrollHeight);
        }
    };

    private onScroll = (event: React.UIEvent<HTMLTextAreaElement>): void => {
        const scrollTop = event.currentTarget.scrollTop;
        this.getComponent().setProperty('scrollTop', scrollTop);
    };

    private onPaste = (event: React.ClipboardEvent<HTMLTextAreaElement>): void => {
        const data = event.clipboardData;
        if (data && data.items?.length > 0 && data.items[0]?.type === 'image/png') {
            event.preventDefault();
            this.getComponent().handleOnPastePictureEvent(data);
        }
        this.getComponent().handleOnPasteAttachmentEvent(data);
    };

    private onAttachFileIcoClick = (): void => {
        this.getComponent().handleOnAttachFileEvent();
    };

    private onAttachmentClick = (attachment: G5EcsAttachment): void => {
        this.getComponent().handleOnAttachmentClickEvent(attachment);
    };

    private onAttachmentMouseUp = (attachment: G5EcsAttachment, e: React.MouseEvent<HTMLDivElement>): void => {
        if (e.button === MouseButton.Middle) {
            this.getComponent().handleOnAttachmentCloseEvent(attachment);
        }
    };

    private onAttachmentCloseIcoClick = (attachment: G5EcsAttachment): void => {
        this.getComponent().handleOnAttachmentCloseEvent(attachment);
    };

    private onMessageSendIcoClick = (): void => {
        this.getComponent().handleOnMessageSendEvent();
        this.textElement?.focus();
    };
}
