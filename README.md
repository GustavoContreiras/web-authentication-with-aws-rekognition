# Dockerized Full-Stack Environment

## Introduction

This tutorial will teach you how to setup a dockerized environment that with a single command can run:

- a MySQL database server (and create and populate a database in it in the first run)
- a back-end using the NestJS framework with a simple API
- a front-end using the NextJS framework that calls the back-end API

## Folder structure

You can see the most important files and it's locations in the diagram below. Some files were hidden to make it easier to understand.

```
📦web-authentication-with-aws-rekognition
 ┣ 📂mysql-db
 ┃ ┣ 📜00-create-db.sql
 ┃ ┗ 📜01-create-table-users.sql
 ┣ 📂nestjs-app
 ┃ ┣ 📂node_modules
 ┃ ┣ 📂src
 ┃ ┣ 📂test
 ┃ ┣ 📜.dockerignore
 ┃ ┣ 📜Dockerfile
 ┃ ┣ 📜package.json
 ┃ ┗ 📜webpack-hmr.config.js
 ┣ 📂nextjs-app
 ┃ ┣ 📂node_modules
 ┃ ┣ 📂pages
 ┃ ┃ ┗ 📜index.tsx
 ┃ ┣ 📂public
 ┃ ┣ 📂styles
 ┃ ┣ 📜.dockerignore
 ┃ ┣ 📜Dockerfile
 ┃ ┣ 📜package.json
 ┃ ┗ 📜next.config.js
 ┣ 📜.env
 ┣ 📜docker-compose.yml
 ┗ 📜package.json
 ```

## Install AWS CLI

- <https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html>

### Generate an Access Key and a Secret Key

- Sign in AWS
- Go to IAM service
- Click in `Users`
- Select the desired user
- Click in `Create access key`
- Follow the steps
- Copy the generated Access Key and Secret Key to use on the next step

### Configure AWS CLI's default profile

- Run `aws configure`
- Set your Access Key and Secret Key

## Install Docker Desktop

- <https://docs.docker.com/desktop/install/windows-install/>
- <https://docs.docker.com/desktop/install/linux-install/>
- <https://docs.docker.com/desktop/install/mac-install/>

## Run everything together

Run `docker-compose up`

## Run projects separeted

### Run the mysql-db

`npm run start:db` or  
`docker-compose up mysql-db`

### Run the nestjs-app

`npm run start:back` or  
`docker-compose up nestjs-app`  

### Run the nextjs-app

`npm run start:front` or  
`docker-compose up nextjs-app`

### Clean the database volume

Run `npm run clean` or `docker-compose down -v`

## Please ⭐ if it helped you

## Useful links

- <https://nextjs.org/docs/getting-started>
- <https://docs.nestjs.com/first-steps>
- <https://docs.nestjs.com/recipes/hot-reload>
- <https://docs.nestjs.com/recipes/sql-typeorm#sql-typeorm>
- <https://docs.nestjs.com/techniques/database>
