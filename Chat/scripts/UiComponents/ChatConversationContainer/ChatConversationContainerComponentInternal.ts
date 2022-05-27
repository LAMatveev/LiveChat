import { IValueDidChange, action } from 'mobx';
import { PostMessageObserverService } from 'scripts/Services/PostMessageObserverService/PostMessageObserverService';
import { ChatConversationContainerHeaderComponent } from 'scripts/UiComponents/ChatConversationContainer/ChatConversationContainerHeaderComponent';
import { ChatMessageTextEditComponent } from 'scripts/UiComponents/ChatMessageTextEdit/ChatMessageTextEditComponent';
import { ChatMessagesListComponent } from 'scripts/UiComponents/ChatMessagesList/ChatMessagesListComponent';
import { ChatMessagesListItemComponent } from 'scripts/UiComponents/ChatMessagesList/ChatMessagesListItemComponent';

import { PropertySetDescr, makeDefaultComponentPropertySet } from '@1c/g5-client-base/Components/IBaseComponent';
import { G5EcsConversation } from '@1c/g5-client-base/Ecs/Model/Conversation/G5EcsConversation';
import { getEcsContainer } from '@1c/g5-client-base/Ecs/Model/EcsContainer/EcsContainerImplService';
import { ecsManager } from '@1c/g5-client-base/Ecs/Model/EcsManager/EcsManager';
import { G5EcsMessage } from '@1c/g5-client-base/Ecs/Model/G5EcsMessage';
import { G5EcsConversationId } from '@1c/g5-client-base/Ecs/Model/G5EcsTypes';
import { G5EcsUser } from '@1c/g5-client-base/Ecs/Model/G5EcsUser';
import { IEcsVideoService } from '@1c/g5-client-base/Ecs/Services/EcsVideoService/IEcsVideoService';
import {
    ConversationContainerComponentInternal,
    IConversationsContainerComponentPropertySet,
    defaultConversationsContainerComponentPropertySet
} from '@1c/g5-client-base/Ecs/UiComponents/ConversationContainer/ConversationContainerComponentInternal';
import { LocalStorage } from '@1c/g5-client-base/Ecs/Utils/LocalStorage';
import { getService } from '@1c/g5-client-base/Services/di';
import { kUrlSearchParamsKey } from '@1c/g5-client-base/Site/scripts/UiComponents/ConversationsPage/ConversationsPageComponentInternal';
import { IListItemOwner } from '@1c/g5-client-base/UiComponents/BaseListItem/BaseListItemComponent';
import { IUiComponentsOwner } from '@1c/g5-client-base/UiComponents/UiComponent/IUiComponent';
import { createComponent } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponent';
import { G5Promise } from '@1c/g5-client-base/Utils/G5Promise';

/** Интерфейс компонента контейнера обсуждения */
export interface IChatConversationsContainerComponentPropertySet extends IConversationsContainerComponentPropertySet {
    isOpen: boolean;
}

export const defaultChatConversationsContainerComponentPropertySet: PropertySetDescr<IChatConversationsContainerComponentPropertySet> = makeDefaultComponentPropertySet(
    defaultConversationsContainerComponentPropertySet,
    {
        isOpen: false
    }
);

/** Компонент контейнера обсуждения чата */
export class ChatConversationContainerComponentInternal extends ConversationContainerComponentInternal<
    IChatConversationsContainerComponentPropertySet
> {
    public onNewMessageInCurrentConversation: ((conversationId: G5EcsConversationId) => Promise<void>) | null = null;
    public readonly messagesList: ChatMessagesListComponent;
    public readonly header: ChatConversationContainerHeaderComponent;
    public readonly messageTextEdit: ChatMessageTextEditComponent;

    constructor(owner: IUiComponentsOwner) {
        super(owner);
        this.messagesList = this.createOwnComponent(ChatMessagesListComponent, this.onCreateMessageListItem);
        this.messageTextEdit = createComponent(ChatMessageTextEditComponent, this);
        this.header = this.createOwnComponent(ChatConversationContainerHeaderComponent);
        let currentConversationBindingItems = [
            this.header,
            this.messagesList,
            this.messageTextEdit,
            this.messageDataSource
        ];
        this.createCurrentConversationIdBindings(currentConversationBindingItems);
        PostMessageObserverService.currentMessageEvent.observe(this.parseChatMessage);
    }

    /** @override */
    public static getDefaultProperties() {
        return defaultChatConversationsContainerComponentPropertySet;
    }

    /** @override */
    protected afterCreate() {
        super.afterCreate();
        if (!document.body.classList.contains('ecs-chat-hide')) {
            this.open();
        }
    }

    /** @override */
    protected onBeforeMessageSend = () => {
        return this.addInfoMessage();
    };

    protected addInfoMessage(): G5Promise<void> {
        const conversationId = this.getProperty('currentConversationId');
        if (!conversationId) {
            return G5Promise.resolve();
        }
        const conversation = G5EcsConversation.getById(conversationId);

        return PostMessageObserverService.channelMessage('requestUrlLocation').then((res) => {
            if (
                res.url !== localStorage.getItem('urlLocation') ||
                res.title !== localStorage.getItem('titleLocation')
            ) {
                localStorage.setItem('urlLocation', res.url);
                localStorage.setItem('titleLocation', res.title);
                conversation?.addInfoMessage('user.changed', {
                    urlLocation: {
                        title: res.title,
                        url: res.url
                    }
                });
            }
        });
    }

    /** @override */
    protected async handleNewMessageInCurrentConversationInternal(): Promise<void> {
        await super.handleNewMessageInCurrentConversationInternal();
        if (!this.getProperty('isOpen')) {
            PostMessageObserverService.sendMessage('headerMouseUp');
        }
    }

    protected open() {
        this.setProperty('isOpen', true);
        this.header.setProperty('isOpen', true);
    }

    @action
    protected startVideoconference(): void {
        const conversation = this.getProperty('currentConversationId') as G5EcsConversationId;
        const videoInputSource = LocalStorage.getValue('videoInputSource') || undefined;
        const audioInputSource = LocalStorage.getValue('audioInputSource') || undefined;
        getService(IEcsVideoService).startVideoCall(
            this,
            G5EcsConversation.getById(conversation)
                .getMembers()
                .filter((member) => member !== ecsManager.getCurrentUserId()),
            conversation,
            videoInputSource,
            audioInputSource
        );
    }

    @action
    protected onCreateMessageListItem = (
        owner: IListItemOwner,
        message: G5EcsMessage
    ): ChatMessagesListItemComponent => {
        const messagesListItem = createComponent(
            ChatMessagesListItemComponent,
            owner,
            message,
            this.onRemoveMessageListItem,
            this.canEditMessage
        );
        messagesListItem.onReply.on(this.onMessageReply);
        messagesListItem.onQuote.on(this.onMessageQuote);
        messagesListItem.onEditStart.on(this.onMessageEditStart);
        messagesListItem.onUserInfoClick.on(this.onMessageUserInfoClick);

        return messagesListItem;
    };

    @action
    protected onRemoveMessageListItem = (messagesListItem: ChatMessagesListItemComponent) => {
        messagesListItem.onReply.off(this.onMessageReply);
        messagesListItem.onQuote.off(this.onMessageQuote);
        messagesListItem.onEditStart.off(this.onMessageEditStart);
        messagesListItem.onUserInfoClick.off(this.onMessageUserInfoClick);
    };

    @action // tslint:disable-next-line:max-func-body-length
    private parseChatMessage = (e: IValueDidChange<MessageEvent | null>) => {
        const ev = e.newValue;
        if (ev) {
            const data = ev.data;
            switch (data.message) {
                case 'open':
                    this.open();
                    break;
                case 'close':
                    this.setProperty('isOpen', false);
                    this.header.setProperty('isOpen', false);
                    break;
                case 'sendMessage':
                    if (
                        !data.data.text ||
                        !(data.data.textFormat === 'text/plain' || data.data.textFormat === 'text/html')
                    ) {
                        return;
                    }
                    const currentConversation = this.getProperty('currentConversationId');
                    if (currentConversation) {
                        const conversation = G5EcsConversation.getById(currentConversation);
                        conversation.addMessage(
                            data.data.text,
                            [],
                            data.data.textFormat === 'text/html' ? 'HTML' : 'PLAIN',
                            []
                        );
                        conversation.dispose();
                    }
                    break;
                case 'getContactInfo':
                    if (!ev.ports[0]) {
                        return;
                    }
                    const currentUser = G5EcsUser.get(ecsManager.getCurrentUserId());
                    ev.ports[0].postMessage({
                        message: 'getContactInfoOK',
                        data: {
                            name: currentUser.getName(),
                            email: currentUser.getEmail(),
                            phone: currentUser.getPhone(),
                            fullName: currentUser.getFullName()
                        }
                    });
                    break;
                case 'isVideoconferenceEnabled':
                    PostMessageObserverService.respondMessage(
                        ev,
                        'isVideoconferenceEnabledOK',
                        getEcsContainer().videoCallsAllowed() &&
                            new URLSearchParams(sessionStorage.getItem(kUrlSearchParamsKey) || '').get(
                                'allowVideoconferences'
                            ) === 'allowed' &&
                            navigator.mediaDevices !== undefined
                    );
                    break;
                case 'startVideoconference':
                    if (
                        getEcsContainer().videoCallsAllowed() &&
                        new URLSearchParams(sessionStorage.getItem(kUrlSearchParamsKey) || '').get(
                            'allowVideoconferences'
                        ) === 'true' &&
                        navigator.mediaDevices !== undefined &&
                        !getService(IEcsVideoService).videoCallOnAir
                    ) {
                        this.startVideoconference();
                    }
                    break;
            }
        }
    };
}
