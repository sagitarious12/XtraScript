#pragma once

#include "logger.hpp"
#include "help_harness.hpp"

class ProjectHarness : public Frame::Logger {
public:
    ProjectHarness(int count, char** args)
    : m_count(count), m_args(args) {}
    ProjectHarness() = delete;

    void project() {
        if (m_count < 4) {
            addIndent();
            Info("");
            removeIndent();
            Error("Incorrect usage.");
            addIndent();
            Info("Correct usage is...\n");
            Info("xtra generate project [<args>] -- [<options>]");
            Info("for more info please see 'xtra generate project help'\n");
            return exit(EXIT_FAILURE);
        }

        if (std::string(m_args[3]) == "help") {
            HelpCommand helper;
            helper.printProjectHelp();
        } else {

        }
    }
private:
    int m_count;
    char** m_args;
};