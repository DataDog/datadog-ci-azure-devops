#!/bin/bash

VERSION=$(jq -r '.version' vss-extension.json)

MAJOR=$(echo $VERSION | cut -d. -f1 | sed 's/v//') 
MINOR=$(echo $VERSION | cut -d. -f2)
PATCH=$(echo $VERSION | cut -d. -f3)

if [ "$1" == "major" ]; then
  MAJOR=$((MAJOR+1))
  MINOR=0
  PATCH=0
elif [ "$1" == "minor" ]; then
  MINOR=$((MINOR+1))
  PATCH=0
elif [ "$1" == "patch" ]; then
  PATCH=$((PATCH+1))
else
  echo "Invalid version type. Use 'major', 'minor' or 'patch'"
  exit 1
fi

NEW_VERSION="$MAJOR.$MINOR.$PATCH"

# Update extension version
sed -i -E "s/(\"version\"):.*/\1: \"$NEW_VERSION\",/" vss-extension.json

# Update tasks versions to the same version
sed -i -E -e "s/(\"Major\"):.*/\1: $MAJOR,/" -e "s/(\"Minor\"):.*/\1: $MINOR,/" -e "s/(\"Patch\"):.*/\1: $PATCH/" */task.json

# Update major version in e2e-pipeline.yml if it's a major version bump
if [ "$1" == "major" ]; then
  sed -i -E "s/SyntheticsRunTests@[0-9]+/SyntheticsRunTests@$MAJOR/" .azure-pipelines/e2e-pipeline.yml
fi

echo $NEW_VERSION 
