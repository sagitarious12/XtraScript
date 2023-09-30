#pragma once

#include "logger.hpp"
#include "help_harness.hpp"
#include "frame_harness.hpp"
#include "capsule_harness.hpp"
#include "injectable_harness.hpp"
#include "project_harness.hpp"

class GenerateHarness : public Frame::Logger {
public:
    GenerateHarness(int count, char** args)
    : m_count(count), m_args(args) {}
    GenerateHarness() = delete;

    void generate() {
        if (m_count < 3) {
            addIndent();
            Info("");
            removeIndent();
            Error("Incorrect usage.");
            addIndent();
            Info("Correct usage is...\n");
            Info("xtra generate [<args>] -- [<options>]");
            Info("for more info please see 'xtra generate help'\n");
            return exit(EXIT_FAILURE);
        }

        if (std::string(m_args[2]) == "help") {
            HelpCommand helper;
            helper.printGenerateHelp();
        } else if (std::string(m_args[2]) == "frame") {
            FrameHarness framer(m_count, m_args);
            framer.frame();
        } else if (std::string(m_args[2]) == "capsule") {
            CapsuleHarness capsular(m_count, m_args);
            capsular.capsule();
        } else if (std::string(m_args[2]) == "injectable") {
            InjectableHarness injector(m_count, m_args);
            injector.injectable();
        } else if (std::string(m_args[2]) == "project") {
            ProjectHarness projector(m_count, m_args);
            projector.project();
        } else {
            HelpCommand helper;
            helper.printGenerateHelp(Frame::LogLevel::ERROR);
        }
    }
private:
    int m_count;
    char** m_args;
};