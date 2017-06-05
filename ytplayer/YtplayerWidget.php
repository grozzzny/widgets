<?php
namespace grozzzny\widgets\ytplayer;

use grozzzny\widgets\ytplayer\assets\YtplayerAsset;
use yii\base\Widget;
use yii\helpers\ArrayHelper;

class YtplayerWidget extends Widget
{

    public $videoURL;

    private $defaultOptions = [
        'containment' => '#BackgroundVideoContainer',
        'autoPlay' => true,
        'showControls' => false,
        'mute' => true,
        'startAt' => 0,
        'opacity' => 1,
        'showYTLogo' => false,
        'vol' => 25
    ];

    public $pluginOptions = [];

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
        $pluginOptions = ArrayHelper::merge(
            $this->defaultOptions,
            $this->pluginOptions,
            ['videoURL' => $this->videoURL]
        );

        return $this->render('index', ['pluginOptions' => json_encode($pluginOptions)]);
    }

    /**
     * Регистрация assets (Файлы относящие к виджету CSS, JS)
     */
    public function registerAssets()
    {
        $view = $this->getView();
        YtplayerAsset::register($view);
    }


}