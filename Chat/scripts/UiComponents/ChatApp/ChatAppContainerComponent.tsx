import { action, onReactionError } from 'mobx';
import * as ReactDOM from 'react-dom';
import { ChatAppComponentInternal, PageRoute } from 'scripts/UiComponents/ChatApp/ChatAppComponentInternal';

import { ECSException, ecs } from '@1c/ecs.js';
import { isSilentException } from '@1c/g5-client-base/Base/Core/Exception/SilentException';
import { Throwable } from '@1c/g5-client-base/Base/Core/Exception/Throwable';
import { UnsupportedOperationException } from '@1c/g5-client-base/Base/Core/Exception/UnsupportedOperationException';
import { openLink } from '@1c/g5-client-base/Base/Utils/browser';
import { isEcsException } from '@1c/g5-client-base/Ecs/Exceptions/EcsException';
import { IEcsApplicationService } from '@1c/g5-client-base/Ecs/Services/EcsApplicationService/IEcsApplicationService';
import { ContextMenuComponent } from '@1c/g5-client-base/Ecs/UiComponents/ContextMenu/ContextMenuComponent';
import { getService } from '@1c/g5-client-base/Services/di';
import { CompositeComponent } from '@1c/g5-client-base/UiComponents/Composite/CompositeComponent';
import { PopupAreaComponent } from '@1c/g5-client-base/UiComponents/PopupArea/PopupAreaComponent';
import { IUiComponentsOwner } from '@1c/g5-client-base/UiComponents/UiComponent/IUiComponent';
import { UiComponent } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponent';
import { Constructor1 } from '@1c/g5-client-base/Utils/Constructor';
import { createFocusManager } from '@1c/g5-client-base/View/ReactDOM/FocusManager';
import { IAppContainerServices } from '@1c/g5-client-base/View/ReactDOM/IAppContainerServices';
import { assert, setUnhandledErrorsHandler } from '@1c/g5-client-base/debug';

/**
 * Специальный владелец контейнера приложения ECS,
 * который является компонентом самого верхнего уровня.
 */
export class EcsAppContainerOwner implements IUiComponentsOwner {
    /** @override */
    public registerOwnComponent(ownComponent: ChatAppContainerComponent) {
        // Ничего не делаем
    }

    /** @override */
    public unregisterOwnComponent(ownComponent: ChatAppContainerComponent) {
        // Ничего не делаем
    }

    /** @override */
    public getAppContainerServices(): IAppContainerServices {
        throw new UnsupportedOperationException();
    }
}

/** Отображает контейнер приложения ECS */
export class ChatAppContainerComponent extends CompositeComponent {
    protected appContainerServices!: IAppContainerServices;
    private readonly appComponent: ChatAppComponentInternal;
    private readonly contextMenuComponent: ContextMenuComponent;
    private readonly popupAreaComponent: PopupAreaComponent;

    constructor(
        owner: EcsAppContainerOwner,
        appComponentClass: Constructor1<ChatAppComponentInternal, IUiComponentsOwner>
    ) {
        super(owner);
        this.appComponent = this.createOwnComponent(appComponentClass);
        this.contextMenuComponent = this.createOwnComponent(ContextMenuComponent);
        this.popupAreaComponent = this.createOwnComponent(PopupAreaComponent);
    }

    public getPopupAreaComponent() {
        return this.popupAreaComponent;
    }

    public render(rootElement: HTMLElement): void {
        let view = this.createView(null);
        if (view) {
            ReactDOM.render(view, rootElement);
        } else {
            assert(false);
        }
    }

    /** @override */
    public getAppContainerServices() {
        return this.appContainerServices;
    }

    /** @override */
    public dispose() {
        this.appContainerServices.popupService.dispose();
        super.dispose();
    }

    /** @override */
    protected getEnabledActiveChildComponent() {
        return this.appComponent.getActiveChildComponent();
    }

    /** @override */
    protected createOwnRoot() {
        this.appContainerServices = {
            popupService: this.popupAreaComponent,
            convertToString: (val) => String(val),
            processLink: (val, newTab) => {
                this.processLink(val, newTab);
            },
            contextMenuService: this.contextMenuComponent
        };

        return this.appComponent as UiComponent;
    }

    /** @override */
    protected afterCreate() {
        super.afterCreate();
        createFocusManager(this);

        // Выводим все неперехваченные исключения
        // (кроме исключений ECS, которые произошли в библиотеке ECS)
        setUnhandledErrorsHandler((e: Error | null) => {
            if (e && e.name !== 'ecs.Error') {
                this.handleUnhandledError(e);
            }
        });

        // И исключения, которые произошли в реакциях MobX
        onReactionError((e: Error) => {
            this.handleUnhandledError(e);
        });

        // И исключения, которые произошли в библиотеке ECS
        ecs.setUnhandledErrorsHandler((e: ECSException) => {
            this.handleUnhandledError(e);
        });
    }

    protected processLink(link: unknown, newTab: boolean): void {
        if (typeof link === 'string') {
            openLink(link, newTab);
        }
    }

    @action
    protected handleUnhandledError(err: Error | Throwable): void {
        if (isSilentException(err)) {
            // Не показываем "тихие" исключения
            return;
        }

        if (isEcsException(err)) {
            // Обработка особых случаев обработки исключений системы взаимодействия
            const ecsException = err as ECSException;
            const reason = ecsException.getReason();
            const source = ecsException.getSource();
            if (reason === 'notConnected') {
                // При потере соединения не показываем исключение, а переходим к соответствующей странице
                this.appComponent.changeRoute(PageRoute.DISCONNECTED);

                return;
            } else if (reason === 'notFound' && source === 'userInvitation') {
                // Удаляем невалидный invitationId
                getService(IEcsApplicationService).deleteInvitationId();
            }
        }
    }
}
