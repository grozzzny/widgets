<?php
use yii\helpers\Html;
?>

<aside class="gr_sidebar">
    <button class="sidebar__btn-toggle"></button>
    <div class="sidebar__content">

        <div class="sidebar__menu">
            <?= Html::ul($items, $options)?>
        </div>
        <?=$footer?>
    </div>
</aside>
<script>
    $('.sidebar__btn-toggle').on('click', function () {
        var sidebar = $('.gr_sidebar');
        if(!sidebar.hasClass('sidebar_opened')){
            sidebar.addClass('sidebar_opened');
            $.cookie("sidebar_opened", true, { path : '/' });
        }else{
            sidebar.removeClass('sidebar_opened');
            $.cookie("sidebar_opened", null, { path : '/' });
        }
    });

    (function () {
        if($.cookie("sidebar_opened") == 'true'){
            $('.gr_sidebar').addClass('sidebar_opened');
        }
    })();
</script>