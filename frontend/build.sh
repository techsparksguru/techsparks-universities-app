#!/bin/bash
S3_END_POINT=$1
# Install the requirements
npm install

# Build for the production
source .env
npm run build

# Copy to s3
cd dist && aws s3 sync . ${S3_END_POINT} --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers

