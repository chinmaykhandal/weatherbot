import React from 'react';
import "./UserTable.css"
const UserTable = ({ users }) => {
  return (
    <div>
      <h2>User Details</h2>
      <table className="user-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Subscribed</th>
            <th>City</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.userid}</td>
              <td>{user.name}</td>
              <td className={user.isSubscribed ? 'subscribed' : 'not-subscribed'}>
                {user.isSubscribed ? 'Yes' : 'No'}
              </td>
              <td>{user.city}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;