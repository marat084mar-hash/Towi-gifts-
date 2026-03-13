supabase.from('test_table').select('*').then(result => {
  if (result.error) {
    console.error('Ошибка подключения к Supabase:', result.error);
  } else {
    console.log('Supabase клиент инициализирован успешно');
  }
});
