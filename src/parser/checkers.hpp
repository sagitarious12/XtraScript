#pragma once

#include "parent_parser.hpp"

class Checker {
public:
    Checker(){}

    bool try_parse_close_braces(ParentParser* parent) {
        if (auto close_brace = parent->try_consume(TokenType::close_brace)) {
            parent->try_consume(TokenType::semi, "Invalid Scope, Expected ';'");
            return true;
        }
        return false;
    }

    bool is_take_statement(ParentParser* parent) {
        return parent->peek().has_value() && parent->peek().value().type == TokenType::take &&
            parent->peek(1).has_value() && parent->peek(1).value().type == TokenType::string_lit &&
            parent->peek(2).has_value() && parent->peek(2).value().type == TokenType::as &&
            parent->peek(3).has_value() && parent->peek(3).value().type == TokenType::ident &&
            parent->peek(4).has_value() && parent->peek(4).value().type == TokenType::semi;
    }

    bool is_function_start(ParentParser* parent) {
        return (
                parent->peek().has_value() && (
                    parent->peek().value().type == TokenType::void_type ||
                    parent->peek().value().type == TokenType::int_type ||
                    parent->peek().value().type == TokenType::string_type ||
                    parent->peek().value().type == TokenType::ident ||
                    parent->peek().value().type == TokenType::boolean
                )
            ) &&
            parent->peek(1).has_value() && parent->peek(1).value().type == TokenType::ident &&
            parent->peek(2).has_value() && parent->peek(2).value().type == TokenType::function_start &&
            parent->peek(3).has_value() && parent->peek(3).value().type == TokenType::open_paren;
    }

    bool is_variable_declaration(ParentParser* parent) {
        return (
                (
                    parent->peek().has_value() && (
                        parent->peek().value().type == TokenType::void_type ||
                        parent->peek().value().type == TokenType::int_type ||
                        parent->peek().value().type == TokenType::string_type ||
                        parent->peek().value().type == TokenType::ident ||
                        parent->peek().value().type == TokenType::boolean
                    )
                ) &&
                parent->peek(1).has_value() && parent->peek(1).value().type == TokenType::ident &&
                (
                    parent->peek(2).has_value() && parent->peek(2).value().type == TokenType::eq ||
                    parent->peek(2).has_value() && parent->peek(2).value().type == TokenType::semi
                )
            ) ||
            (
                parent->peek(0).has_value() && parent->peek(0).value().type == TokenType::ident &&
                parent->peek(1).has_value() && parent->peek(1).value().type == TokenType::eq
            );
    }

    bool is_function_execution(ParentParser* parent) {
        return (
                parent->peek().has_value() && parent->peek().value().type == TokenType::ident &&
                parent->peek(1).has_value() && parent->peek(1).value().type == TokenType::open_paren
            ) ||
            (
                parent->peek().has_value() && parent->peek().value().type == TokenType::ident &&
                parent->peek(1).has_value() && parent->peek(1).value().type == TokenType::dot
            );
    }

    bool is_function_builtin(ParentParser* parent) {
        return parent->peek().has_value() && 
           (
                parent->peek().value().value == "printc" ||
                parent->peek().value().value == "Xtra"
            );
    }

    bool is_return_statement(ParentParser* parent) {
        return parent->peek().has_value() && parent->peek().value().type == TokenType::returns;
    }

    bool is_dot_notation(ParentParser* parent) {
        return parent->peek().has_value() && parent->peek().value().type == TokenType::ident &&
            parent->peek(1).has_value() && parent->peek(1).value().type == TokenType::dot;
    }

    bool is_function_end(ParentParser* parent) {
        return parent->peek().has_value() && parent->peek().value().type == TokenType::close_brace &&
            parent->peek(1).has_value() && parent->peek(1).value().type == TokenType::semi;
    }

    bool is_decorator(ParentParser* parent) {
        return parent->peek().has_value() && parent->peek().value().type == TokenType::hash &&
            parent->peek(1).has_value() && parent->peek(1).value().type == TokenType::ident &&
            parent->peek(2).has_value() && parent->peek(2).value().type == TokenType::open_brace;
    }

    bool is_frame_declaration(ParentParser* parent) {
        return parent->peek().has_value() && 
            parent->peek().value().type == TokenType::frame;
    }

    bool is_if_statement(ParentParser* parent) {
        return (
            parent->peek().has_value() &&
            parent->peek().value().type == TokenType::t_if
        ) || (
            parent->peek().has_value() &&
            parent->peek().value().type == TokenType::t_else
        );
    }
};