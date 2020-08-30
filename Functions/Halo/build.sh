  #!/bin/bash

{
  rm ./Functions/Halo.zip
  cd ./Functions/Halo; zip -r ./Halo.zip .;
} &> /dev/null

Version=$(md5sum -b ./Halo.zip | awk '{print $1}')

{
  aws s3 cp ./Halo.zip s3://$S3_BUCKET_NAME/Halo-$Version.zip
  aws s3 cp ./Halo.zip s3://$S3_BUCKET_NAME/Halo-latest.zip
  rm ./Halo.zip
  cd ../..
} &> /dev/null

echo $Version