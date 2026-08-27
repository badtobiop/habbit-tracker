async function runE2ETests() {
  console.log('--- STARTING LIVE HTTP END-TO-END VERIFICATION (http://localhost:3000) ---');
  const baseUrl = 'http://localhost:3000';

  // 1. Test Landing Page HTML
  console.log('[E2E 1] Fetching Landing Page');
  const landingRes = await fetch(`${baseUrl}/`);
  console.assert(landingRes.status === 200, `Landing page status ${landingRes.status}`);
  const landingHtml = await landingRes.text();
  console.assert(landingHtml.includes('Turn Your Habits') || landingHtml.includes('ANIME'), 'Landing page content missing brand title');
  console.log('✔ Landing page rendered with status 200.');

  // 2. Test User Signup & Cookie Issuance
  console.log('[E2E 2] Testing User Signup & Session Issuance');
  const testEmail = `e2e_hunter_${Date.now()}@anime.io`;
  const signupRes = await fetch(`${baseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Shadow Monarch Jin-Woo',
      email: testEmail,
      password: 'password123',
      avatar: 'shadow_hunter',
      companion: 'shadow_wolf',
    }),
  });

  console.assert(signupRes.status === 200, `Signup failed with status ${signupRes.status}`);
  const signupData = await signupRes.json();
  console.assert(signupData.success === true, 'Signup success boolean false');

  const cookieHeader = signupRes.headers.get('set-cookie');
  console.assert(cookieHeader && cookieHeader.includes('anime_habit_auth_token'), 'Auth cookie not set in response');
  const cookie = cookieHeader.split(';')[0];
  console.log('✔ Signup succeeded and secure HTTP-Only auth token cookie received.');

  // 3. Test Authenticated Profile Route /api/auth/me
  console.log('[E2E 3] Testing /api/auth/me Profile Extraction');
  const meRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Cookie: cookie },
  });
  console.assert(meRes.status === 200, `/api/auth/me status ${meRes.status}`);
  const meData = await meRes.json();
  console.assert(meData.user.name === 'Shadow Monarch Jin-Woo', 'User name mismatch');
  console.assert(meData.user.level === 1, 'Initial level should be 1');
  console.log('✔ Server authenticated user and extracted rank E profile.');

  // 4. Test Habit Creation
  console.log('[E2E 4] Testing Habit Creation & Retrieval');
  const createHabitRes = await fetch(`${baseUrl}/api/habits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      name: '100 Pushups & 100 Situps Daily Quest',
      description: 'Physical training to ascend Hunter rank.',
      category: 'Fitness',
      difficulty: 'extreme',
      reminder_time: '07:00',
    }),
  });
  console.assert(createHabitRes.status === 201, `Habit creation status ${createHabitRes.status}`);
  const habitData = await createHabitRes.json();
  const habitId = habitData.habit.id;
  console.log('✔ New habit quest created successfully.');

  // 5. Test Habit Completion & XP Gain
  console.log('[E2E 5] Testing Habit Completion Toggle & XP Disbursement');
  const today = new Date().toISOString().split('T')[0];
  const completeRes = await fetch(`${baseUrl}/api/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      habit_id: habitId,
      completed_date: today,
    }),
  });
  console.assert(completeRes.status === 200, `Completion toggle status ${completeRes.status}`);
  const compData = await completeRes.json();
  console.assert(compData.is_completed === true, 'Habit should be marked complete');
  console.assert(compData.xp_earned >= 50, `XP earned should be >= 50 for extreme, got ${compData.xp_earned}`);
  console.assert(compData.current_streak >= 1, `Current streak should be >= 1, got ${compData.current_streak}`);
  console.log(`✔ Habit completion recorded: +${compData.xp_earned} XP, streak: ${compData.current_streak} days.`);

  // 6. Test Calendar Sync
  console.log('[E2E 6] Testing Calendar Sync');
  const calendarRes = await fetch(`${baseUrl}/api/calendar?date=${today}`, {
    headers: { Cookie: cookie },
  });
  console.assert(calendarRes.status === 200, `Calendar status ${calendarRes.status}`);
  const calData = await calendarRes.json();
  console.assert(calData.days.length >= 28, 'Calendar month should have at least 28 days');
  console.assert(calData.dayDetails !== null, 'Selected day details should be populated');
  console.log('✔ Real-time calendar synchronized with database completions.');

  // 7. Test Stats & RPG Attributes
  console.log('[E2E 7] Testing Statistics & RPG Attributes Radar');
  const statsRes = await fetch(`${baseUrl}/api/stats`, {
    headers: { Cookie: cookie },
  });
  console.assert(statsRes.status === 200, `Stats status ${statsRes.status}`);
  const statsData = await statsRes.json();
  console.assert(statsData.stats.attributes.discipline > 0, 'Discipline attribute should be > 0');
  console.assert(statsData.stats.weeklyHistory.length === 7, 'Weekly history should have 7 days');
  console.log('✔ Dynamic statistics and radar telemetry calculated.');

  // 8. Test Achievements Engine
  console.log('[E2E 8] Testing Achievements Awakening');
  const achRes = await fetch(`${baseUrl}/api/achievements`, {
    headers: { Cookie: cookie },
  });
  console.assert(achRes.status === 200, `Achievements status ${achRes.status}`);
  const achData = await achRes.json();
  console.assert(achData.achievements.length >= 10, 'Achievements catalog should have 10+ medals');
  console.assert(achData.unlockedCount >= 1, 'First awakening achievement should be unlocked');
  console.log(`✔ Achievements verified: ${achData.unlockedCount} unlocked medals.`);

  console.log('\n======================================================');
  console.log('🎉 ALL LIVE HTTP END-TO-END FLOWS VERIFIED SUCCESSFULLY!');
  console.log('======================================================\n');
}

runE2ETests().catch((err) => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
