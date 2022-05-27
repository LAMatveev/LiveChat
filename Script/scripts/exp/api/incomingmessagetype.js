goog.provide('CollaborationSystemWebChat1CE.API.IncomingMessageType');

/** @enum {string} */
CollaborationSystemWebChat1CE.API.IncomingMessageType =
    {
        OPEN: 'open',
        CLOSE: 'close',
        VIDEOCONFERENCE_START: 'videoconferenceStart',
        VIDEOCONFERENCE_END: 'videoconferenceEnd',
        HEADER_MOUSE_DOWN: 'headerMouseDown',
        HEADER_MOUSE_UP: 'headerMouseUp',
        HEADER_MOUSE_MOVE: 'headerMouseMove',
        INITIALIZED: 'initialized',
        REQUEST_URL_LOCATION: 'requestUrlLocation'
    };
