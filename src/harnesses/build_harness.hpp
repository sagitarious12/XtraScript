#pragma once

#include "logger.hpp"
#include "help_harness.hpp"
#include "builder/builder.hpp"

class BuildHarness : public Frame::Logger {
public:
    BuildHarness(int count, char** args)
    : m_count(count), m_args(args) {}
    BuildHarness() = delete;

    void build() {
        if (m_count >= 3 && std::string(m_args[2]) == "help") {
            HelpCommand helper;
            helper.printBuildHelp();
        } else {
            Frame::Builder builder;
            builder.buildProgram(m_args[0], "extry.xs");
        }
    }
private:
    int m_count;
    char** m_args;
};