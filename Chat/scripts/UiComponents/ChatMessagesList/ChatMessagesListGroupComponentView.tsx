import * as classNames from 'classnames';
import * as React from 'react';
import { ChatMessagesListGroupComponentInternal } from 'scripts/UiComponents/ChatMessagesList/ChatMessagesListGroupComponentInternal';
import { ChatUserComponent } from 'scripts/UiComponents/ChatUser/ChatUserComponent';

import { IRect, ISize } from '@1c/g5-client-base/Base/Utils/math';
import { MessagesListScrollMode } from '@1c/g5-client-base/Ecs/UiComponents/MessagesList/MessagesListGroupComponent';
import { ResizableContainer } from '@1c/g5-client-base/Ecs/UiComponents/ResizableContainer/View/ResizableContainer';
import i18n from '@1c/g5-client-base/Ecs/i18n';
import { getElementScrollInfo } from '@1c/g5-client-base/UiComponents/PropertySets/IHasScrollHandlerPropertySet';
import { IPropsOverwrite } from '@1c/g5-client-base/UiComponents/UiComponent/IUiComponent';
import { UiComponentView } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentView';
import { viewForComponent } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentViewService';

/** View контейнера списка сообщений ECS */
@viewForComponent(ChatMessagesListGroupComponentInternal)
// tslint:disable-next-line:max-line-length
export class ChatMessagesListGroupComponentView extends UiComponentView<ChatMessagesListGroupComponentInternal> {
    public scrollRef: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();

    /** @override */
    public componentDidUpdate() {
        super.componentDidUpdate();
        this.scrollIntoViewIfNeeded();
    }

    /** @override */
    public componentDidMount() {
        super.componentDidMount();
        this.scrollIntoViewIfNeeded();
    }

    /** @override */
    protected renderVisibleState(overwriteProps: IPropsOverwrite = {}) {
        const component = this.getComponent();
        const hasScroll = component.getProperty('hasScroll');
        const childrenView = component.getChildren().map((childComponent) => this.createChildView(childComponent));
        const dir = document.documentElement.getAttribute('dir');

        return (
            <ResizableContainer
                className={classNames('ecsChat')}
                style={{
                    ...(!hasScroll && (dir === 'ltr' ? { paddingRight: '12px' } : { paddingLeft: '12px' }))
                }}
                onResize={this.handleOnResizeEvent}
                onScroll={this.handleOnScrollEvent}
                onDrop={this.handleDropEvent}
                onDragOver={this.handleDragOverEvent}
                divRef={this.scrollRef}>
                <div className={classNames('ecsChatBlock', 'flex-ai-center')}>
                    <div className={classNames('ecsChatService', 'flex-ai-center', 'flex', 'dots')}>
                        <div className={classNames('ecsChatTyping', 'flex', 'flex-1-1-100', 'dots')}>
                            {this.getTypingNames(component.typingUsers)}
                        </div>
                    </div>
                    {childrenView.reverse()}
                </div>
            </ResizableContainer>
        );
    }

    private getTypingNames(typingUsers: ChatUserComponent[]): React.ReactNode {
        const count = typingUsers.length;
        if (count === 0) {
            return <React.Fragment />;
        } else if (count <= kMaxTypingNames) {
            return (
                <React.Fragment>
                    {typingUsers.map((typingUser, index) => (
                        <React.Fragment key={index}>
                            {typingUser.createView(this)}
                            {index < count - 1 && ',\u0020'}
                        </React.Fragment>
                    ))}
                    {i18n.t('IDS_TYPING_NAMES', { count: count })}
                </React.Fragment>
            );
        } else {
            return <React.Fragment>{i18n.t('IDS_TYPING_NUMS', { count: count })}</React.Fragment>;
        }
    }

    private scrollIntoViewIfNeeded(): void {
        const component = this.getComponent();
        const scrollMode = component.getProperty('scrollMode');
        if (scrollMode === MessagesListScrollMode.STICKY_TO_BOTTOM && this.scrollRef.current) {
            this.scrollRef.current.scrollTop =
                this.scrollRef.current.scrollHeight - this.scrollRef.current.clientHeight;
        }
    }

    private handleOnResizeEvent = (rect: IRect, scrollSize: ISize): void => {
        this.getComponent().handleOnResizeEvent(rect, scrollSize, this.scrollRef?.current);
    };

    private handleOnScrollEvent = (e: React.SyntheticEvent<HTMLDivElement>): void => {
        this.getComponent().handleOnScrollEvent(getElementScrollInfo(e.target as HTMLElement));
    };
}

const kMaxTypingNames = 3;
