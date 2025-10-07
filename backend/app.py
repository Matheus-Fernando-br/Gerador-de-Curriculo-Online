from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import simpleSplit
import datetime
import os

app = Flask(__name__)

# Habilita CORS globalmente (para permitir que o frontend acesse)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Fonte (suporte a acentuação se o arquivo existir)
FONT_PATH = os.path.join(os.path.dirname(__file__), "DejaVuSans.ttf")
if os.path.exists(FONT_PATH):
    pdfmetrics.registerFont(TTFont("DejaVu", FONT_PATH))
    DEFAULT_FONT = "DejaVu"
else:
    DEFAULT_FONT = "Helvetica"

# Configurações de página
PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN = 20 * mm


def create_pdf(data):
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    y = PAGE_HEIGHT - MARGIN

    # Dados do currículo
    name = data.get("nome", "")
    phone = data.get("telefone", "")
    email = data.get("email", "")
    dob = data.get("data_nascimento", "")
    objective = data.get("objetivo", "")
    cursos = data.get("cursos", "")
    experiencias = data.get("experiencias", "")
    cnh = data.get("cnh", "")
    idioma = data.get("idioma", "")

    # Cabeçalho
    c.setFont(DEFAULT_FONT, 18)
    c.drawCentredString(PAGE_WIDTH / 2, y, name)
    y -= 12 * mm

    c.setFont(DEFAULT_FONT, 10)
    contact_line = f"Telefone: {phone}   |   Email: {email}   |   Nasc.: {dob}"
    c.drawCentredString(PAGE_WIDTH / 2, y, contact_line)
    y -= 8 * mm

    c.line(MARGIN, y, PAGE_WIDTH - MARGIN, y)
    y -= 8 * mm

    # Função auxiliar para seções
    def draw_section(title, text):
        nonlocal y
        if not text:
            return
        c.setFont(DEFAULT_FONT, 12)
        c.drawString(MARGIN, y, title)
        y -= 6 * mm
        c.setFont(DEFAULT_FONT, 11)

        lines = []
        for paragraph in str(text).split("\n"):
            wrapped = simpleSplit(paragraph, DEFAULT_FONT, 11, PAGE_WIDTH - 2 * MARGIN)
            if not wrapped:
                lines.append("")
            else:
                lines.extend(wrapped)

        for ln in lines:
            if y < MARGIN + 30:
                c.showPage()
                y = PAGE_HEIGHT - MARGIN
                c.setFont(DEFAULT_FONT, 11)
            c.drawString(MARGIN, y, ln)
            y -= 6 * mm
        y -= 4 * mm

    # Seções
    draw_section("Objetivo", objective)
    draw_section("Cursos", cursos)
    draw_section("Experiências", experiencias)
    draw_section("Idiomas", idioma)
    draw_section("CNH", cnh)

    # Rodapé
    c.setFont(DEFAULT_FONT, 8)
    c.drawCentredString(PAGE_WIDTH / 2, MARGIN / 2, f"Gerado em {datetime.date.today().isoformat()}")
    c.save()

    buffer.seek(0)
    return buffer


@app.route("/generate_pdf", methods=["POST"])
def generate_pdf():
    data = request.get_json()
    if data is None:
        return jsonify({"error": "Nenhum JSON recebido"}), 400

    buffer = create_pdf(data)
    name = data.get("nome", "curriculo")
    filename = f"curriculo_{name.replace(' ', '_')}.pdf"

    return send_file(
        buffer,
        as_attachment=True,
        download_name=filename,
        mimetype="application/pdf",
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
