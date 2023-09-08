#pragma once

#include "../parent_parser.hpp"
#include "../parse_expression.hpp"

class ParseConsoleLog {
public:
    ParseConsoleLog(){}

    std::optional<NodeStatementPrintConsole*> parseNode(ParentParser* parent) {
        auto stmt_builtin_function = parent->m_allocator.alloc<NodeStatementPrintConsole>();
        
        parent->try_consume(TokenType::ident);
        parent->try_consume(TokenType::open_paren);

        ParseExpression expressionParser;

        if (auto print_expr = expressionParser.parseNode(parent)) {
            stmt_builtin_function->expr = print_expr.value();
        }

        parent->try_consume(TokenType::close_paren, "Invalid Function Call, Expected ')'");
        parent->try_consume(TokenType::semi, "Invalid statement, Missing ';'");
        
        return stmt_builtin_function;
    }
};