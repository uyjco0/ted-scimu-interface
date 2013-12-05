
/**
 *
 *
 * 
 * 'routes/index.js'
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

module.exports = function(app){

	var qry_client = require(app.get('root_dir') + '/apps/qry_client')(app)
            fs = require('fs');

	// It is defining the route associated with the application 'root' (the '/').
        app.get('/', qry_client.get_new_images);

        // It is defining the route to process the contact form
        app.post('/contact', function(req, res) {

		var   contact_name = ''
                    , contact_mail = ''
                    , contact_msg = '';

		if (req.body.contact_name.length > 0) {
			contact_name = req.body.contact_name[0]
                }

		if (req.body.contact_mail.length > 0) {
                        contact_mail = req.body.contact_mail[0]
                }

		if (req.body.contact_msg.length > 0) {
                        contact_msg = req.body.contact_msg[0]
                }

		// Free the user and show her/him some beautiful images
		res.redirect('/');

		// Writing the contact data to disk, database, etc.
		if (contact_mail != '') {
			fs.writeFile(app.get('root_dir') + '/msgs/' + contact_mail + '.txt', 'Name: ' + contact_name + ' *** ' + 'Msg: ' + contact_msg)
		}
			
        });

} // The anonymous function exported
