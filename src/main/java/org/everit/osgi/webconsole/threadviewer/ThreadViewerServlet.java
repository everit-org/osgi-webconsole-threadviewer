package org.everit.osgi.webconsole.threadviewer;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.felix.webconsole.AbstractWebConsolePlugin;
import org.json.JSONWriter;

public class ThreadViewerServlet extends AbstractWebConsolePlugin {
    private static final long serialVersionUID = -433422756955420082L;

    public static final String THREADS_LABEL = "threads";

    private static final Set<String> loadableJavascriptFiles = new HashSet<String>(Arrays.asList(
            "app/models.js",
            "app/views.js",
            "threadviewer.js",
            "backbone.js",
            "underscore-min.js"
            ));

    @Override
    public String getLabel() {
        return THREADS_LABEL;
    }

    public URL getResource(final String path) {
        for (String jsFile : loadableJavascriptFiles) {
            if (path.endsWith(jsFile)) {
                return getResourceProvider().getClass().getResource("/everit/webconsole/threadviewer/js/" + jsFile);
            }
        }
        return null;
    }

    @Override
    public String getTitle() {
        return "Thread Viewer";
    }

    @Override
    protected boolean isHtmlRequest(final HttpServletRequest request) {
        return request.getHeader("Accept").indexOf("application/json") == -1;
    }

    private String loadTemplate(final String path, final Map<String, String> templateVars) {
        try {
            InputStream inputStream = getResourceProvider().getClass().getResourceAsStream(path);
            BufferedReader buffInputStream = new BufferedReader(new InputStreamReader(inputStream));
            String line;
            StringBuilder buffer = new StringBuilder();
            while ((line = buffInputStream.readLine()) != null) {
                buffer.append(line);
            }
            String rval = buffer.toString();
            return resolveVariables(rval, templateVars);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    protected void renderContent(final HttpServletRequest request, final HttpServletResponse response)
            throws ServletException,
            IOException {
        String pathInfo = request.getPathInfo();
        if (pathInfo.equals("/" + THREADS_LABEL)) {
            Map<String, String> templateVars = new HashMap<String, String>(1);
            templateVars.put("rootPath", request.getAttribute("felix.webconsole.pluginRoot").toString());
            response.getWriter().println(loadTemplate("/everit/webconsole/threadviewer/template.html", templateVars));
        } else if (pathInfo.endsWith("listthreads")) {
            response.setHeader("Content-Type", "application/json");
            writeThreadsToJSON(Thread.getAllStackTraces(), new JSONWriter(response.getWriter()));
        } else if (pathInfo.indexOf("interrupt") > -1) {
            response.setHeader("Content-Type", "application/json");
            long threadId = Long.parseLong(pathInfo.substring(pathInfo.lastIndexOf('/') + 1));
            Thread.getAllStackTraces().keySet().stream()
            .filter((thread) -> thread.getId() == threadId)
            .findAny().ifPresent((thread) -> thread.interrupt());
            writeThreadsToJSON(Thread.getAllStackTraces(), new JSONWriter(response.getWriter()));
        }
    }

    private String resolveVariables(String rval, final Map<String, String> templateVars) {
        for (String var : templateVars.keySet()) {
            String value = templateVars.get(var);
            rval = rval.replaceAll("\\$\\{" + var + "\\}", value);
        }
        return rval;
    }

    private void writeStackTraceToJSON(final JSONWriter writer, final StackTraceElement[] stackTrace) {
        writer.key("stackTrace");
        writer.array();
        for (StackTraceElement method : stackTrace) {
            writer.object();
            writer.key("className");
            writer.value(method.getClassName());
            writer.key("methodName");
            writer.value(method.getMethodName());
            writer.key("lineNumber");
            writer.value(method.getLineNumber());
            writer.key("description");
            writer.value(method.toString());
            writer.endObject();
        }
        writer.endArray();
    }

    private void writeThreadsToJSON(final Map<Thread, StackTraceElement[]> stackTraces, final JSONWriter writer) {
        writer.array();
        List<Thread> threads = new ArrayList<Thread>(stackTraces.keySet());
        Collections.sort(threads, (t1, t2) -> (int) (t1.getId() - t2.getId()));
        for (Thread thread : threads) {
            writer.object();
            writer.key("id");
            writer.value(thread.getId());
            writer.key("name");
            writer.value(thread.getName());
            writer.key("state");
            writer.value(thread.getState().toString());
            writeStackTraceToJSON(writer, stackTraces.get(thread));
            writer.endObject();
        }
        writer.endArray();
    }
}
