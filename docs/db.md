
---

# 数据库设计文档：AI 智能单词本系统

## 1. 文档概述
本系统旨在为用户提供一个个性化的 AI 辅助单词学习平台。数据库设计采用 MySQL 8.0+，支持存储用户信息、核心单词库以及用户与单词的个性化学习关系。

## 2. 数据库说明
- **数据库名称**：`ai_vocabulary_db`
- **字符集**：`utf8mb4` (支持多语言及特殊字符)
- **排序规则**：`utf8mb4_unicode_ci`
- **存储引擎**：`InnoDB` (支持事务与外键)

## 3. 表结构详细说明

### 3.1 用户表 (users)
存储用户的基本账号信息及认证数据。

| 字段名 | 数据类型 | 约束 | 备注 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | 唯一标识 |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | 登录用户名 |
| `password` | VARCHAR(255) | NOT NULL | 加密存储的密码 |
| `created_at` | DATETIME(3) | DEFAULT CURRENT_TIMESTAMP(3) | 账号创建时间 |
| `updated_at` | DATETIME(3) | ON UPDATE CURRENT_TIMESTAMP(3) | 资料更新时间 |
| `deleted_at` | DATETIME(3) | INDEX | 软删除时间戳 |

### 3.2 单词定义表 (words)
存储单词及其由 AI 扩展生成的公用教学内容。

| 字段名 | 数据类型 | 约束 | 备注 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | 唯一标识 |
| `word` | VARCHAR(100) | INDEX, NOT NULL | 英文单词原文 |
| `translation` | VARCHAR(255) | DEFAULT '' | 基础中文释义 |
| `example_sentence` | TEXT | - | AI 生成的英文例句 |
| `example_translation` | TEXT | - | 例句的对应中文翻译 |
| `synonyms` | JSON | DEFAULT NULL | 同义词列表 (如 `["term1", "term2"]`) |
| `created_at` | DATETIME(3) | DEFAULT CURRENT_TIMESTAMP(3) | 数据入库时间 |
| `updated_at` | DATETIME(3) | ON UPDATE CURRENT_TIMESTAMP(3) | 数据修改时间 |
| `deleted_at` | DATETIME(3) | INDEX | 软删除时间戳 |

### 3.3 用户单词关联表 (user_words)
记录用户与单词的绑定关系及个性化的学习进度。

| 字段名 | 数据类型 | 约束 | 备注 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | 唯一标识 |
| `user_id` | BIGINT UNSIGNED | FOREIGN KEY (users.id) | 关联的用户 ID |
| `word_id` | BIGINT UNSIGNED | FOREIGN KEY (words.id) | 关联的单词 ID |
| `is_mastered` | TINYINT(1) | DEFAULT 0 | 掌握状态: 0-学习中, 1-已掌握 |
| `created_at` | DATETIME(3) | DEFAULT CURRENT_TIMESTAMP(3) | 用户添加单词时间 |
| `updated_at` | DATETIME(3) | ON UPDATE CURRENT_TIMESTAMP(3) | 进度更新时间 |
| `deleted_at` | DATETIME(3) | INDEX | 软删除时间戳 |

---

## 4. 逻辑设计与关系说明



### 4.1 表关联逻辑
1.  **多对多关系**：用户 (users) 与单词 (words) 之间通过 `user_words` 表形成多对多关系。
    - 一个用户可以收藏/学习多个单词。
    - 一个单词可以被多个用户添加到自己的单词本中。
2.  **唯一性约束**：`user_words` 表设置了 `UNIQUE KEY (user_id, word_id)`，确保同一用户不会重复添加相同的单词。
3.  **级联删除**：设置了 `ON DELETE CASCADE` 约束。当 `users` 表中的账号注销或 `words` 表中的词条被物理删除时，相关的关联记录会自动清理。

### 4.2 特色设计
- **AI 扩展字段**：`words` 表通过 `JSON` 类型存储同义词，方便扩展而无需修改 schema，同时使用 `TEXT` 存储长句例句。
- **性能优化**：对常用查询条件（如 `word` 文本、`user_id`）建立了索引，提升在大数据量下的检索效率。
- **高可用支持**：所有时间字段均精确到毫秒 (`DATETIME(3)`)，并配备 `deleted_at` 字段支持 **软删除 (Soft Delete)**，保障数据的安全性和可追溯性。

---