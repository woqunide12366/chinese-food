import { useState, useEffect, useRef } from "react";
import {
  FiMessageSquare, FiSearch, FiUserPlus, FiUser, FiCheck, FiX, FiSend,
  FiArrowLeft, FiUsers, FiPlus, FiTrash2, FiUserMinus, FiClock,
} from "react-icons/fi";
import { useApp } from "../context/AppContext";
import { getSocket, useSocket } from "../hooks/useSocket";
import {
  getFriends, sendFriendRequest, handleFriendRequest, getMessages, searchUsers,
  createGroup, getGroups, getGroupMessages, getGroupMembers, unfriend, dissolveGroup,
} from "../api";

export default function Social() {
  const { currentUser, isLoggedIn, userProfile } = useApp();
  const [tab, setTab] = useState<"friends" | "chat">("friends");
  const [friends, setFriends] = useState<any[]>([]);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [chatWith, setChatWith] = useState<any | null>(null);
  const [chatType, setChatType] = useState<"private" | "group">("private");
  const [messages, setMessages] = useState<any[]>([]);
  const [msgText, setMsgText] = useState("");
  const [requests, setRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [currentGroup, setCurrentGroup] = useState<any>(null);
  const [notification, setNotification] = useState("");
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const msgListRef = useRef<HTMLDivElement>(null);

  useSocket(currentUser?.phone);
  const socket = getSocket();

  useEffect(() => {
    if (!currentUser?.phone) return;
    loadFriends();
    loadGroups();
  }, [currentUser]);

  // 好友请求实时通知
  useEffect(() => {
    if (!currentUser?.phone) return;
    const reqHandler = (data: any) => {
      if (data.receiverId === currentUser?.phone) {
        loadFriends();
        setNotification(`收到来自 ${data.senderPhone || data.senderId} 的好友请求`);
        setTimeout(() => setNotification(""), 4000);
      }
    };
    socket.on("friendRequestReceived", reqHandler);
    return () => { socket.off("friendRequestReceived", reqHandler); };
  }, [currentUser, tab]);

  // 新消息监听（私聊+群聊）+ 未读计数
  useEffect(() => {
    const handler = (msg: any) => {
      if (chatType === "private" && chatWith && (msg.senderId === chatWith.friendPhone || msg.receiverId === chatWith.friendPhone)) {
        setMessages((prev) => [...prev, msg]);
      }
      // 未读计数：非当前聊天对象的消息 +1
      if (msg.senderId !== currentUser?.phone && !(chatWith && (msg.senderId === chatWith.friendPhone || msg.receiverId === chatWith.friendPhone))) {
        const key = msg.senderId;
        setUnreadMap((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
        // 通知提醒
        setNotification(`📩 收到新消息`);
        setTimeout(() => setNotification(""), 3000);
      }
    };
    const groupMsgHandler = (msg: any) => {
      if (chatType === "group" && currentGroup && msg.groupId === currentGroup.id)
        setMessages((prev) => [...prev, msg]);
    };
    socket.on("newMessage", handler);
    socket.on("newGroupMessage", groupMsgHandler);
    return () => { socket.off("newMessage", handler); socket.off("newGroupMessage", groupMsgHandler); };
  }, [chatWith, chatType, currentGroup]);

  // 自动滚到底部
  useEffect(() => {
    if (msgListRef.current) msgListRef.current.scrollTop = msgListRef.current.scrollHeight;
  }, [messages]);

  const loadFriends = async () => {
    if (!currentUser?.phone) return;
    const data = await getFriends(currentUser.phone);
    setFriends(data);
    setRequests(data.filter((f: any) => f.status === "pending" && f.targetId === currentUser?.phone));
    setSentRequests(data.filter((f: any) => f.status === "pending" && f.initiatorId === currentUser?.phone));
  };

  const loadGroups = async () => {
    if (!currentUser?.phone) return;
    setGroups(await getGroups(currentUser.phone));
  };

  const handleSearch = async (q: string) => {
    setSearchQ(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearchResults((await searchUsers(q)).filter((u: any) => u.phone !== currentUser?.phone));
  };

  const handleAddFriend = async (friendId: string) => {
    if (!currentUser?.phone) return;
    try {
      await sendFriendRequest(currentUser.phone, friendId);
      socket.emit("friendRequestSent", { receiverId: friendId, senderId: currentUser.phone, senderPhone: currentUser.phone });
      setNotification("好友请求已发送！");
      setTimeout(() => setNotification(""), 3000);
      setSearchResults([]); setSearchQ("");
      loadFriends();
    } catch (e: any) {
      setNotification(e.message || "发送失败");
      setTimeout(() => setNotification(""), 3000);
    }
  };

  const handleRequest = async (friendId: string, action: "accept" | "reject") => {
    if (!currentUser?.phone) return;
    await handleFriendRequest(currentUser.phone, friendId, action);
    loadFriends();
  };

  const handleUnfriend = async (friendId: string) => {
    if (!currentUser?.phone) return;
    if (confirm("确定删除该好友？")) { await unfriend(currentUser.phone, friendId); loadFriends(); }
  };

  const openPrivateChat = async (friend: any) => {
    setChatWith(friend);
    setChatType("private");
    setCurrentGroup(null);
    setTab("chat");
    if (!currentUser?.phone) return;
    setMessages(await getMessages(currentUser.phone, friend.friendPhone));
    // 清除该好友的未读
    setUnreadMap((prev) => ({ ...prev, [friend.friendPhone]: 0 }));
  };

  const openGroupChat = async (group: any) => {
    setCurrentGroup(group);
    setChatWith(null);
    setChatType("group");
    setTab("chat");
    socket.emit("joinGroup", group.id);
    setMessages(await getGroupMessages(group.id));
    // 加载群成员头像信息
    const members = await getGroupMembers(group.id);
    setGroupMembers(members);
  };

  const sendMessage = () => {
    if (!msgText.trim() || !currentUser?.phone) return;
    if (chatType === "private" && chatWith) {
      socket.emit("sendMessage", { senderId: currentUser.phone, receiverId: chatWith.friendPhone, content: msgText.trim() });
    } else if (chatType === "group" && currentGroup) {
      socket.emit("sendGroupMessage", { groupId: currentGroup.id, senderId: currentUser.phone, content: msgText.trim() });
    }
    setMsgText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !currentUser?.phone) return;
    if (selectedMembers.length < 1) { alert("至少需要选择1位好友"); return; }
    await createGroup(groupName.trim(), currentUser.phone, selectedMembers);
    setShowCreateGroup(false); setGroupName(""); setSelectedMembers([]);
    loadGroups();
  };

  const toggleMember = (phone: string) => {
    setSelectedMembers((prev) => prev.includes(phone) ? prev.filter((p) => p !== phone) : [...prev, phone]);
  };

  const getUnread = (friendPhone: string) => unreadMap[friendPhone] || 0;
  const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0);

  if (!isLoggedIn) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
        <div className="text-center"><FiMessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500 text-lg">请先登录</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {notification && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm text-center animate-in fade-in">{notification}</div>
        )}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b">
            <button onClick={() => { setTab("friends"); setChatWith(null); setCurrentGroup(null); }}
              className={`flex-1 py-3.5 text-sm font-medium text-center ${tab === "friends" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-700"}`}>
              好友 {requests.length > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5">{requests.length}</span>}
            </button>
            <button onClick={() => { setTab("chat"); }}
              className={`flex-1 py-3.5 text-sm font-medium text-center relative ${tab === "chat" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-700"}`}>
              聊天
              {totalUnread > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 absolute -top-1">{totalUnread > 99 ? "99+" : totalUnread}</span>}
            </button>
          </div>

          <div className="p-4">
            {/* ========== 好友 Tab ========== */}
            {tab === "friends" && (
              <>
                <div className="relative mb-4">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={searchQ} onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="搜索用户手机号或用户名..." />
                </div>

                {searchResults.length > 0 && (
                  <div className="mb-4 bg-gray-50 rounded-lg p-3 space-y-2">
                    <p className="text-xs text-gray-500 font-medium">搜索结果</p>
                    {searchResults.map((u) => {
                      const isPending = sentRequests.some((r: any) => r.targetId === u.phone);
                      const isFriend = friends.some((f: any) => f.status === "accepted" && f.friendPhone === u.phone);
                      return (
                        <div key={u.phone} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                              {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : <FiUser className="w-4 h-4 text-primary" />}
                            </div>
                            <div><p className="text-sm font-medium text-gray-800">{u.username || u.phone}</p><p className="text-xs text-gray-400">{u.phone}</p></div>
                          </div>
                          {isFriend ? <span className="text-xs text-green-500"><FiCheck className="w-3 h-3 inline" />已添加</span>
                          : isPending ? <span className="text-xs text-yellow-500"><FiClock className="w-3 h-3 inline" />待验证</span>
                          : <button onClick={() => handleAddFriend(u.phone)}
                              className="flex items-center gap-1 text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark">
                              <FiUserPlus className="w-3 h-3" />加好友</button>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {requests.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">好友请求</p>
                    {requests.map((r: any) => (
                      <div key={r.relationId} className="flex items-center justify-between bg-yellow-50 rounded-lg p-3 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center overflow-hidden">
                            {r.avatar ? <img src={r.avatar} alt="" className="w-full h-full object-cover" /> : <FiUser className="w-4 h-4 text-yellow-600" />}
                          </div>
                          <div><p className="text-sm font-medium text-gray-800">{r.username || r.friendPhone}</p><p className="text-xs text-gray-400">{r.friendPhone}</p></div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleRequest(r.initiatorId, "accept")} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600" title="通过"><FiCheck className="w-4 h-4" /></button>
                          <button onClick={() => handleRequest(r.initiatorId, "reject")} className="p-2 bg-gray-300 text-gray-600 rounded-lg hover:bg-gray-400" title="忽略"><FiX className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {sentRequests.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">已发送请求（待验证）</p>
                    {sentRequests.map((r: any) => (
                      <div key={r.relationId} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {r.avatar ? <img src={r.avatar} alt="" className="w-full h-full object-cover" /> : <FiUser className="w-4 h-4 text-gray-500" />}
                        </div>
                        <div className="flex-1"><p className="text-sm font-medium text-gray-800">{r.username || r.friendPhone}</p><p className="text-xs text-yellow-500"><FiClock className="w-3 h-3 inline" />待验证</p></div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">我的好友 ({friends.filter((f: any) => f.status === "accepted").length})</p>
                </div>
                {friends.filter((f: any) => f.status === "accepted").length > 0 ? (
                  <div className="space-y-1">
                    {friends.filter((f: any) => f.status === "accepted").map((f: any) => {
                      const unread = getUnread(f.friendPhone);
                      return (
                        <div key={f.relationId} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 group transition-colors">
                          <div onClick={() => openPrivateChat(f)} className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                            <div className="relative w-10 h-10 flex-shrink-0">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                {f.avatar ? <img src={f.avatar} alt="" className="w-full h-full object-cover" /> : <FiUser className="w-5 h-5 text-primary" />}
                              </div>
                              {unread > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{unread > 99 ? "99+" : unread}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{f.username || f.friendPhone}</p>
                              <p className="text-xs text-gray-400 truncate">{f.signature || f.region || "这个人很懒，什么都没写"}</p>
                            </div>
                          </div>
                          <button onClick={() => handleUnfriend(f.friendPhone)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="删除好友"><FiUserMinus className="w-4 h-4" /></button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8"><FiUser className="w-10 h-10 text-gray-300 mx-auto mb-2" /><p className="text-gray-400 text-sm">还没有好友，搜索添加吧</p></div>
                )}

                <div className="mt-6 border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">我的群聊 ({groups.length})</p>
                    <button onClick={() => setShowCreateGroup(true)} className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark"><FiPlus className="w-3 h-3" />创建群聊</button>
                  </div>
                  {groups.length > 0 ? groups.map((g: any) => (
                    <div key={g.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 group transition-colors">
                      <div onClick={() => openGroupChat(g)} className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center"><FiUsers className="w-5 h-5 text-blue-500" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{g.name} {g.creatorId === currentUser?.phone && <span className="text-xs text-primary">(群主)</span>}</p>
                          <p className="text-xs text-gray-400">{g.memberCount} 人</p>
                        </div>
                      </div>
                      {g.creatorId === currentUser?.phone && (
                        <button onClick={async () => { if (confirm("确认解散群聊？")) { await dissolveGroup(g.id, currentUser!.phone); loadGroups(); } }}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="解散群聊"><FiTrash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  )) : <p className="text-xs text-gray-400 text-center py-4">暂无群聊</p>}
                </div>

                {showCreateGroup && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateGroup(false)}>
                    <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                      <h3 className="text-lg font-bold mb-4">创建群聊</h3>
                      <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="群聊名称" />
                      <p className="text-sm text-gray-600 mb-2">选择群成员（至少1位）：</p>
                      {friends.filter((f: any) => f.status === "accepted").length === 0 && <p className="text-xs text-gray-400 text-center py-4">暂无好友可选</p>}
                      {friends.filter((f: any) => f.status === "accepted").map((f: any) => (
                        <label key={f.friendPhone} className="flex items-center gap-3 py-2 cursor-pointer">
                          <input type="checkbox" checked={selectedMembers.includes(f.friendPhone)} onChange={() => toggleMember(f.friendPhone)} className="w-4 h-4 rounded border-gray-300 text-primary" />
                          <span className="text-sm text-gray-700">{f.username || f.friendPhone}</span>
                        </label>
                      ))}
                      <button onClick={handleCreateGroup} disabled={selectedMembers.length < 1}
                        className={`w-full mt-4 py-2.5 rounded-lg font-medium ${selectedMembers.length >= 1 ? "bg-primary hover:bg-primary-dark text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                        创建群聊
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ========== 聊天 Tab（微信风格） ========== */}
            {tab === "chat" && (
              <>
                {(chatWith || currentGroup) ? (
                  <>
                    {/* 聊天头部 */}
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b bg-white sticky top-0 z-10">
                      <button onClick={() => { setChatWith(null); setCurrentGroup(null); setMessages([]); }} className="p-1 hover:bg-gray-100 rounded-lg">
                        <FiArrowLeft className="w-5 h-5 text-gray-500" />
                      </button>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${chatType === "group" ? "bg-blue-50" : "bg-primary/10"}`}>
                        {chatType === "group" ? <FiUsers className="w-4 h-4 text-blue-500" /> : <FiUser className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {chatType === "group" ? currentGroup?.name : chatWith?.username || chatWith?.friendPhone}
                        </p>
                        <p className="text-xs text-gray-400">{chatType === "group" ? `${currentGroup?.memberCount || ""}人` : chatWith?.friendPhone}</p>
                      </div>
                      {chatType === "group" && currentGroup?.creatorId === currentUser?.phone && (
                        <button onClick={async () => { if (confirm("确认解散群聊？")) { await dissolveGroup(currentGroup.id, currentUser!.phone); setCurrentGroup(null); setMessages([]); loadGroups(); } }}
                          className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"><FiTrash2 className="w-3 h-3" />解散</button>
                      )}
                    </div>

                    {/* 消息列表 - 微信风格气泡 */}
                    <div ref={msgListRef} className="h-[420px] overflow-y-auto space-y-2 mb-3 px-2 py-2 bg-gray-50 rounded-lg" style={{ scrollBehavior: "smooth" }}>
                      {messages.length === 0 && (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">开始聊天吧</div>
                      )}
                      {messages.map((msg: any) => {
                        const isMe = msg.senderId === currentUser?.phone;
                        // 群聊时查找发送者头像
                        const senderAvatar = chatType === "group" && !isMe
                          ? groupMembers.find((m: any) => m.phone === msg.senderId)?.avatar
                          : null;
                        return (
                          <div key={msg.id} className={`flex gap-2 items-start ${isMe ? "flex-row-reverse" : ""}`}>
                            {/* 头像 - 群聊对方消息时下移与气泡顶部对齐 */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium overflow-hidden ${chatType === "group" && !isMe ? "mt-4" : ""} ${isMe ? "bg-primary/20 text-primary" : "bg-gray-300 text-white"}`}>
                              {isMe ? (
                                userProfile?.avatar ? <img src={userProfile.avatar} alt="" className="w-full h-full object-cover" /> : (userProfile?.username?.[0] || "我")
                              ) : chatType === "group" ? (
                                senderAvatar ? <img src={senderAvatar} alt="" className="w-full h-full object-cover" /> : (msg.senderId?.slice(-2) || "?")
                              ) : (
                                chatWith?.avatar ? <img src={chatWith.avatar} alt="" className="w-full h-full object-cover" /> : (chatWith?.username?.[0] || chatWith?.friendPhone?.slice(-2) || "?")
                              )}
                            </div>
                            {/* 气泡 */}
                            <div className="max-w-[70%]">
                              {chatType === "group" && !isMe && (
                                <p className="text-[11px] text-gray-400 mb-0.5 ml-1">{msg.senderId?.slice(-4)}</p>
                              )}
                              <div className={`inline-block px-3.5 py-2.5 text-sm leading-relaxed break-words shadow-sm ${
                                isMe
                                  ? "bg-[#95ec69] text-gray-900 rounded-[18px] rounded-br-[4px]"
                                  : "bg-white text-gray-800 rounded-[18px] rounded-bl-[4px]"
                              }`}>
                                <p>{msg.content}</p>
                              </div>
                              <p className={`text-[10px] text-gray-400 mt-0.5 ${isMe ? "text-right mr-1" : "ml-1"}`}>
                                {new Date(msg.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatEndRef} />
                    </div>

                    {/* 输入框 */}
                    <div className="flex gap-2 bg-white pt-2">
                      <input type="text" value={msgText} onChange={(e) => setMsgText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 px-4 py-2.5 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                        placeholder="输入消息..." />
                      <button onClick={sendMessage}
                        className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors flex-shrink-0">
                        <FiSend className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  /* 聊天列表（带未读红点） */
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700 mb-3">选择好友或群聊开始聊天</p>
                    {friends.filter((f: any) => f.status === "accepted").map((f: any) => {
                      const unread = getUnread(f.friendPhone);
                      return (
                        <div key={f.relationId} onClick={() => openPrivateChat(f)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors relative">
                          <div className="relative w-10 h-10 flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                              {f.avatar ? <img src={f.avatar} alt="" className="w-full h-full object-cover" /> : <FiUser className="w-5 h-5 text-primary" />}
                            </div>
                            {unread > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{unread}</span>}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800">{f.username || f.friendPhone}</p>
                            {unread > 0 && <p className="text-xs text-red-500 font-medium">{unread}条新消息</p>}
                          </div>
                        </div>
                      );
                    })}
                    {groups.map((g: any) => (
                      <div key={g.id} onClick={() => openGroupChat(g)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0"><FiUsers className="w-5 h-5 text-blue-500" /></div>
                        <div><p className="text-sm font-medium text-gray-800">{g.name}</p><p className="text-xs text-gray-400">{g.memberCount} 人</p></div>
                      </div>
                    ))}
                    {friends.filter((f: any) => f.status === "accepted").length === 0 && groups.length === 0 && (
                      <div className="text-center py-8"><FiMessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" /><p className="text-gray-400 text-sm">添加好友或创建群聊后开始聊天</p></div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
