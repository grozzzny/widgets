<?php

namespace grozzzny\widgets\map;


use yii\base\Widget;
use yii\helpers\Html;

/**
 * Class StaticMapWidget
 * @package grozzzny\widgets\map
 *
 * https://tech.yandex.ru/maps/doc/staticapi/1.x/dg/concepts/input_params-docpage/
 *
 * Example
 * https://static-maps.yandex.ru/1.x/?pt=20.502646369122328,54.71199023398818,pm2blm&size=450,300&z=13&l=map
 */
class StaticMapWidget extends Widget
{
    const TYPE_MAP = 'map';
    const TYPE_SAT = 'sat';
    const TYPE_HYBRID = 'sat,skl';

    private $url_api = 'https://static-maps.yandex.ru/1.x/';
    private $params = [];

    public $width = 450;
    public $height = 300;

    public $style_point = 'pm2blm';

    public $points = [];

    public $options = [];

    public $type_map = self::TYPE_MAP;

    public function run()
    {
        $this->setTypeMap();
        $this->setSize();
        $this->setPoints();

        $url = $this->url_api . '?' . http_build_query($this->params);

        return Html::img($url, $this->options);
    }

    protected function setTypeMap()
    {
        $this->params += ['l' => $this->type_map];
    }

    protected function setSize()
    {
        $this->params += ['size' => $this->width.','.$this->height];
    }

    protected function setPoints()
    {
        $pt = [];

        foreach ($this->points as $point){
            $pt[] = implode(',', [
                $point[0],
                $point[1],
                $this->style_point
            ]);
        }

        $this->params += ['pt' => implode('~', $pt)];
    }
}