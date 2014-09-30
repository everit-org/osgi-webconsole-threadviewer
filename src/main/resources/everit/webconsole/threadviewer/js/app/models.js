$(document).ready(function() {
(function(threadviewer) {
	
	var StackTraceEntry = threadviewer.StackTraceEntry = Backbone.Model.extend({
		className : "unknown",
		methodName : "unknown",
		lineNumber : 0,
		description: ""
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
		id: "",
		name : "unknown",
		state : "unknown",
		selected : false,
		stackTrace : new StackTrace(),
		toggleSelected: function() {
			this.set("selected", !this.get("selected"));
		},
		interrupt: function() {
			console.log("interrupting ", this.id, this.get("appModel"));
			var self = this;
			$.getJSON(threadviewer.rootPath + "/interrupt/" + this.id, function(threadDefs) {
				self.get("appModel").updateThreadList(threadDefs);
			});
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
		},
		updateThreadList : function(threadDefinitions) {
			var newThreads = [];
			for (var i in threadDefinitions) {
				var threadDef = threadDefinitions[i];
				var newThread = new threadviewer.Thread(threadDef);
				newThread.set("appModel", this);
				newThreads.push(newThread);
			}
			this.get("threadList").reset(newThreads);
		},
		refreshThreadList: function() {
			var self = this;
			$.getJSON(threadviewer.rootPath + "/listthreads", function(threadDefs) {
				self.updateThreadList(threadDefs);
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
