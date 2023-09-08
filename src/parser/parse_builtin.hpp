#pragma once

#include "parent_parser.hpp"
#include "builtins/console_log.hpp"

class ParseBuiltin {
public:
    ParseBuiltin(){}

    std::variant<
        std::optional<NodeStatementPrintConsole*>
    > parseNode(ParentParser* parent) {

        if (parent->peek().value().value == "printc") {
            ParseConsoleLog parseConsoleLog;
            return parseConsoleLog.parseNode(parent);
        }

        return {};

    }
};