CREATE DATABASE IF NOT EXISTS mydatabase;

USE mydatabase;

CREATE TABLE IF NOT EXISTS cicd_pipeline (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staff_name VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  serial_number VARCHAR(255) NOT NULL
);

INSERT INTO cicd_pipeline (staff_name, model, serial_number) VALUES
('John Doe', 'Model X', 'SN123456'),
('Jane Smith', 'Model Y', 'SN789012');
