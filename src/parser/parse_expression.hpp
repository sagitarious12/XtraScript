#pragma once

#include "parent_parser.hpp"
#include "parse_term.hpp"

class ParseExpression {
public:
    ParseExpression(){}

    std::optional<NodeExpression*> parseNode(ParentParser* parent) {
        auto expr = parent->m_allocator.alloc<NodeExpression>();
        ParseTerm termParser;
        if (auto term = termParser.parseNode(parent)) {

            if (parent->try_consume(TokenType::plus).has_value()) {
                auto bin_expr = parent->m_allocator.alloc<NodeBinaryExpression>();
                auto bin_expr_add = parent->m_allocator.alloc<NodeBinaryExpressionAdd>();
                auto lhs_expr = parent->m_allocator.alloc<NodeExpression>();
                lhs_expr->value = term.value();
                bin_expr_add->lhs = lhs_expr;
                if (auto rhs = parseNode(parent)) {
                    bin_expr_add->rhs = rhs.value();
                    bin_expr->bin_expr = bin_expr_add;
                    expr->value = bin_expr;
                    return expr;
                }
                else {
                    std::cerr << "Expected expression" << std::endl;
                    exit(EXIT_FAILURE);
                }
            }

            else if (parent->try_consume(TokenType::minus).has_value()) {
                auto bin_expr = parent->m_allocator.alloc<NodeBinaryExpression>();
                auto bin_expr_sub = parent->m_allocator.alloc<NodeBinaryExpressionSub>();
                auto lhs_expr = parent->m_allocator.alloc<NodeExpression>();
                lhs_expr->value = term.value();
                bin_expr_sub->lhs = lhs_expr;
                if (auto rhs = parseNode(parent)) {
                    bin_expr_sub->rhs = rhs.value();
                    bin_expr->bin_expr = bin_expr_sub;
                    expr->value = bin_expr;
                    return expr;
                }
                else {
                    std::cerr << "Expected expression" << std::endl;
                    exit(EXIT_FAILURE);
                }
            }

            else {
                auto expr = parent->m_allocator.alloc<NodeExpression>();
                expr->value = term.value();
                return expr;
            }
        }
        else {
            return {};
        }
    }
};