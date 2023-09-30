#pragma once

#include "../../parent_parser.hpp"
#include "../../expression/parse_expression.hpp"

class XtraInitWebApp {
public:
    XtraInitWebApp() {}

    std::optional<NodeInitWebApp*> parseNode(ParentParser* parent) {
        auto initNode = parent->m_allocator.alloc<NodeInitWebApp>();
        parent->try_consume(TokenType::open_paren, "Init Web App Not Initialized Correctly. Expected '('");

        ParseExpression expressionParser;
        if (auto initExpression = expressionParser.parseNode(parent)) {
            initNode->expr = initExpression.value();
        } else {
            std::cerr << "Invalid Expression in Xtra.initWebApp(<Expression>). Expected a frame." << std::endl;
            exit(EXIT_FAILURE);
        }

        parent->try_consume(TokenType::close_paren, "Xtra command not created correctly. Expected ')'");
        parent->try_consume(TokenType::semi, "Xtra command not created correctly. Expected ';'");

        return initNode;
    }
};