const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'personality';
const DATA_FILE = path.join(__dirname, 'data', 'submissions.json');
const DATABASE_URL = process.env.DATABASE_URL;

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ====== 存储层 ======
// 配置了 DATABASE_URL（Render Postgres）→ 数据永久保存在数据库；
// 未配置 → 退回本地 data/submissions.json 文件（本地开发/临时运行）。
const db = { insert: null, all: null, remove: null };

if (DATABASE_URL) {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: DATABASE_URL, connectionTimeoutMillis: 10000 });

  pool.query(`CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    rings JSONB NOT NULL,
    scenarios JSONB NOT NULL,
    report JSONB NOT NULL
  )`)
    .then(() => console.log('Postgres 已连接，数据将永久保存'))
    .catch(e => console.error('Postgres 初始化失败:', e.message));

  db.insert = async (s) => {
    await pool.query(
      'INSERT INTO submissions (id, created_at, rings, scenarios, report) VALUES ($1, $2, $3, $4, $5)',
      [s.id, s.createdAt, JSON.stringify(s.rings), JSON.stringify(s.scenarios), JSON.stringify(s.report)]
    );
  };
  db.all = async () => {
    const r = await pool.query('SELECT * FROM submissions ORDER BY created_at');
    return r.rows.map(x => ({
      id: x.id,
      createdAt: x.created_at,
      rings: x.rings,
      scenarios: x.scenarios,
      report: x.report
    }));
  };
  db.remove = async (id) => {
    const r = await pool.query('DELETE FROM submissions WHERE id = $1 RETURNING id', [id]);
    return r.rowCount > 0;
  };
} else {
  // 本地 JSON 文件模式
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf-8');

  const readData = () => {
    try {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch (e) {
      return [];
    }
  };
  const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  };

  db.insert = async (s) => {
    const d = readData();
    d.push(s);
    writeData(d);
  };
  db.all = async () => readData();
  db.remove = async (id) => {
    const d = readData();
    const idx = d.findIndex(s => s.id === id);
    if (idx === -1) return false;
    d.splice(idx, 1);
    writeData(d);
    return true;
  };
}

// ====== 报告计算逻辑（与前端保持一致） ======
const SUGGESTIONS = {
  '学业（考试，论文）': '建议先把"学业压力"改写成本周可完成的一件具体事，例如"优先复习下周小测"或"这周写出论文初稿"。克服完美主义和拖延症。',
  '家庭（父母）': '建议把父母或家庭的期待具体化：是成绩、生活习惯、未来规划，还是沟通方式？尝试和父母交流，但可固定沟通时间，减少临时追问带来的压力。',
  '朋友（室友）': '建议与室友共建作息、卫生、访客规则。当朋友的行为让你感到不适时，主动提出自己的需求。减少消耗性社交，把精力留给支持性关系。',
  '亲密关系（伴侣）': '建议先分清压力来自需求不匹配、时间分配、边界模糊还是冲突方式。在感情中大胆表达自己的需求。遇到困难可寻求朋友和家人的帮助，不把全部情绪压给一个人。',
  '组织（社团）': '建议只保留1—2个核心角色。学会拒绝过多的任务，把任务分工写清，避免一人兜底。社团和组织不是全部价值来源，若已影响睡眠和学业，优先减负。',
  '实习求职（面试，简历）': '建议先明确目标，是探索方向、积累经历还是转正？可把"找实习"拆成小任务，即投递、改简历、准备面试。记录每次收获，接受不确定性。',
  '未来方向（考研，出国）': '建议先做价值澄清，你更看重稳定、成长、收入还是自由？再在自己感兴趣的领域进行尝试，评估每个方向的优劣。',
  '健康（睡眠，饮食）': '建议记录身体信号与作息：睡眠、饮食、运动、疼痛或疲劳出现的时间。多进行户外运动，减少熬夜和连续久坐；小病及时就医。'
};

function computeReport(submission) {
  const rings = submission.rings || {};
  const scenarios = submission.scenarios || [];

  // 主要压力源：内环（分数=3）的标签
  const mainStressors = [];
  for (const [label, score] of Object.entries(rings)) {
    if (score === 3) {
      mainStressors.push({ label, suggestion: SUGGESTIONS[label] || '' });
    }
  }

  // 不一致选项
  const scenarioMap = {};
  scenarios.forEach(s => { scenarioMap[s.label] = s; });

  const inconsistencies = [];
  for (const [label, ringScore] of Object.entries(rings)) {
    const sc = scenarioMap[label];
    if (!sc) continue;
    const diff = Math.abs(ringScore - sc.intensity);
    if (diff === 0) continue;
    const direction = ringScore > sc.intensity ? '高估' : '低估';
    inconsistencies.push({ label, diff, direction, ringScore, intensity: sc.intensity });
  }
  inconsistencies.sort((a, b) => b.diff - a.diff);

  // 应对风格：统计 A/B/C
  const counts = { A: 0, B: 0, C: 0 };
  scenarios.forEach(s => { if (counts[s.coping] !== undefined) counts[s.coping]++; });
  let copingStyle = 'A';
  let max = -1;
  for (const k of ['A', 'B', 'C']) {
    if (counts[k] > max) { max = counts[k]; copingStyle = k; }
  }

  return {
    mainStressors,
    inconsistencies: inconsistencies.slice(0, 4),
    copingStyle,
    counts
  };
}

// ====== API ======
// 参与者提交
app.post('/api/submit', async (req, res) => {
  const body = req.body || {};
  if (!body.rings || !body.scenarios) {
    return res.status(400).json({ error: '数据不完整' });
  }
  const submission = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    rings: body.rings,
    scenarios: body.scenarios,
    report: computeReport(body)
  };
  try {
    await db.insert(submission);
    res.json({ id: submission.id, report: submission.report });
  } catch (e) {
    console.error('保存失败:', e.message);
    res.status(500).json({ error: '保存失败，请重试', detail: e.message });
  }
});

// 管理端鉴权中间件
function adminAuth(req, res, next) {
  const pwd = req.headers['x-admin-password'] || req.query.pwd;
  if (pwd !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: '管理员密码错误' });
  }
  next();
}

// 管理端：获取所有提交
app.get('/api/admin/submissions', adminAuth, async (req, res) => {
  try {
    res.json(await db.all());
  } catch (e) {
    console.error('读取失败:', e.message);
    res.status(500).json({ error: '读取失败' });
  }
});

// 管理端：获取统计概览
app.get('/api/admin/stats', adminAuth, async (req, res) => {
  try {
    const data = await db.all();
    const total = data.length;
    const copingCounts = { A: 0, B: 0, C: 0 };
    const innerCounts = {};
    data.forEach(s => {
      const style = s.report && s.report.copingStyle;
      if (style) copingCounts[style] = (copingCounts[style] || 0) + 1;
      for (const [label, score] of Object.entries(s.rings || {})) {
        if (score === 3) innerCounts[label] = (innerCounts[label] || 0) + 1;
      }
    });
    res.json({ total, copingCounts, innerCounts });
  } catch (e) {
    console.error('读取失败:', e.message);
    res.status(500).json({ error: '读取失败' });
  }
});

// 管理端：删除单条
app.delete('/api/admin/submissions/:id', adminAuth, async (req, res) => {
  try {
    const ok = await db.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: '未找到' });
    res.json({ ok: true });
  } catch (e) {
    console.error('删除失败:', e.message);
    res.status(500).json({ error: '删除失败' });
  }
});

app.listen(PORT, () => {
  console.log(`\n  StressMap 三环压力镜 服务已启动`);
  console.log(`  参与者入口:   http://localhost:${PORT}/`);
  console.log(`  管理后台:     http://localhost:${PORT}/admin.html`);
  console.log(`  管理员密码:   ${ADMIN_PASSWORD}`);
  console.log(`  存储模式:     ${DATABASE_URL ? 'Postgres（永久保存）' : '本地 JSON 文件'}\n`);
});
