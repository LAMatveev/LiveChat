goog.provide('CollaborationSystemWebChat1CE.API.MessageEvent');

CollaborationSystemWebChat1CE.API.MessageEvent = class
{
    constructor ()
    {
        /**
         * @type {string}
         * @expose
         */
        this.source = '';

        /**
         * @type {string}
         * @expose
         */
        this.message = '';

        /**
         * @type {Object}
         * @expose
         */
        this.data = {};
    }
}
