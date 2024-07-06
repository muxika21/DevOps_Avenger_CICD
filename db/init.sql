CREATE DATABASE IF NOT EXISTS mydatabase;

USE mydatabase;

CREATE TABLE IF NOT EXISTS cicd_pipeline 
(
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_name VARCHAR(255) NOT NULL
);

INSERT INTO cicd_pipeline (user_name) VALUES ('syahridan');  