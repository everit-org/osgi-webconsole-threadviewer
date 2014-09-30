$(document).ready(function() {
(function(threadviewer) {
	
	var StackTraceView = threadviewer.StackTraceView = Backbone.View.extend({
		render : function() {
			var table = _.template($("#tmpl-stacktrace").text())({
					stackTrace: this.model
				});
			return this.$el.empty().append(table);
		}
	});
	
	var ThreadView = threadviewer.ThreadView = Backbone.View.extend({
		tagName : "tr",
		className : "ui-state-default",
		events : {
			"click div.thread-name" : "toggleStackTrace",
			"click .ui-icon-stop" : "interrupt"
		},
		initialize : function(options) {
			this.appModel = options.appModel;
			this.listenTo(this.model, "change", this.render);
		},
		appModel : null,
		toggleStackTrace : function() {
			this.model.toggleSelected();
		},
		interrupt: function() {
			this.model.interrupt();
		},
		render : function() {
			this.$el.empty();
			var row = _.template($("#tmpl-thread-row").text())({
				thread: this.model
			});
			this.$el.append(row);
			if (this.model.get("selected")) {
				var stackTraceView = new StackTraceView({
					model: this.model.get("stackTrace")
				});
				this.$el.find("td.thread-name").append(stackTraceView.render());
			}
			return this.$el;
		}
	});
	
	threadviewer.ThreadListView = Backbone.View.extend({
		initialize : function(options) {
			this.appModel = options.appModel;
			this.listenTo(this.model, "reset", this.render);
		},
		appModel : null,
		render : function() {
			this.$el.empty();
			var table = _.template($("#tmpl-thread-list").text())({});
			var $table = $(table);
			var $tbody = $table.find("tbody");
			var self = this;
			this.model.forEach(function(thread) {
				$tbody.append(new ThreadView({
					model: thread,
					appModel: self.appModel
				}).render());
			});
			$table = $table.tablesorter();
			var rows = $table.find("tr");
			for (var idx in rows) {
				var rowClass = idx % 2 ? "even" : "odd";
				$(rows[idx]).addClass(rowClass);
			}
			return this.$el.append($table);
		}
	
	});
	
	threadviewer.SummaryView = Backbone.View.extend({
		initialize: function() {
			this.listenTo(this.model, "change:threadStateSummary", this.render);
		},
		render: function() {
			this.$el.text(this.model.get("threadStateSummary"));
		}
	});
	
})(window.threadviewer);	
});