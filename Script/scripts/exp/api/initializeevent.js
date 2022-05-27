goog.provide('CollaborationSystemWebChat1CE.API.InitializeEvent');
goog.provide('CollaborationSystemWebChat1CE.API.InitializeData');
goog.require('CollaborationSystemWebChat1CE.API.MessageEvent');

CollaborationSystemWebChat1CE.API.InitializeEvent = class extends CollaborationSystemWebChat1CE.API.MessageEvent
{
    constructor ()
    {
        super();

        /**
         * @type {!CollaborationSystemWebChat1CE.API.InitializeData}
         * @expose
         */
        this.data = new CollaborationSystemWebChat1CE.API.InitializeData();
    }
};

CollaborationSystemWebChat1CE.API.InitializeData = class
{
    constructor ()
    {
        /**
         * @type {number}
         * @expose
         */
        this.width = 0;

        /**
         * @type {number}
         * @expose
         */
        this.height = 0;

        /**
         * @type {number}
         * @expose
         */
        this.offsetLeft = -1;

        /**
         * @type {number}
         * @expose
         */
        this.headerWidth = 0;

        /**
         * @type {number}
         * @expose
         */
        this.headerHeight = 0;

        /**
         * @type {string}
         * @expose
         */
        this.beforeUnloadMessage = '';
    }

    /**
     * @param {Object} obj
     * @return {boolean}
     */
    static is (obj)
    {
        const data = /** @type {!CollaborationSystemWebChat1CE.API.InitializeData} */(obj);
        return !!data.width && !!data.height && !!data.headerWidth && !!data.headerHeight && !!data.beforeUnloadMessage;
    }

    /**
     * @param {Object} obj
     * @return {!CollaborationSystemWebChat1CE.API.InitializeData}
     */
    static as (obj)
    {
        console.assert(CollaborationSystemWebChat1CE.API.InitializeData.is(obj));
        return /** @type {!CollaborationSystemWebChat1CE.API.InitializeData} */(obj);
    }
};
