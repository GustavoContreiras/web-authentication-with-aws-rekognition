import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CreateCollectionCommand, DeleteCollectionCommand, ListCollectionsCommand, ListCollectionsCommandOutput, RekognitionClient } from '@aws-sdk/client-rekognition';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        name: 'default',
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [],
        synchronize: false,
      }),
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {

    const rekognitionClient = new RekognitionClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
      }
    });

    // Creates AWS Rekognition collection (first it will delete if it exist)
    rekognitionClient.send(new ListCollectionsCommand({}))
      .then(async (collections: ListCollectionsCommandOutput) => {

        let alreadyExist = false

        for (const collectionId of collections.CollectionIds) {
          if (collectionId === process.env.AWS_REKOGNITION_COLLECTION) {
            alreadyExist = true
          }
        }

        // TODO: Re-create the logic. 
        // You will probably not want to delete entire collection everytime the app is executed.
        // And you also do not want to try to create something that already exists. 
        if (alreadyExist) {
          await rekognitionClient.send(new DeleteCollectionCommand({
            CollectionId: process.env.AWS_REKOGNITION_COLLECTION
          }))
        }
        await rekognitionClient.send(new CreateCollectionCommand({
          CollectionId: process.env.AWS_REKOGNITION_COLLECTION
        }))
      })
  }
}
