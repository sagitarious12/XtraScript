// #include <fstream>
#include <iostream>
#include <optional>
#include <sstream>
#include <vector>

#include "./generation.hpp"
#include "./file_reader.hpp"

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

    Parser parser(std::move(tokens), files);
    std::optional<NodeProgram> program = parser.parse_program("main", argv[1]);

    if (!program.has_value()) {
        std::cerr << "Invalid program" << std::endl;
        exit(EXIT_FAILURE);
    }

    // Generator generator(program.value());
    // {
    //     std::fstream file("build.js", std::ios::out);
    //     file << generator.generate_program();
    // }

    // system("nasm -felf64 out.asm");
    // system("ld -o out out.o");

    std::cout << "breakpoint" << std::endl;

    return EXIT_SUCCESS;
}