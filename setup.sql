-- Run this in Navicat on the `lab6_products` database
-- =====================================================

-- 1. Users table (for authentication)
CREATE TABLE IF NOT EXISTS `users` (
    `id`         INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `username`   VARCHAR(100)     NOT NULL,
    `email`      VARCHAR(255)     NOT NULL,
    `password`   VARCHAR(255)     NOT NULL,
    `role`       ENUM('admin','moderator','user') NOT NULL DEFAULT 'user',
    `is_active`  TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
    `created_at` DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME                  DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `username_unique` (`username`),
    UNIQUE KEY `email_unique` (`email`),
    KEY `role_idx` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Refresh tokens table (for JWT refresh)
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
    `id`         INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`    INT(11) UNSIGNED NOT NULL,
    `token`      VARCHAR(255)     NOT NULL,
    `jti`        VARCHAR(255)     NOT NULL DEFAULT '',
    `expires_at` DATETIME         NOT NULL,
    `created_at` DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `user_id_idx` (`user_id`),
    KEY `token_idx` (`token`(64))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Products table (main CRUD table)
CREATE TABLE IF NOT EXISTS `products` (
    `id`           INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_name` VARCHAR(100)     NOT NULL,
    `description`  TEXT,
    `price`        DECIMAL(10,2)    NOT NULL DEFAULT 0.00,
    `quantity`     INT(11)          NOT NULL DEFAULT 0,
    `created_at`   TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. (Optional) Seed a default admin user
-- Password is: Admin@123
INSERT IGNORE INTO `users` (`username`, `email`, `password`, `role`, `is_active`)
VALUES (
    'admin',
    'admin@lab6.com',
    '$2y$10$8obM0rBeU1lWSt4FRTDAReD5XL8P4UT5E4w2wMfzYXH5PiH25cv8i',
    'admin',
    1
);
