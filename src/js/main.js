/**
 * @class Main
 * @module EarthTrek
 * @author SATrek
 * @author Alejandro Sanchez <alejandro.sanchez.trek@gmail.com>
 * @description EarthTrek - NASA Space Apps 2017 - 23 APR 2017.
 */
define([
    'jquery',
    'earthtrek'
], function ($, EarthTrek) {

    var earthTrek = new EarthTrek({
        startTime: Date.UTC(1999, 1, 1),
        endTime: Date.now(),
        initialTime: Date.now(),
        mainContainer: 'main-container',
        frequency: 50,
        enableLighting: false,
        maxDistanceCamera: 10000000000 //10,000,000,000 meters
    });
    earthTrek.createViewer();
    earthTrek.init();
});