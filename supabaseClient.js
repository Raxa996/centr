// supabaseClient.js - без ES6 модулей для GitHub Pages
(function() {
  'use strict';
  
  // Загружаем Supabase из CDN
  const script = document.createElement('script');
  script.src = 'https://cdn.skypack.dev/@supabase/supabase-js@2';
  script.onload = function() {
    // Инициализируем Supabase после загрузки
    const url = window.PUBLIC_SUPABASE_URL;
    const key = window.PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.error("Supabase config missing. Set window.PUBLIC_SUPABASE_URL and window.PUBLIC_SUPABASE_ANON_KEY in HTML.");
      return;
    }

    // Создаем клиент Supabase
    window.supa = window.supabase.createClient(url, key);
    
    // Делаем функции доступными глобально
    window.signInEmailPassword = async function(email, password) {
      const { data, error } = await window.supa.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    };

    window.getSession = async function() {
      const { data } = await window.supa.auth.getSession();
      return data?.session || null;
    };

    // Вызываем инициализацию script.js если он уже загружен
    if (window.initApp) {
      window.initApp();
    }
  };
  document.head.appendChild(script);
})();
