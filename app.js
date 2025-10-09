
function switchTab(event, tabName) {

    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    // Remove active class from all tabs
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('tab-active', 'text-gray-900');
        button.classList.add('text-gray-600');
    });

    
    document.getElementById(tabName + '-content').classList.remove('hidden');// Show selected tab content

    event.target.classList.add('tab-active', 'text-gray-900');// Add active class to clicked tab
    event.target.classList.remove('text-gray-600');
}

let btnList = document.querySelectorAll("#navbtn button");

btnList.forEach((btn)=>{
    btn.addEventListener("click", (event)=>{
        let textValue = btn.textContent.trim().toLowerCase();
        // console.log(textValue);
        switchTab(event, textValue);
    })
})