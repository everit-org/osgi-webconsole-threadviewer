package org.everit.osgi.webconsole.threadviewer;

import java.io.IOException;
import java.net.URL;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.felix.webconsole.AbstractWebConsolePlugin;

public class ThreadViewerServlet extends AbstractWebConsolePlugin {
    private static final long serialVersionUID = -433422756955420082L;

    // @Override
    // protected String[] getCssReferences() {
    // return new String[] { "/thread-viewer/hello/world.css" };
    // }

    @Override
    public String getLabel() {
        return "threads";
    }

    public URL getResource(final String path) {
        System.out.println(path);
        if (path.indexOf("hello/world.js") != -1) {
            URL rval = getResourceProvider().getClass().getResource("/res/hello/world.js");
            System.out.println("returning " + rval);
            return rval;
        }
        return null;
    }

    @Override
    public String getTitle() {
        return "Thread Viewer";
    }

    @Override
    protected void renderContent(final HttpServletRequest request, final HttpServletResponse response)
            throws ServletException,
            IOException {
        Map<Thread, StackTraceElement[]> stackTraces = Thread.getAllStackTraces();
        response.getWriter().println("hello world");
        response.getWriter().println("<script src=\"/system/console/threads/hello/world.js\"></script>");
    }

}
