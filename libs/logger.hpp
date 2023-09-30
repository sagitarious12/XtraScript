#pragma once

#include <string>
#include <iostream>
#include <any>
#include <variant>

#include "builder/tokenize/shared.hpp"

#if FR_DEBUG == 1
#define CAN_PRINT true
#else
#define CAN_PRINT false
#endif

#if FR_LOG_LEVEL == 0
#define LOG_LEVEL LogLevel::TRACE
#elif FR_LOG_LEVEL == 1
#define LOG_LEVEL LogLevel::INFO
#elif FR_LOG_LEVEL == 2
#define LOG_LEVEL LogLevel::WARN
#elif FR_LOG_LEVEL == 3
#define LOG_LEVEL LogLevel::ERROR
#else
#define LOG_LEVEL LogLevel::INFO
#endif

namespace Frame {
    
    enum LogLevel {
        TRACE,
        INFO,
        WARN,
        ERROR
    };

    std::array<std::string, 4> log_level_names {"TRACE", "INFO", "WARN", "ERROR"};
    
    template <typename Enumeration>
    auto as_integer(Enumeration const value)
        -> typename std::underlying_type<Enumeration>::type
    {
        return static_cast<typename std::underlying_type<Enumeration>::type>(value);
    };

    std::ostream& operator<<(std::ostream& stream, const LogLevel& level) {
        stream << log_level_names.at(as_integer(level));
        return stream;
    }

    std::ostream& operator<<(std::ostream& stream, const TokenType& tokenType) {
        stream << token_names.at(as_integer(tokenType));
        return stream;
    }

    std::ostream& operator<<(std::ostream& stream, const HTMLTokenType& tokenType) {
        stream << html_token_names.at(as_integer(tokenType));
        return stream;
    }

    typedef std::variant<
        int,
        float,
        double,
        bool,
        char,
        char*,
        std::string,
        Token,
        HTMLToken
    > LoggerTypes;

    class Logger {
    public:
        Logger() {}
        virtual ~Logger() {}

        Logger operator=(const LogLevel& level) {
            setLevel(level);
            return *this;
        }

        void addIndent() {
            m_indent++;
            m_indent++;
        }
        void removeIndent() {
            m_indent--;
            m_indent--;
        }

        void Trace(const LoggerTypes message) {
            setLevel(LogLevel::TRACE);
            printMessage(message);
        }

        void Info(const LoggerTypes message) {
            setLevel(LogLevel::INFO);
            printMessage(message);
        }

        void Warn(const LoggerTypes message) {
            setLevel(LogLevel::WARN);
            printMessage(message);
        }

        void Error(const LoggerTypes message) {
            setLevel(LogLevel::ERROR);
            printMessage(message);
        }

    private:
        void printMessage(const LoggerTypes message) {
            if (CAN_PRINT && currentLevelHigher()) {
                std::cout << getLogColor();
                if (m_indent == 0) {
                    std::cout << "[" << m_level << "] ";
                } else {
                    printIndent();
                }
                std::visit([] (const auto& msg) {
                    using T = std::decay_t<decltype(msg)>;
                    if constexpr (std::is_same_v<T, int>) {
                        std::cout << msg;
                    } else if constexpr (std::is_same_v<T, float>) {
                        std::cout << msg;
                    } else if constexpr (std::is_same_v<T, double>) {
                        std::cout << msg;
                    } else if constexpr (std::is_same_v<T, bool>) {
                        std::cout << msg;
                    } else if constexpr (std::is_same_v<T, std::string>) {
                        std::cout << msg;
                    } else if constexpr (std::is_same_v<T, char>) {
                        std::cout << msg;
                    } else if constexpr (std::is_same_v<T, char*>) {
                        std::cout << std::string(msg);
                    } else if constexpr (std::is_same_v<T, Token>) {
                        std::cout << "[Line: " << msg.lineNumber << "] Type: ";
                        std::cout << msg.type;
                        if (msg.value) {
                            std::cout << ", with value: " << msg.value.value();
                        }
                    } else if constexpr (std::is_same_v<T, HTMLToken>) {
                        std::cout << "[Line: " << msg.lineNumber << "] Type: ";
                        std::cout << msg.type;
                        if (msg.value) {
                            std::cout << ", with value: " << msg.value.value();
                        }
                    }
                }, message);
                std::cout << "\033[0m" << std::endl;
            }
        }

        void setLevel(const LogLevel& level) {
            m_level = level;
        }

        void printIndent() {
            for(int i = 0; i < m_indent; i++) {
                std::cout << " ";
            }
        }

        std::string getLogColor() {
            if (m_level == LogLevel::TRACE) {
                return "\033[37m";
            } else if (m_level == LogLevel::INFO) {
                return "\033[32m";
            } else if (m_level == LogLevel::WARN) {
                return "\033[33m";
            } else if (m_level == LogLevel::ERROR) {
                return "\033[31m";
            }
            return "\033[0m";
        }

        bool currentLevelHigher() {
            if (LOG_LEVEL == LogLevel::ERROR && m_level == LogLevel::ERROR) return true;
            if (LOG_LEVEL == LogLevel::WARN && (m_level == LogLevel::WARN || m_level == LogLevel::ERROR)) return true;
            if (LOG_LEVEL == LogLevel::INFO && m_level != LogLevel::TRACE) return true;
            if (LOG_LEVEL == LogLevel::TRACE) return true;
            return false;
        }

        LogLevel m_level = LOG_LEVEL;
        int m_indent = 0;
    };
}