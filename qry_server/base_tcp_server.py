# -*- encoding: utf-8 -*-

#
# 'qry_server/base_tcp_server.py'
# 
# Copyright (C) 2013 Jorge Couchet <jorge.couchet at gmail.com>
#
# This file is part of 'ted-scimu'
# 
# 'ted-scimu' is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# 'ted-scimu' is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with 'ted-scimu'.  If not, see <http ://www.gnu.org/licenses/>.
#

import SocketServer
import errno
import getopt
import os
import socket
import sys
import threading
import time

# Don't indulge clients for more than this many seconds.
# Here at maximum has 5 minutes
CLIENT_TIMEOUT = 300.0

LOG_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

class options(object):
    listen_port = None
    log_filename = None
    log_file = sys.stdout
    daemonize = True
    pid_filename = None
    safe_logging = True
    rel_folder = None
    rel_media = None


# Lock to synchronize the writing to the log file by the threads processing the client requests
# The write to log is only happening when an exception condition is ocurring. If the server is
# lucky these exception conditions will have a low frecuency, thus there is not an impact in
# the threads performance using the lock
log_lock = threading.RLock()

def log(log_file, msg):
    """
    It is writing to the log file.
    PARAMETERS:
       1. log_file: The cursor to the log file
       2. msg: The message to be written to the log file
    RETURNS:
       Nothing
    """
    log_lock.acquire()
    try:
        print >> log_file, (u"%s %s" % (time.strftime(LOG_DATE_FORMAT), msg)).encode("UTF-8")
        log_file.flush()
    finally:
        log_lock.release()

def catch_epipe(fn):
    """
    A decorator to ignore "broken pipe" errors.
    """
    def ret(self, *args):
        try:
            return fn(self, *args)
        except socket.error, e:
            try:
                err_num = e.errno
            except AttributeError:
                # Before Python 2.6, exception can be a pair.
                err_num, errstr = e
            except:
                raise
            if err_num != errno.EPIPE:
                raise
    return ret

class Handler(SocketServer.StreamRequestHandler):
    """
    The handler class for the server's threads processing the clients requests
    """
    def __init__(self, *args, **kwargs):
        self.deadline = time.time() + CLIENT_TIMEOUT
        # Buffer for the client data
        self.databuffer = ""
        # The local variable 'log_file' is loaded with the value from the server variable 'log_file'.
        SocketServer.StreamRequestHandler.__init__(self, *args, **kwargs)

    @catch_epipe
    def handle(self):
        self.connection.settimeout(self.deadline)
        while True:
            try:
                line = self.rfile.readline().strip()
                if not line:
                    msg = "ERROR:  qry_server -> base_tcp_server _handle 1: The line from the Node server was empty"
                    log(self.server.log_file, msg)
                    self.send_error(1)
                    break
            except socket.error, e:
                msg = "ERROR:  qry_server -> base_tcp_server _handle 2:" + str(e)
                log(self.server.log_file, msg)
                self.send_error(2)
                break
            if not self.handle_data(line):
                break

    def handle_data(self, line):
        """
        It is the method to be overwritten by the subclasses extending the class 'Handle'.
        """
        self.send_ok()
        return True

    def send_data(self, data):
        msg = "OK: " + data
        print >> self.wfile, msg 

    def send_error(self, err_type):
        msg = "ERR: " + err_type
        print >> self.wfile, msg


    finish = catch_epipe(SocketServer.StreamRequestHandler.finish)

class Server(SocketServer.ThreadingMixIn, SocketServer.TCPServer):
    """
    The multithreading server. It is Extending the '__init__' constructor in order to pass to the server
    the extra argument 'log_file'.
    In the handler class the 'self.server' refers to the server object, thus, any server variable is accessible 
    to the handler class as: 'self.server.server_variable_name'.
    """
    def __init__(self, server_address, RequestHandlerClass, log_file):
        # Defining the server variable 'log_file'.
        self.log_file = log_file
        # Calling the TCPServer original constructor.
        SocketServer.TCPServer.__init__(self, server_address, RequestHandlerClass)

    allow_reuse_address = True
