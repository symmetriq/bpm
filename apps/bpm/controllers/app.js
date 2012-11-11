// ==========================================================================
// Project:  BPM Calculator
// Copyright: Jason Sims
// ==========================================================================
/*globals Bpm */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
Bpm.appController = SC.Object.create(
/** @scope Bpm.appController.prototype */ {

	// measured tempo in BPM
  tempo: null,

	// value to be displayed in UI
	tempoDisplay: function() {
		if (this.get('tempo') !== null) {
			return this.get('tempo') + ' bpm';
		} else {
			return "---";
		}
	}.property('tempo'),

  // accuracy of tempo measurement
  // (not implemented; currently just mapping 0-30 intervals as 0-100%)
  tempoAccuracy: 0,

  // latest timestamp when tempo button was tapped
  tapStamp: 0,

  // previous tapStamp
  previousTap: 0,
  
  // the difference between the last two intervalAvg values
  // (undefined by default because 0 would mean perfect accuracy)
  intervalAvgDelta: undefined,

  // intervals stored here
  intervals: new Array(),

	intervalSum: function() {
		return this.intervals.get('@sum');
	}.property('intervals'),

	intervalAvg: function() {
		return this.intervals.get('@average');
	}.property('intervals'),

	intervalCount: function() {
		return this.intervals.get('length');
	}.property('intervals'),

	intervalList: function() {
		return this.intervals.join(", ");
	}.property('intervals'),

	// internal data we'd like to display for debug
	interestingDetails: "",

	// update details
	updateDetails: function() {
		var details = '<h1>Details</h1><b>Intervals:</b> ' + this.get('intervalCount') + '<br /><b>Sum:</b> ' + this.get('intervalSum') + '<br /><b>Average:</b> ' + this.get('intervalAvg') + '<br /><br /><b>Recorded Values...</b><br />' + this.get('intervalList');
		this.set('interestingDetails', details);
	},

	// stuff that should happen when intervals content changes
	intervalsContentDidChange: function() {
		this.updateDetails();
	}.observes('this.intervals.[]'),

  // Tap Tempo button was pressed
  // TODO: spacebar should trigger this
  bpmTapPressed: function (newTapStamp) {

		var newStamp = Date.now();

    if (this.get('tapStamp')) {
      if (newStamp - this.get('tapStamp') >= 2500) {
        // auto-reset (more than 2.5 sec since last tap)
        // intended to tap tempos as low as 30 bpm
        // (2500ms between taps = 24 bpm)

        // TODO: instead of manually resetting multiple properties,
        // this should all be a new instance of an object
        this.set('tempo', null);
        this.set('previousTap', 0);
        //this.set('intervalSum', 0);
        //this.set('intervalCount', 0);
        this.set('tempoAccuracy', 0);
        this.intervals.set('length', 0);
        this.updateDetails();
      } else {
        // capture previous tapstamp
        this.set('previousTap', this.get('tapStamp'));
      }
    } else {
      // first run, reset in case animation was run first
      this.set('tempoAccuracy', 0);
    }

    // record new tapstamp
    this.set('tapStamp', newStamp);

    // must already have at least one tapstamp to measure interval
    if (this.get('previousTap')) {

      // TODO: don't repeatedly .get the same properties
      // ...if you need them more than once, store them locally
      // see: http://wiki.sproutcore.com/JavaScript-Style-Guide

      var newInterval = this.get('tapStamp') - this.get('previousTap');

      // capture current intervalAvg
      var oldintervalAvg = this.get('intervalAvg');

			// add new interval to list
      this.intervals.pushObject(newInterval);
      
      // difference between last two intervalAvg values
      this.set('intervalAvgDelta', oldintervalAvg - this.get('intervalAvg'));

    }

    // must have at least 4 taps (3 intervals) before setting a tempo value
    if (this.intervals.length > 2) {
      var newBpmValue = Math.round(60000 / this.get('intervalAvg'));
      this.set('tempo', newBpmValue);

      // "accuracy" is just 0-30 (intervals recorded) mapped to 0-100
      // a simple but ultimately wrong method
      if (this.intervals.length > 30) {
        newAccuracyValue = 100;
      } else {
        newAccuracyValue = Math.round(100 * (this.intervals.length / 30));
      }
      this.set('tempoAccuracy', newAccuracyValue);
    }
  },
  
  // display BPM Calculator floating window
  showPalettePane: function() {
    var pane = SC.PalettePane.create({

      layout: { width: 250, height: 220, centerX: 0, centerY: -100 },

      contentView: SC.View.extend({
        classNames: 'bpm_calculator',
        layout: { top: 0, left: 0, bottom: 0, right: 0 },
        childViews: 'appTitle tempoDisplay tempoAccuracy tapButton'.w(),
    
        appTitle: SC.LabelView.design({
          layout: { top: 20, height: 24, left: 0, right: 0 },
          classNames: 'app_title',
          textAlign: SC.ALIGN_CENTER,
          value: "BPM Calculator"
        }),
    
        tempoDisplay: SC.LabelView.design({
          layout: { top: 65, height: 24, left: 38, right: 38 },
          classNames: 'tempo_display',
          textAlign: SC.ALIGN_CENTER,
          valueBinding: "Bpm.appController.tempoDisplay"
        }),
    
        tempoAccuracy: SC.ProgressView.design({
          layout: { top: 140, height: 10, left: 40, right: 40 },
          classNames: 'jason_progress',
          minimum: 0, 
          maximum: 100,
          valueBinding: "Bpm.appController.tempoAccuracy"
        }),
        
        tapButton: SC.ButtonView.design({
          layout: { width: 170, bottom: 25, height: 21, centerX: 0 },
          classNames: 'jason_button',
          title: "Tap Tempo",
          action: "bpmTapPressed",
          target: "Bpm.appController"
        })
      })
    });
    pane.append();
    this.set('bpmCalcPane', pane);

		this.updateDetails();

		// doesn't work
		//pane.rootResponder.makeKeyPane(pane);
		//pane.rootResponder.listenFor(['t'],this.bpmTapPressed);
  }


/* old properties/method

  // latest timestamp when tempo button was tapped
  tapStamp: 0,

  // previous tapStamp
  lastTap: 0,

  intervalSum: 0,
  
  intervalCount: 0,
  
  avgInterval: 0,

  // the difference between the last two avgInterval values
  // (undefined by default because 0 would mean perfect accuracy)
  avgIntervalDelta: undefined,

  tempoAccuracy: 0,

  tempoDisplay: "---",

  intervals: new Array(),

  intervalList: "",


  // Tap Tempo button was pressed
  // TODO: spacebar should trigger this
  bpmTapPressed: function() {

    var newStamp = Date.now();

    if (this.get('tapStamp')) {
      if (newStamp - this.get('tapStamp') >= 2500) {
        // auto-reset (more than 2.5 sec since last tap)
        // intended to tap tempos as low as 30 bpm
        // (2500ms between taps = 24 bpm)

        // TODO: instead of manually resetting multiple properties,
        // this should all be a new instance of an object
        this.set('tempoDisplay', "---");
        this.set('lastTap', 0);
        this.set('intervalSum', 0);
        this.set('intervalCount', 0);
        this.set('tempoAccuracy', 0);
        this.intervals = new Array();
      } else {
        // capture previous tapstamp
        this.set('lastTap', this.get('tapStamp'));
      }
    } else {
      // first run, reset in case animation was run first
      this.set('tempoAccuracy', 0);
    }

    // record new tapstamp
    this.set('tapStamp', newStamp);

    // must already have at least one tapstamp to measure interval
    if (this.get('lastTap')) {

      // TODO: don't repeatedly .get the same properties
      // ...if you need them more than once, store them locally
      // see: http://wiki.sproutcore.com/JavaScript-Style-Guide

      var newInterval = this.get('tapStamp') - this.get('lastTap');
      this.set('intervalSum', this.get('intervalSum') + newInterval);
      this.set('intervalCount', this.get('intervalCount') + 1);

      this.intervals.pushObject(newInterval);
      this.set('intervalList', this.intervals.join(", "));

      // capture current avgInterval
      var oldAvgInterval = this.get('avgInterval');
      var newAvgInterval = this.get('intervalSum') / this.get('intervalCount');

      // difference between last two avgInterval values
      this.set('avgIntervalDelta', oldAvgInterval - newAvgInterval);

      this.set('avgInterval', newAvgInterval);
    }

    // must have at least 4 taps (3 intervals) before updating display
    if (this.get('intervalCount') > 2) {
      var newBpmValue = Math.round(60000 / this.get('avgInterval'));
      this.set('tempoDisplay', newBpmValue + " bpm");

      // "accuracy" is just 0-30 (intervals recorded) mapped to 0-100
      // a simple but ultimately wrong method
      if (this.get('intervalCount') > 30) {
        newAccuracyValue = 100;
      } else {
        newAccuracyValue = Math.round(100 * (this.get('intervalCount') / 30));
      }
      this.set('tempoAccuracy', newAccuracyValue);
    }

  }
*/

}) ;
