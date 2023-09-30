#pragma once

#include "logger.hpp"

#include <sstream>

class HelpCommand : public Frame::Logger {
public:
    HelpCommand(){}

    void printBaseHelpMessage(Frame::LogLevel level = Frame::LogLevel::INFO) {
        addIndent();
        std::stringstream ss;

        ss << "\n";
        ss << "USAGE:\n  xtra [<command>] [<args>] -- [<options>]\n";
        ss << "\n";
        ss << "COMMANDS:\n";
        ss << "  help          prints current usage info\n";
        ss << "  serve         builds xtra code and serves it to a local webserver\n";
        ss << "  build         builds xtra code\n";
        ss << "  generate      create a new file type of xtra code at the current directory\n";
        ss << "\n";

        if (level == Frame::LogLevel::INFO) {
            Info(ss.str());
        } else {
            Error(ss.str());
        }
    }

    void printServeHelp(Frame::LogLevel level = Frame::LogLevel::INFO) {
        addIndent();
        std::stringstream ss;

        ss << "\n";
        ss << "USAGE:\n xtra serve [<args>] -- [<options>]\n";
        ss << "\n";
        ss << "ARGS:\n";
        ss << "  <entry.xs>    the filepath to the entrypoint of the Frame Application\n";
        ss << "  help          help information on the serve command\n";
        ss << "\n";
        ss << "OPTIONS:\n";
        ss << "  PORT          the port the webserver will startup on\n";
        ss << "\n";

        if (level == Frame::LogLevel::INFO) {
            Info(ss.str());
        } else {
            Error(ss.str());
        }
    }

    void printBuildHelp(Frame::LogLevel level = Frame::LogLevel::INFO) {
        addIndent();
        std::stringstream ss;

        ss << "\n";
        ss << "USAGE:\n xtra build [<args>] -- [<options>]\n";
        ss << "\n";
        ss << "ARGS:\n";
        ss << "  <entry.xs>    the filepath to the entrypoint of the Frame Application\n";
        ss << "  help          help information on the build command\n";
        ss << "\n";
        ss << "OPTIONS:\n";
        ss << "\n";

        if (level == Frame::LogLevel::INFO) {
            Info(ss.str());
        } else {
            Error(ss.str());
        }
    }
    
    void printGenerateHelp(Frame::LogLevel level = Frame::LogLevel::INFO) {
        addIndent();
        std::stringstream ss;

        ss << "\n";
        ss << "USAGE:\n xtra generate [<args>] -- [<options>]\n";
        ss << "\n";
        ss << "ARGS:\n";
        ss << "  frame        create a new frame\n";
        ss << "  capsule      create a new capsule\n";
        ss << "  injectable   create a new injectable\n";
        ss << "  project      create a new Frame project\n";
        ss << "  help         help information on the generate command\n";
        ss << "\n";
        ss << "OPTIONS:\n";
        ss << "\n";

        if (level == Frame::LogLevel::INFO) {
            Info(ss.str());
        } else {
            Error(ss.str());
        }
    }
    
    void printFrameHelp(Frame::LogLevel level = Frame::LogLevel::INFO) {
        addIndent();
        std::stringstream ss;

        ss << "\n";
        ss << "USAGE:\n xtra generate frame [<args>] -- [<options>]\n";
        ss << "\n";
        ss << "ARGS:\n";
        ss << "  <Frame Name>      the name of the frame you want to create\n";
        ss << "  help              help information on the generate frame command\n";
        ss << "\n";
        ss << "OPTIONS:\n";
        ss << "\n";

        if (level == Frame::LogLevel::INFO) {
            Info(ss.str());
        } else {
            Error(ss.str());
        }
    }
    
    void printCapsuleHelp(Frame::LogLevel level = Frame::LogLevel::INFO) {
        addIndent();
        std::stringstream ss;

        ss << "\n";
        ss << "USAGE:\n xtra generate capsule [<args>] -- [<options>]\n";
        ss << "\n";
        ss << "ARGS:\n";
        ss << "  <Capsule Name>      the name of the capsule you want to create\n";
        ss << "  help                help information on the generate capsule command\n";
        ss << "\n";
        ss << "OPTIONS:\n";
        ss << "\n";

        if (level == Frame::LogLevel::INFO) {
            Info(ss.str());
        } else {
            Error(ss.str());
        }
    }
    
    void printInjectableHelp(Frame::LogLevel level = Frame::LogLevel::INFO) {
        addIndent();
        std::stringstream ss;

        ss << "\n";
        ss << "USAGE:\n xtra generate injectable [<args>] -- [<options>]\n";
        ss << "\n";
        ss << "ARGS:\n";
        ss << "  <Injectable Name>  the name of the injectable you want to create\n";
        ss << "  help               help information on the generate capsule command\n";
        ss << "\n";
        ss << "OPTIONS:\n";
        ss << "\n";

        if (level == Frame::LogLevel::INFO) {
            Info(ss.str());
        } else {
            Error(ss.str());
        }
    }
    
    void printProjectHelp(Frame::LogLevel level = Frame::LogLevel::INFO) {
        addIndent();
        std::stringstream ss;

        ss << "\n";
        ss << "USAGE:\n xtra generate project [<args>] -- [<options>]\n";
        ss << "\n";
        ss << "ARGS:\n";
        ss << "  <Project Name>     the name of the project you want to create\n";
        ss << "  help               help information on the generate capsule command\n";
        ss << "\n";
        ss << "OPTIONS:\n";
        ss << "\n";

        if (level == Frame::LogLevel::INFO) {
            Info(ss.str());
        } else {
            Error(ss.str());
        }
    }
};