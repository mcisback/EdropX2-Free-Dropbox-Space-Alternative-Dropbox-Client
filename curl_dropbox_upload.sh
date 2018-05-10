#!/bin/bash

if [ -z "$1" ]; then

	echo -e "Usage:\n\t$0 <file_to_upload>"
	exit;

fi

access_token=$(cat config/config.json | jq -r '.access_token')
file_to_upload=$1

curl -X POST https://content.dropboxapi.com/2/files/upload \
    --header "Authorization: Bearer $access_token" \
    --header "Dropbox-API-Arg: {\"path\": \"/$file_to_upload\",\"mode\": \"add\",\"autorename\": true,\"mute\": false}" \
    --header "Content-Type: application/octet-stream" \
    --data-binary @$file_to_upload
