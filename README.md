# Datadog CI for Azure DevOps

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/Datadog.datadog-ci)][1]
[![Build Status](https://dev.azure.com/datadog-ci/Datadog%20CI%20Azure%20DevOps%20Extension/_apis/build/status/DataDog.datadog-ci-azure-devops?branchName=main)](https://dev.azure.com/datadog-ci/Datadog%20CI%20Azure%20DevOps%20Extension/_build/latest?definitionId=4&branchName=main)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Overview

With the Datadog CI Azure DevOps Extension, you can run Synthetic tests within your Azure Pipeline configuration and ensure all your teams using Azure DevOps can benefit from Synthetic tests at every stage of the software lifecycle. You can run [`SyntheticsRunTests`](#available-tasks) as a task.

## Authentication

### Service Connection

To connect to your [Datadog site][11], Datadog recommends setting up a custom service connection when configuring the Synthetics Run Test task. 

You need to provide the following inputs:

- Datadog site: Which [Datadog site][11] to connect and send data to. 
- Custom subdomain (default: `app`): The name of the custom subdomain set to access your Datadog application. If the URL used to access Datadog is `myorg.datadoghq.com`, this value needs to be set to `myorg`.
- API Key: Your Datadog API key. This key is created by your [Datadog organization][6].
- Application key: Your Datadog application key. This key is created by your [Datadog organization][6].


### API and Application keys

- API Key: Your Datadog API key. This key is created by your [Datadog organization][6] and is accessed as an environment variable.
- Application key: Your Datadog application key. This key is created by your [Datadog organization][6] and is accessed as an environment variable.
- Datadog site: The [Datadog site][11] to connect and send data to. 
- Custom subdomain (optional): The name of the custom subdomain set to access your Datadog application. If the URL used to access Datadog is `myorg.datadoghq.com`, this value needs to be set to `myorg`.

## Setup

To connect to your Datadog account, [create a Datadog CI service connection][5] in your Azure pipelines project. Once created, all you need is the name of the service connection in the tasks.

1. Install the [Datadog CI Extension from the Visual Studio Marketplace][1] in your Azure Organization.
2. Add your Datadog API and application keys in the [Datadog CI Service Connection](#authentication), or as [secrets to your Azure Pipelines project][7].
3. In your Azure DevOps pipeline, use the `SyntheticsRunTests` task.

Your task can be [simple](#simple-usage) or [complex](#complex-usage).

## Simple usage

### Example task using public IDs

```yaml
- task: SyntheticsRunTests@0
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
- task: SyntheticsRunTests@0
  displayName: Run Datadog Synthetic tests
  inputs:
    authenticationType: 'connectedService'
    connectedService: 'my-datadog-ci-connected-service'
    files: 'e2e-tests/*.synthetics.json'
```

### Example task using pipeline secrets for authentication

```yaml
- task: SyntheticsRunTests@0
  inputs:
    authenticationType: 'apiAppKeys'
    apiKey: '$(DatadogApiKey)'
    appKey: '$(DatadogAppKey)'
    subdomain: 'myorg'
    datadogSite: '$(DatadogSite)'
```

## Complex usage

### Example task using the `testSearchQuery`

```yaml
- task: SyntheticsRunTests@0
  displayName: Run Datadog Synthetic tests
  inputs:
    authenticationType: 'connectedService'
    connectedService: 'my-datadog-ci-connected-service'
    testSearchQuery: 'tag:e2e-tests'
    variables: |
      START_URL=https://staging.website.com
      PASSWORD=$(StagingPassword)
```

### Example task using the `testSearchQuery` and variable overrides

```yaml
- task: SyntheticsRunTests@0
  displayName: Run Datadog Synthetic tests
  inputs:
    authenticationType: 'connectedService'
    connectedService: 'my-datadog-ci-connected-service'
    testSearchQuery: 'tag:e2e-tests'
```

### Example task using a global configuration override with `configPath`

```yaml
- task: SyntheticsRunTests@0
  displayName: Run Datadog Synthetic tests
  inputs:
    authenticationType: 'connectedService'
    connectedService: 'my-datadog-ci-connected-service'
    configPath: './synthetics-config.json'
```

## Inputs

| Name                 | Requirement | Description                                                                                                                                                                                                                                     |
| -------------------- | :---------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `authenticationType` | _required_  | The type of authentication you want Datadog to use, either `connectedService` or `apiAppKeys`.                                                                                                                                                  |
| `connectedService`   | _optional_  | The name of the [Datadog CI service connection](#setup) to use when using the `connectedService` authentication type.                                                                                                                           |
| `apiKey`             | _optional_  | Your Datadog API key when using the `apiAppKeys` authentication type. This key is created by your [Datadog organization][6] and should be stored as a [secret][7].                                                                              |
| `appKey`             | _optional_  | Your Datadog application key when using the `apiAppKeys` authentication type. This key is created by your [Datadog organization][6] and should be stored as a [secret][7].                                                                      |
| `subdomain`          | _optional_  | The name of the custom subdomain set to access your Datadog application when using the `apiAppKeys` authentication type. If the URL used to access Datadog is `myorg.datadoghq.com`, this value needs to be set to `myorg`. **Default:** `app`. |
| `datadogSite`        | _optional_  | The [Datadog site][11] when using the `apiAppKeys` authentication type. **Default:** `datadoghq.com`.                                                                                                                                           |
| `publicIds`          | _optional_  | A list of tests IDs for Synthetic tests you want to trigger, separated by new lines or commas. If no value is provided, the task looks for files named `synthetics.json`.                                                                       |
| `testSearchQuery`    | _optional_  | Trigger tests corresponding to a [search][8] query. This can be useful if you are tagging your test configurations. For more information, see [rules and best practices for naming tags][10].                                                   |
| `files`              | _optional_  | Glob pattern to detect Synthetic tests' config files. **Default:** `{,!(node_modules)/**/}*.synthetics.json`.                                                                                                                                   |
| `configPath`         | _optional_  | The global JSON configuration used when launching tests. For more information, see the [example configuration][9]. **Default:** `datadog-ci.json`.                                                                                              |
| `variables`          | _optional_  | A list of global variables to use for Synthetic tests, separated by new lines or commas. For example: `START_URL=https://example.org,MY_VARIABLE=My title`. **Default:** `[]`.                                                                  |
| `jUnitReport`        | _optional_  | The filename for a JUnit report if you want to generate one.                                                                                                                                                                                    |


## Further reading

Additional helpful documentation, links, and articles:

- [Continuous Testing and CI/CD Configuration][4]
- [Best practices for continuous testing with Datadog][12]

[1]: https://marketplace.visualstudio.com/items?itemName=Datadog.datadog-ci
[2]: https://github.com/DataDog/datadog-ci
[3]: https://github.com/DataDog/datadog-ci/tree/master/src/commands/synthetics
[4]: https://docs.datadoghq.com/continuous_testing/cicd_integrations/configuration
[5]: https://docs.microsoft.com/en-us/azure/devops/pipelines/library/service-endpoints
[6]: https://docs.datadoghq.com/account_management/api-app-keys/
[7]: https://docs.microsoft.com/en-us/azure/devops/pipelines/process/set-secret-variables
[8]: https://docs.datadoghq.com/synthetics/search/#search
[9]: https://docs.datadoghq.com/continuous_testing/cicd_integrations/configuration/?tab=npm#setup-a-client
[10]: https://docs.datadoghq.com/developers/guide/what-best-practices-are-recommended-for-naming-metrics-and-tags/#rules-and-best-practices-for-naming-tags
[11]: https://docs.datadoghq.com/getting_started/site/
[12]: https://www.datadoghq.com/blog/best-practices-datadog-continuous-testing/
