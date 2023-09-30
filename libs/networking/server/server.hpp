#pragma once

#include "../socket/listener.hpp"

namespace Frame {
    class Server {
    public:
        Server(int domain, int service, int protocol, int port, u_long interface, int backlog) {
            m_listener = new Listener(domain, service, protocol, port, interface, backlog);
        }
        Server() = delete;
        ~Server () {
            delete m_listener;
        }

        virtual void launch() = 0;

        int get_socket() {
            return m_listener->get_socket();
        }

        struct sockaddr_in get_address() {
            return m_listener->get_address();
        }

    private:
        virtual void acceptor() = 0;
        virtual void handler() = 0;
        virtual void responder() = 0;

        Listener* m_listener;
    };
}