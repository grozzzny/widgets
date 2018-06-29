$(window).on('load', function (e) {
    //Hide prage loader
    $(".page-loader").fadeOut();
});
$(window).ready(function (e) {
    setTimeout(function () {
        $(".page-loader").fadeOut();
    }, 1500);
});
