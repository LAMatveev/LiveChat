import * as classNames from 'classnames';
import { IObservableArray, action, observable } from 'mobx';
import * as React from 'react';
import { ChatFormComponent } from 'scripts/UiComponents/ChatForm/ChatFormComponent';
import { ChatUserComponent } from 'scripts/UiComponents/ChatUser/ChatUserComponent';

import { ecs } from '@1c/ecs.js';
import { isInterfaceMobile } from '@1c/g5-client-base/Base/Env/interfaceKind';
import { G5EcsConference } from '@1c/g5-client-base/Ecs/Model/Conference/G5EcsConference';
import { ecsManager } from '@1c/g5-client-base/Ecs/Model/EcsManager/EcsManager';
import { G5EcsInvitation } from '@1c/g5-client-base/Ecs/Model/G5EcsInvitation';
import { G5EcsInvitationId } from '@1c/g5-client-base/Ecs/Model/G5EcsTypes';
import { UserAvatarComponent } from '@1c/g5-client-base/Ecs/UiComponents/Avatar/AvatarComponent';
import { Size } from '@1c/g5-client-base/Ecs/UiComponents/PropertySets/IHasSizePropertySet';
import { LocalStorage } from '@1c/g5-client-base/Ecs/Utils/LocalStorage';
import i18n from '@1c/g5-client-base/Ecs/i18n';
import { FormOpenMode } from '@1c/g5-client-base/UiComponents/FormWindow/FormOpenMode';
import { IUiComponentsOwner } from '@1c/g5-client-base/UiComponents/UiComponent/IUiComponent';
import { G5Promise } from '@1c/g5-client-base/Utils/G5Promise';
import { assert } from '@1c/g5-client-base/debug';

/** Компонент формы приглашения в видеозвонок системы взаимодействия */
export class ChatVideoCallInvitationFormComponentInternal extends ChatFormComponent {
    @observable.ref
    public inviterAvatarComponent: UserAvatarComponent;

    @observable.ref
    public inviterComponent: ChatUserComponent;

    public readonly membersComponents: IObservableArray<ChatUserComponent> = observable.array([], { deep: false });

    private readonly invitation: G5EcsInvitation;

    constructor(owner: IUiComponentsOwner, invitationId: G5EcsInvitationId) {
        super(owner);

        this.invitation = G5EcsInvitation.get(invitationId);

        const inviterId = this.invitation.getInviterId();
        this.inviterAvatarComponent = this.createOwnComponent(UserAvatarComponent, inviterId);
        this.inviterComponent = this.createOwnComponent(ChatUserComponent, inviterId);

        const membersComponents = this.invitation
            .getMembers()
            .filter((memberId) => memberId !== ecsManager.getCurrentUserId() && memberId !== inviterId)
            .map((memberId) => this.createOwnComponent(ChatUserComponent, memberId));
        this.membersComponents.replace(membersComponents);
    }

    /** @override */
    public dispose() {
        this.invitation.dispose();
        super.dispose();
    }

    /** @override */
    public show(): G5Promise<unknown> {
        return super.show().then((result) => {
            return new G5Promise((resolve, reject) => {
                if (this.invitation.getStatus() === 'ACTIVE' && result) {
                    const videoInputSource = LocalStorage.getValue('videoInputSource');
                    const audioInputSource = LocalStorage.getValue('audioInputSource');
                    // Пытаемся принять видеозвонок
                    G5Promise.resolve(
                        this.invitation.answerCall(videoInputSource || undefined, audioInputSource || undefined)
                    ).then((conference: G5EcsConference | null) => {
                        if (conference) {
                            // Приняти видеозвонок получилось
                            resolve(conference);
                        } else {
                            // Не получилось принять видеозвонок
                            reject();
                        }
                    });
                } else {
                    // Отклоняем видеозвонок
                    this.invitation.declineCall();
                    resolve(null);
                }
            });
        });
    }

    public handleOnCallOnClickEvent(): void {
        this.tryClose(true);
    }

    public handleOnCallOffClickEvent(): void {
        this.tryClose(false);
    }

    /** @override */
    protected afterCreate() {
        this.setProperty('openMode', isInterfaceMobile ? FormOpenMode.MODAL : FormOpenMode.POPUP)
            .setProperty('title', i18n.t('IDS_INCOMING_CALL'))
            .setProperty('closeOnClickOutside', false)
            .setProperty('ignoreCloseAfterIndex', true);

        this.inviterAvatarComponent.setProperty('size', Size._64);
        this.inviterComponent.setProperty('className', classNames('ecsInviter', 'dots'));
        this.membersComponents.forEach((subInviterComponent) => {
            subInviterComponent.setProperty('className', classNames('dots'));
        });

        this.invitation.onMetadataChanged.on(this.onInvitationMetadataChanged);
        this.invitation.onStatusChanged.on(this.onInvitationStatusChanged);

        super.afterCreate();
    }

    @action
    private onInvitationMetadataChanged = (): void => {
        this.inviterAvatarComponent.dispose();
        this.inviterComponent.dispose();
        this.membersComponents.forEach((subInviterComponent) => {
            subInviterComponent.dispose();
        });

        const inviterId = this.invitation.getInviterId();
        this.inviterAvatarComponent = this.createOwnComponent(UserAvatarComponent, inviterId).setProperty(
            'size',
            Size._64
        );
        this.inviterComponent = this.createOwnComponent(ChatUserComponent, inviterId).setProperty(
            'className',
            classNames('ecsInviter', 'dots')
        );

        const membersComponents = this.invitation
            .getMembers()
            .filter((memberId) => memberId !== ecs.getCurrentUserId() && memberId !== inviterId)
            .map((memberId) => this.createOwnComponent(ChatUserComponent, memberId));
        this.membersComponents.replace(membersComponents);
    };

    private onInvitationStatusChanged = (): void => {
        switch (this.invitation.getStatus()) {
            case 'ACTIVE':
                // Статус не может смениться на активный,
                // так как это изначальный статус, по которому открывается форма приглашения в видеозвонок
                assert(false);
                break;
            case 'ACCEPTED':
            // Приглашение принято, закрываем форму
            case 'REJECTED':
            // Приглашение отклонено самим же пользователем, закрываем форму
            case 'REVOKED':
                // Приглашение отозвано (звонящим или по таймауту), закрываем форму
                this.tryClose();
                break;
            case 'DISCARDED':
                // Приглашение отклонено по причине отсутствия подходящего оборудования,
                // при открытой форме не должно возникнуть таких ситуаций
                assert(false);
                break;
            default:
                assert(false);
                break;
        }
    };
}
