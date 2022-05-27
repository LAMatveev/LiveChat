import * as classNames from 'classnames';
import * as React from 'react';
import { ChatAttachmentSvgUrlImageView } from 'scripts/UiComponents/ChatIco/ChatAttachmentSvgUrlImageView';
import { UrlImage } from '@1c/g5-client-base/Base/Core/Image';
import { Url } from '@1c/g5-client-base/Base/Net/Url';
import { ClassValue } from '@1c/g5-client-base/Ecs/UiComponents/PropertySets/IHasClassNamePropertySet';
import { Size } from '@1c/g5-client-base/Ecs/UiComponents/PropertySets/IHasSizePropertySet';
import { IStyle } from '@1c/g5-client-base/Style/IStyle';
import { IReactBaseViewProps } from '@1c/g5-client-base/View/IReactBaseViewProps';
import { SvgIcon } from '@1c/g5-client-base/View/Icon/SvgIcon';
import { assert } from '@1c/g5-client-base/debug';

/** Свойства иконки */
export interface IChatAttachmentIcoProps extends IReactBaseViewProps {
    id?: string;
    size: Size;
    svgIcon?: SvgIcon;
    style: IStyle;
    tooltip?: string;
    disabled?: boolean;
    className?: ClassValue;
    onClick?: <TElement extends Element = HTMLSpanElement>(e: React.MouseEvent<TElement>) => void;
}

/** Иконка вложения */
export function ChatAttachmentIco(props: IChatAttachmentIcoProps): JSX.Element {
    assert(props.svgIcon);
    const image = new UrlImage(new Url(props.svgIcon));

    return (
        <ChatAttachmentSvgUrlImageView
            {...(props.id && { id: props.id })}
            {...(props.tooltip && { title: props.tooltip })}
            className={classNames(
                'ico',
                'flex-0-0-auto',
                `i${props.size}`,
                { disabled: props.disabled },
                props.className
            )}
            onClick={props.onClick}
            onDrop={props.onDrop}
            onDragOver={props.onDragOver}
            tooltip={props.tooltip}
            image={image}
            ref={props.containerRef}
            style={props.style}
        />
    );
}
