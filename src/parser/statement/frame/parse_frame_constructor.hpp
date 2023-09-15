#pragma once

#include <iomanip>

#include "../../parent_parser.hpp"

class ParseFrameConstructor {
public:
    ParseFrameConstructor() {}

    std::optional<std::vector<NodeFunctionArguments*>> parseConstructorArgs(ParentParser* parent, std::string frameName) {
        std::vector<NodeFunctionArguments*> args;
        int peek_index = 0;
        bool isInFrameScope = true;
        bool isInInnerScope = false;

        while(parent->peek(peek_index).has_value()) {
            
            if (parent->peek(peek_index).value().type == TokenType::open_brace) {
                isInInnerScope = true;
            }
            if (parent->peek(peek_index).value().type == TokenType::close_brace) {
                if (isInInnerScope) {
                    isInInnerScope = false;
                } else {
                    break;
                }
            }

            if (is_frame_constructor(parent, frameName, peek_index)) {
                peek_index++;
                parent->peek_assert(TokenType::open_paren, peek_index, "Missing Valid Constructor Initialization. Expected '('");
                peek_index++;

                while(parent->peek(peek_index).value().type != TokenType::close_paren) {
                    auto function_arg = parent->m_allocator.alloc<NodeFunctionArguments>();
                    parent->peek_assert(TokenType::ident, peek_index, "Not A Valid Constructor Argument");
                    auto type = parent->peek(peek_index++).value();
                    parent->peek_assert(TokenType::ident, peek_index, "No Valid Name Given For Constructor Argument");
                    auto name = parent->peek(peek_index++).value();
                    auto returnType = parent->m_allocator.alloc<NodeStatementReturnType>();
                    returnType->ident = type;
                    function_arg->type = returnType;
                    function_arg->ident = name;
                    args.push_back(function_arg);
                    if (parent->peek(peek_index).value().type == TokenType::comma) {
                        peek_index++;
                    } else if (parent->peek(peek_index).value().type == TokenType::ident) {
                        std::cerr << "Missing Comma Between Constructor Arguments" << std::endl;
                        exit(EXIT_FAILURE);
                    }
                }
                break;
            }

            peek_index++;
        }

        return args;
    }

    std::optional<std::vector<NodeStatement*>> parseConstructorStatements(ParentParser* parent, std::string frameName) {
        std::vector<NodeStatement*> stmts;
        int peek_index = 0;
        bool isInFrameScope = true;
        bool isInInnerScope = false;

        while(parent->peek(peek_index).has_value()) {

            if (parent->peek(peek_index).value().type == TokenType::open_brace) {
                isInInnerScope = true;
            }
            if (parent->peek(peek_index).value().type == TokenType::close_brace) {
                if (isInInnerScope) {
                    isInInnerScope = false;
                } else {
                    break;
                }
            }

            if (is_frame_constructor(parent, frameName, peek_index)) {
                while(parent->peek(peek_index).value().type != TokenType::close_paren) {
                    peek_index++;
                }

                parent->peek_assert(TokenType::close_paren, peek_index++, "Should Not Have This Ever Happen");
                parent->peek_assert(TokenType::open_brace, peek_index++, "Missing Constructor Scope Definition. Expected '{'");

                parent->set_hard_consume(false);
                parent->set_peek_index(peek_index);

                while(parent->peek(peek_index).has_value()) {
                    auto statement = std::make_unique<ParseStatement>();
                    if (auto stmt = statement.get()->parseNode(parent)) {
                        if (auto discard = std::holds_alternative<NodeDiscard*>(stmt.value()->value)) {
                            continue;
                        }
                        if (auto endFunction = std::holds_alternative<NodeFunctionEnd*>(stmt.value()->value)) {
                            stmts.push_back(stmt.value());
                            break;
                        }
                        stmts.push_back(stmt.value());
                    }
                    else {
                        std::cerr << "Invalid statement found on line: " << parent->peek().value().lineNumber + 1 << std::endl;
                        std::cerr << "Invalid " << token_names.at(as_integer(parent->peek().value().type)) << std::endl;
                        exit(EXIT_FAILURE);
                    }
                }

                parent->set_hard_consume(true);

                break;
            }
            peek_index++;
        }

        return stmts;
    }

private:

    bool is_frame_constructor(ParentParser* parent, std::string frameName, int peek_index) {
        return parent->peek(peek_index).has_value() &&
            parent->peek(peek_index).value().type == TokenType::ident &&
            parent->peek(peek_index).value().value.value() == frameName;
    }
};