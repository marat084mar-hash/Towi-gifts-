/*=============== ПОКАЗ МЕНЮ ===============*/
const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navClose = document.getElementById('nav-close')

// Показ меню
if(navToggle){
    navToggle.addEventListener('click', () =>{
        navMenu.classList.add('show-menu')
    })
}

// Скрытие меню
if(navClose){
    navClose.addEventListener('click', () =>{
        navMenu.classList.remove('show-menu')
    })
}

/*=============== УДАЛЕНИЕ МЕНЮ ПРИ КЛИКЕ НА ССЫЛКУ ===============*/
const navLink = document.querySelectorAll('.nav__link')

const linkAction = () =>{
    const navMenu = document.getElementById('nav-menu')
    // При клике на каждую ссылку, мы удаляем класс show-menu
    navMenu.classList.remove('show-menu')
}
navLink.forEach(n => n.addEventListener('click', linkAction))

/*=============== ДОБАВЛЕНИЕ ТЕНИ НА HEADER ПРИ СКРОЛЛЕ ===============*/
const scrollHeader = () =>{
    const header = document.getElementById('header')
    // Когда скролл больше 50 viewport height, добавляем класс scroll-header
    this.scrollY >= 50 ? header.classList.add('scroll-header') 
                       : header.classList.remove('scroll-header')
}
window.addEventListener('scroll', scrollHeader)

/*=============== ТЕМНАЯ/СВЕТЛАЯ ТЕМА ===============*/ 
const themeButton = document.getElementById('theme-button')
const darkTheme = 'dark-theme'
const iconTheme = 'ri-sun-line'

// Ранее выбранная тема (если пользователь выбрал)
const selectedTheme = localStorage.getItem('selected-theme')
const selectedIcon = localStorage.getItem('selected-icon')
// Мы получаем текущую тему интерфейса, проверяя, есть ли класс dark-theme
const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light'
const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'ri-moon-line' : 'ri-sun-line'

// Мы проверяем, выбрал ли пользователь ранее тему
if (selectedTheme) {
  // Если проверка выполнена, мы спрашиваем, в чем была проблема, чтобы узнать, активировали мы или деактивировали темную тему
  document.body.classListselectedTheme === 'dark' ? 'add' : 'remove'
  themeButton.classListselectedIcon === 'ri-moon-line' ? 'add' : 'remove'
}

// Активация / деактивация темы вручную с помощью кнопки
themeButton.addEventListener('click', () => {
    // Добавление или удаление темной темы / иконки
    document.body.classList.toggle(darkTheme)
    themeButton.classList.toggle(iconTheme)
    // Мы сохраняем тему и текущую иконку, которую выбрал пользователь
    localStorage.setItem('selected-theme', getCurrentTheme())
    localStorage.setItem('selected-icon', getCurrentIcon())
})
console.log('UI script (ui.js) loaded and executed.');
