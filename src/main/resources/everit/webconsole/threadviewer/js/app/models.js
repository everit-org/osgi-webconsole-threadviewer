$(document).ready(function() {
(function(threadviewer) {
	
	var ThreadState = threadviewer.ThreadState = Backbone.Model.extend({
		initialize: function() {
			var rawVisibleStates = threadviewer.localStorage.getItem("visibleThreadStates");
			var visibleStates = rawVisibleStates === null ? ThreadState.states : rawVisibleStates.split(",");
			ThreadState.states.forEach(function(state) {
				this.set(state, visibleStates.indexOf(state) != -1);
			}, this);
			this.on("change", this.persistState, this);
		},
		NEW : true,
		RUNNABLE : true,
		BLOCKED : true,
		WAITING : true,
		TIMED_WAITING : true,
		TERMINATED : true,
		persistState : function() {
			var arr = [];
			ThreadState.states.forEach(function(state) {
				this.get(state) && arr.push(state);
			}, this);
			threadviewer.localStorage.setItem("visibleThreadStates", arr.join(","));
		}
	});
	
	ThreadState.states = ["NEW", "RUNNABLE", "BLOCKED", "WAITING", "TIMED_WAITING", "TERMINATED"];
	
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
			var self = this;
			$.getJSON(threadviewer.rootPath + "/interrupt/" + this.id, function(threadDefs) {
				self.get("appModel").updateThreadList(threadDefs);
			});
		}
	});
	
	var ApplicationModel = threadviewer.ApplicationModel = Backbone.Model.extend({
		filteredThreadList : null,
		threadList : null,
		threadStateSummary : "",
		openedStacktraces: [],
		allSelected: false,
		initialize : function(options) {
			options.threadList.on("reset", this.updateSummary, this);
			options.filteredThreadList.on("reset", this.updateSummary, this);
			threadviewer.router.on("route:displayThreads", function(e) {
				e = e || "";
				if (e === "all") {
					this.setAllSelected(true);
				} else {
					var threadIdList = e.split("-");
					this.set("openedStacktraces", threadIdList);
				}
			}, this);
			options.threadStateFilter.on("change", this.updateFilteredThreadList, this);
			this.updateFilteredThreadList();
		},
		updateSummary: function() {
			var threadList = this.get("threadList");
			var filteredThreadList = this.get("filteredThreadList");
			var summary = "Summary: " + threadList.length + " threads";
			if (threadList.length !== filteredThreadList.length) {
				summary += (" (" + filteredThreadList.length + " displayed)");
			}
			this.set("threadStateSummary", summary);
		},
		updateFilteredThreadList : function() {
			var filter = this.get("threadStateFilter");
			var newValue = this.get("threadList").filter(function(thread) {
				return filter.get(thread.get("state"))
			});
			this.get("filteredThreadList").reset(newValue);
		},
		updateThreadList : function(threadDefinitions) {
			this.get("threadList").forEach(function(thread) {
				thread.off(null, null, this);
			}, this);
			var newThreads = [];
			for (var i in threadDefinitions) {
				var threadDef = threadDefinitions[i];
				var newThread = new threadviewer.Thread(threadDef);
				newThread.set("appModel", this);
				newThread.on("change:selected", this.updateNavigation, this);
				newThreads.push(newThread);
			}
			this.get("threadList").reset(newThreads);
			if (this.get("allSelected")) {
				var newOpenedStacktraces = [];
				this.get("threadList").forEach(function(thread) {
					thread.set("selected", true);
					newOpenedStacktraces.push(thread.get("id"));
				});
				this.set("openedStacktraces", newOpenedStacktraces);
			} else {
				var opened = this.get("openedStacktraces");
				if (opened !== undefined) {
					opened.forEach(function(threadId) {
						var thread = this.get("threadList").findWhere({
							id : parseInt(threadId, 10)
						});
						if (thread !== undefined) {
							thread.set("selected", true);
						}
					}, this);
				}
			}
			this.updateFilteredThreadList();
		},
		setAllSelected : function(selected) {
			this.get("threadList").forEach(function(thread) {
				thread.set("selected", selected);
			});
			this.set("allSelected", selected);
		},
		toggleAllSelected: function() {
			this.setAllSelected(!this.get("allSelected"));
		},
		updateNavigation: function() {
			var selectedThreads = this.get("threadList").where({selected: true});
			if (selectedThreads.length === this.get("threadList").length) {
				threadviewer.router.navigate("all", {replace: true});
			} else {
				var selectedThreadIds = [];
				selectedThreads.forEach(function (thread) {
					selectedThreadIds.push(thread.get("id"));
				});
				threadviewer.router.navigate(selectedThreadIds.join("-"), {replace: true});
			}
		},
		refreshThreadList: function() {
			var self = this;
			$.getJSON(threadviewer.rootPath + "/threadlist.json", function(threadDefs) {
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
