<?php

namespace grozzzny\widgets\map;

use grozzzny\widgets\map\assets\MapConstructorAsset;
use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\widgets\InputWidget;

class MapConstructorWidget extends InputWidget
{
    const TYPE_PLACEMARK = 'placemark';
    const TYPE_POLYGON = 'polygon';
    const TYPE_POLYLINE = 'polyline';
    const TYPE_ROUTE = 'route';

    public $search_id = '';
    public $type = self::TYPE_PLACEMARK;

    public function init()
    {
        parent::init();
        $this->registerAssets();
        $this->registerJs();
    }

    public function run()
    {
        $inputName = empty($this->model) ? $this->name : Html::getInputName($this->model, $this->attribute);
        $value = empty($this->model->{$this->attribute}) ? $this->value : $this->model->{$this->attribute};

        $options = ArrayHelper::merge([
            'data-coords' => $inputName,
            'data-search' => $this->search_id,
            'data-type' => $this->type,
            'style' => 'height: 300px;'
        ], $this->options);

        $options['id'] = $this->id;

        echo Html::hiddenInput($inputName, $value);
        //echo Html::textarea($inputName, $value);
        echo Html::tag('div', '', $options);
    }

    public function registerAssets()
    {
        $view = $this->getView();
        MapConstructorAsset::register($view);
    }

    public function registerJs()
    {
        $this->getView()->registerJs("var ".$this->id." = new MapConstructor({ id: '".$this->id."'});");
    }
}