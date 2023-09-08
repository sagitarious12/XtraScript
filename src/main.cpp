// #include <fstream>
#include <iostream>
#include <optional>
#include <sstream>
#include <vector>
#include <filesystem>

#include "./generation.hpp"
#include "./parser/parse_program.hpp"

std::string path() {
    return std::filesystem::current_path().string();
}

int main(int argc, char* argv[])
{
    if (argc != 2) {
        std::cerr << "Incorrect usage. Correct usage is..." << std::endl;
        std::cerr << "xtra <input.xs>" << std::endl;
        return EXIT_FAILURE;
    }

    Files files;
    std::string contents = files.read_file(argv[1]);

    Tokenizer tokenizer(std::move(contents));
    std::vector<Token> tokens = tokenizer.tokenize();

    std::map<std::string, std::string> programs;

    programs.insert({ argv[1], "main" });

    ParentParser parentParser(std::move(tokens), files, programs);
    ParseProgram parser;
    std::optional<NodeProgram> program = parser.parse_program("main", argv[1], &parentParser);
    
    if (!program.has_value()) {
        std::cerr << "Invalid program" << std::endl;
        exit(EXIT_FAILURE);
    }

    Generator generator(program.value());
    {
        std::stringstream buildPath;
        buildPath << argv[0] << ".js";
        std::ofstream file;
        file.open(buildPath.str(), std::ios::trunc);
        if (!file.is_open()) {
            std::cerr << "Error opening file" << std::endl;
        }
        std::string generated_program = generator.generate_program();
        if (!(file << generated_program)) {
            std::cerr << "Error writing to file" << std::endl;
        }
        file.close();
    }

    std::stringstream jsPathBuf;
    jsPathBuf << "node " << argv[0] << ".js";
    std::string  jsPath = jsPathBuf.str();
    system(jsPath.c_str());

    return EXIT_SUCCESS;
}