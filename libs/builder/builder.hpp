#pragma once

#include <iostream>
#include <optional>
#include <sstream>
#include <vector>
#include <filesystem>

#include "generation.hpp"
#include "parser/parse_program.hpp"

namespace Frame {
    class Builder : public Logger {
    public:
        Builder() {}
        ~Builder() {}

        std::string path() {
            return std::filesystem::current_path().string();
        }

        void buildProgram(const char* path, const char* file) {
            Files files;
            std::string contents = files.read_file(file);

            Tokenizer tokenizer(std::move(contents));
            std::vector<Token> tokens = tokenizer.tokenize();

            std::map<std::string, std::string> programs;

            programs.insert({ file, "main" });

            ParentParser parentParser(std::move(tokens), files, programs);
            ParseProgram parser;
            std::optional<NodeProgram> program = parser.parse_program("main", file, &parentParser);
            
            if (!program.has_value()) {
                std::cerr << "Invalid program" << std::endl;
                exit(EXIT_FAILURE);
            }

            Generator generator(program.value());
            std::stringstream buildPath;

            buildPath << "build/frame.js";
            std::ofstream outFile;
            outFile.open(buildPath.str(), std::ios::trunc);
            if (!outFile.is_open()) {
                std::cerr << "Error opening file" << std::endl;
            }
            std::string generated_program = generator.generate_program();
            if (!(outFile << generated_program)) {
                std::cerr << "Error writing to file" << std::endl;
            }
            outFile.close();

            std::ofstream htmlFile;
            htmlFile.open("build/index.html", std::ios::trunc);
            if (!htmlFile.is_open()) {
                std::cerr << "Error opening html file" << std::endl;
            }
            std::string html = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title id=\"web-title\">Frame Framework</title>\n</head>\n<body>\n</body>\n<script type=\"module\" src=\"./frame.js\"></script>\n</html>";
            if (!(htmlFile << html)) {
                std::cerr << "Error writing to file" << std::endl;
            }
            htmlFile.close();
        }
    private:
    };
}