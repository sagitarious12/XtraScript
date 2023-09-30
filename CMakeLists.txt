cmake_minimum_required(VERSION 3.25.2)

project(frame)
set(CMAKE_BUILD_TYPE Debug)
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/libs)
add_library(frame SHARED src/main.cpp)

project(xtra VERSION 0.1.0 LANGUAGES C CXX)

include(CTest)
enable_testing()

add_executable(xtra src/main.cpp)

SET(GCC_COVERAGE_COMPILE_FLAGS "-g")
SET(CMAKE_CXX_FLAGS  "${CMAKE_CXX_FLAGS} ${GCC_COVERAGE_COMPILE_FLAGS}")

set(CPACK_PROJECT_NAME ${PROJECT_NAME})
set(CPACK_PROJECT_VERSION ${PROJECT_VERSION})
include(CPack)

set_property(GLOBAL PROPERTY CXX_STANDARD 20)

SET(CMAKE_CXX_STANDARD 17)

# COMPILE DEFINITIONS
### Build in debug mode, logs included
add_compile_definitions(FR_DEBUG=1)
### Default log level 0 == TRACE, 1 == INFO, 2 == WARN, 3 == ERROR
add_compile_definitions(FR_LOG_LEVEL=0)
### SETTING TO 1 will only run the testing suite. ENSURE THIS IS 0 FOR PROD
add_compile_definitions(FR_RUN_TESTING=1)
### Current Version Of Xtra
add_compile_definitions(FR_VERSION="0.0.1")