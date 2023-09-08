#pragma once

#include "parent_parser.hpp"

class ParseReturnType {
public:
    ParseReturnType(){}

    std::optional<NodeStatementReturnType*> parseNode(ParentParser* parent) {
        auto stmt_return_type = parent->m_allocator.alloc<NodeStatementReturnType>();

        if (auto functionType = parent->try_consume(TokenType::ident)) {
            stmt_return_type->ident = functionType.value();
        } else if (auto functionType = parent->try_consume(TokenType::void_type)) {
            stmt_return_type->ident = functionType.value();
        } else if (auto functionType = parent->try_consume(TokenType::int_type)) {
            stmt_return_type->ident = functionType.value();
        } else if (auto functionType = parent->try_consume(TokenType::string_type)) {
            stmt_return_type->ident = functionType.value();
        } else {
            return {};
        }

        return stmt_return_type;
    }
};