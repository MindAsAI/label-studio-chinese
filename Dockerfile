# ---------- 阶段 1：构建前端 ----------
FROM node:20 AS frontend-builder

WORKDIR /app

# 1️⃣ 先复制依赖文件以利用缓存（只要 package.json / yarn.lock 不变就不重新安装）
COPY web/package.json web/yarn.lock ./web/

WORKDIR /app/web
RUN yarn install --frozen-lockfile

# 2️⃣ 再复制整个项目，以便构建时能访问外层文件
WORKDIR /app
COPY . .

# 3️⃣ 构建前端
WORKDIR /app/web
RUN yarn build


# ---------- 阶段 2：构建后端 ----------
FROM python:3.10-slim

# Poetry 环境设置
ENV POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_NO_INTERACTION=1 \
    POETRY_HOME="/opt/poetry"

# 安装 Poetry
RUN pip install --no-cache-dir poetry

WORKDIR /app

# 5️⃣ 复制完整项目代码
COPY . .

# 安装 Python 依赖
RUN poetry install

# 6️⃣ 从前端阶段复制已构建的静态文件
COPY --from=frontend-builder /app/web/dist ./web/dist

# 设置 PyPI 镜像加速
ENV POETRY_SOURCE_URL=https://pypi.tuna.tsinghua.edu.cn/simple/

# 收集静态资源
RUN poetry run python label_studio/manage.py collectstatic --noinput

# 执行数据库迁移
RUN poetry run python label_studio/manage.py migrate

EXPOSE 8080

# 启动服务
CMD ["poetry", "run", "python", "label_studio/manage.py", "runserver", "0.0.0.0:8080"]
