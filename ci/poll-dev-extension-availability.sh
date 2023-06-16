#!/bin/bash

# Query the installed DEV extension until the expected version is available.
# Inspired from: https://github.com/microsoft/azure-devops-extension-tasks/issues/189#issue-820340124

set -e

SERVICE_URL=
SERVICE_TOKEN=

# Format: $(publisherId).$(extensionId)$(devExtensionTag).$(contributionId)
CONTRIBUTION_IDENTIFIER=

# Corresponds to the extension version.
CONTRIBUTION_VERSION=

while getopts t:s:i:v: flag; do
    case "${flag}" in
        s) SERVICE_URL="${OPTARG}";;
        t) SERVICE_TOKEN="${OPTARG}";;
        i) CONTRIBUTION_IDENTIFIER="${OPTARG}";;
        v) CONTRIBUTION_VERSION="${OPTARG}";;
    esac
done

attempts=1
max=25

# Installed by `TfxInstaller` in the main pipeline.
tfx=/opt/hostedtoolcache/tfx/0.12.0/x64/bin/tfx

# Build tasks are "contributed" (Microsoft term to say "made available") by Azure DevOps extensions.
# The contributions of an extension are defined in the `contributions` section of `vss-extension.json`.
#
# We have 2 flavors of the extension: the public and the development one.
# Each flavor contributes its own `SyntheticsRunTests` task:
#
#   - The DEV extension's task:
#     - Task ID: `99cf84cd-0117-58b7-b1dd-d95e5ae9baf8`
#     - Contribution Identifier: `Datadog.datadog-ci-dev.synthetics-application-testing`
#
#   - The public extension's task:
#     - Task ID: `60b18503-c6d6-4e4b-a6b2-52fc6fb3d525`
#     - Contribution Identifier: `Datadog.datadog-ci.synthetics-application-testing`
#
# The contribution version (`contributionVersion`) corresponds to the version of the EXTENSION: it's a string (e.g. `1.0.0`).
# In the response, there also is a `version` field which is the version of the TASK, but it's an object (e.g. `{ major: 1, minor: 0, patch: 0 }`) which is hard to compare with a string.
# Since [bumping both the extension and the task is required for an update to occur][1], polling on the extension version is the same as polling on the task version.
#
# The extension version is the only one that we already know in our pipeline, thanks to the `QueryAzureDevOpsExtensionVersion` task.
# The task version is bumped automatically by `PublishAzureDevOpsExtension` (thanks to `updateTasksVersion: true`) so we can't easily find its new value.
#
# [1]: https://github.com/MicrosoftDocs/azure-devops-docs/blob/f39ae7a04f3e124361eee19a84d853ec22c31e99/docs/extend/develop/add-build-task.md?plain=1#L427

until [ $attempts -gt $max ];
do
    # List all the build tasks that are available. (e.g. `TfxInstaller`, `Bash`, etc.)
    # Some of them are contributed by Azure DevOps extensions installed in the organization (e.g. `SyntheticsRunTests`).
    tasks=$($tfx build tasks list --authType pat --service-url $SERVICE_URL -t $SERVICE_TOKEN --no-color --json)

    # Get the current version for the contribution that we are polling.
    current_contribution_version=$(echo $tasks | jq -r ".[] | select(.contributionIdentifier == \"$CONTRIBUTION_IDENTIFIER\") | .contributionVersion")

    if [ -z $current_contribution_version ]; then
        echo "No version found for $CONTRIBUTION_IDENTIFIER"
        exit 1
    fi

    if [ $current_contribution_version == $CONTRIBUTION_VERSION ]; then
        echo "Found installed version $current_contribution_version for $CONTRIBUTION_IDENTIFIER"
        exit 0
    fi

    echo "Installed version is $current_contribution_version, waiting $attempts seconds for $CONTRIBUTION_VERSION to become available..."
    sleep $attempts

    ((attempts++))
done

echo "Expected version was not found after $attempts attempts"
exit 1
