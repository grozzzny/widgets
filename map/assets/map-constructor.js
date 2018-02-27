function MapConstructor(settings) {

    var TYPE_PLACEMARK = 'placemark',
        TYPE_POLYGON = 'polygon',
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