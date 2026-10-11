// ============================================
// bot.js - RIOOMD Telegram Bot
// ============================================
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

// ============================================
// TOKEN - GANTI DI SINI
// ============================================
// Cara dapet: Telegram → @BotFather → /newbot → copy token
// Format: 7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
const TOKEN = process.env.BOT_TOKEN || '8901654512:AAHiYu0ijRGTsZouWHbgicFrFZf48FC8tn4';
const OWNER = process.env.OWNER_USERNAME || '@rio_mddd';
const PANEL_URL = process.env.PANEL_URL || 'https://panel.example.com';

// Validasi token
if (!TOKEN || TOKEN === 'PASTE_TOKEN_KAMU_DI_SINI') {
  console.log('[ERROR] BOT_TOKEN belum diisi!');
  console.log('Cara dapet:');
  console.log('1. Buka Telegram → cari @BotFather');
  console.log('2. Kirim /newbot');
  console.log('3. Ikuti instruksi');
  console.log('4. Copy token ke baris TOKEN di bot.js');
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

// ============================================
// DATABASE
// ============================================
const DB_PATH = path.join(__dirname, 'db', 'users.json');
if (!fs.existsSync(path.dirname(DB_PATH))) fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({ users: [] }));

function loadUsers() {
  try { return JSON.parse(fs.readFileSync(DB_PATH)); } catch(e) { return { users: [] }; }
}
function saveUsers(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}
function findUser(username) {
  return loadUsers().users.find(u => u.username === username);
}
function createUser(username, password, telegramId) {
  const data = loadUsers();
  if (data.users.find(u => u.username === username)) return { ok: false, error: 'Username sudah ada' };
  data.users.push({
    username,
    password: hash(password),
    telegramId,
    role: 'user',
    createdAt: new Date().toISOString()
  });
  saveUsers(data);
  return { ok: true };
}
function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
  return 'h_' + Math.abs(h).toString(36);
}

// ============================================
// TOOLS
// ============================================
const tools = {
  obfuscator: require('./tools/obfuscator'),
  osint: require('./tools/osint'),
  nikparse: require('./tools/nikparse'),
  vpscheck: require('./tools/vpscheck')
};

// ============================================
// /start
// ============================================
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const text = `
🔱 *RIOOMD*

Panel tools dengan tema maroon glass.

• *OBF* — obfuscate JavaScript
• *OSINT* — lookup IP
• *NIK Parse* — data yang berhak kamu proses
• *VPS Check* — informasi server

*Buat akun:*
/createuser username,password

*Owner:* ${OWNER}
*Contact:* ${OWNER}
  `;

  bot.sendMessage(chatId, text, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🌐 BUKA WEB PANEL', url: PANEL_URL }],
        [{ text: '👤 CONTACT OWNER', url: 'https://t.me/' + OWNER.replace('@', '') }]
      ]
    }
  });
});

// ============================================
// /createuser
// ============================================
bot.onText(/\/createuser (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const args = match[1].split(',').map(s => s.trim());

  if (args.length < 2) {
    bot.sendMessage(chatId, '❌ Format: /createuser username,password');
    return;
  }

  const [username, password] = args;
  const result = createUser(username, password, msg.from.id);

  if (result.ok) {
    bot.sendMessage(chatId, `✅ Akun dibuat!\n\nUsername: \`${username}\`\nPassword: \`${password}\`\n\nLogin di: ${PANEL_URL}`, { parse_mode: 'Markdown' });
  } else {
    bot.sendMessage(chatId, `❌ ${result.error}`);
  }
});

// ============================================
// /obf
// ============================================
bot.onText(/\/obf(?:\s+([\s\S]+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  let code = match[1];

  if (!code && msg.reply_to_message) {
    code = msg.reply_to_message.text;
  }

  if (!code) {
    bot.sendMessage(chatId, '❌ Kirim kode atau reply pesan.\n\nContoh:\n`/obf console.log("hello")`', { parse_mode: 'Markdown' });
    return;
  }

  bot.sendMessage(chatId, '⏳ Obfuscating...');

  try {
    const result = await tools.obfuscator.obfuscate(code);
    bot.sendMessage(chatId, '```\n' + result + '\n```', { parse_mode: 'Markdown' });
  } catch (e) {
    bot.sendMessage(chatId, '❌ Error: ' + e.message);
  }
});

// ============================================
// /osint
// ============================================
bot.onText(/\/osint (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const target = match[1].trim();

  bot.sendMessage(chatId, `⏳ Lookup ${target}...`);

  try {
    const result = await tools.osint.lookup(target);
    bot.sendMessage(chatId, '```\n' + result + '\n```', { parse_mode: 'Markdown' });
  } catch (e) {
    bot.sendMessage(chatId, '❌ Error: ' + e.message);
  }
});

// ============================================
// /nik
// ============================================
bot.onText(/\/nik (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const nik = match[1].trim();

  try {
    const result = tools.nikparse.parse(nik);
    bot.sendMessage(chatId, '```\n' + result + '\n```', { parse_mode: 'Markdown' });
  } catch (e) {
    bot.sendMessage(chatId, '❌ Error: ' + e.message);
  }
});

// ============================================
// /vps
// ============================================
bot.onText(/\/vps (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const ip = match[1].trim();

  bot.sendMessage(chatId, `⏳ Check VPS ${ip}...`);

  try {
    const result = await tools.vpscheck.check(ip);
    bot.sendMessage(chatId, '```\n' + result + '\n```', { parse_mode: 'Markdown' });
  } catch (e) {
    bot.sendMessage(chatId, '❌ Error: ' + e.message);
  }
});

// ============================================
// /help
// ============================================
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const text = `
🔱 *RIOOMD COMMANDS*

/start — Menu utama
/createuser username,password — Bikin akun
/obf code — Obfuscate JavaScript
/osint target — IP / domain lookup
/nik 16digit — Parse NIK
/vps IP — Check VPS
/help — Bantuan

*Web Panel:* ${PANEL_URL}
  `;
  bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
});

console.log('[RIOOMD] Bot aktif');
