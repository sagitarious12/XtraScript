#pragma once

#include "parent_parser.hpp"
#include "parse_term.hpp"

class ParseFunctionExecution {
public:
    ParseFunctionExecution(){}

    std::optional<NodeFunctionExecution*> parseNode(ParentParser* parent) {
        
        auto stmt_function_execution = parent->m_allocator.alloc<NodeFunctionExecution>();
        
        while (parent->peek(1).has_value() && parent->peek(1).value().type == TokenType::dot) {
            if (auto token = parent->try_consume(TokenType::ident)) {
                auto new_token = parent->test_import_rename(token);
                stmt_function_execution->dotNotations.push_back(new_token.value());
            }
            parent->consume();
        }

        if (auto functionName = parent->try_consume(TokenType::ident)) {
            stmt_function_execution->ident = functionName.value();
        }

        parent->try_consume(TokenType::open_paren, "Invalid Function Call, Expected '('");
        
        ParseTerm termParser;
        while (auto term = termParser.parseNode(parent)) {
            stmt_function_execution->functionParams.push_back(term.value());
            parent->try_consume(TokenType::comma);
        }

        parent->try_consume(TokenType::close_paren, "Invalid Function Call, Expected ')'");
        parent->try_consume(TokenType::semi, "Missing Semicolon at end of function call");
        
        return stmt_function_execution;
    }
};