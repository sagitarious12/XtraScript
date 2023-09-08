#pragma once

#include "parent_parser.hpp"

class ParseTerm {
public:
    ParseTerm(){}

    std::optional<NodeTerm*> parseNode(ParentParser* parent) {
        auto term = parent->m_allocator.alloc<NodeTerm>();

        if (auto int_lit = parent->try_consume(TokenType::int_lit)) {
            auto term_int_lit = parent->m_allocator.alloc<NodeTermIntLit>();
            term_int_lit->int_lit = int_lit.value();
            term->value = term_int_lit;
            return term;
        }

        else if (auto ident = parent->try_consume(TokenType::ident)) {
            auto expr_ident = parent->m_allocator.alloc<NodeTermIdent>();
            expr_ident->ident = ident.value();
            term->value = expr_ident;
            return term;
        }

        else if (auto string_lit = parent->try_consume(TokenType::string_lit)) {
            auto term_string_lit = parent->m_allocator.alloc<NodeTermStringLit>();
            term_string_lit->string_lit = string_lit.value();
            term->value = term_string_lit;
            return term;
        }

        else {
            return {};
        }

    }
};