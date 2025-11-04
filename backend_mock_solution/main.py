import fitz  # PyMuPDF
from pathlib import Path
from PIL import Image, ImageEnhance
import cv2
import numpy as np


def increase_contrast(image_path, factor=0.5):
    """
    Tăng độ tương phản của ảnh.

    Args:
        image_path: Đường dẫn đến ảnh cần xử lý
        factor: Hệ số tương phản (1.0 = giữ nguyên, >1.0 = tăng, <1.0 = giảm)
                Giá trị đề xuất: 1.5 - 2.0 cho OCR

    Returns:
        PIL Image object đã được xử lý
    """
    img = Image.open(image_path)
    enhancer = ImageEnhance.Contrast(img)
    enhanced_img = enhancer.enhance(factor)
    return enhanced_img


def denoise_image(image_path, h=5, templateWindowSize=7, searchWindowSize=21):
    """
    Loại bỏ nhiễu bằng thuật toán Non-Local Means Denoising của OpenCV.

    Args:
        image_path: Đường dẫn đến ảnh cần xử lý
        h: Filter strength (10 = recommended, càng cao càng mượt nhưng mất chi tiết)
        templateWindowSize: Kích thước template patch (7 hoặc 9)
        searchWindowSize: Kích thước vùng tìm kiếm (21 recommended)

    Returns:
        Numpy array (BGR) đã được khử nhiễu
    """
    # Đọc ảnh
    img = cv2.imread(str(image_path))

    # Áp dụng denoising cho ảnh màu
    denoised = cv2.fastNlMeansDenoisingColored(
        img,
        None,
        h=h,
        hColor=h,
        templateWindowSize=templateWindowSize,
        searchWindowSize=searchWindowSize,
    )

    return denoised


def convert_pdf_to_images(pdf_path, output_folder):
    """
    Convert each page of a PDF to an image and save to output folder.

    Args:
        pdf_path: Path to the input PDF file
        output_folder: Path to the output folder for images
    """
    # Create output folder if it doesn't exist
    output_path = Path(output_folder)
    output_path.mkdir(exist_ok=True)

    # Open the PDF
    pdf_document = fitz.open(pdf_path)

    print(f"Processing PDF: {pdf_path}")
    total_pages = pdf_document.page_count
    print(f"Total pages: {total_pages}")

    # Convert each page to image
    for page_num in range(total_pages):
        page = pdf_document[page_num]

        # Render page to image (matrix for resolution, default is 72dpi, 2.0 = 144dpi)
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))

        # Save image
        output_file = output_path / f"page_{page_num + 1}.png"
        pix.save(output_file)

        print(f"📄 Processing page {page_num + 1}/{total_pages}...")

        # STEP 1: Tăng độ tương phản
        enhanced_img = increase_contrast(output_file, factor=2)
        enhanced_img.save(output_file)

        # STEP 2: Khử nhiễu với OpenCV
        denoised_img = denoise_image(output_file, h=10)
        cv2.imwrite(str(output_file), denoised_img)

        print(f"✓ Saved: {output_file}")

    pdf_document.close()
    print(f"Conversion complete! {total_pages} pages saved.")


def main():
    pdf_path = "OCR_INPUT_DEMO.pdf"
    output_folder = "output"

    convert_pdf_to_images(pdf_path, output_folder)


if __name__ == "__main__":
    main()
