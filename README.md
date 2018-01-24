### Run 

`npm run dev`


### Create Private and Public certs for Passport-JWT

`ssh-keygen -t rsa -b 4096 -f jwtRS256.key`

`openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub`