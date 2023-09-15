#pragma once

#include "../parent_parser.hpp"
#include "parse_term.hpp"
#include "parse_binary_expression.hpp"
#include "../statement/parse_function_execution.hpp"


std::optional<NodeExpression*> ParseExpression::parseNode(ParentParser* parent) {
    auto expr = parent->m_allocator.alloc<NodeExpression>();
    ParseTerm termParser;
    ParseFunctionExecution functionExecutionParser;
    if (parent->peek().has_value() && parent->peek(1).has_value() && parent->peek(1).value().type == TokenType::dot) {
        auto function = functionExecutionParser.parseNode(parent);
        return parseExpression(parent, expr, function);
    } else if (auto term = termParser.parseNode(parent)) {
        return parseExpression(parent, expr, term);
    }
    else {
        return {};
    }
}

NodeExpression* ParseExpression::parseExpression(
    ParentParser* parent, 
    NodeExpression* expr, 
    std::optional<
        std::variant<
            NodeTerm*, 
            NodeFunctionExecution*
        >
    > term
) {
    if (parent->try_consume(TokenType::plus).has_value()) {
        auto bin_expr_add = parent->m_allocator.alloc<NodeBinaryExpressionAdd>();
        BinaryExpressionParser binaryParser;
        if (auto binary = binaryParser.parseNode(parent, bin_expr_add, term, this)) {
            expr->value = binary.value();
        }
        return expr;
    }

    else if (parent->try_consume(TokenType::minus).has_value()) {
        auto bin_expr_sub = parent->m_allocator.alloc<NodeBinaryExpressionSub>();
        BinaryExpressionParser binaryParser;
        if (auto binary = binaryParser.parseNode(parent, bin_expr_sub, term, this)) {
            expr->value = binary.value();
        }
        return expr;
    }

    else {
        if (std::holds_alternative<NodeTerm*>(term.value())) {
            expr->value = std::get<NodeTerm*>(term.value());
        } else if (std::holds_alternative<NodeFunctionExecution*>(term.value())) {
            expr->value = std::get<NodeFunctionExecution*>(term.value());
        }
        return expr;
    }
}