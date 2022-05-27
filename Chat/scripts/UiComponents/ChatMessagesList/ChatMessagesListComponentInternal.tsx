import { ChatMessagesListGroupComponent } from 'scripts/UiComponents/ChatMessagesList/ChatMessagesListGroupComponent';
import { G5EcsMessage } from '@1c/g5-client-base/Ecs/Model/G5EcsMessage';
import { MessagesListComponent } from '@1c/g5-client-base/Ecs/UiComponents/MessagesList/MessagesListComponent';
import { HandlerListOnCreateListItem } from '@1c/g5-client-base/UiComponents/List/BaseListComponentWithNavigation';
import { IUiComponentsOwner } from '@1c/g5-client-base/UiComponents/UiComponent/IUiComponent';

/** Отображает список сообщений ECS */
export class ChatMessagesListComponentInternal extends MessagesListComponent {
    protected readonly messagesListGroup: ChatMessagesListGroupComponent;

    constructor(owner: IUiComponentsOwner, onCreateListItem: HandlerListOnCreateListItem<G5EcsMessage>) {
        super(owner, onCreateListItem);
        this.messagesListGroup = this.createOwnComponent(ChatMessagesListGroupComponent);
        this.messagesListGroup.onScroll.on(this.onMessagesListGroupScroll);
    }
}
