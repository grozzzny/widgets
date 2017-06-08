<?php
namespace grozzzny\widgets\loader;

use grozzzny\widgets\loader\assets\LoaderAsset;
use yii\base\Widget;

class LoaderWidget extends Widget
{
    public $color = '#24b7a4';

    public function init()
    {
        parent::init();
        $this->registerAssets();
    }

    /**
     * Метод run выводит HTML
     * @return string
     */
    public function run()
    {
        return $this->render('index', ['color' => $this->color]);
    }

    /**
     * Регистрация assets (Файлы относящие к виджету CSS, JS)
     */
    public function registerAssets()
    {
        $view = $this->getView();
        LoaderAsset::register($view);
    }


}