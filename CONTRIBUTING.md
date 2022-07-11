# Contributing

First of all, thanks for contributing!

This document provides some basic guidelines for contributing to this repository. To propose improvements, feel free to submit a pull request.

## Submitting issues

GitHub issues are welcome, feel free to submit error reports and feature requests.

- Ensure the bug was not already reported by searching on GitHub under [Issues](https://github.com/DataDog/synthetics-ci-github-action/issues).
- If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/DataDog/synthetics-ci-github-action/issues/new/choose).
- Make sure to add enough details to explain your use case.

If you require further assistance, contact [Datadog Support](https://docs.datadoghq.com/help/).

## Submitting pull requests

Have you fixed a bug or wrote a new feature and want to share it? Thanks!

To expedite your pull request's review, follow these best practices when submitting your pull request:

- **Write meaningful commit messages**: Messages should be concise and explanatory. The commit message describes the reason for your change, which you can reference later.

- **Keep it small and focused**: Pull requests should contain only one fix or one feature improvement. Bundling several fixes or features in the same PR makes it more difficult to review, and takes longer to release.

- **Write tests for the code you wrote**: Each script should be tested. The tests for a script are located in the [`src/tests` folder](https://github.com/DataDog/synthetics-ci-orb/tree/main/src/tests), under a file with the same name as the script.
**Note:** Datadog's internal CI is not publicly available, so if your pull request status is failing, make sure that all tests pass locally. The Datadog team can help you address errors flagged by the CI.

### Publishing

The title of the pull request must contain a special semver tag, `[semver:<segment>]`, where `<segment>` is replaced by one of the following values.

| Increment | Description|
| ----------| -----------|
| major     | Issue a 1.0.0 incremented release|
| minor     | Issue a x.1.0 incremented release|
| patch     | Issue a x.x.1 incremented release|
| skip      | Do not issue a release|

Example: `[semver:major]`

* Update the public `CHANGELOG.md` with the release changes.
* Squash and merge. Ensure the semver tag is preserved and entered as a part of the commit message.
* On merge, after manual approval, the orb will automatically be published to the Orb Registry.

## Style guide

The code under this repository follows a format enforced by [Prettier](https://prettier.io/), and a style guide enforced by [eslint](https://eslint.org/docs/rules/).

## Asking questions

Need help? Contact [Datadog support](https://docs.datadoghq.com/help/).
