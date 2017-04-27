<?php

namespace grozzzny\widgets\sidebar\assets;

use yii\web\AssetBundle;
use yii\web\View;

class SidebarAsset extends AssetBundle
{
    public $sourcePath = '@grozzzny/widgets/sidebar/assets';

    public $css = [
        'css/sidebar.css'
    ];

    public $js = [
        'js/js-cookie.js',
    ];

    public $depends = [
        'yii\web\JqueryAsset',
    ];

    public $jsOptions = [
        'position' => View::POS_HEAD
    ];
}