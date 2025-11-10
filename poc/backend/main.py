from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import fitz  # PyMuPDF
import base64
import requests
import json
import tempfile
import os

app = FastAPI(title="OCR POC")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

API_URL = "https://mkp-api.fptcloud.com/v1/chat/completions"
VLM_MODEL = "FPT.AI-KIE-v1.7"
LLM_MODEL = "gpt-oss-120b"
API_KEY = "sk-gojYePiQueqAHdllper3UA"


def pdf_to_images(pdf_path: str) -> list:
    """
    Convert PDF pages to base64 encoded images
    Returns: List of base64 encoded images
    """
    images = []
    pdf_document = fitz.open(pdf_path)

    for page_num in range(pdf_document.page_count):
        page = pdf_document[page_num]
        # Render page to image with 2x resolution
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))

        # Convert to bytes
        img_bytes = pix.tobytes("png")

        # Encode to base64
        img_base64 = base64.b64encode(img_bytes).decode("utf-8")
        images.append(f"data:image/png;base64,{img_base64}")

    pdf_document.close()
    return images


def call_vlm_api(image_base64: str) -> str:
    """
    Call VLM API to extract text from image
    Returns: Extracted text in markdown format
    """
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {API_KEY}"}

    payload = {
        "model": "FPT.AI-KIE-v1.7",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Trích xuất toàn bộ dữ liệu chữ từ ảnh thành định dạng markdown, không bỏ sót dữ liệu nào",
                    },
                    {"type": "image_url", "image_url": {"url": image_base64}},
                ],
            }
        ],
        "system_prompt": "Extract all text information from image to Key:Value text format (not a json format). Separate paragraphs with '###'",
        "streaming": False,
        "temperature": 1,
        "max_tokens": 1024,
        "top_p": 1,
        "top_k": 40,
        "presence_penalty": 0,
        "frequency_penalty": 0,
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=60)
        response.raise_for_status()

        result = response.json()
        content = result["choices"][0]["message"]["content"]
        print(content)
        return content
    except Exception as e:
        print(f"Error calling VLM API: {str(e)}")
        return f"Error: {str(e)}"


def call_llm_api(markdown_text: str) -> dict:
    """
    Call LLM API to convert markdown to structured JSON
    Returns: Parsed JSON object or None if error
    """
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {API_KEY}"}

    query = """Bạn là một hệ thống trích xuất dữ liệu chính xác từ văn bản hóa đơn dạng Markdown.
    ## Yêu cầu:
    Phân tích kỹ nội dung Markdown của hóa đơn đầu vào và trả kết quả dưới dạng JSON theo đúng mẫu sau:
    {
        "seller": {
            "name": "",
            "address": "",
            "phone": "",
            "fax": "",
            "tax_code": ""
        },
        "invoice": {
            "title": "",
            "serial": "",
            "number": "",
            "date": "",
            "cqt_code": ""
        },
        "buyer": {
            "name": "",
            "unit_name": "",
            "cccd": "",
            "passport": "",
            "tax_code": "",
            "address": "",
            "payment_method": ""
        },
        "items": [
            {
                "stt": "",
                "name": "",
                "unit": "",
                "quantity": "",
                "unit_price": "",
                "amount": ""
            }
        ],
        "totals": {
            "subtotal": "",
            "vat_rate": "",
            "vat_amount": "",
            "total": "",
            "total_in_words": ""
        }
    }
    ## Quy tắc:
    - Chỉ trả về JSON hợp lệ, không thêm lời giải thích.
    - Nếu trường không tìm thấy, để giá trị là chuỗi rỗng "".
    - Các số tiền BỎ HẾT dấu chấm phân cách hàng nghìn, chỉ giữ lại chữ số (ví dụ: 256.050 -> 256050).
    - Ngày tháng chuyển về định dạng dd/mm/yyyy nếu có thể.
    - Không thay đổi ngữ nghĩa của dữ liệu trong văn bản.
    - Không sửa chính tả của câu gốc.
    
    Dữ liệu đầu vào (Markdown):
    <markdown>
    {markdown_text}
    </markdown>
    """
    query = query.replace("{markdown_text}", markdown_text)
    payload = {
        "model": LLM_MODEL,
        "messages": [{"role": "user", "content": query}],
        "system_prompt": "",
        "streaming": False,
        "temperature": 0,
        "max_tokens": 8192,
        "top_p": 1,
        "top_k": 40,
        "presence_penalty": 0,
        "frequency_penalty": 0,
    }

    try:
        print("\n" + "=" * 50)
        print("🤖 Calling LLM API to parse markdown to JSON...")
        print("=" * 50)

        response = requests.post(API_URL, headers=headers, json=payload, timeout=60)
        response.raise_for_status()

        result = response.json()
        content = result["choices"][0]["message"]["content"]

        # Try to parse JSON from response
        # Sometimes LLM might wrap JSON in code blocks
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        parsed_json = json.loads(content)

        print("\n" + "=" * 50)
        print("✅ JSON PARSED SUCCESSFULLY:")
        print("=" * 50)
        print(json.dumps(parsed_json, indent=2, ensure_ascii=False))
        print("=" * 50 + "\n")

        return parsed_json

    except json.JSONDecodeError as e:
        print(f"❌ Error parsing JSON: {str(e)}")
        print(f"Raw content: {content}")
        return None
    except Exception as e:
        print(f"❌ Error calling LLM API: {str(e)}")
        return None


@app.post("/api/convert")
async def convert_pdf(file: UploadFile = File(...)):
    """
    Upload PDF and convert to text using VLM
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Save uploaded file temporarily
    temp_pdf_path = UPLOAD_DIR / file.filename

    try:
        # Save uploaded file
        with open(temp_pdf_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # Convert PDF to images
        print(f"Converting PDF: {file.filename}")
        images_base64 = pdf_to_images(str(temp_pdf_path))
        print(f"Total pages: {len(images_base64)}")

        # Process each page with VLM API
        results = []
        for idx, img_base64 in enumerate(images_base64):
            print(f"Processing page {idx + 1}/{len(images_base64)}")
            extracted_text = call_vlm_api(img_base64)

            # Parse markdown to JSON using LLM
            parsed_json = call_llm_api(extracted_text)

            results.append(
                {"page": idx + 1, "content": extracted_text, "parsed_json": parsed_json}
            )

        # Clean up temporary file
        os.remove(temp_pdf_path)

        return JSONResponse(
            content={
                "success": True,
                "total_pages": len(images_base64),
                "results": results,
            }
        )

    except Exception as e:
        # Clean up on error
        if temp_pdf_path.exists():
            os.remove(temp_pdf_path)

        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")


@app.get("/")
async def root():
    return {"message": "OCR POC Backend is running"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
