import { S3Client, PutObjectCommand, PutObjectCommandOutput } from '@aws-sdk/client-s3';
import { RekognitionClient, IndexFacesCommand, SearchFacesByImageCommand, SearchFacesByImageCommandOutput } from "@aws-sdk/client-rekognition";
import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { ResultSetHeader } from 'mysql2';

export class CreateUserDTO {
  name: string
  age: number
  profilePhotoBase64: string
}

export class AuthenticateUserDTO {
  profilePhotoBase64: string
}

@Controller('/users')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('/')
  getUsers() {
    return this.appService.getUsers();
  }

  @Post('/login')
  async getUserByFaceId(
    @Body() {
      profilePhotoBase64
    }: AuthenticateUserDTO
  ) {

    const rekognitionClient = new RekognitionClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
      }
    });

    const profilePhotoBuffer = Buffer.from(profilePhotoBase64.replace(/^data:image\/\w+;base64,/, ""), "base64")

    const searchFacesResult: SearchFacesByImageCommandOutput = await rekognitionClient.send(new SearchFacesByImageCommand({
      CollectionId: process.env.AWS_REKOGNITION_COLLECTION,
      Image: {
        Bytes: profilePhotoBuffer
      },
      MaxFaces: 1,
      QualityFilter: 'MEDIUM'
    }))

    const faceId = searchFacesResult?.FaceMatches[0]?.Face?.FaceId
    const found = searchFacesResult?.$metadata?.httpStatusCode === 200 && faceId

    if (found) {
      return this.appService.getUserByFaceId(faceId);
    } else {
      return {
        error: "Couldn't find user by profile photo."
      }
    }
  }

  @Post('/register')
  async createUser(
    @Body() {
      name,
      age,
      profilePhotoBase64
    }: CreateUserDTO
  ) {

    // Step 1: Create the user in our database
    const resultCreateUser: ResultSetHeader = await this.appService.createUser({
      name: name,
      age: age,
    })

    const userId = resultCreateUser.insertId

    // Step 2: Insert the user profile photo in the AWS S3 Bucket
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
      }
    });

    const s3Bucket = process.env.AWS_S3_BUCKET
    const s3BucketBaseUrl = `https://${s3Bucket}.s3.us-east-1.amazonaws.com/`
    const profilePhotoBuffer = Buffer.from(profilePhotoBase64.replace(/^data:image\/\w+;base64,/, ""), "base64")
    const profilePhotoFileName = `user_avatar_${userId}.jpeg`

    const insertProfilePhotoResult: PutObjectCommandOutput = await s3Client.send(new PutObjectCommand({
      Bucket: s3Bucket,
      Key: profilePhotoFileName,
      Body: profilePhotoBuffer,
      ContentEncoding: "base64",
      ContentType: "image/jpeg"
    }))

    const successfullyInsertedInS3 = insertProfilePhotoResult.$metadata.httpStatusCode === 200

    // Step 3: Insert the user profile photo in the AWS Rekognition Collection
    if (successfullyInsertedInS3) {

      const rekognitionClient = new RekognitionClient({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY,
          secretAccessKey: process.env.AWS_SECRET_KEY
        }
      });

      const rekognitionCollection = process.env.AWS_REKOGNITION_COLLECTION

      const insertInCollectionResult = await rekognitionClient.send(new IndexFacesCommand({
        CollectionId: rekognitionCollection,
        Image: {
          S3Object: {
            Bucket: s3Bucket,
            Name: profilePhotoFileName,
          }
        },
        MaxFaces: 1,
        QualityFilter: "MEDIUM" // NONE | AUTO | LOW | MEDIUM | HIGH
      }))

      const faceId = insertInCollectionResult?.FaceRecords[0]?.Face?.FaceId
      const successfullyInsertedInCollection = (insertInCollectionResult.$metadata.httpStatusCode === 200) && faceId

      // Step 4: Update the faceId of the user and the profilePhotoUrl in our database
      if (successfullyInsertedInCollection) {
        await this.appService.updateUserProfilePhoto({
          id: userId,
          faceId: faceId,
          profilePhotoUrl: `${s3BucketBaseUrl}${profilePhotoFileName}`,
        })
      } else {
        return {
          error: "Something went wrong while inserting face in collection, please try again."
        }
      }
    } else {
      return {
        error: "Something went wrong while inserting profile photo in bucket, please try again."
      }
    }
  }
}
