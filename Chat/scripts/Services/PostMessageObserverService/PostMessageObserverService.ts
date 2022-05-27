import { IObservableValue, observable, runInAction } from 'mobx';

import { G5Promise } from '@1c/g5-client-base/Utils/G5Promise';

/** Сервис работы с сообщениями, передаваемыми через PostMessage */
export class PostMessageObserverService {
    public static readonly currentMessageEvent: IObservableValue<MessageEvent | null> = observable.box(null);

    private static allowedMessages = [
        'open',
        'close',
        'logout',
        'sendMessage',
        'getContactInfo',
        'setContactInfo',
        'isVideoconferenceEnabled',
        'startVideoconference',
        'setMatchingKeyToken',
        'responseTitle'
    ];

    private static allowedVersions = ['1.0'];

    public static mount() {
        window.addEventListener('message', PostMessageObserverService.parseMessage);
    }

    public static unmount() {
        window.removeEventListener('message', PostMessageObserverService.parseMessage);
    }

    // tslint:disable-next-line:no-any
    public static channelMessage(message: string): G5Promise<any> {
        // tslint:disable-next-line:no-any
        return new G5Promise<any>((resolve) => {
            const channel = new MessageChannel();
            channel.port1.onmessage = (e: MessageEvent) => {
                resolve(e.data.data);
            };
            window.parent.postMessage(
                {
                    source: 'Chat',
                    message: message
                },
                '*',
                [channel.port2]
            );
        });
    }

    public static respondMessage(event: MessageEvent, message: string, data?: Object) {
        if (!event.ports[0]) {
            return;
        }
        event.ports[0].postMessage({
            source: 'Chat',
            message: message,
            data: data
        });
    }

    public static sendMessage(message: string, data?: Object) {
        window.parent.postMessage(
            {
                source: 'Chat',
                message: message,
                data: data
            },
            '*'
        );
    }

    private static parseMessage = (e: MessageEvent) => {
        if (!e.data.message) {
            return;
        }
        if (
            !(
                PostMessageObserverService.allowedMessages.includes(e.data.message) &&
                PostMessageObserverService.allowedVersions.includes(e.data.version) &&
                e.data.source === 'CollaborationSystemWebChat1CE'
            )
        ) {
            return;
        }
        runInAction(() => PostMessageObserverService.currentMessageEvent.set(e));
    };
}
