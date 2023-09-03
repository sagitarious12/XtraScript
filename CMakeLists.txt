cmake_minimum_required(VERSION 3.25.2)
project(xtra VERSION 0.1.0 LANGUAGES C CXX)

include(CTest)
enable_testing()

add_executable(xtra src/main.cpp)

set(CPACK_PROJECT_NAME ${PROJECT_NAME})
set(CPACK_PROJECT_VERSION ${PROJECT_VERSION})
include(CPack)

set_property(GLOBAL PROPERTY CXX_STANDARD 20)

