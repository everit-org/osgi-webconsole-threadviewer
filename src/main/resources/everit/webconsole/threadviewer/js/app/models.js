$(document).ready(function() {
(function(threadviewer) {
	
	var StackTraceEntry = threadviewer.StackTraceEntry = Backbone.Model.extend({
		className : "unknown",
		methodName : "unknown",
		lineNumber : 0
	});

	var StackTrace = threadviewer.StackTrace = Backbone.Collection.extend({
		model : StackTraceEntry
	});
	
	var Thread = threadviewer.Thread = Backbone.Model.extend({
		initialize: function(options) {
			if (options.stackTrace) {
				var stackTraceModels = [];
				for (var i in options.stackTrace) {
					stackTraceModels.push(new StackTraceEntry(options.stackTrace[i]));
				}
				this.stackTrace.reset(stackTraceModels);
			}
		},
		name : "unknown",
		state : "unknown",
		selected : false,
		stackTrace : new StackTrace(),
		toggleSelected: function() {
			this.set("selected", !this.get("selected"));
		}
	});
	
	var ApplicationModel = threadviewer.ApplicationModel = Backbone.Model.extend({
		threadList : null,
		threadStateSummary : "",
		initialize : function(options) {
			var self = this;
			options.threadList.on("reset", function(newThreadList) {
				self.set("threadStateSummary", "Summary: " + newThreadList.length + " threads");
			});
		}
	});
	
	var ThreadList = threadviewer.ThreadList = Backbone.Collection.extend({
		model : Thread,
		getThreadByName : function(threadName) {
			return this.findWhere({name : threadName});
		}
	});

})(window.threadviewer);	
});
