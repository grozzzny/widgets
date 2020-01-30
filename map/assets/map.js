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
                ymaps.modules.define("geoObject.Arrow", [
                    'Polyline',
                    'overlay.Arrow',
                    'util.extend'
                ], function (provide, Polyline, ArrowOverlay, extend) {
                    /**
                     * @param {Number[][] | Object | ILineStringGeometry} geometry Геометрия ломаной.
                     * @param {Object} properties Данные ломаной.
                     * @param {Object} options Опции ломаной.
                     * Поддерживается тот же набор опций, что и в классе ymaps.Polyline.
                     * @param {Number} [options.arrowAngle=20] Угол в градусах между основной линией и линиями стрелки.
                     * @param {Number} [options.arrowMinLength=3] Минимальная длина стрелки. Если длина стрелки меньше минимального значения, стрелка не рисуется.
                     * @param {Number} [options.arrowMaxLength=20] Максимальная длина стрелки.
                     */
                    var Arrow = function (geometry, properties, options) {
                        return new Polyline(geometry, properties, extend({}, options, {
                            lineStringOverlay: ArrowOverlay
                        }));
                    };
                    provide(Arrow);
                });

                /*
                 * Класс, реализующий интерфейс IOverlay.
                 * Получает на вход пиксельную геометрию линии и добавляет стрелку на конце линии.
                 */
                ymaps.modules.define("overlay.Arrow", [
                    'overlay.Polygon',
                    'util.extend',
                    'event.Manager',
                    'option.Manager',
                    'Event',
                    'geometry.pixel.Polygon'
                ], function (provide, PolygonOverlay, extend, EventManager, OptionManager, Event, PolygonGeometry) {
                    var domEvents = [
                            'click',
                            'contextmenu',
                            'dblclick',
                            'mousedown',
                            'mouseenter',
                            'mouseleave',
                            'mousemove',
                            'mouseup',
                            'multitouchend',
                            'multitouchmove',
                            'multitouchstart',
                            'wheel'
                        ],

                        /**
                         * @param {geometry.pixel.Polyline} pixelGeometry Пиксельная геометрия линии.
                         * @param {Object} data Данные оверлея.
                         * @param {Object} options Опции оверлея.
                         */
                        ArrowOverlay = function (pixelGeometry, data, options) {
                            // Поля .events и .options обязательные для IOverlay.
                            this.events = new EventManager();
                            this.options = new OptionManager(options);
                            this._map = null;
                            this._data = data;
                            this._geometry = pixelGeometry;
                            this._overlay = null;
                        };

                    ArrowOverlay.prototype = extend(ArrowOverlay.prototype, {
                        // Реализовываем все методы и события, которые требует интерфейс IOverlay.
                        getData: function () {
                            return this._data;
                        },

                        setData: function (data) {
                            if (this._data != data) {
                                var oldData = this._data;
                                this._data = data;
                                this.events.fire('datachange', {
                                    oldData: oldData,
                                    newData: data
                                });
                            }
                        },

                        getMap: function () {
                            return this._map;
                        },

                        setMap: function (map) {
                            if (this._map != map) {
                                var oldMap = this._map;
                                if (!map) {
                                    this._onRemoveFromMap();
                                }
                                this._map = map;
                                if (map) {
                                    this._onAddToMap();
                                }
                                this.events.fire('mapchange', {
                                    oldMap: oldMap,
                                    newMap: map
                                });
                            }
                        },

                        setGeometry: function (geometry) {
                            if (this._geometry != geometry) {
                                var oldGeometry = geometry;
                                this._geometry = geometry;
                                if (this.getMap() && geometry) {
                                    this._rebuild();
                                }
                                this.events.fire('geometrychange', {
                                    oldGeometry: oldGeometry,
                                    newGeometry: geometry
                                });
                            }
                        },

                        getGeometry: function () {
                            return this._geometry;
                        },

                        getShape: function () {
                            return null;
                        },

                        isEmpty: function () {
                            return false;
                        },

                        _rebuild: function () {
                            this._onRemoveFromMap();
                            this._onAddToMap();
                        },

                        _onAddToMap: function () {
                            // Военная хитрость - чтобы в прозрачной ломаной хорошо отрисовывались самопересечения,
                            // мы рисуем вместо линии многоугольник.
                            // Каждый контур многоугольника будет отвечать за часть линии.
                            this._overlay = new PolygonOverlay(new PolygonGeometry(this._createArrowContours()));
                            this._startOverlayListening();
                            // Эта строчка свяжет два менеджера опций.
                            // Опции, заданные в родительском менеджере,
                            // будут распространяться и на дочерний.
                            this._overlay.options.setParent(this.options);
                            this._overlay.setMap(this.getMap());
                        },

                        _onRemoveFromMap: function () {
                            this._overlay.setMap(null);
                            this._overlay.options.setParent(null);
                            this._stopOverlayListening();
                        },

                        _startOverlayListening: function () {
                            this._overlay.events.add(domEvents, this._onDomEvent, this);
                        },

                        _stopOverlayListening: function () {
                            this._overlay.events.remove(domEvents, this._onDomEvent, this);
                        },

                        _onDomEvent: function (e) {
                            // Мы слушаем события от дочернего служебного оверлея
                            // и прокидываем их на внешнем классе.
                            // Это делается для того, чтобы в событии было корректно определено
                            // поле target.
                            this.events.fire(e.get('type'), new Event({
                                target: this
                                // Свяжем исходное событие с текущим, чтобы все поля данных дочернего события
                                // были доступны в производном событии.
                            }, e));
                        },

                        _createArrowContours: function () {
                            var contours = [],
                                mainLineCoordinates = this.getGeometry().getCoordinates(),
                                arrowLength = calculateArrowLength(
                                    mainLineCoordinates,
                                    this.options.get('arrowMinLength', 3),
                                    this.options.get('arrowMaxLength', 20)
                                );
                            contours.push(getContourFromLineCoordinates(mainLineCoordinates));
                            // Будем рисовать стрелку только если длина линии не меньше длины стрелки.
                            if (arrowLength > 0) {
                                // Создадим еще 2 контура для стрелочек.
                                var lastTwoCoordinates = [
                                        mainLineCoordinates[mainLineCoordinates.length - 2],
                                        mainLineCoordinates[mainLineCoordinates.length - 1]
                                    ],
                                    // Для удобства расчетов повернем стрелку так, чтобы она была направлена вдоль оси y,
                                    // а потом развернем результаты обратно.
                                    rotationAngle = getRotationAngle(lastTwoCoordinates[0], lastTwoCoordinates[1]),
                                    rotatedCoordinates = rotate(lastTwoCoordinates, rotationAngle),

                                    arrowAngle = this.options.get('arrowAngle', 20) / 180 * Math.PI,
                                    arrowBeginningCoordinates = getArrowsBeginningCoordinates(
                                        rotatedCoordinates,
                                        arrowLength,
                                        arrowAngle
                                    ),
                                    firstArrowCoordinates = rotate([
                                        arrowBeginningCoordinates[0],
                                        rotatedCoordinates[1]
                                    ], -rotationAngle),
                                    secondArrowCoordinates = rotate([
                                        arrowBeginningCoordinates[1],
                                        rotatedCoordinates[1]
                                    ], -rotationAngle);

                                contours.push(getContourFromLineCoordinates(firstArrowCoordinates));
                                contours.push(getContourFromLineCoordinates(secondArrowCoordinates));
                            }
                            return contours;
                        }
                    });

                    function getArrowsBeginningCoordinates (coordinates, arrowLength, arrowAngle) {
                        var p1 = coordinates[0],
                            p2 = coordinates[1],
                            dx = arrowLength * Math.sin(arrowAngle),
                            y = p2[1] - arrowLength * Math.cos(arrowAngle);
                        return [[p1[0] - dx, y], [p1[0] + dx, y]];
                    }

                    function rotate (coordinates, angle) {
                        var rotatedCoordinates = [];
                        for (var i = 0, l = coordinates.length, x, y; i < l; i++) {
                            x = coordinates[i][0];
                            y = coordinates[i][1];
                            rotatedCoordinates.push([
                                x * Math.cos(angle) - y * Math.sin(angle),
                                x * Math.sin(angle) + y * Math.cos(angle)
                            ]);
                        }
                        return rotatedCoordinates;
                    }

                    function getRotationAngle (p1, p2) {
                        return Math.PI / 2 - Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
                    }

                    function getContourFromLineCoordinates (coords) {
                        var contour = coords.slice();
                        for (var i = coords.length - 2; i > -1; i--) {
                            contour.push(coords[i]);
                        }
                        return contour;
                    }

                    function calculateArrowLength (coords, minLength, maxLength) {
                        var linePixelLength = 0;
                        for (var i = 1, l = coords.length; i < l; i++) {
                            linePixelLength += getVectorLength(
                                coords[i][0] - coords[i - 1][0],
                                coords[i][1] - coords[i - 1][1]
                            );
                            if (linePixelLength / 3 > maxLength) {
                                return maxLength;
                            }
                        }
                        var finalArrowLength = linePixelLength / 3;
                        return finalArrowLength < minLength ? 0 : finalArrowLength;
                    }

                    function getVectorLength (x, y) {
                        return Math.sqrt(x * x + y * y);
                    }

                    provide(ArrowOverlay);
                });

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
