#pragma once

#include "../parent_parser.hpp"
#include "../expression/parse_expression.hpp"

class ParseReturn {
public:
    ParseReturn(){}

    std::optional<NodeStatementReturn*> parseNode(ParentParser* parent) {
            auto return_expr = parent->m_allocator.alloc<NodeStatementReturn>();

            parent->try_consume(TokenType::returns);

            ParseExpression expressionParser;

            if (auto expr = expressionParser.parseNode(parent)) {
                return_expr->expr = expr.value();
            }

            parent->try_consume(TokenType::semi, "Invalid Return Statement, Expected ';'");

            return return_expr;
    }
};