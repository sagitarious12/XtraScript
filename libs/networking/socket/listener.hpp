#pragma once

#include "binder.hpp"

namespace Frame {
    class Listener : public Binder {
    public:
        Listener(int domain, int service, int protocol, int port, u_long interface, int backlog)
        : Binder(domain, service, protocol, port, interface) {
            m_backlog = backlog;
            start_listening();
            test_connection(m_listening);
        }

        void start_listening() {
            m_listening = listen(get_socket(), m_backlog);
        }
    private:
        int m_backlog, m_listening;
    };
}