#!/bin/bash

FOLDER="$1"
script_dir=$(dirname $(realpath "$0"))

# TODO: check that $FOLDER exists and corresponds to pwd

echo FOLDER: $FOLDER

pushd $script_dir

pwd

ln -s -f "$script_dir/packages/$FOLDER/.actor" "$script_dir/.actor"
ln -s -f "$script_dir/packages/$FOLDER/INPUT_SCHEMA.json" "$script_dir/INPUT_SCHEMA.json"

sed "s/{{FOLDER}}/$FOLDER/g" "$script_dir/Dockerfile.template" > "$script_dir/Dockerfile"
# If Dockerfile is in .gitignore, Docker command ignores it...
sed -i "s/\/Dockerfile/\/.Dockerfile/" "$script_dir/.gitignore"

apify push

sed -i "s/\/\.Dockerfile/\/Dockerfile/" "$script_dir/.gitignore"
rm -f "$script_dir/Dockerfile"
rm -rf "$script_dir/.actor"
rm -f "$script_dir/INPUT_SCHEMA.json"

popd