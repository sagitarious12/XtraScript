#pragma once

#include <unistd.h>
#include <cstring>

#include "server.hpp"
#include "../../logger.hpp"
#include "../../builder/file_reader.hpp"
#include "http-request.hpp"

namespace Frame {
    class FrameServer : public Server, Logger {
    public:
        FrameServer() 
        : Server(AF_INET, SOCK_STREAM, 0, 4400, INADDR_ANY, 10) {
            launch();
        }
        ~FrameServer() {}

        void launch() {
            Info("LISTENING");

            while(true) {
                acceptor();
                handler();
                responder();
            }
        }
    private:
        void acceptor () {
            struct sockaddr_in address = get_address();
            int addr_len = sizeof(address);

            m_socket = accept(get_socket(), (struct sockaddr*)&address, (socklen_t*)&addr_len);
            read(m_socket, m_buffer, 30000);
        }

        void handler() {
            m_current_request = m_http_request.parseRequest(m_buffer);
            Trace("Incoming Request For File: '" + m_current_request.url + "'");
        }

        void responder() {
            std::string contentType = "text/html";
            Files file_reader;
            if (m_current_request.url != "" && !isFilePath()) {
                if (m_current_request.url == "favicon.ico") {
                    m_path = "index.html";
                } else {
                    contentType = "text/javascript";
                    m_path = m_current_request.url;
                }
            }
            std::string response = file_reader.read_file(m_path.c_str());

            
            std::string serverMessage = "HTTP/1.1 200 OK\nContent-Type: " + contentType + "\nContent-Length: ";

            serverMessage.append(std::to_string(response.size()));
            serverMessage.append("\n\n");
            serverMessage.append(response);

            int bytesSent = 0;
            int totalBytesSent = 0;

            while(bytesSent < serverMessage.size()) {
                bytesSent = send(m_socket, serverMessage.c_str(), serverMessage.size(), 0);
                if (bytesSent < 0) {
                    Error("Could Not Send Response");
                }
                totalBytesSent += bytesSent;
            }
            close(m_socket);
        }

        bool isFilePath() {
            if (m_current_request.url.find_first_of('.') == std::string::npos) {
                return true;
            }
            return false;
        }

        char m_buffer[30000] = {0};
        int m_socket;
        std::string m_path = "index.html";
        HttpRequest m_http_request;
        HttpRequestInfo m_current_request;
    };
}