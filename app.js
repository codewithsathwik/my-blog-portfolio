// Theme toggle logic
const themeToggleBtn = document.getElementById('theme-toggle');

// Check for saved theme in localStorage or prefer-color-scheme
const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
if (currentTheme) {
    document.documentElement.classList.toggle('dark', currentTheme === 'dark');
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        let theme = 'light';
        if (document.documentElement.classList.contains('dark')) {
            theme = 'dark';
        }
        localStorage.setItem('theme', theme);
    });
}


// Tab switching logic
function switchTab(event, tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    // Remove active class from all tabs
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('tab-active', 'font-bold');
        button.classList.add('opacity-70');
    });

    document.getElementById(tabName + '-content').classList.remove('hidden'); // Show selected tab content

    event.target.classList.add('tab-active', 'font-bold'); // Add active class to clicked tab
    event.target.classList.remove('opacity-70');
}

let btnList = document.querySelectorAll("#navbtn button");

btnList.forEach((btn) => {
    btn.addEventListener("click", (event) => {
        let textValue = btn.textContent.trim().toLowerCase();
        switchTab(event, textValue);
    });
});