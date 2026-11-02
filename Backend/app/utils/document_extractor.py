
import re
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

    return text.strip()


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

    return "\n\n".join(extracted_pages).strip()


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
