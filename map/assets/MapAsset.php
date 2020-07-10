<?php

namespace grozzzny\widgets\map\assets;

use yii\web\AssetBundle;

class MapAsset extends AssetBundle
{
    public $sourcePath = '@grozzzny/widgets/map/assets';

    public $js = [
        'map.js',
        'ymaps.arrow.js',
    ];

    public $depends = [
        'yii\web\JqueryAsset',
        'grozzzny\widgets\map\assets\MapApiAsset',
    ];
}
