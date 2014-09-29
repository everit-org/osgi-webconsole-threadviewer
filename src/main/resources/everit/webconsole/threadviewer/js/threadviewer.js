$(document).ready(function() {

	var StackTraceEntry = Backbone.Model.extend({
		className : "unknown",
		methodName : "unknown",
		lineNumber : 0
	});

	var StackTrace = Backbone.Collection.extend({
		model : StackTraceEntry
	});
	
	var Thread = Backbone.Model.extend({
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
		stackTrace : new StackTrace()
	});
	
	var ApplicationModel = Backbone.Model.extend({
		threadList : null,
		selectedThread : null,
		threadStateSummary : "",
		initialize : function() {
			var self = this;
			threadList.on("reset", function() {
				self.set("selectedThread", null);
				self.set("threadStateSummary", "Summary: " + self.get("threadList").length + " threads");
			});
			this.on("change:selectedThread", function(e) {
				var prev = this.previous("selectedThread");
				if (prev != null) {
					prev.set("selected", false);
				}
				var curr = this.get("selectedThread");
				if (curr != null) {
					curr.set("selected", true);
					console.log(curr.get("stackTrace"));
				}
			});
		}
	});
	
	var ThreadList = Backbone.Collection.extend({
		model : Thread,
		getThreadByName : function(threadName) {
			return this.findWhere({name : threadName});
		}
	});
	
	
	var ThreadView = Backbone.View.extend({
		tagName : "li",
		className : "ui-widget-content",
		events : {
			"click" : "onClick"
		},
		initialize : function(options) {
			this.appModel = options.appModel;
			this.listenTo(this.model, "change", this.render);
		},
		appModel : null,
		onClick : function() {
			this.appModel.set("selectedThread", this.model);
		},
		render : function() {
			this.$el.empty().append(this.model.get("name"));
			this.$el[this.model.get("selected") ? "addClass" : "removeClass"]("ui-selected");
			return this.$el;
		}
	});
	
	var ThreadListView = Backbone.View.extend({
		initialize : function(options) {
			this.appModel = options.appModel;
			this.listenTo(this.model, "reset", this.render);
		},
		appModel : null,
		render : function() {
			this.$el.empty();
			var table = _.template($("#tmpl-thread-list").text())({
				threads: this.model
			});
			var $table = $(table).tablesorter();
			var rows = $table.find("tr");
			for (var idx in rows) {
				var rowClass = idx % 2 ? "even" : "odd";
				$(rows[idx]).addClass(rowClass);
			}
			return this.$el.append($table);
		}
	
	});
	
	var StackTraceView = Backbone.View.extend({
		initialize : function(options) {
			this.listenTo(options.appModel, "change:selectedThread", this.render);
			this.appModel = options.appModel;
		},
		render : function() {
			this.$el.empty();
			if (this.appModel && this.appModel.get("selectedThread")) {
				var thread = this.appModel.get("selectedThread");
				$("<h1></h1>")
					.append(thread.get("name"))
					.append(": ")
					.append(thread.get("state"))
				.appendTo(this.$el);
				var table = _.template($("#tmpl-stacktrace").text())({
					stackTrace: thread.get("stackTrace")
				});
				this.$el.append(table);
			}
			return this.$el;
		}
	});
	
	var SummaryView = Backbone.View.extend({
		initialize: function() {
			this.listenTo(this.model, "change:threadStateSummary", this.render);
		},
		render: function() {
			this.$el.text(this.model.get("threadStateSummary"));
		}
	});
	
	var threadList = new ThreadList();
	
	var appModel = new ApplicationModel({
		threadList : threadList
	});
	
	var threadListView = new ThreadListView({
		model : threadList,
		appModel : appModel
	});
	
	var stackTraceView = new StackTraceView({
		appModel : appModel
	});
	
	var summaryView = new SummaryView({
		model: appModel,
		el: $("p.statline").get(0)
	});
	
	$("#cnt-thread-list").append(threadListView.render());
	
	$.getJSON(window.threadViewerConfig.rootPath + "/listthreads", function(threadDefinitions) {
		var newThreads = [];
		for (var i in threadDefinitions) {
			var threadDef = threadDefinitions[i];
			newThreads.push(new Thread(threadDef));
		}
		threadList.reset(newThreads);
	});
	
});
