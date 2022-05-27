import * as classNames from 'classnames';
import * as React from 'react';
import { SvgUrlImageView } from '@1c/g5-client-base/View/Image/SvgUrlImageView';

/** View svg-иконки чата */
export class ChatAttachmentSvgUrlImageView extends SvgUrlImageView {
    /** @override */
    public render() {
        const props = this.props;

        return (
            <span
                {...(props.tooltip && { title: props.tooltip })}
                className={classNames(props.className)}
                onClick={props.onClick}
                onDrop={props.onDrop}
                onDragOver={props.onDragOver}
                ref={props.containerRef || this.containerRef}
                {...this.getAdditionalProps()}
            />
        );
    }
}
