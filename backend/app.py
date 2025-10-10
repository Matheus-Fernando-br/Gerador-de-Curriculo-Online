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

# mêses abreviados em pt-BR (minúsculos como no exemplo)
MONTHS_PT_ABBR = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]

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
# FUNÇÕES DE VALIDAÇÃO E DATA
# ==============================
def parse_data(valor):
    """Tenta ler várias formatações (retorna datetime.date ou None)."""
    if not valor:
        return None
    if isinstance(valor, datetime.date):
        return valor
    fmt_candidates = ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%Y-%m")
    for fmt in fmt_candidates:
        try:
            if fmt == "%Y-%m":
                # valor já no formato YYYY-MM (input type=month)
                # acrescenta dia 01 para parse
                return datetime.datetime.strptime(valor + "-01", "%Y-%m-%d").date()
            else:
                return datetime.datetime.strptime(valor, fmt).date()
        except Exception:
            continue
    return None

def formatar_mes_ano(data_str):
    """Retorna mes_abrev/ANO (ex: 'fev/2024') a partir de string ou date."""
    d = parse_data(data_str)
    if not d:
        return ""
    mes = MONTHS_PT_ABBR[d.month - 1]
    return f"{mes}/{d.year}"

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
            # se fim não existir e trabalhoAtual for True, ok
            if inicio and fim and inicio > fim:
                return f"A data de início é maior que a de término em '{tipo}'."
            if (item.get("inicio") and not inicio) or (item.get("fim") and item.get("fim") and not fim):
                return f"Datas inválidas em '{tipo}'. Use formato válido."
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
    cnh = data.get("cnh", "")
    objetivo = data.get("objetivo", "")

    c.setFont(FONT_BOLD, 16)
    c.drawCentredString(PAGE_WIDTH / 2, y, nome)
    y -= 10 * mm

    contato = f"Telefone: {telefone}   |   Email: {email}"
    if cidade:
        contato += f"   |   Cidade: {cidade}"
    if cnh:
        contato += f"   |   CNH: {str(cnh).upper()}"
    c.setFont(FONT_REGULAR, 10)
    c.drawCentredString(PAGE_WIDTH / 2, y, contato)
    y -= 8 * mm

    c.setLineWidth(0.8)
    c.line(MARGIN_LEFT_RIGHT, y, PAGE_WIDTH - MARGIN_LEFT_RIGHT, y)
    y -= 8 * mm

    # Funções locais de escrita
    def section_title(title):
        nonlocal y
        # espaço extra antes do título para separar da seção anterior
        y -= 3 * mm
        if y < MARGIN_BOTTOM + 20:
            c.showPage()
            y = PAGE_HEIGHT - MARGIN_TOP
        c.setFont(FONT_BOLD, 14)
        c.drawString(MARGIN_LEFT_RIGHT, y, title)
        y -= 7 * mm  # espaço após título

    def subsection(title):
        nonlocal y
        if y < MARGIN_BOTTOM + 20:
            c.showPage()
            y = PAGE_HEIGHT - MARGIN_TOP
        c.setFont(FONT_BOLD_ITALIC, 12)
        c.drawString(MARGIN_LEFT_RIGHT, y, title)
        y -= 6 * mm

    def texto_normal(text, fontname=FONT_REGULAR, fontsize=10, leading=12):
        nonlocal y
        y = draw_wrapped(c, text, fontname, fontsize, MARGIN_LEFT_RIGHT, y, usable_width, leading=leading)
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
            inicio = formatar_mes_ano(f.get("inicio"))
            fim = formatar_mes_ano(f.get("fim"))

            periodo = ""
            if str(status).lower() == "cursando":
                periodo = f"{inicio} até o momento" if inicio else "Cursando"
            elif inicio and fim:
                periodo = f"{inicio} a {fim}"
            elif inicio:
                periodo = f"Início: {inicio}"
            elif fim:
                periodo = f"Término: {fim}"

            # montar a linha e imprimir com marcador seta
            parts = [p for p in [curso, escola, status if status else None, periodo if periodo else None] if p]
            linha = " | ".join(parts)
            if linha:
                # bullet seta antes de cada formação
                if y < MARGIN_BOTTOM + 30:
                    c.showPage()
                    y = PAGE_HEIGHT - MARGIN_TOP
                c.setFont(FONT_REGULAR, 10)
                c.drawString(MARGIN_LEFT_RIGHT + 4 * mm, y, u"\u2192 " + linha)  # seta
                y -= 6 * mm
        y -= 4 * mm

    # Conhecimentos
    conhecimentos = data.get("conhecimentos", [])
    # aceitar também formatos que possuam 'descricao' ou 'categoria' ou strings simples
    if conhecimentos:
        section_title("Conhecimentos")
        for k in conhecimentos:
            desc = ""
            if isinstance(k, dict):
                desc = k.get("descricao") or k.get("categoria") or ""
            else:
                desc = str(k)
            if desc:
                if y < MARGIN_BOTTOM + 30:
                    c.showPage()
                    y = PAGE_HEIGHT - MARGIN_TOP
                c.setFont(FONT_REGULAR, 10)
                c.drawString(MARGIN_LEFT_RIGHT + 4 * mm, y, u"\u2022 " + desc)  # bolinha
                y -= 6 * mm
        y -= 4 * mm

    # Cursos (compatível com 'cursos' e 'cursosQualificacoes')
    cursos_list = data.get("cursos", []) or data.get("cursosQualificacoes", [])
    if cursos_list:
        section_title("Cursos e Qualificações")
        for cq in cursos_list:
            if isinstance(cq, dict):
                curso = cq.get("curso", "")
                instituicao = cq.get("instituicao", "")
                duracao = cq.get("duracao", "")
                ano = cq.get("ano", "")
                inicio = formatar_mes_ano(cq.get("inicio"))
                fim = formatar_mes_ano(cq.get("fim"))
            else:
                curso = str(cq)
                instituicao = duracao = ano = inicio = fim = ""

            # Priorizar período se existir
            periodo = ""
            if inicio and fim:
                periodo = f"{inicio} a {fim}"
            elif inicio:
                periodo = f"{inicio}"
            elif ano:
                periodo = str(ano)

            parts = [p for p in [curso, instituicao, duracao, periodo] if p]
            linha = " | ".join(parts)
            if linha:
                if y < MARGIN_BOTTOM + 30:
                    c.showPage()
                    y = PAGE_HEIGHT - MARGIN_TOP
                c.setFont(FONT_REGULAR, 10)
                c.drawString(MARGIN_LEFT_RIGHT + 4 * mm, y, u"\u2192 " + linha)  # seta
                y -= 6 * mm
        y -= 4 * mm

    # Experiência
    experiencias = data.get("experiencias", [])
    if experiencias:
        section_title("Experiência Profissional")
        for e in experiencias:
            empresa = e.get("empresa", "")
            cargo = e.get("cargo", "")
            # Backwards compatibility: pode vir 'trabalhoAtual' (bool) do front-end React
            trabalho_atual = e.get("trabalhoAtual", False) or (str(e.get("status") or "").lower() == "atual")
            inicio = formatar_mes_ano(e.get("inicio"))
            fim = formatar_mes_ano(e.get("fim"))
            atribuicoes = e.get("atribuicoes", []) or []

            periodo = ""
            if trabalho_atual:
                periodo = f"{inicio} até o momento" if inicio else "Até o momento"
            elif inicio and fim:
                periodo = f"{inicio} a {fim}"
            elif inicio:
                periodo = f"{inicio}"
            elif fim:
                periodo = f"{fim}"

            if empresa:
                subsection(empresa)

            linha = " | ".join([p for p in [cargo, periodo] if p])
            if linha:
                texto_normal(linha)

            # Atribuições com marcadores seta
            if atribuicoes:
                c.setFont(FONT_BOLD, 10)
                c.drawString(MARGIN_LEFT_RIGHT, y, "Atribuições:")
                y -= 5 * mm
                for a in atribuicoes:
                    if a:
                        if y < MARGIN_BOTTOM + 30:
                            c.showPage()
                            y = PAGE_HEIGHT - MARGIN_TOP
                        c.setFont(FONT_REGULAR, 10)
                        c.drawString(MARGIN_LEFT_RIGHT + 6 * mm, y, u"\u2192 " + str(a))
                        y -= 6 * mm
                y -= 4 * mm

            # adicionar um espaço entre empresas
            y -= 4 * mm

    # Idiomas
    idiomas = data.get("idiomas", [])
    if idiomas:
        section_title("Idiomas")
        for idi in idiomas:
            if isinstance(idi, dict):
                idioma = idi.get("idioma", "")
                nivel = idi.get("nivel", "")
            else:
                # possibilita string simples "Inglês - Avançado"
                idioma = str(idi)
                nivel = ""
            linha = " | ".join([p for p in [idioma, nivel] if p])
            if linha:
                if y < MARGIN_BOTTOM + 30:
                    c.showPage()
                    y = PAGE_HEIGHT - MARGIN_TOP
                c.setFont(FONT_REGULAR, 10)
                c.drawString(MARGIN_LEFT_RIGHT + 4 * mm, y, u"\u2192 " + linha)
                y -= 6 * mm
        y -= 4 * mm

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
