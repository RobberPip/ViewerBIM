# ./backend/AiService/Dockerfile

FROM python:3.11-slim

WORKDIR /app

# Установим зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код
COPY . .

# Запускаем uvicorn
CMD ["uvicorn", "gpt:app", "--host", "0.0.0.0", "--port", "5018"]
