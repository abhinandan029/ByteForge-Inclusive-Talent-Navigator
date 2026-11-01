
import re
from io import BytesIO
from pypdf import PdfReader
from docx import Document


def extract_text_from_pdf(file_content: bytes) -> str:
    pdf_file = BytesIO(file_content)
    reader = PdfReader(pdf_file)

    extracted_pages = []

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            # Remove unwanted control characters, including DEL (\x7f).
            page_text = re.sub(
                r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]",
                "",
                page_text
            )

            extracted_pages.append(page_text.strip())

    return "\n\n".join(extracted_pages).strip()


def extract_text_from_docx(file_content: bytes) -> str:
    """
    Extract text from a DOCX document.
    """

    docx_file = BytesIO(file_content)
    document = Document(docx_file)

    extracted_content = []

    # Extract paragraph text
    for paragraph in document.paragraphs:
        text = paragraph.text.strip()

        if text:
            extracted_content.append(text)

    # Extract table content
    for table in document.tables:
        for row in table.rows:
            row_content = [
                cell.text.strip()
                for cell in row.cells
                if cell.text.strip()
            ]

            if row_content:
                extracted_content.append(" | ".join(row_content))

    return "\n".join(extracted_content).strip()


def extract_document_text(
    file_content: bytes,
    file_name: str
) -> str:
    """
    Identify the document type and extract its text.
    """

    extension = file_name.lower().rsplit(".", 1)[-1]

    if extension == "pdf":
        return extract_text_from_pdf(file_content)

    elif extension == "docx":
        return extract_text_from_docx(file_content)

    else:
        raise ValueError(
            "Unsupported document format. "
            "Only PDF and DOCX files are supported."
        )
