#pragma once

#include <sys/socket.h>
#include <netinet/in.h>

#include "../../logger.hpp"

namespace Frame {
    class Socket : public Logger {
    public:
        Socket(int domain, int service, int protocol, int port, u_long interface)
        :   m_domain(domain), 
            m_service(service), 
            m_protocol(protocol) {
                // make socket connection
                m_socket = socket(m_domain, m_service, m_protocol);
                test_connection(m_socket);

                // define address information
                m_addr.sin_family = domain;
                m_addr.sin_port = htons(port);
                m_addr.sin_addr.s_addr = htonl(interface);
        }
        ~Socket() {}
        Socket() = delete;

        virtual int make_connection(int sock, struct sockaddr_in address) = 0;

        void test_connection(int item) {
            if (item < 0) {
                Error("Failed To Connect");
                exit(EXIT_FAILURE);
            }
        }

        struct sockaddr_in get_address() {
            return m_addr;
        }

        int get_socket() {
            return m_socket;
        }

        int get_connection() {
            return m_connection;
        }

        void set_connection(int connection) {
            m_connection = connection;
        }
    private:
        int m_domain, m_service, m_protocol, m_socket, m_connection;
        struct sockaddr_in m_addr;
    };
}