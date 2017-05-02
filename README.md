Widgets for Yii2
==============================

## Installation guide

Please, install [User module for EasyiiCMS by following these instructions](https://github.com/grozzzny/widgets) before going further

```bash
$ php composer.phar require grozzzny/widgets "dev-master"
```


## Sidebar widget
```php
Sidebar::widget([
    'options' => [
        'class' => 'sidebar__menu-list',
        'encode' => false,
        'itemOptions' => ['class' => 'sidebar__menu-item']
    ],
    'items' => [
        Html::a('Список чемпионатов, турниров', ['/championships']),
        Html::a('Список команд', ['/teames']),
        Html::a('Расписание', ['/schedules?filter=last']),
        Html::a('Список игроков', ['/players']),
        Html::a('Тренера', ['/trainers'], ['class' => 'active']),
        Html::a('Судьи', ['/referees']),
        Html::a('Ледовые арены', ['/ice_arenas']),
        Html::a('Хоккейные магазины', ['/shops']),
        Html::a('Прочие учреждения, организации', ['/others']),
    ],
    'footer' => $this->render('_sidebar_footer')
]);
```

```html
<div class="sidebar__contacts">
    Отдел продаж<br>
    <a class="sidebar__contacts-phone sells_phone" href="tel:+79114587142">+7 (911) 458 71 42</a><br>
    <a class="sidebar__contacts-vk" target="_blank">vk.com/<span>mysite</span></a>
</div>
<div class="sidebar__copy-logo"></div>
<div class="sidebar__copy">© 2017 GROZZZNY</div>
```


## Seo widget

```html
<html prefix="og: http://ogp.me/ns#">
</html>
```

```php
//Register metatags + og
Seo::widget([
    'title' => $page->seo('title', $page->model->title),
    'description' => $page->seo('description'),
    'image' => '/images/logo.png',
    'keywords' => 'Губка боб, квадратные штаны'
]);
```