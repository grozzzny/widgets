function MapConstructor(settings) {

    var TYPE_PLACEMARK = 'placemark',
        TYPE_POLYGON = 'polygon',
        TYPE_ARROW = 'arrow',
        TYPE_POLYLINE = 'polyline',
        TYPE_ROUTE = 'route';

    var t = this,
        $elem = $(),
        $customSearch = $(),
        type = TYPE_PLACEMARK;

    var EVENT_GET_COORDS = 'get_coords';

    t.settings = {
        center: [54.70739, 20.507307],
        zoom: 14,
        id: ''
    };

    t.map = null;

    t.init = function () {

        $('data-coords').on('touchmove', function (event) {
            event.stopPropagation();
        });

        $elem.on(EVENT_GET_COORDS, function (event, data) {
            t.setValue(data);
        });

        t.build();
    };

    t.build = function () {
        t.buildMap();
        t[type].run();
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

    t.input = function () {
        var selector = $elem.attr('data-coords');
        return $('[name="'+selector+'"]');
    };

    t.setValue = function (value) {
        var json = JSON.stringify(value);
        t.input().val(json);
    };

    t.getValue = function () {
        var value = t.input().val();

        try {
            return JSON.parse(value);
        } catch (e) {
            return null;
        }
    };

    t.customSearchControl = function (geoObject, callback) {
        if($customSearch.length === 0) return false;

        $customSearch.on('change blur', function (event) {
            var $this = $(event.target);

            ymaps.geocode($this.val(), {
                results: 1
            }).then(function (res) {
                callback(res, geoObject);
            });

        });
    };

    t.placemark = {
        customSearch: function (res, placemark) {
            var firstGeoObject = res.geoObjects.get(0),
                coords = firstGeoObject.geometry.getCoordinates(),
                bounds = firstGeoObject.properties.get('boundedBy');

            placemark.geometry.setCoordinates(coords);
            t.map.setBounds(bounds, {checkZoomRange: true});
            $elem.trigger(EVENT_GET_COORDS, [coords]);
        },
        getStartPosition: function () {
            return t.getValue() != null ? t.getValue() : t.settings.center;
        },
        run: function () {
            var placemark = new ymaps.Placemark(t.placemark.getStartPosition(), {}, {
                preset: 'islands#blueGovernmentIcon',
                draggable: true
            });

            //Установим событие при окончании перетаскивании метки
            placemark.events.add("dragend", function (e) {
                var coords = this.geometry.getCoordinates();
                $elem.trigger(EVENT_GET_COORDS, [coords]);
            }, placemark);

            //Добавим метку в коллекцию геообъектов
            t.map.geoObjects.add(placemark);
            t.setCenter();

            var searchControl = new ymaps.control.SearchControl({
                options: {
                    noPlacemark: true,
                    provider: 'yandex#map'
                }
            });
            t.map.controls.add(searchControl);

            searchControl.events.add("resultselect", function (e) {
                var coords = searchControl.getResultsArray()[e.get('index')].geometry.getCoordinates();
                placemark.geometry.setCoordinates(coords);

                $elem.trigger(EVENT_GET_COORDS, [coords]);
            });

            t.customSearchControl(placemark, t.placemark.customSearch);
        }
    };

    t.polyline = {
        getStartPosition: function () {
            return t.getValue() != null ? t.getValue() : [
                t.settings.center,
                [t.settings.center[0]+0.01, t.settings.center[1]+0.01]
            ];
        },
        run: function () {
            var polyline = new ymaps.Polyline(t.polyline.getStartPosition(), {}, {
                draggable: true,
                // Цвет с прозрачностью
                strokeColor: "#00000088",
                // Ширина линии
                strokeWidth: 6
            });

            polyline.events.add('geometrychange', function (e) {
                var coords = polyline.geometry.getCoordinates();
                $elem.trigger(EVENT_GET_COORDS, [coords]);
            });

            polyline.events.add('dblclick', function (e) {
                e.stopPropagation();
                if (polyline.editor.state.get('editing')){
                    polyline.editor.stopEditing();
                }else{
                    polyline.editor.startEditing();
                }
            });

            // Добавляем линию на карту.
            t.map.geoObjects.add(polyline);
            t.setCenter();

            var searchControl = new ymaps.control.SearchControl({
                options: {
                    noPlacemark: true,
                    provider: 'yandex#map'
                }
            });
            t.map.controls.add(searchControl);

            searchControl.events.add("resultselect", function (e) {
                var coords = searchControl.getResultsArray()[e.get('index')].geometry.getCoordinates();
                var old_coords = polyline.geometry.getCoordinates();

                var bias_x = coords[0]-old_coords[0][0];
                var bias_y = coords[1]-old_coords[0][1];

                var new_coords = [];
                $.each(old_coords, function () {
                    var x = this[0] + bias_x;
                    var y = this[1] + bias_y;
                    new_coords.push([x, y]);
                });

                polyline.geometry.setCoordinates(new_coords);
                $elem.trigger(EVENT_GET_COORDS, [new_coords]);
            });
        }
    };

    t.arrow = {
        getStartPosition: function () {
            return t.getValue() != null ? t.getValue() : [
                t.settings.center,
                [t.settings.center[0]+0.01, t.settings.center[1]+0.01]
            ];
        },
        run: function () {

            /*
 * Класс, позволяющий создавать стрелку на карте.
 * Является хелпером к созданию полилинии, у которой задан специальный оверлей.
 * При использовании модулей в реальном проекте рекомендуем размещать их в отдельных файлах.
 */
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
                var polyline = new Arrow(t.polyline.getStartPosition(), {}, {
                    draggable: true,
                    // Цвет с прозрачностью
                    strokeColor: "#00000088",
                    // Ширина линии
                    strokeWidth: 6
                });

                polyline.events.add('geometrychange', function (e) {
                    var coords = polyline.geometry.getCoordinates();
                    $elem.trigger(EVENT_GET_COORDS, [coords]);
                });

                polyline.events.add('dblclick', function (e) {
                    e.stopPropagation();
                    if (polyline.editor.state.get('editing')){
                        polyline.editor.stopEditing();
                    }else{
                        polyline.editor.startEditing();
                    }
                });

                // Добавляем линию на карту.
                t.map.geoObjects.add(polyline);
                t.setCenter();

                var searchControl = new ymaps.control.SearchControl({
                    options: {
                        noPlacemark: true,
                        provider: 'yandex#map'
                    }
                });
                t.map.controls.add(searchControl);

                searchControl.events.add("resultselect", function (e) {
                    var coords = searchControl.getResultsArray()[e.get('index')].geometry.getCoordinates();
                    var old_coords = polyline.geometry.getCoordinates();

                    var bias_x = coords[0]-old_coords[0][0];
                    var bias_y = coords[1]-old_coords[0][1];

                    var new_coords = [];
                    $.each(old_coords, function () {
                        var x = this[0] + bias_x;
                        var y = this[1] + bias_y;
                        new_coords.push([x, y]);
                    });

                    polyline.geometry.setCoordinates(new_coords);
                    $elem.trigger(EVENT_GET_COORDS, [new_coords]);
                });


                var arrow = new Arrow([[57.733835, 38.788227], [55.833835, 35.688227]], null, {
                    geodesic: true,
                    strokeWidth: 5,
                    opacity: 0.5,
                    strokeStyle: 'shortdash'
                });
                myMap.geoObjects.add(arrow);
            });

        }
    };

    t.polygon = {
        getStartPosition: function () {
            return t.getValue() != null ? [t.getValue()] : [
                [
                    [t.settings.center[0]+0.01, t.settings.center[1]+0.01],
                    [t.settings.center[0]-0.01, t.settings.center[1]+0.01],
                    [t.settings.center[0]-0.01, t.settings.center[1]-0.01],
                    [t.settings.center[0]+0.01, t.settings.center[1]-0.01],
                ]
            ];
        },
        run: function () {
            // Создаем многоугольник без вершин.
            var polygon = new ymaps.Polygon(t.polygon.getStartPosition(), {}, {
                draggable: true,
                editorDrawingCursor: "crosshair",
                fillColor: '#ffffff',
                fillOpacity: 0.5,
                strokeColor: '#00000088',
                strokeWidth: 6
            });
            // Добавляем многоугольник на карту.
            t.map.geoObjects.add(polygon);
            t.setCenter();

            polygon.events.add('geometrychange', function (e) {
                var coords = polygon.geometry.getCoordinates()[0];
                $elem.trigger(EVENT_GET_COORDS, [coords]);
            });

            polygon.events.add('dblclick', function (e) {
                e.stopPropagation();
                if (polygon.editor.state.get('editing')){
                    polygon.editor.stopEditing();
                }else{
                    polygon.editor.startEditing();
                }
            });

            var searchControl = new ymaps.control.SearchControl({
                options: {
                    noPlacemark: true,
                    provider: 'yandex#map'
                }
            });
            t.map.controls.add(searchControl);

            searchControl.events.add("resultselect", function (e) {
                var coords = searchControl.getResultsArray()[e.get('index')].geometry.getCoordinates();
                var old_coords = polygon.geometry.getCoordinates()[0];

                var bias_x = coords[0]-old_coords[0][0];
                var bias_y = coords[1]-old_coords[0][1];

                var new_coords = [];
                $.each(old_coords, function () {
                    var x = this[0] + bias_x;
                    var y = this[1] + bias_y;
                    new_coords.push([x, y]);
                });

                polygon.geometry.setCoordinates([new_coords]);
                $elem.trigger(EVENT_GET_COORDS, [new_coords]);
            });
        }
    };

    t.route = {
        getStartPosition: function () {
            return t.getValue() != null ? t.getValue() : [t.settings.center];
        },
        run: function () {
            var multiRoute = new ymaps.multiRouter.MultiRoute({
                // Описание опорных точек мультимаршрута.
                referencePoints: t.route.getStartPosition(),
                // Параметры маршрутизации.
                params: {
                    //Тип маршрута
                    routingMode: 'auto',
                    // Ограничение на максимальное количество маршрутов, возвращаемое маршрутизатором.
                    results: 2
                }
            },{

                // Внешний вид линии маршрута.
                routeStrokeWidth: 6,
                routeStrokeColor: '#00000088',
                routeActiveStrokeWidth: 6,
                routeActiveStrokeColor: '#00000088',

                // Внешний вид линии пешеходного маршрута.
                routeActivePedestrianSegmentStrokeStyle: "solid",
                routeActivePedestrianSegmentStrokeColor: '#00000088',
            });

            t.map.geoObjects.add(multiRoute);


            // Создаем кнопки.
            var routingModeButton = new ymaps.control.ListBox({
                data: {content: "Type route"},
                items: [
                    new ymaps.control.ListBoxItem('Walking route'),
                    new ymaps.control.ListBoxItem('Car route'),
                    new ymaps.control.ListBoxItem('Transport route')
                ]
            });
            routingModeButton.get(1).select();

            routingModeButton.get(0).events.add('click', function () {
                routingModeButton.get(1).deselect();
                routingModeButton.get(2).deselect();
                multiRoute.model.setParams({routingMode: 'pedestrian'}, true);
            });
            routingModeButton.get(1).events.add('click', function () {
                routingModeButton.get(0).deselect();
                routingModeButton.get(2).deselect();
                multiRoute.model.setParams({routingMode: 'auto'}, true);
            });
            routingModeButton.get(2).events.add('click', function () {
                routingModeButton.get(0).deselect();
                routingModeButton.get(1).deselect();
                multiRoute.model.setParams({routingMode: 'masstransit'}, true);
            });

            t.map.controls.add(routingModeButton);

            multiRoute.model.events.once("requestsuccess", function () {
                multiRoute.editor.start({
                    addWayPoints: true,
                    removeWayPoints: true
                });
                t.setCenter();
            });


            multiRoute.events.add('update', function (e) {
                var coords = [];
                $.each(multiRoute.model.getAllPoints(), function () {
                    coords.push(this.geometry.getCoordinates());
                });
                $elem.trigger(EVENT_GET_COORDS, [coords]);
            });

            var searchControl = new ymaps.control.SearchControl({
                options: {
                    noPlacemark: true,
                    provider: 'yandex#map'
                }
            });
            t.map.controls.add(searchControl);

            searchControl.events.add("resultselect", function (e) {
                var coords = searchControl.getResultsArray()[e.get('index')].geometry.getCoordinates();

                var point = multiRoute.model.getAllPoints()[0]
                point.setReferencePoint(coords);
                $elem.trigger(EVENT_GET_COORDS, [coords]);
            });
        }
    };

    t.view = {
        placemark: {
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
                    iconCaption: ob.title
                }, option);

                t.map.geoObjects.add(placemark);
            }
        },



        /**
         * Проверка на наличие переменной с данными о геообъектах
         * @returns {boolean}
         */
        hasData: function () {
            if (typeof dataGeoObjects == 'undefined') {
                console.error('Not defined dataGeoObjects. Please define a variable var dataGeoObjects = {}');
                return false;
            } else {
                return true;
            }
        },

        /**
         * Нанесение объектов геолокаций на карту
         */
        addGeoObjects: function () {
            $.each(dataGeoObjects, function () {
                t.view[this.type].add(this);
            });

            t.setCenter();
        },

        /**
         * Запуск построения карты с геообъектами
         * @returns {boolean}
         */
        run: function () {
            //Проверка на наличие объекта с геоданными
            if (!t.view.hasData()) return false;

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
                        el.balloon.open();
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
        var bounds = t.map.geoObjects.getBounds();
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
        type = $elem.attr('data-type');
        $customSearch =  $('#'+$elem.attr('data-search'));

        ymaps.ready(t.init);
    };
    t.prototype = t.constructor();
}