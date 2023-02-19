import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {

  constructor(private dataSource: DataSource) { }

  getUsers() {
    return this.dataSource.query('SELECT * FROM users');
  }

  createUser({ name, age }) {
    return this.dataSource.query(`INSERT INTO users (name, age) VALUES (?, ?)`, [
      name,
      age,
    ]);
  }

  updateUserProfilePhoto({ id, faceId, profilePhotoUrl }: {
    id: number,
    faceId: string,
    profilePhotoUrl?: string
  }) {
    return this.dataSource.query(`UPDATE users SET face_id = ?, profile_photo_url = ? WHERE id = ?`, [
      faceId,
      profilePhotoUrl,
      id
    ]);
  }

  getUserByFaceId(faceId: string) {
    return this.dataSource.query(`SELECT * FROM users WHERE face_id = ?`, [
      faceId
    ]);
  }
}
