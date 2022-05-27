import { action } from 'mobx';
import { PostMessageObserverService } from 'scripts/Services/PostMessageObserverService/PostMessageObserverService';
import { ChatVideoCallFormComponent } from 'scripts/UiComponents/ChatVideoCallForm/ChatVideoCallFormComponent';
import { ChatVideoCallInvitationFormComponent } from 'scripts/UiComponents/ChatVideoCallInvitationForm/ChatVideoCallInvitationFormComponent';

import { G5EcsConference } from '@1c/g5-client-base/Ecs/Model/Conference/G5EcsConference';
import { G5EcsInvitationId } from '@1c/g5-client-base/Ecs/Model/G5EcsTypes';
import { IEcsVideoService } from '@1c/g5-client-base/Ecs/Services/EcsVideoService/IEcsVideoService';
import { service } from '@1c/g5-client-base/Services/di';
import { EcsVideoService } from '@1c/g5-client-base/Site/scripts/Services/EcsVideoService/EcsVideoService';
import { UiComponent, createComponent } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponent';

/** Сервис видеозвонков системы взаимодействия  */

@service(IEcsVideoService)
class ChatVideoService extends EcsVideoService {
    /** @override */
    // tslint:disable-next-line:no-empty
    public start(): void {}

    /** @override */
    @action
    public stop(): void {
        this.currentVideoCallForm.set(null);
        this.videoCallOnAir = false;
        this.desktopSharingOnAir = false;
    }

    /** @override */
    public async showVideoCallInvitation(owner: UiComponent, invitationId: G5EcsInvitationId): Promise<void> {
        PostMessageObserverService.sendMessage('headerMouseUp');
        setTimeout(() => {
            createComponent(ChatVideoCallInvitationFormComponent, owner, invitationId)
                .show()
                .then((result) => {
                    if (result) {
                        this.onVideoCallInvitationAccept(owner, result as G5EcsConference);
                    }
                })
                .catch(() => {
                    // Не получилось принять видеозвонок из-за отсутствия необходимого оборудования
                });
        }, 250);
    }

    /** @override */
    @action
    protected async showVideoCallForm(owner: UiComponent): Promise<void> {
        const currentVideoCallForm = this.currentVideoCallForm.get();
        if (currentVideoCallForm) {
            await currentVideoCallForm.tryClose();
        }
        const videoCallForm = createComponent(ChatVideoCallFormComponent, owner);
        videoCallForm.show();
        this.currentVideoCallForm.set(videoCallForm);
    }
}
