# براوزري تولز — Cloud Edition
3 بروفايلات موبايل على متصفح سحابي (CloudBrowser.ai) — بروكسي/دولة/جهاز لكل بروفايل، أدوات (سكربتات)، كوكيز، روابط.
المنطق (الدول / الأجهزة / يوزر البروكسي / التوقيت من الـ IP) منقول من أداة `mo.py`.

## النشر على Railway (أو Replit)
1. ارفع المجلد على GitHub واعمل New Project → Deploy from repo.
2. Variables: `CLOUDBROWSER_API_KEY`, `APP_PASSWORD` (مهم!), وبيانات البروكسي `PROXY_*` (اختياري).
3. (اختياري) Volume على `/data` + `DATA_DIR=/data` عشان الأدوات والإعدادات تفضل بعد كل نشر.
> مش بيشتغل على Vercel لأن الأداة محتاجة WebSocket واتصال دائم.

## الدول
- القائمة نفس `COUNTRY_DB` في الأداة (EG SA AE KW QA BH OM JO LB PH KZ UZ AZ AM GE AU NZ MM KH AF).
- **✎ مخصص**: اكتب أي كود — حرفين مثل `BO` أو `us_california` (الكود بيتحط في يوزر البروكسي زي ما هو: `{user}-cc-{cc}`).
- التوقيت بيتحدد من موقع الـ IP الفعلي (زي `tz_from_ip`)، ولو فشل بيرجع لتوقيت الدولة. ولو الـ IP طالع من دولة غير المختارة بيظهر تنبيه.

## متغيرات البروكسي (اختياري)
`PROXY_HOST` `PROXY_PORT` `PROXY_USER` `PROXY_PASS` — وكمان:
`PROXY_TEMPLATE` (افتراضي `{user}-cc-{cc}`) · `PROXY_STICKY` (`0` لإلغاء الجلسة الثابتة) · `PROXY_SESSTIME` (دقائق، افتراضي 30) · `PROXY_MODE=plain` (اليوزر زي ما هو).

## لو متصفح مفتحش
الخطأ بيظهر جوه شاشة البروفايل نفسها، وفي Deploy Logs هتلاقي سطور `[slot N] ...` بتبيّن وقف عند أنهي خطوة.
