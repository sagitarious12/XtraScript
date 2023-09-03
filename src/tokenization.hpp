#pragma once

#include <string>
#include <vector>
#include <optional>
#include <iostream>

template <typename Enumeration>
auto as_integer(Enumeration const value)
    -> typename std::underlying_type<Enumeration>::type
{
    return static_cast<typename std::underlying_type<Enumeration>::type>(value);
};

enum class TokenType { 
    int_lit,
    string_lit,
    semi,
    open_paren, 
    close_paren,
    open_brace,
    close_brace,
    ident, 
    eq, 
    plus,
    comma,
    function_start,
    gives,
    void_type,
    int_type,
    string_type,
    returns,
    take,
    as,
    dot,
    quote,
};

std::array<std::string, 100> token_names = {
    "Integer Literal",
    "String Literal",
    "Semi Colon",
    "Open Parenthesis",
    "Close Parenthesis",
    "Open Brace",
    "Close Brace",
    "Identity",
    "Equals",
    "Plus",
    "Comma",
    "Function Start",
    "Gives",
    "Void Type",
    "Int Type",
    "String Type",
    "Return Statement",
    "Take",
    "As",
    "Dot",
    "Quote"
};


struct Token {
    TokenType type;
    std::optional<std::string> value {};
};

class Tokenizer {
public:
    inline explicit Tokenizer(std::string src)
        : m_src(std::move(src))
    {
    }

    inline std::vector<Token> tokenize()
    {
        std::vector<Token> tokens;
        std::string buf;
        while (peek().has_value()) {
            if (std::isalpha(peek().value())) {
                buf.push_back(consume());
                while (peek().has_value() && std::isalnum(peek().value())) {
                    buf.push_back(consume());
                }
                if (buf == "gives") {
                    tokens.push_back({ .type = TokenType::gives });
                    buf.clear();
                    continue;
                }
                if (buf == "Void") {
                    tokens.push_back({ .type = TokenType::void_type });
                    buf.clear();
                    continue;
                }
                if (buf == "Int") {
                    tokens.push_back({ .type = TokenType::int_type });
                    buf.clear();
                    continue;
                }
                if (buf == "String") {
                    tokens.push_back({ .type = TokenType::string_type });
                    buf.clear();
                    continue;
                }
                if (buf == "return") {
                    tokens.push_back({ .type = TokenType::returns });
                    buf.clear();
                    continue;
                }
                if (buf == "takes") {
                    tokens.push_back({ .type = TokenType::take });
                    buf.clear();
                    continue;
                }
                if (buf == "as") {
                    tokens.push_back({ .type = TokenType::as });
                    buf.clear();
                    continue;
                }
                else {
                    tokens.push_back({ .type = TokenType::ident, .value = buf });
                    buf.clear();
                    continue;
                }
            }
            else if (std::isdigit(peek().value())) {
                buf.push_back(consume());
                while (peek().has_value() && std::isdigit(peek().value())) {
                    buf.push_back(consume());
                }
                tokens.push_back({ .type = TokenType::int_lit, .value = buf });
                buf.clear();
                continue;
            }
            else if (peek().value() == '(') {
                consume();
                tokens.push_back({ .type = TokenType::open_paren });
                continue;
            }
            else if (peek().value() == ')') {
                consume();
                tokens.push_back({ .type = TokenType::close_paren });
                continue;
            }
            else if (peek().value() == '{') {
                consume();
                tokens.push_back({ .type = TokenType::open_brace });
                continue;
            }
            else if (peek().value() == '}') {
                consume();
                tokens.push_back({ .type = TokenType::close_brace });
                continue;
            }
            else if (peek().value() == ';') {
                consume();
                tokens.push_back({ .type = TokenType::semi });
                continue;
            }
            else if (peek().value() == '=') {
                consume();
                if (peek().value() == '>') {
                    consume();
                    tokens.push_back({ .type = TokenType::function_start });
                    continue;
                } else {
                    tokens.push_back({ .type = TokenType::eq });
                    continue;
                }
            }
            else if (peek().value() == '+') {
                consume();
                tokens.push_back({ .type = TokenType::plus });
                continue;
            }
            else if (peek().value() == ',') {
                consume();
                tokens.push_back({ .type = TokenType::comma });
                continue;
            }
            else if (peek().value() == '.') {
                consume();
                tokens.push_back({ .type = TokenType::dot });
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
                tokens.push_back({ .type = TokenType::string_lit, .value = buf });
                buf.clear();
                consume();
                continue;
            }
            else {
                std::cerr << "You messed up! Error Found at" << std::endl;
                std::cerr << peek().value() << std::endl;
                exit(EXIT_FAILURE);
            }
        }
        m_index = 0;
        return tokens;
    }

private:
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
};