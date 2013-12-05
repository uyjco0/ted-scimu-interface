
/**
 *
 *
 * 
 * 'config/index.js'
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

config = {
             'env': 'development'

           , 'httpServerPort': 3000

           , 'host': 'localhost'

           , 'viewsEngine': 'jade'

           , 'qry_server_host': '127.0.0.1'

           , 'qry_server_port': 9777

           , 'scimu_media_folder': 'gen_relationships'

           , 'qry_amount_objects': 6
}

module.exports = config;
