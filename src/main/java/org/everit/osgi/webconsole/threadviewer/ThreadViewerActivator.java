/**
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
package org.everit.osgi.webconsole.threadviewer;

import java.util.Dictionary;
import java.util.Hashtable;

import javax.servlet.Servlet;

import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceRegistration;

public class ThreadViewerActivator implements BundleActivator {

    private ServiceRegistration<Servlet> registration;

    @Override
    public void start(final BundleContext context) throws Exception {
        Dictionary<String, String> props = new Hashtable<String, String>(2);
        props.put("felix.webconsole.label", ThreadViewerServlet.THREADS_LABEL);
        registration = context.registerService(Servlet.class, new ThreadViewerServlet(), props);
    }

    @Override
    public void stop(final BundleContext context) throws Exception {
        registration.unregister();
    }

}
