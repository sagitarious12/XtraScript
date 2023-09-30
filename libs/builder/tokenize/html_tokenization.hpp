#pragma once

#include "shared.hpp"

namespace Frame {
    class HTMLTokenizer {
    public:
        inline explicit HTMLTokenizer(std::string src)
        : m_src(src)
        {}

        inline std::vector<Frame::HTMLToken> tokenize()
        {
            while(peek().has_value()) {
                if (peek().value() == '\n') {
                    consume();
                    m_line_number++;
                    continue;
                } else if (peek().value() == '<') {
                    if (m_tokens.size() > 0 && m_tokens.at(m_tokens.size() - 1).type == Frame::HTMLTokenType::SPACE) {
                        m_tokens.pop_back();
                    }
                    addToken(Frame::HTMLTokenType::LESS_THAN);
                    consume();
                    m_in_selector = true;
                    continue;
                } else if (peek().value() == '>') {
                    addToken(Frame::HTMLTokenType::GREATER_THAN);
                    consume();
                    m_in_selector = false;
                    continue;
                } else if (peek().value() == '-') {
                    addToken(Frame::HTMLTokenType::DASH);
                    consume();
                    continue;
                } else if (peek().value() == '=') {
                    addToken(Frame::HTMLTokenType::EQUALS);
                    consume();
                    continue;
                } else if (peek().value() == '[') {
                    addToken(Frame::HTMLTokenType::OPEN_BRACKET);
                    consume();
                    continue;
                } else if (peek().value() == ']') {
                    addToken(Frame::HTMLTokenType::CLOSE_BRACKET);
                    consume();
                    continue;
                } else if (peek().value() == '(') {
                    addToken(Frame::HTMLTokenType::OPEN_PAREN);
                    consume();
                    continue;
                } else if (peek().value() == ')') {
                    addToken(Frame::HTMLTokenType::CLOSE_PAREN);
                    consume();
                    continue;
                } else if (peek().value() == '/') {
                    addToken(Frame::HTMLTokenType::BACK_SLASH);
                    consume();
                    continue;
                } else if (peek().value() == '}') {
                    addToken(Frame::HTMLTokenType::CLOSE_BRACE);
                    consume();
                    continue;
                } else if (peek().value() == '{') {
                    if (peek(1).value() == '{') {
                        addToken(Frame::HTMLTokenType::DOUBLE_OPEN_BRACE, "{{");
                        std::string buf = "";
                        consume(); consume();
                        while(peek().value() != '}') {
                            buf.push_back(consume());
                        }
                        addToken(Frame::HTMLTokenType::IDENT, buf);
                        addToken(Frame::HTMLTokenType::DOUBLE_CLOSE_BRACE, "}}");
                        consume(); consume();
                        continue;
                    } 
                    consume();
                    addToken(Frame::HTMLTokenType::OPEN_BRACE);
                    continue;
                } else if (peek().value() == '\"') {
                    addToken(Frame::HTMLTokenType::QUOTE);
                    std::string buf = "";
                    consume();
                    while(peek().value() != '\"' && peek(-1).value() != '\\') {
                        buf.push_back(consume());
                    }
                    addToken(Frame::HTMLTokenType::IDENT, buf);
                    addToken(Frame::HTMLTokenType::QUOTE);
                    consume();
                    continue;
                } else if (std::isalpha(peek().value())) {
                    std::string buf = "";
                    while(std::isalpha(peek().value())) {
                        buf.push_back(consume());
                    }
                    if (m_in_selector) {
                        if (m_tokens.at(m_tokens.size() - 1).type == Frame::HTMLTokenType::LESS_THAN) {
                            addToken(Frame::HTMLTokenType::START_SELECTOR, buf);
                        } else if (m_tokens.at(m_tokens.size() - 1).type == Frame::HTMLTokenType::BACK_SLASH) {
                            addToken(Frame::HTMLTokenType::END_SELECTOR, buf);
                        } else {
                            addToken(Frame::HTMLTokenType::ATTRIBUTE, buf);
                        }
                    } else {
                        addToken(Frame::HTMLTokenType::IDENT, buf);
                    }
                    continue;
                } else if (peek().value() == ' ') {
                    if (!m_in_selector) {
                        std::string buf = "";
                        while(peek().value() == ' ') {
                            buf.push_back(consume());
                        }
                        addToken(Frame::HTMLTokenType::SPACE, buf);
                        continue;
                    }
                    consume();
                    continue;
                } else {
                    std::cerr << "[HTML PARSE ERROR]: failed to parse character \"" << peek().value() << "\" on line number: " << m_line_number << std::endl;
                }
            }
            return m_tokens;
        }

    private:
        inline void addToken(Frame::HTMLTokenType type, std::optional<std::string> value = {}) {
            if (value.has_value()) {
                m_tokens.push_back({ .type = type, .value = value.value(), .lineNumber = m_line_number });
            } else {
                m_tokens.push_back({ .type = type, .lineNumber = m_line_number });
            }
        }

        [[nodiscard]] inline std::optional<char> peek(int offset = 0) const
        {
            if (m_index + offset >= m_src.length()) {
                return {};
            }
            else {
                return m_src.at(m_index + offset);
            }
        }

        inline char consume()
        {
            return m_src.at(m_index++);
        }

        const std::string m_src;
        size_t m_line_number = 0;
        std::vector<Frame::HTMLToken> m_tokens;
        bool m_in_selector = false;
        size_t m_index = 0;
    };
}