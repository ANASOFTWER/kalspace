const fs = require('fs');
const path = require('path');

const onboardingEn = {
  "back": "Back",
  "setup_office": "1. Setup Office",
  "name_space": "2. Name Space",
  "finish_title": "3. Finish & Login",
  "setup_office_subtitle": "Design your virtual environment",
  "url_label": "Space URL (Minimum 6 characters)",
  "disclaimer": "Your space will be created immediately after sign in",
  "theme": "Office Theme",
  "cozy": "Cozy",
  "modern": "Modern",
  "green": "Green",
  "size": "Company Size",
  "people": "people",
  "space_name_label": "Space Name",
  "goal_label": "Primary Goal",
  "goal_placeholder": "Select a goal...",
  "goal_communication": "Better Team Communication",
  "goal_productivity": "Higher Productivity",
  "goal_visibility": "More Visibility",
  "goal_culture": "Improve Company Culture",
  "goal_engagement": "Boost Engagement",
  "goal_other": "Other",
  "sign_in_email": "Sign in with Email",
  "or": "OR",
  "sign_in_google": "Sign in with Google",
  "sign_in_microsoft": "Sign in with Microsoft",
  "next_name_space": "Next: Space Name",
  "next_create_space": "Next: Create Space"
};

const onboardingAr = {
  "back": "العودة",
  "setup_office": "1. إعداد المكتب",
  "name_space": "2. تفاصيل المساحة",
  "finish_title": "3. التأسيس والدخول",
  "setup_office_subtitle": "اختر الطابع والحجم المناسب لشركتك",
  "url_label": "الرابط المخصص (6 أحرف على الأقل)",
  "disclaimer": "سيتم تأسيس مساحتك فور تسجيل الدخول",
  "theme": "طابع المكتب (Theme)",
  "cozy": "دافئ (Cozy)",
  "modern": "حديث (Modern)",
  "green": "طبيعي (Green)",
  "size": "حجم الشركة",
  "people": "موظفين",
  "space_name_label": "اسم المساحة (الشركة/الفريق)",
  "goal_label": "الهدف الأساسي من التأسيس",
  "goal_placeholder": "اختر الهدف...",
  "goal_communication": "تواصل أفضل بين الفريق",
  "goal_productivity": "رفع الإنتاجية",
  "goal_visibility": "رؤية أوضح لمهام الفريق",
  "goal_culture": "تحسين ثقافة الشركة",
  "goal_engagement": "زيادة تفاعل الموظفين",
  "goal_other": "أخرى",
  "sign_in_email": "الاستمرار عبر البريد الإلكتروني",
  "or": "أو",
  "sign_in_google": "الاستمرار عبر Google",
  "sign_in_microsoft": "الاستمرار عبر Microsoft",
  "next_name_space": "التالي: تفاصيل المساحة",
  "next_create_space": "التالي: إنشاء المساحة"
};

const messagesDir = path.join(__dirname, 'src', 'messages');
const files = fs.readdirSync(messagesDir);

for (const file of files) {
  if (file.endsWith('.json')) {
    const filePath = path.join(messagesDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (file === 'ar.json') {
      content.onboarding = onboardingAr;
    } else {
      content.onboarding = onboardingEn;
    }
    
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
    console.log('Updated ' + file);
  }
}
