#!/bin/bash

# Query the installed extension until the expected version is available
# Inspired from: https://github.com/microsoft/azure-devops-extension-tasks/issues/189#issue-820340124

set -e

SERVICE_URL=
SERVICE_TOKEN=
TASK_ID=
TASK_VERSION=

while getopts t:s:c:v: flag; do
    case "${flag}" in
        s) SERVICE_URL="${OPTARG}";;
        t) SERVICE_TOKEN="${OPTARG}";;
        c) TASK_ID="${OPTARG}";;
        v) TASK_VERSION="${OPTARG}";;
    esac
done

attempts=0
max=25

until [ $attempts -gt $max ];
do
    extensions=$(tfx build tasks list --authType pat --service-url $SERVICE_URL -t $SERVICE_TOKEN --no-color --json)
    installed_version=$(echo $extensions | jq -r ".[] | select(.contributionIdentifier == \"$TASK_ID\") | .contributionVersion")

    if [ -z $installed_version ]
    then
        echo "No version found for $TASK_ID"
        exit 1
    fi

    if [ $installed_version == $TASK_VERSION ]
    then
        echo "Found installed version $installed_version for $TASK_ID"
        exit 0
    fi

    echo "Installed version is $installed_version, waiting $(( ++attempts ))s for $TASK_VERSION to become available..."
    sleep $attempts;
done

echo "Expected version was not found after $attempts attempts"
exit 1;
