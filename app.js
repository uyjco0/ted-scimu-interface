
/**
 *
 *
 * 
 * 'app.js'
 * 
 * Copyright (C) 2013 Jorge Couchet <jorge.couchet at gmail.com>
 *
 * This file is part of 'ted-scimu'
 * 
 * 'ted-scimu' is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * 'ted-scimu' is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with 'ted-scimu'.  If not, see <http ://www.gnu.org/licenses/>.
 *
 *
 *
 *
**/

var   express = require('express')
    , app = express()
    , domain = require('domain')
    , serverDomain = domain.create()
    , http = require('http')
    , server
    , path = require('path')
    , config = require('./config')
    , routes = require('./routes');


// all environments
app.set('port', config.httpServerPort || 3000);
app.set('host', config.host || 'localhost');
app.set('env', config.env || 'development');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', config.viewsEngine || 'jade');
app.set('root_dir', __dirname);
app.set('qry_server_host', config.qry_server_host);
app.set('qry_server_port', config.qry_server_port);
app.set('scimu_media_folder', config.scimu_media_folder);
app.set('qry_amount_objects', config.qry_amount_objects);
app.use(express.favicon(path.join(__dirname, 'public/images/favicon.ico')));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


// Global error management:
// It is better to close the process here, as is said at: http://nodejs.org/api/domain.html
// **********
// Take care because it is possible not managing unexpected errors arising on 'Express':
// http://stackoverflow.com/questions/13228649/unable-to-handle-exception-with-node-js-domains-using-express
// http://stackoverflow.com/questions/15736744/connect-domain-does-not-catch-error-in-the-following-situation
// http://stackoverflow.com/questions/16763550/explicitly-adding-req-and-res-to-domain-dont-propagate-error-to-express-middlew
serverDomain.on('error', function(err) {

        try {

              console.error('ERROR: app.js -> serverDomain.on(error) 1 :', err);

              // Make sure we close down within 30 seconds
              var killtimer = setTimeout(function() {
                        process.exit(1);
                  }, 30000);

              // But don't keep the process open just for that!
              killtimer.unref();

              // Stop taking new requests
              if (typeof server != 'undefined') { server.close();}

        } catch (err2) {

                // Not much we can do at this point.
                console.error('ERROR: app.js -> serverDomain.on(error) 2 :', err2);
        }
});


// Starting the application on the scope of 'serverDomain'
serverDomain.run(function () {
	
	 // ***** LOADING THE APP ROUTES *****
         require('./routes')(app);

	// I'm using the following in order to add a separate error domain to 'req' and 'res'
        server = http.createServer(function (req, res) {

        	var reqd = domain.create();

                reqd.add(req);
                reqd.add(res);

                // On error dispose of the domain
                reqd.on('error', function (err) {

                	console.error('ERROR: app.js -> reqd.on(error) 1 :', err, req.url);

                	// The dispose method destroys a domain, and makes a best effort attempt 
                	// to clean up any and all IO that is associated with the domain. 
                	// Streams are aborted, ended, closed, and/or destroyed. 
                	// Timers are cleared. Explicitly bound callbacks are no longer called. 
                	// Any error events that are raised as a result of this are ignored
                	reqd.dispose()
        	})

        	// Pass the request to express
        	app(req, res)

        }).listen(app.get('port'), app.get('host'), function() {

        	console.log("SERVER STARTING AT PORT: " + app.get('port'));
        });
})
