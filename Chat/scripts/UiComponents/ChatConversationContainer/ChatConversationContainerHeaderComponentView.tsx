import * as classNames from 'classnames';
import * as iconEcsCloseBig from 'images/SvgIcons/iconEcsCloseBig.svg';
import * as React from 'react';
import { PostMessageObserverService } from 'scripts/Services/PostMessageObserverService/PostMessageObserverService';
import { ChatConversationContainerHeaderComponentInternal } from 'scripts/UiComponents/ChatConversationContainer/ChatConversationContainerHeaderComponentInternal';

import { getEcsContainer } from '@1c/g5-client-base/Ecs/Model/EcsContainer/EcsContainerImplService';
import { IEcsVideoService } from '@1c/g5-client-base/Ecs/Services/EcsVideoService/IEcsVideoService';
import { Ico } from '@1c/g5-client-base/Ecs/UiComponents/Ico/View/Ico';
import { Size } from '@1c/g5-client-base/Ecs/UiComponents/PropertySets/IHasSizePropertySet';
import { SVGId } from '@1c/g5-client-base/Ecs/UiComponents/PropertySets/IHasSvgIdPropertySet';
import i18n from '@1c/g5-client-base/Ecs/i18n';
import { getService } from '@1c/g5-client-base/Services/di';
import { kUrlSearchParamsKey } from '@1c/g5-client-base/Site/scripts/UiComponents/ConversationsPage/ConversationsPageComponentInternal';
import { IPropsOverwrite } from '@1c/g5-client-base/UiComponents/UiComponent/IUiComponent';
import { UiComponentView } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentView';
import { viewForComponent } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentViewService';
import { SvgIcon } from '@1c/g5-client-base/View/Icon/SvgIcon';

/** View заголовка контейнера обсуждения ECS */
@viewForComponent(ChatConversationContainerHeaderComponentInternal)
export class ChatConversationContainerHeaderComponentView extends UiComponentView<
    ChatConversationContainerHeaderComponentInternal
> {
    /** @override */
    protected renderVisibleState(overwriteProps: IPropsOverwrite = {}) {
        const urlParams = new URLSearchParams(sessionStorage.getItem(kUrlSearchParamsKey) || '');
        const titleText = urlParams.get('titleText');
        const isOpen = this.getComponent().getProperty('isOpen');
        const media = navigator.mediaDevices;
        const allowVideoconferences = urlParams.get('allowVideoconferences');

        return (
            <div
                className={classNames('chatTopline ecsTopline')}
                {...this.baseViewProps()}
                onMouseDown={this.onHeaderMouseDown}
                title={titleText || ''}>
                <div className={classNames('ecsHeader', 'flex')}>
                    {!isOpen && (
                        <Ico
                            svgId={SVGId.BUBBLE_DOUBLE}
                            size={Size._24}
                            className={classNames('ecsHeaderIco')}
                            style={this.getStyle()}
                        />
                    )}
                    <div className={classNames('flex-1-1-auto', 'flex', 'flex-ai-center')}>
                        <div className={classNames('chatToplineBox toplineBox')} data-title={titleText} dir='auto' />
                    </div>
                    <div className={classNames('flex flex-0-0-auto flex-ai-center')}>
                        {getEcsContainer().videoCallsAllowed() &&
                            allowVideoconferences === 'allowed' &&
                            isOpen &&
                            media !== undefined &&
                            this.getComponent().hasInterlocutor && (
                                <Ico
                                    svgId={SVGId.CAMERA}
                                    size={Size._16}
                                    tooltip={
                                        getService(IEcsVideoService).videoCallOnAir
                                            ? i18n.t('IDS_GOTO_VIDEO_CALL')
                                            : i18n.t('IDS_VIDEO_CALL')
                                    }
                                    className={classNames(
                                        'iHoverRound',
                                        'ico-28',
                                        getService(IEcsVideoService).videoCallOnAir ? 'iHoverRoundInvert' : ''
                                    )}
                                    onClick={this.onVideoCallPressClick}
                                    style={this.getStyle()}
                                />
                            )}
                        {isOpen && (
                            <Ico
                                svgIcon={iconEcsCloseBig as SvgIcon}
                                size={Size._16}
                                tooltip={i18n.t('IDS_CLOSE')}
                                className={classNames('iHoverRound', 'ico-28')}
                                onClick={this.onClosePressClick}
                                disabled={getService(IEcsVideoService).videoCallOnAir}
                                style={this.getStyle()}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    }

    private onHeaderMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        PostMessageObserverService.sendMessage('headerMouseDown', {
            offsetX: e.screenX,
            offsetY: e.screenY
        });
        window.addEventListener('mouseup', this.onHeaderMouseUp);
        window.addEventListener('mousemove', this.onHeaderMouseMove);
    };

    private onHeaderMouseMove = (e: MouseEvent) => {
        PostMessageObserverService.sendMessage('headerMouseMove', {
            offsetX: e.screenX,
            offsetY: e.screenY
        });
    };

    private onHeaderMouseUp = () => {
        PostMessageObserverService.channelMessage('headerMouseUp').then((data) => {
            localStorage.setItem('chatHeight', data.height);
            localStorage.setItem('chatOffsetLeft', data.offsetLeft);
        });

        window.removeEventListener('mouseup', this.onHeaderMouseUp);
        window.removeEventListener('mousemove', this.onHeaderMouseMove);
    };

    private onVideoCallPressClick = (e: React.MouseEvent<Element, MouseEvent>): void => {
        this.getComponent().handleOnVideoCallClickEvent();
        e.stopPropagation();
    };

    private onClosePressClick = (e: React.MouseEvent<Element, MouseEvent>): void => {
        if (!getService(IEcsVideoService).videoCallOnAir) {
            this.getComponent().handleOnCloseClickEvent();
            e.stopPropagation();
        }
    };
}
