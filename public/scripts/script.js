const slider = tns({
  container: ".my-slider",
  mode:"carousel",
  items:3,
  responsive:{
    768:{
      items:3
    },
    480:{
      items:2

    }
  },
  edgePadding:0,
  slideBy: "page",
  speed:7000,
  nav:false,
  navPosition:"top",
  autoplay:false,
  autoplayTimeout:7000,
  autoplayButtonOutput:false,
  controlsContainer: "#buttons",
  prevButton:".previous",
  nextButton:".next",
  

});


const slider2 = tns({
  container: ".my-slider2",
  mode:"carousel",
  items:2,
  gutter:5,
  fixedWidth:300,
  autoWidth:true,
  viewportMax:50,
  responsive:{
    768:{
      items:3
    },
    480:{
      items:2

    }
  },
  edgePadding:0,
  
  slideBy: "page",
  speed:7000,
  nav:true,
  navPosition:"top",
  autoplay:false,
  autoplayTimeout:7000,
  autoplayButtonOutput:false,
  controlsContainer: "#buttons2",
  prevButton:".previous1",
  nextButton:".next1",
  

});


