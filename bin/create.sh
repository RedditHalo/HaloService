  
#!/bin/bash

HALO_VERSION=$(bash ./Functions/Halo/build.sh)

# TODO: add other functions here

aws cloudformation create-stack --stack-name=$STACK_NAME \
  --template-body=file://template.yml \
  --capabilities CAPABILITY_IAM \
  --parameters \
    ParameterKey=S3BucketName,ParameterValue=$S3_BUCKET_NAME \
    ParameterKey=HaloVersion,ParameterValue=$HALO_VERSION

echo "Creating..."

aws cloudformation wait stack-create-complete --stack-name $STACK_NAME