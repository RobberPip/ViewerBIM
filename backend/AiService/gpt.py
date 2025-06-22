import os
import re
import json
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel
from typing import List

app = FastAPI(
    title="BIM Assistant API",
    description="Обработка JSON и чатов через OpenAI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Настройка OpenAI
client = OpenAI(
    api_key="--",  # ⚠️ В проде храните ключ в env!
    base_url="https://api.proxyapi.ru/openai/v1"
)

class JsonResponse(BaseModel):
    item_ids: str

EXAMPLE_JSON_STRUCTURE = """
[
  {
    "itemId": 123,
    "category": "Wall",
    "name": "Exterior Wall",
    "ifcType": "IFCWALL",
    "props": [
      {
        "expressID": 456,
        "Name": "FireRating",
        "NominalValue": "2h"
      },
      {
        "expressID": 457,
        "Name": "IsExternal",
        "NominalValue": true
      }
    ]
  },
  {
    "itemId": 124,
    "category": "Wall",
    "name": "Interior Wall",
    "ifcType": "IFCWALL",
    "props": [
      {
        "expressID": 458,
        "Name": "LoadBearing",
        "NominalValue": false
      }
    ]
  },
  {
    "itemId": 125,
    "category": "Window",
    "name": "Main Window",
    "ifcType": "IFCWINDOW",
    "props": [
      {
        "expressID": 459,
        "Name": "ThermalTransmittance",
        "NominalValue": 1.2
      }
    ]
  }
]
"""
@app.post("/ai/chat", response_model=JsonResponse)
async def chat_with_files(prompt: str = Form(...), files: List[UploadFile] = File(...)):
    try:
        all_data = []
        for file in files:
            if not file.filename.lower().endswith(".json"):
                return Response(
                    content=json.dumps({"error": f"Файл {file.filename} не является JSON."}, ensure_ascii=False),
                    status_code=400,
                    media_type="application/json"
                )

            contents = await file.read()
            try:
                file_data = json.loads(contents)
                if isinstance(file_data, list):
                    all_data.extend(file_data)
                else:
                    return Response(
                        content=json.dumps({"error": f"Файл {file.filename} должен содержать JSON-массив объектов."}, ensure_ascii=False),
                        status_code=400,
                        media_type="application/json"
                    )
            except json.JSONDecodeError:
                return Response(
                    content=json.dumps({"error": f"Файл {file.filename} содержит некорректный JSON."}, ensure_ascii=False),
                    status_code=400,
                    media_type="application/json"
                )

        sample_data = all_data[:2]  # пример для prompt
        messages = [
            {
                "role": "system",
                "content": (
                    "Ты помощник по BIM-данным. Получаешь переменные:\n"
                    "• data — список объектов BIM-модели со структурой (itemId, name, category, ifcType, props[]);\n"
                    "• prompt — пользовательский запрос на русском языке.\n\n"
                    "Если в prompt есть слово 'условие', сгенерируй код, который ищет объекты по совпадению значений в:\n"
                    "- props[].Name\n"
                    "- props[].NominalValue\n"
                    "- name\n"
                    "- category\n"
                    "- ifcType\n\n"
                    "Если 'условие' нет — пойми, какой тип объектов хочет пользователь (например, стены, окна, двери)\n"
                    "и фильтруй по полю ifcType.\n\n"
                    "Важно: для каждого типа объекта учитывай все возможные ifcType-значения, а не только одно. Примеры:\n"
                    "- стены → IFCWALL и IFCWALLSTANDARDCASE\n"
                    "- перекрытия → IFCSLAB и IFCFLOOR\n"
                    "- окна → IFCWINDOW\n"
                    "- двери → IFCDOOR\n\n"
                    "При фильтрации по типу объекта обязательно используй проверку через оператор in и список ifcType, например:\n"
                    "item['ifcType'] in ['IFCWALL', 'IFCWALLSTANDARDCASE']\n"
                    "не используй сравнение item['ifcType'] == '...'\n\n"
                    "Результат положи в переменную result — это список itemId.\n"
                    "Ничего не комментируй — только Python-код."
                )
            },
            {
                "role": "user",
                "content": (
                    f"prompt = '''{prompt}'''\n"
                    f"# Ниже пример структуры, data — это ПОЛНЫЙ список объектов, здесь только первые два для понимания:\n"
                    f"data = {json.dumps(sample_data, ensure_ascii=False)}\n"
                    f"# Применяй код к полной переменной data"
                )
            }
        ]

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
        )

        raw_code = response.choices[0].message.content.strip()
        code = re.sub(r"^```(?:python)?\n|\n```$", "", raw_code, flags=re.DOTALL).strip()

        safe_globals = {"data": all_data, "prompt": prompt}
        safe_locals = {}
        try:
            exec(code, safe_globals, safe_locals)
            result = safe_locals.get("result", [])
        except Exception as exec_error:
            return Response(
                content=json.dumps({"error": f"Ошибка выполнения кода: {exec_error}"}, ensure_ascii=False),
                status_code=500,
                media_type="application/json"
            )

        item_ids = ",".join(str(x) for x in result)
        return Response(
            content=json.dumps({"item_ids": item_ids}, ensure_ascii=False),
            media_type="application/json"
        )

    except Exception as e:
        return Response(
            content=json.dumps({"error": f"Произошла ошибка: {e}"}, ensure_ascii=False),
            status_code=500,
            media_type="application/json"
        )