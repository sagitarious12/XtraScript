#pragma once

#include <string>
#include <vector>
#include <iostream>

namespace Frame {

    struct HttpQueryParameters {
        std::string key;
        std::string value;
    };

    struct HttpRequestInfo {
        std::string url;
        std::vector<HttpQueryParameters> queryParams;
        std::string requestType;
    };

    struct RequestToken {
        std::string token;
    };

    class HttpRequest {
    public:
        HttpRequest() {}

        HttpRequestInfo parseRequest(char* request) {
            HttpRequestInfo info;
            auto tokens = tokenize(request);
            for(int i = 0; i < tokens.size(); i++) {
                if (tokens.at(i).token == "GET" || tokens.at(i).token == "POST") {
                    info.requestType = tokens.at(i).token;
                } else if (info.url == "" && tokens.at(i).token.size() > 0 && tokens.at(i).token.at(0) == '/') {
                    tokens.at(i).token.erase(0, 1);
                    info.url = tokens.at(i).token;
                }
            }
            return info;
        }

    private:
        std::vector<RequestToken> tokenize(std::string request) {
            std::vector<RequestToken> tokens;
            for(int i = 0; i < request.size(); i++) {
                std::string buffer;
                while(!isspace(request.at(i))) {
                    buffer += request.at(i);
                    if (i + 1 > request.size()) {
                        break;
                    }
                    i++;
                }
                RequestToken token { .token = buffer };
                tokens.push_back(token);
            }
            return tokens;
        }
    };
}