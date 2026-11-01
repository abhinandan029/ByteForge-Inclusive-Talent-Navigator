from app.utils.document_extractor import extract_document_text

file_path = "test_docs/sample_resume.pdf"

with open(file_path, "rb") as file:
    content = file.read()

text = extract_document_text(content, "sample_resume.pdf")

print("Extracted Text:")
print(text)