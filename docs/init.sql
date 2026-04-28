CREATE DATABASE IF NOT EXISTS ai_vocabulary_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_vocabulary_db;

CREATE TABLE `users` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '加密后的密码',
    `created_at` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `updated_at` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    `deleted_at` DATETIME(3) DEFAULT NULL COMMENT '软删除时间',
    INDEX `idx_users_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户账号表';

CREATE TABLE `words` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `word` VARCHAR(100) NOT NULL COMMENT '英文单词',
    `translation` VARCHAR(255) DEFAULT '' COMMENT '基础中文释义',
    `example_sentence` TEXT COMMENT 'AI生成的英文例句',
    `example_translation` TEXT COMMENT '例句的中文翻译',
    `synonyms` JSON DEFAULT NULL COMMENT 'AI生成的同义词列表(存储为JSON数组)',
    `created_at` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
    `updated_at` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
    `deleted_at` DATETIME(3) DEFAULT NULL COMMENT '软删除时间',
    UNIQUE KEY `uk_word` (`word`),
    INDEX `idx_words_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='单词及其AI扩展信息表';

CREATE TABLE `user_words` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `word_id` BIGINT UNSIGNED NOT NULL COMMENT '单词ID',
    `is_mastered` TINYINT(1) DEFAULT 0 COMMENT '当前用户是否掌握: 0-否, 1-是',
    `created_at` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    `deleted_at` DATETIME(3) DEFAULT NULL COMMENT '软删除时间',
    CONSTRAINT `fk_uw_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_uw_word` FOREIGN KEY (`word_id`) REFERENCES `words`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_user_word` (`user_id`, `word_id`),
    INDEX `idx_user_words_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户单词关联表(生词本)';
