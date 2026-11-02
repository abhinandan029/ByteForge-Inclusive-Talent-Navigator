
import re
import os
import shutil
import html
import zipfile
from io import BytesIO
from xml.etree import ElementTree

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


def _extract_text_from_image(file_content: bytes) -> str:
    """Extract text from a standalone image using the configured OCR engine."""
    try:
        import pytesseract
        from PIL import Image
    except ImportError as exc:
        raise RuntimeError(
            "Image OCR requires Pillow, pytesseract, and the Tesseract executable."
        ) from exc

    tesseract_cmd = os.getenv("TESSERACT_CMD")
    if tesseract_cmd:
        pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
    elif not shutil.which("tesseract"):
        raise RuntimeError(
            "Image OCR requires Tesseract. Install it, add it to PATH, "
            "or set TESSERACT_CMD."
        )

    with Image.open(BytesIO(file_content)) as image:
        return sanitize_extracted_text(pytesseract.image_to_string(image))


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


def extract_text_from_plain_text(file_content: bytes) -> str:
    for encoding in ("utf-8-sig", "utf-16", "latin-1"):
        try:
            return sanitize_extracted_text(file_content.decode(encoding))
        except UnicodeDecodeError:
            continue
    raise ValueError("The text document could not be decoded.")


def extract_text_from_rtf(file_content: bytes) -> str:
    text = extract_text_from_plain_text(file_content)
    text = re.sub(r"\\'[0-9a-fA-F]{2}", " ", text)
    text = re.sub(r"\\[a-zA-Z]+-?\d* ?", " ", text)
    text = re.sub(r"[{}]", " ", text)
    return sanitize_extracted_text(html.unescape(text))


def _extract_xml_text(xml_bytes: bytes) -> str:
    root = ElementTree.fromstring(xml_bytes)
    return " ".join(
        text.strip()
        for text in root.itertext()
        if text and text.strip()
    )


def _xml_local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def extract_text_from_xlsx(file_content: bytes) -> str:
    try:
        archive = zipfile.ZipFile(BytesIO(file_content))
    except zipfile.BadZipFile as exc:
        raise ValueError("The XLSX document is corrupted.") from exc

    with archive:
        shared_strings = []
        if "xl/sharedStrings.xml" in archive.namelist():
            shared_root = ElementTree.fromstring(
                archive.read("xl/sharedStrings.xml")
            )
            shared_strings = [
                " ".join(
                    text.strip()
                    for text in item.itertext()
                    if text and text.strip()
                )
                for item in shared_root
            ]

        sheets = [
            name for name in archive.namelist()
            if name.startswith("xl/worksheets/") and name.endswith(".xml")
        ]
        extracted = []
        for sheet in sheets:
            root = ElementTree.fromstring(archive.read(sheet))
            for cell in root.iter():
                if _xml_local_name(cell.tag) == "c":
                    value = next(
                        (
                            child.text
                            for child in cell
                            if _xml_local_name(child.tag) == "v"
                        ),
                        None,
                    )
                    if value:
                        cell_type = cell.attrib.get("t")
                        if cell_type == "s" and value.isdigit():
                            index = int(value)
                            value = (
                                shared_strings[index]
                                if index < len(shared_strings)
                                else value
                            )
                        extracted.append(value)

    return sanitize_extracted_text("\n".join(extracted))


def extract_text_from_pptx(file_content: bytes) -> str:
    try:
        archive = zipfile.ZipFile(BytesIO(file_content))
    except zipfile.BadZipFile as exc:
        raise ValueError("The PPTX presentation is corrupted.") from exc

    with archive:
        slides = [
            name for name in archive.namelist()
            if name.startswith("ppt/slides/slide") and name.endswith(".xml")
        ]
        extracted = [
            _extract_xml_text(archive.read(slide))
            for slide in sorted(slides)
        ]

    return sanitize_extracted_text("\n\n".join(extracted))


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

    if extension in {"txt", "text"}:
        return extract_text_from_plain_text(file_content)

    if extension == "rtf":
        return extract_text_from_rtf(file_content)

    if extension == "xlsx":
        return extract_text_from_xlsx(file_content)

    if extension == "pptx":
        return extract_text_from_pptx(file_content)

    if extension in {"png", "jpg", "jpeg", "tif", "tiff", "bmp", "webp"}:
        return _extract_text_from_image(file_content)

    raise ValueError(
        "Unsupported document format. "
        "Supported formats are PDF, DOCX, TXT, RTF, XLSX, PPTX, and common images."
    )
