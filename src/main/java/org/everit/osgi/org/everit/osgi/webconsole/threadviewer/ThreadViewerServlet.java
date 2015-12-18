/*
 * Copyright (C) 2015 Everit Kft. (http://www.everit.org)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.everit.osgi.org.everit.osgi.webconsole.threadviewer;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.io.Serializable;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.Servlet;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.everit.expression.ExpressionCompiler;
import org.everit.expression.ParserConfiguration;
import org.everit.expression.jexl.JexlExpressionCompiler;
import org.everit.templating.CompiledTemplate;
import org.everit.templating.TemplateCompiler;
import org.everit.templating.html.HTMLTemplateCompiler;
import org.everit.templating.text.TextTemplateCompiler;
import org.osgi.framework.BundleContext;
import org.osgi.framework.wiring.BundleWiring;
import org.osgi.service.metatype.MetaTypeProvider;

/**
 * The WebConsole plugin servlet class.
 */
public class ThreadViewerServlet implements Servlet {

  /**
   * Comparator that compares threads based on their ids.
   */
  private static final class ThreadComparator implements Comparator<Thread>, Serializable {
    private static final long serialVersionUID = 1L;

    @Override
    public int compare(final Thread o1, final Thread o2) {
      return (int) (o1.getId() - o2.getId());
    }
  }

  private static final String FRAGMENT_CONTENT = "content";

  private static final int HTTP_NOT_FOUND = 404;

  private static final ThreadComparator THREAD_COMPARATOR = new ThreadComparator();

  private final ClassLoader classLoader;

  private final CompiledTemplate componentsTemplate;

  private ServletConfig config;

  /**
   * Constructor of ThreadViewerServlet that compiles the HTML template.
   */
  public ThreadViewerServlet(final BundleContext bundleContext) {
    classLoader = bundleContext.getBundle().adapt(BundleWiring.class).getClassLoader();

    ExpressionCompiler expressionCompiler = new JexlExpressionCompiler();

    TextTemplateCompiler textTemplateCompiler = new TextTemplateCompiler(expressionCompiler);

    Map<String, TemplateCompiler> inlineCompilers = new HashMap<String, TemplateCompiler>();
    inlineCompilers.put("text", textTemplateCompiler);

    HTMLTemplateCompiler htmlTemplateCompiler = new HTMLTemplateCompiler(expressionCompiler,
        inlineCompilers);

    ParserConfiguration parserConfiguration = new ParserConfiguration(classLoader);

    Map<String, Class<?>> variableTypes = new HashMap<String, Class<?>>();
    variableTypes.put("mp", MetaTypeProvider.class);
    parserConfiguration.setVariableTypes(variableTypes);

    componentsTemplate = htmlTemplateCompiler.compile(
        readResource("META-INF/webcontent/threadviewer.html"),
        parserConfiguration);

  }

  @Override
  public void destroy() {
  }

  private Thread findThreadWithId(final long threadId) {
    List<Thread> threads = getThreads();
    Thread result = null;
    for (Iterator<Thread> iterator = threads.iterator(); iterator.hasNext() && result == null;) {
      Thread thread = iterator.next();
      if (thread.getId() == threadId) {
        result = thread;
      }
    }
    return result;
  }

  @Override
  public ServletConfig getServletConfig() {
    return config;
  }

  @Override
  public String getServletInfo() {
    return "ThreadViewer";
  }

  private List<Thread> getThreads() {
    Map<Thread, StackTraceElement[]> stackTraces = Thread.getAllStackTraces();
    List<Thread> threads = new ArrayList<Thread>(stackTraces.keySet());
    return threads;
  }

  @Override
  public void init(final ServletConfig pConfig) throws ServletException {
    this.config = pConfig;

  }

  private String readResource(final String resourceName) {
    InputStream inputStream = classLoader.getResourceAsStream(resourceName);
    final int bufferSize = 1024;
    byte[] buf = new byte[bufferSize];
    try {
      int r = inputStream.read(buf);
      ByteArrayOutputStream bout = new ByteArrayOutputStream();
      while (r > -1) {
        bout.write(buf, 0, r);
        r = inputStream.read(buf);
      }
      return new String(bout.toByteArray(), Charset.forName("UTF8"));
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public void service(final ServletRequest req, final ServletResponse resp)
      throws ServletException, IOException {

    HttpServletRequest httpReq = (HttpServletRequest) req;
    HttpServletResponse httpResp = (HttpServletResponse) resp;

    httpResp.setContentType("text/html");

    PrintWriter writer = httpResp.getWriter();

    String appRoot = (String) httpReq.getAttribute("felix.webconsole.appRoot");
    String pluginRoot = (String) httpReq.getAttribute("felix.webconsole.pluginRoot");

    String requestURI = httpReq.getRequestURI();

    Map<String, Object> vars = new HashMap<String, Object>();
    vars.put("appRoot", appRoot);
    vars.put("pluginRoot", pluginRoot);

    if (requestURI.equals(pluginRoot)) {
      List<Thread> threads = getThreads();
      Collections.sort(threads, THREAD_COMPARATOR);
      vars.put("threads", threads);
      componentsTemplate.render(writer, vars, FRAGMENT_CONTENT);
    } else if (requestURI.replace(pluginRoot + '/', "").length() > 0) {
      try {
        long threadId = Long.parseLong(requestURI.replace(pluginRoot + "/", ""));
        Thread thread = findThreadWithId(threadId);
        if (thread != null) {
          vars.put("thread", thread);
          componentsTemplate.render(writer, vars, "threadDetails");
        } else {
          httpResp.sendRedirect(pluginRoot);
        }
      } catch (NumberFormatException e) {
        httpResp.sendRedirect(pluginRoot);
      }
    } else {
      httpResp.setStatus(HTTP_NOT_FOUND);
      return;
    }
  }

}
