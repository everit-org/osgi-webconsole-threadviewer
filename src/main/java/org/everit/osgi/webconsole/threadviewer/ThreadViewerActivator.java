package org.everit.osgi.webconsole.threadviewer;

import java.util.Dictionary;
import java.util.Hashtable;

import javax.servlet.Servlet;

import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;

public class ThreadViewerActivator implements BundleActivator {

    @Override
    public void start(final BundleContext context) throws Exception {
        Dictionary<String, String> props = new Hashtable<String, String>(2);
        props.put("felix.webconsole.label", "threads");
        context.registerService(Servlet.class, new ThreadViewerServlet(), props);
    }

    @Override
    public void stop(final BundleContext context) throws Exception {

    }

}
