<?php

namespace grozzzny\widgets\map;

use grozzzny\widgets\map\assets\MapAsset;
use yii\base\Widget;
use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\helpers\Json;

class MapWidget extends Widget
{
    public $coords = [];
    public $height = 400;
    public $options = [
        'class' => 'map'
    ];

    public $pluginOptions = [];

    public function init()
    {
        parent::init();
        $this->registerAssets();
        $this->registerJs();
    }

    public function run()
    {
        $options = ArrayHelper::merge(['id' => $this->id], ArrayHelper::merge(['style' => 'height:'.$this->height.'px'], $this->options));

        echo Html::tag('div', '', $options);
    }

    public function registerAssets()
    {
        MapAsset::register($this->view);
    }

    public function registerJs()
    {
        $pluginOptions = ArrayHelper::merge(['id' => $this->id], [
            'coords' => $this->coords
        ], $this->pluginOptions);

        $this->view->registerJs("var ".$this->id." = new Map(".Json::encode($pluginOptions).");");
    }
}