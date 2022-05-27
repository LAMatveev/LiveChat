import { ConversationContainerComponent } from 'scripts/UiComponents/ChatConversationContainer/ChatConversationContainerComponent';
import { ecsManager } from '@1c/g5-client-base/Ecs/Model/EcsManager/EcsManager';
import { G5EcsConversationId } from '@1c/g5-client-base/Ecs/Model/G5EcsTypes';
import { ConversationsPageComponentInternal } from '@1c/g5-client-base/Site/scripts/UiComponents/ConversationsPage/ConversationsPageComponentInternal';
import { IUiComponentsOwner } from '@1c/g5-client-base/UiComponents/UiComponent/IUiComponent';

/** Отображает страницу обсуждений ECS */
export class ChatConversationsPageComponentInternal extends ConversationsPageComponentInternal {
    public readonly conversationContainer: ConversationContainerComponent;

    constructor(owner: IUiComponentsOwner) {
        super(owner);
        this.conversationContainer = this.createOwnComponent(ConversationContainerComponent);
        let currentConversationBindingItems = [this.conversationContainer];
        this.createCurrentConversationIdBindings(currentConversationBindingItems);
    }

    /** @override */
    protected afterCreate() {
        super.afterCreate();
        ecsManager.getOrCreateWebchat().then((res) => this.gotoConversation(res.getId() as G5EcsConversationId).then());
    }

    /** @override */
    // tslint:disable-next-line:no-empty
    protected onNotificationAdded = () => {};
}
