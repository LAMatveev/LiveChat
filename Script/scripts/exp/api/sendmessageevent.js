goog.provide('CollaborationSystemWebChat1CE.API.SendMessageEvent');
goog.provide('CollaborationSystemWebChat1CE.API.SendMessageData');
goog.require('CollaborationSystemWebChat1CE.API.MessageEvent');

CollaborationSystemWebChat1CE.API.SendMessageEvent = class extends CollaborationSystemWebChat1CE.API.MessageEvent
{
    constructor ()
    {
        super();

        /**
         * @type {!CollaborationSystemWebChat1CE.API.SendMessageData}
         * @expose
         */
        this.data = new CollaborationSystemWebChat1CE.API.SendMessageData();
    }
};
CollaborationSystemWebChat1CE.API.SendMessageData = class
{
    constructor ()
    {
        /**
         * @type {string}
         * @expose
         */
        this.text = '';

        /**
         * @type {TEXT_FORMAT}
         * @expose
         */
        this.textFormat = TEXT_FORMAT.PLAIN;
    }

    /**
     * @param {Object} obj
     * @return {boolean}
     */
    static is (obj)
    {
        const data = /** @type {!CollaborationSystemWebChat1CE.API.SendMessageData} */(obj);
        return !!data.text && !!data.textFormat && (data.textFormat === TEXT_FORMAT.HTML || data.textFormat === TEXT_FORMAT.PLAIN);
    }

    /**
     * @param {Object} obj
     * @return {!CollaborationSystemWebChat1CE.API.SendMessageData}
     */
    static as (obj)
    {
        console.assert(CollaborationSystemWebChat1CE.API.SendMessageData.is(obj));
        return /** @type {!CollaborationSystemWebChat1CE.API.SendMessageData} */(obj);
    }
};

/** @enum {string} */
const TEXT_FORMAT =
    {
        PLAIN: 'text/plain',
        HTML: 'text/html'
    };
