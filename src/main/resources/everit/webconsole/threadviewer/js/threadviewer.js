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

	if (typeof(Storage) !== undefined) {
		threadviewer.localStorage = window.localStorage;
	} else {
		threadviewer.localStorage = {
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
	
	new threadviewer.SummaryView({
		model: appModel,
		el: $("p.statline").get(0)
	});
	
	new threadviewer.ConfigView({
		model: appModel,
		el: document.getElementById("cnt-config")
	}).render();
	
	new threadviewer.ThreadStateFilterView({
		model: threadStateFilter,
		el: document.getElementById("cnt-thread-state-filter") 
	}).render();
	
	
	$("#cnt-thread-list").append(threadListView.render());
	
	Backbone.history.start({
		pushState: true,
		root: threadviewer.rootPath
	});
	
	appModel.refreshThreadList();
	
})(window.threadviewer);
});
