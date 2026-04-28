# 第一阶段：编译阶段
# 使用 golang:1.21-alpine 作为基础镜像，体积小且包含必要的构建工具
FROM golang:1.26-alpine AS builder

# 设置环境变量
# CGO_ENABLED=0：关闭 CGO，确保编译出的二进制文件在 Alpine 镜像中能直接运行
# GOOS=linux：指定目标操作系统为 Linux
ENV CGO_ENABLED=0 GOOS=linux GO111MODULE=on GOPROXY=https://goproxy.cn,direct

# 设置工作目录
WORKDIR /app

# 先拷贝依赖文件并下载，利用 Docker 层缓存机制，只要 go.mod 不变就不会重复下载依赖
COPY go.mod go.sum ./
RUN go mod download

# 拷贝源代码
COPY . .

# 编译项目
# -ldflags="-s -w"：压缩二进制体积，移除调试符号
# -o main：指定输出文件名为 main
RUN go build -ldflags="-s -w" -o main .

# 第二阶段：运行阶段
# 使用极小的 alpine 镜像作为运行环境
FROM alpine:3.18

# 安装必要的工具，如 ca-certificates（调用 AI API 或其他 HTTPS 接口必选）
# tzdata 用于设置时区
RUN apk --no-cache add ca-certificates tzdata

# 设置时区为亚洲/上海
ENV TZ=Asia/Shanghai

WORKDIR /app

# 从编译阶段拷贝生成的二进制文件
COPY --from=builder /app/main .

# 如果你有配置文件（如 config.yaml），取消下面这一行的注释
# COPY --from=builder /app/config.yaml ./config.yaml

# 暴露后端服务端口（根据你的 Gin 配置修改，默认通常是 8080）
EXPOSE 8080

# 启动程序
ENTRYPOINT ["./main"]