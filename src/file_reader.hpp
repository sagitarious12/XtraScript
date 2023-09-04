#pragma once

#include <iostream>
#include <sstream>
#include <fstream>
#include <cstring>

// TODO make the file reader return a struct
// the struct will be a map of both 
// std::string and int for lineNumber

class Files {
public:
  std::string read_file(const char* path) {
    bool useRootPath = true;
    if (m_root_path == "") {
      useRootPath = false;
      bool foundSlash = false;
      for (int i = strlen(path) - 1; i >= 0; i--) {
        if (path[i] == '/' && !foundSlash) {
          foundSlash = true;
        } else if (foundSlash) {
          m_root_path += path[i];
        }
      }
      int n = m_root_path.length();
      for (int i = 0; i < n / 2; i++)
        std::swap(m_root_path[i], m_root_path[n - i - 1]);
    }
    std::stringstream contents_stream;
    if (useRootPath) {
      path++;
      std::ifstream input(m_root_path + path, std::ios::in);
      contents_stream << input.rdbuf();
      return contents_stream.str();
    } else {
      std::ifstream input(path, std::ios::in);
      contents_stream << input.rdbuf();
      return contents_stream.str();
    }
  };
private:
  std::string m_root_path = "";
};