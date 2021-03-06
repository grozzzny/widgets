<?php
namespace grozzzny\widgets\gmap;

use grozzzny\depends\gmap\GmapAsset;
use yii\base\Widget;
use yii\helpers\ArrayHelper;
use yii\helpers\Html;

class GmapWidget extends Widget
{
    public $pluginOptions = [];
    public $options = [];

    private $_defaultOptions = [
        'style' => 'height: 400px;',
        'class' => 'gmap'
    ];

    public function init()
    {
        parent::init();
        $this->registerAssets();
        $this->registerJs();
    }

    public function run()
    {
        $this->options = ArrayHelper::merge(['id' => $this->id], $this->_defaultOptions, $this->options);
        echo Html::tag('div','', $this->options);
    }

    public function registerAssets()
    {
        $view = $this->getView();
        GmapAsset::register($view);
    }

    public function registerJs()
    {
        $variable = 'gmapOptions' . $this->id;
        $this->getView()->registerJsVar($variable, $this->pluginOptions);
        $this->getView()->registerJs("$('#".$this->id."').gMap(".$variable.");");
    }
}