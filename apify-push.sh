#!/bin/bash

folder="$1"
script_dir=$(dirname $(realpath "$0"))

# TODO: check that $folder exists and corresponds to pwd

echo folder: $folder

pushd $script_dir

ln -s -f "$script_dir/packages/$folder/apify.json" "$script_dir/apify.json"
ln -s -f "$script_dir/packages/$folder/INPUT_SCHEMA.json" "$script_dir/INPUT_SCHEMA.json"

apify push

rm -f "$script_dir/apify.json"
rm -f "$script_dir/INPUT_SCHEMA.json"

popd