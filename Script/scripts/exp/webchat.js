goog.module('exp.CollaborationSystemWebChat1CE');

goog.require('CollaborationSystemWebChat1CE.API.MessageEvent')
goog.require('CollaborationSystemWebChat1CE.API.SendMessageData')
goog.require('CollaborationSystemWebChat1CE.API.MatchingKeyTokenData')
goog.require('CollaborationSystemWebChat1CE.API.UrlLocationData')
goog.require('CollaborationSystemWebChat1CE.API.MouseEvent')
goog.require('CollaborationSystemWebChat1CE.API.InitializeEvent')
goog.require('CollaborationSystemWebChat1CE.API.ContactInfoEvent')
goog.require('CollaborationSystemWebChat1CE.API.IncomingMessageType')
goog.require('CollaborationSystemWebChat1CE.API.OutgoingMessageType')
goog.require('CollaborationSystemWebChat1CE.API.Version');
goog.require('CollaborationSystemWebChat1CE.exporter');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventHandler');

/** Скрипт развёртки чата */
class CollaborationSystemWebChat1CEClass extends goog.events.EventTarget
{
    /**
     * @return {!CollaborationSystemWebChat1CEClass}
     */
    static getInstance ()
    {
        const chatURL = '%CHAT_URL%';
        const integrationId = '%INTEGRATION_ID%';
        const desktopOrientation = '%ORIENTATION%';
        const orientationPadding = '%ORIENTATION_PADDING%';
        const mobileButtonOrientation = '%MOBILE_BUTTON_ORIENTATION%';
        const colorTheme = '%COLOR_THEME%';
        const titleText = '%TITLE_TEXT%';
        const titleBackColor = '%TITLE_BACK_COLOR%';
        const titleTextColor = '%TITLE_TEXT_COLOR%';
        const allowVideoconferences = '%ALLOW_VIDEOCONFERENCES%';
        const displayUserPictures = '%DISPLAY_USER_PICTURES%';
        const languageCode = '%LANGUAGE_CODE%';
        const defaultApplicationUserCameraState = '%DEFAULT_APPLICATION_USER_CAMERA_STATE%';
        if (!CollaborationSystemWebChat1CEClass.instance_)
        {
            CollaborationSystemWebChat1CEClass.instance_ = new CollaborationSystemWebChat1CEClass(
                chatURL,
                integrationId,
                desktopOrientation,
                orientationPadding,
                mobileButtonOrientation,
                colorTheme,
                titleText,
                titleBackColor,
                titleTextColor,
                allowVideoconferences,
                displayUserPictures,
                languageCode,
                defaultApplicationUserCameraState);
        }

        return CollaborationSystemWebChat1CEClass.instance_;
    }

    /**
     * Chat API
     * @private
     * @param {string} chatURL
     * @param {string} integrationId
     * @param {string} desktopOrientation
     * @param {string} orientationPadding
     * @param {string} mobileButtonOrientation
     * @param {string} colorTheme
     * @param {string} titleText
     * @param {string} titleBackColor
     * @param {string} titleTextColor
     * @param {string} allowVideoconferences
     * @param {string} displayUserPictures
     * @param {string} languageCode
     * @param {string} defaultApplicationUserCameraState
     */
    constructor (
        chatURL,
        integrationId,
        desktopOrientation,
        orientationPadding,
        mobileButtonOrientation,
        colorTheme,
        titleText,
        titleBackColor,
        titleTextColor,
        allowVideoconferences,
        displayUserPictures,
        languageCode,
        defaultApplicationUserCameraState)
    {
        super();

        if (!chatURL)
        {
            return;
        }

        /**
         * @private
         * @type {boolean}
         */
        this.isLoaded_ = false;
        window.addEventListener('load', () => this.isLoaded_ = true);

        /**
         * @private
         * @type {boolean}
         */
        this.isInitialized_ = false;

        /**
         * @private
         * @type {boolean}
         */
        this.isOpen = false;

        /**
         * @private
         * @type {number}
         */
        this.headerHeight_ = 0;

        /**
         * @private
         * @type {number}
         */
        this.headerWidth_ = 0;

        /**
         * @private
         * @type {number}
         */
        this.height_ = 0;

        /**
         * @private
         * @type {number}
         */
        this.width_ = 0;

        /**
         * @private
         * @type {number}
         */
        this.frameLeft_ = 0;

        /**
         * @private
         * @type {HTMLIFrameElement}
         */
        this.iframe_ = null;

        /**
         * @private
         * @type {number}
         */
        this.mouseX_ = 0;

        /**
         * @private
         * @type {number}
         */
        this.mouseY_ = 0;

        /**
         * @private
         * @type {goog.events.EventHandler}
         */
        this.handler_ = null;

        /**
         * @private
         * @type {string}
         */
        this.orientation_ = desktopOrientation || 'bottom';

        /**
         * @private
         * @type {string}
         */
        this.orientationPadding_ = orientationPadding || '0%';

        /**
         * @private
         * @type {string}
         */
        this.mobileButtonOrientation_ = mobileButtonOrientation || 'rightBottom';

        /**
         * @private
         * @type {string}
         */
        this.integrationId_ = integrationId || '';

        /**
         * @private
         * @type {string}
         */
        this.colorTheme_ = colorTheme || '';

        /**
         * @private
         * @type {string}
         */
        this.titleText_ = titleText || '';

        /**
         * @private
         * @type {string}
         */
        this.titleBackColor_ = titleBackColor || '';

        /**
         * @private
         * @type {string}
         */
        this.titleTextColor_ = titleTextColor || '';

        /**
         * @private
         * @type {string}
         */
        this.allowVideoconferences_ = allowVideoconferences || 'false';

        /**
         * @private
         * @type {string}
         */
        this.displayUserPictures_ = displayUserPictures || 'false';

        /**
         * @private
         * @type {string}
         */
        this.defaultApplicationUserCameraState_ = defaultApplicationUserCameraState || 'on';

        /**
         * @private
         * @type {string}
         */
        this.languageCode_ = languageCode || 'en_US';

        /**
         * @private
         * @type {string}
         */
        this.beforeUnloadMessage_ = '';

        /**
         * @private
         * @type {function((Event|null)): ?|null}
         */
        this.pageBeforeUnload_ = () => {};

        this.init(chatURL);
    }

    /**
     * @private
     * @param {string} chatURL
     */
    init (chatURL)
    {
        this.iframe_ = /** @type {HTMLIFrameElement} */(document.createElement('IFRAME'));
        const url = new URL(chatURL);
        url.searchParams.append('integrationId', this.integrationId_);
        url.searchParams.append('colorTheme', this.colorTheme_);
        url.searchParams.append('titleText', this.titleText_);
        url.searchParams.append('titleBackColor', this.titleBackColor_);
        url.searchParams.append('titleTextColor', this.titleTextColor_);
        url.searchParams.append('allowVideoconferences', this.allowVideoconferences_);
        url.searchParams.append('displayUserPictures', this.displayUserPictures_);
        url.searchParams.append('defaultApplicationUserCameraState', this.defaultApplicationUserCameraState_);
        url.searchParams.append('languageCode', this.languageCode_);
        this.iframe_.src = url.toString()
        this.iframe_['allow'] = 'camera;microphone;display-capture;fullscreen';
        this.iframe_.style.position = 'absolute';
        if (this.isMobile())
        {
            this.iframe_.style.borderRadius = '50%';
            this.iframe_.style.boxShadow = '0px 8px 30px rgba(35, 35, 32, 0.16)';
        }
        else
        {
            this.iframe_.style.boxShadow = this.orientation_ === 'bottom' ?
                '0px 4px 12px 0px rgba(0,0,0,0.1)' :
                `rgba(0, 0, 0, 0.16) ${this.orientation_ === 'right' ? '-' : ''}8px 0px 28px 0px`;
            this.iframe_.style.borderRadius = '8px 8px 0px 0px';
        }
        this.iframe_.style.border = '0';
        this.iframe_.style.display = 'none';
        this.iframe_.style.transition = 'opacity 0.225s';
        window.addEventListener('message', goog.bind(this.onMessage, this));
        window.addEventListener('resize', goog.bind(this.fixPos, this));
        this.isMobile() && (window.addEventListener('resize', goog.bind(this.onOrientationChange, this)));
        document.body.appendChild(this.iframe_);
    }

    /**
     * @private
     * @return {boolean}
     */
    isMobile ()
    {
        return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }

    /**
     * @private
     * @param {!Event} event
     */
    onMessage (event)
    {
        const msgEvent = /** @type {!MessageEvent<CollaborationSystemWebChat1CE.API.MessageEvent>} */(event);
        const content = msgEvent.data
        if (content.source !== 'Chat')
        {
            return;
        }
        const types = CollaborationSystemWebChat1CE.API.IncomingMessageType
        switch (content.message)
        {
        case types.OPEN:
            this.open()
            break;
        case types.CLOSE:
            this.close()
            break;
        case types.HEADER_MOUSE_DOWN:
            this.handleChatMouseDown((/** @type {!MessageEvent<CollaborationSystemWebChat1CE.API.MouseEvent>} */(event)).data.data);
            break;
        case types.HEADER_MOUSE_UP:
            this.handleChatMouseUp((/** @type {!MessageEvent} */(event)));
            break;
        case types.HEADER_MOUSE_MOVE:
            this.handleChatMouseMove((/** @type {!MessageEvent<CollaborationSystemWebChat1CE.API.MouseEvent>} */(event)).data.data);
            break;
        case types.VIDEOCONFERENCE_START:
            this.pageBeforeUnload_ = window.onbeforeunload
            window.onbeforeunload = this.beforeUnload;
            this.dispatchEvent(EventType.VIDEOCONFERENCE_START);
            break;
        case types.VIDEOCONFERENCE_END:
            window.onbeforeunload = this.pageBeforeUnload_;
            this.dispatchEvent(EventType.VIDEOCONFERENCE_END);
            break;
        case types.INITIALIZED:
            this.handleInitializedMessage((/** @type {!MessageEvent<CollaborationSystemWebChat1CE.API.InitializeEvent>} */(event)).data.data)
            break;
        case types.REQUEST_URL_LOCATION:
            const json = new CollaborationSystemWebChat1CE.API.UrlLocationData();
            json.title = document.title;
            json.url = window.location.href;
            this.respondMessage(
                (/** @type {!MessageEvent} */(event)),
                CollaborationSystemWebChat1CE.API.OutgoingMessageType.RESPONSE_URL_LOCATION,
                json)
            break;
        }
    }

    /**
     * @private
     * @param {!CollaborationSystemWebChat1CE.API.InitializeData} data
     */
    handleInitializedMessage (data)
    {
        this.beforeUnloadMessage_ = data.beforeUnloadMessage
        this.iframe_.style.top = 'auto';
        if (this.isMobile())
        {
            this.headerHeight_ = this.headerWidth_ = Math.min(window.innerHeight, window.innerWidth) * 0.14;
            this.iframe_.style.width = this.headerWidth_ + 'px';
            this.iframe_.style.height = this.headerHeight_ + 'px';
            this.orientation_ = 'bottom';
            this.height_ = window.innerHeight;
            this.width_ = window.innerWidth;
            this.iframe_.style.bottom = '30px';
            this.iframe_.style.left = (this.mobileButtonOrientation_ === 'leftBottom') ? '30px' : 'auto';
            this.iframe_.style.right = (this.mobileButtonOrientation_ === 'leftBottom') ? 'auto' : '30px';
        }
        else
        {
            this.headerHeight_ = data.headerHeight;
            this.headerWidth_ = data.headerWidth;
            this.iframe_.style.width = this.headerWidth_ + 'px';
            this.iframe_.style.height = this.headerHeight_ + 'px';
            let bottom = this.orientation_ === 'bottom';
            this.height_ = data.height;
            this.width_ = data.width;
            if (bottom)
            {
                this.attachToBottom();
            }
            else
            {
                this.iframe_.style.transformOrigin = (this.orientation_ === 'right') ? 'bottom right' : 'bottom left';
                this.attachToSide();
            }
        }
        this.iframe_.style.display = '';
        if (this.isLoaded_)
        {
            this.dispatchEvent(EventType.INITIALIZED);
        }
        else
        {
            window.addEventListener('load',
                () =>
                {
                    setTimeout(() => this.dispatchEvent(EventType.INITIALIZED), 0);
                });
        }
        this.isInitialized_ = true;
        this.frameLeft_ = this.iframe_.offsetLeft;
        if (data.offsetLeft !== -1)
        {
            this.frameLeft_ = data.offsetLeft;
        }
    }

    /**
     * @private
     */
    attachToSide ()
    {
        const right = this.orientation_ === 'right';
        this.iframe_.style.transform = `rotate(${right ? '-' : ''}90deg)`;
        this.iframe_.style.left = right ? 'auto' : '0px';
        this.iframe_.style.right = right ? '0px' : 'auto';
        switch (this.orientationPadding_)
        {
        case '0':
            this.iframe_.style.bottom = `calc(30px + ${this.headerWidth_}px)`;
            break;
        case '50':
            this.iframe_.style.bottom = `calc(50% + ${this.headerWidth_ / 2}px)`;
            break;
        case '100':
            this.iframe_.style.bottom = `calc(100% - 30px)`;
            break;
        }
    }

    /**
     * @private
     */
    attachToBottom ()
    {
        switch (this.orientationPadding_)
        {
        case '0':
            this.iframe_.style.left = '30px';
            break;
        case '50':
            this.iframe_.style.left = `calc(50% - ${this.headerWidth_ / 2}px)`;
            break;
        case '100':
            this.iframe_.style.left = `calc(100% - ${this.headerWidth_}px - 30px)`;
            break;
        }
        this.iframe_.style.right = 'auto';
        this.iframe_.style.bottom = '0px';
    }

    /**
     * @private
     */
    handleChatHeaderClick ()
    {
        if (!this.isOpen)
        {
            this.open()
        }
    }

    /**
     * @private
     * @param {!CollaborationSystemWebChat1CE.API.MouseData} data
     */
    handleChatMouseDown (data)
    {
        this.mouseX_ = data.offsetX;
        this.mouseY_ = data.offsetY;
        if (this.isOpen)
        {
            this.frameLeft_ = this.iframe_.offsetLeft;
        }
    }

    /**
     * @private
     * @param {!CollaborationSystemWebChat1CE.API.MouseData} data
     */
    handleChatMouseMove (data)
    {
        if (!this.isOpen)
        {
            return;
        }
        const offsetX = this.mouseX_ - data.offsetX;
        let frameLeft = this.frameLeft_ - offsetX;
        frameLeft =
            Math.min(
                Math.max(frameLeft, 30),
                window.innerWidth - 30 - this.iframe_.offsetWidth);
        this.iframe_.style.left = frameLeft + 'px';
        const offsetY = this.mouseY_ - data.offsetY;
        const height = Math.min(Math.max(this.height_ + offsetY, 400), window.innerHeight - 30);
        this.iframe_.style.height = height + 'px';
    }

    /**
     * @param {!MessageEvent} event
     * @private
     */
    handleChatMouseUp (event)
    {
        if (this.isOpen)
        {
            setTimeout(
                () =>
                {
                    this.frameLeft_ = this.iframe_.offsetLeft;
                    this.height_ = this.iframe_.offsetHeight;
                    this.respondMessage(event, 'headerMouseUpOK', {
                        height: this.height_,
                        offsetLeft: this.frameLeft_
                    })
                }, 250);
        }
        this.handleChatHeaderClick();
    }

    /**
     * @private
     */
    fixPos ()
    {
        if (!this.isMobile())
        {
            if (this.isOpen)
            {
                this.iframe_.style.left = Math.min(
                    Math.max(this.frameLeft_, 30),
                    window.innerWidth - 30 - this.iframe_.offsetWidth) + 'px';
                if (this.height_ > 400 && this.height_ > window.innerHeight - 30)
                {
                    this.height_ = window.innerHeight - 30;
                    this.iframe_.style.height = this.height_ + 'px';
                }
            }
            else
            {
                switch (this.orientation_)
                {
                case 'bottom':
                    this.attachToBottom();
                    break;
                case 'left':
                case 'right':
                    this.attachToSide();
                    break;
                }
            }
        }
    }

    /** */
    open ()
    {
        if (!this.isOpen && this.isInitialized_)
        {
            this.iframe_.style.opacity = '0';

            setTimeout(
                () =>
                {
                    if (this.isMobile())
                    {
                        this.iframe_.style.borderRadius = '0';
                        this.iframe_.style.height = '100%';
                        this.iframe_.style.width = '100%';
                    }
                    else
                    {
                        this.iframe_.style.height = this.height_ + 'px';
                        this.iframe_.style.width = this.width_ + 'px';
                    }
                }, 250);
            setTimeout(
                () =>
                {
                    this.iframe_.style.transform = '';
                    this.iframe_.style.bottom = '0px';
                    this.isOpen = !this.isOpen;
                    if (this.isMobile())
                    {
                        this.iframe_.style.left = '0px';
                        this.iframe_.style.right = '0px';
                        this.iframe_.style.top = '0px';
                        this.iframe_.style.bottom = '0px';
                    }
                    else
                    {
                        this.iframe_.style.right = 'auto';
                        this.fixPos();
                    }
                    this.dispatchEvent(EventType.OPEN);
                    this.postMessage(CollaborationSystemWebChat1CE.API.OutgoingMessageType.OPEN);
                    this.iframe_.style.opacity = '1';
                }, 260);
        }
    }

    /** */
    close ()
    {
        if (this.isOpen && this.isInitialized_)
        {
            this.iframe_.style.opacity = '0';
            setTimeout(
                () =>
                {
                    this.iframe_.style.height = this.headerHeight_ + 'px';
                    this.iframe_.style.width = this.headerWidth_ + 'px';
                }, 250);
            setTimeout(
                () =>
                {
                    this.isOpen = !this.isOpen;
                    if (this.isMobile())
                    {
                        this.iframe_.style.borderRadius = '50%';
                        this.iframe_.style.top = 'auto';
                        this.iframe_.style.bottom = '30px';
                        this.iframe_.style.left = (this.mobileButtonOrientation_ === 'leftBottom') ? '30px' : 'auto';
                        this.iframe_.style.right = (this.mobileButtonOrientation_ === 'leftBottom') ? 'auto' : '30px';
                    }
                    else
                    {
                        if (this.orientation_ === 'bottom')
                        {
                            this.attachToBottom();
                        }
                        else
                        {
                            this.attachToSide()
                        }
                    }
                    this.postMessage(CollaborationSystemWebChat1CE.API.OutgoingMessageType.CLOSE);
                    this.iframe_.style.opacity = '1';
                    this.dispatchEvent(EventType.CLOSE);
                }, 260);
        }
    }

    /**
     * @return {!Promise<void>}
     */
    logout ()
    {
        return this.channelMessage(CollaborationSystemWebChat1CE.API.OutgoingMessageType.LOGOUT)
            .then(
                () =>
                {
                    this.iframe_.src += ' ';
                    this.isOpen = false;
                });
    }

    /**
     * @private
     */
    onOrientationChange ()
    {
        this.headerHeight_ = this.headerWidth_ = Math.min(window.innerWidth, window.innerHeight) * 0.14;
        if (this.isOpen !== true)
        {
            this.iframe_.style.height = this.headerHeight_ + 'px';
            this.iframe_.style.width = this.headerWidth_ + 'px';
        }
    }

    /**
     * @private
     * @param {Event} event
     * @return string
     */
    beforeUnload (event)
    {
        event.preventDefault();
        event.returnValue = this.beforeUnloadMessage_;
        return this.beforeUnloadMessage_;
    }

    /**
     * @param {!CollaborationSystemWebChat1CE.API.SendMessageData} message
     */
    sendMessage (message)
    {
        this.postMessage(CollaborationSystemWebChat1CE.API.OutgoingMessageType.SEND_MESSAGE,
            CollaborationSystemWebChat1CE.API.SendMessageData.as(message));
    }

    /**
     * @return Promise<!CollaborationSystemWebChat1CE.API.ContactInfoData>
     */
    getContactInfo ()
    {
        return this.channelMessage(CollaborationSystemWebChat1CE.API.OutgoingMessageType.GET_CONTACT_INFO);
    }

    /**
     * @param {!CollaborationSystemWebChat1CE.API.ContactInfoData} contactInfo
     */
    setContactInfo (contactInfo)
    {
        this.postMessage(CollaborationSystemWebChat1CE.API.OutgoingMessageType.SET_CONTACT_INFO,
            CollaborationSystemWebChat1CE.API.ContactInfoData.as(contactInfo));
    }

    /**
     * @return Promise<boolean>
     */
    isVideoconferenceEnabled ()
    {
        return this.channelMessage(CollaborationSystemWebChat1CE.API.OutgoingMessageType.IS_VIDEOCONFERENCE_ENABLED);
    }

    /**
     * @param {string} matchingKeyToken
     */
    setMatchingKeyToken (matchingKeyToken)
    {
        const data = new CollaborationSystemWebChat1CE.API.MatchingKeyTokenData();
        data.matchingKeyToken = matchingKeyToken;
        this.postMessage(CollaborationSystemWebChat1CE.API.OutgoingMessageType.SET_MATCHING_KEY_TOKEN,
            data);
    }

    /**
     * @return Promise<boolean>
     */
    startVideoconference ()
    {
        this.open();
        return this.channelMessage(CollaborationSystemWebChat1CE.API.OutgoingMessageType.START_VIDEOCONFERENCE);
    }

    /**
     * @param {!EventNames} type
     * @param {function(?):?} handler
     */
    addListener (type, handler)
    {
        switch (type)
        {
        case EventNames.CLOSE:
            this.getHandler_().listen(this, EventType.CLOSE, handler);
            break;
        case EventNames.OPEN:
            this.getHandler_().listen(this, EventType.OPEN, handler);
            break;
        case EventNames.VIDEOCONFERENCE_START:
            this.getHandler_().listen(this, EventType.VIDEOCONFERENCE_START, handler);
            break;
        case EventNames.VIDEOCONFERENCE_END:
            this.getHandler_().listen(this, EventType.VIDEOCONFERENCE_END, handler);
            break;
        case EventNames.INITIALIZED:
            this.getHandler_().listen(this, EventType.INITIALIZED, handler);
            break;
        }
    }

    /**
     * @param {!EventNames} type
     * @param {function(?):?} handler
     */
    removeListener (type, handler)
    {
        switch (type)
        {
        case EventNames.CLOSE:
            this.getHandler_().unlisten(this, EventType.CLOSE, handler);
            break;
        case EventNames.OPEN:
            this.getHandler_().unlisten(this, EventType.OPEN, handler);
            break;
        case EventNames.VIDEOCONFERENCE_START:
            this.getHandler_().unlisten(this, EventType.VIDEOCONFERENCE_START, handler);
            break;
        case EventNames.VIDEOCONFERENCE_END:
            this.getHandler_().unlisten(this, EventType.VIDEOCONFERENCE_END, handler);
            break;
        case EventNames.INITIALIZED:
            this.getHandler_().unlisten(this, EventType.VIDEOCONFERENCE_END, handler);
            break;
        }
    }

    /**
     * @private
     * @return {!goog.events.EventHandler}
     */
    getHandler_ ()
    {
        if (goog.isNull(this.handler_))
        {
            this.handler_ = new goog.events.EventHandler(this);
        }

        return /** @type {!goog.events.EventHandler} */(this.handler_);
    }

    /**
     * @protected
     * @override
     */
    disposeInternal ()
    {
        super.disposeInternal();
        window.removeEventListener('message', goog.bind(this.onMessage, this));
        window.removeEventListener('resize', goog.bind(this.fixPos, this));
        this.isMobile() && (window.removeEventListener('resize', goog.bind(this.onOrientationChange, this)));
        goog.dispose(this.handler_);
    }

    /**
     * @private
     * @param {string} message
     * @return {!Promise}
     */
    channelMessage (message)
    {
        return new Promise(
            resolve =>
            {
                const channel = new MessageChannel()
                channel.port1.onmessage =
                    /**
                     * @suppress {reportUnknownTypes}
                     * @param {!MessageEvent} e
                     */
                        (e) =>
                    {resolve(e.data.data);};
                this.iframe_.contentWindow.postMessage(
                    {
                        version: CollaborationSystemWebChat1CE.API.Version,
                        source: 'CollaborationSystemWebChat1CE',
                        message: message
                    },
                    '*', [channel.port2]);
            });
    }

    /**
     * @private
     * @param {MessageEvent} event
     * @param {string} message
     * @param {Object} data
     */
    respondMessage (event, message, data)
    {
        if (!event.ports[0])
        {
            return;
        }
        event.ports[0].postMessage({
            version: CollaborationSystemWebChat1CE.API.Version,
            source: 'CollaborationSystemWebChat1CE',
            message: message,
            data: data
        });
    }

    /**
     * @private
     * @param {string} message
     * @param {*=} data
     */
    postMessage (message, data)
    {
        this.iframe_.contentWindow.postMessage(
            {
                version: CollaborationSystemWebChat1CE.API.Version,
                source: 'CollaborationSystemWebChat1CE',
                message: message,
                data: data
            },
            '*');
    }
}

/**
 * @type {CollaborationSystemWebChat1CEClass}
 * @private
 */
CollaborationSystemWebChat1CEClass.instance_ = null;

/**
 * @enum {string}
 */
const EventNames =
    {
        OPEN: 'open',
        CLOSE: 'close',
        VIDEOCONFERENCE_START: 'videoconferenceStart',
        VIDEOCONFERENCE_END: 'videoconferenceEnd',
        INITIALIZED: 'initialized'
    };

/**
 * @private
 * @enum {string}
 */
const EventType =
    {
        OPEN: goog.events.getUniqueId('CollaborationSystemWebChat1CE_open'),
        CLOSE: goog.events.getUniqueId('CollaborationSystemWebChat1CE_close'),
        VIDEOCONFERENCE_START: goog.events.getUniqueId('CollaborationSystemWebChat1CE_videoconferenceStart'),
        VIDEOCONFERENCE_END: goog.events.getUniqueId('CollaborationSystemWebChat1CE_videoconferenceEnd'),
        INITIALIZED: goog.events.getUniqueId('CollaborationSystemWebChat1CE_initialized')
    };

{
    const obj = CollaborationSystemWebChat1CEClass;
    const proto = obj.prototype;
    CollaborationSystemWebChat1CE.exporter
        .exportSymbol(obj, 'CollaborationSystemWebChat1CEClass')
        .exportProperty(proto, proto.open, 'open')
        .exportProperty(proto, proto.close, 'close')
        .exportProperty(proto, proto.setContactInfo, 'setContactInfo')
        .exportProperty(proto, proto.getContactInfo, 'getContactInfo')
        .exportProperty(proto, proto.setMatchingKeyToken, 'setMatchingKeyToken')
        .exportProperty(proto, proto.logout, 'logout')
        .exportProperty(proto, proto.isVideoconferenceEnabled, 'isVideoconferenceEnabled')
        .exportProperty(proto, proto.startVideoconference, 'startVideoconference')
        .exportProperty(proto, proto.sendMessage, 'sendMessage')
        .exportProperty(proto, proto.addListener, 'addListener')
        .exportProperty(proto, proto.removeListener, 'removeListener');
}

{
    CollaborationSystemWebChat1CE.exporter
        .exportSymbol(CollaborationSystemWebChat1CEClass.getInstance(), 'CollaborationSystemWebChat1CE');
}
