import * as classNames from 'classnames';
import * as React from 'react';
import { PostMessageObserverService } from 'scripts/Services/PostMessageObserverService/PostMessageObserverService';
import { ChatVideoCallFormComponentInternal } from 'scripts/UiComponents/ChatVideoCallForm/ChatVideoCallFormComponentInternal';

import * as iconEcsCloseBig from '/images/SvgIcons/iconEcsCloseBig.svg';
import { isInterfaceMobile } from '@1c/g5-client-base/Base/Env/interfaceKind';
import { IRect } from '@1c/g5-client-base/Base/Utils/math';
import { allowScreenSharing } from '@1c/g5-client-base/Ecs/Base/Env/BrowserFeature';
import { Ico } from '@1c/g5-client-base/Ecs/UiComponents/Ico/View/Ico';
import { Size } from '@1c/g5-client-base/Ecs/UiComponents/PropertySets/IHasSizePropertySet';
import { SVGId } from '@1c/g5-client-base/Ecs/UiComponents/PropertySets/IHasSvgIdPropertySet';
import { ResizableContainer } from '@1c/g5-client-base/Ecs/UiComponents/ResizableContainer/View/ResizableContainer';
import i18n from '@1c/g5-client-base/Ecs/i18n';
import { ConferenceMemberComponent } from '@1c/g5-client-base/Site/scripts/UiComponents/ConferenceMember/ConferenceMemberComponent';
import { Video } from '@1c/g5-client-base/Site/scripts/UiComponents/Video/View/Video';
import { IPropsOverwrite } from '@1c/g5-client-base/UiComponents/UiComponent/IUiComponent';
import { UiComponentView } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentView';
import { viewForComponent } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentViewService';
import { SvgIcon } from '@1c/g5-client-base/View/Icon/SvgIcon';
import { assert } from '@1c/g5-client-base/debug';

/** View формы видеозвонка системы взаимодействия */
@viewForComponent(ChatVideoCallFormComponentInternal)
export class ChatVideoCallFormComponentView extends UiComponentView<ChatVideoCallFormComponentInternal> {
    public divRef: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();

    /** @override */
    protected renderVisibleState(overwriteProps: IPropsOverwrite = {}) {
        const component = this.getComponent();
        const audioStatus = component.getProperty('audioStatus');
        const videoStatus = component.getProperty('videoStatus');
        const fullscreened = component.getProperty('fullscreened');
        const fullscreenable = component.getProperty('fullscreenable');
        const localVideoStream = component.getProperty('localVideoStream');
        const text = component.getProperty('text');
        const columns = component.getProperty('columns');
        const rows = component.getProperty('rows');
        const screenSharing = component.getProperty('screenSharing');

        return (
            <div
                className={classNames('flex', 'flex-1-1-100')}
                tabIndex={0}
                {...this.baseViewProps()}
                ref={this.divRef}>
                <div className={classNames('cloudRow', 'flex-1-1-100')}>
                    {!fullscreened && (
                        <div
                            className={classNames('chatTopline ecsTopline')}
                            {...this.baseViewProps()}
                            onMouseDown={this.onHeaderMouseDown}>
                            <div className={classNames('ecsHeader', 'flex')}>
                                <div className={classNames('flex-1-1-auto', 'flex', 'flex-ai-center')}>
                                    <div
                                        className={classNames('chatToplineBox toplineBox')}
                                        data-title={i18n.t('IDS_VIDEO_CALL')}
                                        dir='auto'
                                    />
                                </div>
                                <div className={classNames('flex flex-0-0-auto flex-ai-center')}>
                                    <Ico
                                        svgId={SVGId.BUBBLE}
                                        size={Size._16}
                                        tooltip={i18n.t('IDS_GOTO_CONVERSATION')}
                                        className={classNames('iHoverRound', 'ico-28', 'iHoverRoundInvert')}
                                        onClick={this.onGoToChatIcoClick}
                                        onMouseDown={(event) => {
                                            event.stopPropagation();
                                        }}
                                        style={this.getStyle()}
                                    />
                                    <Ico
                                        svgIcon={iconEcsCloseBig as SvgIcon}
                                        size={Size._16}
                                        disabled={true}
                                        className={classNames('iHoverRound', 'ico-28')}
                                        style={this.getStyle()}
                                        onMouseDown={(event) => {
                                            event.stopPropagation();
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    <div
                        className={classNames('ecsVideo', 'flex-row-reverse', {
                            ecsVideoText: !!text,
                            flexCenter: !!text,
                            screenSharing: screenSharing
                        })}
                        data-content={text}
                        style={fullscreened ? { top: 0 } : {}}>
                        <div
                            className={classNames(
                                'ecsVideoUsers',
                                'flex-row-reverse',
                                'flex-0-0-auto',
                                'flex-ai-start'
                            )}>
                            {!!localVideoStream && (
                                <div className={classNames('videoMine')}>
                                    <div className={classNames('videoUser')}>
                                        <Video stream={localVideoStream} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={classNames('ecsVideoChat', 'flex-1-1-100')}>
                            <ResizableContainer
                                className={classNames('videoChat')}
                                style={{
                                    width: Math.floor(100 / columns) + '%',
                                    height: Math.floor(100 / rows) + '%'
                                }}
                                onResize={this.onVideoChatResize}>
                                {component.members
                                    .filter((member): member is ConferenceMemberComponent => {
                                        return member.getProperty('active');
                                    })
                                    .map((member) => member.createView(this))}
                            </ResizableContainer>
                        </div>
                        <div className={classNames('ecsVideoPress', 'flex-row-reverse', 'flex-wrap', 'flex-jc-center')}>
                            <Ico
                                style={this.getStyle()}
                                size={Size._40}
                                svgSize={Size._24}
                                svgId={SVGId.CALL_OFF}
                                tooltip={i18n.t('IDS_END_CALL')}
                                className={classNames('iPressRound', 'iPressRoundRed', 'fillWhite')}
                                onClick={this.onEndCallIcoClick}
                            />
                            <Ico
                                style={this.getStyle()}
                                size={Size._40}
                                svgSize={Size._20}
                                svgId={SVGId.CAMERA}
                                tooltip={this.getCameraIcoTooltip()}
                                className={classNames('iPressRound', {
                                    crossed: videoStatus !== 'ENABLED',
                                    exclamation: videoStatus === 'BUSY' || videoStatus === 'MISSING'
                                })}
                                onClick={this.onToggleCameraIcoClick}
                            />
                            <Ico
                                style={this.getStyle()}
                                size={Size._40}
                                svgSize={Size._20}
                                svgId={SVGId.MIC}
                                tooltip={this.getMicrophoneIcoTooltip()}
                                className={classNames('iPressRound', {
                                    crossed: audioStatus !== 'ENABLED',
                                    exclamation: audioStatus === 'BUSY' || audioStatus === 'MISSING'
                                })}
                                onClick={this.onToggleMicrophoneIcoClick}
                            />
                            {allowScreenSharing() && (
                                <Ico
                                    style={this.getStyle()}
                                    size={Size._40}
                                    svgSize={Size._20}
                                    svgId={component.isScreenSharing ? SVGId.MONITOR_WITH_CROSS : SVGId.MONITOR}
                                    tooltip={
                                        component.isScreenSharing
                                            ? i18n.t('IDS_SCREEN_SHARING_OFF')
                                            : i18n.t('IDS_SCREEN_SHARING_ON')
                                    }
                                    disabled={!component.hasConference}
                                    className={classNames('iPressRound')}
                                    onClick={this.onToggleScreenSharingIcoClick}
                                />
                            )}
                            {!isInterfaceMobile && !fullscreened && fullscreenable && (
                                <Ico
                                    style={this.getStyle()}
                                    size={Size._40}
                                    svgSize={Size._20}
                                    svgId={SVGId.FULLSCREEN}
                                    tooltip={i18n.t('IDS_FULLSCREEN')}
                                    className={classNames('iPressRound')}
                                    onClick={this.onRequestFullscreenIcoClick}
                                />
                            )}
                            {!isInterfaceMobile && fullscreened && (
                                <Ico
                                    style={this.getStyle()}
                                    size={Size._40}
                                    svgSize={Size._20}
                                    svgId={SVGId.FULLSCREEN_EXIT}
                                    tooltip={i18n.t('IDS_EXIT_FULLSCREEN')}
                                    className={classNames('iPressRound')}
                                    onClick={this.onExitFullscreenIcoClick}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private getCameraIcoTooltip(): string {
        switch (this.getComponent().getProperty('videoStatus')) {
            case 'ENABLED':
                return i18n.t('IDS_MUTE_CAMERA');
            case 'DISABLED':
                return i18n.t('IDS_UNMUTE_CAMERA');
            case 'MISSING':
                return i18n.t('IDS_CAMERA_NOT_FOUND');
            case 'BUSY':
                return i18n.t('IDS_BUSY_CAMERA');
            default:
                assert(false);

                return '';
        }
    }

    private getMicrophoneIcoTooltip(): string {
        switch (this.getComponent().getProperty('audioStatus')) {
            case 'ENABLED':
                return i18n.t('IDS_MUTE_MICROPHONE');
            case 'DISABLED':
                return i18n.t('IDS_UNMUTE_MICROPHONE');
            case 'MISSING':
                return i18n.t('IDS_MICROPHONE_NOT_FOUND');
            case 'BUSY':
                return i18n.t('IDS_BUSY_MICROPHONE');
            default:
                assert(false);

                return '';
        }
    }

    private onEndCallIcoClick = (): void => {
        this.getComponent().handleOnEndCallEvent();
    };

    private onToggleCameraIcoClick = (): void => {
        const component = this.getComponent();
        const videoStatus = component.getProperty('videoStatus');
        if (videoStatus === 'ENABLED' || videoStatus === 'DISABLED') {
            component.handleOnToggleCameraEvent();
        }
    };

    private onToggleMicrophoneIcoClick = (): void => {
        const component = this.getComponent();
        const audioStatus = component.getProperty('audioStatus');
        if (audioStatus === 'ENABLED' || audioStatus === 'DISABLED') {
            component.handleOnToggleMicrophoneEvent();
        }
    };

    private onToggleScreenSharingIcoClick = (): void => {
        this.getComponent().handleOnToggleScreenSharingEvent();
    };

    private onVideoChatResize = (rect: IRect): void => {
        this.getComponent().handleOnVideoChatResizeEvent(rect);
    };

    private onExitFullscreenIcoClick = (): void => {
        this.getComponent().exitFullscreen();
    };

    private onRequestFullscreenIcoClick = (): void => {
        this.getComponent().requestChatFullscreen(this.divRef);
    };

    private onGoToChatIcoClick = (): void => {
        this.getComponent().goToChat();
    };

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
        PostMessageObserverService.sendMessage('headerMouseUp');

        window.removeEventListener('mouseup', this.onHeaderMouseUp);
        window.removeEventListener('mousemove', this.onHeaderMouseMove);
    };
}
