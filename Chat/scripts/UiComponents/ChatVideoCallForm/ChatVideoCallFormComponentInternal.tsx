import { Lambda, action, autorun, computed, observable, reaction, runInAction } from 'mobx';
import { PostMessageObserverService } from 'scripts/Services/PostMessageObserverService/PostMessageObserverService';
import { ChatFormComponent } from 'scripts/UiComponents/ChatForm/ChatFormComponent';

import { ecs } from '@1c/ecs.js';
import { BaseArray } from '@1c/g5-client-base/Base/Core/Array/BaseArray';
import { EventHandler } from '@1c/g5-client-base/Base/Core/EventHandler';
import { isInterfaceMobile } from '@1c/g5-client-base/Base/Env/interfaceKind';
import { IRect } from '@1c/g5-client-base/Base/Utils/math';
import { G5EcsConference } from '@1c/g5-client-base/Ecs/Model/Conference/G5EcsConference';
import {
    G5EcsConferenceMember,
    G5EcsConferenceMemberEvent
} from '@1c/g5-client-base/Ecs/Model/Conference/G5EcsConferenceMember';
import { G5EcsConversation } from '@1c/g5-client-base/Ecs/Model/Conversation/G5EcsConversation';
import {
    G5EcsConferenceDeviceStatusChangedEvent,
    G5EcsConferenceStatus,
    G5EcsUserId
} from '@1c/g5-client-base/Ecs/Model/G5EcsTypes';
import { IEcsVideoService } from '@1c/g5-client-base/Ecs/Services/EcsVideoService/IEcsVideoService';
import {
    IUnitConverterService,
    UnitValue
} from '@1c/g5-client-base/Ecs/Services/UnitConverterService/IUnitConverterService';
import {
    IEcsVideoCallFormComponent,
    IEcsVideoCallFormComponentPropertySet
} from '@1c/g5-client-base/Ecs/UiComponents/EcsVideoCallForm/IEcsVideoCallFormComponent.tsx';
import { isFullscreenSupported, requestFullscreen } from '@1c/g5-client-base/Ecs/Utils/Fullscreen';
import { LocalStorage } from '@1c/g5-client-base/Ecs/Utils/LocalStorage';
import i18n from '@1c/g5-client-base/Ecs/i18n';
import { getService } from '@1c/g5-client-base/Services/di';
import { ConferenceMemberComponent } from '@1c/g5-client-base/Site/scripts/UiComponents/ConferenceMember/ConferenceMemberComponent';
import { ConferenceMemberComponentInternal } from '@1c/g5-client-base/Site/scripts/UiComponents/ConferenceMember/ConferenceMemberComponentInternal';
import { EcsAudioVideoFormComponent } from '@1c/g5-client-base/Site/scripts/UiComponents/EcsAudioVideoForm/EcsAudioVideoFormComponent';
import {
    EcsVideoCallFormMode,
    defaultEcsVideoCallFormComponentPropertySet
} from '@1c/g5-client-base/Site/scripts/UiComponents/EcsVideoCallForm/EcsVideoCallFormComponentInternal';
import { FormOpenMode } from '@1c/g5-client-base/UiComponents/FormWindow/FormOpenMode';
import { UiComponent } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponent';
import { G5Promise } from '@1c/g5-client-base/Utils/G5Promise';
import { assert } from '@1c/g5-client-base/debug';

/** Компонент формы видеозвонка чата */
export class ChatVideoCallFormComponentInternal extends ChatFormComponent<IEcsVideoCallFormComponentPropertySet>
    implements IEcsVideoCallFormComponent {
    public readonly members: BaseArray<ConferenceMemberComponent> = new BaseArray();
    public readonly onConferenceStatusChanged: EventHandler<[G5EcsConferenceStatus]> = new EventHandler();

    @observable.ref
    public conversation: G5EcsConversation | null = null;

    @observable.ref
    private conference: G5EcsConference | null = null;

    private audioVideoForm: EcsAudioVideoFormComponent | null = null;

    private localMember: G5EcsConferenceMember | null = null;
    private minimizedReactionDisposer!: Lambda;
    private screenSharingReactionDisposer!: Lambda;
    private soloMemberAutorunDisposer!: Lambda;
    private activeMembersAutorunDisposer!: Lambda;
    private acceptedWithVideoMembersAutorunDisposer!: Lambda;
    private lastMemberStatusAutorunDisposer!: Lambda;
    private videoListHeight: number = 0;
    private grid: boolean = true;
    private mode: EcsVideoCallFormMode = 'NORMAL';

    private triedDisposeLocal = false;

    /** @override */
    public static getDefaultProperties() {
        return defaultEcsVideoCallFormComponentPropertySet;
    }

    /** @override */
    @action
    public dispose() {
        this.minimizedReactionDisposer();
        this.screenSharingReactionDisposer();
        this.soloMemberAutorunDisposer();
        this.activeMembersAutorunDisposer();
        this.acceptedWithVideoMembersAutorunDisposer();
        this.lastMemberStatusAutorunDisposer();
        if (!this.getProperty('minimized')) {
            LocalStorage.setValue(kLocalStorageKeyVideoCallFormWidth, this.getWidth().toString(10));
            LocalStorage.setValue(kLocalStorageKeyVideoCallFormHeight, this.getHeight().toString(10));
        }
        if (this.localMember) {
            this.localMember.dispose();
        }
        ecs.unlisten('ecs:disconnected', this.onDisconnected);
        if (this.conference) {
            this.conference.leave();
            this.conference.dispose();
        }
        getService(IEcsVideoService).currentVideoCallForm.set(null);
        getService(IEcsVideoService).videoCallOnAir = false;
        getService(IEcsVideoService).desktopSharingOnAir = false;
        if (this.conversation) {
            this.conversation.dispose();
        }
        this.onConferenceStatusChanged.dispose();
        super.dispose();
    }

    /** @override */
    public show(): G5Promise<unknown> {
        return super.show().then(() => {
            return new G5Promise((resolve) => {
                if (this.conference && this.conference.getDesktopEnabled()) {
                    this.conference.setDesktopEnabled(false);
                }
                resolve();
            });
        });
    }

    @action
    public setConference(conference: G5EcsConference | null): void {
        if (!this.conference && conference) {
            // Конференция не была задана в окне видеозвонка. Устанавливаем новую конференцию
            this.conference = conference;
            const conversationId = this.conference.getConversationId();
            this.conversation = conversationId ? G5EcsConversation.getById(conversationId) : null;

            this.conference.onMemberAdded.on(this.onMemberAdded);
            this.conference.onMemberRemoved.on(this.onMemberRemoved);
            this.conference.onMetadataChanged.on(this.onMetadataChanged);
            this.conference.onDeviceStatusChanged.on(this.onDeviceStatusChanged);
            this.conference.onDesktopStatusChanged.on(this.onDesktopStatusChanged);
            this.conference.onStatusChanged.on(this.onStatusChanged);

            this.conference.getMembers().forEach((member) => {
                if (member.getUserId() === ecs.getCurrentUserId()) {
                    this.setLocalMember(member);
                } else {
                    this.addMember(member);
                }
            });
            this.setProperty('audioStatus', this.conference.getAudioStatus()).setProperty('videoStatus', 'DISABLED');
            this.conference.setVideoEnabled(false);
        } else if (!this.conference && !conference) {
            // Конференция не была задана в окне видеозвонка и устанавливаем null, значит видеокамера не доступна
            this.setProperty('text', i18n.t('IDS_CAMERA_NOT_AVAILABLE'));
        } else {
            // Попытка установить конференцию, когда она уже установлена в окне видеозвонка
            assert(false);
        }
    }

    @computed
    public get hasConference(): boolean {
        return !!this.conference;
    }

    @action
    public goToChat() {
        this.setProperty('hidden', true);
    }

    /** @override */
    public handleOnEndCallEvent(): void {
        PostMessageObserverService.sendMessage('videoconferenceEnd');
        this.tryClose();
    }

    /** @override */
    public handleOnToggleCameraEvent(): void {
        switch (this.getProperty('videoStatus')) {
            case 'ENABLED':
                if (this.conference) {
                    this.conference.setVideoEnabled(false);
                } else {
                    assert(false);
                }
                break;
            case 'DISABLED':
                if (this.conference) {
                    this.conference.setVideoEnabled(true);
                } else {
                    assert(false);
                }
                break;
            case 'MISSING':
            case 'BUSY':
            default:
                assert(false);
                break;
        }
    }

    /** @override */
    public handleOnToggleMicrophoneEvent(): void {
        switch (this.getProperty('audioStatus')) {
            case 'ENABLED':
                if (this.conference) {
                    this.conference.setAudioEnabled(false);
                } else {
                    assert(false);
                }
                break;
            case 'DISABLED':
                if (this.conference) {
                    this.conference.setAudioEnabled(true);
                } else {
                    assert(false);
                }
                break;
            case 'MISSING':
            case 'BUSY':
            default:
                assert(false);
                break;
        }
    }

    /** @override */
    public handleOnToggleScreenSharingEvent(): void {
        if (this.conference) {
            if (!this.conference.getDesktopEnabled()) {
                if (this.getProperty('minimized')) {
                    this.mode = 'MINIMIZED';
                } else if (this.getProperty('fullscreened')) {
                    this.mode = 'FULLSCREEN';
                } else {
                    this.mode = 'NORMAL';
                }
                this.getProperty('minimizeFunction')?.();
            }
            runInAction(() => {
                this.conference?.setDesktopEnabled(!this.conference.getDesktopEnabled());
            });
        } else {
            assert(false);
        }
    }

    /** @override */
    public handleOnGotoConversationEvent(): void {
        assert(false);
    }

    /** @override */
    public handleOnInviteParticipantsEvent(): void {
        assert(false);
    }

    @action
    public handleOnVideoChatResizeEvent(rect: IRect): void {
        const boxFactor = rect.width / rect.height;
        const activeMembers = this.members.filter((member): member is ConferenceMemberComponent => {
            return member.getProperty('active');
        });
        const count = activeMembers.length;
        const max = { rows: 1, columns: 1, value: 0 };

        for (let row = 1; row <= count; row++) {
            const col = Math.ceil(count / row);
            if ((row - 1) * col >= count) {
                continue;
            }

            const factor = (col / row) * (4 / 3);
            const value = factor > boxFactor ? boxFactor / factor : factor / boxFactor;
            if (value > max.value) {
                max.rows = row;
                max.columns = col;
                max.value = value;
            }
        }

        this.setProperty('columns', max.columns);
        this.setProperty('rows', max.rows);

        for (let i = 0; i < max.rows; i++) {
            for (let j = 0; j < max.columns && j + i * max.columns < count; j++) {
                const activeMember = activeMembers[j + i * max.columns];
                activeMember.setProperty('offsetLeftPercent', Math.floor((100 * j) / max.columns));
                activeMember.setProperty('offsetTopPercent', Math.floor((100 * i) / max.rows));
            }
        }
    }

    /** @override */
    public addMembers(membersIds: G5EcsUserId[]): void {
        membersIds.forEach((membersId) => {
            if (this.conference) {
                this.conference.addMember(membersId);
            } else {
                assert(false);
            }
        });
    }

    public requestChatFullscreen(divRef: React.RefObject<HTMLDivElement>) {
        const viewContainer = divRef.current;
        if (viewContainer && isFullscreenSupported()) {
            requestFullscreen(viewContainer).then(() => {
                runInAction(() => {
                    this.setProperty('fullscreened', true);
                });
            });
        }
    }

    @computed
    public get isScreenSharing(): boolean {
        return this.conference ? this.conference.getDesktopEnabled() : false;
    }

    /** @override */
    @action
    protected afterCreate() {
        this.watchMinimized();
        this.watchScreenSharing();
        this.watchSoloMember();
        this.watchActiveMembers();
        this.watchAcceptedWithVideoMembers();
        this.watchLastMemberStatus();
        getService(IEcsVideoService).videoCallOnAir = true;
        ecs.listen('ecs:disconnected', this.onDisconnected);
        const savedWidth = LocalStorage.getValue(kLocalStorageKeyVideoCallFormWidth);
        const savedHeight = LocalStorage.getValue(kLocalStorageKeyVideoCallFormHeight);
        this.setProperty('openMode', isInterfaceMobile ? FormOpenMode.MODAL : FormOpenMode.POPUP)
            .setProperty('fullscreened', isInterfaceMobile)
            .setProperty('text', i18n.t('IDS_VIDEO_CALL_IN_PROGRESS'))
            .setProperty('width', savedWidth ? parseInt(savedWidth, 10) : kEcsVideoCallFormWidth)
            .setProperty('height', savedHeight ? parseInt(savedHeight, 10) : kEcsVideoCallFormHeight)
            .setPropertyComputed(
                'title',
                computed(() => (this.conversation ? this.conversation.getPresentation() : i18n.t('IDS_VIDEO_CALL')))
            )
            .setProperty('closeOnClickOutside', false)
            .setProperty('ignoreCloseAfterIndex', true)
            .setProperty('resizable', !isInterfaceMobile)
            .setProperty('fullscreenable', isFullscreenSupported())
            .setProperty('minimizable', true)
            .setProperty('cancelCloseOnEscapePressed', true)
            .setProperty('hiddenMembers', isInterfaceMobile);
        PostMessageObserverService.sendMessage('videoconferenceStart');
        super.afterCreate();
    }

    @action
    private onMembersButtonClick = (): void => {
        this.setProperty('hiddenMembers', !this.getProperty('hiddenMembers'));
    };

    private onDisconnected = (): void => {
        this.tryClose();
    };

    @action
    private onMemberAdded = (event: G5EcsConferenceMemberEvent): void => {
        const member = event.getMember();
        if (member.getUserId() !== ecs.getCurrentUserId()) {
            this.addMember(member);
        } else if (!this.localMember) {
            this.setLocalMember(member);
        } else {
            assert(false);
        }
    };

    @action
    private onMemberRemoved = (event: G5EcsConferenceMemberEvent): void => {
        const member = event.getMember();
        if (!member.isLocal() && !this.triedDisposeLocal) {
            const foundMember = this.members.find(
                (conferenceMember) => member.getUserId() === conferenceMember.getMember().getUserId()
            );
            if (foundMember) {
                this.members.remove(foundMember);
                foundMember.dispose();
                if (this.members.length === 0) {
                    this.endCallWithText(i18n.t('IDS_VIDEO_CALL_COMPLETED'));

                    return;
                }
                const activeMembers = this.members.filter((item): item is ConferenceMemberComponent =>
                    item.getProperty('active')
                );
                if (activeMembers.length === 0) {
                    this.members.get(0).setProperty('active', true);
                }
            } else {
                assert(false);
            }
        } else {
            this.triedDisposeLocal = true;
        }
    };

    @action
    private onMetadataChanged = (): void => {
        if (this.conference) {
            if (this.conversation) {
                this.conversation.dispose();
            }
            const conversationId = this.conference.getConversationId();
            this.conversation = conversationId ? G5EcsConversation.getById(conversationId) : null;
        } else {
            assert(false);
        }
    };

    @action
    private onDeviceStatusChanged = (event: G5EcsConferenceDeviceStatusChangedEvent): void => {
        switch (event.getDeviceType()) {
            case 'AUDIO':
                this.setProperty('audioStatus', event.getDeviceStatus());
                break;
            case 'VIDEO':
                this.setProperty('videoStatus', event.getDeviceStatus());
                break;
            default:
                assert(false);
                break;
        }
    };

    @action
    private onDesktopStatusChanged = (): void => {
        if (this.conference) {
            if (!this.conference.getDesktopEnabled()) {
                switch (this.mode) {
                    case 'NORMAL':
                        this.getProperty('restoreFunction')?.();
                        break;
                    case 'FULLSCREEN':
                        this.requestFullscreen();
                        break;
                    default:
                        break;
                }
            }
            getService(IEcsVideoService).desktopSharingOnAir = this.conference.getDesktopEnabled();
        } else {
            assert(false);
        }
    };

    private onStatusChanged = (): void => {
        if (this.conference) {
            this.onConferenceStatusChanged.notify(this.conference.getStatus());
        }
    };

    @action
    private onLocalMemberVideoStreamChanged = (): void => {
        if (this.localMember) {
            this.setProperty('localVideoStream', this.localMember.getVideoStream());
        }
    };

    @action // tslint:disable-next-line:max-func-body-length
    private onConferenceMemberComponentClick = (component: UiComponent): void => {
        const targetMember = component as ConferenceMemberComponent;

        // Не обрабатываем клик:
        //      по непринявшим звонок участникам
        //      по участникам без видео и без доступного шаринга экрана
        //      по участникам с шарингом экрана
        if (
            targetMember.getProperty('status') !== 'ACCEPTED' ||
            (!targetMember.getProperty('videoStream') && !targetMember.getProperty('desktopStreamAvailable')) ||
            targetMember.getProperty('desktopStream')
        ) {
            return;
        }

        const acceptedMembers = this.members.filter((member): member is ConferenceMemberComponent => {
            return (
                member.getProperty('status') === 'ACCEPTED' &&
                !!(member.getProperty('videoStream') || member.getProperty('desktopStreamAvailable'))
            );
        });
        const activeMembers = acceptedMembers.filter((member) => member.getProperty('active'));
        if (this.getProperty('minimized')) {
            // В компактном режиме по клику листаем участников
            if (targetMember.getProperty('active')) {
                let indexOfTarget = acceptedMembers.indexOf(targetMember);
                targetMember.setProperty('active', false);
                if (indexOfTarget !== -1) {
                    indexOfTarget = indexOfTarget === acceptedMembers.length - 1 ? 0 : indexOfTarget + 1;
                    acceptedMembers[indexOfTarget].setProperty('active', true);
                } else {
                    assert(false);
                }
            } else {
                // Клик по неактивному участнику. Не должно быть такой ситуации
                assert(false);
            }
        } else {
            if (targetMember.getProperty('active')) {
                // Клик по активному участнику
                if (activeMembers.length === 1) {
                    // Активный участник один. Делаем активным всех участников с видео, принвявщих видеозвонок
                    acceptedMembers.forEach((member) => {
                        member.setProperty('active', true);
                    });
                    this.grid = true;
                } else if (activeMembers.length > 1) {
                    // Активных участников несколько. Оставляем активным только того, по которому кликнули
                    activeMembers.forEach((member) => {
                        member.setProperty('active', false);
                    });
                    targetMember.setProperty('active', true);
                    if (targetMember.getProperty('desktopStreamAvailable')) {
                        targetMember.setDesktopEnabled(true);
                    }
                    this.grid = false;
                } else {
                    // Активных участников нет. Не должно быть такой ситуации
                    assert(false);
                }
            } else {
                // Клик по неактивному участнику
                if (activeMembers.length === 1) {
                    // Активный участник один. Заменяем его на того участника, по которому кликнули
                    activeMembers[0].setProperty('active', false);
                    targetMember.setProperty('active', true);
                    if (targetMember.getProperty('desktopStreamAvailable')) {
                        targetMember.setDesktopEnabled(true);
                    }
                } else {
                    // Активных участников нет или несколько. Не должно быть такой ситуации
                    assert(false);
                }
            }
        }
    };

    @action
    private onConferenceMemberComponentMostTalking = (targetMember: ConferenceMemberComponentInternal) => {
        if (targetMember.getProperty('status') === 'ACCEPTED' && targetMember.getProperty('videoStream')) {
            const activeMembers = this.members.filter((member): member is ConferenceMemberComponent => {
                return member.getProperty('active');
            });
            if (activeMembers.length === 1 && !activeMembers[0].getProperty('desktopStream')) {
                // Активный участник один, и он не шарит экран
                // Заменяем его на того участника, кто больше всего говорит
                activeMembers[0].setProperty('active', false);
                targetMember.setProperty('active', true);
            }
        } else {
            assert(false);
        }
    };

    private watchMinimized(): void {
        this.minimizedReactionDisposer = reaction(
            () => this.getProperty('minimized'),
            (minimized) => {
                // Обеспечиваем, чтобы при минимизации окна активным оставался один (первый) участник
                this.grid = false;
                if (minimized) {
                    const activeMembers = this.members.filter((member): member is ConferenceMemberComponent => {
                        return member.getProperty('active');
                    });
                    for (let i = 1; i < activeMembers.length; i++) {
                        runInAction(() => {
                            activeMembers[i].setProperty('active', false);
                        });
                    }
                }
            }
        );
    }

    private watchScreenSharing(): void {
        this.screenSharingReactionDisposer = reaction(
            () => {
                for (let i = 0; i < this.members.length; i++) {
                    let member = this.members.get(i);
                    if (member.getProperty('desktopStatus') !== 'STOPPED' && member.getProperty('active')) {
                        return true;
                    }
                }

                return false;
            },
            (someDesktopSharing) => {
                this.setProperty('screenSharing', someDesktopSharing);
            }
        );
    }

    private watchSoloMember(): void {
        this.soloMemberAutorunDisposer = autorun(() => {
            // Обеспечиваем, чтобы единственный активный участник был помечен свойством 'solo'
            // Сбрасываем свойство 'solo' для всех элементов
            for (let i = 0; i < this.members.length; i++) {
                let member = this.members.get(i);
                runInAction(() => {
                    member.setProperty('solo', false);
                });
            }

            const acceptedWithVideoMembers = this.members.filter((member): member is ConferenceMemberComponent => {
                return member.getProperty('status') === 'ACCEPTED' && !!member.getProperty('videoStream');
            });
            if (acceptedWithVideoMembers.length === 1 && acceptedWithVideoMembers[0].getProperty('active')) {
                runInAction(() => {
                    acceptedWithVideoMembers[0].setProperty('solo', true);
                });
            }
        });
    }

    private watchActiveMembers(): void {
        this.activeMembersAutorunDisposer = autorun(() => {
            // Обеспечиваем, чтобы среди активных участников были только те, кто принял видеозвонок и с доступным видео
            const active = this.members.filter((member): member is ConferenceMemberComponent => {
                return member.getProperty('active');
            });
            active.forEach((member) => {
                if (member.getProperty('status') !== 'ACCEPTED' || !member.getProperty('videoStream')) {
                    runInAction(() => {
                        member.setProperty('active', false);
                    });
                }
            });
            runInAction(() => {
                if (active.length !== 0 && this.getProperty('text') === i18n.t('IDS_VIDEO_CALL_IN_PROGRESS')) {
                    this.setProperty('text', '');
                }
                if (active.length === 0 && this.getProperty('text') === '') {
                    this.setProperty('text', i18n.t('IDS_VIDEO_CALL_IN_PROGRESS'));
                }
            });
        });
    }

    private watchAcceptedWithVideoMembers(): void {
        this.acceptedWithVideoMembersAutorunDisposer = autorun(() => {
            // Обеспечиваем, чтобы единственный активный участник, начавший шаринг экрана, сразу показывал его
            // (в компактном режиме наоборот - заканчиваем шаринг экрана).
            // Кроме того, если нет ни одного активного участника, либо если активных более одного (режим сетки),
            // то неактивный участник с видео, принявший видеозвонок, становился активным
            const activeMembers = this.members.filter((member): member is ConferenceMemberComponent => {
                return member.getProperty('active');
            });
            if (activeMembers.length === 1 && activeMembers[0].getProperty('desktopStreamAvailable')) {
                activeMembers[0].setDesktopEnabled(!this.getProperty('minimized'));
            } else {
                const acceptedWithVideoNotActiveMembers = this.members.filter(
                    (member): member is ConferenceMemberComponent => {
                        return (
                            !member.getProperty('active') &&
                            member.getProperty('status') === 'ACCEPTED' &&
                            !!member.getProperty('videoStream')
                        );
                    }
                );
                if (this.getProperty('minimized')) {
                    // В компактном режиме делаем активным первого участника (если других активных нет)
                    if (activeMembers.length === 0 && acceptedWithVideoNotActiveMembers.length > 0) {
                        runInAction(() => {
                            acceptedWithVideoNotActiveMembers[0].setProperty('active', true);
                        });
                    }
                } else {
                    // В обычном режиме делаем активными всех участников
                    if (this.grid) {
                        acceptedWithVideoNotActiveMembers.forEach((member) => {
                            runInAction(() => {
                                member.setProperty('active', true);
                            });
                        });
                    }
                }
            }
        });
    }

    private watchLastMemberStatus(): void {
        this.lastMemberStatusAutorunDisposer = autorun(() => {
            if (this.members.length === 1) {
                const lastMember = this.members.get(0);
                const lastMemberStatus = lastMember.getProperty('status');
                switch (lastMemberStatus) {
                    case 'REJECTED':
                        this.endCallWithText(i18n.t('IDS_PARTICIPANT_REJECTED'));
                        break;
                    case 'DISCARDED':
                        this.endCallWithText(i18n.t('IDS_PARTICIPANT_DISCARDED'));
                        break;
                    case 'ACCEPTED':
                    default:
                        break;
                }
            }
        });
    }

    @action
    private endCallWithText(text: string): void {
        this.setProperty('text', text);
        if (this.conference) {
            this.conference.leave();
        }
        getService(IEcsVideoService).videoCallOnAir = false;
        PostMessageObserverService.sendMessage('videoconferenceEnd');
        this.tryClose();
    }

    private setLocalMember(member: G5EcsConferenceMember): void {
        this.localMember = member;
        this.setProperty('localVideoStream', this.localMember.getVideoStream());
        this.localMember.onVideoStreamChanged.on(this.onLocalMemberVideoStreamChanged);
    }

    private addMember(member: G5EcsConferenceMember): void {
        const conferenceMemberComponent = this.createOwnComponent(ConferenceMemberComponent, member);
        conferenceMemberComponent.onClick = this.onConferenceMemberComponentClick;
        conferenceMemberComponent.onMostTalking = this.onConferenceMemberComponentMostTalking;
        if (this.audioVideoForm) {
            conferenceMemberComponent.receiveProperties(this.audioVideoForm, ['sinkId']);
        }
        this.members.push(conferenceMemberComponent);
    }

    @action
    private videoListScroll(step: number): void {
        const notActiveMembers = this.members.filter((member): member is ConferenceMemberComponent => {
            return !member.getProperty('active');
        });
        const listItemHeight = getService(IUnitConverterService).convertEmToPx(kListItemHeight).value;
        const listItemsHeight = notActiveMembers.length * listItemHeight;
        const diff = this.videoListHeight - listItemsHeight;
        const top = Math.min(Math.max(diff, this.getProperty('videoListScrollTop') + step), 0);
        this.setProperty('videoListScrollTop', top);
        this.setProperty('videoListScrollBack', diff < 0 && top < 0);
        this.setProperty('videoListScrollForward', diff < 0 && top > diff);

        const firstVisible = Math.floor((0 - top) / listItemHeight);
        const lastVisible = Math.ceil((this.videoListHeight - top) / listItemHeight) - 1;
        notActiveMembers.forEach((notActiveMember, index) => {
            notActiveMember.setProperty('hidden', firstVisible > index || index > lastVisible);
        });
    }
}

const kLocalStorageKeyVideoCallFormWidth = 'videoCallFormWidth';
const kLocalStorageKeyVideoCallFormHeight = 'videoCallFormHeight';

const kEcsVideoCallFormWidth = 420;
const kEcsVideoCallFormHeight = 358;

const kListItemHeight: UnitValue<'em'> = { value: 6.75, unit: 'em' };
