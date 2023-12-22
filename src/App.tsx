import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { fs } from "@tauri-apps/api"; 
import "./App.css";
import { T } from "@tldraw/tldraw";
import { writeTextFile, BaseDirectory } from '@tauri-apps/api/fs';
// Write a text file to the `$APPCONFIG/app.conf` path

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [task, setTask] = useState("");
  const [tasklist, setTaskList] = useState<string[]>([]);
  const [isListVisible, setListVisible] = useState(false);
  const [recievedTask, setRecievedTask] = useState("");
  const [timer, setTimer] = useState(0);
  const [timeduration, setTimeDuration] = useState(0);

  const[tempMsg, setTempmsg] = useState("hello");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTask(e.currentTarget.value);
  };

  const handleAddTask = () => {
    setTaskList([...tasklist, task]);
    setTask("");
  };

  const handleRemoveTask = (index: number) => {
    const newTaskList = [...tasklist];
    newTaskList.splice(index, 1);
    setTaskList(newTaskList);
  }

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }
 
  async function receive_task_list() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setRecievedTask(await invoke("receive_task_list", { tasklist }));
  }

  const toggleListVisibility = () => {
    setListVisible(!isListVisible);
  };

  async function startTimer(task : string, timeduration : number){
    // await invoke("receive_task", { task, timeduration });
    setTimer(10);
// Write a text file to the `$APPCONFIG/app.conf` path
    await writeTextFile({ path: '../tasks.txt', contents: 'file contents' }, { append: true} );    
    setTimer(timeduration);
  }
  
  function timeDurationer(){
    setTimer(timeduration);
  }
  useEffect(() => {
    let interval: number;
    if (timer > 0) {
      // ...
      interval = window.setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => window.clearInterval(interval);
  }, [timer]);


  return (
    <div className="container">

      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          timeDurationer();
        }}
      >
        <input
          id="time-input"
          onChange={(e) => setTimeDuration(parseInt(e.currentTarget.value))}
          placeholder="Enter a time..."
        />
        <button type="submit">Greet</button>
      </form>

      <p>{greetMsg}</p>
      
      

      <input
        value={task}
        onChange={handleInputChange}
        placeholder="Enter a task..."
      />
      <button onClick={handleAddTask}>Add Task</button>
      <button onClick={toggleListVisibility}>
        {isListVisible ? "Hide List" : "Show List"}
      </button>


      <ul>
        {tasklist.map((task, index) => (
          <li key={index} onDoubleClick={() => handleRemoveTask(index)} onClick={() => startTimer(task, timeduration)}>
            {task}
          </li>
        ))}
      </ul>
  

      <button onClick={receive_task_list}>Receive Task List</button>
      <p>{recievedTask}</p>

      <p style={{ position: 'fixed', bottom: 0 }}>Timer: {timer}</p>
      <p>{tempMsg}</p>
    </div>
  );
  


}
export default App;
