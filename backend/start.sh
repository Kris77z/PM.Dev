#!/bin/bash

# 切换到backend/src目录
cd /opt/render/project/src/backend/src

# 启动uvicorn服务器
uvicorn main:app --host 0.0.0.0 --port $PORT 