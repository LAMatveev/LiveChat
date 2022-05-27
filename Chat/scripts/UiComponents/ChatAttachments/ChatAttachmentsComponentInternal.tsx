import { PropertySetDescr, makeDefaultComponentPropertySet } from '@1c/g5-client-base/Components/IBaseComponent';
import { G5EcsAttachment } from '@1c/g5-client-base/Ecs/Model/G5EcsAttachment';
import { G5EcsMessage } from '@1c/g5-client-base/Ecs/Model/G5EcsMessage';
import { AttachmentsComponent } from '@1c/g5-client-base/Ecs/UiComponents/Attachments/AttachmentsComponent';
import { IUiComponentPropertySet, IUiComponentsOwner } from '@1c/g5-client-base/UiComponents/UiComponent/IUiComponent';
import { defaultUiComponentPropertySet } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponent';

/** Набор свойств вложений сообщения ECS */
interface IAttachmentsComponentPropertySet extends IUiComponentPropertySet {
    attachments: G5EcsAttachment[];
}

/** Значения по умолчанию свойств вложений сообщения ECS */
const defaultAttachmentsComponentPropertySet: PropertySetDescr<IAttachmentsComponentPropertySet> = makeDefaultComponentPropertySet(
    defaultUiComponentPropertySet,
    {
        attachments: []
    }
);

type AttachmentsComponentHandlerOnContextMenu = (attachment: G5EcsAttachment, node: Node, x: number, y: number) => void;

/** Отображает вложения сообщения ECS */
export class ChatAttachmentsComponentInternal extends AttachmentsComponent {
    public onContextMenu: AttachmentsComponentHandlerOnContextMenu | null = null;

    constructor(owner: IUiComponentsOwner, message: G5EcsMessage) {
        super(owner, message);
    }

    /** @override */
    public static getDefaultProperties() {
        return defaultAttachmentsComponentPropertySet;
    }

    /** @override */
    public handleOnAttachmentClickEvent(attachment: G5EcsAttachment): void {
        if (attachment) {
            const file = attachment.getFile();
            if (file || attachment.isUploaded()) {
                attachment.download();
            }
        }
    }

    public handleOnDownloadClickEvent(attachment: G5EcsAttachment): void {
        if (attachment) {
            const file = attachment.getFile();
            if (file || attachment.isUploaded()) {
                attachment.download();
            }
        }
    }
}
