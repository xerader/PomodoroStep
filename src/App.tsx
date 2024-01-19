import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
// Write a text file to the `$APPCONFIG/app.conf` path

import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/api/notification';


async function checkPermission(){
  let permissionGranted = await isPermissionGranted();
  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === 'granted';
  }
}

function App() {
  checkPermission();

  const [task, setTask] = useState("");
  const [tasklist, setTaskList] = useState<string[]>([]);
  const [todayTaskList, settodayTaskList] = useState("");

  const [timer, setTimer] = useState(0);
  const [timeduration, setTimeDuration] = useState(0);
  const[taskClicked, setTaskClicked] = useState(false);
  const[day_duration, setDayDuration] = useState(0);
  const[week_duration, setWeekDuration] = useState(0);

  
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


  async function recieve_task_list() {
    settodayTaskList(await invoke("recieve_task_list"));    
  }


  async function startTimer(task : string, timeduration : number){
    // await invoke("receive_task", { task, timeduration });
// Write a text file to the `$APPCONFIG/app.conf` path
    await( invoke('receive_task', { task, timeduration }) );
    setTimer(timeduration);
  }
  
  async function get_day_duration() 
  {
    setDayDuration(await invoke('sum_up_day'));
  }

  function timeDurationer(){
    setTimer(timeduration);
  }
  useEffect(() => {
    if (!taskClicked){
      return ; 
    }

    let interval: number;
    if (timer > 0) {
      // ...
      interval = window.setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
    } else {
      if (timer == 0){
        // const audio = new Audio('/rando_pomodoro_sound.mp3');

        // audio.play().catch(error => console.log(error));
        sendNotification({body: 'Timer up', title: 'Pomodoro_App', icon: '/tauri_logo.png', sound: '/public/rando_pomodoro_sound.mp3'});
        // invoke('play_sound')
        // new Audio('/rando_pomodoro_sound.mp3').play().catch(error => console.log(error));
        setTaskClicked(false);
      }
    }
    return () => window.clearInterval(interval);
  }, [timer, taskClicked]);
  


  return (
    <div className="container">


      <form
        className="row"
        style={{width: "50%", textAlign: "center", margin: "auto"}}
        onSubmit={(e) => {
          e.preventDefault();
          timeDurationer();
        }}
      >
        <input
          id="time-input"
          onChange={(e) => setTimeDuration(parseFloat(e.currentTarget.value) * 60)}
          placeholder="Enter a time in minutes..."
        />
        <button type="submit" style={{display: "block", width: "30%"}}>Enter</button>
      </form>

      <br></br>
      
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "50%", margin: "auto" }}>
  <input
    value={task}
    style={{ flex: 1, margin: "0px" }}
    onChange={handleInputChange}
    placeholder="Enter a task..."
  />
  <button style={{ width: "30%", margin: "0px" }} onClick={handleAddTask}>Add</button>
</div>

      <ul style={{ listStyleType: "none", padding: 0 }}>
      {tasklist.map((task, index) => (
        <li key={index}>
          <button 
            style={{ display: "block", width: "auto", textAlign: "center", margin: "auto", padding: "10px" }}
            onDoubleClick={() => handleRemoveTask(index)} 
            onClick={() => {startTimer(task, timeduration); setTaskClicked(true);}}
          >
            {task}
          </button>
        </li>
          ))}
        </ul>
  

      <div style= {{fontSize: '20px'}}>{Math.floor(timer / 60)}:{timer % 60 < 10 ? '0' : ''}{timer % 60}</div>
      {/* <button style={{ width: "30%", margin: "0px" }} onClick={() => get_day_duration()}>Get Day Duration</button>
      <p>{day_duration}</p>  */}
    </div>
    
  );
  


}
export default App;
