import * as classNames from 'classnames';
import { computed } from 'mobx';
import { ChatMessagesListItemComponent } from 'scripts/UiComponents/ChatMessagesList/ChatMessagesListItemComponent';
import { ChatUserComponent } from 'scripts/UiComponents/ChatUser/ChatUserComponent';
import { MessagesListGroupComponent } from '@1c/g5-client-base/Ecs/UiComponents/MessagesList/MessagesListGroupComponent';

/** Контейнер списка сообщений ECS */
export class ChatMessagesListGroupComponentInternal extends MessagesListGroupComponent<ChatMessagesListItemComponent> {
    @computed
    public get typingUsers(): ChatUserComponent[] {
        const typingUsers: ChatUserComponent[] = [];
        for (const userId of this.getProperty('typingUserIds')) {
            const typingUser = this.createOwnComponent(ChatUserComponent, userId).setProperty(
                'className',
                classNames('dots', 'inline')
            );
            typingUsers.push(typingUser);
        }

        return typingUsers.sort((a, b) => (a.getPresentation() > b.getPresentation() ? 1 : -1));
    }
}
