$(document).ready(function() {
(function(threadviewer) {
	
	
	var threadList = new threadviewer.ThreadList();
	
	var appModel = new threadviewer.ApplicationModel({
		threadList : threadList
	});
	
	var threadListView = new threadviewer.ThreadListView({
		model : threadList,
		appModel : appModel
	});
	
	var stackTraceView = new threadviewer.StackTraceView({
		appModel : appModel
	});
	
	var summaryView = new threadviewer.SummaryView({
		model: appModel,
		el: $("p.statline").get(0)
	});
	
	$("#cnt-thread-list").append(threadListView.render());
	
	appModel.refreshThreadList();
	
})(window.threadviewer);
});
