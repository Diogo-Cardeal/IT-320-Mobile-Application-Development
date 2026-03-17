// Get elements from the HTML page
const addButton = document.getElementById("addTaskBtn");
const input = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");


// Event listener waits for the user to click the Add Task button
addButton.addEventListener("click", function() {

    // If the input is empty, do nothing
    if(input.value === ""){
        return;
    }

    // Create a new list item (task)
    const task = document.createElement("li");

    // The text of the task comes from the input field
    task.textContent = input.value;

    // When clicking the task, mark it as completed
    task.addEventListener("click", function(){
        task.classList.toggle("completed");
    });

    // Create a remove button
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";

    // When clicking remove, delete the task
    removeBtn.addEventListener("click", function(event){
        event.stopPropagation(); // prevents marking complete
        task.remove();
    });

    // Add remove button inside the task
    task.appendChild(removeBtn);

    // Add the task to the list
    taskList.appendChild(task);

    // Clear the input field
    input.value = "";
});