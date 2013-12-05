
/**
 *
 *
 * 
 * 'apps/qry_client/index.js'
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

var net = require('net');

module.exports = function(app) { 

	var res = {};

	return res = {
			get_new_images: function(req, res) {

				var   server_data = ''
                                    , QRY_SERVER_HOST = app.get('qry_server_host')
                                    , QRY_SERVER_PORT = app.get('qry_server_port')
                                    , QRY_AMOUNT_OBJECTS = app.get('qry_amount_objects')
                                    , SCIMU_MEDIA_FOLDER =  app.set('scimu_media_folder')
                                    , client = new net.Socket();

				client.connect(QRY_SERVER_PORT, QRY_SERVER_HOST, function() {

					// Tell the QRY_SERVER the amount of Science Museum
                                        // objects to retrieve
					client.write(QRY_AMOUNT_OBJECTS.toString());
                                        client.write('\n');
					
					// Tell to the QRY_SERVER that there in no more data
					client.write('##END_SEND##');
					client.write('\n');
				});

				client.on('error', function(err) {

					console.log('ERROR:  apps -> qry_client -> _get_report 1 : ', err);

					res.render('error', { title: 'Ted-Scimu' });

				});

				client.on('data', function(data) {
 
					if(server_data == '') {
		
						// It is needed to use 'toString' because 'data'
                                                // could be a buffer or string	
						server_data = data.toString();
					} else {
 
						server_data = server_data + ' ' + data.toString();
					}

					server_data = server_data.replace('\n', '');
				});


				client.on('end', function() {

                                        var   images1 = []
                                            , images2 = []
                                            , sobjects = []
                                            , obj = []
					    , amount_in_row = QRY_AMOUNT_OBJECTS/2;

					if(server_data == '') {

						res.render('error', { title: 'Ted-Scimu' });

					} else {

						// First level parsing of the QRY_SERVER response
                                                sobjects = server_data.split(' ');

						// The first position in the list must be skip because has the 'OK'
						// from the server answer
						sobjects = sobjects.slice(1,sobjects.length)

						for (var i = 0; i < sobjects.length; i++) {

							// Second level parsing of the QRY_SERVER response
							obj = sobjects[i].split('<->')

                             				if (i < amount_in_row) {
								
                        					images1[i] = {
                                        			                'name': SCIMU_MEDIA_FOLDER + '/' + obj[2] + '.jpg'
                                      				              , 'modal': 'modal' + i.toString()
                                      				              , 'title': 'The relationship'
                                                                              , 'oid': obj[0]
                                      				              , 'url': obj[1]
                                      			                      , 'mid': obj[2]
 								}

                          				} else {
				
								if (i < QRY_AMOUNT_OBJECTS) {
	
                        						images2[i-amount_in_row] = {
                                        			                                     'name': SCIMU_MEDIA_FOLDER + '/' + obj[2] + '.jpg'
                                      				                                   , 'modal': 'modal' + i.toString()
                                      				                                   , 'title': 'The relationship'
                                      				                                   , 'oid': obj[0]
                                                                                                   , 'url': obj[1]
                                                                                                   , 'mid': obj[2]
                        						}
								}
                					}
						}

                				res.render('index', { title: 'Ted-Scimu', images1: images1, images2:images2 });
					}

				});	
			}
	};
}
