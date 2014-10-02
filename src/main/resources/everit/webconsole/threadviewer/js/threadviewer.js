$(document).ready(function() {
(function(threadviewer) {

	var localStorage;
	if (typeof(Storage) !== undefined) {
		localStorage = threadviewer.localStorage = window.localStorage;
	} else {
		localStorage = threadviewer.localStorage = {
			getItem : function() { return null; },
			setItem: function(key, value) {}
		}
	}
	
	var ThreadviewerRouter = Backbone.Router.extend({
		routes: {
			":threadIdList" : "displayThreads"
		}
	});
	threadviewer.router = new ThreadviewerRouter();
	
	var threadStateFilter = new threadviewer.ThreadState();
	
	var threadList = new threadviewer.ThreadList();
	
	var filteredThreadList = new threadviewer.ThreadList();
	
	var appModel = new threadviewer.ApplicationModel({
		threadList : threadList,
		filteredThreadList : filteredThreadList,  
		threadStateFilter : threadStateFilter
	});
	
	var threadListView = new threadviewer.ThreadListView({
		model : filteredThreadList,
		appModel : appModel
	});
	
	var stackTraceView = new threadviewer.StackTraceView({
		appModel : appModel
	});
	
	var summaryView = new threadviewer.SummaryView({
		model: appModel,
		el: $("p.statline").get(0)
	});
	
	var configView = new threadviewer.ConfigView({
		model: appModel,
		el: $("#cnt-config").get(0)
	});
	configView.render();
	
	var threadStateFilterView = new threadviewer.ThreadStateFilterView({
		model: threadStateFilter,
		el: $("#cnt-thread-state-filter").get(0) 
	});
	threadStateFilterView.render();
	
	
	$("#cnt-thread-list").append(threadListView.render());
	
	Backbone.history.start({
		pushState: true,
		root: threadviewer.rootPath
	});
	
	appModel.refreshThreadList();
	
})(window.threadviewer);
});
