import * as classNames from 'classnames';
import * as React from 'react';
import { ChatUserComponentInternal } from 'scripts/UiComponents/ChatUser/ChatUserComponentInternal';
import { IPropsOverwrite } from '@1c/g5-client-base/UiComponents/UiComponent/IUiComponent';
import { UiComponentView } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentView';
import { viewForComponent } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentViewService';

/** View пользователя ECS */
@viewForComponent(ChatUserComponentInternal)
export class ChatUserComponentView extends UiComponentView<ChatUserComponentInternal> {
    /** @override */
    protected renderVisibleState(overwriteProps: IPropsOverwrite = {}) {
        const component = this.getComponent();
        const className = component.getProperty('className');

        return (
            <div className={classNames(className)} {...this.baseViewProps()}>
                {this.getUserPresentation()}
            </div>
        );
    }

    private getUserPresentation(): React.ReactNode {
        const component = this.getComponent();
        const userPresentation = component.getProperty('userPresentation');
        const highLight = component.getProperty('highLight');

        if (highLight) {
            let highLights = highLight.split(/\s+/);
            const parts = userPresentation.split(new RegExp(`(${highLights.join('|')})`, 'gi'));
            highLights = highLights.map((highLightPart) => highLightPart.toLowerCase());

            return (
                <React.Fragment>
                    {parts.map((part, index) =>
                        highLights.includes(part.toLowerCase()) ? (
                            <span className={classNames('highlight')} key={index}>
                                {part}
                            </span>
                        ) : (
                            <React.Fragment key={index}>{part}</React.Fragment>
                        )
                    )}
                </React.Fragment>
            );
        } else {
            return <React.Fragment>{userPresentation}</React.Fragment>;
        }
    }
}
