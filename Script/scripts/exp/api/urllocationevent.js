goog.provide('CollaborationSystemWebChat1CE.API.UrlLocationEvent');
goog.provide('CollaborationSystemWebChat1CE.API.UrlLocationData');
goog.require('CollaborationSystemWebChat1CE.API.MessageEvent');

CollaborationSystemWebChat1CE.API.UrlLocationEvent = class extends CollaborationSystemWebChat1CE.API.MessageEvent
{
    constructor ()
    {
        super();

        /**
         * @type {!CollaborationSystemWebChat1CE.API.UrlLocationData}
         * @expose
         */
        this.data = new CollaborationSystemWebChat1CE.API.UrlLocationData();
    }
};

CollaborationSystemWebChat1CE.API.UrlLocationData = class
{
    constructor ()
    {
        /**
         * @type {string}
         * @expose
         */
        this.url = '';

        /**
         * @type {string}
         * @expose
         */
        this.title = '';
    }

    /**
     * @param {Object} obj
     * @return {boolean}
     */
    static is (obj)
    {
        const data = /** @type {!CollaborationSystemWebChat1CE.API.UrlLocationData} */(obj);
        return !!data.url && !!data.title
    }

    /**
     * @param {Object} obj
     * @return {!CollaborationSystemWebChat1CE.API.UrlLocationData}
     */
    static as (obj)
    {
        console.assert(CollaborationSystemWebChat1CE.API.UrlLocationData.is(obj));
        return /** @type {!CollaborationSystemWebChat1CE.API.UrlLocationData} */(obj);
    }
};
