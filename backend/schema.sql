CREATE DATABASE IF NOT EXISTS releasebot;
USE releasebot;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE artists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  name VARCHAR(150) NOT NULL,
  genre VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE releases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  artist_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  type ENUM('single', 'ep', 'album') NOT NULL,
  release_date DATE NOT NULL,
  genre VARCHAR(100),
  distributor VARCHAR(150),
  cover_url TEXT,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  status ENUM('draft', 'pending', 'published', 'cancelled') DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

CREATE TABLE campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  release_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  plan TEXT NOT NULL,
  status ENUM('draft', 'active', 'completed') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE CASCADE
);

CREATE TABLE chat_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO artists (name, genre) VALUES
('António Figueira', 'Pop'),
('Luna Norte', 'Electronic');

INSERT INTO releases (artist_id, title, type, release_date, genre, distributor, status, notes) VALUES
(1, 'Noites de Maio', 'single', '2026-06-15', 'Pop', 'DistroKid', 'pending', 'Single de verão'),
(2, 'After Hours Sketches', 'ep', '2026-07-05', 'Electronic', 'CD Baby', 'draft', 'EP com quatro faixas');
