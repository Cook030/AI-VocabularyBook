# AI-Vocabularybook API 文档

## 基础信息

- **Base URL**: `http://localhost/api`
- **认证方式**: JWT Bearer Token
- **Content-Type**: `application/json`

---

## 认证接口

### 1. 用户注册

**请求**
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

**响应成功 (200)**
```json
{
  "code": 0,
  "message": "注册成功",
  "data": null
}
```

**响应失败 (400)**
```json
{
  "code": 400,
  "message": "用户名已存在",
  "data": null
}
```

---

### 2. 用户登录

**请求**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

**响应成功 (200)**
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "testuser"
    }
  }
}
```

**响应失败 (401)**
```json
{
  "code": 401,
  "message": "用户名或密码错误",
  "data": null
}
```

---

## 单词查询接口

> ⚠️ 以下接口需要在请求头中携带 JWT Token
> ```http
> Authorization: Bearer <your_jwt_token>
> ```

### 3. AI 搜索单词

先检查用户是否已保存该单词，已保存则直接返回；未保存则调用 AI 查询。

**请求**
```http
GET /api/words/search?word=hello&model=qwen-plus
Authorization: Bearer <token>
```

**Query 参数**
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| word | string | 是 | - | 要查询的单词 |
| model | string | 否 | qwen-plus | AI 模型名称 |

**响应成功 - 已保存 (200)**
```json
{
  "code": 0,
  "message": "查询成功",
  "data": {
    "word": {
      "id": 5,
      "word": "hello",
      "translation": "int. 打招呼时说我的话",
      "example_sentence": "Hello, how are you?",
      "example_translation": "你好，你好吗？",
      "synonyms": "[\"hi\", \"hey\"]"
    },
    "is_saved": true,
    "definition": {
      "id": 5,
      "word": "hello",
      "translation": "int. 打招呼时说我的话",
      "example_sentence": "Hello, how are you?",
      "example_translation": "你好，你好吗？",
      "synonyms": "[\"hi\", \"hey\"]"
    }
  }
}
```

**响应成功 - 未保存，调用 AI (200)**
```json
{
  "code": 0,
  "message": "查询成功",
  "data": {
    "word": {
      "id": 0,
      "word": "hello",
      "translation": "int. 打招呼时说的话",
      "example_sentence": "Hello, how are you doing?",
      "example_translation": "你好，你最近怎么样？",
      "synonyms": "[\"hi\", \"hey\", \"greetings\"]"
    },
    "is_saved": false,
    "definition": {
      "word": "hello",
      "translation": "int. 打招呼时说的话",
      "example_sentence": "Hello, how are you doing?",
      "example_translation": "你好，你最近怎么样？",
      "synonyms": "[\"hi\", \"hey\", \"greetings\"]"
    }
  }
}
```

**响应失败 (400)**
```json
{
  "code": 400,
  "message": "请输入要查询的单词",
  "data": null
}
```

---

## 生词本接口

> ⚠️ 以下接口需要在请求头中携带 JWT Token
> ```http
> Authorization: Bearer <your_jwt_token>
> ```

### 4. 获取生词本列表

**请求**
```http
GET /api/user-words?page=1&page_size=10
Authorization: Bearer <token>
```

**Query 参数**
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 10 | 每页数量 |

**响应成功 (200)**
```json
{
  "code": 0,
  "message": "查询成功",
  "data": {
    "list": [
      {
        "id": 5,
        "word": "serendipity",
        "translation": "n. 意外发现美好事物的运气",
        "example_sentence": "It was pure serendipity that we met.",
        "example_translation": "我们相遇纯属机缘巧合。",
        "synonyms": "[\"luck\", \"fortune\"]",
        "is_mastered": false
      }
    ],
    "total": 25,
    "page": 1,
    "page_size": 10
  }
}
```

**响应失败 (401)**
```json
{
  "code": 401,
  "message": "未登录或 Token 无效",
  "data": null
}
```

---

### 5. 添加单词到生词本

前端将查询到的完整数据提交给后端，后端写入数据库并与 UserID 绑定。

**请求**
```http
POST /api/user-words
Authorization: Bearer <token>
Content-Type: application/json

{
  "word": "hello",
  "translation": "int. 打招呼时说的话",
  "example_sentence": "Hello, how are you doing?",
  "example_translation": "你好，你最近怎么样？",
  "synonyms": ["hi", "hey", "greetings"]
}
```

**请求体参数**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| word | string | 是 | 英文单词 |
| translation | string | 是 | 中文释义 |
| example_sentence | string | 是 | 英文例句 |
| example_translation | string | 是 | 例句翻译 |
| synonyms | string[] | 是 | 同义词列表 |

**响应成功 (200)**
```json
{
  "code": 0,
  "message": "加入生词本成功",
  "data": {
    "word_id": 5
  }
}
```

**响应失败 (400)**
```json
{
  "code": 400,
  "message": "单词已在生词本中",
  "data": null
}
```

---

### 6. 更新单词掌握状态

**请求**
```http
PATCH /api/user-words/5/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "is_mastered": true
}
```

**路径参数**
| 参数 | 类型 | 说明 |
|------|------|------|
| wordID | uint | 单词 ID |

**请求体**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| is_mastered | bool | 是 | 是否已掌握 |

**响应成功 (200)**
```json
{
  "code": 0,
  "message": "更新成功",
  "data": null
}
```

**响应失败 (401)**
```json
{
  "code": 401,
  "message": "未登录或 Token 无效",
  "data": null
}
```

**响应失败 (404)**
```json
{
  "code": 404,
  "message": "单词不存在",
  "data": null
}
```

---

### 7. 从生词本移除

**请求**
```http
DELETE /api/user-words/5
Authorization: Bearer <token>
```

**路径参数**
| 参数 | 类型 | 说明 |
|------|------|------|
| wordID | uint | 单词 ID |

**响应成功 (200)**
```json
{
  "code": 0,
  "message": "移出生词本成功",
  "data": null
}
```

**响应失败 (401)**
```json
{
  "code": 401,
  "message": "未登录或 Token 无效",
  "data": null
}
```

**响应失败 (404)**
```json
{
  "code": 404,
  "message": "单词不存在",
  "data": null
}
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未登录或 Token 无效 |
| 500 | 服务器内部错误 |

---

## JWT Token 格式

登录成功后，会返回 JWT Token。在需要认证的接口中，通过以下方式传递：

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token 包含以下信息：
- `userID`: 用户 ID
- `username`: 用户名
- `exp`: 过期时间

---

## 业务流程说明

### 单词查询与保存流程

```
1. 用户输入单词进行搜索
       │
       ▼
2. 后端检查该用户是否已保存此单词
       │
       ├─── 已保存 ─── 返回保存的数据 + is_saved: true
       │
       └─── 未保存 ─── 调用 AI 获取释义
                          │
                          ▼
                    返回 AI 数据 + is_saved: false
                          │
                          ▼
3. 前端显示结果，用户可点击"加入生词本"
       │
       ▼
4. 前端将完整单词数据 POST 到 /api/user-words
       │
       ▼
5. 后端写入 words 表 + user_words 表
```
