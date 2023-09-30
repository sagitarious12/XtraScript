#pragma once

#include "../../parent_parser.hpp"

namespace Frame {
    class ParseIf {
    public:
        ParseIf() {}

        std::optional<NodeStatementIf*> parseIf(ParentParser* parent) {
            auto t_if = parent->m_allocator.alloc<NodeStatementIf>();

            parent->try_consume(TokenType::open_paren, "Missing If Statement Conditional Open Parenthesis");

            if (auto conditional = parseConditional(parent, t_if)) {
                return std::get<NodeStatementIf*>(conditional.value());
            }

            return {};
        }

        std::optional<NodeStatementElseIf*> parseElseIf(ParentParser* parent) {
            auto elseIf = parent->m_allocator.alloc<NodeStatementElseIf>();

            parent->try_consume(TokenType::open_paren, "Missing If Statement Conditional Open Parenthesis");

            if (auto conditional = parseConditional(parent, elseIf)) {
                return std::get<NodeStatementElseIf*>(conditional.value());
            }

            return {};
        }

        std::optional<NodeStatementElse*> parseElse(ParentParser* parent) {
            auto t_else = parent->m_allocator.alloc<NodeStatementElse>();
            
            parent->try_consume(TokenType::open_brace);

            ParseStatement statementParser;
            while(parent->peek().value().type != TokenType::close_brace) {
                auto statement = std::make_unique<ParseStatement>();
                if (auto stmt = statement.get()->parseNode(parent)) {
                    if (auto discard = std::holds_alternative<NodeDiscard*>(stmt.value()->value)) {
                        continue;
                    }
                    t_else->stmts.push_back(stmt.value());
                }
                else {
                    std::cerr << "Invalid statement on line: " << parent->peek().value().lineNumber + 1 << std::endl;
                    std::cerr << "Invalid " << token_names.at(as_integer(parent->peek().value().type)) << std::endl;
                    exit(EXIT_FAILURE);
                }
            }
            parent->try_consume(TokenType::close_brace, "Missing If Statement Closing Brace");

            return t_else;
        }

    private:

        std::optional<
            std::variant<
                NodeStatementIf*, 
                NodeStatementElseIf*
            >
        > parseConditional(
            ParentParser* parent,
            std::variant<
                NodeStatementIf*, 
                NodeStatementElseIf*
            > node
        ) {

            while(parent->peek().value().type != TokenType::close_paren) {
                if (auto condition = parseConditions(parent)) {
                    if (std::holds_alternative<NodeStatementIf*>(node)) {
                        std::get<NodeStatementIf*>(node)->conditions.push_back(condition.value());
                    } else {
                        std::get<NodeStatementElseIf*>(node)->conditions.push_back(condition.value());
                    }
                } else {
                    std::cerr << "If Statement Malformed" << std::endl;
                    exit(EXIT_FAILURE);
                }
            }

            parent->consume();
            parent->try_consume(TokenType::open_brace);

            ParseStatement statementParser;
            while(parent->peek().value().type != TokenType::close_brace) {
                auto statement = std::make_unique<ParseStatement>();
                if (auto stmt = statement.get()->parseNode(parent)) {
                    if (auto discard = std::holds_alternative<NodeDiscard*>(stmt.value()->value)) {
                        continue;
                    }
                    if (std::holds_alternative<NodeStatementIf*>(node)) {
                        std::get<NodeStatementIf*>(node)->stmts.push_back(stmt.value());
                    } else {
                        std::get<NodeStatementElseIf*>(node)->stmts.push_back(stmt.value());
                    }
                }
                else {
                    std::cerr << "Invalid statement on line: " << parent->peek().value().lineNumber + 1 << std::endl;
                    std::cerr << "Invalid " << token_names.at(as_integer(parent->peek().value().type)) << std::endl;
                    exit(EXIT_FAILURE);
                }
            }
            parent->try_consume(TokenType::close_brace, "Missing If Statement Closing Brace");
            return node;
        }

        std::optional<NodeConditional*> parseConditions(ParentParser* parent) {
            auto conditional = parent->m_allocator.alloc<NodeConditional>();

            ParseExpression expressionParser;
            if (auto left = expressionParser.parseNode(parent)) {
                conditional->lhs = left.value();
            }

            conditional->comparator = parent->consume();

            if (auto right = expressionParser.parseNode(parent)) {
                conditional->rhs = right.value();
            }

            if (parent->peek().value().type != TokenType::close_paren) {
                conditional->join_operator = parent->consume();
            }

            return conditional;
        }

    };
}