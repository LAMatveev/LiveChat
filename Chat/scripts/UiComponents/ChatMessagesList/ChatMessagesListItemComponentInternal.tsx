import * as classNames from 'classnames';
import { action, observable } from 'mobx';
import * as React from 'react';
import { ChatAttachmentsComponent } from 'scripts/UiComponents/ChatAttachments/ChatAttachmentsComponent';
import { ChatUserComponent } from 'scripts/UiComponents/ChatUser/ChatUserComponent';

import { G5EcsMessage } from '@1c/g5-client-base/Ecs/Model/G5EcsMessage';
import { G5EcsUserId } from '@1c/g5-client-base/Ecs/Model/G5EcsTypes';
import {
    CanEditCallback,
    HandlerOnRemoveMessageListItem,
    MessagesListItemComponentInternal
} from '@1c/g5-client-base/Ecs/UiComponents/MessagesList/MessagesListItemComponentInternal';
import { IListItemOwner } from '@1c/g5-client-base/UiComponents/BaseListItem/BaseListItemComponent';

/** Отображает элемент списка сообщений ECS */
export class ChatMessagesListItemComponentInternal extends MessagesListItemComponentInternal {
    @observable.ref
    public authorComponent: ChatUserComponent | undefined;

    @observable.ref
    public attachmentsComponent: ChatAttachmentsComponent;

    constructor(
        owner: IListItemOwner,
        message: G5EcsMessage,
        onRemoveListItem: HandlerOnRemoveMessageListItem<ChatMessagesListItemComponentInternal>,
        canEditMessage: CanEditCallback
    ) {
        super(owner, message, onRemoveListItem as HandlerOnRemoveMessageListItem, canEditMessage);
        this.attachmentsComponent = this.createOwnComponent(ChatAttachmentsComponent, message);
        this.attachmentsComponent.onContextMenu = null;
        this.authorComponent = this.createAuthorComponent(message.getAuthorId(), kAuthorClassName);
    }

    public isInfoMessage(): boolean {
        return this.getData().getType() === 'INFO';
    }

    /** @override */
    protected createAuthorComponent(authorId: G5EcsUserId, authorClassName: string): ChatUserComponent {
        return this.createOwnComponent(ChatUserComponent, authorId)
            .setProperty('className', authorClassName)
            .setProperty('withUserInfo', true);
    }

    @action
    protected onMessageAttachmentsChanged = (): void => {
        this.attachmentsComponent.dispose();
        this.attachmentsComponent = this.createOwnComponent(ChatAttachmentsComponent, this.getData());
        this.attachmentsComponent.onContextMenu = null;
    };
}

const kAuthorClassName = classNames('ecsChatName', 'bold', 'dots');
