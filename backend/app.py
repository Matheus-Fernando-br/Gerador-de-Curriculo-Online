from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import simpleSplit
import datetime
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# ==============================
# CONFIGURAÇÕES GERAIS
# ==============================
FONT_REGULAR = "Helvetica"
FONT_BOLD = "Helvetica-Bold"
FONT_ITALIC = "Helvetica-Oblique"
FONT_BOLD_ITALIC = "Helvetica-BoldOblique"

PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN_LEFT_RIGHT = 20 * mm
MARGIN_TOP = 30 * mm
MARGIN_BOTTOM = 30 * mm
usable_width = PAGE_WIDTH - 2 * MARGIN_LEFT_RIGHT


# ==============================
# FUNÇÃO DE TEXTO AUTOMÁTICO
# ==============================
def draw_wrapped(c, text, fontname, fontsize, x, y, max_width, leading=None):
    """Desenha texto com quebra automática de linha."""
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


# ==============================
# FUNÇÕES DE VALIDAÇÃO
# ==============================
def parse_data(valor):
    if not valor:
        return None
    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%Y-%m"):
        try:
            if fmt == "%Y-%m":
                valor += "-01"
            return datetime.datetime.strptime(valor, "%Y-%m-%d").date()
        except ValueError:
            continue
    return None

def formatar_data_brasil(data_str):
    """Converte uma string de data para formato DD/MM/YYYY."""
    data = parse_data(data_str)
    if data:
        return data.strftime("%d/%m/%Y")
    return data_str or ""


def validar_dados(data):
    """Valida campos obrigatórios e datas."""
    obrigatorios = ["nome", "telefone", "email", "objetivo"]
    for campo in obrigatorios:
        if not data.get(campo):
            return f"O campo '{campo}' é obrigatório."

    def validar_datas(lista, tipo):
        for item in lista:
            inicio = parse_data(item.get("inicio"))
            fim = parse_data(item.get("fim"))
            if inicio and fim and inicio > fim:
                return f"A data de início é maior que a de término em '{tipo}'."
            if (item.get("inicio") and not inicio) or (item.get("fim") and not fim):
                return f"Datas inválidas em '{tipo}'. Use o formato DD/MM/YYYY."
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


# ==============================
# CRIAÇÃO DO PDF
# ==============================
def create_pdf(data):
    """Gera o PDF do currículo."""
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    y = PAGE_HEIGHT - MARGIN_TOP

    # Cabeçalho
    nome = data.get("nome", "")
    telefone = data.get("telefone", "")
    email = data.get("email", "")
    cidade = data.get("cidade", "")
    objetivo = data.get("objetivo", "")

    c.setFont(FONT_BOLD, 16)
    c.drawCentredString(PAGE_WIDTH / 2, y, nome)
    y -= 10 * mm

    contato = f"Telefone: {telefone}   |   Email: {email}"
    if cidade:
        contato += f"   |   Cidade: {cidade}"
    c.setFont(FONT_REGULAR, 10)
    c.drawCentredString(PAGE_WIDTH / 2, y, contato)
    y -= 8 * mm

    c.setLineWidth(0.8)
    c.line(MARGIN_LEFT_RIGHT, y, PAGE_WIDTH - MARGIN_LEFT_RIGHT, y)
    y -= 8 * mm

    # Funções locais de escrita
    def section_title(title):
        nonlocal y
        if y < MARGIN_BOTTOM + 20:
            c.showPage()
            y = PAGE_HEIGHT - MARGIN_TOP
        c.setFont(FONT_BOLD, 14)
        c.drawString(MARGIN_LEFT_RIGHT, y, title)
        y -= 7 * mm

    def subsection(title):
        nonlocal y
        if y < MARGIN_BOTTOM + 20:
            c.showPage()
            y = PAGE_HEIGHT - MARGIN_TOP
        c.setFont(FONT_BOLD_ITALIC, 12)
        c.drawString(MARGIN_LEFT_RIGHT, y, title)
        y -= 6 * mm

    def texto_normal(text):
        nonlocal y
        y = draw_wrapped(c, text, FONT_REGULAR, 10, MARGIN_LEFT_RIGHT, y, usable_width, leading=12)
        y -= 4 * mm

    # Objetivo
    if objetivo:
        section_title("Objetivo Profissional")
        texto_normal(objetivo)

    # Formação
    formacoes = data.get("formacoes", [])
    if formacoes:
        section_title("Formação Acadêmica")
        for f in formacoes:
            curso = f.get("curso", "")
            escola = f.get("escola", "")
            status = f.get("status", "")
            inicio = formatar_data_brasil(f.get("inicio"))
            fim = formatar_data_brasil(f.get("fim"))

            periodo = ""
            if status.lower() == "cursando":
                periodo = f"{inicio} até o momento"
            elif inicio and fim:
                periodo = f"{inicio} a {fim}"
            elif inicio:
                periodo = f"Início: {inicio}"
            elif fim:
                periodo = f"Término: {fim}"

            linha = " | ".join([p for p in [curso, escola, status, periodo] if p])
            if linha:
                texto_normal(linha)

    # Experiência
    experiencias = data.get("experiencias", [])
    if experiencias:
        section_title("Experiência Profissional")
        for e in experiencias:
            empresa = e.get("empresa", "")
            cargo = e.get("cargo", "")
            inicio = formatar_data_brasil(e.get("inicio"))
            fim = formatar_data_brasil(e.get("fim"))
            status = e.get("status", "")
            atribuicoes = e.get("atribuicoes", [])

            periodo = ""
            if status.lower() == "atual":
                periodo = f"{inicio} até o momento"
            elif inicio and fim:
                periodo = f"{inicio} a {fim}"

            if empresa:
                subsection(empresa)
            linha = " | ".join([p for p in [cargo, periodo] if p])
            if linha:
                texto_normal(linha)

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
    c.drawCentredString(
        PAGE_WIDTH / 2,
        MARGIN_BOTTOM / 2,
        f"Gerado automaticamente em {datetime.date.today().strftime('%d/%m/%Y')}"
    )

    c.save()
    buffer.seek(0)
    return buffer


# ==============================
# ENDPOINT PRINCIPAL
# ==============================
@app.route("/generate_pdf", methods=["POST"])
def generate_pdf():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Nenhum JSON recebido."}), 400

        erro = validar_dados(data)
        if erro:
            return jsonify({"error": erro}), 400

        buffer = create_pdf(data)
        content = buffer.getvalue()

        nome = data.get("nome", "curriculo").replace(" ", "_")
        filename = f"curriculo_{nome}.pdf"

        response = make_response(content)
        response.headers["Content-Disposition"] = f"attachment; filename={filename}"
        response.headers["Content-Type"] = "application/pdf"
        response.headers["Content-Length"] = str(len(content))
        return response

    except Exception as ex:
        return jsonify({"error": f"Erro interno no servidor: {str(ex)}"}), 500


# ==============================
# EXECUÇÃO DO SERVIDOR
# ==============================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 Servidor rodando na porta {port}")
    try:
        from waitress import serve
        serve(app, host="0.0.0.0", port=port)
    except Exception:
        app.run(host="0.0.0.0", port=port, debug=True)
