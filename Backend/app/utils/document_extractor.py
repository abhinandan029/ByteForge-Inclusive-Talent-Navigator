
import re
import os
import shutil
from io import BytesIO

from pypdf import PdfReader
from docx import Document


def sanitize_extracted_text(text: str) -> str:
    """
    Remove unwanted control characters while preserving
    tabs and line breaks.
    """
    if not text:
        return ""

    text = text.replace("\r\n", "\n").replace("\r", "\n")

    text = re.sub(
        r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]",
        "",
        text
    )

    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"(?<=\w)-\n(?=\w)", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def _extract_text_from_scanned_pdf(file_content: bytes) -> str:
    """Run OCR when a PDF has no embedded text layer."""
    try:
        import fitz
        import pytesseract
        from PIL import Image
    except ImportError as exc:
        raise RuntimeError(
            "This PDF contains no readable text layer. OCR requires "
            "PyMuPDF, Pillow, pytesseract, and the Tesseract executable."
        ) from exc

    tesseract_cmd = os.getenv("TESSERACT_CMD")
    if tesseract_cmd:
        pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
    elif not shutil.which("tesseract"):
        raise RuntimeError(
            "This PDF contains no readable text layer. Install Tesseract "
            "OCR and add its executable to PATH or set TESSERACT_CMD."
        )

    extracted_pages = []
    document = fitz.open(stream=file_content, filetype="pdf")

    try:
        for page in document:
            pixmap = page.get_pixmap(
                matrix=fitz.Matrix(2, 2),
                alpha=False
            )
            image = Image.open(BytesIO(pixmap.tobytes("png")))
            page_text = pytesseract.image_to_string(image)
            page_text = sanitize_extracted_text(page_text)

            if page_text:
                extracted_pages.append(page_text)
    finally:
        document.close()

    return "\n\n".join(extracted_pages).strip()


def extract_text_from_pdf(file_content: bytes) -> str:
    pdf_file = BytesIO(file_content)
    reader = PdfReader(pdf_file)

    extracted_pages = []

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            page_text = sanitize_extracted_text(page_text)

            if page_text:
                extracted_pages.append(page_text)

    text = "\n\n".join(extracted_pages).strip()
    if text:
        return text

    return _extract_text_from_scanned_pdf(file_content)


def extract_text_from_docx(file_content: bytes) -> str:
    docx_file = BytesIO(file_content)
    document = Document(docx_file)

    extracted_content = []

    # Extract paragraph content.
    for paragraph in document.paragraphs:
        text = sanitize_extracted_text(paragraph.text)

        if text:
            extracted_content.append(text)

    # Extract table content.
    for table in document.tables:
        for row in table.rows:
            row_content = [
                sanitize_extracted_text(cell.text)
                for cell in row.cells
                if sanitize_extracted_text(cell.text)
            ]

            if row_content:
                extracted_content.append(" | ".join(row_content))

    return sanitize_extracted_text(
        "\n".join(extracted_content)
    )


def extract_document_text(
    file_content: bytes,
    file_name: str
) -> str:
    """
    Identify the document type and extract its text.
    """

    if "." not in file_name:
        raise ValueError("File extension is missing.")

    extension = file_name.lower().rsplit(".", 1)[-1]

    if extension == "pdf":
        return extract_text_from_pdf(file_content)

    if extension == "docx":
        return extract_text_from_docx(file_content)

    raise ValueError(
        "Unsupported document format. "
        "Only PDF and DOCX files are supported."
    )
