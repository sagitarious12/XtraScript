#pragma once

#include "parent_parser.hpp"
#include "parse_return_type.hpp"
#include "parse_function_arguments.hpp"

class ParseStatementDefinition {
public:
    ParseStatementDefinition(){}

    std::optional<NodeStatementDefinition*> parseNode(ParentParser* parent) {
        auto stmt_definition = parent->m_allocator.alloc<NodeStatementDefinition>();
        ParseReturnType returnTypeParser;
        if (auto return_type = returnTypeParser.parseNode(parent)) {
            stmt_definition->returns = return_type.value();
        }
        if (auto functionName = parent->try_consume(TokenType::ident)) {
            stmt_definition->ident = functionName.value();
        }
        parent->try_consume(TokenType::function_start);
        parent->try_consume(TokenType::open_paren);
        if (parent->peek().has_value() && parent->peek().value().type != TokenType::close_paren) {
            ParseFunctionArguments functionArgumentsParser;
            while(parent->peek().has_value() && parent->peek().value().type != TokenType::close_paren) {
                if (auto functionArg = functionArgumentsParser.parseNode(parent)) {
                    stmt_definition->args.push_back(functionArg.value());
                }
                
                // comma
                if (parent->peek().value().type != TokenType::close_paren) {
                    parent->consume(); 
                }
            }
            parent->try_consume(TokenType::close_paren);
            parent->try_consume(TokenType::open_brace);
            return stmt_definition;
        } else { 
            // no function arguments
            parent->try_consume(TokenType::close_paren);
            parent->try_consume(TokenType::open_brace);
            return stmt_definition;
        }
    }
};