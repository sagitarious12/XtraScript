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
    bool_lit,
    semi,
    open_paren, 
    close_paren,
    open_brace,
    close_brace,
    open_bracket,
    close_bracket,
    ident, 
    eq, 
    plus,
    minus,
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
    hash,
    greater_than,
    less_than,
    boolean,
    t_if,
    t_else,
    array,
    frame,
    greater_than_eq,
    less_than_eq,
    compare_eq,
    binary_and,
    binary_or,
    bitwise_and,
    bitwise_or
};

enum class HTMLTokenType {
    LESS_THAN,
    GREATER_THAN,
    IDENT,
    EQUALS,
    QUOTE,
    DASH,
    OPEN_BRACKET,
    CLOSE_BRACKET,
    OPEN_PAREN,
    CLOSE_PAREN,
    BACK_SLASH,
    OPEN_BRACE,
    CLOSE_BRACE,
    DOUBLE_OPEN_BRACE,
    DOUBLE_CLOSE_BRACE,
    SPACE,
    ATTRIBUTE,
    START_SELECTOR,
    END_SELECTOR
};

std::array<std::string, 100> token_names = {
    "Integer Literal",
    "String Literal",
    "Boolean Literal",
    "Semi Colon",
    "Open Parenthesis",
    "Close Parenthesis",
    "Open Brace",
    "Close Brace",
    "Open Bracket",
    "Close Bracket",
    "Identity",
    "Equals",
    "Plus",
    "Minus",
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
    "Quote",
    "Hash",
    "Greater Than",
    "Less Than",
    "Boolean",
    "If",
    "Else",
    "Array",
    "Frame",
    "Greater Than Or Equal To",
    "Less Than Or Equal To",
    "Comparator Equals",
    "Binary And",
    "Binary Or",
    "Bitwise And",
    "Bitwise Or"
};

std::array<std::string, 50> html_token_names = {
    "LESS THAN",
    "GREATER THAN",
    "IDENTITY",
    "EQUALS",
    "QUOTE",
    "DASH",
    "OPEN_BRACKET",
    "CLOSE_BRACKET",
    "OPEN_PAREN",
    "CLOSE_PAREN",
    "BACK_SLASH",
    "OPEN_BRACE",
    "CLOSE_BRACE",
    "DOUBLE_OPEN_BRACE",
    "DOUBLE_CLOSE_BRACE",
    "SPACE",
    "ATTRIBUTE",
    "START_SELECTOR",
    "END_SELECTOR"
};

struct Token {
    TokenType type;
    std::optional<std::string> value {};
    size_t lineNumber;
};

struct HTMLToken {
    HTMLTokenType type;
    std::optional<std::string> value {};
    size_t lineNumber;
};