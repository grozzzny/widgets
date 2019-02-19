<?php

namespace grozzzny\widgets\map\assets;

use yii\web\AssetBundle;

class MapAsset extends AssetBundle
{
    public $sourcePath = '@grozzzny/widgets/map/assets';

    public $js = [
        '//api-maps.yandex.ru/2.1/?lang=ru_RU',
        'map.js',
    ];

    public $depends = [
        'yii\web\JqueryAsset',
    ];
}