// tslint:disable:no-import-side-effect
import * as classNames from 'classnames';
import { action, runInAction } from 'mobx';
import * as React from 'react';
import { ChatAppComponent } from 'scripts/UiComponents/ChatApp/ChatAppComponent';
import {
    ChatAppContainerComponent,
    EcsAppContainerOwner
} from 'scripts/UiComponents/ChatApp/ChatAppContainerComponent';
import { SVGIconsElement } from 'scripts/UiComponents/SVGIconsElement';

import 'scripts/Services/GlobalServices';
import { IPropsOverwrite } from '@1c/g5-client-base/UiComponents/UiComponent/IUiComponent';
import { createComponent } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponent';
import { UiComponentView } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentView';
import { viewForComponent } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentViewService';
import { Shortcut } from '@1c/g5-client-base/View/ReactDOM/Shortcut';
import { shortcutDispatcher } from '@1c/g5-client-base/View/ReactDOM/shortcutDispatcher';

/** View контейнера приложения ECS */
@viewForComponent(ChatAppContainerComponent)
export class ChatAppContainerComponentView extends UiComponentView<ChatAppContainerComponent> {
    /** @override */
    protected renderVisibleState(overwriteProps: IPropsOverwrite = {}) {
        const component = this.getComponent();
        const popupAreaComponent = component.getPopupAreaComponent();

        return (
            <div
                className={classNames('fullSize')}
                onKeyDownCapture={this.onKeyDownCapture}
                onContextMenu={this.onContextMenu}
                {...this.baseViewProps()}>
                {this.createChildView(this.getComponent().getProperty('rootComponent'), undefined, overwriteProps)}
                {popupAreaComponent.createView(this)}
                <SVGIconsElement />
            </div>
        );
    }

    @action
    private onKeyDownCapture = (event: React.KeyboardEvent): void => {
        let shortcut = Shortcut.fromEvent(event);

        // Не обрабатываем, если нажаты только модификаторы.
        if (!shortcut.isModifiersOnly() && shortcutDispatcher.dispatchShortcut(shortcut)) {
            event.preventDefault();
        }
    };

    private onContextMenu = (event: React.MouseEvent<HTMLDivElement>): void => {
        const elementTagName = (event.target as Element).tagName.toLowerCase();
        if (elementTagName !== 'input' && elementTagName !== 'textarea') {
            event.stopPropagation();
            event.preventDefault();
        }
    };
}

/** Создает контейнер приложения ECS */
export function createEcsAppContainer(): ChatAppContainerComponent {
    return runInAction(function(): ChatAppContainerComponent {
        return createComponent(ChatAppContainerComponent, new EcsAppContainerOwner(), ChatAppComponent);
    });
}
