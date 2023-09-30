#include <iostream>

using namespace std;

int main() {
  if (__cplusplus == 202002L) std::cout << "C++20\n";
  else if (__cplusplus == 202002L) std::cout << "C++17\n";
  else if (__cplusplus == 202002L) std::cout << "C++14\n";
  else if (__cplusplus == 202002L) std::cout << "C++11\n";
  else if (__cplusplus == 202002L) std::cout << "C++98\n";
  else std::cout << "pre-standard C++\n";
}