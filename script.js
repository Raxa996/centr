// Глобальные переменные
let selectedServices = [];
let currentUser = null;

// Функция инициализации приложения
window.initApp = function() {
    console.log('Initializing app with Supabase...');
    
    // Инициализация мобильного меню
    initMobileMenu();
    
    // Инициализация модальных окон
    initModals();
    
    // Инициализация форм
    initForms();
    
    // Инициализация Supabase
    initSupabase();
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Если Supabase уже загружен, инициализируем сразу
    if (window.supa) {
        window.initApp();
    } else {
        // Иначе ждем загрузки Supabase
        console.log('Waiting for Supabase to load...');
    }
    
    // Инициализация модальных окон
    initModals();
});

// Мобильное меню
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Закрытие меню при клике на ссылку
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Инициализация форм
function initForms() {
    // Форма заявки
    const requestForm = document.getElementById('requestForm');
    if (requestForm) {
        requestForm.addEventListener('submit', handleRequestSubmit);
    }

    // Формы входа
    document.getElementById('parentLoginForm')?.addEventListener('submit', (e) => handleLogin(e, 'parent'));
    document.getElementById('staffLoginForm')?.addEventListener('submit', (e) => handleStaffLogin(e));
    
    // Форма регистрации
    document.getElementById('registrationForm')?.addEventListener('submit', handleRegistration);
    
    // Форматирование номера телефона для поля входа
    const parentPhoneInput = document.getElementById('parentPhone');
    if (parentPhoneInput) {
        parentPhoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (!value.startsWith('7')) {
                    value = '7' + value;
                }
                if (value.length >= 11) {
                    value = value.substring(0, 11);
                    e.target.value = `+7 (${value.slice(1, 4)}) ${value.slice(4, 7)}-${value.slice(7, 9)}-${value.slice(9)}`;
                }
            }
        });
    }
    
    // Проверяем и восстанавливаем данные из localStorage
    checkAndRestoreUserData();
}

// Модальные окна
function initModals() {
    // Закрытие модального окна при клике вне его
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
}

// Открытие модального окна
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Закрытие модального окна
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Закрытие всех модальных окон
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = 'auto';
}

// Открытие модального окна входа
function openLoginModal() {
    openModal('loginModal');
}

// Переключение вкладок в модальном окне входа
function switchTab(tabName) {
    // Убираем активный класс со всех вкладок и контента
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Добавляем активный класс к выбранной вкладке и контенту
    event.target.classList.add('active');
    
    if (tabName === 'staff') {
        document.getElementById('staff-login').classList.add('active');
    } else {
        document.getElementById(tabName + '-login').classList.add('active');
    }
}

// Обработка отправки заявки
function handleRequestSubmit(e) {
    e.preventDefault();
    
    const formData = {
        parentName: document.getElementById('parentName').value,
        parentPhone: document.getElementById('parentPhone').value,
        childName: document.getElementById('childName').value,
        childAge: document.getElementById('childAge').value,
        selectedService: document.getElementById('selectedService').value,
        comments: document.getElementById('comments').value
    };

    // Сохраняем заявку в localStorage (в реальном приложении отправляем на сервер)
    const requests = JSON.parse(localStorage.getItem('requests') || '[]');
    requests.push({
        ...formData,
        id: Date.now(),
        date: new Date().toISOString(),
        status: 'pending'
    });
    localStorage.setItem('requests', JSON.stringify(requests));

    alert('Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.');
    closeModal('requestModal');
    document.getElementById('requestForm').reset();
}

// Обработка входа в систему
async function handleLogin(e, userType) {
    e.preventDefault();
    
    let loginField, passwordField, loginValue;
    
    // Определяем поля ввода в зависимости от типа пользователя
    if (userType === 'parent') {
        loginField = 'parentPhone';
        passwordField = 'parentPassword';
    } else if (userType === 'owner') {
        loginField = 'ownerLogin';
        passwordField = 'ownerPassword';
    } else if (userType === 'admin') {
        loginField = 'adminLogin';
        passwordField = 'adminPassword';
    }
    
    loginValue = document.getElementById(loginField)?.value?.trim();
    const password = document.getElementById(passwordField)?.value?.trim();

    if (!loginValue || !password) {
        alert('Пожалуйста, заполните все поля:\n' + 
              (userType === 'parent' ? '- Email' : '- Email') + 
              '\n- Пароль');
        return;
    }

    try {
        // Аутентификация через Supabase
        const { data, error } = await window.supa.auth.signInWithPassword({ 
            email: loginValue, 
            password: password 
        });
        
        if (error) {
            alert('Ошибка входа: ' + error.message);
            return;
        }

        // Сохраняем пользователя в localStorage для совместимости
        currentUser = {
            id: data.user.id,
            email: data.user.email,
            role: null, // будет заполнено в afterLoginRedirect
            name: data.user.email
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Редирект по роли через функцию
        await afterLoginRedirect();

    } catch (error) {
        console.error('Login error:', error);
        alert('Ошибка входа: ' + error.message);
    }
}

// Обработка входа для персонала (объединенные владельцы и сотрудники)
async function handleStaffLogin(e) {
    e.preventDefault();
    
    const login = document.getElementById('staffLogin')?.value?.trim();
    const password = document.getElementById('staffPassword')?.value?.trim();

    if (!login || !password) {
        alert('Пожалуйста, заполните все поля:\n- Email\n- Пароль');
        return;
    }

    try {
        // Аутентификация через Supabase
        const { data, error } = await window.supa.auth.signInWithPassword({ 
            email: login, 
            password: password 
        });
        
        if (error) {
            alert('Ошибка входа: ' + error.message);
            return;
        }

        // Сохраняем пользователя в localStorage для совместимости
        currentUser = {
            id: data.user.id,
            email: data.user.email,
            role: null, // будет заполнено в afterLoginRedirect
            name: data.user.email
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Редирект по роли через функцию
        await afterLoginRedirect();

    } catch (error) {
        console.error('Staff login error:', error);
        alert('Ошибка входа: ' + error.message);
    }
}

// Открытие модального окна регистрации
function openRegistrationModal() {
    closeAllModals();
    openModal('registrationModal');
    
    // Прокручиваем к началу формы при открытии
    setTimeout(() => {
        const modalContent = document.querySelector('#registrationModal .modal-content');
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
    }, 100);
}

// Обработка регистрации родителя
function handleRegistration(e) {
    e.preventDefault();
    
    const formData = {
        parentName: document.getElementById('regParentName').value,
        parentPhone: document.getElementById('regParentPhone').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
        passwordConfirm: document.getElementById('regPasswordConfirm').value,
        childName: document.getElementById('regChildName').value,
        childBirthDate: document.getElementById('regChildBirthDate').value,
        childGender: document.getElementById('regChildGender').value,
        notes: document.getElementById('regNotes').value,
        agreement: document.getElementById('regAgreement').checked
    };

    // Валидация
    if (!formData.parentName || !formData.parentPhone || !formData.password || !formData.childName || !formData.childBirthDate || !formData.childGender) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }

    if (formData.password !== formData.passwordConfirm) {
        alert('Пароли не совпадают');
        return;
    }

    if (formData.password.length < 6) {
        alert('Пароль должен содержать минимум 6 символов');
        return;
    }

    if (!formData.agreement) {
        alert('Необходимо согласие на обработку персональных данных');
        return;
    }

    // Получаем выбранные услуги
    const selectedServices = [];
    document.querySelectorAll('#regInterestedServices input[type="checkbox"]:checked').forEach(checkbox => {
        selectedServices.push(checkbox.value);
    });

    // Нормализация номера телефона
    const cleanPhone = formData.parentPhone.replace(/\D/g, '');
    let phoneForLogin;
    
    // Форматируем номер правильно
    if (cleanPhone.startsWith('7')) {
        phoneForLogin = '+' + cleanPhone;
    } else if (cleanPhone.startsWith('8')) {
        phoneForLogin = '+7' + cleanPhone.substring(1);
    } else if (cleanPhone.length === 10) {
        phoneForLogin = '+7' + cleanPhone;
    } else {
        phoneForLogin = '+' + cleanPhone;
    }

    // Получаем существующих пользователей
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
    
    // Создаем все возможные варианты ключей для проверки и сохранения
    const possibleKeys = [
        phoneForLogin, // основной формат +7XXXXXXXXXX
        cleanPhone, // только цифры
        '+' + cleanPhone, // с плюсом
        formData.parentPhone, // исходный ввод пользователя
        '7' + cleanPhone.slice(1), // убираем первую 7 и добавляем 7
        '8' + cleanPhone.slice(1), // заменяем 7 на 8
        cleanPhone.slice(1), // убираем первую цифру
        '0' + cleanPhone.slice(1), // заменяем 7 на 0
    ];
    
    // Убираем дубликаты и пустые значения
    const uniqueKeys = [...new Set(possibleKeys.filter(key => key && key.length > 5))];
    
    const userExists = uniqueKeys.some(key => existingUsers[key]);
    if (userExists) {
        alert('Пользователь с таким номером телефона уже зарегистрирован');
        return;
    }

    // Создаем данные пользователя
    const userData = {
        id: Date.now(),
        type: 'parent',
        parentName: formData.parentName,
        phone: phoneForLogin,
        email: formData.email || '',
        password: formData.password,
        children: [{
            id: 1,
            name: formData.childName,
            birthDate: formData.childBirthDate,
            gender: formData.childGender,
            services: selectedServices
        }],
        notes: formData.notes,
        registrationDate: new Date().toISOString(),
        status: 'active'
    };

    // Сохраняем пользователя под всеми возможными ключами
    uniqueKeys.forEach(key => {
        existingUsers[key] = userData;
    });
    
    console.log('Сохранены ключи для пользователя:', uniqueKeys);
    
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    
    // Пользователь зарегистрирован успешно

    alert(`Регистрация успешно завершена!\n\nТеперь вы можете войти в систему с данными:\nНомер телефона: ${phoneForLogin}\nПароль: ${formData.password}`);
    closeModal('registrationModal');
    
    // Очищаем форму
    document.getElementById('registrationForm').reset();
    
    // Переключаемся на вкладку входа и заполняем данные
    setTimeout(() => {
        openModal('loginModal');
        document.getElementById('parentPhone').value = phoneForLogin;
        document.getElementById('parentPassword').value = formData.password;
    }, 500);
}

// Выбор услуги
function selectService(serviceId) {
    const serviceCard = event.currentTarget;
    
    if (selectedServices.includes(serviceId)) {
        selectedServices = selectedServices.filter(id => id !== serviceId);
        serviceCard.classList.remove('selected');
    } else {
        selectedServices.push(serviceId);
        serviceCard.classList.add('selected');
    }
    
    // Обновляем список выбранных услуг в форме заявки
    updateServiceSelection();
}

// Обновление выбора услуг в форме
function updateServiceSelection() {
    const serviceSelect = document.getElementById('selectedService');
    if (serviceSelect && selectedServices.length > 0) {
        serviceSelect.value = selectedServices[selectedServices.length - 1];
    }
}

// Плавная прокрутка к секции
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Функции для работы с календарем (для админ панели)
function generateCalendar(year, month) {
    const calendar = document.querySelector('.calendar');
    if (!calendar) return;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    calendar.innerHTML = '';

    // Заголовки дней недели
    const dayHeaders = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        dayHeader.style.background = '#667eea';
        dayHeader.style.color = 'white';
        dayHeader.style.fontWeight = 'bold';
        calendar.appendChild(dayHeader);
    });

    // Дни предыдущего месяца
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = prevMonth.getDate() - i;
        calendar.appendChild(dayElement);
    }

    // Дни текущего месяца
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const currentDate = new Date();
        if (year === currentDate.getFullYear() && month === currentDate.getMonth() && day === currentDate.getDate()) {
            dayElement.classList.add('today');
        }

        // Проверяем есть ли записи на этот день
        if (hasAppointmentsOnDate(year, month, day)) {
            dayElement.classList.add('has-appointment');
        }

        dayElement.addEventListener('click', () => showDaySchedule(year, month, day));
        calendar.appendChild(dayElement);
    }

    // Дни следующего месяца
    const remainingDays = 42 - (startingDayOfWeek + daysInMonth);
    for (let day = 1; day <= remainingDays; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = day;
        calendar.appendChild(dayElement);
    }
}

// Проверка наличия записей на определенную дату
function hasAppointmentsOnDate(year, month, day) {
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const targetDate = new Date(year, month, day).toDateString();
    
    return appointments.some(appointment => {
        const appointmentDate = new Date(appointment.date).toDateString();
        return appointmentDate === targetDate;
    });
}

// Показать расписание на день
function showDaySchedule(year, month, day) {
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const targetDate = new Date(year, month, day);
    
    const dayAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate.toDateString() === targetDate.toDateString();
    });

    // Создаем модальное окно с расписанием
    showScheduleModal(dayAppointments, targetDate);
}

// Показать модальное окно с расписанием
function showScheduleModal(appointments, date) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    modalContent.innerHTML = `
        <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
        <h2>Расписание на ${date.toLocaleDateString('ru-RU')}</h2>
        <div class="schedule-list">
            ${appointments.length === 0 ? 
                '<p>На этот день записей нет</p>' :
                appointments.map(apt => `
                    <div class="schedule-item">
                        <strong>${apt.time}</strong> - ${apt.childName} (${apt.service})
                        <br><small>Родитель: ${apt.parentName}</small>
                    </div>
                `).join('')
            }
        </div>
        <button class="btn-primary" onclick="addAppointment('${date.toISOString()}')">Добавить запись</button>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Добавление новой записи
function addAppointment(dateString) {
    const parentName = prompt('Имя родителя:');
    const childName = prompt('Имя ребенка:');
    const service = prompt('Услуга:');
    const time = prompt('Время (например, 10:00):');

    if (parentName && childName && service && time) {
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        appointments.push({
            id: Date.now(),
            date: dateString,
            time: time,
            parentName: parentName,
            childName: childName,
            service: service,
            status: 'confirmed'
        });
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        alert('Запись успешно добавлена!');
        location.reload(); // Обновляем страницу для отображения изменений
    }
}

// Функция для отправки сообщения в WhatsApp
function sendWhatsAppMessage(phone, message) {
    // Номер центра для отправки сообщений
    const centerPhone = '77024181221';
    
    // Форматируем номер получателя
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Создаем сообщение от имени центра
    const messageFromCenter = `От Центра развития "Радуга":\n${message}`;
    
    // Показываем информацию о том, что будет открыто
    if (confirm(`Открыть WhatsApp для отправки сообщения родителю +${cleanPhone}?\n\nСообщение будет отправлено с номера центра +7 702 418 12 21`)) {
        const whatsappUrl = `https://wa.me/${centerPhone}?text=${encodeURIComponent(`Напишите родителю +${cleanPhone}: ${messageFromCenter}`)}`;
        window.open(whatsappUrl, '_blank');
    }
}

// Функции для работы с данными
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadData(key) {
    return JSON.parse(localStorage.getItem(key) || '[]');
}

// Инициализация демо-данных
function initDemoData() {
    if (!localStorage.getItem('initialized')) {
        // Демо заявки
        const demoRequests = [
            {
                id: 1,
                parentName: 'Анна Петрова',
                parentPhone: '+7 777 123 45 67',
                childName: 'Максим',
                childAge: 4,
                selectedService: 'preschool',
                comments: 'Ребенок очень активный, нужен индивидуальный подход',
                date: new Date(Date.now() - 86400000).toISOString(),
                status: 'pending'
            },
            {
                id: 2,
                parentName: 'Елена Козлова',
                parentPhone: '+7 777 234 56 78',
                childName: 'София',
                childAge: 5,
                selectedService: 'english',
                comments: '',
                date: new Date(Date.now() - 172800000).toISOString(),
                status: 'confirmed'
            }
        ];

        // Демо записи
        const demoAppointments = [
            {
                id: 1,
                date: new Date().toISOString(),
                time: '10:00',
                parentName: 'Анна Петрова',
                childName: 'Максим',
                service: 'Подготовка к школе',
                status: 'confirmed'
            },
            {
                id: 2,
                date: new Date(Date.now() + 86400000).toISOString(),
                time: '11:30',
                parentName: 'Елена Козлова',
                childName: 'София',
                service: 'Английский язык',
                status: 'confirmed'
            }
        ];

        // Демо данные для успеваемости
        const demoProgress = [
            {
                childId: 1,
                childName: 'Максим',
                service: 'Подготовка к школе',
                progress: [
                    { date: '2024-01-15', subject: 'Математика', grade: '5', comment: 'Отлично справился с задачей' },
                    { date: '2024-01-20', subject: 'Чтение', grade: '4', comment: 'Нужно больше практики' }
                ]
            }
        ];

        localStorage.setItem('requests', JSON.stringify(demoRequests));
        localStorage.setItem('appointments', JSON.stringify(demoAppointments));
        localStorage.setItem('progress', JSON.stringify(demoProgress));
        localStorage.setItem('initialized', 'true');
    }
}

// =============================================================================
// 🔐 НАСТРОЙКИ ПОЛЬЗОВАТЕЛЕЙ - ОБНОВЛЯЙТЕ ЗДЕСЬ ДОСТУПЫ СОТРУДНИКОВ
// =============================================================================

/**
 * Функция возвращает всех тестовых пользователей системы
 * ДЛЯ ДОБАВЛЕНИЯ НОВОГО СОТРУДНИКА:
 * 1. Добавьте его в соответствующий раздел ниже
 * 2. Сохраните файл
 * 3. Обновите страницу
 */
function getTestUsers() {
    return {
        // 👨‍👩‍👧‍👦 РОДИТЕЛИ (тестовый пользователь)
        parent: {
            '+77771234567': { password: 'Тест', name: 'Тест (Родитель)' },
            '77771234567': { password: 'Тест', name: 'Тест (Родитель)' },
            '+7 777 123 45 67': { password: 'Тест', name: 'Тест (Родитель)' },
            '7 777 123 45 67': { password: 'Тест', name: 'Тест (Родитель)' },
            '+7(777) 123 45 67': { password: 'Тест', name: 'Тест (Родитель)' },
            '8 777 123 45 67': { password: 'Тест', name: 'Тест (Родитель)' },
            '8(777) 123 45 67': { password: 'Тест', name: 'Тест (Родитель)' }
        },
        
        // 👨‍💼 ВЛАДЕЛЬЦЫ / СОТРУДНИКИ (объединенные)
        owner: {
            'Raxa': { password: 'Raxa', name: 'Raxa (Владелец)', role: 'owner' }
            // ДОБАВИТЬ НОВОГО ВЛАДЕЛЬЦА:
            // ,'НовыйЛогин': { password: 'НовыйПароль', name: 'Имя (Владелец)', role: 'owner' }
        },
        
        // 👩‍💻 СОТРУДНИКИ / АДМИНИСТРАТОРЫ (объединенные с владельцами)
        admin: {
            'Admin1': { password: 'Admin1', name: 'Admin1 (Сотрудник)', role: 'admin' }
            // ДОБАВИТЬ НОВОГО СОТРУДНИКА:
            // ,'НовыйЛогин': { password: 'НовыйПароль', name: 'Имя (Сотрудник)', role: 'admin' }
        }
    };
}

// =============================================================================
// КОНЕЦ НАСТРОЕК ПОЛЬЗОВАТЕЛЕЙ
// =============================================================================

// Функция для проверки и восстановления данных пользователей
function checkAndRestoreUserData() {
    try {
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
        const userCount = Object.keys(registeredUsers).length;
        
        console.log(`Найдено ${userCount} зарегистрированных пользователей:`, registeredUsers);
        
        // Проверяем структуру данных и исправляем если нужно
        let needsUpdate = false;
        for (let [key, user] of Object.entries(registeredUsers)) {
            if (!user.parentName && user.name) {
                user.parentName = user.name;
                needsUpdate = true;
            }
            if (!user.type) {
                user.type = 'parent';
                needsUpdate = true;
            }
        }
        
        if (needsUpdate) {
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
            console.log('Обновлены данные пользователей');
        }
        
    } catch (error) {
        console.error('Ошибка при проверке данных пользователей:', error);
        // Если данные повреждены, очищаем их
        localStorage.removeItem('registeredUsers');
    }
}

// Инициализация демо-данных при загрузке
document.addEventListener('DOMContentLoaded', initDemoData);

// =============================================================================
// SUPABASE API FUNCTIONS
// =============================================================================

// Загрузка уроков/занятий
async function loadLessons(fromISO, toISO) {
    const { data, error } = await window.supa
        .from("lessons")
        .select("*, groups(title, teacher_id)")
        .gte("starts_at", fromISO)
        .lte("starts_at", toISO)
        .order("starts_at");
    if (error) { 
        console.error('Error loading lessons:', error);
        return []; 
    }
    return data || [];
}

// Создание записи на занятие
async function createBooking(child_id, lesson_id, comment = "") {
    const { error } = await window.supa.from("bookings").insert({ 
        child_id, 
        lesson_id, 
        comment 
    });
    if (error) {
        console.error('Error creating booking:', error);
        alert('Ошибка при создании записи: ' + error.message);
    }
    return !error;
}

// Обновление статуса записи
async function updateBookingStatus(id, status) {
    const { error } = await window.supa.from("bookings").update({ status }).eq("id", id);
    if (error) {
        console.error('Error updating booking status:', error);
        alert('Ошибка при обновлении статуса: ' + error.message);
    }
    return !error;
}

// Создание счета
async function createInvoice(parent_id, amount, due) {
    const { error } = await window.supa.from("invoices").insert({ 
        parent_id, 
        amount, 
        due_date: due 
    });
    if (error) {
        console.error('Error creating invoice:', error);
        alert('Ошибка при создании счета: ' + error.message);
    }
    return !error;
}

// Добавление оплаты
async function addPayment(invoice_id, amount, provider = "cash", tx_id = null) {
    const { error } = await window.supa.from("payments").insert({ 
        invoice_id, 
        amount, 
        provider, 
        tx_id 
    });
    if (error) {
        console.error('Error adding payment:', error);
        alert('Ошибка при добавлении оплаты: ' + error.message);
    }
    return !error;
}

// Проверка сессии и инициализация realtime
async function initSupabase() {
    try {
        const session = await window.getSession();
        if (session) {
            console.log('User session found:', session.user);
            // Восстанавливаем currentUser из сессии
            const { data: userRows } = await window.supa
                .from("users")
                .select("role_id, full_name")
                .eq("id", session.user.id)
                .limit(1);
            
            const role = userRows?.[0]?.role_id;
            const fullName = userRows?.[0]?.full_name;
            
            currentUser = {
                id: session.user.id,
                email: session.user.email,
                role: role,
                name: fullName || session.user.email
            };
            
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        // Подключаем realtime обновления
        window.supa.channel("db")
            .on("postgres_changes", { event: "*", schema: "public", table: "lessons" }, p => window.refreshLessons?.(p.new))
            .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, p => window.refreshBookings?.(p.new))
            .on("postgres_changes", { event: "*", schema: "public", table: "invoices" }, p => window.refreshInvoices?.(p.new))
            .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, p => window.refreshPayments?.(p.new))
            .subscribe();
            
    } catch (error) {
        console.error('Error initializing Supabase:', error);
    }
}

// Функция редиректа после логина по роли
async function afterLoginRedirect() {
    const { data: { user } } = await window.supa.auth.getUser();
    if (!user) return;

    const { data: rows, error } = await window.supa.from("users").select("role_id").eq("id", user.id).limit(1).maybeSingle();
    if (error) { 
        console.error('Error getting user role:', error); 
        return; 
    }
    const role = rows?.role_id;
    if (role === "owner")      location.href = "/owner-dashboard.html";
    else if (role === "admin") location.href = "/admin-dashboard.html";
    else if (role === "teacher") location.href = "/crm-dashboard.html";
    else                        location.href = "/parent-dashboard.html";
}

// Инициализация Supabase при загрузке
document.addEventListener('DOMContentLoaded', initSupabase);
