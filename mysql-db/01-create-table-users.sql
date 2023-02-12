USE DOCKERIZED;
CREATE TABLE users(
   id INT AUTO_INCREMENT,
   name VARCHAR(255) NOT NULL,
   age INT NOT NULL,
   face_id VARCHAR(255),
   profile_photo_url VARCHAR(255),
   PRIMARY KEY(id)
);