import { action } from 'mobx';

import { KeyCode } from '@1c/g5-client-base/Base/Core/Keyboard';
import { PropertySetDescr, makeDefaultComponentPropertySet } from '@1c/g5-client-base/Components/IBaseComponent';
import { G5EcsAttachment } from '@1c/g5-client-base/Ecs/Model/G5EcsAttachment';
import { MessageTextEditComponent } from '@1c/g5-client-base/Ecs/UiComponents/MessageTextEdit/MessageTextEditComponent';
import {
    IMessageTextEditComponentPropertySet,
    defaultMessageTextEditComponentPropertySet
} from '@1c/g5-client-base/Ecs/UiComponents/MessageTextEdit/MessageTextEditComponentInternal';
import i18n from '@1c/g5-client-base/Ecs/i18n/i18n';
import { BrowserEventProcessResult } from '@1c/g5-client-base/View/ReactDOM/BrowserEventProcessResult';
import { Shortcut, ShortcutKey } from '@1c/g5-client-base/View/ReactDOM/Shortcut';

/** Набор свойств поля ввода сообщения */
export interface IChatMessageTextEditComponentPropertySet extends IMessageTextEditComponentPropertySet {
    scrollTop: number;
}

/** Значения по умолчанию свойств поля ввода сообщения */
export const defaultChatMessageTextEditComponentPropertySet: PropertySetDescr<IChatMessageTextEditComponentPropertySet> = makeDefaultComponentPropertySet(
    defaultMessageTextEditComponentPropertySet,
    {
        scrollTop: 0
    }
);

/** Поле ввода сообщения */
export class ChatMessageTextEditComponentInternal extends MessageTextEditComponent<
    IChatMessageTextEditComponentPropertySet
> {
    /** @override */
    public static getDefaultProperties() {
        return defaultChatMessageTextEditComponentPropertySet;
    }

    /** @override */
    public processShortcut(shortcutKey: ShortcutKey) {
        if (shortcutKey === Shortcut.createKey(KeyCode.ArrowUp)) {
            return BrowserEventProcessResult.NotProcessed;
        } else {
            return super.processShortcut(shortcutKey);
        }
    }

    /** @override */
    @action
    public handleOnPastePictureEvent(data: DataTransfer): void {
        const picture = data.items[0].getAsFile();
        if (picture) {
            this.attachments.replace(
                this.attachments.concat([
                    G5EcsAttachment.create({
                        file: picture,
                        name: picture.name || i18n.t('IDS_PICTURE')
                    })
                ])
            );
        }
    }

    /** @override */
    protected afterCreate() {
        super.afterCreate();
        this.setProperty('inputHint', i18n.t('IDS_WRITE_MESSAGE'));
        this.setProperty('height', parseFloat(getComputedStyle(document.body).fontSize));
    }
}
