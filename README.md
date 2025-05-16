# Datadog Continuous Testing for Azure DevOps

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/Datadog.datadog-ci)][1]
[![Build Status](https://dev.azure.com/datadog-ci/Datadog%20CI%20Azure%20DevOps%20Extension/_apis/build/status%2FDevelopment?branchName=main)](https://dev.azure.com/datadog-ci/Datadog%20CI%20Azure%20DevOps%20Extension/_build/latest?definitionId=4&branchName=main)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Overview

With the [`SyntheticsRunTests`][3] task, you can run Synthetic tests within your Azure Pipeline configuration and ensure all your teams using Azure DevOps can benefit from Synthetic tests at every stage of the software lifecycle.

For more information on the available configuration, see the [`datadog-ci synthetics run-tests` documentation][13].

## Authentication

### Service Connection

To connect to your [Datadog site][11], Datadog recommends setting up a custom service connection when configuring the [`SyntheticsRunTests`][3] task. 

You need to provide the following inputs:

- Datadog site: Your Datadog site. The possible values are listed [in this table][11]. 
- Custom subdomain (default: `app`): The custom subdomain to access your Datadog organization. If your URL is `myorg.datadoghq.com`, the custom subdomain is `myorg`.
- API key: Your Datadog API key. This key is [created in your Datadog organization][6].
- Application key: Your Datadog application key. This key is [created in your Datadog organization][6].


### API and Application keys

- API key: Your Datadog API key. This key is [created in your Datadog organization][6] and should be stored as a [secret][7].
- Application key: Your Datadog application key. This key is [created in your Datadog organization][6] and should be stored as a [secret][7].
- Datadog site: Your Datadog site. The possible values are listed [in this table][11]. 
- Custom subdomain (optional): The custom subdomain to access your Datadog organization. If your URL is `myorg.datadoghq.com`, the custom subdomain is `myorg`.

## Setup

To connect to your Datadog account, [create a Datadog CI service connection][5] in your Azure pipelines project. Once created, all you need is the name of the service connection in the tasks.

1. Install the [Datadog Continuous Testing extension from the Visual Studio Marketplace][1] in your Azure Organization.
2. Add your Datadog API and application keys in the [Datadog CI service connection](#authentication), or as [secrets to your Azure Pipelines project][7].
3. In your Azure DevOps pipeline, use the [`SyntheticsRunTests`][3] task.

Your task can be [simple](#simple-usage) or [complex](#complex-usage).

## Simple usage

### Example task using public IDs

```yaml
- task: SyntheticsRunTests@1
  displayName: Run Datadog Synthetic tests
  inputs:
    authenticationType: 'connectedService'
    connectedService: 'my-datadog-ci-connected-service'
    publicIds: |
      abc-d3f-ghi
      jkl-mn0-pqr
```

### Example task using existing `synthetics.json` files

```yaml
- task: SyntheticsRunTests@1
  displayName: Run Datadog Synthetic tests
  inputs:
    authenticationType: 'connectedService'
    connectedService: 'my-datadog-ci-connected-service'
    files: 'e2e-tests/*.synthetics.json'
```

For an example test file, see this [`test.synthetics.json` file][14].

### Example task using pipeline secrets for authentication

```yaml
- task: SyntheticsRunTests@1
  inputs:
    authenticationType: 'apiAppKeys'
    apiKey: '$(DatadogApiKey)'
    appKey: '$(DatadogAppKey)'
    datadogSite: '$(DatadogSite)'
    subdomain: 'myorg'
```

## Complex usage

### Example task using the `testSearchQuery`

```yaml
- task: SyntheticsRunTests@1
  displayName: Run Datadog Synthetic tests
  inputs:
    authenticationType: 'connectedService'
    connectedService: 'my-datadog-ci-connected-service'
    testSearchQuery: 'tag:e2e-tests'
```

### Example task using the `testSearchQuery` and variable overrides

```yaml
- task: SyntheticsRunTests@1
  displayName: Run Datadog Synthetic tests
  inputs:
    authenticationType: 'connectedService'
    connectedService: 'my-datadog-ci-connected-service'
    testSearchQuery: 'tag:e2e-tests'
    variables: |
      START_URL=https://staging.website.com
      PASSWORD=$(StagingPassword)
```

### Example task using a global configuration file with `configPath`

By default, the path to the global configuration file is `datadog-ci.json`. You can override this path with the `config_path` input.

```yaml
- task: SyntheticsRunTests@1
  displayName: Run Datadog Synthetic tests
  inputs:
    authenticationType: 'connectedService'
    configPath: './global.config.json'
    connectedService: 'my-datadog-ci-connected-service'
```

## Inputs

For more information on the available configuration, see the [`datadog-ci synthetics run-tests` documentation][13].

| Name                   | Description                                                                                                                                                                                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apiKey`               | Your Datadog API key. This key is [created in your Datadog organization][6] and should be stored as a [secret][7]. <br><sub>**Required** when `authenticationType == apiAppKeys`</sub>                                                                                                                             |
| `appKey`               | Your Datadog application key. This key is [created in your Datadog organization][6] and should be stored as a [secret][7]. <br><sub>**Required** when `authenticationType == apiAppKeys`</sub>                                                                                                                     |
| `authenticationType`   | (**Required**) How to store and retrieve credentials. <br><sub>Must be either `apiAppKeys` or `connectedService`</sub>                                                                                                                                                                                             |
| `batchTimeout`         | Specifies the timeout duration in milliseconds for the CI batch. When a batch times out, the CI job fails and no new test runs are triggered, but ongoing test runs complete normally. <br><sub>**Default:** `1800000` (30 minutes)</sub>                                                                          |
| `connectedService`     | The name of the [Datadog CI service connection](#setup). <br><sub>**Required** when `authenticationType == connectedService`</sub>                                                                                                                                                                                 |
| `configPath`           | The path to the [global configuration file][9] that configures datadog-ci. <br><sub>**Default:** `datadog-ci.json`</sub>                                                                                                                                                                                           |
| `datadogSite`          | Your Datadog site. The possible values are listed [in this table][11]. <br><sub>**Default:** `datadoghq.com`</sub> <!-- partial <br><br>Set it to {{< region-param key="dd_site" code="true" >}} (ensure the correct SITE is selected on the right). partial -->                                                   |
| `failOnCriticalErrors` | Fail the CI job if a critical error that is typically transient occurs, such as rate limits, authentication failures, or Datadog infrastructure issues. <br><sub>**Default:** `false`</sub>                                                                                                                        |
| `failOnMissingTests`   | Fail the CI job if the list of tests to run is empty or if some explicitly listed tests are missing. <br><sub>**Default:** `false`</sub>                                                                                                                                                                           |
| `failOnTimeout`        | Fail the CI job if the CI batch fails as timed out. <br><sub>**Default:** `true`</sub>                                                                                                                                                                                                                             |
| `files`                | Glob patterns to detect Synthetic [test configuration files][14], separated by new lines. <br><sub>**Default:** `{,!(node_modules)/**/}*.synthetics.json`</sub>                                                                                                                                                    |
| `jUnitReport`          | The filename for a JUnit report if you want to generate one. <br><sub>**Default:** none</sub>                                                                                                                                                                                                                      |
| `publicIds`            | Public IDs of Synthetic tests to run, separated by new lines or commas. If no value is provided, tests are discovered in Synthetic [test configuration files][14]. <br><sub>**Default:** none</sub>                                                                                                                |
| `selectiveRerun`       | Whether to only rerun failed tests. If a test has already passed for a given commit, it is not rerun in subsequent CI batches. By default, your [organization's default setting][18] is used. Set it to `false` to force full runs when your configuration enables it by default. <br><sub>**Default:** none</sub> |
| `subdomain`            | The custom subdomain to access your Datadog organization when `authenticationType == apiAppKeys`. If your URL is `myorg.datadoghq.com`, the custom subdomain is `myorg`. <br><sub>**Default:** `app`</sub>                                                                                                         |
| `testSearchQuery`      | Use a [search query][10] to select which Synthetic tests to run. Use the [Synthetic Tests list page's search bar][15] to craft your query, then copy and paste it. <br><sub>**Default:** none</sub>                                                                                                                |
| `variables`            | Override existing or inject new local and [global variables][16] in Synthetic tests as key-value pairs, separated by new lines or commas. For example: `START_URL=https://example.org,MY_VARIABLE=My title`. <br><sub>**Default:** none</sub>                                                                      |

## Outputs

| Name                     | Description                                |
| ------------------------ | ------------------------------------------ |
| `batchUrl`               | The URL of the batch.                      |
| `criticalErrorsCount`    | The number of critical errors.             |
| `failedCount`            | The number of failed results.              |
| `failedNonBlockingCount` | The number of failed non-blocking results. |
| `passedCount`            | The number of passed results.              |
| `previouslyPassedCount`  | The number of previously passed results.   |
| `testsNotFoundCount`     | The number of not found tests.             |
| `testsSkippedCount`      | The number of skipped tests.               |
| `timedOutCount`          | The number of timed out results.           |
| `rawResults`             | The list of results, as a raw JSON string. |

## Further reading

Additional helpful documentation, links, and articles:

- [Getting Started with Continuous Testing][17]
- [Continuous Testing and CI/CD Configuration][4]
- [Best practices for continuous testing with Datadog][12]

[1]: https://marketplace.visualstudio.com/items?itemName=Datadog.datadog-ci
[2]: https://github.com/DataDog/datadog-ci
[3]: https://github.com/DataDog/datadog-ci-azure-devops/tree/main/SyntheticsRunTestsTask
[4]: https://docs.datadoghq.com/continuous_testing/cicd_integrations/configuration
[5]: https://docs.microsoft.com/en-us/azure/devops/pipelines/library/service-endpoints
[6]: https://docs.datadoghq.com/account_management/api-app-keys/
[7]: https://docs.microsoft.com/en-us/azure/devops/pipelines/process/set-secret-variables
[8]: https://docs.datadoghq.com/synthetics/search/#search
[9]: https://docs.datadoghq.com/continuous_testing/cicd_integrations/configuration/?tab=npm#global-configuration-file
[10]: https://docs.datadoghq.com/synthetics/explore/#search
[11]: https://docs.datadoghq.com/getting_started/site/#access-the-datadog-site
[12]: https://www.datadoghq.com/blog/best-practices-datadog-continuous-testing/
[13]: https://docs.datadoghq.com/continuous_testing/cicd_integrations/configuration/?tab=npm#run-tests-command
[14]: https://docs.datadoghq.com/continuous_testing/cicd_integrations/configuration/?tab=npm#test-files
[15]: https://app.datadoghq.com/synthetics/tests
[16]: https://docs.datadoghq.com/synthetics/platform/settings/?tab=specifyvalue#global-variables
[17]: https://docs.datadoghq.com/getting_started/continuous_testing/
[18]: https://app.datadoghq.com/synthetics/settings/continuous-testing
