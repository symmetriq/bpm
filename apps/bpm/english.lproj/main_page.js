// ==========================================================================
// Project:  BPM Calculator
// Copyright: Jason Sims
// ==========================================================================
/*globals Bpm */

// This page describes the main user interface for your application.  
Bpm.mainPage = SC.Page.design({

  // The main pane is made visible on screen as soon as your app is loaded.
  // Add childViews to this pane for views to display immediately on page 
  // load.
  mainPane: SC.MainPane.design({

    childViews: 'interestingDetails'.w(),

		interestingDetails: SC.LabelView.design({
      layout: { top: 20, left: 20, bottom: 20, width: 200 },
      classNames: "details",
			escapeHTML: NO,
      valueBinding: "Bpm.appController.interestingDetails",
      keyPressed: function(evt){ console.log('A key got pressed');}
    })
 

  })

});
