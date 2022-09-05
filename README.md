# Datadog CI for Azure DevOps

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/Datadog.datadog-ci)][1]
[![Build Status](https://dev.azure.com/datadog-ci/Datadog%20CI%20Azure%20DevOps%20Extension/_apis/build/status/DataDog.datadog-ci-azure-devops?branchName=main)](https://dev.azure.com/datadog-ci/Datadog%20CI%20Azure%20DevOps%20Extension/_build/latest?definitionId=4&branchName=main)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Overview

Use [Datadog CI][2] as part of your Azure pipelines.

### Available Tasks

- [`SyntheticsRunTests`](#syntheticsruntests-task)

### Datadog CI Service Connection

In order to connect to your Datadog account, you can [create a Datadog CI service connection][5] in your azure pipelines project. Once created, all you need is the name of the service connection in the tasks.

## `SyntheticsRunTests` task

Run Datadog Synthetic tests as part of your Azure pipelines with the [Datadog CI `synthetics` command][3].

### Setup

To get started:

1. Install the [Datadog CI Extension from the Visual Studio marketplace][1] in your Azure Organization.
2. Add your Datadog API and Application Keys in the [Datadog CI Service Connection](#datadog-ci-service-connection), or as [secrets to your azure pipelines project][7]. For more information, see [API and Application Keys][1].
3. In your Azure DevOps pipeline, use the `SyntheticsRunTests` task.

Your workflow can be [simple](#simple-usage) or [complex](#complex-usag).

### Inputs

| Name                 | Requirement | Description                                                                                                                                                                                                                                     |
| -------------------- | :---------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `authenticationType` | _required_  | The type of authentication to Datadog to use, can either be `connectedService` or `apiAppKeys`.                                                                                                                                                 |
| `connectedService`   | _optional_  | Name of the [Datadog CI service connection](#datadog-ci-service-connection) to use when using the `connectedService` authentication type.                                                                                                       |
| `apiKey`             | _optional_  | Your Datadog API key when using the `apiAppKeys` authentication type. This key is created by your [Datadog organization][6] and should be stored as a [secret][7].                                                                              |
| `appKey`             | _optional_  | Your Datadog application key when using the `apiAppKeys` authentication type. This key is created by your [Datadog organization][6] and should be stored as a [secret][7].                                                                      |
| `subdomain`          | _optional_  | The name of the custom subdomain set to access your Datadog application when using the `apiAppKeys` authentication type. If the URL used to access Datadog is `myorg.datadoghq.com`, this value needs to be set to `myorg`. **Default:** `app`. |
| `datadogSite`        | _optional_  | The [Datadog site][11] when using the `apiAppKeys` authentication type. **Default:** `datadoghq.com`.                                                                                                                                           |
| `publicIds`          | _optional_  | List of tests IDs for Synthetic tests you want to trigger separated by new lines or commas. If no value is provided, the task will look for files named with `synthetics.json`.                                                                 |
| `testSearchQuery`    | _optional_  | Trigger tests corresponding to a [search][8] query. This can be useful if you are tagging your test configurations. See [best practices][10] for more information on tagging.                                                                   |
| `files`              | _optional_  | Glob pattern to detect Synthetic tests config files. **Default:** `{,!(node_modules)/**/}*.synthetics.json`.                                                                                                                                    |
| `configPath`         | _optional_  | The global JSON configuration is used when launching tests. See the [example configuration][9] for more details. **Default:** `datadog-ci.json`.                                                                                                |
| `variables`          | _optional_  | List of global variables to use for Synthetic tests separated by new lines or commas. For example: `START_URL=https://example.org,MY_VARIABLE=My title`. **Default:** `[]`.                                                                     |

### Simple usage

#### Example task using public IDs

```yaml
- task: SyntheticsRunTests@0
  displayName: Run Datadog Synthetics tests
  inputs:
    authenticationType: 'connectedService'
    connectedService: 'my-datadog-ci-connected-service'
    publicIds: |
      abc-d3f-ghi
      jkl-mn0-pqr
```

#### Example task using existing `synthetics.json` files

```yaml
- task: SyntheticsRunTests@0
  displayName: Run Datadog Synthetics tests
  inputs:
    authenticationType: 'connectedService'
    connectedService: 'my-datadog-ci-connected-service'
    files: 'e2e-tests/*.synthetics.json'
```

#### Example task using pipeline secrets for authentication

```yaml
- task: SyntheticsRunTests@0
  inputs:
    authenticationType: 'apiAppKeys'
    apiKey: '$(DatadogApiKey)'
    appKey: '$(DatadogAppKey)'
    subdomain: 'myorg'
    datadogSite: 'datadoghq.eu'
```

### Complex usage

#### Example task using the `testSearchQuery`

```yaml
- task: SyntheticsRunTests@0
  displayName: Run Datadog Synthetics tests
  inputs:
    authenticationType: 'connectedService'
    connectedService: 'my-datadog-ci-connected-service'
    testSearchQuery: 'tag:e2e-tests'
    variables: |
      START_URL=https://staging.website.com
      PASSWORD=$(StagingPassword)
```

#### Example task using the `testSearchQuery` and variable overrides

```yaml
- task: SyntheticsRunTests@0
  displayName: Run Datadog Synthetics tests
  inputs:
    authenticationType: 'connectedService'
    connectedService: 'my-datadog-ci-connected-service'
    testSearchQuery: 'tag:e2e-tests'
```

#### Example task using a global configuration override with `configPath`

```yaml
- task: SyntheticsRunTests@0
  displayName: Run Datadog Synthetics tests
  inputs:
    authenticationType: 'connectedService'
    connectedService: 'my-datadog-ci-connected-service'
    configPath: './synthetics-config.json'
```

## Further Reading

Additional helpful documentation, links, and articles:

- [Synthetics CI/CD Integrations Configuration][4]

[1]: https://marketplace.visualstudio.com/items?itemName=Datadog.datadog-ci
[2]: https://github.com/DataDog/datadog-ci
[3]: https://github.com/DataDog/datadog-ci/tree/master/src/commands/synthetics
[4]: https://docs.datadoghq.com/synthetics/cicd_integrations/configuration
[5]: https://docs.microsoft.com/en-us/azure/devops/pipelines/library/service-endpoints
[6]: https://docs.datadoghq.com/account_management/api-app-keys/
[7]: https://docs.microsoft.com/en-us/azure/devops/pipelines/process/set-secret-variables
[8]: https://docs.datadoghq.com/synthetics/search/#search
[9]: https://docs.datadoghq.com/synthetics/cicd_integrations/configuration/?tab=npm#setup-a-client
[10]: https://docs.datadoghq.com/developers/guide/what-best-practices-are-recommended-for-naming-metrics-and-tags/#rules-and-best-practices-for-naming-tags
[11]: https://docs.datadoghq.com/getting_started/site/
