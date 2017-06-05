<?php

namespace grozzzny\widgets\ytplayer\assets;

use yii\web\AssetBundle;
use yii\web\View;

class YtplayerAsset extends AssetBundle
{
    public $sourcePath = '@grozzzny/widgets/ytplayer/assets';

    public $css = [
        'css/style.css'
    ];

    public $js = [
        'js/jquery.mb.ytplayer.js',
        'js/script.js',
    ];

    public $depends = [
        'yii\web\JqueryAsset',
    ];

    public $jsOptions = [
        'position' => View::POS_HEAD
    ];
}