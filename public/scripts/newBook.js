
//const createNewBookElement = document.getElementById('new-book-create ');
const newBookElement = document.getElementById('new-book-create');
//console.log(createNewBookElement);
const titleElement = document.getElementById('title');
const summaryElement = document.getElementById('summary');
const nameElement = document.getElementById('name');
const emailElement = document.getElementById('email')

async function createNewBook(event){
    event.preventDefault();

    const enteredTitle = titleElement.value;
    const enteredSummary = summaryElement.value;
    

    const enteries = {title:enteredTitle,summary:enteredSummary};
    const response = await fetch('/createNewBook', {
        method:'POST',
        body: JSON.stringify(enteries),
        headers:{
            'Content-Type': 'application/json'
        }
        
        }
    );
    //const newBook = response.json();
    if(response){
        swal.fire({
            title: 'Success',
            width: 300,
            text: 'Book updated',
            icon: 'success'
        });
    }
}

newBookElement.addEventListener('submit', createNewBook);
// if(createNewBookElement){
//     createNewBookElement.addEventListener('submit',createNewBook)

// }