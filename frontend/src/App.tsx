import { useState } from "react";
import "./App.css";
import { ZoomMtg } from "@zoom/meetingsdk";
import axios from "axios";

ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

function App() {
  // const authEndpoint = "http://localhost:8080/api/meeting/authorize";
  const authEndpoint = "http://localhost:8000/api/meeting/authorize";
  const sdkKey = "iS9tJyIvQVyjyHhjE1C9ng";
  const role = 0;
  const userName = "Hey";
  const userEmail = "example@email.com";
  const registrantToken = "";
  const zakToken = "";
  const leaveUrl = "http://localhost:5173";

  const [topic, setTopic] = useState<string>();
  const [agenda, setAgenda] = useState<string>();
  const [startTime, setStartTime] = useState<string>();

  const [meetingNumber, setMeetingNumber] = useState<string>('');
  const [meetingPassword, setMeetingPassword] = useState<string>('');

  const getSignature = async () => {
    console.log('meeting number', meetingNumber)
    console.log('meeting password', meetingPassword)

    try {
      const req = await fetch(authEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meeting_no: meetingNumber,
          role: role,
        }),
      });
      const res = await req.json()
      const signature = res.signature as string;
      startMeeting(signature)
    } catch (e) {
      console.log(e);
    }
  };

  const scheduleMeeting = async () => {
    await axios({
      method: 'post',
      url: `http://localhost:8000/api/meeting/create`,
      data: { topic: topic, agenda: agenda, start_time: startTime },
      headers: {
        Authorization: "your auth token here"
      }
    }).then(res => {
      console.log("Meeting successfully created!", res)
      setMeetingNumber(res.data.res.id)
      setMeetingPassword(res.data.res.encrypted_password)
    }).catch((err) => {
      console.log(err)
    })
  }

  const startAndJoin = async () => {
    await scheduleMeeting();
    await getSignature();
  }

  function startMeeting(signature: string) {
    document.getElementById("zmmtg-root")!.style.display = "block";

    console.log("signature", signature)

    ZoomMtg.init({
      leaveUrl: leaveUrl,
      patchJsMedia: true,
      leaveOnPageUnload: true,
      success: (success: unknown) => {
        console.log(success);
        // can this be async?
        ZoomMtg.join({
          signature: signature,
          sdkKey: sdkKey,
          meetingNumber: meetingNumber,
          passWord: meetingPassword,
          userName: userName,
          userEmail: userEmail,
          tk: registrantToken,
          zak: zakToken,
          success: (success: unknown) => {
            console.log(success);
          },
          error: (error: unknown) => {
            console.log(error);
          },
        });
      },
      error: (error: unknown) => {
        console.log(error);
      },
    });
  }

  return (
    <div className="App">
      <main>
        <h1>Zoom Meeting SDK Sample React</h1>
        <input onChange={(e) => setTopic(e.target.value)} placeholder='enter topic'></input> <br /><br />
        <input onChange={(e) => setAgenda(e.target.value)} placeholder='enter agenda'></input><br /><br />
        <input onChange={(e) => setStartTime(e.target.value)} placeholder='enter start datetime'></input><br />
        <div>format: YYYY-MM-DD HH:mm</div>
        <div><button onClick={scheduleMeeting}>Schedule Meeting</button></div> 
        <button onClick={getSignature}>Join Meeting</button>
      </main>
    </div>
  );
}

export default App;
