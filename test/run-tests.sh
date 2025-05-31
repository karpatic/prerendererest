#!/bin/bash

# Prerendererest Test Runner Script
# This script provides examples of running different test suites

echo "🧪 Prerendererest Test Suite"
echo "=========================="
echo

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed or not in PATH"
    exit 1
fi

# Function to run tests with timing
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo "📋 Running $test_name..."
    echo "Command: $test_command"
    start_time=$(date +%s)
    
    if eval "$test_command"; then
        end_time=$(date +%s)
        duration=$((end_time - start_time))
        echo "✅ $test_name completed in ${duration}s"
    else
        echo "❌ $test_name failed"
        return 1
    fi
    echo
}

# Show available test commands
show_help() {
    echo "Available test commands:"
    echo "  ./test/run-tests.sh unit       - Run unit tests (fast)"
    echo "  ./test/run-tests.sh advanced   - Run advanced feature tests"
    echo "  ./test/run-tests.sh integration - Run integration tests (slower)"
    echo "  ./test/run-tests.sh performance - Run performance tests (slowest)"
    echo "  ./test/run-tests.sh fast       - Run unit + advanced tests"
    echo "  ./test/run-tests.sh slow       - Run integration + performance tests"
    echo "  ./test/run-tests.sh all        - Run all tests"
    echo "  ./test/run-tests.sh coverage   - Run all tests with coverage"
    echo "  ./test/run-tests.sh help       - Show this help"
    echo
}

# Main execution
case "${1:-help}" in
    "unit")
        run_test "Unit Tests" "npm run test:unit"
        ;;
    "advanced")
        run_test "Advanced Feature Tests" "npm run test:advanced"
        ;;
    "integration")
        run_test "Integration Tests" "npm run test:integration"
        ;;
    "performance")
        run_test "Performance Tests" "npm run test:performance"
        ;;
    "fast")
        run_test "Fast Tests" "npm run test:fast"
        ;;
    "slow")
        run_test "Slow Tests" "npm run test:slow"
        ;;
    "all")
        echo "🚀 Running all tests..."
        run_test "Unit Tests" "npm run test:unit" && \
        run_test "Advanced Tests" "npm run test:advanced" && \
        run_test "Integration Tests" "npm run test:integration" && \
        run_test "Performance Tests" "npm run test:performance"
        
        if [ $? -eq 0 ]; then
            echo "🎉 All tests passed!"
        else
            echo "💥 Some tests failed"
            exit 1
        fi
        ;;
    "coverage")
        run_test "Coverage Tests" "npm run test:coverage"
        echo "📊 Coverage report available in coverage/lcov-report/index.html"
        ;;
    "help"|*)
        show_help
        ;;
esac
