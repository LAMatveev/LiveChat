goog.provide('CollaborationSystemWebChat1CE.API.MatchingKeyTokenEvent');
goog.provide('CollaborationSystemWebChat1CE.API.MatchingKeyTokenData');
goog.require('CollaborationSystemWebChat1CE.API.MessageEvent');

CollaborationSystemWebChat1CE.API.MatchingKeyTokenEvent = class extends CollaborationSystemWebChat1CE.API.MessageEvent
{
    constructor ()
    {
        super();

        /**
         * @type {!CollaborationSystemWebChat1CE.API.MatchingKeyTokenData}
         * @expose
         */
        this.data = new CollaborationSystemWebChat1CE.API.MatchingKeyTokenData();
    }
};

CollaborationSystemWebChat1CE.API.MatchingKeyTokenData = class
{
    constructor ()
    {
        /**
         * @type {string}
         * @expose
         */
        this.matchingKeyToken = '';
    }

    /**
     * @param {Object} obj
     * @return {boolean}
     */
    static is (obj)
    {
        const data = /** @type {!CollaborationSystemWebChat1CE.API.MatchingKeyTokenData} */(obj);
        return !!data.matchingKeyToken
    }

    /**
     * @param {Object} obj
     * @return {!CollaborationSystemWebChat1CE.API.MatchingKeyTokenData}
     */
    static as (obj)
    {
        console.assert(CollaborationSystemWebChat1CE.API.MatchingKeyTokenData.is(obj));
        return /** @type {!CollaborationSystemWebChat1CE.API.MatchingKeyTokenData} */(obj);
    }
};
