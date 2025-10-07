from flask import Flask, request, send_file, jsonify, make_response
from flask_cors import CORS
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import simpleSplit
import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Fontes
FONT_REGULAR = "Helvetica"
FONT_BOLD = "Helvetica-Bold"
FONT_ITALIC = "Helvetica-Oblique"
FONT_BOLD_ITALIC = "Helvetica-BoldOblique"

# Margens
PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN_LEFT_RIGHT = 20 * mm
MARGIN_TOP = 30 * mm
MARGIN_BOTTOM = 30 * mm
usable_width = PAGE_WIDTH - 2 * MARGIN_LEFT_RIGHT

def draw_wrapped(c, text, fontname, fontsize, x, y, max_width, leading=None):
    if leading is None:
        leading = fontsize + 2
    lines = []
    for paragraph in str(text).split("\n"):
        wrapped = simpleSplit(paragraph, fontname, fontsize, max_width)
        if not wrapped:
            lines.append("")
        else:
            lines.extend(wrapped)
    for ln in lines:
        if y < MARGIN_BOTTOM + 20:
            c.showPage()
            y = PAGE_HEIGHT - MARGIN_TOP
            c.setFont(FONT_REGULAR, 10)
        c.setFont(fontname, fontsize)
        c.drawString(x, y, ln)
        y -= leading
    return y

def validar_dados(data):
    obrigatorios = ["nome", "telefone", "email", "objetivo"]
    for campo in obrigatorios:
        if not data.get(campo):
            return f"O campo '{campo}' é obrigatório."
    def validar_datas(lista, tipo):
        for item in lista:
            inicio = item.get("inicio")
            fim = item.get("fim")
            if inicio and fim:
                try:
                    di = datetime.datetime.strptime(inicio, "%Y-%m-%d").date()
                    df = datetime.datetime.strptime(fim, "%Y-%m-%d").date()
                    if di > df:
                        return f"Data de início maior que a data de término em '{tipo}'."
                except ValueError:
                    return f"Datas inválidas em '{tipo}'. Use o formato YYYY-MM-DD."
        return None

    if "formacoes" in data:
        erro = validar_datas(data["formacoes"], "formações")
        if erro:
            return erro
    if "experiencias" in data:
        erro = validar_datas(data["experiencias"], "experiências")
        if erro:
            return erro

    return None

def create_pdf(data):
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    y = PAGE_HEIGHT - MARGIN_TOP

    nome = data.get("nome", "")
    telefone = data.get("telefone", "")
    email = data.get("email", "")
    cidade = data.get("cidade", "")
    objetivo = data.get("objetivo", "")

    # Cabeçalho
    c.setFont(FONT_BOLD, 16)
    c.drawCentredString(PAGE_WIDTH / 2, y, nome)
    y -= 10 * mm

    contact_line = f"Telefone: {telefone}   |   Email: {email}"
    if cidade:
        contact_line += f"   |   Cidade: {cidade}"
    c.setFont(FONT_REGULAR, 10)
    c.drawCentredString(PAGE_WIDTH / 2, y, contact_line)
    y -= 8 * mm

    c.setLineWidth(0.8)
    c.line(MARGIN_LEFT_RIGHT, y, PAGE_WIDTH - MARGIN_LEFT_RIGHT, y)
    y -= 8 * mm

    def section_title(title):
        nonlocal y
        c.setFont(FONT_BOLD, 14)
        c.drawString(MARGIN_LEFT_RIGHT, y, title)
        y -= 7 * mm

    def subsection(title):
        nonlocal y
        c.setFont(FONT_BOLD_ITALIC, 12)
        c.drawString(MARGIN_LEFT_RIGHT, y, title)
        y -= 6 * mm

    def texto_normal(text):
        nonlocal y
        y = draw_wrapped(c, text, FONT_REGULAR, 10, MARGIN_LEFT_RIGHT, y, usable_width, leading=12)
        y -= 4 * mm

    # Objetivo
    section_title("Objetivo Profissional")
    texto_normal(objetivo)

    # Formação Acadêmica
    formacoes = data.get("formacoes", [])
    if formacoes:
        section_title("Formação Acadêmica")
        for f in formacoes:
            curso = f.get("curso", "")
            escola = f.get("escola", "")
            status = f.get("status", "")
            inicio = f.get("inicio", "")
            fim = f.get("fim", "")

            periodo = ""
            if status == "Cursando":
                periodo = f"{inicio} até o momento"
            else:
                if inicio and fim:
                    periodo = f"{inicio} a {fim}"
                elif inicio:
                    periodo = f"Início: {inicio}"
                elif fim:
                    periodo = f"Término: {fim}"

            linha = " | ".join([p for p in [curso, escola, status, periodo] if p])
            if linha:
                texto_normal(linha)

    # Experiência Profissional
    experiencias = data.get("experiencias", [])
    if experiencias:
        section_title("Experiência Profissional")
        for e in experiencias:
            empresa = e.get("empresa", "")
            cargo = e.get("cargo", "")
            inicio = e.get("inicio", "")
            fim = e.get("fim", "")
            status = e.get("status", "")  # vamos supor que você inclua status no front

            # Determinar período
            periodo = ""
            if status == "Cursando":
                periodo = f"{inicio} até o momento"
            else:
                if inicio and fim:
                    periodo = f"{inicio} a {fim}"
                elif inicio:
                    periodo = f"Início: {inicio}"
                elif fim:
                    periodo = f"Término: {fim}"

            # Desenhar empresa e cargo
            if empresa:
                subsection(empresa)
            if cargo or periodo:
                linha = " | ".join([p for p in [cargo, periodo] if p])
                texto_normal(linha)

            atribuicoes = e.get("atribuicoes", [])
            if atribuicoes:
                c.setFont(FONT_BOLD, 10)
                c.drawString(MARGIN_LEFT_RIGHT, y, "Atribuições:")
                y -= 5 * mm
                for a in atribuicoes:
                    if y < MARGIN_BOTTOM + 30:
                        c.showPage()
                        y = PAGE_HEIGHT - MARGIN_TOP
                    c.setFont(FONT_REGULAR, 10)
                    c.drawString(MARGIN_LEFT_RIGHT + 6 * mm, y, u"\u2022 " + a)
                    y -= 6 * mm
                y -= 4 * mm

    # Idiomas
    idiomas = data.get("idiomas", [])
    if idiomas:
        section_title("Idiomas")
        for idi in idiomas:
            idioma = idi.get("idioma", "")
            nivel = idi.get("nivel", "")
            linha = " | ".join([p for p in [idioma, nivel] if p])
            if linha:
                texto_normal(linha)

    # Rodapé
    c.setFont(FONT_REGULAR, 8)
    c.drawCentredString(PAGE_WIDTH / 2, MARGIN_BOTTOM / 2, f"Gerado em {datetime.date.today().isoformat()}")

    c.save()
    buffer.seek(0)
    return buffer

@app.route("/generate_pdf", methods=["POST"])
def generate_pdf():
    try:
        data = request.get_json()
        if data is None:
            return jsonify({"error": "Nenhum JSON recebido"}), 400

        erro = validar_dados(data)
        if erro:
            return jsonify({"error": erro}), 400

        buffer = create_pdf(data)
        content = buffer.getvalue()
        buffer.seek(0)

        name = data.get("nome", "curriculo")
        filename = f"curriculo_{name.replace(' ', '_')}.pdf"

        resp = make_response(content)
        resp.headers["Content-Disposition"] = f"attachment; filename={filename}"
        resp.headers["Content-Type"] = "application/pdf"
        resp.headers["Content-Length"] = str(len(content))
        return resp
    except Exception as ex:
        # Retornar erro detalhado
        return jsonify({"error": f"Erro interno no servidor: {str(ex)}"}), 500

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    print(f"Servidor rodando na porta {port}")
    try:
        from waitress import serve
        serve(app, host="0.0.0.0", port=port)
    except Exception:
        app.run(host="0.0.0.0", port=port)
