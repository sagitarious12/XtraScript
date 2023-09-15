#pragma once

#include "../parent_parser.hpp"

class BinaryExpressionParser {
public:
    BinaryExpressionParser() {}

    std::optional<NodeBinaryExpression*> parseNode(
        ParentParser* parent, 
        std::variant<
            NodeBinaryExpressionAdd*,
            NodeBinaryExpressionSub*
        > nodeType,
        std::optional<
            std::variant<
                NodeTerm*,
                NodeFunctionExecution*
            >
        > term,
        ParseExpression* expressionParser
    ) {
        auto bin_expr = parent->m_allocator.alloc<NodeBinaryExpression>();
        auto lhs_expr = parent->m_allocator.alloc<NodeExpression>();
        if (std::holds_alternative<NodeTerm*>(term.value())) {
            auto real_term = std::get<NodeTerm*>(term.value());
            lhs_expr->value = real_term;
        } else if (std::holds_alternative<NodeFunctionExecution*>(term.value())) {
            auto real_term = std::get<NodeFunctionExecution*>(term.value());
            lhs_expr->value = real_term;
        }
        if (auto rhs = expressionParser->parseNode(parent)) {
            
            if (std::holds_alternative<NodeBinaryExpressionAdd*>(nodeType)) {
                auto expr = std::get<NodeBinaryExpressionAdd*>(nodeType);
                expr->lhs = lhs_expr;
                expr->rhs = rhs.value();
                bin_expr->bin_expr = expr;
                return bin_expr;
            } 
            
            else if (std::holds_alternative<NodeBinaryExpressionSub*>(nodeType)) {
                auto expr = std::get<NodeBinaryExpressionSub*>(nodeType);
                expr->lhs = lhs_expr;
                expr->rhs = rhs.value();
                bin_expr->bin_expr = expr;
                return bin_expr;
            } 

            else {
                std::cerr << "Binary Expression Not Implemented" << std::endl;
                exit(EXIT_FAILURE);
            }

        } else {
            std::cerr << "Expected Expression" << std::endl;
            exit(EXIT_FAILURE);
        }
    }
};