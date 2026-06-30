// ─────────────────────────────────────────────────────────────────────────────
// Copy lives here, keyed by string. Flows reference these keys so structure and
// translation stay separate. `t()` falls back: requested locale -> English ->
// the key itself (so a missing key is obvious in the UI, never a crash).
//
// `en` is complete. `bn` and `ja` cover the high-traffic strings; the long-tail
// (FAQ answers, path explainers) falls back to English until translated. When
// you move FAQ content into the Payload `faqs` collection, swap the faq.* lookups
// for a resolver that reads the collection — the flow keys don't change.
// ─────────────────────────────────────────────────────────────────────────────

import type { Locale } from './chat-engine/types'

type Dict = Record<string, string>

const en: Dict = {
  // ── UI chrome ──────────────────────────────────────────────────────────────
  'ui.title': 'Sadiatec Assistant',
  'ui.subtitle': 'Study, work & business — Japan',
  'ui.launcher': 'Chat with us',
  'ui.placeholder': 'Type your answer…',
  'ui.placeholderNotes': "Add anything you'd like us to know…",
  'ui.send': 'Send',
  'ui.skip': 'Skip',
  'ui.online': 'Typically replies in minutes',
  'ui.restart': 'Start over',
  'ui.poweredBy': 'Sadiatec',
  'ui.contactWhatsApp': 'Chat on WhatsApp',
  'ui.contactLine': 'Chat on LINE',
  'ui.greetingTeaser': 'Hi 👋 Questions about studying or working in Japan?',

  // ── system / validation ─────────────────────────────────────────────────────
  'system.invalidChoice': 'Please choose one of the options.',
  'system.invalid.required': "This can't be empty.",
  'system.invalid.phone': 'Enter a valid phone number, e.g. +8801…',
  'system.invalid.email': 'Enter a valid email address.',

  // ── welcome + routing ───────────────────────────────────────────────────────
  welcome: 'Hello 👋',
  'route.prompt': 'How can we help you today?',
  'route.study': 'Study in Japan',
  'route.work': 'Work in Japan',
  'route.advisor': 'Talk to an Advisor',
  'route.b2b': 'Business Inquiry',
  'route.unsure': 'Not Sure Yet',

  // ── candidate: study ────────────────────────────────────────────────────────
  'cand.study.prompt': 'Which study path fits you best?',
  'opt.langschool': 'Japanese Language School',
  'opt.bekka': 'Bekka / Undergraduate',
  'opt.scholarship': 'Scholarship Info',
  'opt.back': '← Back',

  // ── candidate: work ─────────────────────────────────────────────────────────
  'cand.work.prompt': 'Which work route interests you?',
  'opt.ssw': 'SSW (Specified Skilled Worker)',
  'opt.titp': 'TITP (Technical Intern)',

  // ── candidate: triage ───────────────────────────────────────────────────────
  'cand.triage.prompt': "No problem — what's your main goal?",

  // ── candidate: path explainers ──────────────────────────────────────────────
  'cand.path.lang.intro':
    'A Japanese language school is the most common first step — it builds your Japanese and gives you a student visa. Most students begin around N5–N4 level.',
  'cand.path.bekka.intro':
    'Bekka and undergraduate routes lead to a Japanese university. They usually need JLPT N2 (or a strong N3) and a solid academic record.',
  'cand.path.scholarship.intro':
    'Some scholarships (like MEXT) cover tuition and living costs, but they are competitive with strict deadlines. We can check which ones you may qualify for.',
  'cand.path.ssw.intro':
    'SSW lets you work in Japan in specific industries. You will need the skills test and JLPT N4 (or JFT-Basic). It can lead to long-term stay.',
  'cand.path.titp.intro':
    'TITP is a technical intern program — a structured way to gain work experience in Japan. Requirements are lighter, and we guide you through each step.',

  // ── candidate: advisor offer ────────────────────────────────────────────────
  'cand.offer.prompt': 'Would you like a free advisor to guide you on this?',
  'opt.yesAdvisor': 'Connect with advisor',
  'opt.haveQuestion': 'I have a question first',

  // ── FAQ ─────────────────────────────────────────────────────────────────────
  'faq.menu.prompt': 'Sure — what would you like to know?',
  'faq.opt.money': 'How much money is required?',
  'faq.opt.language': 'Do I need Japanese?',
  'faq.opt.visa': 'How long does the visa take?',
  'faq.opt.work': 'Can I work while studying?',
  'faq.opt.accom': 'Do you help with accommodation?',
  'faq.opt.services': 'What services do you provide?',
  'faq.money':
    'It depends on your path and city, but language-school students should plan for first-year tuition plus living costs and proof of funds. An advisor can give you a realistic figure for your situation.',
  'faq.language':
    'For language school you can start with little or no Japanese. University and most work routes need JLPT N4–N2. We will help you plan the right level.',
  'faq.visa':
    'Processing time varies by route and season — often a couple of months once your documents are ready. Starting early always helps.',
  'faq.work':
    'Student visa holders can usually do limited part-time work with permission. Rules change, so an advisor will confirm what applies to you.',
  'faq.accom':
    'Many schools offer dormitories or help arrange housing, and we can guide you on options near your school.',
  'faq.services':
    'We support admissions, document preparation, school matching, visa guidance and pre-departure support — and connect you with the right advisor.',

  // ── shared capture prompts ──────────────────────────────────────────────────
  'cand.capture.intro': "Great — let's connect you with an advisor. Just a few quick details.",
  'q.name': "What's your full name?",
  'q.phone': 'Best phone or WhatsApp number?',
  'q.email': 'Your email? (optional)',
  'q.education': 'Your highest education?',
  'q.jp': 'Your Japanese level?',
  'q.time': 'Best time to reach you?',
  'q.notes': "Anything else you'd like to add? (optional)",

  'opt.edu.below_hsc': 'Below HSC',
  'opt.edu.hsc': 'HSC / A-Level',
  'opt.edu.diploma': 'Diploma',
  'opt.edu.bachelor': "Bachelor's",
  'opt.edu.master': "Master's",
  'opt.edu.other': 'Other',

  'opt.jp.none': 'None yet',
  'opt.jp.n5': 'N5',
  'opt.jp.n4': 'N4',
  'opt.jp.n3': 'N3',
  'opt.jp.n2': 'N2',
  'opt.jp.n1': 'N1',

  'opt.time.morning': 'Morning',
  'opt.time.afternoon': 'Afternoon',
  'opt.time.evening': 'Evening',
  'opt.time.anytime': 'Anytime',

  'cand.handoff':
    'Perfect — our team has your details and will reach out soon.',
  'cand.end': 'Thank you! 🌸 An advisor will contact you, usually within one business day.',

  // ── B2B ─────────────────────────────────────────────────────────────────────
  'b2b.start.prompt': 'How can we help your business?',
  'b2b.opt.consultation': 'Request a consultation',
  'b2b.opt.services': 'Ask about services',
  'b2b.opt.contact': 'Leave my contact',
  'b2b.opt.human': 'Talk to customer manager',
  'b2b.services':
    'We build multilingual websites, AI assistants and chatbots, lead-generation systems, and business automation for companies working with Japan. Tell us what you need below.',
  'b2b.capture.intro':
    'Thank you. Please share a few details and a short note — our team will follow up promptly.',
  'q.service': 'What do you need help with?',
  'q.company': 'Company name?',
  'q.contactName': 'Your name?',

  'opt.svc.website': 'Website development',
  'opt.svc.chatbot_ai': 'Chatbot / AI assistant',
  'opt.svc.lead_gen': 'Lead generation',
  'opt.svc.multilingual': 'Multilingual website',
  'opt.svc.automation': 'Business automation',
  'opt.svc.consultation': 'Consultation',
  'opt.svc.other': 'Other',
  'b2b.handoff': "We've received your details and will reach out soon.",

  'b2b.end': 'Thank You',
}

// Bengali — high-traffic strings (long-tail falls back to English).
const bn: Dict = {
  'ui.title': 'Sadiatec সহকারী',
  'ui.subtitle': 'পড়াশোনা, কাজ ও ব্যবসা — জাপান',
  'ui.launcher': 'আমাদের সাথে চ্যাট করুন',
  'ui.placeholder': 'আপনার উত্তর লিখুন…',
  'ui.placeholderNotes': 'আমাদের জানাতে চান এমন কিছু লিখুন…',
  'ui.send': 'পাঠান',
  'ui.skip': 'এড়িয়ে যান',
  'ui.online': 'সাধারণত কয়েক মিনিটে উত্তর দিই',
  'ui.restart': 'আবার শুরু করুন',
  'ui.contactWhatsApp': 'WhatsApp-এ চ্যাট করুন',
  'ui.contactLine': 'LINE-এ চ্যাট করুন',
  'ui.greetingTeaser': 'হ্যালো 👋 জাপানে পড়া বা কাজ নিয়ে প্রশ্ন আছে?',

  'system.invalidChoice': 'অনুগ্রহ করে একটি অপশন বেছে নিন।',
  'system.invalid.required': 'এটি খালি রাখা যাবে না।',
  'system.invalid.phone': 'সঠিক ফোন নম্বর দিন, যেমন +8801…',
  'system.invalid.email': 'সঠিক ইমেইল ঠিকানা দিন।',

  welcome: 'হ্যালো 👋',
  'route.prompt': 'আমরা আপনাকে কীভাবে সাহায্য করতে পারি?',
  'route.study': 'জাপানে পড়াশোনা',
  'route.work': 'জাপানে কাজ',
  'route.advisor': 'উপদেষ্টার সাথে কথা বলুন',
  'route.b2b': 'ব্যবসায়িক জিজ্ঞাসা',
  'route.unsure': 'এখনও নিশ্চিত নই',

  'cand.study.prompt': 'কোন পড়াশোনার পথ আপনার জন্য মানানসই?',
  'opt.langschool': 'জাপানিজ ভাষা স্কুল',
  'opt.bekka': 'বেক্কা / আন্ডারগ্র্যাজুয়েট',
  'opt.scholarship': 'বৃত্তির তথ্য',
  'opt.back': '← পিছনে',
  'cand.work.prompt': 'কোন কাজের পথে আপনি আগ্রহী?',
  'cand.triage.prompt': 'সমস্যা নেই — আপনার মূল লক্ষ্য কী?',

  'cand.offer.prompt': 'আপনি কি চান একজন উপদেষ্টা বিনামূল্যে গাইড করুক?',
  'opt.yesAdvisor': 'উপদেষ্টার পরামর্শ নিন',
  'opt.haveQuestion': 'আগে একটি প্রশ্ন আছে',

  'cand.capture.intro': 'দারুণ — চলুন একজন উপদেষ্টার সাথে যুক্ত করি। মাত্র কয়েকটি তথ্য।',
  'q.name': 'আপনার পুরো নাম কী?',
  'q.phone': 'সেরা ফোন বা WhatsApp নম্বর?',
  'q.email': 'আপনার ইমেইল? (ঐচ্ছিক)',
  'q.education': 'আপনার সর্বোচ্চ শিক্ষা?',
  'q.jp': 'আপনার জাপানিজ লেভেল?',
  'q.time': 'কখন যোগাযোগ করা সুবিধাজনক?',
  'q.notes': 'আর কিছু যোগ করতে চান? (ঐচ্ছিক)',
  'opt.jp.none': 'এখনও নেই',
  'opt.time.morning': 'সকাল',
  'opt.time.afternoon': 'দুপুর',
  'opt.time.evening': 'সন্ধ্যা',
  'opt.time.anytime': 'যেকোনো সময়',

  'cand.handoff':
    'দারুণ — আমাদের টিম আপনার তথ্য পেয়েছে এবং শীঘ্রই যোগাযোগ করবে।',
  'cand.end': 'ধন্যবাদ! 🌸 একজন উপদেষ্টা সাধারণত এক কর্মদিবসের মধ্যে যোগাযোগ করবেন।',

  'b2b.start.prompt': 'আপনার ব্যবসায় কীভাবে সাহায্য করতে পারি?',
  'b2b.opt.consultation': 'পরামর্শের অনুরোধ',
  'b2b.opt.services': 'সেবা সম্পর্কে জানুন',
  'b2b.opt.contact': 'যোগাযোগ তথ্য রাখুন',
  'b2b.opt.human': 'কাস্টমার ম্যানেজারের সাথে কথা বলুন',
  'q.company': 'কোম্পানির নাম?',
  'q.contactName': 'আপনার নাম?',
  'b2b.handoff': 'আমরা আপনার তথ্য পেয়েছি এবং শীঘ্রই যোগাযোগ করব।',
  'b2b.end': 'ধন্যবাদ',

  'opt.ssw': 'SSW (নির্দিষ্ট দক্ষ কর্মী)',
'opt.titp': 'TITP (টেকনিক্যাল ইন্টার্ন)',

'cand.path.lang.intro':
  'জাপানিজ ভাষা স্কুল সবচেয়ে সাধারণ প্রথম পদক্ষেপ — এটি আপনার জাপানি ভাষার দক্ষতা বাড়ায় এবং স্টুডেন্ট ভিসা দেয়। বেশিরভাগ শিক্ষার্থী N5–N4 লেভেল থেকে শুরু করে।',
'cand.path.bekka.intro':
  'বেক্কা এবং আন্ডারগ্র্যাজুয়েট রুট জাপানি বিশ্ববিদ্যালয়ে নিয়ে যায়। সাধারণত JLPT N2 (বা ভালো N3) এবং ভালো একাডেমিক রেকর্ড প্রয়োজন।',
'cand.path.scholarship.intro':
  'কিছু বৃত্তি (যেমন MEXT) টিউশন ও জীবনযাত্রার খরচ কভার করে, তবে প্রতিযোগিতামূলক এবং কঠিন সময়সীমা থাকে। আপনি কোনগুলোর জন্য যোগ্য হতে পারেন তা আমরা যাচাই করতে পারি।',
'cand.path.ssw.intro':
  'SSW আপনাকে নির্দিষ্ট শিল্পে জাপানে কাজ করার সুযোগ দেয়। এর জন্য স্কিল টেস্ট এবং JLPT N4 (বা JFT-Basic) লাগবে। এটি দীর্ঘমেয়াদী থাকার দিকে নিয়ে যেতে পারে।',
'cand.path.titp.intro':
  'TITP একটি টেকনিক্যাল ইন্টার্ন প্রোগ্রাম — জাপানে কাজের অভিজ্ঞতা অর্জনের একটি সুসংগঠিত উপায়। শর্তগুলো তুলনামূলক সহজ, এবং আমরা প্রতিটি পদক্ষেপে গাইড করি।',

'faq.menu.prompt': 'অবশ্যই — আপনি কী জানতে চান?',
'faq.opt.money': 'কত টাকা লাগবে?',
'faq.opt.language': 'জাপানি ভাষা জানা প্রয়োজন?',
'faq.opt.visa': 'ভিসা পেতে কতদিন লাগে?',
'faq.opt.work': 'পড়াশোনার সময় কাজ করতে পারব?',
'faq.opt.accom': 'আবাসনের ব্যাপারে সাহায্য করেন?',
'faq.opt.services': 'আপনারা কী কী সেবা দেন?',
'faq.money':
  'এটা আপনার পথ এবং শহরের উপর নির্ভর করে, তবে ভাষা স্কুলের শিক্ষার্থীদের প্রথম বছরের টিউশন, জীবনযাত্রার খরচ এবং তহবিলের প্রমাণের জন্য পরিকল্পনা করা উচিত। একজন উপদেষ্টা আপনার পরিস্থিতির জন্য বাস্তবসম্মত পরিমাণ জানাতে পারবেন।',
'faq.language':
  'ভাষা স্কুলের জন্য আপনি সামান্য বা কোনো জাপানি ভাষা না জেনেও শুরু করতে পারেন। বিশ্ববিদ্যালয় এবং বেশিরভাগ কাজের রুটে JLPT N4–N2 প্রয়োজন। সঠিক লেভেল পরিকল্পনায় আমরা সাহায্য করব।',
'faq.visa':
  'প্রসেসিং সময় রুট ও সিজনের উপর নির্ভর করে — সাধারণত নথি প্রস্তুত হওয়ার পর কয়েক মাস লাগে। আগে থেকে শুরু করলে সবসময় সুবিধা হয়।',
'faq.work':
  'স্টুডেন্ট ভিসাধারীরা সাধারণত অনুমতি নিয়ে সীমিত পার্ট-টাইম কাজ করতে পারেন। নিয়ম পরিবর্তন হতে পারে, তাই একজন উপদেষ্টা আপনার ক্ষেত্রে কী প্রযোজ্য তা নিশ্চিত করবেন।',
'faq.accom':
  'অনেক স্কুল ডরমিটরি দেয় বা আবাসন ব্যবস্থা করতে সাহায্য করে, এবং আমরা আপনার স্কুলের কাছাকাছি বিকল্পগুলো নিয়ে গাইড করতে পারি।',
'faq.services':
  'আমরা ভর্তি, কাগজপত্র প্রস্তুতি, স্কুল ম্যাচিং, ভিসা গাইডেন্স এবং যাত্রার আগের সহায়তা প্রদান করি — এবং সঠিক উপদেষ্টার সাথে সংযুক্ত করি।',

'opt.edu.below_hsc': 'HSC এর নিচে',
'opt.edu.hsc': 'HSC / A-Level',
'opt.edu.diploma': 'ডিপ্লোমা',
'opt.edu.bachelor': 'স্নাতক',
'opt.edu.master': 'স্নাতকোত্তর',
'opt.edu.other': 'অন্যান্য',
'opt.jp.n5': 'N5',
'opt.jp.n4': 'N4',
'opt.jp.n3': 'N3',
'opt.jp.n2': 'N2',
'opt.jp.n1': 'N1',

'ui.poweredBy': 'Sadiatec',

// ── B2B (bn was missing this whole block — ja already had it) ───────────────
'b2b.services':
  'আমরা জাপানের সাথে কাজ করা কোম্পানিগুলোর জন্য বহুভাষিক ওয়েবসাইট, এআই অ্যাসিস্ট্যান্ট/চ্যাটবট, লিড জেনারেশন সিস্টেম এবং বিজনেস অটোমেশন তৈরি করি। নিচে আপনার প্রয়োজন জানান।',
'b2b.capture.intro':
  'ধন্যবাদ। অনুগ্রহ করে কিছু তথ্য ও একটি সংক্ষিপ্ত নোট দিন — আমাদের টিম শীঘ্রই যোগাযোগ করবে।',
'q.service': 'আপনার কী ধরনের সাহায্য প্রয়োজন?',
'opt.svc.website': 'ওয়েবসাইট ডেভেলপমেন্ট',
'opt.svc.chatbot_ai': 'চ্যাটবট / এআই অ্যাসিস্ট্যান্ট',
'opt.svc.lead_gen': 'লিড জেনারেশন',
'opt.svc.multilingual': 'বহুভাষিক ওয়েবসাইট',
'opt.svc.automation': 'বিজনেস অটোমেশন',
'opt.svc.consultation': 'পরামর্শ',
'opt.svc.other': 'অন্যান্য',
}

// Japanese — high-traffic strings (long-tail falls back to English).
const ja: Dict = {
  'ui.title': 'Sadiatec アシスタント',
  'ui.subtitle': '留学・就労・ビジネス — 日本',
  'ui.launcher': 'チャットで相談',
  'ui.placeholder': '回答を入力…',
  'ui.placeholderNotes': 'ご要望があればご記入ください…',
  'ui.send': '送信',
  'ui.skip': 'スキップ',
  'ui.online': '通常数分で返信します',
  'ui.restart': '最初から',
  'ui.contactWhatsApp': 'WhatsAppで相談',
  'ui.contactLine': 'LINEで相談',
  'ui.greetingTeaser': 'こんにちは 👋 日本での留学・就労についてご質問はありますか？',

  'system.invalidChoice': '選択肢からお選びください。',
  'system.invalid.required': '入力してください。',
  'system.invalid.phone': '有効な電話番号を入力してください（例：+81…）。',
  'system.invalid.email': '有効なメールアドレスを入力してください。',

  welcome: 'こんにちは、👋',
  'route.prompt': '本日はどのようなご用件でしょうか？',
  'route.study': '日本で学ぶ',
  'route.work': '日本で働く',
  'route.advisor': 'アドバイザーに相談',
  'route.b2b': '法人のお問い合わせ',
  'route.unsure': 'まだ決まっていない',

  'cand.study.prompt': 'どの留学ルートをお考えですか？',
  'opt.langschool': '日本語学校',
  'opt.bekka': '別科 / 学部進学',
  'opt.scholarship': '奨学金について',
  'opt.back': '← 戻る',
  'cand.work.prompt': 'どの就労ルートにご関心がありますか？',
  'cand.triage.prompt': '承知しました。主な目的は何でしょうか？',

  'cand.offer.prompt': '無料でアドバイザーがご案内しましょうか？',
  'opt.yesAdvisor': 'アドバイザーと繋がる',
  'opt.haveQuestion': '先に質問があります',

  'cand.capture.intro': '承知しました。アドバイザーにおつなぎします。簡単な情報をお願いします。',
  'q.name': 'お名前を教えてください。',
  'q.phone': 'ご連絡先（電話／WhatsApp）は？',
  'q.email': 'メールアドレス（任意）',
  'q.education': '最終学歴は？',
  'q.jp': '日本語レベルは？',
  'q.time': 'ご都合の良い時間帯は？',
  'q.notes': 'その他ご要望があれば（任意）',
  'opt.jp.none': 'なし',
  'opt.time.morning': '午前',
  'opt.time.afternoon': '午後',
  'opt.time.evening': '夕方',
  'opt.time.anytime': 'いつでも',

  'cand.handoff':
    '承知しました。担当者が確認し、まもなくご連絡します。',
  'cand.end': 'ありがとうございます。🌸 通常1営業日以内に担当者よりご連絡します。',

  'b2b.start.prompt': '御社のビジネスについて、どのようにお手伝いできますか？',
  'b2b.opt.consultation': '相談を依頼',
  'b2b.opt.services': 'サービスについて',
  'b2b.opt.contact': '連絡先を残す',
  'b2b.opt.human': 'カスタマーマネージャーと話す',
  'b2b.services':
    '日本市場向けに、多言語ウェブサイト、AIアシスタント／チャットボット、リード獲得、業務自動化を提供しています。ご要望を下記にご記入ください。',
  'b2b.capture.intro':
    'ありがとうございます。いくつかの情報と簡単なご要望をお知らせください。担当者より速やかにご連絡します。',
  'q.service': 'どのようなご支援が必要ですか？',
  'q.company': '会社名は？',
  'q.contactName': 'お名前は？',
  'opt.svc.website': 'ウェブサイト制作',
  'opt.svc.chatbot_ai': 'チャットボット／AI',
  'opt.svc.lead_gen': 'リード獲得',
  'opt.svc.multilingual': '多言語サイト',
  'opt.svc.automation': '業務自動化',
  'opt.svc.consultation': '相談',
  'opt.svc.other': 'その他',
  'b2b.handoff': '担当者が確認し、まもなくご連絡します。',
  'b2b.end': 'ありがとうございます。',

  // ── candidate: work (missing labels) ────────────────────────────────────────
'opt.ssw': 'SSW（特定技能）',
'opt.titp': 'TITP（技能実習）',

// ── candidate: path explainers ───────────────────────────────────────────────
'cand.path.lang.intro':
  '日本語学校は最も一般的な最初のステップです。日本語力を伸ばしながら留学ビザを取得できます。多くの学生はN5〜N4レベルから始めます。',
'cand.path.bekka.intro':
  '別科・学部進学コースは日本の大学への道です。通常JLPT N2（またはしっかりしたN3）と良好な学業成績が必要です。',
'cand.path.scholarship.intro':
  'MEXTなどの一部の奨学金は学費と生活費をカバーしますが、競争率が高く締切も厳しいです。ご自身が対象となる奨学金を一緒に確認しましょう。',
'cand.path.ssw.intro':
  'SSW（特定技能）は特定の業種で日本で働ける制度です。技能試験とJLPT N4（またはJFT-Basic）が必要で、長期滞在につながる場合もあります。',
'cand.path.titp.intro':
  'TITP（技能実習）は日本での実務経験を積むための制度です。条件は比較的緩やかで、各ステップを丁寧にサポートします。',

// ── FAQ ───────────────────────────────────────────────────────────────────────
'faq.menu.prompt': 'もちろんです — 何について知りたいですか？',
'faq.opt.money': '費用はどのくらいかかりますか？',
'faq.opt.language': '日本語は必要ですか？',
'faq.opt.visa': 'ビザの取得にどれくらいかかりますか？',
'faq.opt.work': '留学中に働けますか？',
'faq.opt.accom': '住居のサポートはありますか？',
'faq.opt.services': 'どのようなサービスを提供していますか？',
'faq.money':
  'ルートや都市によって異なりますが、日本語学校の学生は初年度の学費・生活費・資金証明を見込んでおく必要があります。アドバイザーが具体的な金額をご案内します。',
'faq.language':
  '日本語学校なら日本語力がほとんどなくても始められます。大学進学や多くの就労ルートではJLPT N4〜N2が必要です。適切なレベルを一緒に計画しましょう。',
'faq.visa':
  '処理期間はルートや時期によって異なりますが、書類が揃ってから数か月程度が一般的です。早めに準備を始めることが大切です。',
'faq.work':
  '学生ビザでは許可を得れば限定的なアルバイトが可能です。規則は変わることがあるため、アドバイザーが最新情報を確認します。',
'faq.accom':
  '多くの学校が学生寮を提供したり、住居探しをサポートしています。学校近くの選択肢についてもご案内できます。',
'faq.services':
  '入学手続き、書類準備、学校選び、ビザサポート、渡航前サポートまで対応し、最適なアドバイザーにおつなぎします。',

// ── shared capture: education / JLPT options ─────────────────────────────────
'opt.edu.below_hsc': 'HSC未満',
'opt.edu.hsc': 'HSC／高校卒',
'opt.edu.diploma': 'ディプロマ',
'opt.edu.bachelor': '学士',
'opt.edu.master': '修士',
'opt.edu.other': 'その他',
'opt.jp.n5': 'N5',
'opt.jp.n4': 'N4',
'opt.jp.n3': 'N3',
'opt.jp.n2': 'N2',
'opt.jp.n1': 'N1',

// ── footer ─────────────────────────────────────────────────────────────────────
'ui.poweredBy': 'Sadiatec',
}

const dicts: Record<Locale, Dict> = { en, bn, ja }

export function t(key: string, locale: Locale = 'ja'): string {  // was 'en'
  return dicts[locale]?.[key] ?? en[key] ?? key
}

export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return 'ja'
  const l = navigator.language.toLowerCase()
  if (l.startsWith('bn')) return 'bn'   // Bangladeshi visitors still get Bangla
  if (l.startsWith('ja')) return 'ja'
  return 'ja'                            // everything else (incl. English browsers) → Japanese
}

export const SUPPORTED_LOCALES: Array<{ code: Locale; label: string }> = [
  { code: 'ja', label: '日本語' },
  { code: 'en', label: 'EN' },
  { code: 'bn', label: 'বাং' }
  ,
]
