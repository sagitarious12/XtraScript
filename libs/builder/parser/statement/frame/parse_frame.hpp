#pragma once

#include <iomanip>

#include "../../parent_parser.hpp"
#include "parse_frame_constructor.hpp"

namespace Frame {
    class ParseFrame {
    public:
        ParseFrame() {}

        std::optional<NodeStatementFrame*> parseNode(ParentParser* parent) {
            auto frame = parent->m_allocator.alloc<NodeStatementFrame>();

            parent->try_consume(TokenType::frame); // frame
            auto frameName = parent->try_consume(TokenType::ident, "Invalid Frame Declaration, Expected frame Name.");
            parent->try_consume(TokenType::open_brace, "Frame contents not defined successfully. Expected '{'");

            frame->name = frameName;

            ParseFrameConstructor frameConstructorParser;

            if (auto frameArgs = frameConstructorParser.parseConstructorArgs(parent, frameName.value.value())) {
                frame->args = frameArgs.value();
            }

            if (auto constructorStmts = frameConstructorParser.parseConstructorStatements(parent, frameName.value.value())) {
                frame->constructor_stmts = constructorStmts.value();
            }

            auto frameStatements = parseFrameStatements(parent, frameName.value.value());
            frame->stmts = frameStatements;

            return frame;
        }

    private:
        std::vector<NodeStatement*> parseFrameStatements(ParentParser* parent, std::string frameName) {
            std::vector<NodeStatement*> stmts;
            bool is_in_inner_scope = false;

            while(parent->peek().has_value()) {

                if (is_frame_constructor(parent, frameName)) {
                    bool is_in_scope = false;
                    bool is_in_inner_scope = false;
                    while(parent->peek().has_value()) {
                        auto token = parent->consume();
                        if (token.type == TokenType::open_brace) {
                            if (!is_in_scope) {
                                is_in_scope = true;
                            } else if (is_in_scope) {
                                is_in_inner_scope = true;
                            }
                        } else if (token.type == TokenType::close_brace) {
                            if (is_in_inner_scope) {
                                is_in_inner_scope = false;
                            } else {
                                parent->try_consume(TokenType::semi, "Missing constructor semicolon");
                                break;
                            }
                        }
                    }
                }

                else {
                    auto statement = std::make_unique<ParseStatement>();
                    if (auto stmt = statement.get()->parseNode(parent)) {
                        if (auto discard = std::holds_alternative<NodeDiscard*>(stmt.value()->value)) {
                            continue;
                        }
                        if (auto is_end = std::holds_alternative<NodeStatementDefinition*>(stmt.value()->value)) {
                            is_in_inner_scope = true;
                        }
                        if (auto end = std::holds_alternative<NodeFunctionEnd*>(stmt.value()->value)) {
                            if (!is_in_inner_scope) {
                                stmts.push_back(stmt.value());
                                break;
                            } else {
                                is_in_inner_scope = false;
                            }
                        }
                        stmts.push_back(stmt.value());
                    }
                    else {
                        std::cerr << "Invalid statement found on line: " << parent->peek().value().lineNumber << std::endl;
                        std::cerr << "Invalid " << token_names.at(as_integer(parent->peek().value().type)) << std::endl;
                        exit(EXIT_FAILURE);
                    }
                }
            }

            return stmts;
        }

        bool is_frame_constructor(ParentParser* parent, std::string frameName) {
            return parent->peek().has_value() &&
                parent->peek().value().type == TokenType::ident &&
                parent->peek().value().value.value() == frameName;
        }
    };
}