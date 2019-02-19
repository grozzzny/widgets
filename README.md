Widgets for Yii2
==============================

## Installation guide

Please, install [User module for EasyiiCMS by following these instructions](https://github.com/grozzzny/widgets) before going further

```bash
$ php composer.phar require grozzzny/widgets "dev-master"
```


## Sidebar widget
```php
Sidebar::widget([
    'options' => [
        'class' => 'sidebar__menu-list',
        'encode' => false,
        'itemOptions' => ['class' => 'sidebar__menu-item']
    ],
    'items' => [
        Html::a('Список чемпионатов, турниров', ['/championships']),
        Html::a('Список команд', ['/teames']),
        Html::a('Расписание', ['/schedules?filter=last']),
        Html::a('Список игроков', ['/players']),
        Html::a('Тренера', ['/trainers'], ['class' => 'active']),
        Html::a('Судьи', ['/referees']),
        Html::a('Ледовые арены', ['/ice_arenas']),
        Html::a('Хоккейные магазины', ['/shops']),
        Html::a('Прочие учреждения, организации', ['/others']),
    ],
    'footer' => $this->render('_sidebar_footer')
]);
```

```html
<div class="sidebar__contacts">
    Отдел продаж<br>
    <a class="sidebar__contacts-phone sells_phone" href="tel:+79114587142">+7 (911) 458 71 42</a><br>
    <a class="sidebar__contacts-vk" target="_blank">vk.com/<span>mysite</span></a>
</div>
<div class="sidebar__copy-logo"></div>
<div class="sidebar__copy">© 2017 GROZZZNY</div>
```


## Seo widget

```html
<html prefix="og: http://ogp.me/ns#">
</html>
```

```php
//Register metatags + og
Seo::widget([
    'title' => $page->seo('title', $page->model->title),
    'description' => $page->seo('description'),
    'image' => '/images/logo.png',
    'keywords' => 'Губка боб, квадратные штаны'
]);
```


## Schema organization widget

```html
use yii\easyii\models\Setting;
```

```php
<?=\grozzzny\widgets\schema_organization\SchemaOrganizationWidget::widget([
    'name' => Setting::get('organization_name'),
    'logo' => Setting::get('organization_logo'),
    'index' => Setting::get('organization_index'),
    'city' => Setting::get('organization_city'),
    'address' => Setting::get('organization_address'),
    'phone' => Setting::get('organization_phone'),
    'email' => Setting::get('organization_email'),
])?>
```

## Map yandex widget

##### input

```php
<?= MapConstructorWidget::widget([
    'model' => $this->model,
    'attribute' => $this->attribute,
    'search_id' => $settings->search_id,
    'type' => $type //  placemark | polygon | polyline | route 
]); ?>
```

##### Show coords

```php
<?= MapWidget::widget([
        'coords' => [
            [
                'hash' => 'event_20',
                'type' => 'placemark', //  placemark | polygon | polyline | route 
                'coords' => [54.718504, 20.509194],
                'src' => null,
                //'src' => 'images/location-14-512.png',
                'icoColor' => 'darkGreen', //blue | darkGreen | red | violet | darkOrange | black | night | brown | yellow | darkBlue | green | pink | orange | gray | lightBlue | olive
                'sizeIco' => 1,
                'title' => 'Новая метка',
                'content' => 'Контент новой метки HTML'
            ],
            [
                'hash' => 'event_5',
                'type' => 'polygon',
                'coords' => [
                    [54.719444, 20.505435],
                    [54.719891, 20.508139],
                    [54.716376, 20.509555],
                    [54.715898, 20.505896]
                ],
                'title' => 'Полигон',
                'content' => 'Контент полигона HTML',
                'fillColor' => '#ff0600',
                'strokeColor' => '#5b0003',
                'strokeWidth' => 1,
                'fillOpacity' => '0.1'
            ],
            [
                'hash' => 'event_6',
                'type' => 'polyline',
                'coords' => [
                    [54.716407, 20.509812],
                    [54.716948, 20.512902],
                    [54.717985, 20.512859],
                    [54.720398, 20.514133]
                ],
                'title' => 'Ломанная',
                'content' => 'Контент ломанной <b>HTML</b>',
                'strokeWidth' => 2,
                'strokeColor' => '#002eb8'
            ],
            [
                'hash' => 'event_7',
                'type' => 'route',
                'mode' => 'auto', //masstransit | pedestrian | auto
                'coords' => [
                    [54.715547, 20.513425],
                    [54.715920, 20.505893]
                ],
                'contentStart' => 'Контент маршрута в точке START <i>HTML</i>',
                'srcStart' => 'images/20151120224636875.png',
                'sizeIcoStart' => 1,

                'contentFinish' => 'Контент маршрута в точке FINISH <i>HTML</i>',
                'srcFinish' => 'images/2015923223658445.png',
                'sizeIcoFinish' => 1,

                'strokeWidth' => 20,
                'strokeColor' => '#002eb8'
            ],
            [
                'hash' => 'event_1',
                'type' => 'placemark',
                'coords' => [54.722695, 20.408430],
                //'src' => null,
                'src' => 'images/location-14-512.png',
                'icoColor' => 'darkGreen', //blue | darkGreen | red | violet | darkOrange | black | night | brown | yellow | darkBlue | green | pink | orange | gray | lightBlue | olive
                'sizeIco' => 1,
                'title' => 'Концерт Руки Верх',
                'content' => 'Концерт Руки Верх. <a href="view.html">Подробнее..</a>'
            ],
            [
                'hash' => 'event_2',
                'type' => 'polyline',
                'coords' => [
                    [54.670993, 20.494947],
                    [54.680543, 20.543013]
                ],
                'title' => 'Концерт Баскова',
                'content' => 'Концерт Баскова. <a href="view.html">Подробнее..</a>',
                'strokeWidth' => 2,
                'strokeColor' => '#002eb8'
            ],
            [
                'hash' => 'event_3',
                'type' => 'route',
                'mode' => 'auto', //masstransit | pedestrian | auto
                'coords' => [
                    [54.749713, 20.539236],
                    [54.737597, 20.573225]
                ],
                'contentStart' => 'Коцерт Пугачевой, Галкина, Урганта, Харламова, Бондарчука иииии Паши Воли. <a href="view.html">Подробнее..</a>',
                'srcStart' => 'images/20151120224636875.png',
                'sizeIcoStart' => 1,

                'contentFinish' => 'Коцерт Пугачевой, Галкина, Урганта, Харламова, Бондарчука иииии Паши Воли. <a href="view.html">Подробнее..</a>',
                'srcFinish' => 'images/2015923223658445.png',
                'sizeIcoFinish' => 1,

                'strokeWidth' => 20,
                'strokeColor' => '#002eb8'
            ],
        ],
    ]) ?>
```
