  
#!/bin/bash

HALO_VERSION=$(bash ./Functions/Halo/build.sh)
# TODO: add other functions here

aws cloudformation update-stack \
  --stack-name=$STACK_NAME \
  --template-body=file://template.yml \
  --capabilities CAPABILITY_IAM \
  --parameters \
  ParameterKey=S3BucketName,ParameterValue=$S3_BUCKET_NAME \
  ParameterKey=HaloVersion,ParameterValue=$HALO_VERSION
  # TODO: add version parameters of other functions here

echo "Updating..."

aws cloudformation wait stack-update-complete --stack-name $STACK_NAME