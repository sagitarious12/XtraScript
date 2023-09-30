#pragma once

#include "../parent_parser.hpp"
#include "parse_return_type.hpp"
#include "../checkers.hpp"
#include "parse_function_execution.hpp"
#include "../expression/parse_expression.hpp"

namespace Frame {
    class ParseVariable {
    public:
        ParseVariable(){}

        std::optional<NodeStatementDefinition*> parseNode(ParentParser* parent) {
            auto stmt_definition = parent->m_allocator.alloc<NodeStatementDefinition>();

            Checker checker;
            ParseReturnType returnTypeParser;

            bool hasSetVariableIdentity = false;

            if (auto var_type = returnTypeParser.parseNode(parent)) {
                if (parent->peek().value().type == TokenType::eq) {
                    hasSetVariableIdentity = true;
                    stmt_definition->ident = var_type.value()->ident;
                } else {
                    stmt_definition->returns = var_type.value();
                }
            }

            if (!hasSetVariableIdentity) {
                if (auto ident = parent->try_consume(TokenType::ident)) {
                    stmt_definition->ident = ident.value();
                }
            }

            if (!parent->try_consume(TokenType::semi)) {
                parent->try_consume(TokenType::eq, "Invalid Variable Declaration, Expected '='");
            
                ParseExpression expressionParser;

                if (auto expr = expressionParser.parseNode(parent)) {
                    stmt_definition->expr = expr.value();
                }

                parent->try_consume(TokenType::semi, "Invalid Variable Declaration, Expected ';'");

                return stmt_definition;
            } else {
                return stmt_definition;
            }
        }
    };
}