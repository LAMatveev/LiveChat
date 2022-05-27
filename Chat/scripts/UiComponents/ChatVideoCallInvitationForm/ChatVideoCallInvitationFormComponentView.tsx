import * as classNames from 'classnames';
import * as React from 'react';
import { ChatVideoCallInvitationFormComponentInternal } from 'scripts/UiComponents/ChatVideoCallInvitationForm/ChatVideoCallInvitationFormComponentInternal';

import { Ico } from '@1c/g5-client-base/Ecs/UiComponents/Ico/View/Ico';
import { Size } from '@1c/g5-client-base/Ecs/UiComponents/PropertySets/IHasSizePropertySet';
import { SVGId } from '@1c/g5-client-base/Ecs/UiComponents/PropertySets/IHasSvgIdPropertySet';
import { IPropsOverwrite } from '@1c/g5-client-base/UiComponents/UiComponent/IUiComponent';
import { UiComponentView } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentView';
import { viewForComponent } from '@1c/g5-client-base/UiComponents/UiComponent/UiComponentViewService';

/** View формы приглашения в видеозвонок системы взаимодействия */
@viewForComponent(ChatVideoCallInvitationFormComponentInternal)
export class ChatVideoCallInvitationFormComponentView extends UiComponentView<
    ChatVideoCallInvitationFormComponentInternal
> {
    /** @override */
    protected renderVisibleState(overwriteProps: IPropsOverwrite = {}) {
        const component = this.getComponent();
        const inviterAvatarView = component.inviterAvatarComponent.createView(this);
        const inviterView = component.inviterComponent.createView(this);

        return (
            <div
                data-theme='dark'
                className={classNames('cloudBox', 'ecsIncoming', 'fullsize', 'flex', 'flex-ai-center')}
                tabIndex={0}
                {...this.baseViewProps()}>
                <div className={classNames('cloudRow', 'flex-1-1-100')}>
                    <div className={classNames('ecsIncomingBox')}>
                        <div>
                            {inviterAvatarView}
                            {inviterView}
                            {component.membersComponents.length > 0 && (
                                <div className={classNames('fs-9')}>
                                    {component.membersComponents.map((memberComponent) =>
                                        memberComponent.createView(this)
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className={classNames('cloudRow', 'flex flex-ai-center')}>
                    <div className={classNames('ecsVideoPress', 'flex-jc-center')}>
                        <Ico
                            style={this.getStyle()}
                            size={Size._32}
                            svgSize={Size._24}
                            svgId={SVGId.CALL_ON}
                            className={classNames('pressIco', 'iPressRound', 'iPressRoundGreen', 'fillWhite')}
                            onClick={this.onCallOnIcoClick}
                        />
                        <Ico
                            style={this.getStyle()}
                            size={Size._32}
                            svgSize={Size._24}
                            svgId={SVGId.CALL_OFF}
                            className={classNames('pressIco', 'iPressRound', 'iPressRoundRed', 'fillWhite')}
                            onClick={this.onCallOffIcoClick}
                        />
                    </div>
                </div>
            </div>
        );
    }

    private onCallOnIcoClick = (): void => {
        this.getComponent().handleOnCallOnClickEvent();
    };

    private onCallOffIcoClick = (): void => {
        this.getComponent().handleOnCallOffClickEvent();
    };
}
