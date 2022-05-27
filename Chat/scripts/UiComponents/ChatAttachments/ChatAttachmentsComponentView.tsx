import * as classNames from 'classnames';
import * as React from 'react';
import { ChatAttachmentsComponentInternal } from 'scripts/UiComponents/ChatAttachments/ChatAttachmentsComponentInternal';
import { ChatAttachmentIco } from 'scripts/UiComponents/ChatIco/ChatAttachmentIco';
import { icons } from 'scripts/UiComponents/FileIcons';

import { G5EcsAttachment } from '@1c/g5-client-base/Ecs/Model/G5EcsAttachment';
import { Size } from '@1c/g5-client-base/Ecs/UiComponents/PropertySets/IHasSizePropertySet';
import { deletedStatuses, getTypeClassNameSuffix, sizeToStr } from '@1c/g5-client-base/Ecs/Utils/File';
import i18n from '@1c/g5-client-base/Ecs/i18n/i18n';
import { IPropsOverwrite } from '@1c/g5-client-base/UiComponents/UiComponent/IUiComponent';
import { UiComponentView } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentView';
import { viewForComponent } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentViewService';
import { SvgIcon } from '@1c/g5-client-base/View/Icon/SvgIcon';

/** View вложений сообщения ECS */
@viewForComponent(ChatAttachmentsComponentInternal)
export class ChatAttachmentsComponentView extends UiComponentView<ChatAttachmentsComponentInternal> {
    /** @override */
    protected renderVisibleState(overwriteProps: IPropsOverwrite = {}) {
        const component = this.getComponent();
        const attachments = component.getProperty('attachments').filter((attachment) => attachment.getVisible());

        return (
            <React.Fragment>
                {attachments.map((attachment, index) => (
                    <React.Fragment key={index}>
                        <div
                            className={classNames(
                                'ecsChatFile',
                                `iFile${getTypeClassNameSuffix(attachment.getName(), attachment.getContentType())}`,
                                {
                                    'line-through': deletedStatuses.includes(attachment.getContentStatus())
                                }
                            )}
                            onClick={this.onAttachmentClick.bind(this, attachment)}>
                            <ChatAttachmentIco
                                style={this.getStyle()}
                                svgIcon={this.getIco(
                                    getTypeClassNameSuffix(attachment.getName(), attachment.getContentType())
                                )}
                                size={Size._16}
                            />
                            <div>
                                <span className={classNames('ecsChatFileTitle')}>
                                    {`${attachment.getName()}\u0020`}
                                </span>
                                <span className={classNames('ecsChatFileSize')}>
                                    {`${sizeToStr(attachment.getSize())}`}
                                </span>
                                <a href='#' onClick={this.onAttachmentDownloadClick.bind(this, attachment)}>
                                    {i18n.t('IDS_DOWNLOAD')}
                                </a>
                            </div>
                        </div>
                        {index < attachments.length - 1 && <div />}
                    </React.Fragment>
                ))}
            </React.Fragment>
        );
    }

    private getIco(suffix: string): SvgIcon {
        if (icons[suffix]) {
            return icons[suffix];
        } else {
            return icons['Unknown'];
        }
    }

    private onAttachmentClick = (attachment: G5EcsAttachment, event: React.MouseEvent<HTMLDivElement>): void => {
        event.stopPropagation();
        event.preventDefault();
        this.getComponent().handleOnAttachmentClickEvent(attachment);
    };

    private onAttachmentDownloadClick = (
        attachment: G5EcsAttachment,
        event: React.MouseEvent<HTMLAnchorElement>
    ): void => {
        event.stopPropagation();
        event.preventDefault();

        this.getComponent().handleOnDownloadClickEvent(attachment);
    };
}
