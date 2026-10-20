// API de autenticação do Plano Plus (Node puro, sem dependências).
//
// Variáveis de ambiente (configuradas no Render):
//   ADMIN_USER      usuário de acesso
//   ADMIN_PASSWORD  senha de acesso
//   TOKEN_SECRET    segredo usado para assinar os tokens
//   ALLOWED_ORIGIN  origens permitidas no CORS, separadas por vírgula (padrão: *)
//   PORT            porta (o Render define automaticamente)

const http = require("http");
const crypto = require("crypto");

const PORT = process.env.PORT || 4000;
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TOKEN_SECRET = process.env.TOKEN_SECRET || crypto.randomBytes(32).toString("hex");
const ALLOWED_ORIGIN = (process.env.ALLOWED_ORIGIN || "*").split(",").map((o) => o.trim());
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 horas

if (!ADMIN_USER || !ADMIN_PASSWORD) {
  console.warn("[aviso] ADMIN_USER/ADMIN_PASSWORD não definidos: o login ficará indisponível.");
}

const b64url = (buf) => Buffer.from(buf).toString("base64url");

const sign = (data) => crypto.createHmac("sha256", TOKEN_SECRET).update(data).digest("base64url");

// Comparação em tempo constante (evita timing attacks)
const safeEqual = (a, b) => {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
};

const createToken = (usuario) => {
  const payload = b64url(JSON.stringify({ u: usuario, exp: Date.now() + TOKEN_TTL_MS }));
  return `${payload}.${sign(payload)}`;
};

const verifyToken = (token) => {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [payload, signature] = token.split(".");
  if (!safeEqual(signature, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!data.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
};

// Limite simples de tentativas de login por IP
const attempts = new Map();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

const tooManyAttempts = (ip) => {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    attempts.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
};

const setCors = (req, res) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGIN.includes("*")) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (origin && ALLOWED_ORIGIN.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

const sendJson = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
};

const readJson = (req) =>
  new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 10_000) {
        reject(new Error("payload grande demais"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });

const server = http.createServer(async (req, res) => {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url, "http://localhost");

  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/api/health")) {
    return sendJson(res, 200, { status: "ok" });
  }

  if (req.method === "POST" && url.pathname === "/api/login") {
    const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
    if (tooManyAttempts(ip)) {
      return sendJson(res, 429, { erro: "Muitas tentativas. Aguarde alguns minutos e tente novamente." });
    }

    let body;
    try {
      body = await readJson(req);
    } catch {
      return sendJson(res, 400, { erro: "Requisição inválida." });
    }

    if (!ADMIN_USER || !ADMIN_PASSWORD) {
      return sendJson(res, 503, { erro: "Login indisponível no momento." });
    }

    const usuario = String(body.usuario || "").trim();
    const senha = String(body.senha || "");
    const ok = safeEqual(usuario, ADMIN_USER) & safeEqual(senha, ADMIN_PASSWORD);

    if (!ok) {
      return sendJson(res, 401, { erro: "Usuário ou senha incorretos." });
    }

    attempts.delete(ip);
    return sendJson(res, 200, { token: createToken(usuario), usuario });
  }

  if (req.method === "GET" && url.pathname === "/api/me") {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const data = verifyToken(token);
    if (!data) return sendJson(res, 401, { erro: "Sessão inválida ou expirada." });
    return sendJson(res, 200, { usuario: data.u, expiraEm: data.exp });
  }

  return sendJson(res, 404, { erro: "Rota não encontrada." });
});

server.listen(PORT, () => {
  console.log(`API do Gerador de Currículo rodando na porta ${PORT}`);
});
