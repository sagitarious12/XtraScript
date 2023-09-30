#pragma once

#include "logger.hpp"
#include "help_harness.hpp"
#include "serve_harness.hpp"
#include "build_harness.hpp"
#include "generate_harness.hpp"

#include <algorithm>

class CommandHarness : public Frame::Logger {
public:
    CommandHarness(int argCount, char** args)
    : m_arg_count(argCount), m_args(args) {
        performPathing();
    }
    CommandHarness() = delete;
private:
    void performPathing() {
        if (m_arg_count < 2) {
            addIndent();
            Info("\n");
            removeIndent();
            Error("Incorrect usage.");
            addIndent();
            Info("Correct usage is...\n");
            Info("xtra [<command>] [<args>] -- [<options>]");
            Info("for more info please see 'xtra help'\n");
            return exit(EXIT_FAILURE);
        }
        if (std::string(m_args[1]) == "help") {
            HelpCommand helper;
            helper.printBaseHelpMessage();
        }
        else if (std::string(m_args[1]) == "serve") {
            ServeHarness server(m_arg_count, m_args);
            server.serve();
        }
        else if (std::string(m_args[1]) == "build") {
            BuildHarness builder(m_arg_count, m_args);
            builder.build();
        }
        else if (std::string(m_args[1]) == "generate") {
            GenerateHarness generator(m_arg_count, m_args);
            generator.generate();
        }
        else {
            HelpCommand helper;
            helper.printBaseHelpMessage(Frame::LogLevel::ERROR);
        }
    }

    int m_arg_count = 0;
    char** m_args;
};