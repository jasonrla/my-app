document.addEventListener("DOMContentLoaded", function() {
    function isMobileDevice() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    function checkScreenWidth() {
      if(window.innerWidth < 768 || isMobileDevice()) {
        document.getElementById("mobile-warning").style.display = "block";
      } else {
        document.getElementById("mobile-warning").style.display = "none";
      }
    }

    checkScreenWidth();
    window.addEventListener("resize", checkScreenWidth);
  });