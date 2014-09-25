package org.everit.osgi.webconsole.threadviewer;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.felix.webconsole.AbstractWebConsolePlugin;

public class ThreadViewerServlet extends AbstractWebConsolePlugin {
    private static final long serialVersionUID = -433422756955420082L;

    @Override
    public String getLabel() {
        return "EOSGi Thread Viewer";
    }

    @Override
    public String getTitle() {
        return "Thread Viewer";
    }

    @Override
    protected void renderContent(final HttpServletRequest request, final HttpServletResponse response)
            throws ServletException,
            IOException {

    }

}
