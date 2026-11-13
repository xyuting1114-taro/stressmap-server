/* ===== StressMap 国际化字典 =====
 * 使用稳定的语义 key（不从中文文案反推），文案可变，key 不变。
 * 默认英文，可切换中文，偏好保存在 localStorage。
 */

const I18N = {
  en: {
    // ---- 顶部 / 通用 ----
    'app.title': 'StressMap · Three-Ring Pressure Mirror',
    'app.shortTitle': 'StressMap',

    // ---- 欢迎页 ----
    'welcome.title': 'StressMap Three-Ring Pressure Mirror',
    'welcome.subtitle': 'A self-awareness tool that helps college students map their main stressors, compare them with their actual stress responses, and get targeted suggestions.',
    'welcome.step1.b': 'Drag',
    'welcome.step1.span': 'Drag 8 identity-related stress domains into the three rings',
    'welcome.step2.b': 'Answer',
    'welcome.step2.span': 'Complete 8 short scenario questions',
    'welcome.step3.b': 'Review',
    'welcome.step3.span': 'See your main stressors, judgment gaps, and coping style',
    'welcome.notice': 'This is not a psychological diagnosis or personality test. Results are for self-awareness only. They do not assess your mental health and do not replace professional help. Your choices have no right or wrong answer and will not be used to evaluate you personally.',
    'welcome.startBtn': 'Start →',
    'welcome.footer': 'About 5–8 min ｜ Anonymous ｜ Exit anytime ｜ No names or IDs collected',

    // ---- 三环拖拽页 ----
    'rings.title': 'Three-Ring Stress Map',
    'rings.guide': 'Judge how much pressure each identity-related domain puts on you. Drag the eight labels into the ring map: the <b>inner ring means high stress</b>, the <b>middle ring means medium stress</b>, and the <b>outer ring means low or no stress</b>. Labels can be moved freely inside the circles; the system automatically prevents overlap.',
    'rings.outer.label': 'Outer · Low stress',
    'rings.middle.label': 'Middle · Medium stress',
    'rings.inner.label': 'Inner · High stress',
    'rings.poolHint': 'Unplaced labels (drag into a ring, or tap to cycle outer→middle→inner):',
    'rings.back': '← Back',
    'rings.next': 'Continue →',
    'rings.alert': 'Please drag all 8 labels into the rings.',

    // ---- 情景题页 ----
    'scenarios.title': 'Scenario Questions',
    'scenarios.guide': 'Read the following situations and choose the matching <b>stress intensity</b> and <b>coping style</b>.',
    'scenarios.intensity': 'Stress intensity',
    'scenarios.coping': 'Your coping style',
    'int.low': 'Low',
    'int.mid': 'Medium',
    'int.high': 'High',
    'scenarios.back': '← Back',
    'scenarios.submit': 'Show result →',
    'scenarios.submitting': 'Submitting...',
    'scenarios.alert': 'Question {n} is not complete. Please choose stress intensity and coping style.',
    'submit.error': 'Submit failed: ',
    'network.error': 'Network error: ',

    // ---- 结果页 ----
    'result.title': 'Your Three-Ring Stress Mirror Report',
    'result.subtitle': 'The following results are generated from your ring placement and scenario answers, for self-awareness reference only.',
    'result.section1': 'I. Main Stressors',
    'result.badge1': 'Inner ring only',
    'result.section2': 'II. Inconsistencies',
    'result.badge2': 'Perception vs. Scenarios',
    'result.section3': 'III. Coping Style',
    'result.empty.main': 'You did not feel significant stress in any identity domain.',
    'result.empty.incons': 'Your perception of stressors is largely consistent with the actual scenarios.',
    'result.tag.high': 'Inconsistent',
    'result.tag.mid': 'Partially consistent',
    'result.incons.over': 'overestimated',
    'result.incons.under': 'underestimated',
    'result.incons.name': 'You may have {dir} the stress in the {label} domain',
    'result.incons.desc.over': 'You placed "{label}" relatively close to the center, but the actual scenario stress was not that high. This is not necessarily wrong — you may simply care a lot about it. Think concretely: what specific event in the past week made you worry? If you cannot find one, try moving the label one ring outward.',
    'result.incons.desc.under': 'You placed "{label}" relatively far from the center, but the scenario questions show it actually does put some pressure on you. Perhaps you are used to carrying it and do not treat it as stress. Try keeping a stress diary: note what happened, how your body felt, and rate the stress level.',
    'result.coping.title': 'Your dominant coping style',
    'result.coping.counts': 'A Solve {a} ｜ B Seek {b} ｜ C Avoid {c}',
    'result.restart': 'Restart',
    'result.footer': 'This tool does not assess mental health status and does not replace professional help. If you need support, please contact your school counseling center.',
    'result.serialLabel': 'Questionnaire ID',
    'result.copingReminder': 'Remember your coping style: {style}',

    // ---- 导出 / 分享 ----
    'result.exportImage': 'Save as Image',
    'result.downloadReport': 'Download Report',
    'result.copyText': 'Copy Text',
    'result.copied': 'Report copied to clipboard!',
    'result.exporting': 'Generating image...',

    // ---- 应对风格说明 ----
    'copingStyle.A.name': 'Problem-solving',
    'copingStyle.A.desc': 'Your coping style is mostly problem-solving, similar to a high-conscientiousness tendency: you like to plan, act, and push things forward. You are reliable, but watch out for perfectionism and burnout. Set a deadline for tasks and allow yourself small mistakes.',
    'copingStyle.B.name': 'Support-seeking',
    'copingStyle.B.desc': 'Your coping style is mostly support-seeking, similar to a high-extraversion tendency: you are willing to talk and ask others for help. This is a great resource. But occasionally practice solving things independently — try analyzing the problem and different solutions before asking for help.',
    'copingStyle.C.name': 'Avoidant',
    'copingStyle.C.desc': 'Your coping style is mostly avoidant, similar to a high-neuroticism tendency: you are sensitive to threats and tend to delay stress through procrastination. This is not your fault — avoiding stress is a bodily instinct. Start with small goals, actively seek solutions, one small step a day, to avoid leaving things to the last minute.',

    // ---- 8 个标签 ----
    'label.academics': 'Academics (exams, papers)',
    'label.family': 'Family (parents)',
    'label.friends': 'Friends (roommates)',
    'label.relationship': 'Romance (partner)',
    'label.organization': 'Org (clubs)',
    'label.career': 'Internships (interviews, résumé)',
    'label.future': 'Future (grad school, abroad)',
    'label.health': 'Health (sleep, diet)',

    // ---- 8 条建议 ----
    'suggestion.academics': 'Try rewriting "academic stress" into one concrete task you can finish this week, e.g. "review next week\'s quiz first" or "finish the first draft of the paper this week." Overcome perfectionism and procrastination.',
    'suggestion.family': 'Try to specify what your parents or family expect: grades, lifestyle habits, future plans, or communication style? Talk to your parents, but set a fixed time to communicate and reduce pressure from impromptu questions.',
    'suggestion.friends': 'Work with roommates to set rules for schedules, hygiene, and visitors. When a friend\'s behavior bothers you, voice your needs proactively. Cut back on draining socializing and save energy for supportive relationships.',
    'suggestion.relationship': 'First clarify whether the pressure comes from mismatched needs, time allocation, blurred boundaries, or conflict style. Express your needs boldly in the relationship. Seek help from friends and family when struggling — do not put all emotional weight on one person.',
    'suggestion.organization': 'Keep only 1–2 core roles. Learn to say no to excessive tasks, write down task divisions clearly, and avoid covering everything alone. Clubs are not your whole source of value; if they affect sleep and academics, prioritize reducing the load.',
    'suggestion.career': 'First clarify your goal: exploring directions, building experience, or getting a full-time offer? Break "finding an internship" into small tasks — applying, revising your résumé, preparing interviews. Record what you gain each time and accept uncertainty.',
    'suggestion.future': 'Start with value clarification: do you value stability, growth, income, or freedom more? Then try out fields you are interested in and evaluate the pros and cons of each direction.',
    'suggestion.health': 'Track your body signals and routines: when sleep, diet, exercise, pain, or fatigue appear. Get more outdoor exercise, reduce late nights and prolonged sitting; see a doctor for minor ailments promptly.',

    // ---- 8 个情景 ----
    'scenario.academics': 'An important course exam is coming up, or a high-weight paper is due soon. You find the workload larger than expected and your schedule a bit tight.',
    'scenario.family': 'Your parents recently expressed high expectations about your grades, future plans, or lifestyle, or you disagree on a decision and still feel unheard after talking.',
    'scenario.friends': 'You and a friend or roommate recently had a misunderstanding or lifestyle conflict, or you feel distanced and struggle to fit into a group. You are not sure whether to bring it up.',
    'scenario.relationship': 'In a close relationship (partner, crush, or important other) you face poor communication, mismatched expectations, or an uncertain status (long-distance, cold war, undefined). You keep thinking about it but are unsure how to handle it.',
    'scenario.organization': 'You are responsible for a task in a club, student union, team, or course group. As the event or deadline approaches, cooperation has unclear divisions, someone is not cooperating, or the burden falls on you.',
    'scenario.career': 'You are looking for an internship/part-time job, revising your résumé, preparing interviews, or preparing for research or job applications. You find competition fiercer than expected, or are unsure whether your experience is enough.',
    'scenario.future': 'Thinking about post-graduation plans (grad school, job, going abroad, civil service, etc.) or longer-term life goals, you feel lost: many options but unsure which fits you, or worried about choosing wrong. When others ask, you do not quite know how to answer.',
    'scenario.health': 'Recently you have been sleeping less, exercising less, eating irregularly, or feeling unwell, and it has affected your daytime state. You know you should adjust, but are not sure you can follow through.',

    // ---- 应对选项 ----
    'coping.A': 'Communicate proactively, make a plan, and break the problem into steps',
    'coping.B': 'Talk to someone, ask for advice, or seek support from others',
    'coping.C': 'Put it aside for now, avoid or procrastinate, distract yourself with other things'
  },

  zh: {
    'app.title': 'StressMap · 三环压力镜',
    'app.shortTitle': 'StressMap',

    'welcome.title': 'StressMap 三环压力镜',
    'welcome.subtitle': '一个帮助大学生梳理主要压力源、对照自己的压力判断、获得针对性建议的自我觉察工具。',
    'welcome.step1.b': '拖一拖',
    'welcome.step1.span': '把 8 个身份相关压力领域拖入三环',
    'welcome.step2.b': '答一答',
    'welcome.step2.span': '完成 8 个简短情景题',
    'welcome.step3.b': '看一看',
    'welcome.step3.span': '查看你的主要压力源、判断偏差与应对风格',
    'welcome.notice': '这不是心理诊断，也不是人格测试。结果仅供自我觉察，不评估你的心理健康状态，不替代专业帮助。你的选择没有对错，也不会被用于评价你个人。',
    'welcome.startBtn': '开始察觉 →',
    'welcome.footer': '约 5–8 分钟 ｜ 匿名 ｜ 可随时退出 ｜ 不收集姓名和学号',

    'rings.title': '三环压力图',
    'rings.guide': '你需要根据自身情况，判断下列身份相关领域给你带来的压力。把八个标签拖入三环压力图中，<b>内环代表高压力</b>，<b>中环代表中压力</b>，<b>外环代表低压力或没有压力</b>。标签可在圆环内自由拖动，系统会自动避免重叠。',
    'rings.outer.label': '外环 · 低压力',
    'rings.middle.label': '中环 · 中压力',
    'rings.inner.label': '内环 · 高压力',
    'rings.poolHint': '未分类标签（拖入圆环，或点击循环放入外/中/内环）：',
    'rings.back': '← 返回',
    'rings.next': '继续 →',
    'rings.alert': '请把所有 8 个标签都拖入三环中。',

    'scenarios.title': '情景选择题',
    'scenarios.guide': '阅读下列情境，请你选择对应的<b>压力强度</b>和<b>应对方式</b>。',
    'scenarios.intensity': '压力强度',
    'scenarios.coping': '你的应对方式',
    'int.low': '低',
    'int.mid': '中',
    'int.high': '高',
    'scenarios.back': '← 返回',
    'scenarios.submit': '显示结果 →',
    'scenarios.submitting': '提交中...',
    'scenarios.alert': '第 {n} 题还没完成，请选择压力强度和应对方式。',
    'submit.error': '提交失败：',
    'network.error': '网络错误：',

    'result.title': '你的三环压力镜报告',
    'result.subtitle': '以下结果基于你的三环归类与情景题回答生成，仅供自我觉察参考。',
    'result.section1': '一、主要压力源',
    'result.badge1': '仅显示内环',
    'result.section2': '二、不一致选项',
    'result.badge2': '认知 vs 情景',
    'result.section3': '三、应对风格',
    'result.empty.main': '你在各个身份领域中均没有感受到显著压力。',
    'result.empty.incons': '你对自身压力源的认知与实际基本一致。',
    'result.tag.high': '不一致',
    'result.tag.mid': '部分一致',
    'result.incons.over': '高估',
    'result.incons.under': '低估',
    'result.incons.name': '你可能{dir}了在 {label} 领域的压力',
    'result.incons.desc.over': '你把"{label}"这个标签放得比较靠内，但具体情景里的压力没有那么大。这不一定是错，可能只是你一直很在意它。可以具体想想：最近一周到底哪件事让你担心？如果一时找不到，可以把标签往外调一格。',
    'result.incons.desc.under': '你在环上把"{label}"放得较外，但情景题显示它其实有点让你感到压力。也许你习惯了扛着，没把它当成压力。可以试着写压力日记，记录一下发生了什么、身体什么感觉、压力打几分。',
    'result.coping.title': '你的主导应对方式',
    'result.coping.counts': 'A 解决 {a} 次 ｜ B 求助 {b} 次 ｜ C 回避 {c} 次',
    'result.restart': '重新测试',
    'result.footer': '本工具不评估心理健康状态，不替代专业帮助。如需支持，请联系学校心理咨询中心。',
    'result.serialLabel': '问卷编号',
    'result.copingReminder': '记住你的问题应对类型：{style}',

    // ---- 导出 / 分享 ----
    'result.exportImage': '保存为图片',
    'result.downloadReport': '下载报告',
    'result.copyText': '复制文本',
    'result.copied': '报告已复制到剪贴板！',
    'result.exporting': '正在生成图片...',

    'copingStyle.A.name': '解决型',
    'copingStyle.A.desc': '你对压力的应对方式多为解决型，有点像尽责性较高的倾向：习惯计划、行动、把事情推进好。这样的你很可靠，但也要小心完美主义和过劳。建议给任务设个截止时间，允许自己犯一点小错。',
    'copingStyle.B.name': '求助型',
    'copingStyle.B.desc': '你对压力的应对方式多为求助型，有点像外向性较高的倾向：愿意说、也愿意找人帮忙。这是很好的资源。但也可以偶尔练练独立解决，建议求助前先试着分析问题，尝试不同解决方法。',
    'copingStyle.C.name': '回避型',
    'copingStyle.C.desc': '你对压力的应对方式多为回避型，有点像神经质较高的倾向：对威胁较为敏感，习惯用拖延来延缓压力。但这不怪你，规避压力本来就是身体的本能。建议从小目标开始，尝试积极寻求解决方法，每天一小步，避免把问题拖到最后。',

    'label.academics': '学业（考试，论文）',
    'label.family': '家庭（父母）',
    'label.friends': '朋友（室友）',
    'label.relationship': '亲密关系（伴侣）',
    'label.organization': '组织（社团）',
    'label.career': '实习求职（面试，简历）',
    'label.future': '未来方向（考研，出国）',
    'label.health': '健康（睡眠，饮食）',

    'suggestion.academics': '建议先把"学业压力"改写成本周可完成的一件具体事，例如"优先复习下周小测"或"这周写出论文初稿"。克服完美主义和拖延症。',
    'suggestion.family': '建议把父母或家庭的期待具体化：是成绩、生活习惯、未来规划，还是沟通方式？尝试和父母交流，但可固定沟通时间，减少临时追问带来的压力。',
    'suggestion.friends': '建议与室友共建作息、卫生、访客规则。当朋友的行为让你感到不适时，主动提出自己的需求。减少消耗性社交，把精力留给支持性关系。',
    'suggestion.relationship': '建议先分清压力来自需求不匹配、时间分配、边界模糊还是冲突方式。在感情中大胆表达自己的需求。遇到困难可寻求朋友和家人的帮助，不把全部情绪压给一个人。',
    'suggestion.organization': '建议只保留1—2个核心角色。学会拒绝过多的任务，把任务分工写清，避免一人兜底。社团和组织不是全部价值来源，若已影响睡眠和学业，优先减负。',
    'suggestion.career': '建议先明确目标，是探索方向、积累经历还是转正？可把"找实习"拆成小任务，即投递、改简历、准备面试。记录每次收获，接受不确定性。',
    'suggestion.future': '建议先做价值澄清，你更看重稳定、成长、收入还是自由？再在自己感兴趣的领域进行尝试，评估每个方向的优劣。',
    'suggestion.health': '建议记录身体信号与作息：睡眠、饮食、运动、疼痛或疲劳出现的时间。多进行户外运动，减少熬夜和连续久坐；小病及时就医。',

    'scenario.academics': '最近有一门重要课程临近考试，或有一篇占分较高的论文即将截止。你发现任务量比预期大，时间安排有些紧张。',
    'scenario.family': '父母最近对你的学业成绩、未来安排或生活方式表达了较高期待，或你们在某个决定上意见不一致，沟通后你仍觉得没有被理解。',
    'scenario.friends': '你和朋友或室友最近出现误会、生活习惯冲突，或你感到被疏远、难以融入某个小团体。你不太确定要不要把话挑明。',
    'scenario.relationship': '你在亲密关系（伴侣、暧昧对象或重要他人）中遇到沟通不畅、期待不一致，或关系状态不确定（如异地、冷战、是否确定关系）。你反复想到这件事，但不确定该怎么处理。',
    'scenario.organization': '你在社团、学生会、球队或课程小组中承担一项任务，临近活动或截止时间，合作中出现分工不清、有人不配合，或责任落到你身上。',
    'scenario.career': '你正在找实习/兼职、修改简历、准备面试，或为科研、求职做准备。你发现竞争比预期激烈，或不确定自己的经历是否够用。',
    'scenario.future': '想到毕业去向（考研、求职、出国、考公等）或更长远的人生规划，你感到迷茫：选项很多但不确定哪个适合自己，或担心选错。别人问起时，你不太知道怎么回答。',
    'scenario.health': '最近你睡眠不足、运动减少、饮食不规律，或身体出现不适，已经影响到白天状态。你知道该调整，但不太确定能不能做到。',

    'coping.A': '主动沟通、制定计划，把问题拆开逐步解决',
    'coping.B': '找人倾诉、请教或寻求建议，借助他人支持',
    'coping.C': '先放一放、回避或拖延，用别的事分散注意'
  }
};

// ---- 语言控制 ----
const STORAGE_KEY = 'stressmap_lang';
let currentLang = (localStorage.getItem(STORAGE_KEY) || 'en');
if (!I18N[currentLang]) currentLang = 'en';

function getLang() { return currentLang; }

function setLang(lang) {
  if (!I18N[lang]) return;
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = (lang === 'zh') ? 'zh-CN' : 'en';
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

// 支持 {x} 占位符替换
function t(key, vars) {
  const dict = I18N[currentLang] || I18N.en;
  let str = dict[key];
  if (str === undefined) str = I18N.en[key] || key;
  if (vars) {
    for (const k of Object.keys(vars)) {
      str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
    }
  }
  return str;
}

// 初始化 html lang
document.documentElement.lang = (currentLang === 'zh') ? 'zh-CN' : 'en';
