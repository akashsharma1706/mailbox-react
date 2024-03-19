import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const EmailClient = () => {
  const [mailboxes, setMailboxes] = useState([]);
  const [selectedMailbox, setSelectedMailbox] = useState('inbox');
  const [composeFields, setComposeFields] = useState({
    recipients: '',
    subject: '',
    body: '',
  });
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    loadMailbox(selectedMailbox);
  }, [selectedMailbox]);

  const loadMailbox = (mailbox) => {
    // Fetch emails for the selected mailbox
    fetch(`/emails/${mailbox}`)
      .then((response) => response.json())
      .then((emails) => setMailboxes(emails));
  };

  const handleCompose = () => {
    // Show compose view
    setSelectedEmail(null);
  };

  const handleSendEmail = (event) => {
    event.preventDefault();
    // Send email logic
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify(composeFields),
    })
      .then((response) => response.json())
      .then((result) => {
        setComposeFields({
          recipients: '',
          subject: '',
          body: '',
        });
        loadMailbox('sent');
      });
  };

  const handleViewEmail = (emailId, mailbox) => {
    // Fetch and display email details
    fetch(`/emails/${emailId}`)
      .then((response) => response.json())
      .then((email) => setSelectedEmail(email));
  };

  const handleArchiveUnarchive = (emailId, state) => {
    // Archive/Unarchive email logic
    fetch(`/emails/${emailId}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: !state,
      }),
    })
      .then(() => loadMailbox('inbox'));
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
    fetch(`/emails/${emailId}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true,
      }),
    });
  };

  return (
    <div className="container mt-4">
      {/* Navbar with buttons to toggle between views */}
      <nav className="navbar navbar-light bg-light">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">Email Client</span>
          <button className="btn btn-primary" onClick={handleCompose}>
            Compose
          </button>
          <button className="btn btn-link" onClick={() => setSelectedMailbox('inbox')}>
            Inbox
          </button>
          <button className="btn btn-link" onClick={() => setSelectedMailbox('sent')}>
            Sent
          </button>
          <button className="btn btn-link" onClick={() => setSelectedMailbox('archive')}>
            Archived
          </button>
        </div>
      </nav>

      {/* Main content area */}
      <div className="row mt-3">
        {/* Left sidebar for email list */}
        <div className="col-md-4">
          <ul className="list-group">
            {mailboxes.map((email) => (
              <li
                key={email.id}
                className={`list-group-item ${email.read ? 'read' : 'unread'}`}
                onClick={() => handleViewEmail(email.id, selectedMailbox)}
              >
                <strong>{email.subject}</strong>
                <br />
                {email.sender} - {email.timestamp}
              </li>
            ))}
          </ul>
        </div>

        {/* Right sidebar for email details */}
        <div className="col-md-8">
          {selectedEmail ? (
            <div className="card mt-3">
              <div className="card-header">
                <strong>{selectedEmail.subject}</strong>
              </div>
              <div className="card-body">
                <p>
                  <strong>From:</strong> {selectedEmail.sender}
                  <br />
                  <strong>To:</strong> {selectedEmail.recipients}
                  <br />
                  <strong>Date:</strong> {selectedEmail.timestamp}
                </p>
                <p>
                  <strong>Message:</strong>
                  <br />
                  {selectedEmail.body}
                </p>
              </div>
              <div className="card-footer">
                <button className="btn btn-warning" onClick={() => handleArchiveUnarchive(selectedEmail.id, selectedEmail.archived)}>
                  {selectedEmail.archived ? 'Unarchive' : 'Archive'}
                </button>
                <button className="btn btn-success ms-2" onClick={() => handleReply(selectedEmail.sender, selectedEmail.subject, selectedEmail.body, selectedEmail.timestamp)}>
                  Reply
                </button>
                <button className="btn btn-info ms-2" onClick={() => handleMarkAsRead(selectedEmail.id)}>
                  Mark as Read
                </button>
              </div>
            </div>
          ) : (
            <div className="alert alert-info mt-3" role="alert">
              Click on an email to view its details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailClient;
