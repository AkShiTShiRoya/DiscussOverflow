import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { protectedApi } from "../../services/api";

const UserDetailsWithThreads = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userThreads, setUserThreads] = useState([]);
  console.log("userThreads :", userThreads);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await protectedApi.get(
          `/api/admin/v1/users/${userId}/threads`
        );
        const threads = response.data.threads || response.data;
        setUserThreads(threads);
      } catch (error) {
        console.error("Error fetching user threads:", error);
      }
    };
    const fetchUser = async () => {
      try {
        const userRes = await protectedApi.get(`/api/admin/v1/users/${userId}`);
        setUser(userRes.data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    if (userId) {
      fetchUser();
      fetchThreads();
    }
  }, [userId]);

  const handleDeleteThread = async (threadId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this thread?"
    );
    if (!confirmDelete) return;

    try {
      await protectedApi.delete(`/api/admin/v1/threads/${threadId}`);
      setUserThreads((prev) =>
        prev.filter((thread) => thread._id !== threadId)
      );
    } catch (error) {
      console.error("Error deleting thread:", error);
      alert("Failed to delete the thread.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-end items-end">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 bg-keppel-400 text-white px-4 py-2 rounded-full hover:bg-keppel-600"
        >
          X
        </button>
      </div>

      {user ? (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-keppel-600 mb-4">
            User Details
          </h2>
          <table className="min-w-[300px] border border-keppel-200 shadow-sm rounded">
            <tbody>
              <tr className="bg-keppel-50">
                <td className="border p-2 font-semibold">Username</td>
                <td className="border p-2">{user.username}</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">Email</td>
                <td className="border p-2">{user.email}</td>
              </tr>
              <tr className="bg-keppel-50">
                <td className="border p-2 font-semibold">Created</td>
                <td className="border p-2">
                  {new Date(user.createdTimestamp * 1000).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">Last Visit</td>
                <td className="border p-2">
                  {user.lastVisitDate
                    ? new Date(user.lastVisitDate).toLocaleDateString()
                    : "N/A"}
                </td>
              </tr>
              <tr className="bg-keppel-50">
                <td className="border p-2 font-semibold">Visited Days</td>
                <td className="border p-2">{user.visitedDays || 0}</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">Likes Received</td>
                <td className="border p-2">{user.likesReceived || 0}</td>
              </tr>
              <tr className="bg-keppel-50">
                <td className="border p-2 font-semibold">Threads Visited</td>
                <td className="border p-2">
                  {user.visitedThreads?.length || 0}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p>Loading user info...</p>
      )}

      <h3 className="text-xl font-semibold text-keppel-500 mb-3">
        User Threads
      </h3>
      {userThreads.length > 0 ? (
        <table className="min-w-full border border-keppel-200 shadow-md rounded overflow-hidden">
          <thead className="bg-keppel-100 text-keppel-800">
            <tr>
              <th className="border p-2">Title</th>
              <th className="border p-2">Views</th>
              <th className="border p-2">Likes</th>
              <th className="border p-2">Replies</th>
              <th className="border p-2">Created</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {userThreads.map((thread) => (
              <tr
                key={thread._id}
                className="text-center hover:bg-keppel-50 transition"
              >
                <td className="border p-2">{thread.title}</td>
                <td className="border p-2">
                  {thread.views
                    ? Object.values(thread.views).reduce(
                        (acc, count) => acc + count,
                        0
                      )
                    : 0}
                </td>
                <td className="border p-2">{thread.likes?.length || 0}</td>
                <td className="border p-2">{thread.replies?.length || 0}</td>
                <td className="border p-2">
                  {new Date(thread.createDate).toLocaleString()}
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => handleDeleteThread(thread._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-600">No threads found.</p>
      )}
    </div>
  );
};

export default UserDetailsWithThreads;
