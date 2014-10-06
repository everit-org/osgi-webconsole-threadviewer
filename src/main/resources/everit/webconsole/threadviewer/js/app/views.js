/*
 * This file is part of Everit - Felix Webconsole Thread Viewer.
 *
 * Everit - Felix Webconsole Thread Viewer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Everit - Felix Webconsole Thread Viewer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Everit - Felix Webconsole Thread Viewer.  If not, see <http://www.gnu.org/licenses/>.
 */
$(document).ready(function() {
(function(threadviewer) {
	
	var ThreadStateFilterView = threadviewer.ThreadStateFilterView = Backbone.View.extend({
		events: {
			"click input[type=checkbox]" : "toggleSelected"
		},
		toggleSelected : function(e) {
			var checkbox = e.currentTarget;
			this.model.set(checkbox.value, checkbox.checked)
		},
		render : function() {
			var $el = this.$el.empty();
			threadviewer.ThreadState.states.forEach(function(state) {
				var $span = $("<span><input type='checkbox' value='" + state + "' />" + state + "</span>");
				$span.find("input").prop("checked", this.model.get(state));
				$el.append($span);
			}, this);
			return this.$el;
		}
	});
	
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
			this.model.forEach(function(thread) {
				$tbody.append(new ThreadView({
					model: thread,
					appModel: this.appModel
				}).render());
			}, this);
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
	
	threadviewer.ConfigView = Backbone.View.extend({
		initialize: function() {
			this.listenTo(this.model, "change:allSelected", this.render);
		},
		events: {
			"click #btn-toggle-all-selected" : "toggleAllSelected"
		},
		toggleAllSelected: function() {
			this.model.toggleAllSelected();
		},
		render: function() {
			this.$el.find("#btn-toggle-all-selected").text(this.model.get("allSelected") ? "Hide All" : "Open All");
			return this.$el;
		}
	});
	
})(window.threadviewer);	
});