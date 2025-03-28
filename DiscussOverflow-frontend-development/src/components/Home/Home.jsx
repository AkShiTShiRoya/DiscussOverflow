import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import MDEditor, { commands } from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import { protectedApi } from "../../services/api";

const Home = () => {
  const [threads, setThreads] = useState([]); // state to store fetched threads
  const [newThread, setNewThread] = useState({}); // state to store new thread payload
  const [create, setCreate] = useState(false); // state to toggle thread creation box
  const [filter, setFilter] = useState("all"); // filter options for displayed threads
  const [topContributors, setTopContributors] = useState([]); // state to store fetched top contributors
  const navigate = useNavigate();

  useEffect(() => {
    // set new thread payload to empty everytime create state updates
    setNewThread({});
  }, [create]);

  // fetch threads from the backend
  const fetchThreads = () => {
    protectedApi
      .get(`/api/v1/thread?filter=${filter}`)
      .then((response) => {
        if (response.status === 200) {
          setThreads(response.data);
        }
      })
      .catch((err) => {
        console.error("Threads fetching failed! ", err);
      });
  };

  // fetch top contributors from the backend
  const fetchTopContributors = () => {
    protectedApi
      .get("/api/v1/users/top")
      .then((response) => {
        if (response.status === 200) {
          setTopContributors(response.data);
        }
      })
      .catch((err) => {
        console.error("fetch top contributors", err);
      });
  };

  useEffect(() => {
    // fetch threads again when filter changes
    fetchThreads();
  }, [filter]);

  useEffect(() => {
    // fetch top contributors when components mounts
    fetchTopContributors();
  }, []);

  useEffect(() => {
    // fetch threads when component mounts
    fetchThreads();
  }, []);

  // send new thread payload to backend
  const createNewThread = () => {
    protectedApi
      .post("/api/v1/thread", {
        title: newThread.title,
        content: newThread.content,
      })
      .then((response) => {
        if (response.status === 201) {
          fetchThreads();
          setCreate(false);
        }
      });
  };

  return (
    <div id="home-page-container">
      <div className="bg-keppel flex flex-col items-center justify-center p-16 space-y-9">
        <div className="text-[#FFFEFE] text-6xl font-medium">Hello. 👋</div>
        <div className="text-[#fcfaf7] text-3xl">
          Welcome to the SVGU Open-Source community&apos;s discussion forum.
        </div>
      </div>
      <div className="w-4/5 mx-auto h-full p-4 my-4 text-[#030509] flex justify-between items-center">
        <div className="flex font-normal text-lg">
          <button
            className={`px-3 py-2 mx-2 ${
              filter === "all" ? "bg-keppel text-[#FFFEFE]" : ""
            } hover:bg-keppel-dark hover:text-[#FFFEFE] transition`}
            onClick={() => setFilter("all")}
          >
            All Threads
          </button>
          <button
            className={`px-3 py-2 mx-2 ${
              filter === "top" ? "bg-keppel text-[#FFFEFE]" : ""
            } hover:bg-keppel hover:text-[#FFFEFE] transition`}
            onClick={() => setFilter("top")}
          >
            Top
          </button>
          <button
            className={`px-3 py-2 mx-2 ${
              filter === "unseen" ? "bg-keppel text-[#FFFEFE]" : ""
            } hover:bg-keppel hover:text-[#FFFEFE] transition`}
            onClick={() => setFilter("unseen")}
          >
            Unseen
          </button>
        </div>
        <button
          className="px-3 py-2 mx-2 bg-keppel hover:bg-keppel-dark text-white transition font-medium"
          onClick={() => setCreate(true)}
        >
          New Thread
        </button>
      </div>

      {/* threads listing area */}
      <div className="w-4/5 mx-auto flex justify-start items-start">
        <table className="w-2/3">
          <thead>
            <tr className="px-4 border-b-[3px]">
              <th>Title</th>
              <th className="px-2">views</th>
              <th className="px-2">Replies</th>
              <th className="px-2">Reach</th>
              <th className="px-2">Likes</th>
            </tr>
          </thead>
          <tbody>
            {threads
              ? threads.map((thread) => (
                  <tr
                    key={thread._id}
                    className="cursor-pointer hover:bg-[#f8f8f9] border-b-2"
                    onClick={() => navigate(`/thread/${thread._id}`)}
                  >
                    <td>
                      <div className="flex flex-col space-y-2 p-3">
                        <div className="text-xl">{thread.title}</div>
                        <div className="text-sm">
                          Author: {thread.author.username}
                        </div>
                      </div>
                    </td>
                    <td className="text-center">{thread.views}</td>
                    <td className="text-center">{thread.replies}</td>
                    <td className="text-center">{thread.reach}</td>
                    <td className="text-center">{thread.likes}</td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
        <table className="mx-auto w-1/4">
          <thead>
            <tr className="px-4 border-b-[3px]">
              <th colSpan="2" className="px-2">
                Top Contributors
              </th>
            </tr>
          </thead>
          <tbody>
            {topContributors?.map((contributor) => (
              <tr key={contributor?._id}>
                <td className="flex justify-between items-center">
                  <div className="flex justify-center items-center">
                    <span className="aspect-square w-fit px-3 mx-2 my-1 rounded-full text-white flex flex-col justify-center items-center bg-keppel">
                      <span>{contributor?.username[0]?.toUpperCase()}</span>
                    </span>
                    <span>{contributor?.username}</span>
                  </div>
                  <div className="flex justify-center items-center space-x-1">
                    <svg
                      className="w-4 h-4 text-red-600"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="red"
                      viewBox="0 0 21 19"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 4C5.5-1.5-1.5 5.5 4 11l7 7 7-7c5.458-5.458-1.542-12.458-7-7Z"
                      />
                    </svg>
                    <span>{contributor?.likesReceived}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* new thread component */}
      {create ? (
        <div className="fixed bottom-0 left-0 right-0 w-4/5 h-3/10 mx-auto bg-[#FFFEFE] shadow-2xl border-t-8 border-keppel">
          <div className="w-4/5 mx-auto my-10">
            <input
              type="text"
              name="title"
              placeholder="Title"
              className="border-2 w-1/2 p-1 border-[#d5dce2] focus:keppel focus:ring-0 focus:border-keppel block focus:ring-keppel focus-visible:outline-none"
              value={newThread.title || ""}
              onChange={(e) =>
                setNewThread({ ...newThread, title: e.target.value })
              }
            />
            <div data-color-mode="light" className="mx-auto m-5">
              <MDEditor
                value={newThread.content}
                onChange={(val) => {
                  console.log(val);
                  setNewThread({
                    ...newThread,
                    content: val,
                  });
                }}
                previewOptions={{
                  rehypePlugins: [[rehypeSanitize]], // add security to the markdown
                }}
                // SOME OF THE COMMANDS OTHER THAN LISTED BELOW BREAKING IN DEVELOPMENT BUT RUNNING FINE IN PRODUCTION, HOWEVER WITH THESE COMMANDS SPECIFIED, PRODUCTION IS BREAKING
                // commands={[
                //   commands.bold,
                //   commands.italic,
                //   commands.strikethrough,
                //   commands.hr,
                //   commands.link,
                //   commands.quote,
                //   commands.code,
                // ]}
                // extraCommands={[
                //   commands.codeEdit,
                //   commands.codeLive,
                //   commands.codePreview,
                // ]}
              />
            </div>
            <button
              className="p-1 px-4 text-white bg-keppel hover:bg-keppel-dark transition disabled:bg-slate-300"
              disabled={!newThread.title || !newThread.content}
              onClick={createNewThread}
            >
              Create
            </button>
          </div>
          <button
            className="absolute top-0 right-0 p-2 text-gray-700 hover:text-keppel-dark transition"
            onClick={() => setCreate(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Home;
