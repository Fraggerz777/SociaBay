import React, { useRef, useState } from 'react';
import './App.css';

//import Firebase SDK
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/analytics';

//import  Firebase Hooks
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

//Firebase Project Config
firebase.initializeApp({
  apiKey: "AIzaSyC8HBDrU54iVmhpCAuhmI-YJKtNN_qO-IM",
  authDomain: "sociabay-e605b.firebaseapp.com",
  projectId: "sociabay-e605b",
  storageBucket: "sociabay-e605b.appspot.com",
  messagingSenderId: "721751255431",
  appId: "1:721751255431:web:191fe86d6430f9ae60cb22",
  measurementId: "G-CF8CL4LX24"
})

//reference to Firebase SDK as a global Variable
const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  //Verification to identify whether the user is logged in or not
  //if logged in return Object with Email and Password, If not user is null
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>🔥SociaBay ⛴ 💬</h1>
        <SignOut />
      </header>
      
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}
// Button reads for click on "sign in", direct to GoogleAuthProvider then pass to signInWithPopup
function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Do not violate the community guidelines or you will be banned for life!</p>
    </>
  )

}
//check if there is a current user. if true add button that trigger sign out
function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

/* reference firestore collection then query documents in database, orderby 25 latest comments.
the query listen to any updates in the real time using usecollection data hook. React change in realtime */
function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limitToLast(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }
/*Loop for each document, Form onSubmit Input untuk Message */

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>
    
    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <button type="submit" disabled={!formValue}>🕊️</button>

    </form>
  </>)
}

//Display Chat messages
function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src = {photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt=''/>
      <p>{text}</p>
    </div>
  </>)
}


export default App;