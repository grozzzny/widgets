<?php
namespace grozzzny\widgets\sidebar;

use grozzzny\widgets\sidebar\assets\SidebarAsset;
use yii\base\Widget;

class Sidebar extends Widget
{

    public $items;
    public $options;
    public $footer;

    /**
     * Инициализация виджита
     */
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
        return $this->render('index', [
            'items' => $this->items,
            'options' => $this->options,
            'footer' => $this->footer
        ]);
    }

    /**
     * Регистрация assets (Файлы относящие к виджету CSS, JS)
     */
    public function registerAssets()
    {
        $view = $this->getView();
        SidebarAsset::register($view);
    }


}