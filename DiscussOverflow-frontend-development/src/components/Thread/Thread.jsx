import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import MDEditor, { commands } from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import { protectedApi } from "../../services/api";
import { useProfile } from "../../hooks/useProfile";
import RightIcon from "../../assets/Image/correct-icon.svg";
import CircleRing from "../../assets/Image/circle-ring.svg";

const Thread = () => {
  const { id } = useParams(); // id of the requested thread
  const router = useNavigate();
  const [replyVisible, setReplyVisible] = useState(false); // use state to toggle reply markdown box
  const [newReply, setNewReply] = useState({}); // new reply payload
  const [thread, setThread] = useState(); // fetched thread details
  const [message, setMessage] = useState({}); // error or success message
  const [isEditThread, setIsEditThread] = useState(false); // error or success message
  const [editThread, setEditThread] = useState({
    content: thread?.content,
  }); // new reply payload
  const { profile } = useProfile();
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editingReplyContent, setEditingReplyContent] = useState("");

  const userData = JSON.parse(localStorage.getItem("userData")) || null;

  useEffect(() => {
    // clear payload eveytime replyVisible is updated
    setNewReply({});
  }, [replyVisible]);

  // clear message after 2 seconds
  useEffect(() => {
    let resetTimer;
    if (message) {
      resetTimer = setTimeout(() => {
        setMessage({});
      }, 2000);
    }

    return () => clearTimeout(resetTimer);
  }, [message]);

  // fetch thread from the backend
  const fetchThread = () => {
    protectedApi
      .get(`/api/user/v1/thread/${id}`)
      .then((response) => {
        if (response.status === 200) {
          console.log(response.data);
          setThread(response.data);
        }
      })
      .catch((err) => {
        console.error("GET thread", err);
      });
  };

  // send reply payload to the backend
  const sendReply = () => {
    const { content } = newReply;
    protectedApi
      .post("/api/user/v1/thread/reply", { threadId: id, content })
      .then((response) => {
        if (response.status === 201) {
          console.log(response);
          setMessage({
            color: "keppel",
            content: "success",
          });
          fetchThread();
          setNewReply({});
        }
      });
  };

  const updateThread = () => {
    const { content } = editThread;
    protectedApi
      .patch(`/api/user/v1/thread/${id}`, { content })
      .then((response) => {
        if (response.status === 200) {
          console.log(response);
          fetchThread();
          setMessage({
            color: "keppel",
            content: "success",
          });
          setIsEditThread(false);
          setEditThread({});
        }
      });
  };

  // send like or disllike request to the backend
  const likeDislikeThread = () => {
    const { liked } = thread;
    protectedApi
      .post("/api/user/v1/thread/like", { threadId: id, like: !liked })
      .then((response) => {
        if (response.status === 201) {
          fetchThread();
        }
      })
      .catch((err) => {
        console.error("Like-dislike thread", err);
      });
  };

  const handleThreadDelete = () => {
    protectedApi
      .delete(`/api/user/v1/thread/${id}`)
      .then((response) => {
        if (response.status === 200) {
          router("/");
        }
      })
      .catch((err) => {
        console.error("delete thread", err);
      });
  };

  const handleReplyUpdate = (replyId) => {
    protectedApi
      .patch(`/api/user/v1/thread/reply/${replyId}`, {
        content: editingReplyContent,
      })
      .then((res) => {
        if (res.status === 200) {
          fetchThread();
          setEditingReplyId(null);
          setEditingReplyContent("");
        }
      })
      .catch((err) => {
        console.error("Update reply", err);
      });
  };

  const handleReplyDelete = (replyId) => {
    protectedApi
      .delete(`/api/user/v1/thread/reply/${replyId}`)
      .then((response) => {
        if (response.status === 200) {
          // Optionally update UI or reload
          window.location.reload(); // or re-fetch the thread
        }
      })
      .catch((err) => {
        console.error("delete reply", err);
      });
  };

  // fetch thread on component mount
  useEffect(() => {
    fetchThread();
  }, []);

  const likeDislikeThreadReplay = (replyId, liked) => {
    protectedApi
      .post("/api/user/v1/thread-replay/like", {
        threadId: id,
        replyId,
        like: !liked,
      })
      .then((response) => {
        if (response.status === 201) {
          fetchThread();
        }
      })
      .catch((err) => {
        console.error("Like-dislike thread", err);
      });
  };

  const handleAuthorisedReplay = (replyData) => {
    protectedApi
      .patch(`/api/user/v1/thread/${id}/verify/${replyData?._id}`)
      .then((response) => {
        if (response.status === 200) {
          console.log(response);
          fetchThread();
          setMessage({
            color: "keppel",
            content: "success",
          });
        }
      });
  };

  return (
    <div className="w-3/5 mx-auto my-8">
      <div className="w-full">
        {thread ? (
          <>
            <div className="px-4 border-b-[3px] border-keppel-dark">
              <div colSpan="2" className="text-start">
                <div className="py-3 text-3xl text-outer-space font-medium">
                  {thread?.title}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start justify-center">
              <div className="flex justify-start items-start my-3 border-b-2 w-full">
                <div className="aspect-square w-fit px-3 mx-4 rounded-full text-white flex flex-col justify-center items-center bg-keppel">
                  <span>{thread?.author?.username[0]?.toUpperCase()}</span>
                </div>
                <div className="text-start w-full">
                  <div className="font-semibold text-outer-space-light mb-3 mt-1 flex justify-between">
                    {`${thread?.author?.username} (author)`}
                    {thread?.author?._id == profile?._id && !isEditThread && (
                      <button
                        className="text-black"
                        onClick={() => {
                          setIsEditThread(true);
                          setEditThread({
                            content: thread?.content,
                          });
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-pencil-square"
                          viewBox="0 0 16 16"
                        >
                          <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                          <path
                            fill-rule="evenodd"
                            d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                          />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="text-lg" data-color-mode="light">
                    {isEditThread ? (
                      <>
                        <MDEditor
                          value={editThread?.content}
                          onChange={(val) => {
                            setEditThread({
                              content: val,
                            });
                          }}
                          previewOptions={{
                            rehypePlugins: [[rehypeSanitize]],
                          }}
                        />
                        <button
                          className="p-1 px-4 me-2 text-white bg-keppel hover:bg-keppel-dark transition disabled:bg-slate-300 my-3"
                          disabled={!editThread?.content}
                          onClick={updateThread}
                        >
                          Update
                        </button>
                        <button
                          className="p-1 px-4 text-keppel bg-white hover:bg-white-dark transition my-3"
                          onClick={() => setIsEditThread(false)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <MDEditor.Markdown
                        source={thread?.content}
                        style={{ whiteSpace: "pre-wrap" }}
                      />
                    )}
                    
                  </div>
                  <div className="py-2 mt-5 flex justify-between items-center">
                    <div>Date: {thread.createDate}</div>
                    <div className="flex justify-center items-center space-x-2">
                      {(userData?.is_admin == true ||
                        thread?.author?._id == profile?._id) && (
                        <button
                          className="text-red-600 py-2 px-3"
                          onClick={handleThreadDelete}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-trash"
                            viewBox="0 0 16 16"
                          >
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                          </svg>
                        </button>
                      )}
                      <button onClick={() => likeDislikeThread()}>
                        <span className="flex justify-center items-center space-x-2">
                          <span className="text-lg text-outer-space">
                            {thread?.likes}
                          </span>
                          <svg
                            className={`w-6 h-6 ${
                              thread?.liked
                                ? "text-red-600"
                                : "text-outer-space"
                            } hover:text-red-600`}
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill={thread?.liked ? "red" : "none"}
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
                        </span>
                      </button>
                      <button
                        className="flex space-x-1 hover:bg-[#EDECEC] px-2 py-1 items-center justify-center"
                        onClick={() => setReplyVisible(!replyVisible)}
                      >
                        <span>
                          <svg
                            className="w-5 h-5 text-gray-800"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 16"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12.5 4.046H9V2.119c0-.921-.9-1.446-1.524-.894l-5.108 4.49a1.2 1.2 0 0 0 0 1.739l5.108 4.49C8.1 12.5 9 11.971 9 11.051V9.123h2a3.023 3.023 0 0 1 3 3.046V15a5.593 5.593 0 0 0-1.5-10.954Z"
                            />
                          </svg>
                        </span>
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* reply markdown component */}
              {replyVisible && (
                <div className="w-11/12 ml-16 border-b-2">
                  <div data-color-mode="light" className="mx-auto m-5">
                    <MDEditor
                      value={newReply.content}
                      onChange={(val) => {
                        console.log(val);
                        setNewReply({
                          content: val,
                        });
                      }}
                      previewOptions={{
                        rehypePlugins: [[rehypeSanitize]],
                      }}
                      // SOME OF THE COMMANDS OTHER THAN LISTED BELOW BREAKING IN DEVELOPMENT BUT RUNNING FINE IN PRODUCTION, HOWEVER WITH THESE COMMANDS
                      //   commands={[
                      //     commands.bold,
                      //     commands.italic,
                      //     commands.strikethrough,
                      //     commands.hr,
                      //     commands.link,
                      //     commands.quote,
                      //     commands.code,
                      //   ]}
                      //   extraCommands={[
                      //     commands.codeEdit,
                      //     commands.codeLive,
                      //     commands.codePreview,
                      //   ]}
                    />
                    <button
                      className="p-1 px-4 text-white bg-keppel hover:bg-keppel-dark transition disabled:bg-slate-300 my-3"
                      disabled={!newReply.content}
                      onClick={sendReply}
                    >
                      Reply
                    </button>
                    {message ? (
                      <span className={`p-4 text-${message?.color}`}>
                        {message.content}
                      </span>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              )}

              {/* replies */}

              {thread?.replies?.map((reply) => (
                <div
                  className="flex justify-start items-start my-3 border-b-2 w-full"
                  key={`${reply?.author?._id}${
                    reply?.date
                  }${reply?.content?.substring(0, 5)}`}
                >
                  <div className="aspect-square w-fit px-3 mx-4 rounded-full text-white flex flex-col justify-center items-center bg-keppel">
                    <span>{reply?.author?.username[0]?.toUpperCase()}</span>
                  </div>
                  <div className="text-start w-full">
                    <div className="flex justify-between">
                      <div className="font-semibold text-outer-space-light mb-3 mt-1">
                        {reply?.author?.username}
                        {thread?.author?._id === reply?.author?._id
                          ? " (author)"
                          : ""}
                      </div>
                      <div
                        onClick={() =>
                          thread?.author?._id == profile?._id &&
                          handleAuthorisedReplay(reply)
                        }
                      >
                        <img
                          src={
                            reply?.is_answer
                              ? RightIcon
                              : thread?.author?._id == profile?._id &&
                                CircleRing
                          }
                          className="w-6"
                        />
                        {/* <img src={CircleRing} className="w-6"/>  */}
                      </div>
                    </div>
                    <div className="text-lg" data-color-mode="light">
                    {editingReplyId === reply._id ? (
                      <>
                        <MDEditor
                          value={editingReplyContent}
                          onChange={(val) => setEditingReplyContent(val)}
                          previewOptions={{
                            rehypePlugins: [[rehypeSanitize]],
                          }}
                        />
                        <div className="mt-2 flex space-x-2">
                          <button
                            className="p-1 px-4 text-white bg-keppel hover:bg-keppel-dark"
                            onClick={() => handleReplyUpdate(reply._id)}
                            disabled={!editingReplyContent}
                          >
                            Update
                          </button>
                          <button
                            className="p-1 px-4 bg-white text-keppel border hover:bg-gray-100"
                            onClick={() => setEditingReplyId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <MDEditor.Markdown
                        source={reply?.content}
                        style={{ whiteSpace: "pre-wrap" }}
                      />
                    )}
                    </div>
                    <div className="py-2 mt-5 flex justify-between items-center">
                      <div>Date: {reply?.date}</div>
                      <div className="flex justify-center items-center space-x-2">
                        {reply?.author?._id?.toString() ===
                          profile?._id?.toString() && (
                          <>
                            {/* Edit button */}
                            <button
                              className="text-gray-700 py-2 px-2"
                              onClick={() => {
                                setEditingReplyId(reply._id);
                                setEditingReplyContent(reply.content);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-pencil-square"
                                viewBox="0 0 16 16"
                              >
                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                <path
                                  fillRule="evenodd"
                                  d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                                />
                              </svg>
                            </button>
                          </>
                        )}
                        {(userData?.is_admin === true ||
                          thread?.author?._id === profile?._id ||
                          reply?.author?._id?.toString() ===
                            profile?._id?.toString()) && (
                          <button
                            className="text-red-600 py-2 px-3"
                            onClick={() => handleReplyDelete(reply._id)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-trash"
                              viewBox="0 0 16 16"
                            >
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() =>
                            likeDislikeThreadReplay(reply?._id, reply?.liked)
                          }
                        >
                          <span className="flex justify-center items-center space-x-2">
                            <span className="text-lg text-outer-space">
                              {reply?.likesCount}
                            </span>
                            <svg
                              className={`w-6 h-6 ${
                                reply?.liked
                                  ? "text-red-600"
                                  : "text-outer-space"
                              } hover:text-red-600`}
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill={reply?.liked ? "red" : "none"}
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
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default Thread;
