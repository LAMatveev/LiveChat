import { action, computed } from 'mobx';
import { PostMessageObserverService } from 'scripts/Services/PostMessageObserverService/PostMessageObserverService';

import { PropertySetDescr, makeDefaultComponentPropertySet } from '@1c/g5-client-base/Components/IBaseComponent';
import { G5EcsConversation } from '@1c/g5-client-base/Ecs/Model/Conversation/G5EcsConversation';
import { ecsManager } from '@1c/g5-client-base/Ecs/Model/EcsManager/EcsManager';
import { G5EcsConversationId, G5EcsUserId } from '@1c/g5-client-base/Ecs/Model/G5EcsTypes';
import { G5EcsUser } from '@1c/g5-client-base/Ecs/Model/G5EcsUser';
import { IEcsVideoService } from '@1c/g5-client-base/Ecs/Services/EcsVideoService/IEcsVideoService';
import {
    ConversationContainerHeaderComponentInternal,
    IConversationContainerHeaderComponentPropertySet,
    defaultConversationContainerHeaderComponentPropertySet
} from '@1c/g5-client-base/Ecs/UiComponents/ConversationContainer/ConversationContainerHeaderComponentInternal';
import { LocalStorage } from '@1c/g5-client-base/Ecs/Utils/LocalStorage';
import { getService } from '@1c/g5-client-base/Services/di';

/** Набор свойств заголовка контейнера обсуждения ECS */
export interface IChatConversationContainerHeaderComponentPropertySet
    extends IConversationContainerHeaderComponentPropertySet {
    isOpen: boolean;
}

/** Значения по умолчанию свойств заголовка контейнера обсуждения ECS */
const defaultChatConversationContainerHeaderComponentPropertySet: PropertySetDescr<IConversationContainerHeaderComponentPropertySet> = makeDefaultComponentPropertySet(
    defaultConversationContainerHeaderComponentPropertySet,
    {
        isOpen: false
    }
);

/** Отображает заголовок контейнера обсуждения ECS */
export class ChatConversationContainerHeaderComponentInternal extends ConversationContainerHeaderComponentInternal<
    IChatConversationContainerHeaderComponentPropertySet
> {
    /** @override */
    public static getDefaultProperties(): PropertySetDescr<IConversationContainerHeaderComponentPropertySet> {
        return defaultChatConversationContainerHeaderComponentPropertySet;
    }

    /** @override */
    @action
    public handleOnVideoCallClickEvent(): void {
        const conversation = this.getProperty('currentConversationId') as G5EcsConversationId;
        const videoInputSource = LocalStorage.getValue('videoInputSource') || undefined;
        const audioInputSource = LocalStorage.getValue('audioInputSource') || undefined;
        if (!getService(IEcsVideoService).videoCallOnAir) {
            const members = G5EcsConversation.getById(conversation)
                .getMembers()
                .filter((member) => member !== ecsManager.getCurrentUserId() && !G5EcsUser.get(member).getBot());
            getService(IEcsVideoService).startVideoCall(
                this,
                members,
                conversation,
                videoInputSource,
                audioInputSource
            );
        } else {
            getService(IEcsVideoService)
                .currentVideoCallForm.get()
                ?.setProperty('hidden', false);
        }
    }

    @action
    public handleOnCloseClickEvent(): void {
        PostMessageObserverService.sendMessage('close');
    }

    @computed
    public get hasInterlocutor(): boolean {
        const conversationId = this.getProperty('currentConversationId');
        if (!conversationId) {
            return false;
        }
        const members = G5EcsConversation.getById(conversationId).getMembers();

        return (
            members.filter((memberId: G5EcsUserId) => {
                return !G5EcsUser.get(memberId).getBot();
            }).length > 1
        );
    }
}
