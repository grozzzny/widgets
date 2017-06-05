<?php

namespace grozzzny\widgets\loader\assets;

use yii\web\AssetBundle;
use yii\web\View;

class LoaderAsset extends AssetBundle
{
    public $sourcePath = '@grozzzny/widgets/loader/assets';

    public $css = [
        'css/style.css'
    ];

    public $js = [
        'js/script.js',
    ];

    public $depends = [
        'yii\web\JqueryAsset',
    ];

    public $jsOptions = [
        'position' => View::POS_HEAD
    ];
}