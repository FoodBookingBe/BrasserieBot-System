# BrasserieBot AutoDev Agent

An autonomous development agent for building and maintaining the BrasserieBot platform.

## Overview

The BrasserieBot AutoDev agent is an AI-powered system designed to autonomously develop and maintain the BrasserieBot platform. It leverages Claude 3 API to analyze code, implement features, fix bugs, write tests, generate documentation, and perform code reviews.

## Features

- **Code Analysis**: Analyzes the codebase to build a comprehensive understanding of the project structure, dependencies, and patterns.
- **Feature Implementation**: Implements new features based on natural language descriptions.
- **Bug Fixing**: Identifies and fixes bugs in the codebase.
- **Test Generation**: Writes and runs tests for the codebase.
- **Documentation Generation**: Creates and updates documentation for the codebase.
- **Code Review**: Performs code reviews and provides feedback.
- **Self-Optimization**: Learns from feedback and performance metrics to improve over time.

## Architecture

The AutoDev agent is built with a modular architecture:

- **Core Agent**: Coordinates all activities and manages the workflow.
- **Modules**: Specialized components for specific tasks (code analysis, feature implementation, etc.).
- **Utils**: Shared utilities for configuration, logging, events, and prompts.
- **Dashboard**: Web interface for monitoring and interacting with the agent.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Claude API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/BrasserieBot.git
   cd BrasserieBot/autodev
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize the agent:
   ```bash
   npm run init
   ```
   This will prompt you for your Claude API key and other configuration options.

### Usage

#### Command Line Interface

The AutoDev agent provides a command-line interface for various tasks:

```bash
# Start the agent
npm start

# Analyze the codebase
npm run analyze

# Implement a feature
npm run implement "Add a new dashboard widget for daily sales"

# Fix a bug
npm run fix "The reservation form doesn't validate email addresses correctly"

# Run tests
npm run test

# Generate documentation
npm run document

# Perform a code review
npm run review "backend/src/core/core.service.ts"

# Start the dashboard
npm run dashboard
```

#### Dashboard

The AutoDev agent includes a web dashboard for monitoring and interacting with the agent. To start the dashboard:

```bash
npm run dashboard
```

Then open your browser to http://localhost:3030 (or the port you configured).

The dashboard provides:
- Real-time event monitoring
- Performance metrics
- Task submission
- Feedback collection

## Configuration

The agent is configured through the `config/config.json` file:

```json
{
  "projectRoot": "../",
  "claude": {
    "apiKey": "your-api-key",
    "model": "claude-3-opus-20240229",
    "systemPrompt": "You are AutoDev, an autonomous development agent for the BrasserieBot platform."
  },
  "dashboard": {
    "enabled": true,
    "port": 3030
  },
  "logging": {
    "level": "info",
    "file": "../logs/autodev.log"
  }
}
```

## Prompt Templates

The agent uses prompt templates for different tasks, located in the `templates` directory:

- `feature_implementation.txt`: Template for implementing new features
- `bug_fixing.txt`: Template for fixing bugs
- `test_generation.txt`: Template for generating tests
- `code_review.txt`: Template for performing code reviews
- `documentation_generation.txt`: Template for generating documentation
- `self_optimization.txt`: Template for self-optimization

You can customize these templates to improve the agent's performance for specific tasks.

## Feedback and Self-Improvement

The AutoDev agent learns from feedback and continuously improves itself. You can provide feedback through:

1. The dashboard feedback form
2. The feedback API endpoint
3. Creating feedback files in the `feedback` directory

The agent analyzes feedback and performance metrics to optimize its prompts, workflows, and decision-making processes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.