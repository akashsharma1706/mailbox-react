import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
  // Your Firebase configuration
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const EmailClient = () => {
  const [user, setUser] = useState(null);
  const [mailboxes, setMailboxes] = useState([]);
  const [selectedMailbox, setSelectedMailbox] = useState('inbox');
  const [composeFields, setComposeFields] = useState({
    recipients: '',
    subject: '',
    body: '',
  });
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    firebase.auth().onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadMailbox(selectedMailbox);
      } else {
        setUser(null);
      }
    });
  }, [selectedMailbox]);

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
  };

  const signOut = () => {
    firebase.auth().signOut();
  };

  const loadMailbox = (mailbox) => {
    if (user) {
      // Fetch emails for the selected mailbox from Firestore
      db.collection('users')
        .doc(user.uid)
        .collection(mailbox)
        .orderBy('timestamp', 'desc')
        .get()
        .then((querySnapshot) => {
          const emails = [];
          querySnapshot.forEach((doc) => {
            emails.push({ id: doc.id, ...doc.data() });
          });
          setMailboxes(emails);
        })
        .catch((error) => {
          console.error('Error fetching emails:', error);
        });
    }
  };

  const handleCompose = () => {
    // Show compose view
    setSelectedEmail(null);
  };

  const handleSendEmail = (event) => {
    event.preventDefault();
    if (user) {
      // Send email to Firestore
      db.collection('users')
        .doc(user.uid)
        .collection('sent')
        .add({
          recipients: composeFields.recipients,
          subject: composeFields.subject,
          body: composeFields.body,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
          setComposeFields({
            recipients: '',
            subject: '',
            body: '',
          });
          loadMailbox('sent');
        })
        .catch((error) => {
          console.error('Error sending email:', error);
        });
    }
  };

  const handleViewEmail = (emailId, mailbox) => {
    // Fetch and display email details
    db.collection('users')
      .doc(user.uid)
      .collection(mailbox)
      .doc(emailId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          setSelectedEmail({ id: doc.id, ...doc.data() });
        } else {
          console.error('Email not found');
        }
      })
      .catch((error) => {
        console.error('Error fetching email:', error);
      });
  };

  const handleArchiveUnarchive = (emailId, state) => {
    // Archive/Unarchive email logic
    db.collection('users')
      .doc(user.uid)
      .collection(selectedMailbox)
      .doc(emailId)
      .update({
        archived: !state,
      })
      .then(() => loadMailbox(selectedMailbox))
      .catch((error) => {
        console.error('Error archiving/unarchiving email:', error);
      });
  };

  const handleReply = (sender, subject, body, timestamp) => {
    // Reply logic
    setComposeFields({
      recipients: sender,
      subject: `Re: ${subject}`,
      body: `On ${timestamp} ${sender} wrote:\n${body}\n`,
    });
    setSelectedEmail(null); // Hide email view
  };

  const handleMarkAsRead = (emailId) => {
    // Mark email as read logic
    db.collection('users')
      .doc(user.uid)
      .collection(selectedMailbox)
      .doc(emailId)
      .update({
        read: true,
      })
      .catch((error) => {
        console.error('Error marking email as read:', error);
      });
  };

  return (
    <div className="container mt-4">
      {/* Navbar with authentication buttons */}
      <nav className="navbar navbar-light bg-light">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">Email Client</span>
          {user ? (
            <button className="btn btn-link" onClick={signOut}>
              Sign Out
            </button>
          ) : (
            <button className="btn btn-primary" onClick={signInWithGoogle}>
              Sign In with Google
            </button>
          )}
        </div>
      </nav>

      {/* Main content area */}
      {user && (
        <div className="row mt-3">
          <div className="col-md-3">
            {/* Sidebar with mailbox options */}
            <div className="list-group">
              <button
                className={`list-group-item list-group-item-action ${selectedMailbox === 'inbox' ? 'active' : ''}`}
                onClick={() => setSelectedMailbox('inbox')}
              >
                Inbox
              </button>
              <button
                className={`list-group-item list-group-item-action ${selectedMailbox === 'sent' ? 'active' : ''}`}
                onClick={() => setSelectedMailbox('sent')}
              >
                Sent
              </button>
              <button
                className={`list-group-item list-group-item-action ${selectedMailbox === 'archive' ? 'active' : ''}`}
                onClick={() => setSelectedMailbox('archive')}
              >
                Archived
              </button>
            </div>
          </div>
          <div className="col-md-9">
            {/* Email list and view */}
            <div className="row mb-3">
              <div className="col">
                <button className="btn btn-primary" onClick={handleCompose}>
                  Compose
                </button>
              </div>
            </div>
            {mailboxes.length === 0 ? (
              <div className="alert alert-info">No emails in this mailbox.</div>
            ) : (
              <div className="list-group">
                {mailboxes.map((email) => (
                  <button
                    key={email.id}
                    className={`list-group-item list-group-item-action ${email.id === selectedEmail?.id ? 'active' : ''}`}
                    onClick={() => handleViewEmail(email.id, selectedMailbox)}
                  >
                    <strong>{email.subject}</strong>
                    <br />
                    <small>From: {email.sender}</small>
                  </button>
                ))}
              </div>
            )}
            {selectedEmail && (
              <div className="card mt-3">
                <div className="card-header">
                  <strong>{selectedEmail.subject}</strong>
                </div>
                <div className="card-body">
                  <p>
                    <strong>From:</strong> {selectedEmail.sender} &nbsp; | &nbsp;
                    <strong>To:</strong> {selectedEmail.recipients} &nbsp; | &nbsp;
                    <strong>Date:</strong> {selectedEmail.timestamp}
                  </p>
                  <p>{selectedEmail.body}</p>
                  {!selectedEmail.archived && (
                    <button className="btn btn-warning mr-2" onClick={() => handleArchiveUnarchive(selectedEmail.id, selectedEmail.archived)}>
                      Archive
                    </button>
                  )}
                  <button className="btn btn-success mr-2" onClick={() => handleReply(selectedEmail.sender, selectedEmail.subject, selectedEmail.body, selectedEmail.timestamp)}>
                    Reply
                  </button>
                  {!selectedEmail.read && (
                    <button className="btn btn-info" onClick={() => handleMarkAsRead(selectedEmail.id)}>
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailClient;
