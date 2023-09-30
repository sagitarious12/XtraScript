#pragma once

#include "socket.hpp"

namespace Frame {
    class Binder : public Socket {
    public:
        Binder(int domain, int service, int protocol, int port, u_long interface)
        : Socket(domain, service, protocol, port, interface)
        {
            // connect to the socket
            set_connection(make_connection(get_socket(), get_address()));
            test_connection(get_connection());
        }
        Binder() = delete;

        int make_connection(int sock, struct sockaddr_in address) {
            return bind(sock, (struct sockaddr*)&address, sizeof(address));
        }
    };
}