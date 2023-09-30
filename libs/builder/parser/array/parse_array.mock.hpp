#pragma once

#include "../../tokenize/shared.hpp"

namespace Frame {
    std::vector<Token> getArrayTokens () {
        std::vector<Token> tokens;
        Token bracket { .type = TokenType::open_bracket };
        tokens.push_back(bracket);
        Token int_lit { .type = TokenType::int_lit, .value = "12" };
        tokens.push_back(int_lit);
        Token end_bracket { .type = TokenType::close_bracket };
        tokens.push_back(end_bracket);
        return tokens;
    }

    std::vector<Token> getMultipleArray () {
        std::vector<Token> tokens;
        Token bracket { .type = TokenType::open_bracket };
        tokens.push_back(bracket);
        Token string_lit { .type = TokenType::string_lit, .value = "Hello" };
        tokens.push_back(string_lit);
        Token comma { .type = TokenType::comma };
        tokens.push_back(comma);
        Token string_lit_2 { .type = TokenType::string_lit, .value = "World" };
        tokens.push_back(string_lit_2);
        Token end_bracket { .type = TokenType::close_bracket };
        tokens.push_back(end_bracket);
        return tokens;
    }
}