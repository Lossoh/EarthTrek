

    var backgroundLayerProvider;
    var referenceLayerProvider;
    $('.datepicker').datepicker();
    //$('#satellite-toolbar').draggable();
    // Initially start at June 15, 2014
    var initialTime = Cesium.JulianDate.fromDate(
        new Date(Date.UTC(2017, 04, 27)));

    var startTime = Cesium.JulianDate.fromDate(
        new Date(Date.UTC(2017, 04, 27)));

    var endTime = Cesium.JulianDate.fromDate(
        new Date(Date.UTC(2017, 05, 18)));

    var clock = new Cesium.Clock({
        startTime: startTime,
        endTime: endTime,
        currentTime: initialTime,
        multiplier: 0,
        clockStep : Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER
    });
    var isoDate = function(isoDateTime) {
        return isoDateTime.split("T")[0];
    };
    var viewer = new Cesium.Viewer("map", {
        clock: clock,
        baseLayerPicker: false, // Only showing one layer in this demo,
        requestWaterMask: true
    });

    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    /**
     * DATA SOURCE
     */
   // var getDataSource = function () {
        var satellitesData;
        var dataSource = new Cesium.CzmlDataSource();
        dataSource.load('data/satellites-2017-04-27.czml').then(function(){
            $.getJSON( "data/instruments.json", function( data ) {
                satellitesData = data;
            }).done(function(data) {
                $.each(data.satellites, function( key, satellite  ) {
                    var entity = dataSource.entities.getById(satellite.id);
                    if (entity != undefined) {
                        entity.properties = satellite;
                    }
                });
            });
        });
   // }

   // var dataSource = getDataSource();
    viewer.dataSources.add(dataSource);

    var previousTime = null;

    handler.setInputAction(function (movement) {
        var pick = viewer.scene.pick(movement.position);
        var satelliteToolbar = $('#satellite-toolbar');
        $("#satellite-instruments").empty();

        if (Cesium.defined(pick) && Cesium.defined(pick.node) && Cesium.defined(pick.mesh)) {
            var entity = dataSource.entities.getById(pick.id._id);
            if (entity != undefined) {
                showSatelliteToolbar(entity);
            }
        } else {
            viewer.trackedEntity = undefined;
            satelliteToolbar.hide();
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    var toogle = function(div, callbackOn, callbackOff) {
        if (div.is(":visible")) {
            div.hide();
            callbackOff();
        } else  {
            div.show();
            callbackOn();
        }
    }

    viewer.timeline.zoomTo(startTime, endTime);
    viewer.scene.globe.baseColor = Cesium.Color.BLACK;

    var setSatellitesProperties = function(dataSource) {
        $.getJSON( "data/instruments.json", function( data ) {
            satellitesData = data;
        }).done(function(data) {
            $.each(data.satellites, function( key, satellite  ) {
                var entity = dataSource.entities.getById(satellite.id);
                if (entity != undefined) {
                    entity.properties = satellite;
                }
            });
        });
    }

    var onClockUpdate = _.throttle(function() {
        var isoDateTime = clock.currentTime.toString();
        var time = isoDate(isoDateTime);
        if (time !== previousTime) {
            viewer.dataSources.removeAll();
            var dataSource = new Cesium.CzmlDataSource();
            dataSource.load('data/satellites-' + time +'.czml').then(function(){
                setSatellitesProperties(dataSource);
            });
            viewer.dataSources.add(dataSource);

            previousTime = time;
            for (var i = 0; i <= viewer.scene.imageryLayers.length - 1; i++) {
                var layer = viewer.scene.imageryLayers.get(i);
                console.log(backgroundLayerProvider)
                console.log(layer)
                if (layer.imageryProvider != backgroundLayerProvider) {
                    console.log('Borra')
                    viewer.scene.imageryLayers.remove(layer);
                }
            }
            if (backgroundLayerProvider == undefined){
                backgroundLayerProvider = getProvider(
                    "VIIRS_SNPP_CorrectedReflectance_TrueColor",
                    '2016-11-19',
                    "image/jpeg",
                    "EPSG4326_250m"
                );
                viewer.scene.imageryLayers.addImageryProvider(backgroundLayerProvider);
            }

             referenceLayerProvider = getProvider("Reference_Labels", '2016-11-19', "image/png", "EPSG4326_250m");
             viewer.scene.imageryLayers.addImageryProvider(referenceLayerProvider);
        }
    });

    viewer.clock.onTick.addEventListener(onClockUpdate);

    var getProvider = function(layer, time, format, tileMatrixSetID) {
        var isoTime = "TIME=" + isoDate(time);
        var provider = new Cesium.WebMapTileServiceImageryProvider({
            url: "//gibs-c.earthdata.nasa.gov/wmts/epsg4326/best/wmts.cgi?" + isoTime,
            layer: layer,
            style: "",
            format: format,
            tileMatrixSetID: tileMatrixSetID,
            maximumLevel: 12,
            tileWidth: 256,
            tileHeight: 256,
            tilingScheme: gibs.GeographicTilingScheme()
        });
        return provider;
    }

    /**
     * SLIDER
     */

// Sync the position of the slider with the split position
    var slider = document.getElementById('slider');
    viewer.scene.imagerySplitPosition = (slider.offsetLeft) / slider.parentElement.offsetWidth;

    var dragStartX = 0;
    document.getElementById('slider').addEventListener('mousedown', mouseDown, false);
    window.addEventListener('mouseup', mouseUp, false);

    function mouseUp() {
        window.removeEventListener('mousemove', sliderMove, true);
    }

    function mouseDown(e) {
        var slider = document.getElementById('slider');
        dragStartX = e.clientX - slider.offsetLeft;
        window.addEventListener('mousemove', sliderMove, true);
    }

    function sliderMove(e) {
        var slider = document.getElementById('slider');
        var splitPosition = (e.clientX - dragStartX) / slider.parentElement.offsetWidth;
        slider.style.left = 100.0 * splitPosition + "%";
        viewer.scene.imagerySplitPosition = splitPosition;
    }