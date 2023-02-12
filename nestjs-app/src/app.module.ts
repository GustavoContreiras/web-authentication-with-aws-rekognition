import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CreateCollectionCommand, ListCollectionsCommand, ListCollectionsCommandOutput, RekognitionClient } from '@aws-sdk/client-rekognition';

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

    // Creates AWS Rekognition collection if it does not exist
    rekognitionClient.send(new ListCollectionsCommand({}))
      .then((collections: ListCollectionsCommandOutput) => {

        let alreadyExist = false

        for (const collectionId of collections.CollectionIds) {
          if (collectionId === process.env.AWS_REKOGNITION_COLLECTION) {
            alreadyExist = true
          }
        }

        if (!alreadyExist) {
          rekognitionClient.send(new CreateCollectionCommand({
            CollectionId: process.env.AWS_REKOGNITION_COLLECTION
          }))
        }
      })
  }
}
