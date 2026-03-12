// ВАЖНО: Убедитесь, что эти URL и ключ соответствуют вашим в Supabase.
const SUPABASE_URL = 'https://xwuihcpxqkseejkwmwiz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3dWloY3B4cWtzZWVqa3dtd2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU2MDI0MjAsImV4cCI6MjAzMTE3ODQyMH0.b2X5flLSoFzP8yGk-yANeY8qj0omS6Gj2xW9iW5hDgc';

// Проверяем, что константы не пустые. Это хорошая практика.
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase URL and Anon Key are required. Check case.v2.js");
}

// Инициализация клиента Supabase. Используем глобальную библиотеку, подключенную через CDN.
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Асинхронно загружает кейсы из таблицы 'cases' в Supabase.
 * Эта функция теперь будет вызываться из global.v2.js
 * @returns {Promise<Array>} Возвращает массив объектов кейсов. В случае ошибки, пробрасывает её дальше.
 */
async function fetchCasesFromDB() {
    console.log('Attempting to fetch cases from Supabase...');
    
    // Делаем запрос к таблице 'cases' и выбираем все поля ('*')
    const { data, error } = await supabase
        .from('cases') 
        .select('*'); 

    // Лучшая практика - обработка ошибок прямо здесь
    if (error) {
        console.error('Error fetching cases from Supabase:', error.message);
        // Выбрасываем ошибку, чтобы её можно было поймать в вызывающем коде (в global.v2.js)
        throw new Error(`Supabase query failed: ${error.message}`);
    }

    // Если данные пришли, но это не массив или он пустой
    if (!data || data.length === 0) {
        console.warn('Supabase returned no data or an empty array.');
    } else {
        console.log('Successfully fetched cases:', data);
    }
    
    return data || []; // Всегда возвращаем массив, даже если он пустой
