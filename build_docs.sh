#!/bin/bash

# Fail on simple errors, so that the pipeline / job fails.
set -e

# Define the output directory where docs will be generated.
OUTPUT_DIR="docs_output"
TYPEDOC_CONFIG=`mktemp -p .`.cjs

# Create the output directory if it doesn't exist.
mkdir -p "$OUTPUT_DIR"

# Get all remote branches that match the pattern v(\d+\.){2}x (e.g., v10.4.x, v11.1.x, etc.).
BRANCHES=$(git branch -r --sort=v:refname | grep -P '^  origin/v(\d+\.){2}x$' | sed 's/origin\///' | sed 's/^[[:space:]]*//g')

# Add main branch.
BRANCHES=$(printf "%s\nmain" "$BRANCHES")

# Add the outer page with the version picker.
cp ./docs/index.html ./${OUTPUT_DIR}/

# Copy the typedoc config so that it's available when switching the branch.
cp ./typedoc-all.config.cjs $TYPEDOC_CONFIG

# Loop through matching branches.
for BRANCH in $BRANCHES; do
  # Skip legacy branches.
  if [[ "$BRANCH" == v2.* ]]; then
    continue
  fi

  echo "Processing branch: $BRANCH"
  
  # Checkout the version branch.
  git switch "$BRANCH"

  # Create the directory to store docs for this branch.
  BRANCH_DIR="$OUTPUT_DIR/$BRANCH"
  mkdir -p "$BRANCH_DIR"

  # Store the latest release version.
  echo "Determining last release tag ..."
  LAST_RELEASE_VERSION=$(git tag --merged "${BRANCH}" --sort=-v:refname | grep -m1 -P "v(\d+\.){2}\d+$")
  echo $LAST_RELEASE_VERSION

  # Install dependencies.
  npm ci

  # Generate docs.
  npm run build:docs -- --options $TYPEDOC_CONFIG --out $BRANCH_DIR

  # Add branch to version picker of outer page (will result in reverse order)
  sed -i "/<!-- Branch options will be populated here. -->/a <option value="${BRANCH}">${BRANCH}</option>" ./${OUTPUT_DIR}/index.html

  echo "Documentation for branch $BRANCH saved to $BRANCH_DIR."
done

echo "All branches processed."

# Switch back to the original branch.
git switch main
