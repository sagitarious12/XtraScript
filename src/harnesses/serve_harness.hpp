#pragma once

#include "logger.hpp"
#include "help_harness.hpp"
#include "networking/server/frame-server.hpp"

class ServeHarness : public Frame::Logger {
public:
    ServeHarness(int count, char** args)
    : m_count(count), m_args(args) {}
    ServeHarness() = delete;

    void serve() {
        if (m_count < 3) {
            addIndent();
            Info("");
            removeIndent();
            Error("Incorrect usage.");
            addIndent();
            Info("Correct usage is...\n");
            Info("xtra serve [<args>] -- [<options>]");
            Info("for more info please see 'xtra serve help'\n");
            return exit(EXIT_FAILURE);
        }

        if (std::string(m_args[2]) == "help") {
            HelpCommand helper;
            
            helper.printServeHelp();
        } else {
            Frame::FrameServer server;
        }
    }
private:
    int m_count;
    char** m_args;
};