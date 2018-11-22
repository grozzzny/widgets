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
    public $site_name = null;
    public $url = null;
    public $locale = null;
    public $canonical = null;
    public $type = null;

    public function run()
    {
        $this->regiserTitle();

        $this->regiserDescription();

        $this->regiserKeywords();

        $this->regiserImage();

        $this->regiserUrl();

        $this->regiserLocale();

        $this->regiserSiteName();

        $this->regiserCanonical();

        $this->regiserType();
    }

    protected function regiserTitle()
    {
        if(empty($this->title)) return false;

        Yii::$app->view->title = $this->title;

        Yii::$app->view->registerMetaTag([
            'property' => 'og:title',
            'content' => $this->title,
        ]);
    }

    protected function regiserDescription()
    {
        if(empty($this->description)) return false;

        Yii::$app->view->registerMetaTag([
            'name' => 'description',
            'content' => $this->description,
        ]);

        Yii::$app->view->registerMetaTag([
            'property' => 'og:description',
            'content' => $this->description,
        ]);
    }

    protected function regiserKeywords()
    {
        if(empty($this->keywords)) return false;

        Yii::$app->view->registerMetaTag([
            'name' => 'keywords',
            'content' => $this->keywords,
        ]);
    }

    // 1200 x 630 | 600 х 315
    protected function regiserImage()
    {
        if(empty($this->image)) return false;

        $this->image = preg_match('/^http?/i', $this->image) ? $this->image : Yii::$app->request->hostInfo . $this->image;

        Yii::$app->view->registerMetaTag([
            'property' => 'og:image',
            'content' => $this->image,
        ]);
    }

    protected function regiserUrl()
    {
        $url = empty($this->url) ? Yii::$app->request->hostInfo . Yii::$app->request->getUrl() : $this->url;

        Yii::$app->view->registerMetaTag([
            'property' => 'og:url',
            'content' => $url,
        ]);
    }

    protected function regiserLocale()
    {
        $locale = empty($this->locale) ? preg_replace('/[-]+/i', '_', Yii::$app->language) : $this->locale;

        Yii::$app->view->registerMetaTag([
            'property' => 'og:locale',
            'content' => $locale,
        ]);
    }

    protected function regiserType()
    {
        $type = empty($this->type) ? 'website' : $this->type;

        Yii::$app->view->registerMetaTag([
            'property' => 'og:type',
            'content' => $type,
        ]);
    }

    protected function regiserSiteName()
    {
        if(empty($this->site_name)) return false;

        Yii::$app->view->registerMetaTag([
            'property' => 'og:site_name',
            'content' => $this->site_name,
        ]);
    }

    protected function regiserCanonical()
    {
        if(empty($this->canonical)) return false;

        Yii::$app->view->registerLinkTag(['rel' => 'canonical', 'href' => $this->canonical]);
    }

}