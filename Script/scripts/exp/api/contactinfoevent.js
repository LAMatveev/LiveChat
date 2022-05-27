goog.provide('CollaborationSystemWebChat1CE.API.ContactInfoEvent');
goog.provide('CollaborationSystemWebChat1CE.API.ContactInfoData');
goog.require('CollaborationSystemWebChat1CE.API.MessageEvent');

CollaborationSystemWebChat1CE.API.ContactInfoEvent = class extends CollaborationSystemWebChat1CE.API.MessageEvent
{
    constructor ()
    {
        super();

        /**
         * @type {!CollaborationSystemWebChat1CE.API.ContactInfoData}
         * @expose
         */
        this.data = new CollaborationSystemWebChat1CE.API.ContactInfoData();
    }
};

CollaborationSystemWebChat1CE.API.ContactInfoData = class
{
    constructor ()
    {
        /**
         * @type {string}
         * @expose
         */
        this.phone = '';

        /**
         * @type {string}
         * @expose
         */
        this.email = '';

        /**
         * @type {string}
         * @expose
         */
        this.name = '';

        /**
         * @type {string}
         * @expose
         */
        this.fullName = '';
    }

    /**
     * @param {Object} obj
     * @return {boolean}
     */
    static is (obj)
    {
        const data = /** @type {!CollaborationSystemWebChat1CE.API.ContactInfoData} */(obj);
        return !!data.phone || !!data.email || !!data.name || !!data.fullName
    }

    /**
     * @param {Object} obj
     * @return {!CollaborationSystemWebChat1CE.API.ContactInfoData}
     */
    static as (obj)
    {
        console.assert(CollaborationSystemWebChat1CE.API.ContactInfoData.is(obj));
        return /** @type {!CollaborationSystemWebChat1CE.API.ContactInfoData} */(obj);
    }
};
