## Overview

Trigger Synthetic tests from your Azure pipeline with the [Datadog CI Synthetics command][1].

## Inputs

| Name                | Type   | Requirement | Description                                                                                                                                                                                              |
| ------------------- | ------ | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api_key`           | string | _required_  | Your Datadog API key. This key is created by your [Datadog organization][2] and should be stored as a secret. **Default:** none.                                                                         |
| `app_key`           | string | _required_  | Your Datadog Application key. This key is created by your [Datadog organization][2] and should be stored as a secret. **Default:** none.                                                                 |
| `public_ids`        | string | _optional_  | String of public IDs separated by commas for Synthetic tests you want to trigger. If no value is provided, the action looks for files named with `synthetics.json`. **Default:** none.                   |
| `test_search_query` | string | _optional_  | Trigger tests corresponding to a [search][5] query. **Default:** none.                                                                                                                                   |
| `subdomain`         | string | _optional_  | The name of the custom subdomain set to access your Datadog application. If the URL used to access Datadog is `myorg.datadoghq.com`, the subdomain value needs to be set to `myorg`. **Default:** `app`. |
| `files`             | string | _optional_  | Glob pattern to detect Synthetic tests config files. **Default:** `{,!(node_modules)/**/}*.synthetics.json`.                                                                                             |
| `datadog_site`      | string | _optional_  | The Datadog site. For users in the EU, set to `datadoghq.eu`. For example: `datadoghq.com` or `datadoghq.eu`. **Default:** `datadoghq.com`.                                                              |
| `config_path`       | string | _optional_  | The global JSON configuration is used when launching tests. See the [example configuration][4] for more details. **Default:** `datadog-ci.json`.                                                         |

## Further Reading

Additional helpful documentation, links, and articles:

- [CI/CD Integrations Configuration][6]

[1]: https://github.com/DataDog/datadog-ci
[2]: https://docs.datadoghq.com/account_management/api-app-keys/
[4]: https://docs.datadoghq.com/synthetics/cicd_integrations/configuration/?tabs=npm#setup-a-client
[5]: https://docs.datadoghq.com/synthetics/search/#search
[6]: https://docs.datadoghq.com/synthetics/cicd_integrations/configuration
