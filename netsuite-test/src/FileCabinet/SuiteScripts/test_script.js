// v4 - testing GitHub to NetSuite deployment
// v4
/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 * @description Test script - GitHub to NetSuite deployment
 */
define([], function() {
    function execute(context) {
        log.debug({
            title: 'GitHub Deploy Test',
            details: 'This script was deployed from GitHub successfully!'
        });
    }
    


    return { execute: execute };


});