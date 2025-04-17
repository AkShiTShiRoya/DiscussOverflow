import { useEffect, useState } from "react";
import { protectedApi } from "../../services/api";
import { Link } from "react-router-dom";

const Admin = () => {
  const [userList, setUserList] = useState([]);

  const handleUserListApiCall = () => {
    protectedApi
      .get("/api/admin/v1/users")
      .then((response) => {
        if (response.status === 200) {
          setUserList(response.data?.users || []);
        }
      })
      .catch((err) => {
        console.error("GET users error:", err);
      });
  };

  const handleDeleteUser = (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    protectedApi
      .delete(`/api/admin/v1/users/${userId}`)
      .then((response) => {
        if (response.status === 200) {
          alert("User deleted successfully.");
          handleUserListApiCall();
        }
      })
      .catch((err) => {
        console.error("DELETE user error:", err);
        alert("Failed to delete user.");
      });
  };

  useEffect(() => {
    handleUserListApiCall();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-keppel">User Management</h2>

      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-keppel text-white">
            <tr>
              <th className="border p-3 text-sm">Username</th>
              <th className="border p-3 text-sm">Email</th>
              <th className="border p-3 text-sm">Created At</th>
              <th className="border p-3 text-sm">Last Visit</th>
              <th className="border p-3 text-sm">Visited Days</th>
              <th className="border p-3 text-sm">Likes Received</th>
              <th className="border p-3 text-sm">Threads Visited</th>
              <th className="border p-3 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((user) => (
              <tr
                key={user._id}
                className="text-center even:bg-[#f0fdfa] hover:bg-[#e6fffa]"
              >
                <td className="border p-2">{user.username}</td>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">
                  {new Date(user.createdTimestamp * 1000).toLocaleString()}
                </td>
                <td className="border p-2">
                  {user.lastVisitDate
                    ? new Date(user.lastVisitDate).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="border p-2">{user.visitedDays || 0}</td>
                <td className="border p-2">{user.likesReceived || 0}</td>
                <td className="border p-2">
                  {user.visitedThreads?.length || 0}
                </td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                  <Link to={`/userprofile/${user._id}`}>
                    <button className="bg-keppel-900 text-white px-3 py-1 rounded-md hover:bg-[#319f83] transition">
                      Threads
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
            {userList.length === 0 && (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
