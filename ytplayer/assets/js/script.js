//Document ready
$(document).ready(function() {

    /********************************
     - Hide loader on mobile -
     ********************************/
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        $("#BackgroundVideo").hide();
        $(".player-controls").hide();
    }

    /*************************
     - Youtube player -
     *************************/
    $("#BackgroundVideo").mb_YTPlayer();

    //Player controls
    $('#BackgroundVideoPlay').on("click", function(){
        $("#BackgroundVideo").playYTP();
    });

    $('#BackgroundVideoPause').on("click", function(){
        $("#BackgroundVideo").pauseYTP();
    });
});