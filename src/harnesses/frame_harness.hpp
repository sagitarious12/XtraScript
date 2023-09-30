#pragma once

#include "logger.hpp"
#include "help_harness.hpp"

class FrameHarness : public Frame::Logger {
public:
    FrameHarness(int count, char** args)
    : m_count(count), m_args(args) {}
    FrameHarness() = delete;

    void frame() {
        if (m_count < 4) {
            addIndent();
            Info("");
            removeIndent();
            Error("Incorrect usage.");
            addIndent();
            Info("Correct usage is...\n");
            Info("xtra generate frame [<args>] -- [<options>]");
            Info("for more info please see 'xtra generate frame help'\n");
            return exit(EXIT_FAILURE);
        }

        if (std::string(m_args[3]) == "help") {
            HelpCommand helper;
            helper.printFrameHelp();
        } else {

        }
    }
private:
    int m_count;
    char** m_args;
};