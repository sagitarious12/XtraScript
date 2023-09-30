#pragma once

#include "logger.hpp"
#include "help_harness.hpp"

class InjectableHarness : public Frame::Logger {
public:
    InjectableHarness(int count, char** args)
    : m_count(count), m_args(args) {}
    InjectableHarness() = delete;

    void injectable() {
        if (m_count < 4) {
            addIndent();
            Info("");
            removeIndent();
            Error("Incorrect usage.");
            addIndent();
            Info("Correct usage is...\n");
            Info("xtra generate injectable [<args>] -- [<options>]");
            Info("for more info please see 'xtra generate injectable help'\n");
            return exit(EXIT_FAILURE);
        }

        if (std::string(m_args[3]) == "help") {
            HelpCommand helper;
            helper.printInjectableHelp();
        } else {

        }
    }
private:
    int m_count;
    char** m_args;
};