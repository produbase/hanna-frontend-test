"""Build the editable technical report from its repository Markdown source.

Requires python-docx. For Codex authoring, use the bundled workspace Python.
"""
from pathlib import Path
import re

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
document = Document()
section = document.sections[0]
section.page_width = Inches(8.5)
section.page_height = Inches(11)
section.top_margin = Inches(0.7)
section.bottom_margin = Inches(0.7)
section.left_margin = Inches(0.8)
section.right_margin = Inches(0.8)

normal = document.styles['Normal']
normal.font.name = 'Calibri'
normal.font.size = Pt(11)
normal.font.color.rgb = RGBColor(0, 0, 0)
normal.paragraph_format.space_after = Pt(7)
normal.paragraph_format.line_spacing = 1.08

for name, size in [('Title', 24), ('Heading 1', 14), ('Heading 2', 12)]:
    style = document.styles[name]
    style.font.name = 'Calibri'
    style.font.size = Pt(size)
    style.font.color.rgb = RGBColor(0, 0, 0)
    style.paragraph_format.space_before = Pt(13 if name != 'Title' else 0)
    style.paragraph_format.space_after = Pt(7)

footer = section.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.RIGHT
footer.add_run('Hanna | Tienda online · ')
field = OxmlElement('w:fldSimple')
field.set(qn('w:instr'), 'PAGE')
footer._p.append(field)
for run in footer.runs:
    run.font.size = Pt(9)
    run.font.color.rgb = RGBColor.from_string('666666')

# Remove inherited Word title borders from the bundled default template.
for border in document.styles.element.xpath('.//w:pBdr'):
    border.getparent().remove(border)

document.core_properties.title = 'Memoria técnica de Hanna'
document.core_properties.subject = 'Arquitectura y validación de la prueba técnica frontend'
document.core_properties.author = 'Proyecto Hanna con asistencia de IA'

lines = (ROOT / 'docs/memoria-tecnica.md').read_text().splitlines()
buffer = []
in_code = False


def flush():
    if buffer:
        document.add_paragraph(' '.join(buffer))
        buffer.clear()


for line in lines:
    if line.startswith('```'):
        flush()
        if in_code and document.paragraphs:
            document.paragraphs[-1].paragraph_format.space_after = Pt(7)
        in_code = not in_code
        continue
    if in_code:
        paragraph = document.add_paragraph()
        paragraph.paragraph_format.space_after = Pt(0)
        paragraph.paragraph_format.line_spacing = 1
        run = paragraph.add_run(line)
        run.font.name = 'Courier New'
        run.font.size = Pt(9)
        continue
    if line == '<!-- page -->':
        flush()
        document.add_page_break()
    elif line.startswith('# '):
        flush()
        document.add_paragraph(line[2:], 'Title')
    elif line.startswith('## '):
        flush()
        document.add_heading(line[3:], level=1)
    elif line.startswith('- '):
        flush()
        paragraph = document.add_paragraph(line[2:], 'List Bullet')
        paragraph.paragraph_format.space_after = Pt(5)
    elif re.match(r'^\d+\. ', line):
        flush()
        document.add_paragraph(re.sub(r'^\d+\. ', '', line), 'List Number')
    elif not line.strip():
        flush()
    else:
        buffer.append(line)
flush()

output = ROOT / 'output/doc/memoria-tecnica-hanna.docx'
output.parent.mkdir(parents=True, exist_ok=True)
document.save(output)
print(output)
