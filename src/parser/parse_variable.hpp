#pragma once

#include "parent_parser.hpp"
#include "parse_return_type.hpp"
#include "checkers.hpp"
#include "parse_function_execution.hpp"
#include "parse_expression.hpp"

class ParseVariable {
public:
    ParseVariable(){}

    std::optional<NodeStatementDefinition*> parseNode(ParentParser* parent) {
        auto stmt_definition = parent->m_allocator.alloc<NodeStatementDefinition>();

        Checker checker;
        ParseReturnType returnTypeParser;

        if (auto var_type = returnTypeParser.parseNode(parent)) {
            stmt_definition->returns = var_type.value();
        }

        if (auto ident = parent->try_consume(TokenType::ident)) {
            stmt_definition->ident = ident.value();
        }

        parent->try_consume(TokenType::eq, "Invalid Variable Declaration, Expected '='");

        if (checker.is_dot_notation(parent)) {
            ParseFunctionExecution functionExecutionParser;

            if (auto stmt_function_execution = functionExecutionParser.parseNode(parent)) {
                stmt_definition->functionCall = stmt_function_execution.value();
            }

            return stmt_definition;
        } 
        
        else {
            ParseExpression expressionParser;

            if (auto expr = expressionParser.parseNode(parent)) {
                stmt_definition->expr = expr.value();
            }

            parent->try_consume(TokenType::semi, "Invalid Variable Declaration, Expected ';'");

            return stmt_definition;
        }
    }
};