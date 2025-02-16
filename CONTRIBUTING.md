# Contributing to Deadname Remover

Thank you for your interest in contributing to Deadname Remover! This document provides guidelines and instructions for setting up, developing, and contributing to the project.

## Non-Technical Contributions

### Bug Reports

Bug reports are very appreciated and help improve the extension for everyone. Before submtting, please check the existing issues to avoid duplicates. When submitting a bug report, please include:

- Browser and version
- Extension version
- Steps to reproduce
- Expected vs actual behavior
- Any relevant error messages
- Links to websites where the bug is present if applicable
- Screenshots or videos if applicable
- If you plan on/would like to try to fix the bug
  - If so, please detail a technical analysis of the bug and potential solutions for approval

### Feature Requests

Feature requests are very welcome! Before submitting, please check the existing issues to avoid duplicates. When submitting a feature request, please include:

- A clear description of the feature and its use case
- Explanation of how it benefits users
- Consider potential implementation challenges
- If you plan on/would like to try to implement the feature
  - If so, please detail a technical analysis of the feature and potential implementations for approval

## Technical Contributions, Setup, and Considerations

### Development Setup

### Prerequisites

- Node.js (v20 or higher)
- Bun (v1.0.0 or higher) -- used as the package manager
- Git
- A Chromium-based browser (Chrome, Edge, Brave, etc.) or Firefox installed for running the WXT development browser

#### Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/deadname-remover.git
   cd deadname-remover
   ```
3. Install dependencies:
   ```bash
   bun install
   ```
4. Start the development server and development browser:
   - For Chromium-based browsers:
     ```bash
     <!-- To run via Chrome or Chromium -->
     bun run dev
     <!-- To run via a specific Chromium browser -->
     CHROME_PATH=<path-to-any-chromium-browser> bun run dev
     ```
   - For Firefox:
     ```bash
     bun run dev:firefox
     ```

#### Development Commands

- `bun run dev` - Start development server for Chromium browsers
- `bun run dev:firefox` - Start development server for Firefox
- `bun run build` - Build the extension for Chromium browsers
- `bun run build:firefox` - Build the extension for Firefox
- `bun run zip` - Create distribution zip for Chromium browsers
- `bun run zip:firefox` - Create distribution zip for Firefox
- `bun run lint` - Run ESLint
- `bun run check` - Run type checking with TypeScript and Svelte

### Technology Stack

- [WXT](https://github.com/WXT-Community/WXT) - Browser extension framework
- [Svelte](https://svelte.dev/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Programming language
- [Valibot](https://github.com/fabian-hiller/valibot) - Data validation
- [UnoCSS](https://github.com/unocss/unocss) - CSS engine
- [Onu UI](https://github.com/onu-ui/onu-ui) - UI component library
- [Bun](https://bun.sh/) - Package manager

### Contributing Guidelines

#### Code Style

- Use TypeScript for all new code
- Follow existing code formatting patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Write type definitions for new features
- Maintain codebase structure by utilizing `utils` and `components` folders

#### Pull Request Process

Pull requests are the method used to contribute code to the project. Contributions from all experience levels are welcome; feel free to ask questions and get help if you would like to contribute and need some direction or assistance. Pull request reviews will always keep in mind varying skill levels and intend to serve as a learning experience and collaborative process.

1. Submit a new issue or tag @arimgibson on an existing issue indicating your intent to contribute. **To ensure your contribution is likely to be accepted, please wait for confirmation before beginning work on a pull request.**
2. Create a new branch for your feature or fix with a descriptive name:
   ```bash
   git checkout -b feature/<branch-name>
   OR
   git checkout -b fix/<branch-name>
   ```
3. Make your changes and commit them with a descriptive commit message:
   ```bash
   git commit -m "<commit-message>"
   ```
4. Push your changes to your fork:
   ```bash
   git push origin <branch-name>
   ```
5. Test and understand your changes before submitting:
   - Understand the footprint of your changes and potential side effects
   - Verify that existing functionality isn't broken
   - Consider edge cases and potential performance impacts
   - Maintain alignment with extension's purpose and [Privacy Policy](./PRIVACY_POLICY.md)
   - Pass all checks (linting and type checking)
   - Updates documentation if needed (including the changelog)
   - Follows the codebase structure and style
   - Contains high quality code you can stand behind (ask for help if needed!)
6. Create a pull request from your fork to the main repository that:
   - Describes the changes made
   - Includes any relevant issue numbers
   - Contians videos or screenshots demonstrating the changes (if applicable)
7. Wait for review and feedback (be responsive to maintainer questions and feedback)

## Code of Conduct

Overall, foster a welcoming and inclusive environment for all contributors and users.

- Be respectful and inclusive
- Keep discussions constructive and professional
- Ask for help if you need it

## Questions or Need Help?

If you have questions or need help with contributing:

- Open a GitHub issue
- Contact Ari Gibson at [hi@arigibson.com](mailto:hi@arigibson.com)

## License

By contributing to Deadname Remover, you agree that your contributions will be licensed under the MIT License. See [LICENSE](./LICENSE) for details.
