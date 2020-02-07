function Map(settings) {

    var t = this,
        $elem = $();

    var clusterer,
        geoObjects = [];

    t.settings = {
        center: [54.70739, 20.507307],
        coords: [],
        zoom: 14,
        enableClusterer: false,
        id: ''
    };

    t.map = null;

    t.init = function () {

        $elem.on('touchmove', function (event) {
            event.stopPropagation();
        });

        t.build();
    };

    t.build = function () {
        t.buildMap();
        t.view.run();
    };

    t.initClusterer = function () {
        if(!t.settings.enableClusterer) return;

        var first_point = t.settings.coords[0],
            clustererSettings = {
                clusterNumbers: [10],
                clusterIconContentLayout: null
            };


        if(typeof first_point.src === 'undefined' || first_point.src === ''){
            clustererSettings['preset'] = 'islands#invertedVioletClusterIcons';
        } else {
            clustererSettings['clusterIcons'] = [
                {
                    href: first_point.src,
                    size: [50, 50],
                    offset: [-25, -50]
                }
            ];
        }

        clusterer = new ymaps.Clusterer(clustererSettings);

        clusterer.add(geoObjects);
        t.map.geoObjects.add(clusterer);
    };

    t.buildMap = function () {
        t.map = new ymaps.Map(t.settings.id, {
            center: t.settings.center,
            zoom: t.settings.zoom,
            controls: ['geolocationControl']
        }, {
            suppressMapOpenBlock: true,
            searchControlProvider: 'yandex#search',
            //Автоматическое слежение за размером контейнера карты
            autoFitToViewport: 'always' //всегда
        });
    };

    t.view = {
        placemark: {
            activeOn: function (ob) {
                if(ob.options.get('iconLayout') == 'default#image'){
                    //console.log('ON',ob);
                    ob.options.set('iconLayout', 'default#imageWithContent');
                }
            },

            activeOff: function (ob) {
                if(ob.options.get('iconLayout') == 'default#imageWithContent'){
                    //console.log('OFF',ob);
                    ob.options.set('iconLayout', 'default#image');
                }
            },

            add: function (ob) {
                var sizeIco = (ob.sizeIco) ? 50 * ob.sizeIco : 50;

                var optionPlacemarkIco = {
                    iconLayout: 'default#image',
                    iconImageHref: ob.src,
                    iconImageSize: [sizeIco, sizeIco],
                    iconImageOffset: [-sizeIco/2, -sizeIco],
                    hash: ob.hash
                };

                var optionPlacemarkIcoDefault = {
                    //blue | darkGreen | red | violet | darkOrange | black | night | brown
                    //yellow | darkBlue | green | pink | orange | gray | lightBlue | olive
                    preset: 'islands#' + ob.icoColor + 'CircleDotIconWithCaption',
                    hash: ob.hash
                };

                //Если нет иконки, то включить дефолтную иконку
                var option = ob.src == null ? optionPlacemarkIcoDefault : optionPlacemarkIco ;

                var placemark = new ymaps.Placemark(ob.coords, {
                    hintContent: ob.title,
                    balloonContentBody: ob.content,
                    iconCaption: ob.title,
                    clusterCaption: ob.title
                }, option);

                if(t.settings.enableClusterer){
                    geoObjects.push(placemark);
                } else {
                    t.map.geoObjects.add(placemark);
                }
            }
        },

        polygon: {
            add: function (ob) {

                var polygon = new ymaps.Polygon([ob.coords], {
                    hintContent: ob.title,
                    balloonContentBody: ob.content
                }, {
                    openEmptyBalloon: true,
                    fillColor: ob.fillColor,
                    strokeColor: ob.strokeColor,
                    fillOpacity: ob.fillOpacity,
                    strokeWidth: ob.strokeWidth,
                    hash: ob.hash,
                    title: ob.title,
                    openBalloonOnClick: false
                });

                polygon.events.add('click', function (e) {
                    t.view.openBaloon(e, polygon, ob);
                });

                t.map.geoObjects.add(polygon);
            }
        },

        polyline: {
            add: function (ob) {

                // Создаем ломаную с помощью вспомогательного класса Polyline.
                var polyline = new ymaps.Polyline(ob.coords, {
                    hintContent: ob.title,
                    balloonContentBody: ob.content
                }, {
                    strokeColor: ob.strokeColor,
                    strokeWidth: ob.strokeWidth,
                    strokeOpacity: typeof ob.strokeOpacity === 'undefined' ? 1 : ob.strokeOpacity,
                    hash: ob.hash,
                    title: ob.title,
                    openBalloonOnClick: false
                });

                polyline.events.add('click', function (e) {
                    t.view.openBaloon(e, polyline, ob);
                });

                t.map.geoObjects.add(polyline);
            }
        },

        arrow: {
            add: function (ob) {
                ymaps.modules.require(['geoObject.Arrow'], function (Arrow) {
                    // Создаем ломаную с помощью вспомогательного класса Polyline.
                    var arrow = new Arrow(ob.coords, {
                        hintContent: ob.title,
                        balloonContentBody: ob.content
                    }, {
                        strokeColor: ob.strokeColor,
                        strokeWidth: ob.strokeWidth,
                        strokeOpacity: typeof ob.strokeOpacity === 'undefined' ? 1 : ob.strokeOpacity,
                        hash: ob.hash,
                        title: ob.title,
                        openBalloonOnClick: false
                    });

                    arrow.events.add('click', function (e) {
                        t.view.openBaloon(e, arrow, ob);
                    });

                    t.map.geoObjects.add(arrow);
                    t.setCenter();
                });
            }
        },

        route: {
            add: function (ob) {
                var sizeIcoStart = (ob.sizeIcoStart) ? 50 * ob.sizeIcoStart : 50;
                var sizeIcoFinish = (ob.sizeIcoFinish) ? 50 * ob.sizeIcoFinish : 50;

                var multiRoute = new ymaps.multiRouter.MultiRoute({
                    // Описание опорных точек мультимаршрута.
                    referencePoints: ob.coords,
                    // Параметры маршрутизации.
                    params: {
                        //Тип маршрута
                        routingMode: ob.mode,
                        // Ограничение на максимальное количество маршрутов, возвращаемое маршрутизатором.
                        results: 0
                    }
                },{
                    wayPointStartIconLayout: "default#image",
                    wayPointStartIconImageHref: ob.srcStart,
                    wayPointStartIconImageSize: [sizeIcoStart, sizeIcoStart],
                    wayPointStartIconImageOffset: [-sizeIcoStart/2, -sizeIcoStart],

                    wayPointFinishIconLayout: "default#image",
                    wayPointFinishIconImageHref: ob.srcFinish,
                    wayPointFinishIconImageSize: [sizeIcoFinish, sizeIcoFinish],
                    wayPointFinishIconImageOffset: [-sizeIcoFinish/2, -sizeIcoFinish],

                    // Внешний вид линии маршрута.
                    routeStrokeWidth: ob.strokeWidth,
                    routeStrokeColor: ob.strokeColor,
                    routeActiveStrokeWidth: ob.strokeWidth,
                    routeActiveStrokeColor: ob.strokeColor,

                    // Внешний вид линии пешеходного маршрута.
                    routeActivePedestrianSegmentStrokeStyle: "solid",
                    routeActivePedestrianSegmentStrokeColor: ob.strokeColor,
                    hash: ob.hash,
                    title: ob.title
                });

                /**
                 * Ждем, пока будут загружены данные мультимаршрута и созданы отображения путевых точек.
                 * @see https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/reference/multiRouter.MultiRouteModel-docpage/#event-requestsuccess
                 */
                multiRoute.model.events.once("requestsuccess", function () {
                    var pointStart = multiRoute.getWayPoints().get(0);
                    // Создаем балун у метки второй точки.
                    ymaps.geoObject.addon.balloon.get(pointStart);
                    pointStart.options.set({
                        balloonContentLayout: ymaps.templateLayoutFactory.createClass(ob.contentStart),
                        openBalloonOnClick: false
                    });
                    pointStart.events.add('click', function (e) {
                        t.view.openBaloon(e, pointStart, ob);
                    });

                    var pointFinish = multiRoute.getWayPoints().get(multiRoute.getWayPoints().getLength()-1);
                    // Создаем балун у метки второй точки.
                    ymaps.geoObject.addon.balloon.get(pointFinish);
                    pointFinish.options.set({
                        balloonContentLayout: ymaps.templateLayoutFactory.createClass(ob.contentFinish),
                        openBalloonOnClick: false
                    });

                    pointFinish.events.add('click', function (e) {
                        t.view.openBaloon(e, pointFinish, ob);
                    });
                });


                t.map.geoObjects.add(multiRoute);
            }
        },

        openBaloon: function (e, point, ob) {
            t.map.geoObjects.each(function (el, i) {
                if (el.options._name != 'multiRoute') {
                    el.balloon.close();
                    // t.view.placemark.activeOff(el);
                }
            });
            // $(window).off('hashchange', t.view.showInit);
            // location.hash = '#' + ob.hash;
            // setTimeout(function () {
            //     $(window).on('hashchange', t.view.showInit);
            // }, 300);
            // t.view.placemark.activeOn(point);
            point.balloon.open(null,{},{/*panelMaxMapArea:'Infinity'*/});
            // $('.js-slideout-close').each(function () {
            //     $(this).removeClass('active');
            // });
            // $('[href="#'+ob.hash+'"]').parent().addClass('active');
        },

        /**
         * Нанесение объектов геолокаций на карту
         */
        addGeoObjects: function () {
            $.each(t.settings.coords, function () {
                t.view[this.type].add(this);
            });

            t.initClusterer();

            t.setCenter();
        },

        /**
         * Запуск построения карты с геообъектами
         * @returns {boolean}
         */
        run: function () {
            //Нанесение объектов геолокаций на карту
            t.view.addGeoObjects();

            t.view.hashDetected();
        },

        hashDetected: function () {
            $(window).on('hashchange', function (e) {
                t.view.show();
                e.preventDefault();
            });
            if(window.location.hash != '') t.view.show();
        },

        show: function () {
            t.map.geoObjects.each(function (el, i) {
                if (el.options._name != 'multiRoute') el.balloon.close();

                if('#' + el.options.get('hash') == window.location.hash){
                    if (el.options._name != 'multiRoute'){
                        t.map.setBounds(el.geometry.getBounds(), {checkZoomRange: true});
                        //el.balloon.open();
                    } else {
                        if(el.getBounds() == null){
                            el.events.once("boundschange", function () {
                                t.map.setBounds(el.getBounds(), {checkZoomRange: true});
                            });
                        } else{
                            t.map.setBounds(el.getBounds(), {checkZoomRange: true});
                        }
                    }
                    return true;
                }
            });
        }
    };

    /**
     * Отцентровка карты
     */
    t.setCenter = function (zoom) {

        zoom = zoom ? zoom : t.settings.zoom;

        //Получим область координат нанесенных точек и сцентрируем карту
        var bounds = t.settings.enableClusterer ? clusterer.getBounds() : t.map.geoObjects.getBounds();

        if(bounds == null) return;

        t.map.setBounds(bounds, {
            checkZoomRange: true
        }).then(function(){
            if(t.map.getZoom() > zoom) t.map.setZoom(zoom);
        });
    };

    this.destroyMap = function () {
        t.map.destroy();
    };

    t.constructor = function () {
        t.settings = $.extend(t.settings, settings);
        $elem = $('#'+t.settings.id);

        ymaps.ready(t.init);
    };
    t.prototype = t.constructor();
}
