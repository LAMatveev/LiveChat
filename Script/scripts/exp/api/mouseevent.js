goog.provide('CollaborationSystemWebChat1CE.API.MouseEvent');goog.provide('CollaborationSystemWebChat1CE.API.MouseData');
goog.require('CollaborationSystemWebChat1CE.API.MessageEvent');

CollaborationSystemWebChat1CE.API.MouseEvent = class extends CollaborationSystemWebChat1CE.API.MessageEvent
{
    constructor ()
    {
        super();

        /**
         * @type {!CollaborationSystemWebChat1CE.API.MouseData}
         * @expose
         */
        this.data = new CollaborationSystemWebChat1CE.API.MouseData();
    }
};

CollaborationSystemWebChat1CE.API.MouseData = class
{
    constructor ()
    {
        /**
         * @type {number}
         * @expose
         */
        this.offsetX = 0;

        /**
         * @type {number}
         * @expose
         */
        this.offsetY = 0;
    }
};
