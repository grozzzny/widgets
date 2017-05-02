<?php
namespace grozzzny\widgets\seo;

use yii\base\Widget;
use Yii;

class Seo extends Widget
{

    public $title = null;
    public $description = null;
    public $image = null;
    public $keywords = null;

    public function run()
    {
        if(!empty($this->title)) {

            Yii::$app->view->title = $this->title;

            Yii::$app->view->registerMetaTag([
                'property' => 'og:title',
                'content' => $this->title,
            ]);
        }

        if(!empty($this->description)) {

            Yii::$app->view->registerMetaTag([
                'name' => 'description',
                'content' => $this->description,
            ]);

            Yii::$app->view->registerMetaTag([
                'property' => 'og:description',
                'content' => $this->description,
            ]);
        }

        if(!empty($this->keywords)) {
            Yii::$app->view->registerMetaTag([
                'name' => 'keywords',
                'content' => $this->keywords,
            ]);
        }

        if(!empty($this->image)) {
            Yii::$app->view->registerMetaTag([
                'property' => 'og:image',
                'content' => Yii::$app->request->hostInfo . $this->image,
            ]);
        }

        Yii::$app->view->registerMetaTag([
            'property' => 'og:url',
            'content' => Yii::$app->request->hostInfo . Yii::$app->request->getUrl(),
        ]);
    }

}