let taskCount = 0;

document.getElementById("addbtn").addEventListener("click", () => { //Lisab nupule, mille id on "addbtn", sündmuse kuulaja, mis peab reageerima pärast kliiki
  taskCount++; // Suurendab iga kord, kui nuppu vajutatakse.  

  const taskDiv = document.createElement("div");
  taskDiv.className = "task"; //Loob uue "div" elemendi, mis esindab ülesannet, ja määrab sellele klassi "task".

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  const taskInput = document.createElement("input");
  taskInput.type = "text";
  taskInput.value = `Task ${taskCount}`;

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "deleteBtn";
  deleteBtn.innerHTML = "DELETE";
  deleteBtn.onclick = () => taskDiv.remove();

  taskDiv.appendChild(checkbox);
  taskDiv.appendChild(taskInput);
  taskDiv.appendChild(deleteBtn);

  document.getElementById("taskContainer").appendChild(taskDiv);
});
