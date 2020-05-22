  #!/bin/bash

{
  rm AddHalo.zip
  cd AddHalo; zip -r ../AddHalo.zip *; cd ..;
} &> /dev/null

Version=$(md5sum -b AddHalo.zip | awk '{print $1}')

{
  aws s3 cp AddHalo.zip s3://$S3_BUCKET_NAME/AddHalo-$Version.zip
  aws s3 cp AddHalo.zip s3://$S3_BUCKET_NAME/AddHalo-latest.zip
  rm AddHalo.zip
} &> /dev/null

echo $Version