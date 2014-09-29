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
	
	$.getJSON(threadviewer.rootPath + "/listthreads", function(threadDefinitions) {
		var newThreads = [];
		for (var i in threadDefinitions) {
			var threadDef = threadDefinitions[i];
			newThreads.push(new threadviewer.Thread(threadDef));
		}
		threadList.reset(newThreads);
	});
	
})(window.threadviewer);
});
