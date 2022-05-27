import { EcsFormWindowComponentInternal } from '@1c/g5-client-base/Ecs/UiComponents/EcsFormWindow/EcsFormWindowComponentInternal';

/**
 * Компонент окна формы ECS.
 * Включает: заголовок формы, кнопку закрытия, собственно форму.
 * Не владеет формой, является контейнером для ее размещения.
 * Наоборот - форма владеет своим окном.
 */
export class ChatFormWindowComponentInternal extends EcsFormWindowComponentInternal {}
