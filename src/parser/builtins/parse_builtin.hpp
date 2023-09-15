#pragma once

#include "../parent_parser.hpp"
#include "console_log.hpp"
#include "xtra-commands/xtra_command.hpp"

class ParseBuiltin {
public:
    ParseBuiltin(){}

    std::optional<NodeBuiltinFunction*> parseNode(ParentParser* parent) {

        auto builtin = parent->m_allocator.alloc<NodeBuiltinFunction>();

        if (parent->peek().value().value == "printc") {
            ParseConsoleLog parseConsoleLog;
            if (auto printConsole = parseConsoleLog.parseNode(parent)) {
                builtin->fn = printConsole.value();
            } else {
                std::cerr << "Failed To Parse Print Statement on line: " << parent->peek().value().lineNumber << std::endl;
                exit(EXIT_FAILURE);
            }
            return builtin;
        } else if (parent->peek().value().value == "Xtra") {
            XtraCommand command;
            if (auto cmd = command.parseNode(parent)) {
                builtin->fn = cmd.value();
            } else {
                std::cerr << "Failed To Parse Xtra Command on line: " << parent->peek().value().lineNumber << std::endl;
                exit(EXIT_FAILURE);
            }
            return builtin;
        }

        return {};

    }
};