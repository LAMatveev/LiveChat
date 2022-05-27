
goog.provide('CollaborationSystemWebChat1CE.exporter');
goog.provide('CollaborationSystemWebChat1CE.exporterClass');

CollaborationSystemWebChat1CE.exporterClass = class
{
    /**
     * @param {!Object} object
     * @param {*} symbol
     * @param {string} publicName
     * @return {!CollaborationSystemWebChat1CE.exporterClass}
     */
    exportProperty (object, symbol, publicName)
    {
        goog.exportProperty(object, publicName, symbol);
        return this;
    }

    /**
     * @param {!Object} object
     * @param {string} publicPath
     * @return {!CollaborationSystemWebChat1CE.exporterClass}
     */
    exportSymbol (object, publicPath)
    {
        goog.exportSymbol(publicPath, object);
        return this;
    }
}
goog.addSingletonGetter(CollaborationSystemWebChat1CE.exporterClass);

/** @type {!CollaborationSystemWebChat1CE.exporterClass} */
CollaborationSystemWebChat1CE.exporter = CollaborationSystemWebChat1CE.exporterClass.getInstance();
