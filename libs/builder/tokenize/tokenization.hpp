#pragma once

#include "shared.hpp"

namespace Frame {
    class Tokenizer {
    public:
        inline explicit Tokenizer(std::string src)
            : m_src(std::move(src))
        {
        }

        inline std::vector<Token> tokenize()
        {
            std::string buf;
            while (peek().has_value()) {
                if (peek().value() == '\n') {
                    this->m_line_number++;
                    consume();
                    continue;
                } else if (std::isalpha(peek().value())) {
                    buf.push_back(consume());
                    while (peek().has_value() && std::isalnum(peek().value())) {
                        buf.push_back(consume());
                    }
                    if (buf == "gives") {
                        this->addToken(TokenType::gives);
                        buf.clear();
                        continue;
                    }
                    if (buf == "Void") {
                        this->addToken(TokenType::void_type);
                        buf.clear();
                        continue;
                    }
                    if (buf == "Int") {
                        this->addToken(TokenType::int_type);
                        buf.clear();
                        continue;
                    }
                    if (buf == "String") {
                        this->addToken(TokenType::string_type);
                        buf.clear();
                        continue;
                    }
                    if (buf == "return") {
                        this->addToken(TokenType::returns);
                        buf.clear();
                        continue;
                    }
                    if (buf == "takes") {
                        this->addToken(TokenType::take);
                        buf.clear();
                        continue;
                    }
                    if (buf == "as") {
                        this->addToken(TokenType::as);
                        buf.clear();
                        continue;
                    }
                    if (buf == "Bool") {
                        this->addToken(TokenType::boolean);
                        buf.clear();
                        continue;
                    }
                    if (buf == "if") {
                        this->addToken(TokenType::t_if);
                        buf.clear();
                        continue;
                    }
                    if (buf == "else") {
                        this->addToken(TokenType::t_else);
                        buf.clear();
                        continue;
                    }
                    if (buf == "Array") {
                        this->addToken(TokenType::array);
                        buf.clear();
                        continue;
                    }
                    if (buf == "frame") {
                        this->addToken(TokenType::frame);
                        buf.clear();
                        continue;
                    }
                    if (buf == "true" || buf == "false") {
                        this->addToken(TokenType::bool_lit, buf);
                        buf.clear();
                        continue;
                    }
                    else {
                        this->addToken(TokenType::ident, buf);
                        buf.clear();
                        continue;
                    }
                }
                else if (std::isdigit(peek().value())) {
                    buf.push_back(consume());
                    while (peek().has_value() && std::isdigit(peek().value())) {
                        buf.push_back(consume());
                    }
                    this->addToken(TokenType::int_lit, buf);
                    buf.clear();
                    continue;
                }
                else if (peek().value() == '(') {
                    consume();
                    this->addToken(TokenType::open_paren);
                    continue;
                }
                else if (peek().value() == ')') {
                    consume();
                    this->addToken(TokenType::close_paren);
                    continue;
                }
                else if (peek().value() == '{') {
                    consume();
                    this->addToken(TokenType::open_brace);
                    continue;
                }
                else if (peek().value() == '}') {
                    consume();
                    this->addToken(TokenType::close_brace);
                    continue;
                }
                else if (peek().value() == ';') {
                    consume();
                    this->addToken(TokenType::semi);
                    continue;
                }
                else if (peek().value() == '=') {
                    consume();
                    if (peek().value() == '>') {
                        consume();
                        this->addToken(TokenType::function_start);
                        continue;
                    }
                    if (peek().value() == '=') {
                        consume();
                        this->addToken(TokenType::compare_eq);
                        continue;
                    }
                    this->addToken(TokenType::eq);
                    continue;
                }
                else if (peek().value() == '+') {
                    consume();
                    this->addToken(TokenType::plus);
                    continue;
                }
                else if (peek().value() == ',') {
                    consume();
                    this->addToken(TokenType::comma);
                    continue;
                }
                else if (peek().value() == '.') {
                    consume();
                    this->addToken(TokenType::dot);
                    continue;
                }
                else if (std::isspace(peek().value())) {
                    consume();
                    continue;
                }
                else if (peek().value() == '\"') {
                    consume();
                    while(peek().has_value() && peek().value() != '\"') {
                        buf.push_back(consume());
                        if (!peek().has_value()) {
                            std::cerr << "No closing quote found" << std::endl;
                            exit(EXIT_FAILURE);
                        }
                    } 
                    this->addToken(TokenType::string_lit, buf);
                    buf.clear();
                    consume();
                    continue;
                }
                else if (peek().value() == '-') {
                    consume();
                    this->addToken(TokenType::minus);
                    continue;
                }
                else if (peek().value() == '[') {
                    consume();
                    this->addToken(TokenType::open_bracket);
                    continue;
                }
                else if (peek().value() == ']') {
                    consume();
                    this->addToken(TokenType::close_bracket);
                    continue;
                }
                else if (peek().value() == '>') {
                    consume();
                    if (peek().value() == '=') {
                        consume();
                        this->addToken(TokenType::greater_than_eq);
                        continue;
                    }
                    this->addToken(TokenType::greater_than);
                    continue;
                }
                else if (peek().value() == '<') {
                    consume();
                    if (peek().value() == '=') {
                        consume();
                        this->addToken(TokenType::less_than_eq);
                        continue;
                    }
                    this->addToken(TokenType::less_than);
                    continue;
                }
                else if (peek().value() == '/') {
                    consume();
                    if (peek().value() == '/') {
                        while(peek().value() != '\n') {
                            consume();
                        }
                    }
                    continue;
                }
                else if (peek().value() == '#') {
                    consume();
                    this->addToken(TokenType::hash);
                    continue;
                }
                else if (peek().value() == '&') {
                    consume();
                    if (peek().value() == '&') {
                        consume();
                        this->addToken(TokenType::binary_and);
                        continue;
                    }
                    this->addToken(TokenType::bitwise_and);
                    continue;
                }
                else if (peek().value() == '|') {
                    consume();
                    if (peek().value() == '|') {
                        consume();
                        this->addToken(TokenType::binary_or);
                        continue;
                    }
                    this->addToken(TokenType::bitwise_or);
                    continue;
                }
                else {
                    std::cerr << "You messed up! Error Found at" << std::endl;
                    std::cerr << peek().value() << std::endl;
                    exit(EXIT_FAILURE);
                }
            }
            m_index = 0;
            return this->m_tokens;
        }

    private:
        inline void addToken(TokenType type, std::optional<std::string> value = {}) {
            if (value.has_value()) {
                this->m_tokens.push_back({ .type = type, .value = value.value(), .lineNumber = this->m_line_number });
            } else {
                this->m_tokens.push_back({ .type = type, .lineNumber = this->m_line_number });
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
        size_t m_index = 0;
        size_t m_line_number = 0;
        
        std::vector<Token> m_tokens;
    };
}