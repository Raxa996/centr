// supabaseClient.js - инициализация Supabase
(function() {
  'use strict';
  
  console.log('Initializing Supabase client...');
  
  // Получаем конфигурацию
  const url = window.PUBLIC_SUPABASE_URL;
  const key = window.PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("Supabase config missing. Set window.PUBLIC_SUPABASE_URL and window.PUBLIC_SUPABASE_ANON_KEY in HTML.");
    return;
  }

  if (!window.supabase) {
    console.error("Supabase library not loaded. Make sure the CDN script is included.");
    return;
  }

  try {
    // Создаем клиент Supabase
    window.supa = window.supabase.createClient(url, key);
    console.log('Supabase client created successfully');
    
    // Делаем функции доступными глобально
    window.getSession = async function() {
      const { data } = await window.supa.auth.getSession();
      return data?.session || null;
    };

    // Вызываем инициализацию script.js если он уже загружен
    if (window.initApp) {
      console.log('Calling initApp...');
      window.initApp();
    }
  } catch (error) {
    console.error('Error creating Supabase client:', error);
  }
})();
