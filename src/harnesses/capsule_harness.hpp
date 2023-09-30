#pragma once

#include "logger.hpp"
#include "help_harness.hpp"

class CapsuleHarness : public Frame::Logger {
public:
    CapsuleHarness(int count, char** args)
    : m_count(count), m_args(args) {}
    CapsuleHarness() = delete;

    void capsule() {
        if (m_count < 4) {
            addIndent();
            Info("");
            removeIndent();
            Error("Incorrect usage.");
            addIndent();
            Info("Correct usage is...\n");
            Info("xtra generate capsule [<args>] -- [<options>]");
            Info("for more info please see 'xtra generate capsule help'\n");
            return exit(EXIT_FAILURE);
        }

        if (std::string(m_args[3]) == "help") {
            HelpCommand helper;
            helper.printCapsuleHelp();
        } else {

        }
    }
private:
    int m_count;
    char** m_args;
};