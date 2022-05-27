goog.provide('CollaborationSystemWebChat1CE.API.OutgoingMessageType');

/** @enum {string} */
CollaborationSystemWebChat1CE.API.OutgoingMessageType =
    {
        OPEN: 'open',
        CLOSE: 'close',
        LOGOUT: 'logout',
        SEND_MESSAGE: 'sendMessage',
        GET_CONTACT_INFO: 'getContactInfo',
        SET_CONTACT_INFO: 'setContactInfo',
        IS_VIDEOCONFERENCE_ENABLED: 'isVideoconferenceEnabled',
        START_VIDEOCONFERENCE: 'startVideoconference',
        SET_MATCHING_KEY_TOKEN: 'setMatchingKeyToken',
        RESPONSE_URL_LOCATION: 'responseUrlLocation'
    };
