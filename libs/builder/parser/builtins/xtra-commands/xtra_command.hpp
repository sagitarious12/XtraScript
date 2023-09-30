#pragma once

#include "../../parent_parser.hpp"
#include "init-web-app/init_web_app.hpp"

namespace Frame {
    class XtraCommand {
    public:
        XtraCommand() {}

        std::optional<NodeXtraCommand*> parseNode(ParentParser* parent) {
            auto command = parent->m_allocator.alloc<NodeXtraCommand>();

            parent->try_consume(TokenType::ident);
            parent->try_consume(TokenType::dot, "Xtra command not created correctly. Expected '.'");

            auto commandToken = parent->try_consume(TokenType::ident, "Not a Valid Xtra Command");
            if (commandToken.value.value() == "initWebApp") {
                XtraInitWebApp initWebApp;
                if (auto init = initWebApp.parseNode(parent)) {
                    command->cmd = init.value();
                }
                return command;
            } else {
                std::cerr << "Not a valid Xtra Command: " << commandToken.value.value() << std::endl;
                exit(EXIT_FAILURE);
            }

            return {};
        }
    };
}