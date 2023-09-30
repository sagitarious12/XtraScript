#pragma once

#include "../parent_parser.hpp"
#include "../object/parse_object.hpp"
#include "../array/parse_array.hpp"

std::optional<NodeTerm*> ParseTerm::parseNode(ParentParser* parent) {
    auto term = parent->m_allocator.alloc<NodeTerm>();

    if (auto int_lit = parent->try_consume(TokenType::int_lit)) {
        auto term_int_lit = parent->m_allocator.alloc<NodeTermIntLit>();
        term_int_lit->int_lit = int_lit.value();
        term->value = term_int_lit;
        return term;
    }

    else if (auto ident = parent->try_consume(TokenType::ident)) {
        if (ident.value().value == "undefined") {
            auto undefined = parent->m_allocator.alloc<NodeTermUndefined>();
            term->value = undefined;
            return term;
        }

        else if (ident.value().value == "null") {
            auto null = parent->m_allocator.alloc<NodeTermNull>();
            term->value = null;
            return term;
        } 

        else {
            auto expr_ident = parent->m_allocator.alloc<NodeTermIdent>();
            expr_ident->ident = ident.value();
            term->value = expr_ident;
            return term;
        }
    }

    else if (auto string_lit = parent->try_consume(TokenType::string_lit)) {
        auto term_string_lit = parent->m_allocator.alloc<NodeTermStringLit>();
        term_string_lit->string_lit = string_lit.value();
        term->value = term_string_lit;
        return term;
    } 

    else if (parent->peek().value().type == TokenType::open_brace) {
        ParseObject objectParser;
        if (auto objectLit = objectParser.parseNode(parent)) {
            term->value = objectLit.value();
        }
        return term;
    }

    else if (parent->peek().value().type == TokenType::open_bracket) {
        ParseArray arrayParser;
        if (auto arrayLit = arrayParser.parseNode(parent)) {
            term->value = arrayLit.value();
        }
        return term;
    }

    else if (auto bool_lit = parent->try_consume(TokenType::bool_lit)) {
        auto term_bool_lit = parent->m_allocator.alloc<NodeTermBooleanLit>();
        term_bool_lit->value = bool_lit.value();
        term->value = term_bool_lit;
        return term;
    }

    else {
        return {};
    }

}