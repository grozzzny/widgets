<?php

namespace grozzzny\widgets\map\assets;

use yii\web\AssetBundle;

class MapConstructorAsset extends AssetBundle
{
    public $sourcePath = '@grozzzny/widgets/map/assets';

    public $js = [
        'map-constructor.js',
        'ymaps.arrow.js',
    ];

    public $depends = [
        'yii\web\JqueryAsset',
        'grozzzny\widgets\map\assets\MapApiAsset',
    ];
}
