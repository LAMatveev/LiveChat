import * as classNames from 'classnames';
import * as React from 'react';
import { PostMessageObserverService } from 'scripts/Services/PostMessageObserverService/PostMessageObserverService';
import { ChatLoadingPageComponentInternal } from 'scripts/UiComponents/ChatLoadingPage/ChatLoadingPageComponentInternal';

import { isInterfaceMobile } from '@1c/g5-client-base/Base/Env/interfaceKind';
import { Ico } from '@1c/g5-client-base/Ecs/UiComponents/Ico/View/Ico';
import { Size } from '@1c/g5-client-base/Ecs/UiComponents/PropertySets/IHasSizePropertySet';
import { SVGId } from '@1c/g5-client-base/Ecs/UiComponents/PropertySets/IHasSvgIdPropertySet';
import { kUrlSearchParamsKey } from '@1c/g5-client-base/Site/scripts/UiComponents/ConversationsPage/ConversationsPageComponentInternal';
import { IPropsOverwrite } from '@1c/g5-client-base/UiComponents/UiComponent/IUiComponent';
import { UiComponentView } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentView';
import { viewForComponent } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentViewService';

/** View страницы загрузки */
@viewForComponent(ChatLoadingPageComponentInternal)
export class ChatLoadingPageComponentView extends UiComponentView<ChatLoadingPageComponentInternal> {
    /** @override */

    protected renderVisibleState(overwriteProps: IPropsOverwrite = {}) {
        const urlParams = new URLSearchParams(sessionStorage.getItem(kUrlSearchParamsKey) || '');
        const titleText = urlParams.get('titleText');

        return (
            <div
                className={classNames('chatTopline ecsTopline')}
                {...this.baseViewProps()}
                onMouseDown={this.onHeaderMouseDown}
                title={titleText || ''}>
                <div className={classNames('ecsHeader', 'flex')}>
                    <Ico
                        svgId={SVGId.BUBBLE_DOUBLE}
                        size={Size._24}
                        className={classNames('ecsHeaderIco')}
                        style={this.getStyle()}
                    />
                    {!isInterfaceMobile && (
                        <div className={classNames('flex-1-1-auto', 'flex', 'flex-ai-center')}>
                            <div
                                className={classNames('chatToplineBox toplineBox')}
                                data-title={titleText}
                                dir='auto'
                            />
                        </div>
                    )}
                    {!isInterfaceMobile && <div className={classNames('flex flex-0-0-auto flex-ai-center m-4')} />}
                </div>
            </div>
        );
    }

    private onHeaderMouseDown = () => {
        PostMessageObserverService.sendMessage('headerMouseDown', { offsetX: 0, offsetY: 0 });
        window.addEventListener('mouseup', this.onHeaderMouseUp);
    };

    private onHeaderMouseUp = () => {
        PostMessageObserverService.sendMessage('headerMouseUp');
        window.removeEventListener('mouseup', this.onHeaderMouseUp);
    };
}
